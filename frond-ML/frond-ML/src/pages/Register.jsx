import { useState } from "react";
import { User, Mail, Lock, Calendar, CheckCircle, AlertCircle, Eye, EyeOff, ShoppingBag, Store, CreditCard, Phone, MapPin, Building2, FileText, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    fechaNacimiento: "",
    idRol: 3,
    // Campos CONSUMIDOR
    cedula: "",
    direccion: "",
    telefono: "",
    // Campos VENDEDOR
    nombreEmpresa: "",
    ruc: "",
    direccionEmpresa: "",
    telefonoEmpresa: "",
    descripcion: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleRoleChange = (newRole) => {
    setForm({ ...form, idRol: newRole });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const registrar = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setMessage({ type: "success", text: "¡Registro exitoso! Bienvenido 🎉" });
          
          // Guardar en localStorage
          if (data.token) localStorage.setItem("authToken", data.token);
          if (data.rol) localStorage.setItem("rol", data.rol);
          if (data.idUsuario) localStorage.setItem("idUsuario", data.idUsuario);
          if (data.idVendedor) localStorage.setItem("idVendedor", data.idVendedor);
          if (data.idConsumidor) localStorage.setItem("idConsumidor", data.idConsumidor);
          
          // Guardar objeto user completo
          const user = {
            id: data.idUsuario,
            rol: data.rol,
            idVendedor: data.idVendedor,
            idConsumidor: data.idConsumidor
          };
          localStorage.setItem("user", JSON.stringify(user));
          
          setForm({
            nombre: "", apellido: "", correo: "", contrasena: "", fechaNacimiento: "", idRol: 3,
            cedula: "", direccion: "", telefono: "",
            nombreEmpresa: "", ruc: "", direccionEmpresa: "", telefonoEmpresa: "", descripcion: ""
          });
          
          setTimeout(() => {
            if (data.rol === "VENDEDOR") {
              window.location.href = "/vendedor";
            } else if (data.rol === "CONSUMIDOR") {
              window.location.href = "/";
            } else {
              window.location.href = "/";
            }
          }, 2000);
          
        } else {
          setMessage({ type: "error", text: data.mensaje || "Error en el registro" });
        }
      })
      .catch(error => {
        setMessage({ type: "error", text: "Error en la conexión con el servidor" });
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Comfortaa:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .register-container {
          min-height: 100vh;
          background: #faf8f3;
          font-family: "Comfortaa", sans-serif;
          padding: 60px 20px;
        }

        .register-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }

        /* LADO IZQUIERDO - IMAGEN */
        .image-side {
          position: sticky;
          top: 60px;
          height: fit-content;
        }

        .image-container {
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .image-container img {
          width: 100%;
          height: 700px;
          object-fit: cover;
          display: block;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
          padding: 50px 40px;
          color: white;
        }

        .overlay-title {
          font-family: "Playfair Display", serif;
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 15px;
          line-height: 1.2;
        }

        .overlay-subtitle {
          font-size: 18px;
          opacity: 0.95;
          line-height: 1.6;
        }

        /* LADO DERECHO - FORMULARIO */
        .form-side {
          background: white;
          border-radius: 32px;
          padding: 50px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          max-height: 85vh;
          overflow-y: auto;
        }

        .form-side::-webkit-scrollbar {
          width: 8px;
        }

        .form-side::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }

        .form-side::-webkit-scrollbar-thumb {
          background: #6b8e6e;
          border-radius: 10px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #3a5a40 0%, #6b8e4e 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-title {
          font-family: "Playfair Display", serif;
          font-size: 36px;
          font-weight: 700;
          color: #3a5a40;
          margin-bottom: 10px;
        }

        .form-subtitle {
          color: #666;
          font-size: 16px;
        }

        /* SELECTOR DE ROL */
        .role-selector {
          margin-bottom: 35px;
        }

        .role-label {
          font-size: 15px;
          font-weight: 600;
          color: #3a5a40;
          margin-bottom: 15px;
          display: block;
        }

        .role-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .role-btn {
          padding: 25px 20px;
          border: 2px solid #e0ddd0;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .role-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .role-btn.active {
          border-color: #3a5a40;
          background: #f0f5f1;
          box-shadow: 0 8px 20px rgba(58, 90, 64, 0.15);
        }

        .role-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .role-btn.active .role-icon {
          background: linear-gradient(135deg, #6b8e4e 0%, #3a5a40 100%);
        }

        .role-btn:not(.active) .role-icon {
          background: #e0ddd0;
        }

        .role-name {
          font-weight: 600;
          font-size: 16px;
          color: #2d3e32;
        }

        .role-desc {
          font-size: 13px;
          color: #666;
          text-align: center;
        }

        /* INPUTS */
        .form-section {
          margin-bottom: 30px;
        }

        .section-title {
          font-family: "Playfair Display", serif;
          font-size: 22px;
          font-weight: 700;
          color: #3a5a40;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0ddd0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .input-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #3a5a40;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #d48f27;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e0ddd0;
          border-radius: 14px;
          font-size: 15px;
          font-family: "Comfortaa", sans-serif;
          background: #fffdf7;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #6b8e4e;
          box-shadow: 0 0 0 4px rgba(107, 142, 78, 0.1);
        }

        .form-textarea {
          padding: 14px 16px;
          resize: none;
          min-height: 100px;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #aaa;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #666;
        }

        /* ALERT */
        .alert {
          padding: 16px;
          border-radius: 14px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 2px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 2px solid #f5c6cb;
        }

        /* BOTÓN */
        .submit-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #3a5a40 0%, #6b8e4e 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 17px;
          font-weight: 600;
          font-family: "Comfortaa", sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 20px rgba(58, 90, 64, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(58, 90, 64, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* DIVIDER */
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 25px 0;
          color: #999;
          font-size: 14px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e0ddd0;
        }

        .divider span {
          padding: 0 15px;
        }

        /* BOTÓN GOOGLE */
        .google-btn {
          width: 100%;
          padding: 16px;
          background: white;
          color: #444;
          border: 2px solid #e0ddd0;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          font-family: "Comfortaa", sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-color: #d0d0d0;
        }

        .google-btn:active {
          transform: translateY(0);
        }

        .google-icon {
          flex-shrink: 0;
        }

        /* LOGIN LINK */
        .login-link {
          text-align: center;
          margin-top: 25px;
          font-size: 14px;
          color: #666;
        }

        .login-link a {
          color: #d48f27;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.3s ease;
        }

        .login-link a:hover {
          opacity: 0.8;
        }

        /* RESPONSIVE */
        @media (max-width: 1200px) {
          .register-wrapper {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .image-side {
            position: relative;
            top: 0;
          }

          .image-container img {
            height: 500px;
          }
        }

        @media (max-width: 768px) {
          .register-container {
            padding: 40px 15px;
          }

          .form-side {
            padding: 35px 25px;
            max-height: none;
          }

          .input-row {
            grid-template-columns: 1fr;
          }

          .role-buttons {
            grid-template-columns: 1fr;
          }

          .form-title {
            font-size: 28px;
          }

          .overlay-title {
            font-size: 32px;
          }

          .image-container img {
            height: 400px;
          }
        }
      `}</style>

      <div className="register-container">
        <div className="register-wrapper">
          
          {/* LADO IZQUIERDO - IMAGEN */}
          <div className="image-side">
            <div className="image-container">
              <img 
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80" 
                alt="Productos frescos locales" 
              />
              <div className="image-overlay">
                <h2 className="overlay-title">Mercado Local-IA</h2>
                <p className="overlay-subtitle">
                  Conectando productores locales con consumidores de toda la región. 
                  Productos frescos, directos del campo a tu mesa.
                </p>
              </div>
            </div>
          </div>

          {/* LADO DERECHO - FORMULARIO */}
          <div className="form-side">
            
            {/* HEADER */}
            <div className="form-header">
              <div className="form-logo">
                <User className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="form-title">Crear Cuenta</h1>
              <p className="form-subtitle">Únete a nuestra comunidad</p>
            </div>

            {/* ALERTA */}
            {message.text && (
              <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* SELECTOR DE ROL */}
            <div className="role-selector">
              <label className="role-label">¿Cómo te gustaría unirte? *</label>
              <div className="role-buttons">
                <button
                  type="button"
                  onClick={() => handleRoleChange(3)}
                  className={`role-btn ${form.idRol === 3 ? 'active' : ''}`}
                >
                  <div className="role-icon">
                    <ShoppingBag className={`w-6 h-6 ${form.idRol === 3 ? 'text-white' : 'text-gray-400'}`} strokeWidth={1.5} />
                  </div>
                  <span className="role-name">Consumidor</span>
                  <span className="role-desc">Compra productos frescos</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRoleChange(2)}
                  className={`role-btn ${form.idRol === 2 ? 'active' : ''}`}
                >
                  <div className="role-icon">
                    <Store className={`w-6 h-6 ${form.idRol === 2 ? 'text-white' : 'text-gray-400'}`} strokeWidth={1.5} />
                  </div>
                  <span className="role-name">Vendedor</span>
                  <span className="role-desc">Vende tus productos</span>
                </button>
              </div>
            </div>

            {/* INFORMACIÓN PERSONAL */}
            <div className="form-section">
              <h3 className="section-title">
                <User className="w-5 h-5" style={{ color: "#6b8e4e" }} strokeWidth={1.5} />
                Información Personal
              </h3>
              
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Nombre *</label>
                  <div className="input-wrapper">
                    <User className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Juan"
                      required
                    />
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Apellido *</label>
                  <div className="input-wrapper">
                    <User className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input
                      type="text"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Pérez"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Correo electrónico *</label>
                <div className="input-wrapper">
                  <Mail className="input-icon w-5 h-5" strokeWidth={1.5} />
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña *</label>
                <div className="input-wrapper">
                  <Lock className="input-icon w-5 h-5" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Fecha de nacimiento *</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon w-5 h-5" strokeWidth={1.5} />
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* CAMPOS CONSUMIDOR */}
            {form.idRol === 3 && (
              <div className="form-section">
                <h3 className="section-title">
                  <ShoppingBag className="w-5 h-5" style={{ color: "#6b8e4e" }} strokeWidth={1.5} />
                  Información del Consumidor
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Cédula *</label>
                  <div className="input-wrapper">
                    <CreditCard className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input type="text" name="cedula" value={form.cedula} onChange={handleChange} className="form-input" placeholder="0102030405" required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Dirección *</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className="form-input" placeholder="Dirección del domicilio" required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Teléfono *</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input type="text" name="telefono" value={form.telefono} onChange={handleChange} className="form-input" placeholder="0999999999" required />
                  </div>
                </div>
              </div>
            )}

            {/* CAMPOS VENDEDOR */}
            {form.idRol === 2 && (
              <div className="form-section">
                <h3 className="section-title">
                  <Store className="w-5 h-5" style={{ color: "#d48f27" }} strokeWidth={1.5} />
                  Información del Negocio
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Nombre del negocio *</label>
                  <div className="input-wrapper">
                    <Building2 className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input type="text" name="nombreEmpresa" value={form.nombreEmpresa} onChange={handleChange} className="form-input" placeholder="Frutas Don Pepe" required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">RUC *</label>
                  <div className="input-wrapper">
                    <FileText className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input type="text" name="ruc" value={form.ruc} onChange={handleChange} className="form-input" placeholder="1102345678001" required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Dirección del negocio *</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input type="text" name="direccionEmpresa" value={form.direccionEmpresa} onChange={handleChange} className="form-input" placeholder="Mercado Central, Local 12" required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Teléfono del negocio *</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input type="text" name="telefonoEmpresa" value={form.telefonoEmpresa} onChange={handleChange} className="form-input" placeholder="0987654321" required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Descripción del negocio</label>
                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="form-input form-textarea" placeholder="Venta de verduras frescas y productos orgánicos..." />
                </div>
              </div>
            )}

            {/* BOTÓN REGISTRARSE */}
            <button
              onClick={registrar}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Registrando...
                </>
              ) : (
                <>
                  Registrarse
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </>
              )}
            </button>

            {/* DIVIDER */}
            <div className="divider">
              <span>o continúa con</span>
            </div>

            {/* BOTÓN GOOGLE */}
            <button
              type="button"
              className="google-btn"
              onClick={() => {
                // Aquí irá la lógica de Google OAuth
                console.log("Registro con Google");
              }}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            {/* LINK LOGIN */}
            <p className="login-link">
              ¿Ya tienes cuenta?{" "}
              <a href="/login">Inicia sesión aquí</a>
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}