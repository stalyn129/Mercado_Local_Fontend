import { useEffect, useState } from "react";
import Footer from "../../components/Footer.jsx";

export default function ResenasVendedor() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productoAbierto, setProductoAbierto] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.12)",
        "rgba(52, 211, 153, 0.12)",
        "rgba(59, 130, 246, 0.12)",
        "rgba(168, 85, 247, 0.12)",
        "rgba(239, 68, 68, 0.12)",
        "rgba(245, 158, 11, 0.12)",
        "rgba(14, 165, 233, 0.12)",
        "rgba(236, 72, 153, 0.12)"
      ];
      
      for (let i = 0; i < 10; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 20 + 25 + "s",
          blur: Math.random() * 3 + 1 + "px",
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
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

  // Calcular distribución de calificaciones
  const calcularDistribucion = () => {
    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    resenas.forEach(r => {
      const calificacion = Number(r.calificacion);
      if (calificacion >= 1 && calificacion <= 5) {
        distribucion[calificacion]++;
      }
    });
    return distribucion;
  };

  const distribucion = calcularDistribucion();

  return (
    <div style={{ 
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden",
      position: "relative"
    }}>
      
      {/* CÍRCULOS DE COLORES ANIMADOS EN EL FONDO */}
      {circlePositions.map(circle => (
        <div 
          key={circle.id}
          style={{
            position: "fixed",
            top: `${circle.top}%`,
            left: `${circle.left}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            background: circle.color,
            borderRadius: "50%",
            animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
            animationDelay: circle.animationDelay,
            filter: `blur(${circle.blur})`,
            opacity: 0.7,
            zIndex: circle.zIndex,
            pointerEvents: "none"
          }}
        />
      ))}

      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px",
        position: "relative",
        zIndex: "10"
      }}>
        
        {/* Header EXACTAMENTE como en el ejemplo */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "60px 40px",
          marginBottom: "40px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid #f1f5f9"
        }}>
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
              Opiniones de Clientes
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "48px",
              fontWeight: "700",
              color: "#2C3E50",
              margin: "0 0 16px 0",
              letterSpacing: "0.5px",
              lineHeight: "1.2"
            }}>
              Reseñas de Productos
            </h1>
            
            <p style={{
              color: "#8B5CF6",
              fontSize: "16px",
              margin: "0 auto",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontWeight: "400",
              opacity: 0.8
            }}>
              Lo que dicen tus clientes sobre tus productos
            </p>
          </div>
        </div>

        {/* Tarjetas de Estadísticas - EXACTAMENTE como en el ejemplo */}
        {resenas.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "40px"
          }}>
            {/* Promedio General */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              transition: "all 0.4s ease",
              border: "1px solid #f1f5f9",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(255, 107, 53, 0.15)";
              e.currentTarget.style.borderColor = "#FF6B35";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}>
              <div style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                background: "rgba(255, 107, 53, 0.08)",
                borderRadius: "50%",
                zIndex: "0"
              }}></div>
              
              <div style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#64748b", 
                marginBottom: "12px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                position: "relative",
                zIndex: "1"
              }}>
                ⭐ Promedio General
              </div>
              <div style={{ 
                fontSize: "42px", 
                fontWeight: "800", 
                color: "#FF6B35",
                position: "relative",
                zIndex: "1"
              }}>
                {promedio}
              </div>
              <div style={{
                marginTop: "15px",
                fontSize: "13px",
                color: "#94a3b8",
                position: "relative",
                zIndex: "1"
              }}>
                <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Puntuación promedio
              </div>
            </div>

            {/* Productos Valorados */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              transition: "all 0.4s ease",
              border: "1px solid #f1f5f9",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(59, 130, 246, 0.15)";
              e.currentTarget.style.borderColor = "#3B82F6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}>
              <div style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                background: "rgba(59, 130, 246, 0.08)",
                borderRadius: "50%",
                zIndex: "0"
              }}></div>
              
              <div style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#64748b", 
                marginBottom: "12px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                position: "relative",
                zIndex: "1"
              }}>
                📦 Productos Valorados
              </div>
              <div style={{ 
                fontSize: "42px", 
                fontWeight: "800", 
                color: "#3B82F6",
                position: "relative",
                zIndex: "1"
              }}>
                {productos.length}
              </div>
              <div style={{
                marginTop: "15px",
                fontSize: "13px",
                color: "#94a3b8",
                position: "relative",
                zIndex: "1"
              }}>
                <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Con al menos 1 reseña
              </div>
            </div>

            {/* Total Reseñas */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              transition: "all 0.4s ease",
              border: "1px solid #f1f5f9",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(52, 211, 153, 0.15)";
              e.currentTarget.style.borderColor = "#34D399";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}>
              <div style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                background: "rgba(52, 211, 153, 0.08)",
                borderRadius: "50%",
                zIndex: "0"
              }}></div>
              
              <div style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#64748b", 
                marginBottom: "12px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                position: "relative",
                zIndex: "1"
              }}>
                💬 Total Reseñas
              </div>
              <div style={{ 
                fontSize: "42px", 
                fontWeight: "800", 
                color: "#34D399",
                position: "relative",
                zIndex: "1"
              }}>
                {resenas.length}
              </div>
              <div style={{
                marginTop: "15px",
                fontSize: "13px",
                color: "#94a3b8",
                position: "relative",
                zIndex: "1"
              }}>
                <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Opiniones de clientes
              </div>
            </div>
          </div>
        )}

        {/* Distribución de Calificaciones - ESTILO DEL EJEMPLO */}
        {resenas.length > 0 && (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "40px",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px"
            }}>
              <div style={{
                fontSize: "28px",
                color: "#F59E0B"
              }}>
                📊
              </div>
              <div>
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 4px 0"
                }}>
                  Distribución de Calificaciones
                </h3>
                <p style={{
                  color: "#64748b",
                  fontSize: "14px",
                  margin: "0",
                  fontWeight: "500"
                }}>
                  ¿Cómo califican tus clientes?
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const porcentaje = resenas.length > 0 
                  ? (distribucion[stars] / resenas.length) * 100 
                  : 0;
                
                return (
                  <div key={stars} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#475569",
                      minWidth: "60px"
                    }}>
                      {stars} estrellas
                    </div>
                    
                    <div style={{
                      flex: 1,
                      height: "24px",
                      background: "#f1f5f9",
                      borderRadius: "12px",
                      overflow: "hidden",
                      position: "relative"
                    }}>
                      <div style={{
                        width: `${porcentaje}%`,
                        height: "100%",
                        background: stars === 5 ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" :
                                  stars === 4 ? "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)" :
                                  stars === 3 ? "linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)" :
                                  stars === 2 ? "linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)" :
                                  "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                        borderRadius: "12px",
                        transition: "width 1s ease"
                      }}></div>
                    </div>
                    
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#475569",
                      minWidth: "80px",
                      textAlign: "right"
                    }}>
                      {distribucion[stars]} ({porcentaje.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contenedor Principal de Productos - ESTILO DEL EJEMPLO */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "30px"
          }}>
            <div style={{
              fontSize: "28px",
              color: "#F59E0B",
              display: "flex",
              alignItems: "center"
            }}>
              📋
            </div>
            <div>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#2C3E50",
                margin: "0 0 4px 0"
              }}>
                Reseñas por Producto
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: "14px",
                margin: "0",
                fontWeight: "500"
              }}>
                {resenas.length} reseñas en {productos.length} productos
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              background: "white",
              borderRadius: "16px",
              marginBottom: "20px"
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
                fontWeight: "600" 
              }}>
                Cargando reseñas...
              </p>
            </div>
          ) : resenas.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px", 
              color: "#64748b",
              background: "#f8f9fa",
              borderRadius: "14px",
              marginBottom: "20px"
            }}>
              <div style={{ 
                fontSize: "64px", 
                marginBottom: "16px",
                opacity: 0.5
              }}>📦</div>
              <p style={{ 
                fontWeight: "600",
                fontSize: "16px",
                marginBottom: "8px",
                color: "#2C3E50"
              }}>No hay reseñas</p>
              <p style={{ 
                fontSize: "14px",
                opacity: 0.7
              }}>Las reseñas aparecerán aquí</p>
            </div>
          ) : (
            <div style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px"
            }}>
              {productos.map((p) => (
                <div 
                  key={p.idProducto}
                  style={{
                    background: productoAbierto === p.idProducto 
                      ? "#FFFBEB" 
                      : "#FAFCF8",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "12px",
                    transition: "all 0.3s ease",
                    borderLeft: "4px solid transparent",
                    border: "1px solid #f1f5f9",
                    minHeight: "90px",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(5px)";
                    e.currentTarget.style.borderLeftColor = "#FF6B35";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.borderLeftColor = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() =>
                    setProductoAbierto(
                      productoAbierto === p.idProducto ? null : p.idProducto
                    )
                  }
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <img
                        src={p.imagenProducto || "https://via.placeholder.com/60x60?text=Producto"}
                        alt={p.nombreProducto}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          border: "2px solid white",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <div>
                        <div style={{ 
                          fontWeight: "800", 
                          color: "#2C3E50", 
                          fontSize: "16px",
                          marginBottom: "6px"
                        }}>
                          {p.nombreProducto}
                        </div>
                        <div style={{ 
                          display: "flex",
                          alignItems: "center",
                          gap: "12px"
                        }}>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px",
                            color: "#64748b", 
                            fontSize: "13px", 
                            marginBottom: "4px",
                            fontWeight: "500"
                          }}>
                            <span style={{ color: "#F59E0B" }}>⭐</span>
                            {promedioProducto(p.reseñas)}/5
                          </div>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px",
                            color: "#64748b", 
                            fontSize: "13px", 
                            fontWeight: "500"
                          }}>
                            <span style={{ color: "#8B5CF6" }}>💬</span>
                            {p.reseñas.length} reseñas
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center",
                      gap: "12px"
                    }}>
                      <div style={{
                        background: "#F59E0B",
                        color: "white",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        {promedioProducto(p.reseñas)}/5
                      </div>
                      <div style={{
                        color: "#64748b",
                        fontSize: "20px",
                        transition: "transform 0.3s ease",
                        transform: productoAbierto === p.idProducto ? "rotate(180deg)" : "rotate(0deg)"
                      }}>
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* DETALLE DE RESEÑAS (DESPLEGABLE) */}
                  {productoAbierto === p.idProducto && (
                    <div style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                      borderTop: "2px solid #FEF3C7",
                      animation: "slideDown 0.3s ease"
                    }}>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "16px"
                      }}>
                        {p.reseñas.map((r) => (
                          <div
                            key={r.idValoracion}
                            style={{
                              background: "white",
                              borderRadius: "12px",
                              padding: "20px",
                              border: "1px solid #f1f5f9",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                            }}
                          >
                            {/* Header de la reseña */}
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "12px"
                            }}>
                              {/* Estrellas */}
                              <div style={{
                                fontSize: "18px",
                                letterSpacing: "2px"
                              }}>
                                {renderEstrellas(r.calificacion)}
                              </div>

                              {/* Fecha */}
                              <div style={{
                                color: "#64748B",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}>
                                {r.fechaValoracion?.substring(0, 10)}
                              </div>
                            </div>

                            {/* Comentario */}
                            <div style={{
                              marginBottom: "16px"
                            }}>
                              <p style={{
                                margin: 0,
                                color: "#475569",
                                fontSize: "14px",
                                lineHeight: "1.6"
                              }}>
                                {r.comentario}
                              </p>
                            </div>

                            {/* Cliente */}
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px"
                            }}>
                              <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "#8B5CF6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                color: "white",
                                fontWeight: "600"
                              }}>
                                {r.nombreConsumidor?.charAt(0) || "C"}
                              </div>
                              <div>
                                <div style={{
                                  fontWeight: "600",
                                  color: "#2C3E50",
                                  fontSize: "14px"
                                }}>
                                  {r.nombreConsumidor}
                                </div>
                              </div>
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

          {/* Footer de estadísticas - ESTILO DEL EJEMPLO */}
          {resenas.length > 0 && (
            <div style={{
              padding: "24px",
              background: "#F7FAFC",
              borderRadius: "16px",
              borderTop: "2px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "40px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#64748B",
                    fontWeight: "600"
                  }}>
                    <span>📦</span>
                    <span>{productos.length} productos valorados</span>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#64748B",
                    fontWeight: "600"
                  }}>
                    <span>💬</span>
                    <span>{resenas.length} reseñas totales</span>
                  </div>
                </div>
              </div>
              
              <div style={{
                textAlign: "right"
              }}>
                <div style={{
                  fontSize: "12px",
                  color: "#64748B",
                  fontWeight: "600",
                  marginBottom: "4px"
                }}>
                  DISTRIBUCIÓN DE ESTRELLAS
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#F59E0B",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {renderEstrellas(Math.round(Number(promedio)))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
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
        
        @keyframes slideDown {
          0% { 
            opacity: 0;
            transform: translateY(-10px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Estilos para el scroll */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Responsive */
        @media (max-width: 1100px) {
          .stats-grid {
            grid-templateColumns: repeat(2, 1fr) !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
        }
        
        @media (max-width: 768px) {
          .main-container {
            padding: 20px 16px !important;
          }
          
          h1 {
            font-size: 32px !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .product-header {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: flex-start !important;
          }
          
          .footer-stats {
            flex-direction: column !important;
            gap: 16px !important;
            text-align: center !important;
          }
          
          .review-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-section {
            padding: 30px 20px !important;
          }
          
          .distribution-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        button, input, select {
          font-family: 'Inter', sans-serif;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
        }
        
        p, span, div {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}