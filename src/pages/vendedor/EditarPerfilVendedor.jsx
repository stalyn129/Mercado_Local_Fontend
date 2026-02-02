// src/pages/vendedor/EditarPerfilVendedor.jsx - VERSIÓN SIMPLIFICADA
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfil, actualizarPerfil } from "../../services/perfilService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Footer from "../components/Footer";

export default function EditarPerfilVendedor() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [circlePositions, setCirclePositions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Estados para los campos editables (SOLO ESTOS como en móvil)
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [direccionEmpresa, setDireccionEmpresa] = useState("");
  const [telefonoEmpresa, setTelefonoEmpresa] = useState("");

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
      
      // Cargar solo los campos editables (igual que en móvil)
      setNombre(data.nombre || "");
      setApellido(data.apellido || "");
      setDireccionEmpresa(data.direccionEmpresa || "");
      setTelefonoEmpresa(data.telefonoEmpresa || "");
      
      // Parsear fecha de nacimiento
      if (data.fechaNacimiento) {
        const date = new Date(data.fechaNacimiento);
        if (!isNaN(date.getTime())) {
          setFechaNacimiento(date);
        }
      }
    } catch (error) {
      console.error("Error al cargar perfil de vendedor:", error);
      setError("No se pudo cargar el perfil. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 VALIDACIONES (igual que en móvil)
  const validarCampos = () => {
    const errors = {};
    
    // Validar nombre (igual que en móvil)
    if (!nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    } else if (nombre.trim().length < 2) {
      errors.nombre = "El nombre debe tener al menos 2 caracteres";
    }
    
    // Validar apellido (igual que en móvil)
    if (!apellido.trim()) {
      errors.apellido = "El apellido es obligatorio";
    } else if (apellido.trim().length < 2) {
      errors.apellido = "El apellido debe tener al menos 2 caracteres";
    }
    
    // Validar dirección empresa (igual que en móvil)
    if (!direccionEmpresa.trim()) {
      errors.direccionEmpresa = "La dirección de la empresa es requerida";
    }
    
    // Validar teléfono empresa (igual que en móvil)
    if (!telefonoEmpresa.trim()) {
      errors.telefonoEmpresa = "El teléfono de la empresa es requerido";
    } else {
      const telefonoLimpio = telefonoEmpresa.trim().replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(telefonoLimpio)) {
        errors.telefonoEmpresa = "El teléfono debe tener 10 dígitos";
      }
    }
    
    // Validar fecha de nacimiento (opcional pero si se ingresa)
    if (fechaNacimiento) {
      const edad = calcularEdad(fechaNacimiento);
      if (edad < 18) {
        errors.fechaNacimiento = "Debes ser mayor de 18 años";
      } else if (edad > 120) {
        errors.fechaNacimiento = "Fecha de nacimiento inválida";
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

  const formatFechaDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleGuardarCambios = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      setValidationErrors({});
      
      // Validar antes de guardar (igual que en móvil)
      if (!validarCampos()) {
        setSaving(false);
        setError("Por favor corrige los errores en el formulario");
        return;
      }
      
      // SOLO enviar campos editables (igual que en móvil)
      const datosActualizados = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fechaNacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null,
        direccionEmpresa: direccionEmpresa.trim(),
        telefonoEmpresa: telefonoEmpresa.trim()
      };

      await actualizarPerfil(datosActualizados);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/perfil");
      }, 2000);
      
    } catch (error) {
      console.error("Error al guardar perfil de vendedor:", error);
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
            Cargando perfil de vendedor...
          </p>
        </div>
      </div>
    );
  }

  if (!perfil) return null;

  // Componente de campo de entrada
  const InputField = ({ label, value, onChange, placeholder, type = "text", disabled = false, isTextArea = false, fieldName }) => {
    const hasError = validationErrors[fieldName];
    
    return (
      <div style={{ marginBottom: "24px" }}>
        <label style={{
          display: "block",
          fontSize: "14px",
          color: hasError ? "#DC2626" : "#64748b",
          fontWeight: "600",
          marginBottom: "8px",
          fontFamily: "'Inter', sans-serif"
        }}>
          {label} {hasError && <span style={{ color: "#DC2626" }}>*</span>}
        </label>
        {isTextArea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
            color: "#DC2626",
            fontSize: "12px",
            fontWeight: "500"
          }}>
            <span>⚠️</span>
            <span>{hasError}</span>
          </div>
        )}
        {disabled && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "8px",
            color: "#94a3b8",
            fontSize: "12px",
            fontStyle: "italic"
          }}>
            <span style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600"
            }}>🔒</span>
            Este campo no se puede modificar
          </div>
        )}
      </div>
    );
  };

  const LockedField = ({ label, value }) => (
    <div style={{ marginBottom: "24px" }}>
      <label style={{
        display: "block",
        fontSize: "14px",
        color: "#64748b",
        fontWeight: "600",
        marginBottom: "8px",
        fontFamily: "'Inter', sans-serif"
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
      <div style={{
        color: "#94a3b8",
        fontSize: "12px",
        marginTop: "6px",
        fontStyle: "italic"
      }}>
        Este campo no se puede modificar
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
          padding: "16px 24px",
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
        
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker {
          font-family: 'Inter', sans-serif;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .react-datepicker__header {
          background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
          borderBottom: none;
          padding: 12px 0;
        }
        
        .react-datepicker__current-month {
          color: white;
          fontWeight: 600;
          fontSize: 16px;
        }
        
        .react-datepicker__day-name {
          color: white;
          fontWeight: 600;
        }
        
        .react-datepicker__day--selected {
          backgroundColor: #FF6B35 !important;
          color: white !important;
          borderRadius: 6px;
        }
        
        .react-datepicker__day:hover {
          backgroundColor: #FF8E53 !important;
          color: white !important;
          borderRadius: 6px;
        }
        
        .react-datepicker__navigation {
          top: 16px;
        }
        
        .react-datepicker__navigation-icon::before {
          borderColor: white;
          borderWidth: 2px 2px 0 0;
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
            
            {/* Botón de retroceso */}
            <div style={{
              alignSelf: "flex-start",
              marginBottom: "20px"
            }}>
              <button
                onClick={handleCancelar}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "none",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  color: "#64748b",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FF6B35";
                  e.currentTarget.style.color = "#FF6B35";
                  e.currentTarget.style.background = "rgba(255, 107, 53, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.background = "none";
                }}
              >
                <span style={{ fontSize: "18px" }}>←</span>
                Volver al perfil
              </button>
            </div>
            
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#FF6B35",
              marginBottom: "6px",
              fontWeight: "500"
            }}>
              Editando Perfil de Vendedor
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px",
              fontWeight: "800",
              color: "#FF6B35",
              margin: "0 0 16px 0",
              letterSpacing: "-1px",
              lineHeight: "1.1"
            }}>🏪 {perfil.nombre} {perfil.apellido}</h1>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)",
                padding: "12px 24px",
                borderRadius: "50px",
                border: "2px solid rgba(255, 107, 53, 0.3)",
                boxShadow: "0 4px 15px rgba(255, 107, 53, 0.2)"
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #FF6B35 30%, #FF8E53 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px rgba(255, 107, 53, 0.5)"
                }}>
                  <span style={{ 
                    color: "white", 
                    fontSize: "18px",
                    fontWeight: "bold"
                  }}>✏️</span>
                </div>
                <span style={{
                  fontSize: "16px",
                  color: "#FF6B35",
                  fontWeight: "700",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Editando información comercial
                </span>
              </div>
            </div>
            
            <p style={{
              color: "#64748b",
              fontSize: "16px",
              margin: "14px auto 0 auto",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontWeight: "400",
              fontFamily: "'Inter', sans-serif",
              opacity: 0.8,
              background: "rgba(255, 107, 53, 0.05)",
              padding: "14px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 107, 53, 0.1)"
            }}>
              Actualiza tu información personal y de contacto para tu negocio en MercadoLocal
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
            animation: "fadeIn 0.3s ease"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "16px",
              backgroundColor: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ color: "white", fontSize: "16px" }}>❌</span>
            </div>
            <span style={{ color: "#DC2626", fontWeight: "600" }}>{error}</span>
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
            animation: "fadeIn 0.3s ease"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "16px",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ color: "white", fontSize: "16px" }}>✅</span>
            </div>
            <div>
              <span style={{ color: "#065F46", fontWeight: "600", display: "block" }}>
                ¡Perfil de vendedor actualizado correctamente!
              </span>
              <span style={{ color: "#047857", fontSize: "14px" }}>
                Redirigiendo al perfil...
              </span>
            </div>
          </div>
        )}

        {/* SECCIÓN 1: DATOS PERSONALES (igual que en móvil) */}
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
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
            }}>
              <span style={{ 
                fontSize: "24px", 
                color: "white"
              }}>👤</span>
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: "800",
                color: "#2C3E50",
                margin: "0 0 6px 0"
              }}>
                Datos Personales
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: "14px",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Información del titular
              </p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "24px"
          }}>
            <InputField
              label="Nombre del Titular *"
              value={nombre}
              onChange={setNombre}
              placeholder="Ingresa tu nombre"
              fieldName="nombre"
            />
            
            <InputField
              label="Apellido del Titular *"
              value={apellido}
              onChange={setApellido}
              placeholder="Ingresa tu apellido"
              fieldName="apellido"
            />
          </div>

          {/* Campo de fecha */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: validationErrors.fechaNacimiento ? "#DC2626" : "#64748b",
              fontWeight: "600",
              marginBottom: "8px",
              fontFamily: "'Inter', sans-serif"
            }}>
              Fecha de Nacimiento
            </label>
            <div style={{
              backgroundColor: "white",
              border: `2px solid ${validationErrors.fechaNacimiento ? "#DC2626" : "#e5e7eb"}`,
              borderRadius: "12px",
              overflow: "hidden",
              transition: "all 0.3s ease"
            }}>
              <DatePicker
                selected={fechaNacimiento}
                onChange={(date) => {
                  setFechaNacimiento(date);
                  if (validationErrors.fechaNacimiento) {
                    const newErrors = { ...validationErrors };
                    delete newErrors.fechaNacimiento;
                    setValidationErrors(newErrors);
                  }
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona tu fecha de nacimiento"
                maxDate={new Date()}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={50}
                wrapperClassName="date-picker"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "15px",
                  color: "#1e293b",
                  fontWeight: "500",
                  fontFamily: "'Inter', sans-serif",
                  border: "none",
                  outline: "none",
                  cursor: "pointer"
                }}
              />
            </div>
            {fechaNacimiento && (
              <div style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "6px",
                fontStyle: "italic"
              }}>
                Fecha seleccionada: {formatFechaDisplay(fechaNacimiento)}
              </div>
            )}
            {validationErrors.fechaNacimiento && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "6px",
                color: "#DC2626",
                fontSize: "12px",
                fontWeight: "500"
              }}>
                <span>⚠️</span>
                <span>{validationErrors.fechaNacimiento}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DE LA EMPRESA (igual que en móvil) */}
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
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #3498DB 0%, #1D4ED8 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 6px 20px rgba(52, 152, 219, 0.3)"
            }}>
              <span style={{ 
                fontSize: "24px", 
                color: "white"
              }}>🏢</span>
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: "800",
                color: "#2C3E50",
                margin: "0 0 6px 0"
              }}>
                Datos de la Empresa
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: "14px",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Información comercial
              </p>
            </div>
          </div>

          {/* Campos bloqueados (igual que en móvil) */}
          <LockedField
            label="Nombre de la Empresa"
            value={perfil.nombreEmpresa}
          />
          
          <LockedField
            label="RUC de la Empresa"
            value={perfil.rucEmpresa}
          />
          
          <LockedField
            label="Correo electrónico"
            value={perfil.correo}
          />

          {/* Campos editables (igual que en móvil) */}
          <InputField
            label="Dirección de la Empresa *"
            value={direccionEmpresa}
            onChange={setDireccionEmpresa}
            placeholder="Ingresa la dirección completa de la empresa"
            isTextArea={true}
            fieldName="direccionEmpresa"
          />

          <InputField
            label="Teléfono de Contacto *"
            value={telefonoEmpresa}
            onChange={setTelefonoEmpresa}
            placeholder="0987654321"
            type="tel"
            fieldName="telefonoEmpresa"
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
          gap: "16px"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "28px",
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "12px",
              boxShadow: "0 8px 25px rgba(255, 107, 53, 0.4)"
            }}>
              <span style={{ 
                fontSize: "28px", 
                color: "white"
              }}>💾</span>
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px",
              fontWeight: "800",
              color: "#2C3E50",
              margin: "0"
            }}>
              Guardar Cambios
            </h3>
            <p style={{
              color: "#64748b",
              fontSize: "14px",
              textAlign: "center",
              margin: "0",
              maxWidth: "500px",
              lineHeight: "1.6"
            }}>
              Una vez que hayas realizado todos los cambios, presiona el botón para guardar
            </p>
          </div>

          <div style={{
            display: "flex",
            gap: "16px",
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

          <div style={{
            fontSize: "12px",
            color: "#94a3b8",
            textAlign: "center",
            marginTop: "12px",
            fontStyle: "italic"
          }}>
            * Campos requeridos
          </div>

          {saving && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "16px",
              padding: "12px 20px",
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
                fontWeight: "600"
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