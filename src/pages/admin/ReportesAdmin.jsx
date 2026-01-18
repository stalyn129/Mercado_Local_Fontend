import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const API_URL = "http://localhost:8080";

export default function ReportesAdmin() {
  const [ventasCat, setVentasCat] = useState([]);
  const [stockProd, setStockProd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos reales del backend
  useEffect(() => {
    // Verificar todas las posibles ubicaciones del token
    const token = localStorage.getItem("authToken") || 
                  localStorage.getItem("token") || 
                  sessionStorage.getItem("authToken");

    console.log("🔍 Buscando token...");
    console.log("localStorage keys:", Object.keys(localStorage));
    console.log("Token encontrado:", token ? "✅ Sí" : "❌ No");

    if (!token) {
      console.error("❌ No hay token — No puedes ver reportes");
      console.log("💡 Verifica que hayas iniciado sesión correctamente");
      setError("No se encontró token de autenticación. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    console.log("✅ Token encontrado, cargando reportes...");

    Promise.all([
      fetch(`${API_URL}/reportes/ventas-por-categoria`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }).then(async res => {
        console.log("📊 Status ventas-por-categoria:", res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error en ventas:", errorText);
          throw new Error(`${res.status} en ventas: ${errorText}`);
        }
        return res.json();
      }),

      fetch(`${API_URL}/reportes/stock-productos`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }).then(async res => {
        console.log("📊 Status stock-productos:", res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error en stock:", errorText);
          throw new Error(`${res.status} en stock: ${errorText}`);
        }
        return res.json();
      })
    ])
    .then(([ventas, stock]) => {
      console.log("✅ Reportes cargados exitosamente");
      console.log("📈 Ventas por categoría:", ventas);
      console.log("📦 Stock productos:", stock);
      setVentasCat(ventas);
      setStockProd(stock);
      setLoading(false);
    })
    .catch(err => {
      console.error("❌ Error cargando reportes:", err);
      setError(err.message || "Error al cargar los reportes. Verifica tus permisos de administrador.");
      setLoading(false);
    });

  }, []);

  // PIE CHART: VENTAS POR CATEGORÍA
  const pieData = {
    labels: ventasCat.map(v => v.categoria),
    datasets: [
      {
        label: "Ventas ($)",
        data: ventasCat.map(v => v.totalVentas),
        backgroundColor: [
          "#5A8F48", // Verde principal
          "#F5C744", // Amarillo
          "#4A7A3A", // Verde oscuro
          "#DA3E52", // Rojo
          "#6B7F69"  // Gris verde
        ],
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 13, weight: '600' },
          color: '#2D3E2B'
        }
      }
    }
  };

  // BAR CHART: STOCK POR PRODUCTO
  const barData = {
    labels: stockProd.map(p => p.producto),
    datasets: [
      {
        label: "Stock disponible",
        data: stockProd.map(p => p.stock),
        backgroundColor: "#5A8F48",
        borderRadius: 8,
        borderWidth: 0
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#ECF2E3'
        },
        ticks: {
          color: '#6B7F69',
          font: { size: 12, weight: '600' }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#2D3E2B',
          font: { size: 12, weight: '600' }
        }
      }
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      {/* Contenedor Principal */}
      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px"
      }}>
        
        {/* Header Section */}
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
              Reportes Generales
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
              Análisis visual de ventas y stock de tu inventario orgánico
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "100px 20px"
          }}>
            <div style={{ 
              display: "inline-block",
              width: "60px",
              height: "60px",
              border: "6px solid #ECF2E3",
              borderTop: "6px solid #5A8F48",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{ 
              marginTop: "24px", 
              color: "#6B7F69",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              Cargando reportes...
            </p>
          </div>
        ) : error ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "80px 20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(218, 62, 82, 0.1)",
            border: "2px solid #FFF0F2"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚫</div>
            <h2 style={{ 
              color: "#DA3E52", 
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 12px 0"
            }}>
              Error de Acceso
            </h2>
            <p style={{ 
              color: "#6B7F69", 
              fontSize: "16px",
              margin: "0 0 24px 0",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                color: "white",
                padding: "14px 32px",
                fontWeight: "700",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
                boxShadow: "0 4px 16px rgba(90, 143, 72, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 16px rgba(90, 143, 72, 0.3)";
              }}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Grid de Gráficos */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
              gap: "30px",
              marginBottom: "40px"
            }}>
              {/* Card: Ventas por Categoría */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(90, 143, 72, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
              }}>
                {/* Header del Card */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "28px",
                  paddingBottom: "20px",
                  borderBottom: "2px solid #ECF2E3"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
                  }}>
                    🥧
                  </div>
                  <div>
                    <h3 style={{
                      margin: "0",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      letterSpacing: "-0.3px"
                    }}>
                      Ventas por Categoría
                    </h3>
                    <p style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6B7F69",
                      fontWeight: "500"
                    }}>
                      Distribución de ingresos
                    </p>
                  </div>
                </div>

                {/* Gráfico */}
                <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>

                {/* Stats */}
                <div style={{
                  marginTop: "28px",
                  padding: "16px",
                  background: "#FAFCF8",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <span style={{
                    fontSize: "13px",
                    color: "#6B7F69",
                    fontWeight: "600"
                  }}>
                    Total de categorías: <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{ventasCat.length}</strong>
                  </span>
                </div>
              </div>

              {/* Card: Stock por Producto */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(90, 143, 72, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
              }}>
                {/* Header del Card */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "28px",
                  paddingBottom: "20px",
                  borderBottom: "2px solid #ECF2E3"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #F5C744 0%, #E6B933 100%)",
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    boxShadow: "0 4px 12px rgba(245, 199, 68, 0.25)"
                  }}>
                    📊
                  </div>
                  <div>
                    <h3 style={{
                      margin: "0",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      letterSpacing: "-0.3px"
                    }}>
                      Stock por Producto
                    </h3>
                    <p style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6B7F69",
                      fontWeight: "500"
                    }}>
                      Inventario disponible
                    </p>
                  </div>
                </div>

                {/* Gráfico */}
                <div>
                  <Bar data={barData} options={barOptions} />
                </div>

                {/* Stats */}
                <div style={{
                  marginTop: "28px",
                  padding: "16px",
                  background: "#FAFCF8",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <span style={{
                    fontSize: "13px",
                    color: "#6B7F69",
                    fontWeight: "600"
                  }}>
                    Productos registrados: <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{stockProd.length}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Info Footer */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "24px 32px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}>
              <span style={{
                fontSize: "24px"
              }}>📌</span>
              <p style={{
                margin: "0",
                color: "#6B7F69",
                fontSize: "14px",
                fontWeight: "500",
                textAlign: "center"
              }}>
                Gráficos generados con <strong style={{ color: "#5A8F48" }}>Chart.js</strong> y datos en tiempo real del backend
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}