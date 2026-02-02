import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import { useFavoritos } from "../../context/FavoritosContext.jsx";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Notificaciones from "../../components/Notificaciones.jsx";
import useNotification from "../../hooks/useNotification.jsx";
import API_URL from "../../config/api.js";

export default function Favoritos() {

  const { favoritos, cargarFavoritos } = useFavoritos();
  const { agregarCarrito } = useCarrito();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [circlePositions, setCirclePositions] = useState([]);
  const [agregandoAlCarrito, setAgregandoAlCarrito] = useState({});
  const [mostrarConfirmacionVaciar, setMostrarConfirmacionVaciar] = useState(false);
  
  // ==================== SISTEMA DE NOTIFICACIONES MEJORADO ====================
  const {
    notificacion,
    setNotificacion,
    notificaciones
  } = useNotification();

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

  // CARGA INICIAL usando el contexto
  useEffect(() => {
    const loadFavoritos = async () => {
      await cargarFavoritos();
      setLoading(false);
    };
    loadFavoritos();
  }, []);

  // ELIMINAR UNO - llama al backend y recarga
  const eliminarFavorito = async (idFavorito, nombreProducto) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      notificaciones.advertenciaLogin();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/favoritos/eliminar/${idFavorito}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Error al eliminar favorito:", txt);
        notificaciones.error("Error", "No se pudo eliminar el favorito");
        return;
      }

      await cargarFavoritos();
      notificaciones.exito(
        "Favorito eliminado", 
        `${nombreProducto} ha sido removido de tus favoritos`,
        "🗑️"
      );
    } catch (err) {
      console.error("Error eliminando favorito:", err);
      notificaciones.errorGenerico("Error al eliminar el favorito");
    }
  };

  // ✅ VACIAR TODOS CON CONFIRMACIÓN PREMIUM
  const confirmarVaciarFavoritos = () => {
    if (favoritos.length === 0) {
      notificaciones.advertencia("Favoritos vacíos", "No tienes favoritos para vaciar", "💔");
      return;
    }
    setMostrarConfirmacionVaciar(true);
  };

  const vaciarFavoritos = async () => {
    setMostrarConfirmacionVaciar(false);
    setLoading(true);
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      notificaciones.advertenciaLogin();
      setLoading(false);
      return;
    }

    try {
      notificaciones.info("Proceso iniciado", "Eliminando favoritos...", "⏱️");
      
      await Promise.all(
        favoritos.map((fav) =>
          fetch(`${API_URL}/favoritos/eliminar/${fav.idFavorito}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      await cargarFavoritos();
      notificaciones.exito("Favoritos vaciados", "Todos tus favoritos han sido eliminados", "🗑️");
    } catch (err) {
      console.error("Error vaciando favoritos:", err);
      notificaciones.error("Error", "No se pudieron vaciar los favoritos");
    } finally {
      setLoading(false);
    }
  };

  const cancelarVaciarFavoritos = () => {
    setMostrarConfirmacionVaciar(false);
    notificaciones.info("Acción cancelada", "No se vaciaron los favoritos", "❌");
  };

  // ✅ FUNCIÓN CORREGIDA: Agregar al carrito desde favoritos
  const agregarAlCarritoDesdeFavoritos = async (idProducto, nombreProducto) => {
    try {
      setAgregandoAlCarrito(prev => ({ ...prev, [idProducto]: true }));
      await agregarCarrito(idProducto, 1);
      notificaciones.exitoAgregarCarrito(nombreProducto);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      if (error.message === "Usuario no autenticado") {
        notificaciones.advertenciaLogin();
      } else {
        notificaciones.error("Error", "No se pudo agregar al carrito");
      }
    } finally {
      setAgregandoAlCarrito(prev => ({ ...prev, [idProducto]: false }));
    }
  };

  // ✅ AGREGAR TODO AL CARRITO
  const agregarTodosAlCarrito = async () => {
    if (favoritos.length === 0) {
      notificaciones.advertencia("Favoritos vacíos", "No tienes productos para agregar al carrito", "🛒");
      return;
    }

    try {
      setLoading(true);
      notificaciones.info("Proceso iniciado", "Agregando productos al carrito...", "⏱️");
      
      let agregados = 0;
      let errores = 0;
      
      for (const fav of favoritos) {
        try {
          await agregarCarrito(fav.idProducto, 1);
          agregados++;
        } catch (error) {
          console.error(`Error agregando ${fav.nombreProducto}:`, error);
          errores++;
        }
      }
      
      if (errores === 0) {
        notificaciones.exito(
          "¡Productos agregados!", 
          `Se agregaron ${agregados} productos al carrito`,
          "🛒"
        );
      } else if (agregados > 0) {
        notificaciones.advertencia(
          "Resultado parcial", 
          `Se agregaron ${agregados} productos, ${errores} no se pudieron agregar`,
          "⚠️"
        );
      } else {
        notificaciones.error(
          "Error", 
          "No se pudo agregar ningún producto al carrito",
          "❌"
        );
      }
      
    } catch (error) {
      console.error("Error en agregarTodosAlCarrito:", error);
      notificaciones.error("Error", "Ocurrió un error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
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
      
      {/* COMPONENTE DE NOTIFICACIONES PREMIUM */}
      <Notificaciones
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
      />

      {/* ✅ MODAL DE CONFIRMACIÓN PARA VACIAR FAVORITOS */}
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
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          
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
              ¿Vaciar todos los favoritos?
            </h3>
            
            <p style={{
              fontSize: "16px",
              color: "#64748b",
              margin: "0 0 30px 0",
              lineHeight: "1.5"
            }}>
              Se eliminarán <strong>{favoritos.length}</strong> producto{favoritos.length > 1 ? 's' : ''} de tus favoritos.<br />
              <span style={{ color: "#dc2626", fontWeight: "600" }}>Esta acción no se puede deshacer.</span>
            </p>
            
            <div style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center"
            }}>
              <button
                onClick={cancelarVaciarFavoritos}
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
                onClick={vaciarFavoritos}
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
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* HEADER SECTION */}
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
            Tus Favoritos
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
          }}>❤️ Mis Favoritos</h1>
          
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
            {favoritos.length > 0 
              ? `Tienes ${favoritos.length} producto${favoritos.length > 1 ? 's' : ''} guardado${favoritos.length > 1 ? 's' : ''} en tus favoritos`
              : "Guarda tus productos favoritos para verlos más tarde"
            }
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px 40px 20px",
        flex: "1",
        width: "100%"
      }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            minHeight: "60vh",
            border: "1px solid #f1f5f9"
          }}>
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
              Cargando favoritos...
            </p>
          </div>
        ) : favoritos.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            minHeight: "60vh",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{ fontSize: "80px", marginBottom: "24px", opacity: 0.7 }}>💔</div>
            <h2 style={{
              color: "#2C3E50",
              fontSize: "32px",
              fontWeight: "800",
              margin: "0 0 12px 0",
              fontFamily: "'Playfair Display', serif"
            }}>No tienes favoritos aún</h2>
            <p style={{
              color: "#64748b",
              fontSize: "16px",
              marginBottom: "32px",
              fontFamily: "'Inter', sans-serif"
            }}>¡Explora nuestros productos y añade tus favoritos!</p>
            
            {/* ✅ SOLO UN BOTÓN AHORA - EL BOTÓN DE DEMOSTRACIÓN FUE ELIMINADO */}
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
            >
              Explorar Productos
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px",
            alignItems: "start"
          }}>
            {/* LISTA DE PRODUCTOS - IZQUIERDA */}
            <div style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
                paddingBottom: "20px",
                borderBottom: "2px solid #f1f5f9"
              }}>
                <div>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#2C3E50",
                    margin: "0 0 6px 0",
                    fontFamily: "'Playfair Display', serif"
                  }}>Productos en tus favoritos</h2>
                  <p style={{
                    color: "#64748b",
                    fontSize: "14px",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>{favoritos.length} {favoritos.length === 1 ? 'producto' : 'productos'}</p>
                </div>

                {favoritos.length > 0 && (
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={confirmarVaciarFavoritos}
                      disabled={loading}
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
                        fontFamily: "'Inter', sans-serif",
                        opacity: loading ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.background = "#dc2626";
                          e.target.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.background = "#fef2f2";
                          e.target.style.color = "#dc2626";
                        }
                      }}
                    >
                      🗑️ Vaciar favoritos
                    </button>
                    
                    <button
                      onClick={agregarTodosAlCarrito}
                      disabled={loading}
                      style={{
                        padding: "12px 24px",
                        background: "#10B981",
                        color: "white",
                        border: "2px solid #10B981",
                        borderRadius: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                        fontFamily: "'Inter', sans-serif",
                        opacity: loading ? 0.6 : 1,
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)"
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.background = "#34D399";
                          e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                          e.target.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.background = "#10B981";
                          e.target.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.2)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      🛒 Agregar todo al carrito
                    </button>
                  </div>
                )}
              </div>

              {/* GRID DE PRODUCTOS */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "25px"
              }}>
                {favoritos.map((fav) => (
                  <div
                    key={fav.idFavorito}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.4s ease",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      border: "1px solid #f1f5f9",
                      cursor: "pointer"
                    }}
                    onClick={() => navigate(`/producto/${fav.idProducto}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarFavorito(fav.idFavorito, fav.nombreProducto);
                      }}
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        background: "white",
                        border: "2px solid #dc2626",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        zIndex: "2",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        fontFamily: "'Inter', sans-serif"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#dc2626";
                        e.target.style.color = "white";
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "white";
                        e.target.style.color = "#dc2626";
                        e.target.style.transform = "scale(1)";
                      }}
                      title="Quitar de favoritos"
                    >
                      ✕
                    </button>

                    {/* Botón agregar al carrito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        agregarAlCarritoDesdeFavoritos(fav.idProducto, fav.nombreProducto);
                      }}
                      disabled={agregandoAlCarrito[fav.idProducto]}
                      style={{
                        position: "absolute",
                        top: "15px",
                        left: "15px",
                        background: agregandoAlCarrito[fav.idProducto] ? "#10B981" : "white",
                        border: "2px solid #10B981",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        cursor: agregandoAlCarrito[fav.idProducto] ? "wait" : "pointer",
                        fontSize: agregandoAlCarrito[fav.idProducto] ? "14px" : "18px",
                        fontWeight: "700",
                        color: agregandoAlCarrito[fav.idProducto] ? "white" : "#10B981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        zIndex: "2",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        fontFamily: "'Inter', sans-serif",
                        animation: agregandoAlCarrito[fav.idProducto] ? "pulse 1s infinite" : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (!agregandoAlCarrito[fav.idProducto]) {
                          e.target.style.background = "#10B981";
                          e.target.style.color = "white";
                          e.target.style.transform = "scale(1.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!agregandoAlCarrito[fav.idProducto]) {
                          e.target.style.background = "white";
                          e.target.style.color = "#10B981";
                          e.target.style.transform = "scale(1)";
                        }
                      }}
                      title={agregandoAlCarrito[fav.idProducto] ? "Agregando..." : "Agregar al carrito"}
                    >
                      {agregandoAlCarrito[fav.idProducto] ? "..." : "🛒"}
                    </button>

                    {/* Imagen del producto */}
                    <div style={{
                      position: "relative",
                      overflow: "hidden",
                      height: "200px",
                      background: "#f8f9fa"
                    }}>
                      <img
                        src={fav.imagenProducto}
                        alt={fav.nombreProducto}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      />
                    </div>

                    {/* Info del producto */}
                    <div style={{
                      padding: "22px",
                      display: "flex",
                      flexDirection: "column",
                      flex: "1"
                    }}>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#2C3E50",
                        marginBottom: "10px",
                        lineHeight: "1.3",
                        fontFamily: "'Inter', sans-serif",
                        minHeight: "46px"
                      }}>
                        {fav.nombreProducto}
                      </h3>

                      <div style={{
                        marginTop: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                      }}>
                        <div style={{
                          fontSize: "28px",
                          fontWeight: "800",
                          color: "#FF6B35",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          ${fav.precioProducto}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL LATERAL - DERECHA */}
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9"
              }}>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#FF6B35",
                  marginBottom: "24px",
                  paddingBottom: "16px",
                  borderBottom: "2px solid #f1f5f9",
                  fontFamily: "'Playfair Display', serif"
                }}>💝 Tus Favoritos</h2>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "24px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ 
                      color: "#64748b", 
                      fontSize: "16px", 
                      fontWeight: "600",
                      fontFamily: "'Inter', sans-serif"
                    }}>Productos guardados</span>
                    <span style={{ 
                      color: "#2C3E50", 
                      fontSize: "20px", 
                      fontWeight: "800",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {favoritos.length}
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
                    }}>Total guardados</span>
                    <span style={{ 
                      color: "#FF6B35", 
                      fontSize: "32px", 
                      fontWeight: "900",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {favoritos.length}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button
                    onClick={agregarTodosAlCarrito}
                    disabled={loading || favoritos.length === 0}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "#10B981",
                      border: "2px solid #10B981",
                      color: "white",
                      borderRadius: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                      fontFamily: "'Inter', sans-serif",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                      opacity: (loading || favoritos.length === 0) ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => { 
                      if (!loading && favoritos.length > 0) {
                        e.target.style.background = "#34D399";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.35)";
                      }
                    }}
                    onMouseLeave={(e) => { 
                      if (!loading && favoritos.length > 0) {
                        e.target.style.background = "#10B981";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.25)";
                      }
                    }}
                  >🛒 Agregar todo al carrito</button>

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
                  >← Explorar más productos</button>

                  <button
                    onClick={() => navigate("/carrito")}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "#FF6B35",
                      border: "2px solid #FF6B35",
                      color: "white",
                      borderRadius: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                      fontFamily: "'Inter', sans-serif",
                      boxShadow: "0 4px 12px rgba(255, 107, 53, 0.25)"
                    }}
                    onMouseEnter={(e) => { 
                      e.target.style.background = "#FF8E53";
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 6px 16px rgba(255, 107, 53, 0.35)";
                    }}
                    onMouseLeave={(e) => { 
                      e.target.style.background = "#FF6B35";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.25)";
                    }}
                  >🛒 Ir al carrito</button>
                </div>

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
                  }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Guarda productos para comprar después</p>
                  <p style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "'Inter', sans-serif"
                  }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Agrega al carrito directamente</p>
                  <p style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "'Inter', sans-serif"
                  }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Agrega múltiples productos de una vez</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}