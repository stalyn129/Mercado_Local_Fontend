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
        "rgba(168, 85, 247, 0.15)",
        "rgba(239, 68, 68, 0.15)",
        "rgba(245, 158, 11, 0.15)",
        "rgba(14, 165, 233, 0.15)",
        "rgba(236, 72, 153, 0.15)"
      ];
      
      for (let i = 0; i < 12; i++) {
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

  const sections = [
    { id: 1, title: "Información Recopilada", icon: "📊" },
    { id: 2, title: "Uso de la Información", icon: "🤖" },
    { id: 3, title: "Compartir Información", icon: "🤝" },
    { id: 4, title: "Tus Derechos", icon: "👁️" },
    { id: 5, title: "Seguridad", icon: "🔐" },
    { id: 6, title: "Cookies", icon: "🍪" },
    { id: 7, title: "Menores de Edad", icon: "👶" },
    { id: 8, title: "Cambios", icon: "🔄" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* HEADER BLANCO CON CÍRCULOS DE COLORES */}
      <div style={{
        background: "white",
        padding: "90px 20px 70px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "40px",
        borderBottom: "1px solid #f1f5f9"
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
              opacity: 0.8,
              zIndex: circle.zIndex
            }}
          />
        ))}

        <div style={{ 
          position: "relative", 
          zIndex: "10",
          padding: "0 15px"
        }}>
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FF6B35",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Políticas y Privacidad
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "700",
            color: "#FF6B35",
            margin: "0 0 16px 0",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Política de Privacidad
          </h1>
          
          <p style={{
            color: "#8B5CF6",
            fontSize: "16px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6",
            fontWeight: "400",
            fontFamily: "'Inter', sans-serif",
            opacity: 0.8
          }}>
            Tu privacidad es nuestra prioridad en MercadoLocal-IA
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 60px auto",
        padding: "0 20px",
        display: "flex",
        gap: "30px"
      }}>
        
        {/* MENÚ LATERAL */}
        <div style={{
          flex: "0 0 300px",
          position: "sticky",
          top: "30px",
          alignSelf: "flex-start"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#2C3E50",
              marginBottom: "20px",
              paddingBottom: "15px",
              borderBottom: "2px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "24px" }}>📑</span>
              Secciones
            </div>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    background: activeSection === section.id ? "#FFF2E8" : "transparent",
                    border: "none",
                    padding: "15px",
                    borderRadius: "12px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.3s ease",
                    color: activeSection === section.id ? "#FF6B35" : "#64748b",
                    fontWeight: activeSection === section.id ? "600" : "500",
                    fontSize: "15px"
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.background = "#f8f9fa";
                      e.currentTarget.style.color = "#2C3E50";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </div>
            
            <div style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: "2px solid #f1f5f9"
            }}>
              <div style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "10px"
              }}>
                Última actualización:
              </div>
              <div style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#2C3E50",
                background: "#f8f9fa",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div style={{
              marginTop: "20px",
              padding: "20px",
              background: "#FFFBEB",
              borderRadius: "12px",
              border: "1px solid #FDE68A"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px"
              }}>
                <span style={{ fontSize: "20px", color: "#F59E0B" }}>⚠️</span>
                <span style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#92400E"
                }}>
                  Resumen Rápido
                </span>
              </div>
              <p style={{
                fontSize: "13px",
                color: "#92400E",
                margin: "0",
                lineHeight: "1.5"
              }}>
                Protegemos tus datos, no los vendemos, y te damos control total sobre tu información.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ flex: "1" }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "50px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            color: "#2C3E50"
          }}>
            
            {/* INTRODUCCIÓN */}
            <div style={{
              background: "linear-gradient(135deg, #FFF2E8 0%, #EBF5FB 100%)",
              padding: "30px",
              borderRadius: "16px",
              marginBottom: "40px",
              borderLeft: "6px solid #FF6B35"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "15px"
              }}>
                <div style={{
                  background: "#FF6B35",
                  color: "white",
                  width: "60px",
                  height: "60px",
                  borderRadius: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px"
                }}>
                  🔒
                </div>
                <div>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#2C3E50",
                    margin: "0 0 5px 0"
                  }}>
                    Nuestro Compromiso
                  </h2>
                  <p style={{
                    color: "#64748b",
                    margin: "0",
                    fontSize: "16px"
                  }}>
                    Transparencia y Protección de Datos
                  </p>
                </div>
              </div>
              <p style={{
                fontSize: "16px",
                lineHeight: "1.8",
                color: "#4A5568"
              }}>
                En <strong style={{ color: "#FF6B35" }}>MercadoLocal-IA</strong>, tu privacidad es fundamental. 
                Esta política explica cómo recopilamos, usamos, compartimos y protegemos tu información 
                cuando usas nuestra plataforma para conectar productores locales con consumidores.
              </p>
            </div>

            {/* SECCIÓN 1 - Información Recopilada */}
            <div id="seccion1" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#FF6B35",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  1
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Información que Recopilamos
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderLeft: "4px solid #FF6B35"
              }}>
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#4A5568",
                  marginBottom: "15px"
                }}>
                  Recopilamos diferentes tipos de información según tu interacción con MercadoLocal-IA:
                </p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginTop: "20px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#FF6B35"
                    }}>👤</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Datos Personales</h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#64748b" }}>
                      <li>Nombre completo</li>
                      <li>Email y teléfono</li>
                      <li>Dirección de entrega</li>
                      <li>Documentación (productores)</li>
                    </ul>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#8B5CF6"
                    }}>🛒</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Transacciones</h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#64748b" }}>
                      <li>Historial de compras</li>
                      <li>Productos vendidos</li>
                      <li>Métodos de pago</li>
                      <li>Direcciones de entrega</li>
                    </ul>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#10B981"
                    }}>📊</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Datos de Uso</h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#64748b" }}>
                      <li>Búsquedas realizadas</li>
                      <li>Productos vistos</li>
                      <li>Interacciones con la IA</li>
                      <li>Dispositivo y navegador</li>
                    </ul>
                  </div>
                </div>
                
                <div style={{
                  marginTop: "25px",
                  padding: "20px",
                  background: "#FFF2E8",
                  borderRadius: "12px",
                  border: "1px solid #FFD9C8"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "24px", color: "#FF6B35" }}>📍</span>
                    <h4 style={{
                      margin: "0",
                      color: "#92400E",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      Ubicación (Opcional)
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#92400E",
                    fontSize: "15px",
                    lineHeight: "1.6"
                  }}>
                    Solo recopilamos datos de ubicación si das permiso explícito, para conectarte 
                    con productores locales cercanos y mejorar recomendaciones.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2 - Uso de la Información */}
            <div id="seccion2" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#8B5CF6",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  2
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Cómo Usamos Tu Información
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderLeft: "4px solid #8B5CF6"
              }}>
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#4A5568",
                  marginBottom: "20px"
                }}>
                  Utilizamos tus datos para estos propósitos específicos:
                </p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  marginBottom: "25px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #FF6B35"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "15px"
                    }}>
                      <div style={{
                        background: "#FFF2E8",
                        width: "40px",
                        height: "40px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        color: "#FF6B35"
                      }}>
                        🛒
                      </div>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        margin: "0"
                      }}>
                        Operaciones
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Procesar pedidos, gestionar entregas y facilitar pagos entre productores y consumidores.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #8B5CF6"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "15px"
                    }}>
                      <div style={{
                        background: "#F5F3FF",
                        width: "40px",
                        height: "40px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        color: "#8B5CF6"
                      }}>
                        🤖
                      </div>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        margin: "0"
                      }}>
                        Inteligencia Artificial
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Entrenar nuestros algoritmos para precios óptimos y predicción de demanda (datos anónimos).
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #10B981"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "15px"
                    }}>
                      <div style={{
                        background: "#ECFDF5",
                        width: "40px",
                        height: "40px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        color: "#10B981"
                      }}>
                        📈
                      </div>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        margin: "0"
                      }}>
                        Mejora Continua
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Analizar tendencias del mercado local y optimizar la experiencia para productores y consumidores.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: "#EBF5FB",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #D1E8F9"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "24px", color: "#3498DB" }}>📧</span>
                    <h4 style={{
                      margin: "0",
                      color: "#1E4D8C",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      Comunicaciones
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#1E4D8C",
                    fontSize: "15px",
                    lineHeight: "1.6"
                  }}>
                    Te contactamos solo para: confirmaciones de pedido, actualizaciones importantes del servicio, 
                    y (si das permiso) ofertas relevantes de productores locales. Puedes desuscribirte en cualquier momento.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3 - Compartir Información */}
            <div id="seccion3" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#10B981",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  3
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Compartir Información
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderLeft: "4px solid #10B981"
              }}>
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#4A5568",
                  marginBottom: "20px"
                }}>
                  <strong style={{ color: "#FF6B35" }}>No vendemos tus datos personales.</strong> Solo compartimos información en estas situaciones limitadas:
                </p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "30px",
                  marginBottom: "25px"
                }}>
                  <div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "15px"
                    }}>
                      <div style={{
                        background: "#FF6B35",
                        color: "white",
                        width: "40px",
                        height: "40px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}>
                        🤝
                      </div>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        margin: "0"
                      }}>
                        Con Productores
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Solo la información necesaria para procesar pedidos: nombre, dirección de entrega y datos de contacto.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "15px"
                    }}>
                      <div style={{
                        background: "#8B5CF6",
                        color: "white",
                        width: "40px",
                        height: "40px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}>
                        ⚖️
                      </div>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        margin: "0"
                      }}>
                        Requisitos Legales
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Cuando sea requerido por autoridades competentes o para cumplir con obligaciones legales.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: "#FEF3C7",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #FDE68A"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "24px", color: "#F59E0B" }}>📊</span>
                    <h4 style={{
                      margin: "0",
                      color: "#92400E",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      Datos Anónimos
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#92400E",
                    fontSize: "15px",
                    lineHeight: "1.6"
                  }}>
                    Podemos compartir datos agregados y anónimos para análisis de mercado o investigación académica. 
                    Estos datos <strong>nunca</strong> permiten identificar a personas individuales.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4 - Tus Derechos */}
            <div id="seccion4" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#F59E0B",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  4
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Tus Derechos sobre Tus Datos
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderLeft: "4px solid #F59E0B"
              }}>
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#4A5568",
                  marginBottom: "20px"
                }}>
                  Tienes control completo sobre tu información personal:
                </p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginBottom: "25px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#FF6B35"
                    }}>👁️</div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Acceso</h3>
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                      Ver qué datos tenemos sobre ti
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#8B5CF6"
                    }}>✏️</div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Rectificación</h3>
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                      Corregir información inexacta
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#EF4444"
                    }}>🗑️</div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Eliminación</h3>
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                      Borrar tu cuenta y datos
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#10B981"
                    }}>⏸️</div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Oposición</h3>
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                      Oponerte al tratamiento
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: "#ECFDF5",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #A7F3D0"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "24px", color: "#10B981" }}>📞</span>
                    <h4 style={{
                      margin: "0",
                      color: "#065F46",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      Ejercer Tus Derechos
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#065F46",
                    fontSize: "15px",
                    lineHeight: "1.6"
                  }}>
                    Para ejercer cualquiera de estos derechos, contacta a nuestro Delegado de Protección de Datos:
                    <br />
                    <strong>Email:</strong> <a href="mailto:privacy@mercadolocalia.com" style={{ color: "#FF6B35", textDecoration: "none" }}>privacy@mercadolocalia.com</a>
                    <br />
                    <strong>Respuesta:</strong> Te responderemos en un máximo de 30 días.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5 - Seguridad */}
            <div id="seccion5" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#EF4444",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  5
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Seguridad de Datos
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderLeft: "4px solid #EF4444"
              }}>
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#4A5568",
                  marginBottom: "20px"
                }}>
                  Implementamos medidas técnicas y organizativas para proteger tu información:
                </p>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginBottom: "25px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                      color: "#10B981"
                    }}>🔐</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Encriptación</h3>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                      SSL/TLS para datos en tránsito
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                      color: "#3B82F6"
                    }}>🛡️</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Protección</h3>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                      Firewalls y autenticación robusta
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                      color: "#F59E0B"
                    }}>📋</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Auditorías</h3>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                      Revisiones periódicas de seguridad
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: "#FEE2E2",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #FECACA"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "24px", color: "#EF4444" }}>⚠️</span>
                    <h4 style={{
                      margin: "0",
                      color: "#7F1D1D",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      Limitación de Responsabilidad
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#7F1D1D",
                    fontSize: "15px",
                    lineHeight: "1.6"
                  }}>
                    Aunque implementamos las mejores prácticas de seguridad, ningún sistema es 100% seguro. 
                    No somos responsables por filtraciones de datos causadas por factores fuera de nuestro control.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 6 - Cookies */}
            <div id="seccion6" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#8B5CF6",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  6
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Cookies y Tecnologías Similares
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderLeft: "4px solid #8B5CF6"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "30px",
                  marginBottom: "25px"
                }}>
                  <div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}>
                      <span style={{ color: "#10B981" }}>🍪</span>
                      Cookies Esenciales
                    </h3>
                    <ul style={{
                      paddingLeft: "20px",
                      color: "#4A5568"
                    }}>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Sesión de usuario y autenticación
                      </li>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Carrito de compras
                      </li>
                      <li style={{ fontSize: "16px" }}>
                        Preferencias de seguridad
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}>
                      <span style={{ color: "#FF6B35" }}>📈</span>
                      Cookies Analíticas
                    </h3>
                    <ul style={{
                      paddingLeft: "20px",
                      color: "#4A5568"
                    }}>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Uso de la plataforma (Google Analytics)
                      </li>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Rendimiento y errores
                      </li>
                      <li style={{ fontSize: "16px" }}>
                        Mejoras de experiencia
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div style={{
                  background: "#F5F3FF",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #DDD6FE"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "24px", color: "#8B5CF6" }}>⚙️</span>
                    <h4 style={{
                      margin: "0",
                      color: "#5B21B6",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      Control de Cookies
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#5B21B6",
                    fontSize: "15px",
                    lineHeight: "1.6"
                  }}>
                    Puedes gestionar cookies desde la configuración de tu navegador. 
                    Algunas funcionalidades pueden no estar disponibles si desactivas cookies esenciales.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 7 - Menores de Edad */}
            <div id="seccion7" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#3B82F6",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  7
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Menores de Edad
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "25px",
                borderRadius: "12px",
                borderLeft: "4px solid #3B82F6"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    background: "#DBEAFE",
                    color: "#1E40AF",
                    width: "80px",
                    height: "80px",
                    borderRadius: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "40px"
                  }}>
                    👶
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#1E40AF",
                      margin: "0 0 10px 0"
                    }}>
                      Protección de Menores
                    </h3>
                    <p style={{
                      margin: "0",
                      color: "#1E40AF",
                      fontSize: "16px",
                      lineHeight: "1.6"
                    }}>
                      MercadoLocal-IA no está dirigido a menores de 18 años.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#3B82F6"
                    }}>🔞</div>
                    <h4 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Edad Mínima</h4>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                      Debes tener al menos 18 años para crear una cuenta o 16 con consentimiento parental.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "10px",
                      color: "#EF4444"
                    }}>👨‍👩‍👧‍👦</div>
                    <h4 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px"
                    }}>Consentimiento Parental</h4>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>
                      Para menores entre 16-18 años, requerimos autorización de padres o tutores.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 8 - Cambios */}
            <div id="seccion8" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                paddingBottom: "15px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div style={{
                  background: "#FF6B35",
                  color: "white",
                  minWidth: "50px",
                  height: "50px",
                  borderRadius: "25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700"
                }}>
                  8
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Cambios en esta Política
                </h2>
              </div>
              
              <div style={{
                background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                color: "white",
                padding: "30px",
                borderRadius: "16px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "48px",
                  marginBottom: "20px"
                }}>
                  🔄
                </div>
                
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "15px"
                }}>
                  Actualizaciones Periódicas
                </h3>
                
                <p style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  marginBottom: "20px",
                  opacity: 0.95
                }}>
                  Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras prácticas 
                  o por otros motivos operativos, legales o regulatorios.
                </p>
                
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "15px",
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "15px 25px",
                  borderRadius: "50px",
                  backdropFilter: "blur(10px)"
                }}>
                  <span style={{ fontSize: "20px" }}>📅</span>
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>ÚLTIMA ACTUALIZACIÓN</div>
                    <div style={{ fontSize: "18px", fontWeight: "700" }}>
                      {new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  marginTop: "25px",
                  padding: "20px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "20px" }}>📢</span>
                    <h4 style={{
                      margin: "0",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      Notificación de Cambios
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    opacity: 0.9
                  }}>
                    Te notificaremos sobre cambios significativos mediante un aviso prominente en nuestra plataforma 
                    o por correo electrónico. El uso continuado después de los cambios constituye aceptación de la nueva política.
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACTO FINAL */}
            <div style={{
              textAlign: "center",
              padding: "40px",
              background: "#f8f9fa",
              borderRadius: "16px",
              marginTop: "40px",
              border: "2px solid #e5e7eb"
            }}>
              <div style={{
                fontSize: "48px",
                marginBottom: "20px",
                color: "#FF6B35"
              }}>
                📧
              </div>
              
              <h3 style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#2C3E50",
                marginBottom: "15px"
              }}>
                ¿Tienes Preguntas?
              </h3>
              
              <p style={{
                fontSize: "16px",
                color: "#64748b",
                marginBottom: "30px",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: "1.6"
              }}>
                Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos personales, 
                no dudes en contactarnos.
              </p>
              
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                flexWrap: "wrap"
              }}>
                <a 
                  href="mailto:privacy@mercadolocalia.com" 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#FF6B35",
                    color: "white",
                    padding: "16px 32px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "16px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FF8E53";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#FF6B35";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>✉️</span>
                  Contactar al DPO
                </a>
                
                <a 
                  href="tel:+593993365084" 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#3B82F6",
                    color: "white",
                    padding: "16px 32px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "16px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#60A5FA";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#3B82F6";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>📞</span>
                  Llamar a Soporte
                </a>
              </div>
              
              <div style={{
                marginTop: "30px",
                fontSize: "14px",
                color: "#94a3b8",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb"
              }}>
                MercadoLocal-IA • Plataforma para la Optimización del Comercio de Productores Locales
                <br />
                <span style={{ fontSize: "12px" }}>Cuenca, Ecuador</span>
              </div>
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
          20% { 
            transform: translate(20px, -25px) scale(1.08); 
          }
          40% { 
            transform: translate(-15px, 20px) scale(0.92); 
          }
          60% { 
            transform: translate(10px, 15px) scale(1.05); 
          }
          80% { 
            transform: translate(-20px, -15px) scale(0.98); 
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 36px !important;
          }
          
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="display: flex"]:not([style*="position: sticky"]) {
            flex-direction: column !important;
          }
          
          div[style*="flex: 0 0 300px"] {
            flex: 1 !important;
            position: static !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        button {
          cursor: pointer;
        }
        
        ul {
          margin: 0;
          padding: 0;
        }
        
        li {
          list-style-type: none;
          position: relative;
        }
        
        li:before {
          content: "•";
          color: #FF6B35;
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }
      `}</style>
    </div>
  );
}