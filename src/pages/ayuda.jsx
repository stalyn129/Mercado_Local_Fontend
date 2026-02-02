import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Ayuda() {
  const navigate = useNavigate();
  const [circlePositions, setCirclePositions] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

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
    { id: 1, title: "Preguntas Frecuentes", icon: "❓" },
    { id: 2, title: "Para Consumidores", icon: "🛒" },
    { id: 3, title: "Para Productores", icon: "👨‍🌾" },
    { id: 4, title: "Contactar Soporte", icon: "📞" }
  ];

  const faqs = [
    {
      id: 1,
      question: "¿Cómo me registro en MercadoLocal-IA?",
      answer: "Haz clic en 'Registrarse' en la esquina superior derecha. Selecciona si eres 'Consumidor' o 'Productor', completa el formulario con tus datos y verifica tu email.",
      category: "general",
      icon: "👤"
    },
    {
      id: 2,
      question: "¿Qué productos puedo vender como productor?",
      answer: "Productos agrícolas locales: verduras, frutas, carnes, pescados, mariscos, huevos y productos artesanales.",
      category: "productor",
      icon: "🥬"
    },
    {
      id: 3,
      question: "¿Cómo funciona el módulo de IA?",
      answer: "Analiza datos de mercado para sugerir precios óptimos y predecir demanda basándose en tendencias y datos históricos.",
      category: "ia",
      icon: "🤖"
    },
    {
      id: 4,
      question: "¿Cómo realizo un pedido como consumidor?",
      answer: "1. Busca productos 2. Agrega al carrito 3. Selecciona método de pago 4. Confirma pedido. Recibirás confirmación por email.",
      category: "consumidor",
      icon: "🛒"
    }
  ];

  const contactMethods = [
    {
      method: "Email",
      details: "soporte@mercadolocalia.com",
      icon: "✉️",
      color: "#FF6B35",
      action: "mailto:soporte@mercadolocalia.com"
    },
    {
      method: "WhatsApp",
      details: "+593 993 365 084",
      icon: "💬",
      color: "#25D366",
      action: "https://wa.me/593993365084"
    },
    {
      method: "Teléfono",
      details: "+593 993 365 084",
      icon: "📞",
      color: "#3B82F6",
      action: "tel:+593993365084"
    }
  ];

  const horariosAtencion = [
    { dias: "Lunes a Viernes", horas: "9:00 AM - 18:00 PM", icon: "🏢" },
    { dias: "Sábados", horas: "9:00 AM - 14:00 PM", icon: "🌤️" },
    { dias: "Domingos", horas: "Cerrado", icon: "🏖️" }
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const consumerFeatures = [
    { title: "Buscar Productos", icon: "🔍", desc: "Filtra por categoría y ubicación" },
    { title: "Realizar Pedidos", icon: "🛍️", desc: "Proceso simple y seguro" },
    { title: "Calificar", icon: "⭐", desc: "Comparte tu experiencia" }
  ];

  const producerFeatures = [
    { title: "Dashboard", icon: "📊", desc: "Vista general de ventas" },
    { title: "Gestión", icon: "📦", desc: "Control de inventario" },
    { title: "Análisis", icon: "📈", desc: "Reportes y tendencias" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* HEADER CON FONDO DE CÍRCULOS ANIMADOS (SOLO ESTO CAMBIADO) */}
      <div style={{
        background: "white", // Cambiado de gradient naranja a blanco
        padding: "80px 20px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        
        {/* CÍRCULOS ANIMADOS DE FONDO */}
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
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "800",
            color: "#FF6B35", // Cambiado de blanco a naranja para que se vea
            margin: "0 0 16px 0",
            letterSpacing: "-0.5px"
          }}>
            Centro de Ayuda
          </h1>
          
          <p style={{
            color: "#64748b", // Cambiado de blanco a gris para que se vea
            fontSize: "18px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6"
          }}>
            Encuentra respuestas rápidas y soluciones para usar MercadoLocal-IA
          </p>
        </div>
      </div>

      {/* TODO LO DEMÁS EXACTAMENTE IGUAL QUE ANTES */}
      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "-40px auto 60px auto",
        padding: "0 20px",
        position: "relative"
      }}>
        
        {/* MENÚ LATERAL COMPACTO */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
          marginBottom: "40px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  background: activeSection === section.id ? "#FFF2E8" : "#f8f9fa",
                  border: "none",
                  padding: "18px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  transition: "all 0.3s ease",
                  color: activeSection === section.id ? "#FF6B35" : "#64748b",
                  fontWeight: "600",
                  fontSize: "16px"
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
                <span style={{ fontSize: "22px" }}>{section.icon}</span>
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* SECCIÓN 1 - Preguntas Frecuentes */}
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
                ❓
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Preguntas Frecuentes
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Respuestas rápidas a las dudas más comunes
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px"
            }}>
              {faqs.map(faq => (
                <div
                  key={faq.id}
                  style={{
                    background: expandedFAQ === faq.id ? "#FFF2E8" : "#f8f9fa",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    height: expandedFAQ === faq.id ? "auto" : "auto",
                    minHeight: "100px"
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    style={{
                      width: "100%",
                      padding: "20px",
                      background: "none",
                      border: "none",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "15px",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div style={{
                      background: expandedFAQ === faq.id ? "#FF6B35" : "#e5e7eb",
                      color: expandedFAQ === faq.id ? "white" : "#64748b",
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px"
                    }}>
                      {faq.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        margin: "0 0 5px 0"
                      }}>
                        {faq.question}
                      </h3>
                      <div style={{
                        fontSize: "12px",
                        color: "#FF6B35",
                        fontWeight: "600"
                      }}>
                        {faq.category === "general" && "General"}
                        {faq.category === "productor" && "Productor"}
                        {faq.category === "consumidor" && "Consumidor"}
                        {faq.category === "ia" && "Inteligencia Artificial"}
                      </div>
                    </div>
                    <div style={{
                      color: "#FF6B35",
                      fontSize: "12px",
                      transform: expandedFAQ === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease"
                    }}>
                      ▼
                    </div>
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div style={{
                      padding: "0 20px 20px 75px",
                      borderTop: "1px solid rgba(255, 107, 53, 0.1)"
                    }}>
                      <p style={{
                        fontSize: "14px",
                        color: "#4A5568",
                        lineHeight: "1.6",
                        margin: "0"
                      }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN 2 - Para Consumidores */}
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
                background: "#3B82F6",
                color: "white",
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                🛒
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Para Consumidores
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Guía rápida para comprar productos locales
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginBottom: "30px"
            }}>
              {consumerFeatures.map((feature, index) => (
                <div
                  key={index}
                  style={{
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    fontSize: "40px",
                    marginBottom: "15px",
                    color: "#3B82F6"
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "10px"
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{
              background: "#EFF6FF",
              padding: "25px",
              borderRadius: "12px",
              borderLeft: "4px solid #3B82F6"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px", color: "#3B82F6" }}>📱</span>
                <h4 style={{ margin: "0", color: "#1E40AF", fontSize: "18px", fontWeight: "600" }}>
                  App Móvil Disponible
                </h4>
              </div>
              <p style={{ margin: "0", color: "#1E40AF", fontSize: "14px", lineHeight: "1.5" }}>
                Descarga nuestra app para realizar pedidos desde cualquier lugar
              </p>
            </div>
          </div>
        )}

        {/* SECCIÓN 3 - Para Productores */}
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
                background: "#10B981",
                color: "white",
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                👨‍🌾
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Para Productores
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Herramientas para vender tus productos
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginBottom: "30px"
            }}>
              {producerFeatures.map((feature, index) => (
                <div
                  key={index}
                  style={{
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
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    fontSize: "40px",
                    marginBottom: "15px",
                    color: "#10B981"
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "10px"
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748b", margin: "0", lineHeight: "1.5" }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{
              background: "#ECFDF5",
              padding: "25px",
              borderRadius: "12px",
              borderLeft: "4px solid #10B981"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "10px" }}>
                <span style={{ fontSize: "24px", color: "#10B981" }}>📱</span>
                <h4 style={{ margin: "0", color: "#065F46", fontSize: "18px", fontWeight: "600" }}>
                  App para Productores
                </h4>
              </div>
              <p style={{ margin: "0", color: "#065F46", fontSize: "14px", lineHeight: "1.5" }}>
                Gestiona tu tienda desde cualquier lugar con nuestra app móvil
              </p>
            </div>
          </div>
        )}

        {/* SECCIÓN 4 - Contactar Soporte */}
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
                📞
              </div>
              <div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 5px 0"
                }}>
                  Contactar Soporte
                </h2>
                <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
                  Contáctanos para cualquier duda o problema
                </p>
              </div>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginBottom: "30px"
            }}>
              {contactMethods.map((method, index) => (
                <a
                  key={index}
                  href={method.action}
                  style={{
                    background: "#f8f9fa",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: "1px solid #e5e7eb",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    height: "100%",
                    minHeight: "180px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                    e.currentTarget.style.background = "#FFF2E8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                >
                  <div style={{
                    fontSize: "40px",
                    marginBottom: "15px"
                  }}>
                    {method.icon}
                  </div>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "8px"
                  }}>
                    {method.method}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748b", margin: "0", fontWeight: "500" }}>
                    {method.details}
                  </p>
                </a>
              ))}
            </div>
            
            {/* HORARIOS DE ATENCIÓN */}
            <div style={{
              background: "#FFFBEB",
              padding: "25px",
              borderRadius: "12px",
              border: "1px solid #FDE68A"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                <span style={{ fontSize: "24px", color: "#F59E0B" }}>⏰</span>
                <h3 style={{ margin: "0", color: "#2C3E50", fontSize: "20px", fontWeight: "600" }}>
                  Horarios de Atención
                </h3>
              </div>
              
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {horariosAtencion.map((horario, index) => (
                  <div 
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "15px",
                      background: "white",
                      borderRadius: "8px",
                      border: "1px solid #FDE68A"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{horario.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#2C3E50" }}>
                        {horario.dias}
                      </span>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>
                      {horario.horas}
                    </span>
                  </div>
                ))}
              </div>
              
              <p style={{
                margin: "15px 0 0 0",
                fontSize: "13px",
                color: "#94a3b8",
                textAlign: "center"
              }}>
                Respuesta por email en menos de 24 horas hábiles
              </p>
            </div>
          </div>
        )}

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
        
        input:focus {
          outline: none;
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