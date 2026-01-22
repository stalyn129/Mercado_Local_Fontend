import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Footer from "../../components/Footer.jsx";

export default function Carrito() {
  const {
    carrito,
    actualizarCantidad,
    eliminarProducto,
    limpiarCarrito,
    cargarCarritoDesdeAPI // Necesitas esta función en tu contexto
  } = useCarrito();

  const navigate = useNavigate();
  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIVA] = useState(0);
  const [total, setTotal] = useState(0);
  const [circlePositions, setCirclePositions] = useState([]);
  const [cargandoCarrito, setCargandoCarrito] = useState(true);

  // ==================== CARGAR CARRITO AL INICIAR ====================
  useEffect(() => {
    const cargarCarrito = async () => {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (token && user?.idConsumidor) {
        setCargandoCarrito(true);
        try {
          await cargarCarritoDesdeAPI(); // Esta función debe estar en tu CarritoContext
        } catch (error) {
          console.error("Error cargando carrito:", error);
        } finally {
          setCargandoCarrito(false);
        }
      } else {
        setCargandoCarrito(false);
      }
    };

    cargarCarrito();
  }, []); // Se ejecuta solo al montar el componente

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

  // Calcular totales
  useEffect(() => {
    const sub = carrito.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad,
      0
    );
    const ivaCalc = sub * 0.12;
    setSubtotal(sub);
    setIVA(ivaCalc);
    setTotal(sub + ivaCalc);
  }, [carrito]);

  const realizarCheckout = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!token || !user?.idConsumidor) {
      alert("❌ Debes iniciar sesión");
      navigate("/loginmodal");
      return;
    }

    if (!carrito || carrito.length === 0) {
      alert("❌ Tu carrito está vacío");
      return;
    }

    navigate("/checkout");
  };

  // Estado de carga
  if (cargandoCarrito) {
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
            Cargando tu carrito...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden"
    }}>
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Estilos para el scroll personalizado */
        .scroll-container {
          scrollbar-width: thin;
          scrollbar-color: #FF6B35 #f1f5f9;
        }
        
        .scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .scroll-container::-webkit-scrollbar-thumb {
          background: #FF6B35;
          border-radius: 10px;
        }
        
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #FF8E53;
        }
      `}</style>

      {/* HEADER SECTION CON CÍRCULOS */}
      <div style={{
        background: "white",
        borderRadius: "0 0 30px 30px",
        padding: "90px 32px 70px 32px",
        marginBottom: "40px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {/* CÍRCULOS DE COLORES ANIMADOS */}
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

        <div style={{ position: "relative", zIndex: "10" }}>
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FF6B35",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Tu Compra
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "56px",
            fontWeight: "800",
            color: "#FF6B35",
            margin: "0 0 16px 0",
            letterSpacing: "-1px",
            lineHeight: "1.1",
            textShadow: "0 2px 4px rgba(255, 107, 53, 0.1)"
          }}>🛒 Mi Carrito</h1>
          
          <p style={{
            color: "#64748b",
            fontSize: "16px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6",
            fontWeight: "400",
            fontFamily: "'Inter', sans-serif",
            opacity: 0.8
          }}>
            Revisa tus productos antes de finalizar tu compra
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px 40px 20px",
        flex: "1",
        width: "100%",
        minHeight: "500px"
      }}>
        {carrito.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            minHeight: "60vh",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{ fontSize: "80px", marginBottom: "24px", opacity: 0.7 }}>🛒</div>
            <h2 style={{
              color: "#2C3E50",
              fontSize: "32px",
              fontWeight: "800",
              margin: "0 0 12px 0",
              fontFamily: "'Playfair Display', serif"
            }}>Tu carrito está vacío</h2>
            <p style={{
              color: "#64748b",
              fontSize: "16px",
              marginBottom: "32px",
              fontFamily: "'Inter', sans-serif"
            }}>¡Explora nuestros productos y añade tus favoritos!</p>
            <button
              onClick={() => navigate("/explorar")}
              style={{
                padding: "16px 40px",
                background: "#FF6B35",
                border: "none",
                color: "white",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "16px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.25)",
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(255, 107, 53, 0.35)";
                e.target.style.background = "#FF8E53";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.25)";
                e.target.style.background = "#FF6B35";
              }}
            >Explorar Productos</button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px",
            alignItems: "start"
          }}>
            {/* LISTA DE PRODUCTOS CON ALTURA FIJA Y SCROLL */}
            <div style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              height: "650px", // ALTURA FIJA IGUAL AL PANEL DERECHO
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
                paddingBottom: "20px",
                borderBottom: "2px solid #f1f5f9",
                flexShrink: 0
              }}>
                <div>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#2C3E50",
                    margin: "0 0 6px 0",
                    fontFamily: "'Playfair Display', serif"
                  }}>Productos en tu carrito</h2>
                  <p style={{
                    color: "#64748b",
                    fontSize: "14px",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>{carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}</p>
                </div>

                <button
                  onClick={limpiarCarrito}
                  style={{
                    padding: "12px 24px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                    borderRadius: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#dc2626";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#fef2f2";
                    e.target.style.color = "#dc2626";
                  }}
                >🗑️ Vaciar carrito</button>
              </div>

              {/* CONTENEDOR CON SCROLL VERTICAL */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: "10px",
                className: "scroll-container"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {carrito.map((item) => (
                    <div
                      key={item.idItem}
                      style={{
                        display: "flex",
                        gap: "20px",
                        padding: "24px",
                        background: "#f8f9fa",
                        borderRadius: "16px",
                        border: "2px solid #f1f5f9",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#FF6B35";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#f1f5f9";
                      }}
                    >
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "12px",
                          objectFit: "cover",
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: "0 0 8px 0", 
                          color: "#2C3E50", 
                          fontSize: "18px",
                          fontWeight: "700",
                          fontFamily: "'Inter', sans-serif"
                        }}>{item.producto.nombre}</h3>
                        <p style={{ 
                          color: "#FF6B35", 
                          fontWeight: "800", 
                          margin: "0 0 12px 0",
                          fontSize: "20px",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          ${item.producto.precio.toFixed(2)}
                        </p>

                        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                          <button
                            onClick={() => actualizarCantidad(item.idItem, item.cantidad - 1)}
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#FF6B35",
                              color: "white",
                              border: "none",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontWeight: "800",
                              fontSize: "18px",
                              transition: "all 0.2s ease",
                              fontFamily: "'Inter', sans-serif"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#FF8E53"}
                            onMouseLeave={(e) => e.target.style.background = "#FF6B35"}
                          >−</button>

                          <strong style={{ 
                            minWidth: "40px", 
                            textAlign: "center", 
                            fontSize: "18px",
                            fontFamily: "'Inter', sans-serif",
                            color: "#2C3E50"
                          }}>
                            {item.cantidad}
                          </strong>

                          <button
                            onClick={() => actualizarCantidad(item.idItem, item.cantidad + 1)}
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#FF6B35",
                              color: "white",
                              border: "none",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontWeight: "800",
                              fontSize: "18px",
                              transition: "all 0.2s ease",
                              fontFamily: "'Inter', sans-serif"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#FF8E53"}
                            onMouseLeave={(e) => e.target.style.background = "#FF6B35"}
                          >+</button>
                        </div>

                        <p style={{ 
                          fontWeight: "700", 
                          margin: "0", 
                          color: "#2C3E50",
                          fontSize: "16px",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Subtotal: ${(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => eliminarProducto(item.idItem)}
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          height: "44px",
                          fontWeight: "700",
                          fontSize: "16px",
                          transition: "all 0.3s ease",
                          fontFamily: "'Inter', sans-serif"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#ef4444";
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#dc2626";
                          e.target.style.transform = "scale(1)";
                        }}
                      >✕ Eliminar</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RESUMEN DE COMPRA - MISMA ALTURA */}
            <div style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              height: "650px", // MISMA ALTURA QUE EL PANEL IZQUIERDO
              display: "flex",
              flexDirection: "column"
            }}>
              <h2 style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#FF6B35",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "2px solid #f1f5f9",
                fontFamily: "'Playfair Display', serif"
              }}>📋 Resumen de Compra</h2>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "24px",
                flex: 1
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ 
                    color: "#64748b", 
                    fontSize: "16px", 
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>Subtotal</span>
                  <span style={{ 
                    color: "#2C3E50", 
                    fontSize: "20px", 
                    fontWeight: "800",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ 
                    color: "#64748b", 
                    fontSize: "16px", 
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>IVA (12%)</span>
                  <span style={{ 
                    color: "#2C3E50", 
                    fontSize: "20px", 
                    fontWeight: "800",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    ${iva.toFixed(2)}
                  </span>
                </div>

                <div style={{ height: "2px", background: "#f1f5f9", margin: "12px 0" }}></div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px",
                  background: "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)",
                  borderRadius: "14px",
                  border: "2px solid rgba(255, 107, 53, 0.2)"
                }}>
                  <span style={{ 
                    color: "#2C3E50", 
                    fontSize: "20px", 
                    fontWeight: "800",
                    fontFamily: "'Playfair Display', serif"
                  }}>Total</span>
                  <span style={{ 
                    color: "#FF6B35", 
                    fontSize: "32px", 
                    fontWeight: "900",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div style={{ flex: 1 }}></div> {/* Espacio flexible para empujar botones abajo */}
              </div>

              <button
                onClick={realizarCheckout}
                disabled={!carrito || carrito.length === 0}
                style={{
                  width: "100%",
                  padding: "20px",
                  background: "#FF6B35",
                  border: "none",
                  color: "white",
                  borderRadius: "14px",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "18px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(255, 107, 53, 0.25)",
                  marginBottom: "16px",
                  opacity: (!carrito || carrito.length === 0) ? 0.6 : 1,
                  fontFamily: "'Inter', sans-serif"
                }}
                onMouseEnter={(e) => {
                  if (carrito && carrito.length > 0) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.35)";
                    e.target.style.background = "#FF8E53";
                  }
                }}
                onMouseLeave={(e) => {
                  if (carrito && carrito.length > 0) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.25)";
                    e.target.style.background = "#FF6B35";
                  }
                }}
              >
                🛒 Finalizar Compra
              </button>

              <button
                onClick={() => navigate("/explorar")}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "white",
                  border: "2px solid #FF6B35",
                  color: "#FF6B35",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif"
                }}
                onMouseEnter={(e) => { 
                  e.target.style.background = "rgba(255, 107, 53, 0.1)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => { 
                  e.target.style.background = "white";
                  e.target.style.transform = "translateY(0)";
                }}
              >← Seguir Comprando</button>

              <div style={{
                marginTop: "24px",
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: "14px",
                border: "1px solid #f1f5f9"
              }}>
                <p style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Inter', sans-serif"
                }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Compra segura y protegida</p>
                <p style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Inter', sans-serif"
                }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Productos frescos y orgánicos</p>
                <p style={{
                  margin: "0",
                  fontSize: "14px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: "'Inter', sans-serif"
                }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Envío coordinado con el vendedor</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}