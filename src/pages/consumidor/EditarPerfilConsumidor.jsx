// src/pages/consumidor/EditarPerfilConsumidor.jsx - VERSIÓN FINAL MEJORADA
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfil, actualizarPerfil } from "../../services/perfilService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Footer from "../../components/Footer";

export default function EditarPerfilConsumidor() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [circlePositions, setCirclePositions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Usar useRef para evitar re-renders
  const nombreRef = useRef("");
  const apellidoRef = useRef("");
  const direccionRef = useRef("");
  const telefonoRef = useRef("");
  const [fechaNacimiento, setFechaNacimiento] = useState(null);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",
        "rgba(52, 211, 153, 0.15)",
        "rgba(59, 130, 246, 0.15)",
        "rgba(168, 85, 247, 0.15)",
        "rgba(239, 68, 68, 0.15)",
        "rgba(245, 158, 11, 0.15)",
        "rgba(14, 165, 233, 0.15)",
        "rgba(236, 72, 153, 0.15)"
      ];
      
      for (let i = 0; i < 10; i++) {
        circles.push({
          id: i,
          size: Math.random() * 100 + 50,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 4 + 2 + "px",
          zIndex: 0
        });
      }
      setCirclePositions(circles);
    };

    generateCircles();
    
    const interval = setInterval(() => {
      setCirclePositions(prev => 
        prev.map(circle => ({
          ...circle,
          top: Math.random() * 100,
          left: Math.random() * 100,
          animationDelay: Math.random() * 4 + "s"
        }))
      );
    }, 35000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/LoginModal");
      return;
    }

    cargarPerfil();
  }, [navigate]);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerPerfil();
      setPerfil(data);
      
      nombreRef.current = data.nombre || "";
      apellidoRef.current = data.apellido || "";
      direccionRef.current = data.direccionConsumidor || "";
      telefonoRef.current = data.telefonoConsumidor || "";
      
      if (data.fechaNacimiento) {
        const date = new Date(data.fechaNacimiento);
        if (!isNaN(date.getTime())) {
          setFechaNacimiento(date);
        }
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setError("No se pudo cargar el perfil. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 VALIDACIONES MEJORADAS
  const validarCampos = () => {
    const errors = {};
    
    // Validar nombre
    if (!nombreRef.current.trim()) {
      errors.nombre = "El nombre es obligatorio";
    } else if (nombreRef.current.trim().length < 2) {
      errors.nombre = "El nombre debe tener al menos 2 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreRef.current.trim())) {
      errors.nombre = "El nombre solo puede contener letras";
    }
    
    // Validar apellido
    if (!apellidoRef.current.trim()) {
      errors.apellido = "El apellido es obligatorio";
    } else if (apellidoRef.current.trim().length < 2) {
      errors.apellido = "El apellido debe tener al menos 2 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoRef.current.trim())) {
      errors.apellido = "El apellido solo puede contener letras";
    }
    
    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (telefonoRef.current.trim()) {
      const telefonoLimpio = telefonoRef.current.trim().replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(telefonoLimpio)) {
        errors.telefono = "El teléfono debe tener 10 dígitos";
      }
    }
    
    // Validar fecha de nacimiento (opcional pero si se ingresa debe ser válida)
    if (fechaNacimiento) {
      const edad = calcularEdad(fechaNacimiento);
      if (edad < 18) {
        errors.fecha = "Debes ser mayor de 18 años";
      } else if (edad > 120) {
        errors.fecha = "Fecha de nacimiento inválida";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleGuardarCambios = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      setValidationErrors({});
      
      // Validar antes de guardar
      if (!validarCampos()) {
        setSaving(false);
        setError("Por favor corrige los errores en el formulario");
        return;
      }
      
      const datosActualizados = {
        nombre: nombreRef.current.trim(),
        apellido: apellidoRef.current.trim(),
        fechaNacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null,
        direccionConsumidor: direccionRef.current.trim(),
        telefonoConsumidor: telefonoRef.current.trim()
      };

      await actualizarPerfil(datosActualizados);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/perfil");
      }, 2000);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      setError(error.message || "No se pudo guardar los cambios. Por favor, intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    navigate("/perfil");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            width: "60px",
            height: "60px",
            border: "5px solid #f1f5f9",
            borderTop: "5px solid #FF6B35",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{
            marginTop: "25px",
            fontSize: "18px",
            color: "#2C3E50",
            fontWeight: "600",
            fontFamily: "'Inter', sans-serif"
          }}>
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (!perfil) return null;

  // Componente de campo de entrada con validación
  const InputField = ({ label, defaultValue, inputRef, placeholder, type = "text", disabled = false, isTextArea = false, fieldName }) => {
    const hasError = validationErrors[fieldName];
    
    return (
      <div style={{ marginBottom: "24px" }}>
        <label style={{
          display: "block",
          fontSize: "13px",
          color: hasError ? "#DC2626" : "#64748b",
          fontWeight: "600",
          marginBottom: "8px",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.5px",
          textTransform: "uppercase"
        }}>
          {label}
        </label>
        {isTextArea ? (
          <textarea
            defaultValue={defaultValue}
            onChange={(e) => { 
              inputRef.current = e.target.value;
              // Limpiar error al escribir
              if (hasError) {
                const newErrors = { ...validationErrors };
                delete newErrors[fieldName];
                setValidationErrors(newErrors);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              width: "100%",
              minHeight: "100px",
              backgroundColor: disabled ? "#f8f9fa" : "white",
              border: `2px solid ${hasError ? "#DC2626" : disabled ? "#e5e7eb" : "#e5e7eb"}`,
              borderRadius: "12px",
              padding: "14px",
              fontSize: "15px",
              color: disabled ? "#64748b" : "#1e293b",
              fontWeight: "500",
              fontFamily: "'Inter', sans-serif",
              resize: "vertical",
              transition: "all 0.3s ease",
              outline: "none",
              cursor: disabled ? "not-allowed" : "text"
            }}
            onFocus={(e) => {
              if (!disabled && !hasError) {
                e.target.style.borderColor = "#FF6B35";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
              }
            }}
            onBlur={(e) => {
              if (!hasError) {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }
            }}
          />
        ) : (
          <input
            type={type}
            defaultValue={defaultValue}
            onChange={(e) => { 
              inputRef.current = e.target.value;
              // Limpiar error al escribir
              if (hasError) {
                const newErrors = { ...validationErrors };
                delete newErrors[fieldName];
                setValidationErrors(newErrors);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              width: "100%",
              backgroundColor: disabled ? "#f8f9fa" : "white",
              border: `2px solid ${hasError ? "#DC2626" : disabled ? "#e5e7eb" : "#e5e7eb"}`,
              borderRadius: "12px",
              padding: "14px",
              fontSize: "15px",
              color: disabled ? "#64748b" : "#1e293b",
              fontWeight: "500",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              cursor: disabled ? "not-allowed" : "text"
            }}
            onFocus={(e) => {
              if (!disabled && !hasError) {
                e.target.style.borderColor = "#FF6B35";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
              }
            }}
            onBlur={(e) => {
              if (!hasError) {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }
            }}
          />
        )}
        {hasError && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "6px",
            padding: "6px 10px",
            background: "#FEE2E2",
            borderRadius: "6px",
            border: "1px solid #FECACA"
          }}>
            <span style={{ fontSize: "12px" }}>⚠️</span>
            <span style={{
              color: "#DC2626",
              fontSize: "12px",
              fontWeight: "600",
              fontFamily: "'Inter', sans-serif"
            }}>
              {hasError}
            </span>
          </div>
        )}
        {disabled && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "8px",
            padding: "8px 12px",
            background: "#FEE2E2",
            borderRadius: "8px",
            border: "1px solid #FECACA"
          }}>
            <span style={{ fontSize: "14px" }}>🔒</span>
            <span style={{
              color: "#DC2626",
              fontSize: "12px",
              fontWeight: "600",
              fontFamily: "'Inter', sans-serif"
            }}>
              Este campo no se puede modificar
            </span>
          </div>
        )}
      </div>
    );
  };

  const LockedField = ({ label, value }) => (
    <div style={{ marginBottom: "24px" }}>
      <label style={{
        display: "block",
        fontSize: "13px",
        color: "#64748b",
        fontWeight: "600",
        marginBottom: "8px",
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.5px",
        textTransform: "uppercase"
      }}>
        {label}
      </label>
      <div style={{
        backgroundColor: "#f8f9fa",
        border: "2px solid #e5e7eb",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{
          fontSize: "15px",
          color: "#64748b",
          fontWeight: "500",
          fontFamily: "'Inter', sans-serif"
        }}>
          {value || "No especificado"}
        </span>
        <div style={{
          backgroundColor: "#FEE2E2",
          width: "32px",
          height: "32px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span style={{ color: "#DC2626", fontSize: "14px" }}>🔒</span>
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ children, onClick, variant = "primary", disabled = false, icon }) => {
    const isPrimary = variant === "primary";

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          padding: "16px 32px",
          background: disabled 
            ? "#e5e7eb" 
            : isPrimary 
            ? "#FF6B35" 
            : "white",
          color: disabled 
            ? "#94a3b8" 
            : isPrimary 
            ? "white" 
            : "#FF6B35",
          border: isPrimary ? "none" : "2px solid #FF6B35",
          borderRadius: "14px",
          fontWeight: "700",
          fontSize: "16px",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: "center",
          boxShadow: isPrimary ? "0 4px 12px rgba(255, 107, 53, 0.25)" : "none",
          fontFamily: "'Inter', sans-serif",
          minWidth: "200px",
          opacity: disabled ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            if (isPrimary) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 107, 53, 0.35)";
              e.currentTarget.style.background = "#FF8E53";
            } else {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.2)";
              e.currentTarget.style.background = "rgba(255, 107, 53, 0.1)";
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = isPrimary ? "0 4px 12px rgba(255, 107, 53, 0.25)" : "none";
            e.currentTarget.style.background = isPrimary ? "#FF6B35" : "white";
          }
        }}
      >
        {icon && <span style={{ fontSize: "20px" }}>{icon}</span>}
        {children}
      </button>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'Inter', sans-serif",
      overflowX: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes floatCircle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(20px, -25px) scale(1.08); }
          40% { transform: translate(-15px, 20px) scale(0.92); }
          60% { transform: translate(10px, 15px) scale(1.05); }
          80% { transform: translate(-20px, -15px) scale(0.98); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 107, 53, 0.3); }
          50% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.5); }
        }
        
        /* DatePicker personalizado */
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .react-datepicker {
          font-family: 'Inter', sans-serif !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 16px !important;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
        }
        
        .react-datepicker__header {
          background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%) !important;
          border-bottom: none !important;
          padding: 16px 0 !important;
          border-top-left-radius: 14px !important;
          border-top-right-radius: 14px !important;
        }
        
        .react-datepicker__current-month {
          color: white !important;
          font-weight: 700 !important;
          font-size: 17px !important;
          margin-bottom: 8px !important;
          font-family: 'Playfair Display', serif !important;
        }
        
        .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          width: 2.2rem !important;
          line-height: 2.2rem !important;
          margin: 0.3rem !important;
        }
        
        .react-datepicker__day {
          width: 2.2rem !important;
          line-height: 2.2rem !important;
          margin: 0.3rem !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        
        .react-datepicker__day:hover {
          background-color: rgba(255, 107, 53, 0.1) !important;
          color: #FF6B35 !important;
          transform: scale(1.1) !important;
        }
        
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%) !important;
          color: white !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4) !important;
        }
        
        .react-datepicker__day--today {
          border: 2px solid #FF6B35 !important;
          background-color: rgba(255, 107, 53, 0.05) !important;
          color: #FF6B35 !important;
          font-weight: 700 !important;
        }
        
        .react-datepicker__day--disabled {
          color: #cbd5e1 !important;
          cursor: not-allowed !important;
        }
        
        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
          transform: none !important;
        }
        
        .react-datepicker__navigation {
          top: 20px !important;
        }
        
        .react-datepicker__navigation-icon::before {
          border-color: white !important;
          border-width: 2px 2px 0 0 !important;
        }
        
        .react-datepicker__month {
          padding: 12px !important;
        }
        
        .react-datepicker__year-dropdown,
        .react-datepicker__month-dropdown {
          background-color: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
        
        .react-datepicker__year-option:hover,
        .react-datepicker__month-option:hover {
          background-color: rgba(255, 107, 53, 0.1) !important;
          color: #FF6B35 !important;
        }
        
        .react-datepicker__year-option--selected,
        .react-datepicker__month-option--selected {
          background-color: #FF6B35 !important;
          color: white !important;
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={{
        background: "white",
        borderRadius: "0 0 30px 30px",
        padding: "50px 32px 36px 32px",
        marginBottom: "36px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {/* CÍRCULOS FLOTANTES */}
        {circlePositions.map(circle => (
          <div 
            key={circle.id}
            style={{
              position: "absolute",
              top: `${circle.top}%`,
              left: `${circle.left}%`,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              background: circle.color,
              borderRadius: "50%",
              animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
              animationDelay: circle.animationDelay,
              filter: `blur(${circle.blur})`,
              opacity: 0.8,
              zIndex: circle.zIndex
            }}
          />
        ))}

        <div style={{
          position: "relative",
          zIndex: "10",
          maxWidth: "900px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px"
          }}>
            
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "13px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#FF6B35",
              marginBottom: "4px",
              fontWeight: "500"
            }}>
              Editando Perfil
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px",
              fontWeight: "800",
              color: "#FF6B35",
              margin: "0 0 14px 0",
              letterSpacing: "-1px",
              lineHeight: "1.1",
              textShadow: "0 2px 4px rgba(255, 107, 53, 0.1)"
            }}>✏️ {perfil.nombre} {perfil.apellido}</h1>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "18px",
              marginBottom: "16px",
              flexWrap: "wrap"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)",
                padding: "10px 22px",
                borderRadius: "50px",
                border: "2px solid rgba(255, 107, 53, 0.3)",
                boxShadow: "0 4px 15px rgba(255, 107, 53, 0.2)",
                animation: "glow 2s ease-in-out infinite"
              }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #FF6B35 30%, #FF8E53 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px rgba(255, 107, 53, 0.5)"
                }}>
                  <div style={{
                    width: "11px",
                    height: "11px",
                    borderRadius: "50%",
                    background: "white",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }} />
                </div>
                <span style={{
                  fontSize: "15px",
                  color: "#FF6B35",
                  fontWeight: "700",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Editando información
                </span>
              </div>
            </div>
            
            <p style={{
              color: "#64748b",
              fontSize: "15px",
              margin: "12px auto 0 auto",
              maxWidth: "580px",
              lineHeight: "1.6",
              fontWeight: "400",
              fontFamily: "'Inter', sans-serif",
              opacity: 0.8,
              background: "rgba(255, 107, 53, 0.05)",
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 107, 53, 0.1)"
            }}>
              Actualiza tu información personal para una mejor experiencia en MercadoLocal
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "0 20px 40px 20px"
      }}>
        {/* MENSAJES DE ERROR/ÉXITO */}
        {error && (
          <div style={{
            backgroundColor: "#FEF2F2",
            border: "2px solid #FECACA",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideIn 0.3s ease-out"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "16px",
              backgroundColor: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{ color: "white", fontSize: "16px" }}>❌</span>
            </div>
            <span style={{ color: "#DC2626", fontWeight: "600", fontFamily: "'Inter', sans-serif" }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "#D1FAE5",
            border: "2px solid #A7F3D0",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "fadeIn 0.3s ease-out"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "16px",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{ color: "white", fontSize: "16px" }}>✅</span>
            </div>
            <div>
              <span style={{ color: "#065F46", fontWeight: "600", display: "block", fontFamily: "'Inter', sans-serif" }}>
                ¡Perfil actualizado correctamente!
              </span>
              <span style={{ color: "#047857", fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
                Redirigiendo al perfil...
              </span>
            </div>
          </div>
        )}

        {/* SECCIÓN DE DATOS PERSONALES */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "28px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
            }}>
              <span style={{ 
                fontSize: "22px", 
                color: "white"
              }}>👤</span>
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: "800",
                color: "#2C3E50",
                margin: "0 0 4px 0"
              }}>
                Datos Personales
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: "13px",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Actualiza tu información básica
              </p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          }}>
            <InputField
              label="Nombre *"
              defaultValue={perfil.nombre}
              inputRef={nombreRef}
              placeholder="Ingresa tu nombre"
              fieldName="nombre"
            />
            
            <InputField
              label="Apellido *"
              defaultValue={perfil.apellido}
              inputRef={apellidoRef}
              placeholder="Ingresa tu apellido"
              fieldName="apellido"
            />
          </div>

          {/* Campo de fecha con DatePicker mejorado */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              color: validationErrors.fecha ? "#DC2626" : "#64748b",
              fontWeight: "600",
              marginBottom: "8px",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>
              Fecha de Nacimiento
            </label>
            <div style={{
              backgroundColor: "white",
              border: `2px solid ${validationErrors.fecha ? "#DC2626" : "#e5e7eb"}`,
              borderRadius: "12px",
              overflow: "hidden",
              transition: "all 0.3s ease",
              position: "relative"
            }}>
              <DatePicker
                selected={fechaNacimiento}
                onChange={(date) => {
                  setFechaNacimiento(date);
                  // Limpiar error al seleccionar
                  if (validationErrors.fecha) {
                    const newErrors = { ...validationErrors };
                    delete newErrors.fecha;
                    setValidationErrors(newErrors);
                  }
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona tu fecha de nacimiento"
                maxDate={new Date()}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                showMonthDropdown
                dropdownMode="select"
                wrapperClassName="date-picker"
                className="date-input"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "'Inter', sans-serif",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  color: "#1e293b"
                }}
              />
              <div style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "18px",
                color: "#64748b"
              }}>
                📅
              </div>
            </div>
            {validationErrors.fecha && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "6px",
                padding: "6px 10px",
                background: "#FEE2E2",
                borderRadius: "6px",
                border: "1px solid #FECACA"
              }}>
                <span style={{ fontSize: "12px" }}>⚠️</span>
                <span style={{
                  color: "#DC2626",
                  fontSize: "12px",
                  fontWeight: "600",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {validationErrors.fecha}
                </span>
              </div>
            )}
          </div>

          <LockedField
            label="Correo electrónico"
            value={perfil.correo}
          />
        </div>

        {/* SECCIÓN DE DATOS DE CONSUMIDOR */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "28px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3498DB 0%, #1D4ED8 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 6px 20px rgba(52, 152, 219, 0.3)"
            }}>
              <span style={{ 
                fontSize: "22px", 
                color: "white"
              }}>🛒</span>
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: "800",
                color: "#2C3E50",
                margin: "0 0 4px 0"
              }}>
                Datos de Consumidor
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: "13px",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Información de contacto
              </p>
            </div>
          </div>

          <InputField
            label="Dirección"
            defaultValue={perfil.direccionConsumidor}
            inputRef={direccionRef}
            placeholder="Ingresa tu dirección completa"
            isTextArea={true}
            fieldName="direccion"
          />

          <InputField
            label="Teléfono"
            defaultValue={perfil.telefonoConsumidor}
            inputRef={telefonoRef}
            placeholder="0987654321"
            type="tel"
            fieldName="telefono"
          />

          <LockedField
            label="Cédula"
            value={perfil.cedulaConsumidor}
          />
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px"
          }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "26px",
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "10px",
              boxShadow: "0 8px 25px rgba(255, 107, 53, 0.4)"
            }}>
              <span style={{ 
                fontSize: "26px", 
                color: "white"
              }}>💾</span>
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "19px",
              fontWeight: "800",
              color: "#2C3E50",
              margin: "0"
            }}>
              Guardar Cambios
            </h3>
            <p style={{
              color: "#64748b",
              fontSize: "13px",
              textAlign: "center",
              margin: "0",
              maxWidth: "480px",
              lineHeight: "1.6",
              fontFamily: "'Inter', sans-serif"
            }}>
              Una vez que hayas realizado todos los cambios, presiona el botón para guardar
            </p>
          </div>

          <div style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%"
          }}>
            <ActionButton
              onClick={handleGuardarCambios}
              disabled={saving || success}
              variant="primary"
              icon={saving ? "⏳" : "💾"}
            >
              {saving ? "Guardando..." : success ? "¡Guardado!" : "Guardar Cambios"}
            </ActionButton>
            
            <ActionButton
              onClick={handleCancelar}
              disabled={saving}
              variant="secondary"
              icon="✕"
            >
              Cancelar
            </ActionButton>
          </div>

          {saving && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "14px",
              padding: "12px 18px",
              backgroundColor: "rgba(255, 107, 53, 0.1)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 107, 53, 0.2)",
              animation: "fadeIn 0.3s ease"
            }}>
              <div style={{
                width: "20px",
                height: "20px",
                border: "3px solid #f1f5f9",
                borderTop: "3px solid #FF6B35",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              <span style={{
                color: "#FF6B35",
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "'Inter', sans-serif"
              }}>
                Guardando cambios...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}