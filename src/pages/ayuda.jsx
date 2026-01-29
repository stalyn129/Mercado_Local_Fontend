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
    { id: 1, title: "Preguntas Frecuentes", icon: "❓" },
    { id: 2, title: "Para Consumidores", icon: "🛒" },
    { id: 3, title: "Para Productores", icon: "👨‍🌾" },
    { id: 4, title: "Contactar Soporte", icon: "📞" },
    { id: 5, title: "Recursos", icon: "📚" },
    { id: 6, title: "Inteligencia Artificial", icon: "🤖" },
    { id: 7, title: "Problemas Comunes", icon: "🔧" },
    { id: 8, title: "Seguridad", icon: "🔒" }
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
      answer: "Productos agrícolas locales: verduras, frutas, carnes, pescados, mariscos, huevos, productos artesanales y del campo. Prohibidos: productos ilegales o falsificados.",
      category: "productor",
      icon: "🥬"
    },
    {
      id: 3,
      question: "¿Cómo funciona el módulo de Inteligencia Artificial?",
      answer: "Analiza datos de mercado para sugerir precios ópticos y predecir demanda. Las recomendaciones se basan en tendencias, estacionalidad y datos históricos.",
      category: "ia",
      icon: "🤖"
    },
    {
      id: 4,
      question: "¿Cómo realizo un pedido como consumidor?",
      answer: "1. Busca productos en el catálogo. 2. Agrega al carrito. 3. Ve a 'Carrito'. 4. Selecciona método de pago. 5. Confirma pedido. Recibirás confirmación por email.",
      category: "consumidor",
      icon: "🛒"
    },
    {
      id: 5,
      question: "¿Cómo agrego nuevos productos a mi tienda?",
      answer: "En tu dashboard de productor: 1. Ve a 'Gestión de Productos'. 2. Haz clic en 'Agregar Producto'. 3. Completa todos los campos. 4. Sube imágenes. 5. Guarda cambios.",
      category: "productor",
      icon: "📦"
    },
    {
      id: 6,
      question: "¿Qué significan los colores del badge de stock?",
      answer: "✅ Verde: Stock alto (>10 unidades) ⚡ Amarillo: Stock bajo (1-10 unidades) ❌ Rojo: Sin stock. Esto ayuda a gestionar inventario eficientemente.",
      category: "productor",
      icon: "🏷️"
    },
    {
      id: 7,
      question: "¿Cómo contacto al vendedor?",
      answer: "En la página del producto, haz clic en 'Ver perfil del productor'. Allí encontrarás información de contacto y podrás enviar mensajes directos.",
      category: "consumidor",
      icon: "💬"
    },
    {
      id: 8,
      question: "¿Qué hacer si no recibo mi pedido?",
      answer: "1. Revisa el estado en 'Mis Pedidos'. 2. Contacta al productor. 3. Si no hay respuesta en 48h, contacta a soporte@mercadolocalia.com.",
      category: "consumidor",
      icon: "🚚"
    }
  ];

  const recursos = [
    {
      title: "Guía del Productor",
      description: "Manual completo para maximizar tus ventas",
      icon: "📖",
      color: "#FF6B35",
      url: "/guia-productor.pdf"
    },
    {
      title: "Video Tutoriales",
      description: "Aprende visualmente paso a paso",
      icon: "🎥",
      color: "#8B5CF6",
      url: "/tutoriales"
    },
    {
      title: "Calculadora de Precios",
      description: "Herramienta para fijar precios competitivos",
      icon: "🧮",
      color: "#10B981",
      url: "/calculadora"
    },
    {
      title: "Plantillas de Productos",
      description: "Descripciones optimizadas para tu tienda",
      icon: "📝",
      color: "#3B82F6",
      url: "/plantillas"
    }
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

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
    },
    {
      method: "Chat en Vivo",
      details: "Disponible 9AM-6PM",
      icon: "💻",
      color: "#8B5CF6",
      action: "#chat"
    }
  ];

  const horariosAtencion = [
    { dias: "Lunes a Viernes", horas: "9:00 AM - 18:00 PM", icon: "🏢" },
    { dias: "Sábados", horas: "9:00 AM - 14:00 PM", icon: "🌤️" },
    { dias: "Domingos", horas: "Cerrado", icon: "🏖️" }
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
            Centro de Soporte
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
            Centro de Ayuda
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
            Encuentra respuestas y recursos para sacar el máximo provecho de MercadoLocal-IA
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
              Navegación Rápida
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
            
            {/* BUSCADOR DE AYUDA */}
            <div style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: "2px solid #f1f5f9"
            }}>
              <div style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#2C3E50",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "20px" }}>🔍</span>
                Buscar en Ayuda
              </div>
              
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Escribe tu pregunta..."
                  style={{
                    width: "100%",
                    padding: "14px 20px 14px 45px",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    fontSize: "15px",
                    color: "#2C3E50",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                    outline: "none",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF6B35";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                  color: "#94a3b8"
                }}>
                  🔍
                </div>
              </div>
            </div>
            
            {/* CONTACTO RÁPIDO */}
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
                <span style={{ fontSize: "20px", color: "#F59E0B" }}>🚨</span>
                <span style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#92400E"
                }}>
                  ¿Necesitas ayuda urgente?
                </span>
              </div>
              <p style={{
                fontSize: "13px",
                color: "#92400E",
                margin: "0",
                lineHeight: "1.5"
              }}>
                Llámanos al +593 993 365 084 o escribe a soporte@mercadolocalia.com
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
                  💡
                </div>
                <div>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#2C3E50",
                    margin: "0 0 5px 0"
                  }}>
                    ¿Cómo podemos ayudarte?
                  </h2>
                  <p style={{
                    color: "#64748b",
                    margin: "0",
                    fontSize: "16px"
                  }}>
                    Guías, tutoriales y soporte para productores y consumidores
                  </p>
                </div>
              </div>
              <p style={{
                fontSize: "16px",
                lineHeight: "1.8",
                color: "#4A5568"
              }}>
                En <strong style={{ color: "#FF6B35" }}>MercadoLocal-IA</strong>, estamos comprometidos con el éxito de 
                productores locales y la satisfacción de consumidores. Aquí encontrarás todo lo necesario 
                para usar nuestra plataforma de manera efectiva.
              </p>
            </div>

            {/* SECCIÓN 1 - Preguntas Frecuentes */}
            <div id="seccion1" style={{ marginBottom: "50px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  ❓
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Preguntas Frecuentes
                </h2>
              </div>
              
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px"
              }}>
                {faqs.map(faq => (
                  <div
                    key={faq.id}
                    style={{
                      background: expandedFAQ === faq.id ? "#FFF2E8" : "#f8f9fa",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      overflow: "hidden",
                      transition: "all 0.3s ease"
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
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: "1" }}>
                        <div style={{
                          background: expandedFAQ === faq.id ? "#FF6B35" : "#f1f5f9",
                          color: expandedFAQ === faq.id ? "white" : "#64748b",
                          width: "40px",
                          height: "40px",
                          borderRadius: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          transition: "all 0.3s ease"
                        }}>
                          {faq.icon}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#2C3E50",
                            margin: "0 0 5px 0"
                          }}>
                            {faq.question}
                          </h3>
                          <span style={{
                            fontSize: "12px",
                            color: "#64748b",
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: "10px",
                            fontWeight: "500"
                          }}>
                            {faq.category === "general" && "General"}
                            {faq.category === "productor" && "Para Productores"}
                            {faq.category === "consumidor" && "Para Consumidores"}
                            {faq.category === "ia" && "Inteligencia Artificial"}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        fontSize: "20px",
                        color: "#FF6B35",
                        transition: "transform 0.3s ease",
                        transform: expandedFAQ === faq.id ? "rotate(180deg)" : "rotate(0deg)"
                      }}>
                        ▼
                      </div>
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div style={{
                        padding: "0 20px 20px 85px",
                        borderTop: "1px solid #e5e7eb",
                        animation: "fadeIn 0.3s ease"
                      }}>
                        <p style={{
                          fontSize: "15px",
                          color: "#4A5568",
                          lineHeight: "1.7",
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

            {/* SECCIÓN 2 - Para Consumidores */}
            <div id="seccion2" style={{ marginBottom: "50px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  🛒
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Guía para Consumidores
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "30px",
                borderRadius: "12px",
                borderLeft: "4px solid #3B82F6"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "25px",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #3B82F6"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      color: "#3B82F6"
                    }}>🔍</div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Encontrar Productos</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Usa filtros por categoría, precio y ubicación para encontrar productos locales frescos.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #10B981"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      color: "#10B981"
                    }}>🛍️</div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Realizar Pedidos</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Agrega productos al carrito, revisa y confirma. Recibirás confirmación por email.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #8B5CF6"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      color: "#8B5CF6"
                    }}>⭐</div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Calificar Productores</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Después de recibir tu pedido, califica al productor para ayudar a otros consumidores.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: "#EFF6FF",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "1px solid #DBEAFE"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "15px"
                  }}>
                    <span style={{ fontSize: "28px", color: "#3B82F6" }}>📱</span>
                    <h4 style={{
                      margin: "0",
                      color: "#1E40AF",
                      fontSize: "20px",
                      fontWeight: "700"
                    }}>
                      App Móvil para Consumidores
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#1E40AF",
                    fontSize: "16px",
                    lineHeight: "1.6"
                  }}>
                    Descarga nuestra app móvil desde Google Play o App Store para realizar pedidos desde 
                    cualquier lugar, recibir notificaciones en tiempo real y acceder a ofertas exclusivas.
                  </p>
                  <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                    <button style={{
                      background: "#3B82F6",
                      color: "white",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>📲</span> Google Play
                    </button>
                    <button style={{
                      background: "#000000",
                      color: "white",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>📱</span> App Store
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3 - Para Productores */}
            <div id="seccion3" style={{ marginBottom: "50px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  👨‍🌾
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Guía para Productores
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "30px",
                borderRadius: "12px",
                borderLeft: "4px solid #10B981"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "25px",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "15px",
                      color: "#10B981"
                    }}>📊</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Dashboard de Productor</h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      <li>Visión general de ventas</li>
                      <li>Pedidos pendientes</li>
                      <li>Recomendaciones de IA</li>
                      <li>Análisis de rendimiento</li>
                    </ul>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "15px",
                      color: "#FF6B35"
                    }}>💰</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Optimización de Precios</h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      <li>Sugerencias basadas en mercado</li>
                      <li>Análisis de competencia</li>
                      <li>Tendencias estacionales</li>
                      <li>Margen de ganancia sugerido</li>
                    </ul>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "15px",
                      color: "#8B5CF6"
                    }}>📈</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Gestión de Inventario</h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      <li>Control de stock en tiempo real</li>
                      <li>Alertas de stock bajo</li>
                      <li>Pronóstico de demanda</li>
                      <li>Reportes de ventas</li>
                    </ul>
                  </div>
                </div>
                
                <div style={{
                  background: "#ECFDF5",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "1px solid #A7F3D0"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "15px"
                  }}>
                    <span style={{ fontSize: "28px", color: "#10B981" }}>🚚</span>
                    <h4 style={{
                      margin: "0",
                      color: "#065F46",
                      fontSize: "20px",
                      fontWeight: "700"
                    }}>
                      App Móvil para Productores
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#065F46",
                    fontSize: "16px",
                    lineHeight: "1.6"
                  }}>
                    Gestiona tu tienda desde cualquier lugar con nuestra app móvil exclusiva para productores: 
                    recibe pedidos, actualiza inventario y responde a clientes en tiempo real.
                  </p>
                  <button 
                    onClick={() => navigate("/productor/app")}
                    style={{
                      background: "#10B981",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "20px"
                    }}
                  >
                    <span>📱</span> Descargar App para Productores
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4 - Contactar Soporte */}
            <div id="seccion4" style={{ marginBottom: "50px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  📞
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Contactar Soporte
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "30px",
                borderRadius: "12px",
                borderLeft: "4px solid #8B5CF6"
              }}>
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
                        background: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        textDecoration: "none",
                        borderTop: `4px solid ${method.color}`,
                        transition: "all 0.3s ease",
                        display: "block"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                      }}
                    >
                      <div style={{
                        fontSize: "40px",
                        marginBottom: "15px"
                      }}>
                        {method.icon}
                      </div>
                      <h3 style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        marginBottom: "8px"
                      }}>
                        {method.method}
                      </h3>
                      <p style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
                        {method.details}
                      </p>
                    </a>
                  ))}
                </div>
                
                {/* HORARIOS DE ATENCIÓN */}
                <div style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  borderTop: "4px solid #F59E0B"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "20px"
                  }}>
                    <span style={{ fontSize: "28px", color: "#F59E0B" }}>⏰</span>
                    <h3 style={{
                      margin: "0",
                      color: "#2C3E50",
                      fontSize: "22px",
                      fontWeight: "700"
                    }}>
                      Horarios de Atención
                    </h3>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px"
                  }}>
                    {horariosAtencion.map((horario, index) => (
                      <div 
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "15px",
                          background: "#f8f9fa",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "20px" }}>{horario.icon}</span>
                          <span style={{ fontSize: "15px", fontWeight: "600", color: "#2C3E50" }}>
                            {horario.dias}
                          </span>
                        </div>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#64748b" }}>
                          {horario.horas}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <p style={{
                    margin: "20px 0 0 0",
                    fontSize: "14px",
                    color: "#94a3b8",
                    textAlign: "center",
                    fontStyle: "italic"
                  }}>
                    *Respuesta por email en menos de 24 horas hábiles
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5 - Recursos */}
            <div id="seccion5" style={{ marginBottom: "50px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  📚
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Recursos Útiles
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "30px",
                borderRadius: "12px",
                borderLeft: "4px solid #F59E0B"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "25px"
                }}>
                  {recursos.map((recurso, index) => (
                    <div
                      key={index}
                      style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        borderTop: `4px solid ${recurso.color}`,
                        position: "relative",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "25px",
                        background: `${recurso.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        color: recurso.color,
                        marginBottom: "15px"
                      }}>
                        {recurso.icon}
                      </div>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2C3E50",
                        marginBottom: "8px"
                      }}>
                        {recurso.title}
                      </h3>
                      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                        {recurso.description}
                      </p>
                      <button
                        onClick={() => navigate(recurso.url)}
                        style={{
                          background: `${recurso.color}20`,
                          color: recurso.color,
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span>→</span> Acceder
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECCIÓN 6 - Inteligencia Artificial */}
            <div id="seccion6" style={{ marginBottom: "50px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  🤖
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Inteligencia Artificial
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "30px",
                borderRadius: "12px",
                borderLeft: "4px solid #8B5CF6"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "30px",
                  marginBottom: "30px"
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
                      <span style={{ color: "#FF6B35" }}>💰</span>
                      Análisis de Precios
                    </h3>
                    <ul style={{
                      paddingLeft: "20px",
                      color: "#4A5568"
                    }}>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Comparación con productos similares
                      </li>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Análisis de tendencias de mercado
                      </li>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Factores estacionales y de demanda
                      </li>
                      <li style={{ fontSize: "16px" }}>
                        Sugerencias de precios competitivos
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
                      <span style={{ color: "#10B981" }}>📈</span>
                      Predicción de Demanda
                    </h3>
                    <ul style={{
                      paddingLeft: "20px",
                      color: "#4A5568"
                    }}>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Pronósticos basados en datos históricos
                      </li>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Factores temporales y festivos
                      </li>
                      <li style={{ marginBottom: "10px", fontSize: "16px" }}>
                        Clasificación: alta/media/baja demanda
                      </li>
                      <li style={{ fontSize: "16px" }}>
                        Alertas de tendencias emergentes
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div style={{
                  background: "#F5F3FF",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "1px solid #DDD6FE"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "15px"
                  }}>
                    <span style={{ fontSize: "28px", color: "#8B5CF6" }}>⚙️</span>
                    <h4 style={{
                      margin: "0",
                      color: "#5B21B6",
                      fontSize: "20px",
                      fontWeight: "700"
                    }}>
                      Cómo Aprovechar la IA
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#5B21B6",
                    fontSize: "16px",
                    lineHeight: "1.6"
                  }}>
                    <strong>Para productores:</strong> Revisa las sugerencias de precios en tu dashboard y 
                    ajusta según tu contexto local. Usa los pronósticos de demanda para planificar producción.
                    <br /><br />
                    <strong>Para consumidores:</strong> Observa las tendencias de precios para comprar en 
                    momentos óptimos y aprovechar ofertas basadas en disponibilidad estacional.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 7 - Problemas Comunes */}
            <div id="seccion7" style={{ marginBottom: "50px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  🔧
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Solución de Problemas
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "30px",
                borderRadius: "12px",
                borderLeft: "4px solid #EF4444"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "25px",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #EF4444"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "15px",
                      color: "#EF4444"
                    }}>🔑</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Problema: No puedo iniciar sesión</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      <strong>Solución:</strong> 1. Verifica tu email y contraseña. 2. Usa "¿Olvidaste tu contraseña?" 
                      3. Limpia caché del navegador. 4. Intenta en modo incógnito.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #F59E0B"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "15px",
                      color: "#F59E0B"
                    }}>💳</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Problema: Pago no procesado</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      <strong>Solución:</strong> 1. Verifica fondos en tu cuenta. 2. Revisa datos de tarjeta. 
                      3. Contacta a tu banco. 4. Intenta con otro método de pago.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    borderTop: "4px solid #3B82F6"
                  }}>
                    <div style={{
                      fontSize: "32px",
                      marginBottom: "15px",
                      color: "#3B82F6"
                    }}>📦</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Problema: Producto no aparece</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      <strong>Solución:</strong> 1. Revisa filtros aplicados. 2. Verifica categoría. 
                      3. Contacta al productor. 4. Reporta el problema a soporte.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: "#FEE2E2",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "1px solid #FECACA"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "15px"
                  }}>
                    <span style={{ fontSize: "28px", color: "#EF4444" }}>🚨</span>
                    <h4 style={{
                      margin: "0",
                      color: "#7F1D1D",
                      fontSize: "20px",
                      fontWeight: "700"
                    }}>
                      ¿No encuentras tu problema?
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#7F1D1D",
                    fontSize: "16px",
                    lineHeight: "1.6"
                  }}>
                    Si tu problema no aparece en la lista, contacta directamente a nuestro equipo de soporte 
                    técnico. Incluye capturas de pantalla y describe los pasos que seguiste antes del error.
                  </p>
                  <button 
                    onClick={() => navigate("/soporte/ticket")}
                    style={{
                      background: "#EF4444",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "20px"
                    }}
                  >
                    <span>📋</span> Crear Ticket de Soporte
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 8 - Seguridad */}
            <div id="seccion8" style={{ marginBottom: "40px", scrollMarginTop: "100px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px",
                paddingBottom: "20px",
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
                  🔒
                </div>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Seguridad y Privacidad
                </h2>
              </div>
              
              <div style={{
                background: "#f8f9fa",
                padding: "30px",
                borderRadius: "12px",
                borderLeft: "4px solid #10B981"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "25px",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
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
                    }}>Datos Protegidos</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Encriptación SSL/TLS para todas las transacciones y datos personales.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      color: "#3B82F6"
                    }}>💳</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Pagos Seguros</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Integración con pasarelas de pago certificadas y verificadas.
                    </p>
                  </div>
                  
                  <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{
                      fontSize: "40px",
                      marginBottom: "15px",
                      color: "#8B5CF6"
                    }}>📋</div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "10px"
                    }}>Privacidad</h3>
                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                      Cumplimos con regulaciones de protección de datos personales.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  background: "#ECFDF5",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "1px solid #A7F3D0"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "15px"
                  }}>
                    <span style={{ fontSize: "28px", color: "#10B981" }}>📞</span>
                    <h4 style={{
                      margin: "0",
                      color: "#065F46",
                      fontSize: "20px",
                      fontWeight: "700"
                    }}>
                      Reportar Problemas de Seguridad
                    </h4>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#065F46",
                    fontSize: "16px",
                    lineHeight: "1.6"
                  }}>
                    Si descubres alguna vulnerabilidad de seguridad, por favor repórtala de manera responsable a 
                    <strong> security@mercadolocalia.com</strong>. No divulgues públicamente sin coordinación previa.
                  </p>
                </div>
              </div>
            </div>

            {/* FORMULARIO DE RETROALIMENTACIÓN */}
            <div style={{
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
              color: "white",
              padding: "40px",
              borderRadius: "16px",
              textAlign: "center",
              marginTop: "50px"
            }}>
              <div style={{
                fontSize: "48px",
                marginBottom: "20px"
              }}>
                💬
              </div>
              
              <h3 style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "15px"
              }}>
                ¿Fue útil esta información?
              </h3>
              
              <p style={{
                fontSize: "16px",
                lineHeight: "1.8",
                marginBottom: "30px",
                maxWidth: "800px",
                marginLeft: "auto",
                marginRight: "auto",
                opacity: 0.95
              }}>
                Tu opinión nos ayuda a mejorar el centro de ayuda. Cuéntanos cómo podemos hacerlo mejor.
              </p>
              
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "30px"
              }}>
                <button style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease"
                }}>
                  😊 Sí, muy útil
                </button>
                <button style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease"
                }}>
                  😐 Más o menos
                </button>
                <button style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.3s ease"
                }}>
                  😞 No fue útil
                </button>
              </div>
              
              <button 
                onClick={() => navigate("/sugerencias")}
                style={{
                  background: "white",
                  color: "#FF6B35",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span>✏️</span> Enviar Sugerencias
              </button>
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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