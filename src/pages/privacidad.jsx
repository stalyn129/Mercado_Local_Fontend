import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function Privacidad() {
  const [circlePositions, setCirclePositions] = useState([]);
  const [activeSection, setActiveSection] = useState(null);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",
        "rgba(52, 211, 153, 0.15)",
        "rgba(59, 130, 246, 0.15)",
        "rgba(168, 85, 247, 0.15)"
      ];
      
      for (let i = 0; i < 8; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 4 + 2 + "px"
        });
      }
      setCirclePositions(circles);
    };

    generateCircles();
  }, []);

  const sections = [
    { id: 1, title: "Información Recopilada", icon: "📊" },
    { id: 2, title: "Uso de Datos", icon: "🤖" },
    { id: 3, title: "Tus Derechos", icon: "👁️" },
    { id: 4, title: "Seguridad", icon: "🔐" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* HEADER CON FONDO DE CÍRCULOS ANIMADOS */}
      <div style={{
        background: "white",
        padding: "80px 20px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        
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
              opacity: 0.6
            }}
          />
        ))}

        <div style={{ position: "relative", zIndex: "10" }}>
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FF6B35",
            marginBottom: "12px",
            fontWeight: "600"
          }}>
            POLÍTICAS Y PRIVACIDAD
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "800",
            color: "#2C3E50",
            margin: "0 0 16px 0",
            letterSpacing: "-0.5px"
          }}>
            Política de Privacidad
          </h1>
          
          <p style={{
            color: "#64748b",
            fontSize: "18px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6"
          }}>
            Tu privacidad es nuestra prioridad en MercadoLocal-IA
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "-40px auto 60px auto",
        padding: "0 20px",
        position: "relative"
      }}>
        
        {/* MENÚ DE NAVEGACIÓN HORIZONTAL */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
          marginBottom: "40px",
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          justifyContent: "center"
        }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                background: activeSection === section.id ? "#FFF2E8" : "#f8f9fa",
                border: "2px solid transparent",
                borderColor: activeSection === section.id ? "#FF6B35" : "transparent",
                padding: "18px 28px",
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                transition: "all 0.3s ease",
                color: activeSection === section.id ? "#FF6B35" : "#64748b",
                fontWeight: "600",
                fontSize: "16px",
                minWidth: "220px",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "#f0f0f0";
                  e.currentTarget.style.color = "#2C3E50";
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = "#f8f9fa";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              <span style={{ fontSize: "24px" }}>{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>

        {/* SECCIÓN 1 - Información Recopilada */}
        {(activeSection === 1 || activeSection === null) && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            marginBottom: "30px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#FF6B35",
                color: "white",
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                📊
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Información Recopilada
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Datos que recopilamos para brindarte el mejor servicio
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                  color: "#FF6B35"
                }}>👤</div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2C3E50",
                  marginBottom: "10px"
                }}>
                  Datos Personales
                </h3>
                <ul style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5", textAlign: "left", paddingLeft: "20px" }}>
                  <li>Nombre y contacto</li>
                  <li>Dirección de entrega</li>
                  <li>Documentación (productores)</li>
                </ul>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                  color: "#8B5CF6"
                }}>🛒</div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2C3E50",
                  marginBottom: "10px"
                }}>
                  Transacciones
                </h3>
                <ul style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5", textAlign: "left", paddingLeft: "20px" }}>
                  <li>Historial de compras</li>
                  <li>Productos vendidos</li>
                  <li>Métodos de pago</li>
                </ul>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                  color: "#10B981"
                }}>📱</div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2C3E50",
                  marginBottom: "10px"
                }}>
                  Uso de la Plataforma
                </h3>
                <ul style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5", textAlign: "left", paddingLeft: "20px" }}>
                  <li>Búsquedas realizadas</li>
                  <li>Interacciones con la IA</li>
                  <li>Dispositivo y navegador</li>
                </ul>
              </div>
            </div>
            
            <div style={{
              background: "#FFF2E8",
              padding: "25px",
              borderRadius: "12px",
              borderLeft: "4px solid #FF6B35"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px", color: "#FF6B35" }}>📍</span>
                <h4 style={{ margin: "0", color: "#92400E", fontSize: "18px", fontWeight: "600" }}>
                  Ubicación (Opcional)
                </h4>
              </div>
              <p style={{ margin: "0", color: "#92400E", fontSize: "14px", lineHeight: "1.5" }}>
                Solo recopilamos ubicación con tu permiso explícito para conectarte con productores locales cercanos.
              </p>
            </div>
          </div>
        )}

        {/* SECCIÓN 2 - Uso de Datos */}
        {(activeSection === 2 || activeSection === null) && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            marginBottom: "30px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#8B5CF6",
                color: "white",
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                🤖
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Uso de Tus Datos
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Cómo utilizamos tu información para mejorar tu experiencia
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderTop: "4px solid #FF6B35",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "15px", color: "#FF6B35" }}>🛒</div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#2C3E50", marginBottom: "10px" }}>
                  Procesar Operaciones
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                  Gestionar pedidos, entregas y pagos entre productores y consumidores
                </p>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderTop: "4px solid #8B5CF6",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "15px", color: "#8B5CF6" }}>📈</div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#2C3E50", marginBottom: "10px" }}>
                  Inteligencia Artificial
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                  Entrenar algoritmos para precios óptimos y predicción de demanda
                </p>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderTop: "4px solid #10B981",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "15px", color: "#10B981" }}>📧</div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#2C3E50", marginBottom: "10px" }}>
                  Comunicaciones
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                  Confirmaciones de pedido y actualizaciones importantes del servicio
                </p>
              </div>
            </div>
            
            <div style={{
              background: "#F5F3FF",
              padding: "25px",
              borderRadius: "12px",
              borderLeft: "4px solid #8B5CF6"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px", color: "#8B5CF6" }}>⚠️</span>
                <h4 style={{ margin: "0", color: "#5B21B6", fontSize: "18px", fontWeight: "600" }}>
                  No Vendemos Tus Datos
                </h4>
              </div>
              <p style={{ margin: "0", color: "#5B21B6", fontSize: "14px", lineHeight: "1.5" }}>
                Nunca vendemos tus datos personales. Solo compartimos información necesaria para procesar transacciones.
              </p>
            </div>
          </div>
        )}

        {/* SECCIÓN 3 - Tus Derechos */}
        {(activeSection === 3 || activeSection === null) && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            marginBottom: "30px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#F59E0B",
                color: "white",
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                👁️
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Tus Derechos
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Control completo sobre tu información personal
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px", color: "#FF6B35" }}>👁️</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#2C3E50", marginBottom: "8px" }}>
                  Acceso
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  Ver qué datos tenemos sobre ti
                </p>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px", color: "#8B5CF6" }}>✏️</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#2C3E50", marginBottom: "8px" }}>
                  Rectificación
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  Corregir información inexacta
                </p>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px", color: "#EF4444" }}>🗑️</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#2C3E50", marginBottom: "8px" }}>
                  Eliminación
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  Borrar tu cuenta y datos
                </p>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px", color: "#10B981" }}>⏸️</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#2C3E50", marginBottom: "8px" }}>
                  Oposición
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  Oponerte al tratamiento
                </p>
              </div>
            </div>
            
            <div style={{
              background: "#ECFDF5",
              padding: "25px",
              borderRadius: "12px",
              borderLeft: "4px solid #10B981"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px", color: "#10B981" }}>📞</span>
                <h4 style={{ margin: "0", color: "#065F46", fontSize: "18px", fontWeight: "600" }}>
                  Ejercer Tus Derechos
                </h4>
              </div>
              <p style={{ margin: "0", color: "#065F46", fontSize: "14px", lineHeight: "1.5" }}>
                Contacta a nuestro Delegado de Protección de Datos: 
                <strong> privacy@mercadolocalia.com</strong>
                <br />
                Te responderemos en máximo 30 días.
              </p>
            </div>
          </div>
        )}

        {/* SECCIÓN 4 - Seguridad */}
        {(activeSection === 4 || activeSection === null) && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            marginBottom: "30px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#EF4444",
                color: "white",
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                🔐
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Seguridad de Datos
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Protegemos tu información con las mejores prácticas
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginBottom: "30px"
            }}>
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                  color: "#10B981"
                }}>🔐</div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2C3E50",
                  marginBottom: "10px"
                }}>
                  Encriptación SSL/TLS
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                  Todos los datos en tránsito están protegidos
                </p>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                  color: "#3B82F6"
                }}>🛡️</div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2C3E50",
                  marginBottom: "10px"
                }}>
                  Protección Avanzada
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                  Firewalls y autenticación robusta
                </p>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
                height: "100%",
                minHeight: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}>
                <div style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                  color: "#F59E0B"
                }}>📋</div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2C3E50",
                  marginBottom: "10px"
                }}>
                  Auditorías Regulares
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                  Revisiones periódicas de seguridad
                </p>
              </div>
            </div>
            
            <div style={{
              background: "#FEE2E2",
              padding: "25px",
              borderRadius: "12px",
              border: "1px solid #FECACA"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px", color: "#EF4444" }}>⚠️</span>
                <h4 style={{ margin: "0", color: "#7F1D1D", fontSize: "18px", fontWeight: "600" }}>
                  Limitación de Responsabilidad
                </h4>
              </div>
              <p style={{ margin: "0", color: "#7F1D1D", fontSize: "14px", lineHeight: "1.5" }}>
                Aunque implementamos las mejores prácticas, ningún sistema es 100% seguro. 
                No somos responsables por filtraciones fuera de nuestro control.
              </p>
            </div>
          </div>
        )}

        {/* INFORMACIÓN DE CONTACTO */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "20px", color: "#FF6B35" }}>
            📧
          </div>
          <h3 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#2C3E50",
            marginBottom: "15px"
          }}>
            ¿Tienes Preguntas sobre Privacidad?
          </h3>
          <p style={{
            color: "#64748b",
            fontSize: "16px",
            marginBottom: "25px",
            maxWidth: "600px",
            margin: "0 auto 25px auto",
            lineHeight: "1.6"
          }}>
            Contacta a nuestro Delegado de Protección de Datos para cualquier consulta sobre tu información personal.
          </p>
          
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}>
            <a 
              href="mailto:privacy@mercadolocalia.com" 
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "#FF6B35",
                color: "white",
                padding: "16px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FF8E53";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FF6B35";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span>✉️</span>
              privacy@mercadolocalia.com
            </a>
            
            <div style={{
              fontSize: "14px",
              color: "#94a3b8",
              paddingTop: "15px",
              borderTop: "1px solid #e5e7eb"
            }}>
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes floatCircle {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          33% { 
            transform: translate(15px, -20px) scale(1.05); 
          }
          66% { 
            transform: translate(-10px, 15px) scale(0.95); 
          }
        }
        
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
          
          div[style*="padding: 40px"] {
            padding: 25px !important;
          }
          
          div[style*="min-width: 220px"] {
            min-width: 100% !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        a {
          text-decoration: none;
        }
        
        button {
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        
        button:hover {
          opacity: 0.9;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #FF6B35;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #FF8E53;
        }
      `}</style>
    </div>
  );
}