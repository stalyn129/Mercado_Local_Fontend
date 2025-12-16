import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import { useFavoritos } from "../../context/FavoritosContext.jsx";

export default function Favoritos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // ✅ USA SOLO EL CONTEXTO - NO useState local
  const { favoritos, cargarFavoritos } = useFavoritos();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ CARGA INICIAL usando el contexto
  useEffect(() => {
    const loadFavoritos = async () => {
      await cargarFavoritos();
      setLoading(false);
    };
    loadFavoritos();
  }, [cargarFavoritos]);

  // ✅ ELIMINAR UNO - llama al backend y recarga
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

      // 🔥 RECARGA desde backend - NO modifiques estado manualmente
      await cargarFavoritos();
    } catch (err) {
      console.error("Error eliminando favorito:", err);
      alert("Error inesperado al eliminar favorito");
    }
  };

  // ✅ VACIAR TODOS - elimina en backend y recarga
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

      // 🔥 RECARGA desde backend - NO modifiques estado manualmente
      await cargarFavoritos();
      alert("Se han vaciado tus favoritos");
    } catch (err) {
      console.error("Error vaciando favoritos:", err);
      alert("Error al vaciar tus favoritos");
    }
  };

  // ===================== UI =====================
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      
      {/* HEADER SECTION */}
      <div style={{
        background: "white",
        borderRadius: "0 0 20px 20px",
        padding: "48px 32px",
        marginBottom: "40px",
        boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decoración de fondo - Círculos suaves CON ANIMACIÓN */}
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "250px",
          height: "250px",
          background: "linear-gradient(135deg, rgba(255, 229, 233, 0.6) 0%, rgba(255, 208, 217, 0.4) 100%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: "0",
          animation: "float1 8s ease-in-out infinite"
        }}></div>
        
        <div style={{
          position: "absolute",
          top: "50%",
          right: "10%",
          width: "150px",
          height: "150px",
          background: "linear-gradient(135deg, rgba(218, 62, 82, 0.15) 0%, rgba(176, 34, 62, 0.08) 100%)",
          borderRadius: "50%",
          filter: "blur(30px)",
          zIndex: "0",
          animation: "float2 10s ease-in-out infinite"
        }}></div>
        
        <div style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "200px",
          height: "200px",
          background: "linear-gradient(135deg, rgba(90, 143, 72, 0.12) 0%, rgba(74, 122, 58, 0.06) 100%)",
          borderRadius: "50%",
          filter: "blur(35px)",
          zIndex: "0",
          animation: "float3 12s ease-in-out infinite"
        }}></div>
        
        <div style={{
          position: "absolute",
          top: "20%",
          left: "15%",
          width: "120px",
          height: "120px",
          background: "linear-gradient(135deg, rgba(236, 242, 227, 0.8) 0%, rgba(221, 232, 208, 0.5) 100%)",
          borderRadius: "50%",
          filter: "blur(25px)",
          zIndex: "0",
          animation: "float4 9s ease-in-out infinite"
        }}></div>

        <div style={{ position: "relative", zIndex: "1" }}>
          {/* Icono decorativo */}
          <div style={{
            fontSize: "56px",
            marginBottom: "16px",
            filter: "drop-shadow(0 4px 8px rgba(218, 62, 82, 0.2))"
          }}>
            ❤️
          </div>

          {/* Título estilo Don Carlos Market */}
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#6B7F69",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Productos Guardados
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "700",
            color: "#2D3E2B",
            margin: "0 0 16px 0",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Tus Favoritos
          </h1>

          {/* Subtítulo */}
          <p style={{
            color: "#6B7F69",
            fontSize: "16px",
            margin: "0 auto 24px auto",
            maxWidth: "600px",
            lineHeight: "1.6"
          }}>
            {favoritos.length > 0 
              ? `Tienes ${favoritos.length} producto${favoritos.length > 1 ? 's' : ''} guardado${favoritos.length > 1 ? 's' : ''} en tus favoritos`
              : "Guarda tus productos favoritos para verlos más tarde"
            }
          </p>

          {/* Botón Vaciar solo si hay favoritos */}
          {favoritos.length > 0 && (
            <button
              onClick={vaciarFavoritos}
              style={{
                padding: "12px 24px",
                background: "#FFF0F2",
                color: "#DA3E52",
                border: "2px solid #DA3E52",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(218, 62, 82, 0.15)"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#DA3E52";
                e.target.style.color = "white";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(218, 62, 82, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#FFF0F2";
                e.target.style.color = "#DA3E52";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(218, 62, 82, 0.15)";
              }}
            >
              🗑 Vaciar favoritos
            </button>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px",
        marginBottom: "40px"
      }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
          }}>
            <div style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "5px solid #ECF2E3",
              borderTop: "5px solid #DA3E52",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{
              marginTop: "20px",
              fontSize: "16px",
              color: "#6B7F69",
              fontWeight: "600"
            }}>
              Cargando favoritos...
            </p>
          </div>
        ) : favoritos.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>💔</div>
            <p style={{
              color: "#2D3E2B",
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 8px 0"
            }}>
              No tienes productos favoritos aún
            </p>
            <p style={{
              color: "#9AAA98",
              fontSize: "15px",
              margin: "0 0 24px 0"
            }}>
              Explora nuestros productos y guarda tus favoritos
            </p>
            <button
              onClick={() => navigate("/explorar")}
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                border: "none",
                color: "white",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
              }}
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "25px"
          }}>
            {favoritos.map((fav) => (
              <div
                key={fav.idFavorito}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(90, 143, 72, 0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
                }}
              >
                {/* Botón eliminar */}
                <button
                  onClick={() => eliminarFavorito(fav.idFavorito)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "2px solid #DA3E52",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#DA3E52",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    zIndex: "2",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#DA3E52";
                    e.target.style.color = "white";
                    e.target.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.95)";
                    e.target.style.color = "#DA3E52";
                    e.target.style.transform = "scale(1)";
                  }}
                  title="Quitar de favoritos"
                >
                  ✕
                </button>

                {/* Imagen del producto */}
                <div
                  onClick={() => navigate(`/producto/${fav.idProducto}`)}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "200px",
                    background: "#F9FBF7",
                    cursor: "pointer"
                  }}
                >
                  <img
                    src={fav.imagenProducto}
                    alt={fav.nombreProducto}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease"
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
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  flex: "1"
                }}>
                  <h3
                    onClick={() => navigate(`/producto/${fav.idProducto}`)}
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      marginBottom: "8px",
                      lineHeight: "1.3",
                      cursor: "pointer",
                      transition: "color 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#5A8F48";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#2D3E2B";
                    }}
                  >
                    {fav.nombreProducto}
                  </h3>

                  <div style={{
                    marginTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <div style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#5A8F48"
                    }}>
                      ${fav.precioProducto}
                    </div>

                    <button
                      onClick={() => navigate(`/producto/${fav.idProducto}`)}
                      style={{
                        width: "100%",
                        padding: "14px",
                        background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                        border: "none",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
                      }}
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-15px, -20px);
          }
          50% {
            transform: translate(10px, -15px);
          }
          75% {
            transform: translate(-5px, 10px);
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(-20px, 15px);
          }
          66% {
            transform: translate(15px, -10px);
          }
        }

        @keyframes float3 {
          0%, 100% {
            transform: translate(0, 0);
          }
          30% {
            transform: translate(20px, -15px);
          }
          60% {
            transform: translate(-10px, 20px);
          }
        }

        @keyframes float4 {
          0%, 100% {
            transform: translate(0, 0);
          }
          40% {
            transform: translate(15px, 20px);
          }
          80% {
            transform: translate(-20px, -10px);
          }
        }
      `}</style>
    </div>
  );
}