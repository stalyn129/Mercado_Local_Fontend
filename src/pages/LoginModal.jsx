import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo2.png";

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("");
  const [shakeEffect, setShakeEffect] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Verificar si viene del registro exitoso
  useEffect(() => {
    const registrationSuccess = sessionStorage.getItem("registrationSuccess");
    const registeredEmail = sessionStorage.getItem("registeredEmail");
    
    if (registrationSuccess) {
      setShowSuccessMessage(true);
      // Mostrar mensaje por 5 segundos
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      sessionStorage.removeItem("registrationSuccess");
      
      return () => clearTimeout(timer);
    }
    
    if (registeredEmail) {
      setEmail(registeredEmail);
      sessionStorage.removeItem("registeredEmail");
    }
    
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleClose = () => {
    navigate("/");
  };

  const validateForm = () => {
    setError("");
    setErrorType("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      setErrorType("email");
      triggerShake();
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      setErrorType("email");
      triggerShake();
      return false;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña");
      setErrorType("password");
      triggerShake();
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setErrorType("password");
      triggerShake();
      return false;
    }

    return true;
  };

  const triggerShake = () => {
    setShakeEffect(true);
    setTimeout(() => setShakeEffect(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError("");
    setErrorType("");
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        let userFriendlyMessage = "Error al iniciar sesión";
        
        if (response.status === 401) {
          userFriendlyMessage = "Credenciales incorrectas. Verifica tu correo y contraseña.";
          setErrorType("credentials");
        } else if (response.status === 404) {
          userFriendlyMessage = "Usuario no encontrado";
          setErrorType("email");
        } else if (response.status === 500) {
          userFriendlyMessage = "Error del servidor. Por favor, intenta más tarde.";
          setErrorType("network");
        } else {
          try {
            const errorJson = JSON.parse(errorData);
            userFriendlyMessage = errorJson.message || errorData;
          } catch {
            userFriendlyMessage = errorData || "Error desconocido";
          }
        }
        
        throw new Error(userFriendlyMessage);
      }

      const data = await response.json();

      // Guardar token y datos básicos
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("idUsuario", data.idUsuario);

      if (data.idVendedor) localStorage.setItem("idVendedor", data.idVendedor);
      if (data.idConsumidor) localStorage.setItem("idConsumidor", data.idConsumidor);

      // IMPORTANTE: Crear objeto user completo con nombre y apellido
      const user = {
        id: data.idUsuario,
        rol: data.rol,
        idVendedor: data.idVendedor || null,
        idConsumidor: data.idConsumidor || null,
        nombre: data.nombre || "", // Asegurar que estos campos existan
        apellido: data.apellido || "", // Asegurar que estos campos existan
        correo: email,
        token: data.token
      };
      
      localStorage.setItem("user", JSON.stringify(user));

      // Guardar recordar email si está marcado
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Si no vienen nombre y apellido, hacer una petición adicional para obtener perfil
      if (!data.nombre || !data.apellido) {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/api/usuarios/${data.idUsuario}`, {
            headers: {
              "Authorization": `Bearer ${data.token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Actualizar user con datos completos
            const updatedUser = {
              ...user,
              nombre: userData.nombre || "",
              apellido: userData.apellido || ""
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        } catch (profileError) {
          console.warn("No se pudieron obtener datos adicionales del usuario:", profileError);
        }
      }

      // Redirigir según rol
      if (data.rol === "VENDEDOR") {
        navigate("/vendedor");
      } else if (data.rol === "ADMIN") {
        navigate("/admin");
      } else if (data.rol === "CONSUMIDOR" || data.rol === "CLIENTE") {
        navigate("/explorar");
      } else {
        navigate("/");
      }

    } catch (err) {
      if (err.name === "AbortError") {
        setError("Tiempo de espera agotado. Verifica tu conexión a internet.");
        setErrorType("network");
      } else if (err.message.includes("Network") || err.message.includes("conexión")) {
        setError("No se pudo conectar al servidor. Verifica tu conexión o si el backend está corriendo.");
        setErrorType("network");
      } else {
        setError(err.message);
        if (!errorType) setErrorType("general");
      }
      
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  const handleGoToRegister = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    alert("Funcionalidad de recuperación de contraseña en desarrollo.");
  };

  const getErrorClass = () => {
    switch(errorType) {
      case "email": return "error-email";
      case "password": return "error-password";
      case "credentials": return "error-credentials";
      case "network": return "error-network";
      default: return "error-general";
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes successMessage {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        .login-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(8px);
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          padding: 20px;
        }

        /* Círculos naranja blur */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.1;
          z-index: 0;
        }

        .blob-1 {
          width: 250px;
          height: 250px;
          background: #FF6B35;
          top: -80px;
          right: -80px;
          animation: blob 20s infinite linear;
        }

        .blob-2 {
          width: 200px;
          height: 200px;
          background: #FF8E53;
          bottom: -60px;
          left: -60px;
          animation: blob 25s infinite linear reverse;
        }

        /* Modal más compacto */
        .login-modal-container {
          background: white;
          border-radius: 20px;
          width: 380px;
          max-width: 90%;
          overflow: hidden;
          position: relative;
          z-index: 1;
          box-shadow: 
            0 20px 40px -15px rgba(0, 0, 0, 0.2),
            0 0 40px rgba(255, 107, 53, 0.1);
          animation: fadeIn 0.4s ease;
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        /* Header más compacto */
        .login-modal-header {
          padding: 30px 25px 20px;
          text-align: center;
          background: white;
          position: relative;
        }

        /* Logo con círculo blanco */
        .login-modal-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          animation: float 6s ease-in-out infinite;
          position: relative;
        }

        .login-modal-logo::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 50%;
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 107, 53, 0.1);
          z-index: -1;
        }

        .login-modal-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
        }

        /* Títulos más pequeños */
        .login-modal-title {
          font-family: 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 5px 0;
          letter-spacing: -0.3px;
        }

        .login-modal-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #666;
          font-weight: 400;
          margin: 0;
        }

        /* Botón cerrar */
        .login-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 2;
          color: #666;
        }

        .login-modal-close:hover {
          background: #f5f5f5;
          transform: rotate(90deg);
          color: #333;
        }

        /* Mensaje de éxito del registro */
        .registration-success-message {
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 10px;
          padding: 12px 15px;
          margin: 0 25px 20px 25px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #2E7D32;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: successMessage 5s ease forwards;
        }

        .success-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        /* Contenido */
        .login-modal-content {
          padding: 0 25px 25px;
        }

        /* Error message */
        .login-error-message {
          background: rgba(255, 107, 53, 0.05);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: 10px;
          padding: 12px 15px;
          margin-bottom: 20px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #FF6B35;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeIn 0.3s ease;
        }

        .login-error-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        /* Formulario */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-container {
          position: relative;
        }

        .login-input {
          width: 100%;
          padding: 14px 45px 14px 14px;
          background: white;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #333;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-weight: 400;
        }

        .login-input:focus {
          outline: none;
          border-color: #FF6B35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        .login-input::placeholder {
          color: #999;
        }

        .shake-animation {
          animation: shake 0.5s ease both;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #999;
          transition: all 0.2s ease;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #FF6B35;
        }

        /* Opciones */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 5px 0 15px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-container input[type="checkbox"] {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid rgba(0, 0, 0, 0.2);
          cursor: pointer;
          appearance: none;
          position: relative;
          transition: all 0.2s ease;
          background: white;
        }

        .checkbox-container input[type="checkbox"]:checked {
          background: #FF6B35;
          border-color: #FF6B35;
        }

        .checkbox-container input[type="checkbox"]:checked::after {
          content: "✓";
          position: absolute;
          color: white;
          font-size: 10px;
          font-weight: bold;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .checkbox-label {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #666;
          user-select: none;
        }

        .forgot-password {
          background: none;
          border: none;
          color: #FF6B35;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 4px 6px;
          border-radius: 5px;
        }

        .forgot-password:hover {
          background: rgba(255, 107, 53, 0.05);
          text-decoration: underline;
        }

        /* Botón principal */
        .login-button {
          background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
          border: none;
          border-radius: 10px;
          padding: 14px 20px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button-loading {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease infinite;
        }

        /* Divisor */
        .login-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: #999;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 400;
        }

        .login-divider::before,
        .login-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
        }

        .login-divider span {
          padding: 0 12px;
          background: white;
        }

        /* Botón Google */
        .google-login-button {
          width: 100%;
          background: white;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #444;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        .google-login-button:hover {
          border-color: #FF6B35;
          background: rgba(255, 107, 53, 0.02);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .google-logo {
          width: 16px;
          height: 16px;
        }

        /* Registro */
        .register-link {
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #666;
          margin-top: 15px;
        }

        .register-button {
          background: none;
          border: none;
          color: #FF6B35;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          padding: 4px 6px;
          border-radius: 5px;
        }

        .register-button:hover {
          text-decoration: underline;
          background: rgba(255, 107, 53, 0.05);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-modal-container {
            width: 95%;
            max-width: 340px;
            border-radius: 16px;
          }
          
          .login-modal-header {
            padding: 25px 20px 15px;
          }
          
          .login-modal-content {
            padding: 0 20px 20px;
          }
          
          .login-modal-logo {
            width: 70px;
            height: 70px;
          }
          
          .login-modal-logo::before {
            width: 90px;
            height: 90px;
          }
          
          .login-modal-title {
            font-size: 22px;
          }
          
          .login-modal-subtitle {
            font-size: 12px;
          }
          
          .registration-success-message {
            margin: 0 20px 15px 20px;
          }
        }

        @media (max-width: 320px) {
          .login-modal-container {
            max-width: 300px;
          }
          
          .form-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>

      <div className="login-modal-overlay" onClick={handleClose}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        <div 
          className={`login-modal-container ${shakeEffect ? 'shake-animation' : ''}`} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="login-modal-header">
            <button className="login-modal-close" onClick={handleClose} aria-label="Cerrar">
              ✕
            </button>
            
            <div className="login-modal-logo">
              <img src={logo} alt="My Harvest Logo" />
            </div>
            
            <h1 className="login-modal-title">My Harvest</h1>
            <p className="login-modal-subtitle">MERCADO - IA</p>
          </div>

          {showSuccessMessage && (
            <div className="registration-success-message">
              <span className="success-icon">✅</span>
              <span>¡Registro exitoso! Por favor inicia sesión con tus nuevas credenciales.</span>
            </div>
          )}

          <div className="login-modal-content">
            {error && (
              <div className={`login-error-message ${getErrorClass()}`}>
                <span className="login-error-icon">
                  {errorType === 'network' ? '🌐' : 
                   errorType === 'credentials' ? '🔒' : 
                   errorType === 'email' ? '📧' : '⚠️'}
                </span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">CORREO ELECTRÓNICO</label>
                <div className="input-container">
                  <input
                    type="email"
                    className={`login-input ${errorType === 'email' ? 'shake-animation' : ''}`}
                    placeholder="admin@mercadolocal.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">CONTRASEÑA</label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`login-input ${errorType === 'password' ? 'shake-animation' : ''}`}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-label">Recordarme</span>
                </label>
                
                <button 
                  type="button" 
                  className="forgot-password"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button 
                className="login-button" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="login-button-loading"></div>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>o continúa con</span>
            </div>

            <button 
              className="google-login-button" 
              onClick={handleGoogleLogin} 
              type="button"
              disabled={loading}
            >
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                alt="Google" 
                className="google-logo"
              />
              Iniciar sesión con Google
            </button>

            <div className="register-link">
              ¿No tienes cuenta?{" "}
              <button 
                className="register-button"
                onClick={handleGoToRegister}
                disabled={loading}
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}