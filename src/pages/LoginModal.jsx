import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/Logo2.png"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode' // ✅ Instalar: npm install jwt-decode
import API_BASE_URL from "../config/api.js"

export default function LoginModal() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [shakeEffect, setShakeEffect] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const navigate = useNavigate()

  // ✅ Client ID de Google - VERIFICA QUE SEA CORRECTO
  const GOOGLE_CLIENT_ID = "26624785270-ejsqo4grg2kg48tloel1csngp8brp35d.apps.googleusercontent.com";
  

  // ✅ Función para notificar al carrito después del login
  const notifyCartAfterLogin = () => {
    console.log("🔄 Notificando al carrito después del login...");
    // Disparar evento personalizado para recargar el carrito
    const authEvent = new CustomEvent("authChange", {
      detail: { 
        action: "login",
        timestamp: new Date().toISOString() 
      }
    });
    window.dispatchEvent(authEvent);
    
    // También disparar evento estándar para compatibilidad
    window.dispatchEvent(new Event("storage"));
  }

  // Manejar error del logo
  const handleLogoError = () => {
    console.error("Error cargando el logo")
    setLogoError(true)
  }

  // Fallback para logo
  const getLogoSrc = () => {
    if (logoError) {
      return "https://via.placeholder.com/80x80/FF6B35/ffffff?text=MH"
    }
    return logo
  }

  // ✅ Función para manejar éxito de Google Login - VERSIÓN CORREGIDA
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      setError("")
      
      console.log("✅ Google Login exitoso, procesando...")
      console.log("Token recibido:", credentialResponse.credential ? "Token presente" : "Token ausente")
      
      // 1. Verificar el token con nuestro backend
      const verifyResponse = await fetch(`${API_URL}/auth/verify-google-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential
        }),
      })
      
      console.log("✅ Verificación de token - Status:", verifyResponse.status)
      
      if (!verifyResponse.ok) {
        throw new Error(`Error verificando token: ${verifyResponse.status}`)
      }
      
      const verifyData = await verifyResponse.json()
      console.log("✅ Verificación de token - Respuesta:", verifyData)
      
      if (!verifyData.valid) {
        throw new Error("Token de Google inválido")
      }
      
      // 2. Decodificar el token para obtener el email
      const userInfo = jwtDecode(credentialResponse.credential)
      console.log("📧 Información de usuario de Google:", userInfo)
      
      if (!userInfo?.email) {
        throw new Error("No se pudo obtener email de Google")
      }
      
      console.log("📧 Email de Google:", userInfo.email)
      console.log("👤 Nombre:", userInfo.name)
      console.log("✅ Email verificado:", userInfo.email_verified)
      
      // 3. Verificar si el usuario existe
      console.log("🔍 Verificando si el usuario existe...")
      const checkResponse = await fetch(
        `${API_URL}/auth/check-email?email=${encodeURIComponent(userInfo.email)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log("✅ Check email - Status:", checkResponse.status)
      
      if (!checkResponse.ok) {
        throw new Error(`Error verificando email: ${checkResponse.status}`)
      }
      
      const checkData = await checkResponse.json()
      console.log("✅ Respuesta check-email:", checkData)
      
      if (!checkData.exists) {
        // Usuario no existe, redirigir al registro
        console.log("📝 Usuario no existe, redirigiendo a registro...")
        
        sessionStorage.setItem("googleUserData", JSON.stringify({
          nombre: userInfo.given_name || userInfo.name?.split(' ')[0] || "",
          apellido: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || "",
          email: userInfo.email,
          emailVerified: userInfo.email_verified || false,
          picture: userInfo.picture,
          googleAuth: true
        }))
        
        setError("📝 No tienes cuenta. Redirigiendo al registro...")
        
        setTimeout(() => {
          navigate("/register", { 
            state: { 
              fromGoogle: true,
              googleData: {
                nombre: userInfo.given_name || userInfo.name?.split(' ')[0] || "",
                apellido: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || "",
                email: userInfo.email,
                emailVerified: userInfo.email_verified || false
              }
            }
          })
        }, 1500)
        return
      }
      
      // 4. Usuario existe, hacer login con Google
      console.log("🔑 Haciendo login con Google...")
      const loginResponse = await fetch(`${API_URL}/auth/login-google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userInfo.email
        }),
      })
      
      console.log("📤 Respuesta login-google status:", loginResponse.status)
      
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text()
        console.error("❌ Error en login Google:", errorText)
        throw new Error(`Error en login Google: ${loginResponse.status} - ${errorText}`)
      }
      
      const loginData = await loginResponse.json()
      console.log("✅ Login con Google exitoso:", loginData)
      
      if (!loginData.token) {
        throw new Error("No se recibió token del servidor")
      }
      
      // 5. Guardar sesión
      localStorage.setItem("authToken", loginData.token)
      localStorage.setItem("token", loginData.token)
      localStorage.setItem("user", JSON.stringify(loginData))
      localStorage.setItem("rol", loginData.rol || "")
      localStorage.setItem("idUsuario", loginData.idUsuario || "")
      
      if (loginData.idVendedor) {
        localStorage.setItem("idVendedor", loginData.idVendedor)
        console.log("✅ ID Vendedor guardado:", loginData.idVendedor)
      }
      if (loginData.idConsumidor) {
        localStorage.setItem("idConsumidor", loginData.idConsumidor)
        console.log("✅ ID Consumidor guardado:", loginData.idConsumidor)
      }
      
      // Guardar info de Google
      localStorage.setItem("googleAuth", "true")
      localStorage.setItem("emailVerified", userInfo.email_verified || "false")
      
      // Guardar recordar email si está marcado
      if (rememberMe) {
        localStorage.setItem("rememberEmail", userInfo.email)
      } else {
        localStorage.removeItem("rememberEmail")
      }
      
      // ✅ NOTIFICAR AL CARRITO SOBRE EL LOGIN
      notifyCartAfterLogin();
      
      // 6. Redirigir según rol
      console.log("🎯 Rol del usuario:", loginData.rol)
      
      setError("✅ ¡Login exitoso! Redirigiendo...")
      
      setTimeout(() => {
        if (loginData.rol === "VENDEDOR") {
          navigate("/vendedor", { replace: true })
        } else if (loginData.rol === "ADMIN") {
          navigate("/admin", { replace: true })
        } else if (loginData.rol === "CONSUMIDOR") {
          navigate("/", { replace: true })
        } else {
          navigate("/", { replace: true })
        }
      }, 1000)
      
    } catch (err) {
      console.error("❌ Error completo en Google Login:", err)
      setError(`❌ Error: ${err.message || "Error al iniciar sesión con Google"}`)
      triggerShake()
    } finally {
      setLoading(false)
    }
  }
  
  // ✅ Función para manejar error de Google Login
  const handleGoogleError = () => {
    console.error("Google Login falló - El usuario canceló o hubo un error")
    setError("❌ Error al conectar con Google. Intenta nuevamente.")
    triggerShake()
  }

  // Verificar si viene del registro exitoso
  useEffect(() => {
    const registrationSuccess = sessionStorage.getItem("registrationSuccess")
    const registeredEmail = sessionStorage.getItem("registeredEmail")
    
    // ✅ Verificar si hay datos de Google guardados
    const googleUserData = sessionStorage.getItem("googleUserData")
    if (googleUserData) {
      try {
        const data = JSON.parse(googleUserData)
        setEmail(data.email || "")
        sessionStorage.removeItem("googleUserData")
      } catch (e) {
        console.error("Error parsing googleUserData:", e)
      }
    }
    
    if (registrationSuccess) {
      setShowSuccessMessage(true)
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
      
      sessionStorage.removeItem("registrationSuccess")
      return () => clearTimeout(timer)
    }
    
    if (registeredEmail) {
      setEmail(registeredEmail)
      sessionStorage.removeItem("registeredEmail")
    }
    
    const savedEmail = localStorage.getItem("rememberEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  // Función para cerrar y volver al home
  const handleClose = () => {
    navigate("/")
  }

  // Validación del formulario
  const validateForm = () => {
    setError("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setError("Por favor ingresa tu correo electrónico")
      triggerShake()
      return false
    }
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo válido")
      triggerShake()
      return false
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña")
      triggerShake()
      return false
    }

    return true
  }

  const triggerShake = () => {
    setShakeEffect(true)
    setTimeout(() => setShakeEffect(false), 500)
  }

  // HANDLE SUBMIT - Login normal
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("❌ Credenciales incorrectas")
          triggerShake()
          setLoading(false)
          return
        }
        
        if (response.status === 404) {
          setError("❌ Usuario no encontrado")
          triggerShake()
          setLoading(false)
          return
        }
        
        const errorData = await response.text()
        throw new Error(errorData || "Error al iniciar sesión")
      }

      const data = await response.json()

      // Guardar sesión
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data))
      localStorage.setItem("rol", data.rol)
      localStorage.setItem("idUsuario", data.idUsuario)

      if (data.idVendedor) {
        localStorage.setItem("idVendedor", data.idVendedor)
      }
      if (data.idConsumidor) {
        localStorage.setItem("idConsumidor", data.idConsumidor)
      }

      if (rememberMe) {
        localStorage.setItem("rememberEmail", email)
      } else {
        localStorage.removeItem("rememberEmail")
      }

      console.log("ROL del usuario después de login:", data.rol)

      // ✅ NOTIFICAR AL CARRITO SOBRE EL LOGIN
      notifyCartAfterLogin();

      // Redirección según rol
      if (data.rol === "VENDEDOR") {
        navigate("/vendedor")
      } else if (data.rol === "ADMIN") {
        navigate("/admin")
      } else if (data.rol === "CONSUMIDOR") {
        navigate("/", { replace: true })
      } else {
        navigate("/")
      }

    } catch (err) {
      console.error("Error en login:", err)
      
      if (err.message.includes("Failed to fetch") || err.message.includes("Network")) {
        setError("❌ Error de conexión")
      } else {
        setError("❌ " + (err.message || "Error al iniciar sesión"))
      }
      
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  // Función para ir al registro
  const handleGoToRegister = () => {
    navigate("/register")
  }

  // Función para olvidar contraseña
  const handleForgotPassword = () => {
    alert("Funcionalidad de recuperación de contraseña en desarrollo.")
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
          background: rgba(255, 107, 53, 0.08);
          border: 1.5px solid rgba(255, 107, 53, 0.3);
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
          font-weight: 500;
        }

        .login-error-icon {
          font-size: 14px;
          flex-shrink: 0;
          font-weight: bold;
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

        /* ✅ Botón Google ESTILIZADO */
        .google-login-wrapper {
          width: 100%;
          margin-bottom: 20px;
        }

        .google-login-wrapper > div {
          width: 100% !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03) !important;
          transition: all 0.2s ease !important;
          border: 1.5px solid rgba(0, 0, 0, 0.1) !important;
          background: white !important;
        }

        .google-login-wrapper > div:hover {
          border-color: #FF6B35 !important;
          background: rgba(255, 107, 53, 0.02) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
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
              <img 
                src={getLogoSrc()} 
                alt="My Harvest Logo" 
                onError={handleLogoError}
              />
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
              <div className="login-error-message">
                <span className="login-error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">CORREO ELECTRÓNICO</label>
                <div className="input-container">
                  <input
                    type="email"
                    className={`login-input ${error ? 'shake-animation' : ''}`}
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
                    className={`login-input ${error ? 'shake-animation' : ''}`}
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

            {/* ✅ BOTÓN GOOGLE ACTUALIZADO */}
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
                locale="es"
              />
            </div>

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
    </GoogleOAuthProvider>
  )
}