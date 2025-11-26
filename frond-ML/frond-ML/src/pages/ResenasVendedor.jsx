import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function ResenasVendedor() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.idVendedor) {
      alert("⚠ Debes iniciar sesión como vendedor");
      window.location.href = "/loginmodal";
      return;
    }

    cargarResenas(user.idVendedor);
  }, []);

  const cargarResenas = async (idVendedor) => {
    try {
      const res = await fetch(`${API_URL}/resenas/vendedor/${idVendedor}`);
      const data = await res.json();
      setResenas(data);
    } catch (error) {
      console.error("❌ Error al cargar reseñas:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderEstrellas = (cantidad) => {
    return "⭐".repeat(cantidad) + "☆".repeat(5 - cantidad);
  };

  // Calcular promedio de calificación
  const promedioEstrellas = resenas.length > 0 
    ? (resenas.reduce((sum, r) => sum + r.estrellas, 0) / resenas.length).toFixed(1)
    : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Contenedor Principal */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 20px",
        paddingBottom: "40px",
        width: "100%",
        flex: "1"
      }}>

        {/* Header Section Mejorado */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decoración de fondo */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
            borderRadius: "50%",
            opacity: "0.5",
            zIndex: "0"
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
            borderRadius: "50%",
            opacity: "0.1",
            zIndex: "0"
          }}></div>

          <div style={{ position: "relative", zIndex: "1" }}>
            {/* Icono decorativo */}
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
            }}>
              ⭐
            </div>

            {/* Título principal */}
            <h1 style={{
              fontSize: "42px",
              fontWeight: "800",
              color: "#2D3E2B",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
              lineHeight: "1.2"
            }}>
              Reseñas de Clientes
            </h1>

            {/* Subtítulo */}
            <p style={{
              color: "#6B7F69",
              fontSize: "16px",
              margin: "0 0 24px 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6"
            }}>
              Opiniones y valoraciones de tus clientes sobre tus productos
            </p>

            {/* Estadística de promedio */}
            {resenas.length > 0 && (
              <div style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #FFF9E6 0%, #FFF3D6 100%)",
                padding: "16px 32px",
                borderRadius: "16px",
                border: "2px solid #F5C744"
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#F5C744",
                  marginBottom: "4px"
                }}>
                  {promedioEstrellas} ⭐
                </div>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#6B7F69",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Promedio General
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Reseñas */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px"
            }}>
              <thead>
                <tr style={{
                  background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                  fontWeight: "700",
                  color: "#2D3E2B"
                }}>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Producto</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Calificación</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Comentario</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cliente</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{
                      textAlign: "center",
                      padding: "80px 20px",
                      color: "#6B7F69",
                      fontSize: "15px"
                    }}>
                      <div style={{
                        display: "inline-block",
                        width: "50px",
                        height: "50px",
                        border: "5px solid #ECF2E3",
                        borderTop: "5px solid #5A8F48",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }}></div>
                      <p style={{ marginTop: "20px", marginBottom: 0, fontWeight: "600" }}>Cargando reseñas...</p>
                    </td>
                  </tr>
                ) : resenas.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{
                      textAlign: "center",
                      padding: "80px 20px"
                    }}>
                      <div style={{ fontSize: "64px", marginBottom: "20px" }}>💬</div>
                      <p style={{
                        color: "#2D3E2B",
                        fontSize: "18px",
                        fontWeight: "600",
                        margin: 0
                      }}>
                        No tienes reseñas aún
                      </p>
                      <p style={{
                        color: "#9AAA98",
                        fontSize: "15px",
                        marginTop: "8px"
                      }}>
                        Las opiniones de tus clientes aparecerán aquí
                      </p>
                    </td>
                  </tr>
                ) : (
                  resenas.map((r) => (
                    <tr key={r.id} style={{
                      borderBottom: "1px solid #F0F4ED",
                      transition: "background 0.2s ease"
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#FAFCF8"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      {/* Producto */}
                      <td style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                        fontSize: "14px"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span style={{ fontSize: "20px" }}>📦</span>
                          {r.nombreProducto}
                        </div>
                      </td>

                      {/* Calificación */}
                      <td style={{ padding: "16px" }}>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}>
                          <div style={{
                            fontSize: "18px",
                            letterSpacing: "2px"
                          }}>
                            {renderEstrellas(r.estrellas)}
                          </div>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#F5C744"
                          }}>
                            {r.estrellas}/5
                          </span>
                        </div>
                      </td>

                      {/* Comentario */}
                      <td style={{
                        padding: "16px",
                        color: "#6B7F69",
                        fontSize: "14px",
                        maxWidth: "300px"
                      }}>
                        <div style={{
                          background: "#FAFCF8",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          borderLeft: "3px solid #5A8F48",
                          fontStyle: "italic"
                        }}>
                          "{r.comentario}"
                        </div>
                      </td>

                      {/* Cliente */}
                      <td style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                        fontSize: "14px"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span style={{ fontSize: "20px" }}>👤</span>
                          {r.nombreCliente}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td style={{
                        padding: "16px",
                        color: "#6B7F69",
                        fontSize: "14px",
                        fontWeight: "500"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <span style={{ fontSize: "16px" }}>📅</span>
                          {r.fecha}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          {resenas.length > 0 && (
            <div style={{
              padding: "24px 28px",
              background: "#FAFCF8",
              borderTop: "2px solid #ECF2E3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              color: "#6B7F69",
              fontWeight: "500"
            }}>
              <span>
                Mostrando <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{resenas.length}</strong> reseñas
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#5A8F48" }}>
                💬 Total de opiniones
              </span>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}