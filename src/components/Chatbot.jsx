import { useState, useEffect, useRef } from "react";
import { enviarMensaje } from "../services/chatbotService";

/* ===============================
   Convierte URLs en links
================================ */
const linkify = (text) => {
  if (!text) return text;

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      const cleanUrl = part.replace(/[)\].,;:]+$/, "");

      return (
        <a
          key={index}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#FF6B35",
            textDecoration: "underline",
            fontWeight: "600",
            transition: "all 0.2s ease",
            padding: "0 2px",
            borderRadius: "2px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 107, 53, 0.1)";
            e.currentTarget.style.color = "#FF8E53";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#FF6B35";
          }}
        >
          {cleanUrl}
        </a>
      );
    }

    return part;
  });
};

export default function Chatbot() {
  const [mensajes, setMensajes] = useState([
    {
      autor: "bot",
      texto: "¡Hola! 👋 Soy tu asistente de MercadoLocal. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date()
    },
    {
      autor: "bot",
      texto: "Puedo ayudarte con información sobre productos, pedidos, envíos y más.",
      timestamp: new Date(Date.now() + 1000)
    },
    {
      autor: "bot",
      texto: "Por ejemplo, pregúntame por: \"productos disponibles\", \"cómo hacer un pedido\" o \"tiempos de entrega\".",
      timestamp: new Date(Date.now() + 2000)
    }
  ]);
  const [input, setInput] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Mostrar mensaje de bienvenida al abrir
  useEffect(() => {
    if (abierto && !showWelcome) {
      setTimeout(() => {
        setShowWelcome(true);
      }, 300);
    }
  }, [abierto, showWelcome]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = async () => {
    if (!input.trim()) return;

    const mensajeUsuario = input.trim();

    // Mostrar mensaje del usuario con animación
    setMensajes((prev) => [
      ...prev,
      { 
        autor: "user", 
        texto: mensajeUsuario, 
        timestamp: new Date(),
        id: `user_${Date.now()}`
      }
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const data = await enviarMensaje(
        mensajeUsuario,
        user?.rol,
        user?.idConsumidor,
        user?.idVendedor,
        token
      );

      // Simular typing delay con animación
      setTimeout(() => {
        setIsTyping(false);
        
        // Dividir respuesta larga en partes más pequeñas
        const respuesta = data.respuesta;
        const palabras = respuesta.split(' ');
        const partes = [];
        
        // Crear partes de 10-15 palabras cada una
        for (let i = 0; i < palabras.length; i += 12) {
          partes.push(palabras.slice(i, i + 12).join(' '));
        }
        
        // Mostrar cada parte con delay
        partes.forEach((parte, index) => {
          setTimeout(() => {
            setMensajes((prev) => [
              ...prev,
              { 
                autor: "bot", 
                texto: parte, 
                timestamp: new Date(),
                id: `bot_${Date.now()}_${index}`
              }
            ]);
          }, index * 500); // 500ms entre cada parte
        });
        
      }, 1000 + Math.random() * 1000); // Delay variable más realista

    } catch (error) {
      setIsTyping(false);
      
      // Respuestas de error más naturales
      const errorMessages = [
        "Lo siento, parece que hay un problema de conexión. ¿Podrías intentarlo de nuevo?",
        "¡Ups! Algo salió mal. ¿Quieres reformular tu pregunta?",
        "En este momento no puedo procesar tu solicitud. ¿Podrías intentar en un momento?"
      ];
      
      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      
      setTimeout(() => {
        setMensajes((prev) => [
          ...prev,
          { 
            autor: "bot", 
            texto: randomError,
            timestamp: new Date(),
            id: `error_${Date.now()}`
          }
        ]);
      }, 800);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  // Respuestas rápidas sugeridas
  const quickQuestions = [
    "¿Qué productos tienen disponibles?",
    "¿Cómo hago un pedido?",
    "¿Cuál es el tiempo de entrega?",
    "¿Aceptan pagos con tarjeta?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <>
      {/* Botón flotante - NARANJA como en el explorador */}
      <button
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          width: "62px",
          height: "62px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
          color: "white",
          border: "none",
          fontSize: "26px",
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(255, 107, 53, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 9999,
          transform: abierto ? "rotate(90deg)" : "rotate(0deg)"
        }}
        onClick={() => setAbierto(!abierto)}
        title="Chat MercadoLocal"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = abierto 
            ? "rotate(90deg) scale(1.1)" 
            : "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(255, 107, 53, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = abierto 
            ? "rotate(90deg)" 
            : "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 107, 53, 0.4)";
        }}
      >
        {abierto ? "✕" : "💬"}
      </button>

      {/* Ventana del chat - FONDO BLANCO */}
      {abierto && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "25px",
          width: "360px",
          height: "500px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 9998,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          border: "1px solid rgba(255, 107, 53, 0.1)",
          animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}>
          
          {/* Header - NARANJA */}
          <div style={{
            background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
            padding: "20px 24px",
            color: "white",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            position: "relative"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                backdropFilter: "blur(10px)",
                animation: "bounce 2s infinite"
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "700",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.5px"
                }}>
                  Asistente MercadoLocal
                </h4>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "13px",
                  opacity: 0.9,
                  fontWeight: "500",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    background: "#10B981",
                    borderRadius: "50%",
                    animation: isTyping ? "pulse 1.5s infinite" : "none"
                  }} />
                  {isTyping ? "Escribiendo respuesta..." : "En línea • Listo para ayudar"}
                </p>
              </div>
            </div>
          </div>

          {/* Área de mensajes - FONDO BLANCO */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "white",
            position: "relative",
            scrollbarWidth: "thin",
            scrollbarColor: "#FF6B35 #f8f9fa"
          }}>
            {/* Mensajes predeterminados */}
            {mensajes.map((m, index) => (
              <div
                key={m.id || index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.autor === "bot" ? "flex-start" : "flex-end",
                  marginBottom: "18px",
                  animation: `messageAppear 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Timestamp y autor */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                  justifyContent: m.autor === "bot" ? "flex-start" : "flex-end",
                  width: "100%",
                  maxWidth: "85%"
                }}>
                  {m.autor === "bot" && (
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#FF6B35",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Asistente
                    </span>
                  )}
                  
                  <span style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif",
                    marginLeft: m.autor === "user" ? "auto" : "0",
                    marginRight: m.autor === "user" ? "0" : "auto"
                  }}>
                    {formatTime(m.timestamp)}
                  </span>
                  
                  {m.autor === "user" && (
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#8B5CF6",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Tú
                    </span>
                  )}
                </div>
                
                {/* Burbuja de mensaje */}
                <div
                  style={{
                    background: m.autor === "bot" 
                      ? "linear-gradient(135deg, #FFF8F5 0%, #FFFFFF 100%)" 
                      : "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                    color: m.autor === "bot" ? "#2C3E50" : "white",
                    padding: "14px 18px",
                    borderRadius: m.autor === "bot" 
                      ? "18px 18px 18px 6px" 
                      : "18px 18px 6px 18px",
                    boxShadow: m.autor === "bot"
                      ? "0 4px 15px rgba(255, 107, 53, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)"
                      : "0 4px 15px rgba(139, 92, 246, 0.25)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    wordWrap: "break-word",
                    fontFamily: "'Inter', sans-serif",
                    border: m.autor === "bot" ? "1px solid rgba(255, 107, 53, 0.1)" : "none",
                    maxWidth: "85%",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Efecto de brillo sutil en mensajes del bot */}
                  {m.autor === "bot" && index >= 3 && (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "linear-gradient(45deg, transparent 45%, rgba(255, 107, 53, 0.03) 50%, transparent 55%)",
                      animation: "shine 3s infinite",
                      pointerEvents: "none"
                    }} />
                  )}
                  
                  {linkify(m.texto)}
                </div>
              </div>
            ))}

            {/* Animación de typing */}
            {isTyping && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "20px",
                animation: "fadeIn 0.3s ease-out"
              }}>
                <div style={{
                  width: "38px",
                  height: "38px",
                  background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "white",
                  fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                    animation: "shine 3s infinite"
                  }} />
                  🤖
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #FFF8F5 0%, #FFFFFF 100%)",
                  padding: "14px 18px",
                  borderRadius: "18px 18px 18px 6px",
                  boxShadow: "0 4px 15px rgba(255, 107, 53, 0.1)",
                  minWidth: "120px",
                  border: "1px solid rgba(255, 107, 53, 0.1)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    gap: "6px",
                    alignItems: "center"
                  }}>
                    <span style={{
                      fontSize: "12px",
                      color: "#FF6B35",
                      fontWeight: "600",
                      marginRight: "10px"
                    }}>
                      Escribiendo
                    </span>
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#FF6B35",
                          animation: `typingDots 1.4s infinite ${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preguntas rápidas sugeridas */}
            {!isTyping && mensajes.length <= 3 && (
              <div style={{
                marginTop: "24px",
                animation: "fadeIn 0.5s ease-out 0.3s both"
              }}>
                <p style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: "600",
                  margin: "0 0 12px 0",
                  fontFamily: "'Inter', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Preguntas rápidas:
                </p>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      style={{
                        padding: "12px 16px",
                        background: "white",
                        border: "1px solid rgba(255, 107, 53, 0.2)",
                        borderRadius: "12px",
                        fontSize: "13px",
                        color: "#2C3E50",
                        fontWeight: "500",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                        animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.borderColor = "#FF6B35";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.borderColor = "rgba(255, 107, 53, 0.2)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input - Manteniendo naranja */}
          <div style={{
            padding: "20px 24px",
            background: "white",
            borderTop: "1px solid #f1f5f9",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.04)"
          }}>
            <div style={{
              display: "flex",
              gap: "12px",
              alignItems: "center"
            }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta aquí..."
                  style={{
                    width: "100%",
                    padding: "15px 20px 15px 50px",
                    fontSize: "14px",
                    borderRadius: "14px",
                    border: "2px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#2C3E50",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.3s ease",
                    outline: "none",
                    fontWeight: "500"
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
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#FF6B35",
                  fontSize: "18px"
                }}>
                    ✏️
                </div>
              </div>
              
              <button
                onClick={enviar}
                disabled={!input.trim()}
                style={{
                  padding: "15px 24px",
                  fontSize: "14px",
                  background: input.trim() 
                    ? "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)"
                    : "#f1f5f9",
                  color: input.trim() ? "white" : "#94a3b8",
                  border: "none",
                  borderRadius: "14px",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  fontWeight: "700",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "100px",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  if (input.trim()) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (input.trim()) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                {input.trim() && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                    animation: "shine 3s infinite"
                  }} />
                )}
                
                <span>✈️</span>
                Enviar
              </button>
            </div>
            
            <p style={{
              fontSize: "11px",
              color: "#94a3b8",
              textAlign: "center",
              margin: "12px 0 0 0",
              fontFamily: "'Inter', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <span style={{
                background: "#f1f5f9",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "10px",
                fontWeight: "700",
                color: "#64748b"
              }}>
                ↵ ENTER
              </span>
              para enviar
            </p>
          </div>
        </div>
      )}

      {/* Estilos CSS en línea */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes typingDots {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.9);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Scrollbar personalizada naranja */
        div[style*="overflow-y: auto"]::-webkit-scrollbar {
          width: 8px;
        }
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #FF6B35 0%, #FF8E53 100%);
          border-radius: 4px;
          border: 2px solid #f8f9fa;
        }
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #FF8E53 0%, #FFA726 100%);
        }
      `}</style>
    </>
  );
}