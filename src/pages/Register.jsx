import { useState, useEffect } from "react";
import { User, Mail, Lock, Calendar, CheckCircle, AlertCircle, Eye, EyeOff, ShoppingBag, Store, CreditCard, Phone, MapPin, Building2, FileText, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Función para calcular edad
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Función para validar un campo específico
  const validateField = (name, value) => {
    let error = "";
    
    switch(name) {
      case 'nombre':
        if (!value.trim()) error = "El nombre es requerido";
        else if (value.length < 2) error = "El nombre debe tener al menos 2 caracteres";
        break;
        
      case 'apellido':
        if (!value.trim()) error = "El apellido es requerido";
        else if (value.length < 2) error = "El apellido debe tener al menos 2 caracteres";
        break;
        
      case 'correo':
        if (!value.trim()) error = "El correo electrónico es requerido";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Ingresa un correo electrónico válido";
        break;
        
      case 'contrasena':
        if (!value.trim()) error = "La contraseña es requerida";
        else if (value.length < 6) error = "La contraseña debe tener al menos 6 caracteres";
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = "Debe contener mayúsculas, minúsculas y números";
        break;
        
      case 'confirmarContrasena':
        if (!value.trim()) error = "Debes confirmar tu contraseña";
        else if (value !== form.contrasena) error = "Las contraseñas no coinciden";
        break;
        
      case 'fechaNacimiento':
        if (!value) error = "La fecha de nacimiento es requerida";
        else {
          const edad = calcularEdad(value);
          if (edad < 20) error = "Debes tener al menos 20 años";
          else if (edad > 65) error = "La edad máxima permitida es 65 años";
        }
        break;
        
      case 'cedula':
        if (form.idRol === 3) {
          if (!value.trim()) error = "La cédula es requerida";
          else if (!/^\d{10}$/.test(value)) error = "La cédula debe tener 10 dígitos";
        }
        break;
        
      case 'telefono':
        if (form.idRol === 3) {
          if (!value.trim()) error = "El teléfono es requerido";
          else if (!/^\d{10}$/.test(value)) error = "El teléfono debe tener 10 dígitos";
        }
        break;
        
      case 'direccion':
        if (form.idRol === 3 && !value.trim()) error = "La dirección es requerida";
        break;
        
      case 'nombreEmpresa':
        if (form.idRol === 2 && !value.trim()) error = "El nombre del negocio es requerido";
        break;
        
      case 'ruc':
        if (form.idRol === 2) {
          if (!value.trim()) error = "El RUC es requerido";
          else if (!/^\d{13}$/.test(value)) error = "El RUC debe tener 13 dígitos";
        }
        break;
        
      case 'telefonoEmpresa':
        if (form.idRol === 2) {
          if (!value.trim()) error = "El teléfono del negocio es requerido";
          else if (!/^\d{10}$/.test(value)) error = "El teléfono debe tener 10 dígitos";
        }
        break;
        
      case 'direccionEmpresa':
        if (form.idRol === 2 && !value.trim()) error = "La dirección del negocio es requerida";
        break;
    }
    
    return error;
  };

  // Validación en tiempo real cuando el campo pierde el foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (message.text) setMessage({ type: "", text: "" });
    
    // Validar en tiempo real si ya fue tocado el campo
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleRoleChange = (newRole) => {
    setForm({ ...form, idRol: newRole });
    if (message.text) setMessage({ type: "", text: "" });
    // Limpiar errores específicos de rol
    const roleSpecificErrors = ['cedula', 'direccion', 'telefono', 'nombreEmpresa', 'ruc', 'direccionEmpresa', 'telefonoEmpresa'];
    const newErrors = { ...errors };
    roleSpecificErrors.forEach(field => delete newErrors[field]);
    setErrors(newErrors);
  };

  // Validar todo el formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    
    // Validar todos los campos
    Object.keys(form).forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const registrar = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: "error", text: "Por favor corrige los errores del formulario" });
      // Hacer scroll al primer error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    // Preparar datos para enviar (sin confirmarContrasena)
    const dataToSend = { ...form };
    delete dataToSend.confirmarContrasena;
    
    fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setMessage({ type: "success", text: "¡Registro exitoso! Redirigiendo al login... 🎉" });
          
          // IMPORTANTE: NO guardamos nada en localStorage aquí
          // Guardamos el email temporalmente para pre-llenar el login
          sessionStorage.setItem("registeredEmail", form.correo);
          sessionStorage.setItem("registrationSuccess", "true");
          
          // Resetear formulario
          setForm({
            nombre: "", apellido: "", correo: "", contrasena: "", confirmarContrasena: "", fechaNacimiento: "", idRol: 3,
            cedula: "", direccion: "", telefono: "",
            nombreEmpresa: "", ruc: "", direccionEmpresa: "", telefonoEmpresa: "", descripcion: ""
          });
          
          // Limpiar errores y touched
          setErrors({});
          setTouched({});
          
          // Redirigir a LoginModal después de 2 segundos
          setTimeout(() => {
            window.location.href = "/LoginModal";
          }, 2000);
          
        } else {
          setMessage({ type: "error", text: data.mensaje || "Error en el registro" });
        }
      })
      .catch(error => {
        setMessage({ type: "error", text: "Error en la conexión con el servidor. Verifica que el backend esté corriendo." });
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Determinar si un campo tiene error
  const getFieldStatus = (fieldName) => {
    if (!touched[fieldName]) return "";
    return errors[fieldName] ? "error" : "success";
  };

  // Calcular fecha mínima y máxima (20-65 años)
  const calcularFechasLimite = () => {
    const hoy = new Date();
    const fechaMax = new Date(hoy.getFullYear() - 20, hoy.getMonth(), hoy.getDate());
    const fechaMin = new Date(hoy.getFullYear() - 65, hoy.getMonth(), hoy.getDate());
    
    return {
      max: fechaMax.toISOString().split('T')[0],
      min: fechaMin.toISOString().split('T')[0]
    };
  };

  const fechasLimite = calcularFechasLimite();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .register-container {
          min-height: 100vh;
          background: #fffaf5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
          font-family: 'Playfair Display', 'Georgia', serif;
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 15px;
          line-height: 1.2;
        }

        .overlay-subtitle {
          font-size: 18px;
          opacity: 0.95;
          line-height: 1.6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
          background: #FF6B35;
          border-radius: 10px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        /* TÍTULO MÁS GRANDE Y CON MEJOR ESPACIADO */
        .form-title {
          font-family: 'Playfair Display', 'Georgia', serif;
          font-size: 56px; /* MUCHO MÁS GRANDE */
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 10px;
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .form-subtitle {
          color: #666;
          font-size: 18px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* SELECTOR DE ROL */
        .role-selector {
          margin-bottom: 35px;
        }

        .role-label {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 15px;
          display: block;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .role-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .role-btn {
          padding: 25px 20px;
          border: 2px solid #f0f0f0;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .role-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.1);
        }

        .role-btn.active {
          border-color: #FF6B35;
          background: rgba(255, 107, 53, 0.05);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.15);
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
          background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
        }

        .role-btn:not(.active) .role-icon {
          background: #f0f0f0;
        }

        .role-name {
          font-weight: 600;
          font-size: 16px;
          color: #1a1a1a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .role-desc {
          font-size: 13px;
          color: #666;
          text-align: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* INPUTS */
        .form-section {
          margin-bottom: 30px;
        }

        .section-title {
          font-family: 'Playfair Display', 'Georgia', serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
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
          color: #555;
          margin-bottom: 8px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #FF6B35;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #f0f0f0;
          border-radius: 14px;
          font-size: 15px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: white;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #FF6B35;
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
        }

        .form-input.error {
          border-color: #ff4444;
          background: rgba(255, 68, 68, 0.02);
        }

        .form-input.success {
          border-color: #4CAF50;
          background: rgba(76, 175, 80, 0.02);
        }

        .form-input::placeholder {
          color: #aaa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .form-textarea {
          padding: 14px 16px;
          resize: none;
          min-height: 100px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #FF6B35;
        }

        .error-message {
          color: #ff4444;
          font-size: 12px;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: fadeIn 0.3s ease;
        }

        .success-message {
          color: #4CAF50;
          font-size: 12px;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: fadeIn 0.3s ease;
        }

        .age-info {
          color: #666;
          font-size: 11px;
          margin-top: 3px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-style: italic;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
          background: rgba(76, 175, 80, 0.1);
          color: #2E7D32;
          border: 2px solid rgba(76, 175, 80, 0.2);
        }

        .alert-error {
          background: rgba(255, 68, 68, 0.1);
          color: #C62828;
          border: 2px solid rgba(255, 68, 68, 0.2);
        }

        /* BOTÓN */
        .submit-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 17px;
          font-weight: 600;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255, 107, 53, 0.4);
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #f0f0f0;
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
          border: 2px solid #f0f0f0;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
          border-color: #FF6B35;
          background: rgba(255, 107, 53, 0.02);
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .login-link a {
          color: #FF6B35;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.3s ease;
        }

        .login-link a:hover {
          opacity: 0.8;
          text-decoration: underline;
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
            font-size: 42px;
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
                <h2 className="overlay-title">My Harvest</h2>
                <p className="overlay-subtitle">
                  MERCADO - IA<br />
                  Conectando productores locales con consumidores de toda la región. 
                  Productos frescos, directos del campo a tu mesa.
                </p>
              </div>
            </div>
          </div>

          {/* LADO DERECHO - FORMULARIO */}
          <div className="form-side">
            
            {/* HEADER SIN LOGO - SOLO TÍTULO Y SUBTÍTULO */}
            <div className="form-header">
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
              <label className="role-label">¿Cómo te gustaría unirte?</label>
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
                <User className="w-5 h-5" style={{ color: "#FF6B35" }} strokeWidth={1.5} />
                Información Personal
              </h3>
              
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Nombre</label>
                  <div className="input-wrapper">
                    <User className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("nombre")}`}
                      placeholder="Juan"
                      required
                    />
                  </div>
                  {errors.nombre && touched.nombre && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nombre}
                    </div>
                  )}
                  {!errors.nombre && touched.nombre && form.nombre && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Nombre válido
                    </div>
                  )}
                </div>
                
                <div className="input-group">
                  <label className="input-label">Apellido</label>
                  <div className="input-wrapper">
                    <User className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input
                      type="text"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("apellido")}`}
                      placeholder="Pérez"
                      required
                    />
                  </div>
                  {errors.apellido && touched.apellido && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.apellido}
                    </div>
                  )}
                  {!errors.apellido && touched.apellido && form.apellido && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Apellido válido
                    </div>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Correo electrónico</label>
                <div className="input-wrapper">
                  <Mail className="input-icon w-5 h-5" strokeWidth={1.5} />
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${getFieldStatus("correo")}`}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                {errors.correo && touched.correo && (
                  <div className="error-message">
                    <AlertCircle className="w-4 h-4" />
                    {errors.correo}
                  </div>
                )}
                {!errors.correo && touched.correo && form.correo && (
                  <div className="success-message">
                    <CheckCircle className="w-4 h-4" />
                    Correo válido
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon w-5 h-5" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${getFieldStatus("contrasena")}`}
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
                {errors.contrasena && touched.contrasena && (
                  <div className="error-message">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contrasena}
                  </div>
                )}
                {!errors.contrasena && touched.contrasena && form.contrasena && form.contrasena.length >= 6 && (
                  <div className="success-message">
                    <CheckCircle className="w-4 h-4" />
                    Contraseña segura
                  </div>
                )}
                {touched.contrasena && !errors.contrasena && (
                  <div className="success-message" style={{ fontSize: "11px", color: "#666" }}>
                    ✓ La contraseña debe tener al menos 6 caracteres, incluyendo mayúsculas, minúsculas y números
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Confirmar Contraseña</label>
                <div className="input-wrapper">
                  <Lock className="input-icon w-5 h-5" strokeWidth={1.5} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmarContrasena"
                    value={form.confirmarContrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${getFieldStatus("confirmarContrasena")}`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.confirmarContrasena && touched.confirmarContrasena && (
                  <div className="error-message">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmarContrasena}
                  </div>
                )}
                {!errors.confirmarContrasena && touched.confirmarContrasena && form.confirmarContrasena && form.contrasena === form.confirmarContrasena && (
                  <div className="success-message">
                    <CheckCircle className="w-4 h-4" />
                    Las contraseñas coinciden
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Fecha de nacimiento</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon w-5 h-5" strokeWidth={1.5} />
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${getFieldStatus("fechaNacimiento")}`}
                    min={fechasLimite.min}
                    max={fechasLimite.max}
                    required
                  />
                </div>
                <div className="age-info">
                  Rango de edad permitido: 20 a 65 años
                </div>
                {errors.fechaNacimiento && touched.fechaNacimiento && (
                  <div className="error-message">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fechaNacimiento}
                  </div>
                )}
                {!errors.fechaNacimiento && touched.fechaNacimiento && form.fechaNacimiento && (
                  <div className="success-message">
                    <CheckCircle className="w-4 h-4" />
                    Edad válida (entre 20 y 65 años)
                  </div>
                )}
              </div>
            </div>

            {/* CAMPOS CONSUMIDOR */}
            {form.idRol === 3 && (
              <div className="form-section">
                <h3 className="section-title">
                  <ShoppingBag className="w-5 h-5" style={{ color: "#FF6B35" }} strokeWidth={1.5} />
                  Información del Consumidor
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Cédula</label>
                  <div className="input-wrapper">
                    <CreditCard className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input 
                      type="text" 
                      name="cedula" 
                      value={form.cedula} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("cedula")}`}
                      placeholder="0102030405" 
                      required 
                    />
                  </div>
                  {errors.cedula && touched.cedula && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cedula}
                    </div>
                  )}
                  {!errors.cedula && touched.cedula && form.cedula && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Cédula válida
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Dirección</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input 
                      type="text" 
                      name="direccion" 
                      value={form.direccion} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("direccion")}`}
                      placeholder="Dirección del domicilio" 
                      required 
                    />
                  </div>
                  {errors.direccion && touched.direccion && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.direccion}
                    </div>
                  )}
                  {!errors.direccion && touched.direccion && form.direccion && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Dirección válida
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Teléfono</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input 
                      type="text" 
                      name="telefono" 
                      value={form.telefono} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("telefono")}`}
                      placeholder="0999999999" 
                      required 
                    />
                  </div>
                  {errors.telefono && touched.telefono && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.telefono}
                    </div>
                  )}
                  {!errors.telefono && touched.telefono && form.telefono && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Teléfono válido
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CAMPOS VENDEDOR */}
            {form.idRol === 2 && (
              <div className="form-section">
                <h3 className="section-title">
                  <Store className="w-5 h-5" style={{ color: "#FF6B35" }} strokeWidth={1.5} />
                  Información del Negocio
                </h3>
                
                <div className="input-group">
                  <label className="input-label">Nombre del negocio</label>
                  <div className="input-wrapper">
                    <Building2 className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input 
                      type="text" 
                      name="nombreEmpresa" 
                      value={form.nombreEmpresa} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("nombreEmpresa")}`}
                      placeholder="Frutas Don Pepe" 
                      required 
                    />
                  </div>
                  {errors.nombreEmpresa && touched.nombreEmpresa && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nombreEmpresa}
                    </div>
                  )}
                  {!errors.nombreEmpresa && touched.nombreEmpresa && form.nombreEmpresa && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Nombre válido
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">RUC</label>
                  <div className="input-wrapper">
                    <FileText className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input 
                      type="text" 
                      name="ruc" 
                      value={form.ruc} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("ruc")}`}
                      placeholder="1102345678001" 
                      required 
                    />
                  </div>
                  {errors.ruc && touched.ruc && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.ruc}
                    </div>
                  )}
                  {!errors.ruc && touched.ruc && form.ruc && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      RUC válido
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Dirección del negocio</label>
                  <div className="input-wrapper">
                    <MapPin className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input 
                      type="text" 
                      name="direccionEmpresa" 
                      value={form.direccionEmpresa} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("direccionEmpresa")}`}
                      placeholder="Mercado Central, Local 12" 
                      required 
                    />
                  </div>
                  {errors.direccionEmpresa && touched.direccionEmpresa && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.direccionEmpresa}
                    </div>
                  )}
                  {!errors.direccionEmpresa && touched.direccionEmpresa && form.direccionEmpresa && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Dirección válida
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Teléfono del negocio</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon w-5 h-5" strokeWidth={1.5} />
                    <input 
                      type="text" 
                      name="telefonoEmpresa" 
                      value={form.telefonoEmpresa} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-input ${getFieldStatus("telefonoEmpresa")}`}
                      placeholder="0987654321" 
                      required 
                    />
                  </div>
                  {errors.telefonoEmpresa && touched.telefonoEmpresa && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.telefonoEmpresa}
                    </div>
                  )}
                  {!errors.telefonoEmpresa && touched.telefonoEmpresa && form.telefonoEmpresa && (
                    <div className="success-message">
                      <CheckCircle className="w-4 h-4" />
                      Teléfono válido
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Descripción del negocio</label>
                  <textarea 
                    name="descripcion" 
                    value={form.descripcion} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-input form-textarea" 
                    placeholder="Venta de verduras frescas y productos orgánicos..." 
                  />
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
              <a href="/LoginModal">Inicia sesión aquí</a>
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}