import { useEffect, useState } from "react";
import Footer from "../../components/Footer.jsx";


export default function ResenasVendedor() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productoAbierto, setProductoAbierto] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !user.idVendedor) {
      alert("⚠ Debes iniciar sesión como vendedor");
      window.location.href = "/loginmodal";
      return;
    }

    if (!token) {
      alert("⚠ No se encontró token de autenticación");
      window.location.href = "/loginmodal";
      return;
    }

    cargarResenas(user.idVendedor, token);
  }, []);

  const cargarResenas = async (idVendedor, token) => {
    try {
      const res = await fetch(`${API_URL}/valoraciones/vendedor/${idVendedor}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Error al cargar reseñas");
      }

      const data = await res.json();
      setResenas(data);
    } catch (error) {
      console.error("❌ Error al cargar reseñas:", error);
      alert("Error al cargar las reseñas. Por favor, inicia sesión nuevamente.");
      window.location.href = "/loginmodal";
    } finally {
      setLoading(false);
    }
  };

  const renderEstrellas = (cantidad) => {
    return "⭐".repeat(cantidad) + "☆".repeat(5 - cantidad);
  };

  // Agrupar reseñas por producto
  const reseñasPorProducto = resenas.reduce((acc, r) => {
    if (!acc[r.idProducto]) {
      acc[r.idProducto] = {
        idProducto: r.idProducto,
        nombreProducto: r.nombreProducto,
        imagenProducto: r.imagenProducto,
        reseñas: []
      };
    }
    acc[r.idProducto].reseñas.push(r);
    return acc;
  }, {});

  const productos = Object.values(reseñasPorProducto);

  // Calcular promedio por producto
  const promedioProducto = (reseñas) =>
    (
      reseñas.reduce((acc, r) => acc + Number(r.calificacion), 0) /
      reseñas.length
    ).toFixed(1);

  // Calcular promedio general
  const promedio =
    resenas.length > 0
      ? (
          resenas.reduce(
            (acc, r) => acc + Number(r.calificacion),
            0
          ) / resenas.length
        ).toFixed(1)
      : "0.0";

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
                display: "flex",
                gap: "24px",
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <div style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #FFF9E6 0%, #FFF3D6 100%)",
                  padding: "20px 36px",
                  borderRadius: "16px",
                  border: "2px solid #F5C744"
                }}>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#F5C744",
                    marginBottom: "4px"
                  }}>
                    {promedio} ⭐
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

                <div style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
                  padding: "20px 36px",
                  borderRadius: "16px",
                  border: "2px solid #5A8F48"
                }}>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#5A8F48",
                    marginBottom: "4px"
                  }}>
                    {productos.length}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6B7F69",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Productos Valorados
                  </div>
                </div>

                <div style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                  padding: "20px 36px",
                  borderRadius: "16px",
                  border: "2px solid #42A5F5"
                }}>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#42A5F5",
                    marginBottom: "4px"
                  }}>
                    {resenas.length}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#6B7F69",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Total Reseñas
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productos con Reseñas */}
        {loading ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "80px 20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
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
            <p style={{ marginTop: "20px", marginBottom: 0, fontWeight: "600", color: "#6B7F69" }}>
              Cargando reseñas...
            </p>
          </div>
        ) : resenas.length === 0 ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "80px 20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
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
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {productos.map((p) => (
              <div
                key={p.idProducto}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(90, 143, 72, 0.08)",
                  border: "2px solid",
                  borderColor: productoAbierto === p.idProducto ? "#5A8F48" : "transparent",
                  transition: "all 0.3s ease"
                }}
              >
                {/* ===== HEADER DEL PRODUCTO (CLICKEABLE) ===== */}
                <div
                  onClick={() =>
                    setProductoAbierto(
                      productoAbierto === p.idProducto ? null : p.idProducto
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "24px",
                    cursor: "pointer",
                    background: productoAbierto === p.idProducto 
                      ? "linear-gradient(135deg, #F0F7ED 0%, #E8F5E9 100%)" 
                      : "#FAFCF8",
                    transition: "background 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (productoAbierto !== p.idProducto) {
                      e.currentTarget.style.background = "#F5F7F3";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (productoAbierto !== p.idProducto) {
                      e.currentTarget.style.background = "#FAFCF8";
                    }
                  }}
                >
                  {/* Imagen del Producto */}
                  <img
                    src={p.imagenProducto || "/img/producto-default.png"}
                    alt={p.nombreProducto}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "3px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />

                  {/* Información del Producto */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: "0 0 8px 0",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      lineHeight: "1.3"
                    }}>
                      {p.nombreProducto}
                    </h3>
                    
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap"
                    }}>
                      {/* Promedio */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "white",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "1px solid #F5C744"
                      }}>
                        <span style={{ fontSize: "18px" }}>⭐</span>
                        <span style={{
                          fontWeight: "700",
                          fontSize: "16px",
                          color: "#F5C744"
                        }}>
                          {promedioProducto(p.reseñas)}
                        </span>
                      </div>

                      {/* Cantidad de reseñas */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#6B7F69",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}>
                        <span style={{ fontSize: "16px" }}>💬</span>
                        {p.reseñas.length} {p.reseñas.length === 1 ? "reseña" : "reseñas"}
                      </div>
                    </div>
                  </div>

                  {/* Icono de expandir/colapsar */}
                  <div style={{
                    fontSize: "24px",
                    color: "#5A8F48",
                    transition: "transform 0.3s ease",
                    transform: productoAbierto === p.idProducto ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    ▼
                  </div>
                </div>

                {/* ===== DETALLE DE RESEÑAS (DESPLEGABLE) ===== */}
                {productoAbierto === p.idProducto && (
                  <div style={{
                    padding: "24px",
                    background: "white",
                    borderTop: "2px solid #F0F4ED"
                  }}>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px"
                    }}>
                      {p.reseñas.map((r) => (
                        <div
                          key={r.idValoracion}
                          style={{
                            padding: "20px",
                            background: "#FAFCF8",
                            borderRadius: "12px",
                            border: "1px solid #ECF2E3",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.1)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {/* Header de la reseña */}
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                            flexWrap: "wrap",
                            gap: "12px"
                          }}>
                            {/* Estrellas */}
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px"
                            }}>
                              <div style={{
                                fontSize: "20px",
                                letterSpacing: "3px"
                              }}>
                                {renderEstrellas(r.calificacion)}
                              </div>
                              <span style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#F5C744"
                              }}>
                                {r.calificacion}/5
                              </span>
                            </div>

                            {/* Fecha */}
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#9AAA98",
                              fontSize: "13px",
                              fontWeight: "600"
                            }}>
                              <span style={{ fontSize: "16px" }}>📅</span>
                              {r.fechaValoracion?.substring(0, 10)}
                            </div>
                          </div>

                          {/* Comentario */}
                          <div style={{
                            padding: "16px",
                            background: "white",
                            borderRadius: "10px",
                            borderLeft: "4px solid #5A8F48",
                            marginBottom: "12px"
                          }}>
                            <p style={{
                              margin: 0,
                              color: "#2D3E2B",
                              fontSize: "15px",
                              lineHeight: "1.6",
                              fontStyle: "italic"
                            }}>
                              "{r.comentario}"
                            </p>
                          </div>

                          {/* Cliente */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            paddingTop: "12px",
                            borderTop: "1px solid #ECF2E3"
                          }}>
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px"
                            }}>
                              👤
                            </div>
                            <span style={{
                              fontWeight: "600",
                              color: "#2D3E2B",
                              fontSize: "14px"
                            }}>
                              {r.nombreConsumidor}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      `}</style>
    </div>
  );
}