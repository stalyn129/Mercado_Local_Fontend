import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import { useFavoritos } from "../../context/FavoritosContext.jsx";

export default function Favoritos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const { favoritos, cargarFavoritos } = useFavoritos();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [circlePositions, setCirclePositions] = useState([]);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",    // Naranja claro
        "rgba(52, 211, 153, 0.15)",    // Verde esmeralda
        "rgba(59, 130, 246, 0.15)",    // Azul
        "rgba(168, 85, 247, 0.15)",    // Morado
        "rgba(239, 68, 68, 0.15)",     // Rojo
        "rgba(245, 158, 11, 0.15)",    // Amarillo
        "rgba(14, 165, 233, 0.15)",    // Azul claro
        "rgba(236, 72, 153, 0.15)"     // Rosa
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
  const eliminarFavorito = async (idFavorito) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Debes iniciar sesión para gestionar tus favoritos");
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
        alert("No se pudo eliminar el favorito");
        return;
      }

      await cargarFavoritos();
    } catch (err) {
      console.error("Error eliminando favorito:", err);
      alert("Error inesperado al eliminar favorito");
    }
  };

  // VACIAR TODOS - elimina en backend y recarga
  const vaciarFavoritos = async () => {
    if (favoritos.length === 0) return;

    const confirmar = window.confirm(
      "¿Seguro que quieres vaciar todos tus favoritos?"
    );
    if (!confirmar) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Debes iniciar sesión para gestionar tus favoritos");
      return;
    }

    try {
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
      alert("Se han vaciado tus favoritos");
    } catch (err) {
      console.error("Error vaciando favoritos:", err);
      alert("Error al vaciar tus favoritos");
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
      `}</style>

      {/* HEADER SECTION - EXACTAMENTE IGUAL AL CARRITO */}
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
        
        {/* CÍRCULOS DE COLORES ANIMADOS - IGUAL AL CARRITO */}
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
          {/* Subtítulo igual al carrito */}
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
          
          {/* Título principal IGUAL AL CARRITO */}
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "56px", // Mismo tamaño que carrito
            fontWeight: "800", // Mismo peso que carrito
            color: "#FF6B35", // Mismo color que carrito
            margin: "0 0 16px 0", // Mismo margen que carrito
            letterSpacing: "-1px", // Mismo que carrito
            lineHeight: "1.1", // Mismo que carrito
            textShadow: "0 2px 4px rgba(255, 107, 53, 0.1)" // Mismo que carrito
          }}>❤️ Mis Favoritos</h1>
          
          {/* Subtítulo IGUAL AL CARRITO */}
          <p style={{
            color: "#64748b",
            fontSize: "16px", // Mismo tamaño que carrito
            margin: "0 auto", // Mismo que carrito
            maxWidth: "600px", // Mismo que carrito
            lineHeight: "1.6", // Mismo que carrito
            fontWeight: "400",
            fontFamily: "'Inter', sans-serif",
            opacity: 0.8 // Mismo que carrito
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
        maxWidth: "1400px", // Mismo que carrito
        margin: "0 auto",
        padding: "0 20px 40px 20px", // Mismo que carrito
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
              fontSize: "32px", // Mismo tamaño que carrito vacío
              fontWeight: "800", // Mismo peso que carrito vacío
              margin: "0 0 12px 0",
              fontFamily: "'Playfair Display', serif" // Misma fuente que carrito
            }}>No tienes favoritos aún</h2>
            <p style={{
              color: "#64748b",
              fontSize: "16px", // Mismo tamaño que carrito
              marginBottom: "32px",
              fontFamily: "'Inter', sans-serif" // Misma fuente que carrito
            }}>¡Explora nuestros productos y añade tus favoritos!</p>
            <button
              onClick={() => navigate("/explorar")}
              style={{
                padding: "16px 40px", // Mismo padding que carrito
                background: "#FF6B35", // Mismo color que carrito
                border: "none",
                color: "white",
                borderRadius: "12px", // Mismo borde que carrito
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "16px", // Mismo tamaño que carrito
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.25)", // Mismo que carrito
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
            gridTemplateColumns: "1fr 400px", // Mismo layout que carrito cuando hay productos
            gap: "30px",
            alignItems: "start"
          }}>
            {/* LISTA DE PRODUCTOS - IZQUIERDA */}
            <div style={{
              background: "white",
              borderRadius: "24px", // Mismo que carrito
              padding: "32px", // Mismo que carrito
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)", // Mismo que carrito
              border: "1px solid #f1f5f9" // Mismo que carrito
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
                paddingBottom: "20px",
                borderBottom: "2px solid #f1f5f9" // Mismo que carrito
              }}>
                <div>
                  <h2 style={{
                    fontSize: "28px", // Mismo tamaño que carrito
                    fontWeight: "800", // Mismo peso que carrito
                    color: "#2C3E50", // Mismo color que carrito
                    margin: "0 0 6px 0",
                    fontFamily: "'Playfair Display', serif" // Misma fuente que carrito
                  }}>Productos en tus favoritos</h2>
                  <p style={{
                    color: "#64748b", // Mismo color que carrito
                    fontSize: "14px", // Mismo tamaño que carrito
                    margin: "0",
                    fontFamily: "'Inter', sans-serif" // Misma fuente que carrito
                  }}>{favoritos.length} {favoritos.length === 1 ? 'producto' : 'productos'}</p>
                </div>

                {favoritos.length > 0 && (
                  <button
                    onClick={vaciarFavoritos}
                    style={{
                      padding: "12px 24px", // Mismo padding que botón vaciar carrito
                      background: "#fef2f2", // Mismo color que botón vaciar carrito
                      color: "#dc2626", // Mismo color que botón vaciar carrito
                      border: "2px solid #dc2626", // Mismo borde que botón vaciar carrito
                      borderRadius: "12px", // Mismo borde que botón vaciar carrito
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "14px", // Mismo tamaño que botón vaciar carrito
                      transition: "all 0.3s ease",
                      fontFamily: "'Inter', sans-serif" // Misma fuente que carrito
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#dc2626";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#fef2f2";
                      e.target.style.color = "#dc2626";
                    }}
                  >🗑️ Vaciar favoritos</button>
                )}
              </div>

              {/* GRID DE PRODUCTOS (3 columnas como explorar) */}
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
                        eliminarFavorito(fav.idFavorito);
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
                    fontFamily: "'Inter', sans-serif",
                    marginBottom: "16px"
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
                  }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Revisa tus favoritos cuando quieras</p>
                  <p style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "'Inter', sans-serif"
                  }}><span style={{ color: "#10B981", fontSize: "18px" }}>✓</span> Agrega al carrito directamente</p>
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
