import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Footer from "../components/Footer";

// 📊 Chart.js config
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AnalisisVentas() {
  const API_URL = "http://localhost:8080";
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    totalPedidos: 0,
    totalIngresos: 0.0,
    ventasMensuales: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.idVendedor) {
      alert("Debes iniciar sesión como vendedor");
      window.location.href = "/loginmodal";
      return;
    }

    obtenerEstadisticas();
  }, []);

  // 🔥 Cargar estadísticas desde backend
  const obtenerEstadisticas = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos/estadisticas/vendedor/${user.idVendedor}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("❌ Error cargando estadísticas", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: stats.ventasMensuales.map(v => v.mes),
    datasets: [
      {
        label: "Ingresos ($)",
        data: stats.ventasMensuales.map(v => v.total),
        backgroundColor: "#5A8F48",
        borderRadius: 12,
        hoverBackgroundColor: "#4A7A3A"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "600"
          },
          color: "#2D3E2B"
        }
      },
      tooltip: {
        backgroundColor: "#2D3E2B",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        borderRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#F0F4ED"
        },
        ticks: {
          color: "#6B7F69",
          font: {
            size: 12,
            weight: "500"
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: "#6B7F69",
          font: {
            size: 12,
            weight: "600"
          }
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit",
      display: "flex",
      flexDirection: "column"
    }}>

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
              📈
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
              Análisis de Ventas
            </h1>

            {/* Subtítulo */}
            <p style={{
              color: "#6B7F69",
              fontSize: "16px",
              margin: "0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6"
            }}>
              Visualiza el rendimiento de tus ventas y estadísticas clave
            </p>
          </div>
        </div>

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
            <p style={{ marginTop: "20px", color: "#6B7F69", fontWeight: "600" }}>Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            {/* Tarjetas de resumen - Grid mejorado */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "40px"
            }}>
              {/* Card 1 - Pedidos completados */}
              <div style={{
                background: "white",
                padding: "32px 28px",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(90, 143, 72, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
              }}>
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "100px",
                  height: "100px",
                  background: "linear-gradient(135deg, #E8F5E3 0%, #DDE8D0 100%)",
                  borderRadius: "50%",
                  opacity: "0.6"
                }}></div>
                
                <div style={{ position: "relative", zIndex: "1" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>📦</div>
                  <h3 style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#6B7F69",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "12px"
                  }}>
                    Pedidos Completados
                  </h3>
                  <p style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#2D3E2B",
                    margin: "0",
                    lineHeight: "1"
                  }}>
                    {stats.totalPedidos}
                  </p>
                </div>
              </div>

              {/* Card 2 - Total generado */}
              <div style={{
                background: "white",
                padding: "32px 28px",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(90, 143, 72, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
              }}>
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "100px",
                  height: "100px",
                  background: "linear-gradient(135deg, #E8F5E3 0%, #DDE8D0 100%)",
                  borderRadius: "50%",
                  opacity: "0.6"
                }}></div>
                
                <div style={{ position: "relative", zIndex: "1" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>💰</div>
                  <h3 style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#6B7F69",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "12px"
                  }}>
                    Total Generado
                  </h3>
                  <p style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#5A8F48",
                    margin: "0",
                    lineHeight: "1"
                  }}>
                    ${stats.totalIngresos.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Card 3 - Promedio por venta */}
              <div style={{
                background: "white",
                padding: "32px 28px",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(90, 143, 72, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
              }}>
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "100px",
                  height: "100px",
                  background: "linear-gradient(135deg, #E8F5E3 0%, #DDE8D0 100%)",
                  borderRadius: "50%",
                  opacity: "0.6"
                }}></div>
                
                <div style={{ position: "relative", zIndex: "1" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
                  <h3 style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#6B7F69",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "12px"
                  }}>
                    Promedio por Venta
                  </h3>
                  <p style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#2D3E2B",
                    margin: "0",
                    lineHeight: "1"
                  }}>
                    ${(stats.totalIngresos / stats.totalPedidos || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfica de Ventas Mensuales */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "40px 32px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "32px"
              }}>
                <div>
                  <h2 style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#2D3E2B",
                    margin: "0 0 8px 0"
                  }}>
                    Ingresos Mensuales
                  </h2>
                  <p style={{
                    fontSize: "14px",
                    color: "#6B7F69",
                    margin: "0"
                  }}>
                    Evolución de tus ventas a lo largo del tiempo
                  </p>
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  fontSize: "24px"
                }}>
                  📈
                </div>
              </div>

              <div style={{ height: "400px" }}>
                {stats.ventasMensuales.length > 0 ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "#9AAA98"
                  }}>
                    <div style={{ fontSize: "64px", marginBottom: "16px" }}>📉</div>
                    <p style={{ fontSize: "16px", fontWeight: "600", color: "#6B7F69" }}>
                      No hay datos de ventas mensuales disponibles
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
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