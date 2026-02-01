import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Footer from "../../components/Footer.jsx";
import Notificaciones from "../../components/Notificaciones.jsx";
import useNotification from "../../hooks/useNotification.jsx";

export default function Carrito() {
  const {
    carrito,
    actualizarCantidad,
    eliminarProducto,
    limpiarCarrito
  } = useCarrito();

  const navigate = useNavigate();
  
  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIVA] = useState(0);
  const [total, setTotal] = useState(0);
  const [circlePositions, setCirclePositions] = useState([]);
  const [mostrarConfirmacionVaciar, setMostrarConfirmacionVaciar] = useState(false);
  
  // ==================== SISTEMA DE NOTIFICACIONES MEJORADO ====================
  const {
    notificacion,
    setNotificacion,
    notificaciones,
    confirmacionPago,
    setConfirmacionPago
  } = useNotification();

  // ==================== CARGAR CARRITO AL INICIAR ====================
  useEffect(() => {
    console.log("🔍 Componente Carrito montado");
    console.log("📦 Carrito actual:", carrito);
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("👤 Usuario:", user);
    
    if (user.rol && user.rol !== "CONSUMIDOR") {
      console.log("⚠️ Usuario no es consumidor, rol:", user.rol);
    }
  }, []);

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
      (acc, item) => acc + (item.producto?.precio || 0) * (item.cantidad || 0),
      0
    );
    const ivaCalc = sub * 0.12;
    setSubtotal(sub);
    setIVA(ivaCalc);
    setTotal(sub + ivaCalc);
  }, [carrito]);

  // ✅ FUNCIÓN PARA CONFIRMAR VACIAR CARRITO
  const confirmarVaciarCarrito = () => {
    if (carrito.length === 0) {
      notificaciones.advertenciaCarritoVacio();
      return;
    }
    setMostrarConfirmacionVaciar(true);
  };

  // ✅ FUNCIÓN PARA VACIAR CARRITO (SE EJECUTA DESPUÉS DE CONFIRMAR)
  const vaciarCarritoConfirmado = async () => {
    setMostrarConfirmacionVaciar(false);
    
    try {
      notificaciones.info("Proceso iniciado", "Vaciando carrito...", "⏱️");
      await limpiarCarrito();
      notificaciones.exito("Carrito vaciado", "Todos los productos han sido eliminados", "🗑️");
    } catch (error) {
      console.error("Error vaciando carrito:", error);
      notificaciones.error("Error", "No se pudo vaciar el carrito");
    }
  };

  const cancelarVaciarCarrito = () => {
    setMostrarConfirmacionVaciar(false);
    notificaciones.info("Acción cancelada", "No se vació el carrito", "❌");
  };

  const realizarCheckout = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("authToken");

    if (!token || !user.idConsumidor) {
      notificaciones.advertenciaLogin();
      
      setTimeout(() => {
        navigate("/LoginModal");
      }, 1500);
      return;
    }

    if (!carrito || carrito.length === 0) {
      notificaciones.advertenciaCarritoVacio();
      return;
    }

    console.log("✅ Procediendo al checkout...");
    navigate("/checkout");
  };

  const handleDecrementar = (item) => {
    const producto = item.producto || {};
    
    if (item.cantidad > 1) {
      actualizarCantidad(item.idItem, item.cantidad - 1);
      notificaciones.infoCarritoActualizado(
        producto.nombre || "Producto", 
        item.cantidad - 1
      );
    } else {
      // Notificación para eliminar directamente
      eliminarProducto(item.idItem);
      notificaciones.exitoEliminarCarrito(producto.nombre || "Producto");
    }
  };

  const handleIncrementar = (item) => {
    const producto = item.producto || {};
    actualizarCantidad(item.idItem, item.cantidad + 1);
    notificaciones.infoCarritoActualizado(
      producto.nombre || "Producto", 
      item.cantidad + 1
    );
  };

  const handleEliminarProducto = (item) => {
    const producto = item.producto || {};
    eliminarProducto(item.idItem);
    notificaciones.exitoEliminarCarrito(producto.nombre || "Producto");
  };

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
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
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
          border-radius: "10px";
        }
        
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #FF8E53;
        }
      `}</style>

      {/* COMPONENTE DE NOTIFICACIONES PREMIUM */}
      <Notificaciones
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
        confirmacionPago={confirmacionPago}
        setConfirmacionPago={setConfirmacionPago}
      />

      {/* ✅ MODAL DE CONFIRMACIÓN PARA VACIAR CARRITO */}
      {mostrarConfirmacionVaciar && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          backdropFilter: "blur(8px)",
          animation: "fadeIn 0.3s ease"
        }}>
          
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            border: "2px solid rgba(255, 107, 53, 0.2)",
            animation: "slideIn 0.3s ease",
            fontFamily: "'Inter', sans-serif"
          }}>
            <div style={{
              fontSize: "50px",
              marginBottom: "20px",
              color: "#FF6B35"
            }}>⚠️</div>
            
            <h3 style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#2C3E50",
              margin: "0 0 15px 0"
            }}>
              ¿Vaciar todo el carrito?
            </h3>
            
            <p style={{
              fontSize: "16px",
              color: "#64748b",
              margin: "0 0 30px 0",
              lineHeight: "1.5"
            }}>
              Se eliminarán <strong>{carrito.length}</strong> producto{carrito.length > 1 ? 's' : ''} de tu carrito.<br />
              <span style={{ color: "#dc2626", fontWeight: "600" }}>Esta acción no se puede deshacer.</span>
            </p>
            
            <div style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center"
            }}>
              <button
                onClick={cancelarVaciarCarrito}
                style={{
                  padding: "16px 32px",
                  background: "white",
                  border: "2px solid #FF6B35",
                  color: "#FF6B35",
                  borderRadius: "12px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  flex: 1
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 107, 53, 0.1)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={vaciarCarritoConfirmado}
                style={{
                  padding: "16px 32px",
                  background: "#dc2626",
                  border: "2px solid #dc2626",
                  color: "white",
                  borderRadius: "12px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  flex: 1,
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#ef4444";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(220, 38, 38, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#dc2626";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.2)";
                }}
              >
                Sí, vaciar todo
              </button>
            </div>
          </div>
        </div>
      )}

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
            {carrito.length === 0 
              ? "Añade productos para comenzar tu compra" 
              : `Tienes ${carrito.length} producto${carrito.length !== 1 ? 's' : ''} en tu carrito`}
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
              height: "650px",
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

                {/* ✅ BOTÓN VACIAR CARRITO CON CONFIRMACIÓN */}
                <button
                  onClick={confirmarVaciarCarrito}
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
              <div className="scroll-container" style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: "10px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {carrito.map((item, index) => {
                    const producto = item.producto || {};
                    const precio = producto.precio || 0;
                    const cantidad = item.cantidad || 0;
                    const subtotalItem = precio * cantidad;

                    return (
                      <div
                        key={item.idItem || `item-${index}`}
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
                          src={producto.imagen || 'https://via.placeholder.com/120x120/FF6B35/FFFFFF?text=Producto'}
                          alt={producto.nombre || 'Producto'}
                          style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "12px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/120x120/FF6B35/FFFFFF?text=Producto';
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: "0 0 8px 0", 
                            color: "#2C3E50", 
                            fontSize: "18px",
                            fontWeight: "700",
                            fontFamily: "'Inter', sans-serif"
                          }}>{producto.nombre || 'Producto sin nombre'}</h3>
                          <p style={{ 
                            color: "#FF6B35", 
                            fontWeight: "800", 
                            margin: "0 0 12px 0",
                            fontSize: "20px",
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            ${precio.toFixed(2)}
                          </p>

                          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                            <button
                              onClick={() => handleDecrementar(item)}
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
                              {cantidad}
                            </strong>

                            <button
                              onClick={() => handleIncrementar(item)}
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
                            Subtotal: ${subtotalItem.toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleEliminarProducto(item)}
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
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RESUMEN DE COMPRA */}
            <div style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              height: "650px",
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
                  }}>Productos ({carrito.length})</span>
                  <span style={{ 
                    color: "#2C3E50", 
                    fontSize: "18px", 
                    fontWeight: "700",
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
                    fontSize: "18px", 
                    fontWeight: "700",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    ${iva.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ 
                    color: "#64748b", 
                    fontSize: "16px", 
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>Costo de envío</span>
                  <span style={{ 
                    color: "#10B981", 
                    fontSize: "18px", 
                    fontWeight: "700",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    ¡Gratis!
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

                <div style={{ 
                  marginTop: "20px",
                  padding: "16px",
                  background: "#f0f9ff",
                  borderRadius: "12px",
                  border: "1px solid #bae6fd"
                }}>
                  <p style={{ 
                    margin: "0", 
                    fontSize: "14px", 
                    color: "#0369a1",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: "500"
                  }}>
                    💡 <strong>Tip:</strong> Tu envío será coordinado directamente con el vendedor para asegurar la mejor calidad.
                  </p>
                </div>

                <div style={{ flex: 1 }}></div>
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