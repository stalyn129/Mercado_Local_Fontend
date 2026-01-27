import { useEffect, useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import Footer from "../../components/Footer.jsx";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

export default function ReportesAnalisis() {
  const API_URL = "http://localhost:8080";
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("mes");
  const [selectedProduct, setSelectedProduct] = useState("all");
  
  // Datos estadísticos
  const [stats, setStats] = useState({
    totalPedidos: 0,
    totalIngresos: 0.0,
    ventasMensuales: [],
    productosTop: [],
    categoriasTop: [],
    tendenciaVentas: [],
    pedidosPorEstado: [],
    clientesRecurrentes: []
  });

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
      
      for (let i = 0; i < 12; i++) {
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

  useEffect(() => {
    if (!user || !user.idVendedor) {
      alert("Debes iniciar sesión como vendedor");
      window.location.href = "/loginmodal";
      return;
    }

    cargarDatosReportes();
  }, [selectedPeriod]);

  const cargarDatosReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // ENDPOINTS CORREGIDOS según tu ReportesController
      const endpoints = [
        // 1. Dashboard completo (contiene estadísticas básicas y varios datos)
        `${API_URL}/reportes/dashboard/${user.idVendedor}`,
        // 2. Ventas mensuales específicas
        `${API_URL}/reportes/ventas-mensuales/${user.idVendedor}`,
        // 3. Top productos
        `${API_URL}/reportes/productos-top/${user.idVendedor}`,
        // 4. Clientes recurrentes
        `${API_URL}/reportes/clientes-recurrentes/${user.idVendedor}`,
        // 5. Tendencia de ventas (últimos 30 días)
        `${API_URL}/reportes/tendencia-ventas/${user.idVendedor}`,
        // 6. Estados de pedidos
        `${API_URL}/reportes/estados-pedidos/${user.idVendedor}`,
        // 7. Productos por categoría (para categoriasTop)
        `${API_URL}/reportes/productos-categoria/${user.idVendedor}`
      ];

      console.log("Cargando datos desde endpoints:", endpoints);

      const responses = await Promise.all(
        endpoints.map(url => 
          fetch(url, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }).then(res => {
            if (!res.ok) {
              console.warn(`Endpoint ${url} respondió con status: ${res.status}`);
              return null;
            }
            return res.json();
          }).catch(err => {
            console.error(`Error en endpoint ${url}:`, err);
            return null;
          })
        )
      );

      // Procesar las respuestas
      const [
        dashboardData,
        ventasMensuales,
        productosTop,
        clientesRecurrentes,
        tendenciaVentas,
        estadosPedidos,
        productosCategoria
      ] = responses;

      console.log("Datos recibidos:", {
        dashboardData,
        ventasMensuales,
        productosTop,
        clientesRecurrentes,
        tendenciaVentas,
        estadosPedidos,
        productosCategoria
      });

      // Extraer datos del dashboard
      const estadisticas = dashboardData?.estadisticas || {};
      
      // Transformar datos de categorías si es necesario
      let categoriasTop = [];
      if (productosCategoria && Array.isArray(productosCategoria)) {
        categoriasTop = productosCategoria.map(cat => ({
          categoria: cat.categoria || "Sin categoría",
          total: cat.totalVentas || 0.0,
          cantidad: cat.cantidadProductos || 0
        }));
      }

      setStats({
        totalPedidos: estadisticas.totalPedidos || 0,
        totalIngresos: estadisticas.ingresosTotales || 0.0,
        ventasMensuales: dashboardData?.ventasMensuales || ventasMensuales || [],
        productosTop: dashboardData?.productosTop || productosTop || [],
        categoriasTop: categoriasTop,
        tendenciaVentas: tendenciaVentas || [],
        pedidosPorEstado: estadosPedidos || [],
        clientesRecurrentes: dashboardData?.clientesRecurrentes || clientesRecurrentes || []
      });

    } catch (error) {
      console.error("❌ Error cargando reportes:", error);
      setError("Error al cargar los datos del dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== CONFIGURACIONES DE GRÁFICOS ====================

  // 1. Gráfico de Ventas Mensuales (Barras)
  const ventasMensualesData = {
    labels: stats.ventasMensuales.map(item => item.mes || "Sin mes"),
    datasets: [
      {
        label: "Ventas ($)",
        data: stats.ventasMensuales.map(item => item.total || 0),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "#3B82F6",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const ventasMensualesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 13,
            weight: '600'
          },
          color: '#475569',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: '700'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(241, 245, 249, 0.8)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: '500'
          },
          padding: 10,
          callback: function(value) {
            return '$' + value.toLocaleString('es-ES');
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(241, 245, 249, 0.5)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: '500'
          },
          padding: 10,
          maxRotation: 45
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // 2. Gráfico de Productos Top (Doughnut)
  const productosTopData = {
    labels: stats.productosTop.slice(0, 5).map(item => item.nombre || "Sin nombre"),
    datasets: [{
      data: stats.productosTop.slice(0, 5).map(item => item.total || 0),
      backgroundColor: [
        'rgba(255, 107, 53, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(52, 211, 153, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderColor: [
        '#FF6B35',
        '#3B82F6',
        '#34D399',
        '#A855F7',
        '#F59E0B'
      ],
      borderWidth: 2,
      hoverOffset: 20
    }]
  };

  // 3. Gráfico de Tendencias (Línea)
  const tendenciaData = {
    labels: stats.tendenciaVentas.map(item => item.fecha || "Sin fecha"),
    datasets: [{
      label: 'Tendencia de Ventas',
      data: stats.tendenciaVentas.map(item => item.ventas || item.total || 0),
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8B5CF6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  // 4. Gráfico de Estados de Pedidos (Pie)
  const estadosData = {
    labels: stats.pedidosPorEstado.map(item => item.estado || "Sin estado"),
    datasets: [{
      data: stats.pedidosPorEstado.map(item => item.cantidad || 0),
      backgroundColor: [
        'rgba(52, 211, 153, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(148, 163, 184, 0.8)'
      ],
      borderColor: [
        '#34D399',
        '#3B82F6',
        '#F59E0B',
        '#EF4444',
        '#94A3B8'
      ],
      borderWidth: 2
    }]
  };

  // Calcular métricas adicionales
  const promedioVenta = stats.totalPedidos > 0 ? (stats.totalIngresos / stats.totalPedidos).toFixed(2) : "0.00";
  const crecimiento = stats.ventasMensuales.length >= 2 
    ? (((stats.ventasMensuales[stats.ventasMensuales.length - 1]?.total || 0) - 
        (stats.ventasMensuales[stats.ventasMensuales.length - 2]?.total || 0)) / 
        (stats.ventasMensuales[stats.ventasMensuales.length - 2]?.total || 1) * 100).toFixed(1)
    : "0.0";

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
        
        {/* Header con efecto de dashboard */}
        <div style={{ 
          background: "white",
          borderRadius: "24px",
          padding: "60px 40px",
          marginBottom: "40px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
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
              marginBottom: "12px",
              fontWeight: "600"
            }}>
              Reportes Analíticos
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "56px",
              fontWeight: "800",
              color: "#2C3E50",
              margin: "0 0 20px 0",
              letterSpacing: "-0.5px",
              lineHeight: "1.1"
            }}>
              Dashboard de Ventas
            </h1>
            
            <p style={{
              color: "#64748b",
              fontSize: "18px",
              margin: "0 auto",
              maxWidth: "700px",
              lineHeight: "1.6",
              fontWeight: "400",
              marginBottom: "30px"
            }}>
              Visualiza métricas clave, tendencias y análisis detallados de tu desempeño comercial
            </p>

            {/* Filtros de período */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap"
            }}>
              {["dia", "semana", "mes", "trimestre", "año"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  style={{
                    background: selectedPeriod === period 
                      ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" 
                      : "white",
                    color: selectedPeriod === period ? "white" : "#64748b",
                    border: `2px solid ${selectedPeriod === period ? "#3B82F6" : "#e5e7eb"}`,
                    padding: "12px 24px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textTransform: "capitalize",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPeriod !== period) {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#3B82F6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPeriod !== period) {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  {period === "dia" && "📅"}
                  {period === "semana" && "📆"}
                  {period === "mes" && "🗓️"}
                  {period === "trimestre" && "📊"}
                  {period === "año" && "📈"}
                  {period}
                </button>
              ))}
              
              <button
                onClick={cargarDatosReportes}
                style={{
                  background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(52, 211, 153, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "120px 20px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "40px"
          }}>
            <div style={{ 
              display: "inline-block",
              width: "80px",
              height: "80px",
              border: "6px solid #f1f5f9",
              borderTop: "6px solid #3B82F6",
              borderRadius: "50%",
              animation: "spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite"
            }}></div>
            <p style={{ 
              marginTop: "30px", 
              fontSize: "22px", 
              color: "#2C3E50", 
              fontWeight: "700" 
            }}>
              Cargando reportes analíticos...
            </p>
            <p style={{ 
              color: "#64748b",
              fontSize: "16px",
              marginTop: "12px",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              Generando gráficos y métricas en tiempo real
            </p>
          </div>
        ) : error ? (
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "60px 32px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "40px"
          }}>
            <div style={{ fontSize: "72px", marginBottom: "20px", opacity: 0.7 }}>⚠️</div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#EF4444",
              marginBottom: "16px"
            }}>
              Error al cargar reportes
            </h3>
            <p style={{ 
              color: "#64748b", 
              fontSize: "16px", 
              marginBottom: "32px",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              {error}
            </p>
            <button
              onClick={cargarDatosReportes}
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                color: "white",
                border: "none",
                padding: "16px 40px",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 25px rgba(59, 130, 246, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.3)";
              }}
            >
              🔄 Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Métricas Principales */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "28px",
              marginBottom: "40px"
            }}>
              {/* Métrica 1: Total Ventas */}
              <div style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 15px 40px rgba(59, 130, 246, 0.25)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-60px",
                  right: "-60px",
                  width: "200px",
                  height: "200px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%"
                }}></div>
                
                <div style={{ position: "relative", zIndex: "10" }}>
                  <div style={{ 
                    fontSize: "16px", 
                    fontWeight: "600", 
                    color: "rgba(255, 255, 255, 0.9)", 
                    marginBottom: "12px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "20px" }}>💰</span>
                    Total de Ventas
                  </div>
                  <div style={{ 
                    fontSize: "48px", 
                    fontWeight: "900", 
                    color: "white",
                    lineHeight: "1",
                    marginBottom: "8px"
                  }}>
                    ${stats.totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "500"
                  }}>
                    {stats.totalPedidos} pedidos procesados
                  </div>
                </div>
              </div>

              {/* Métrica 2: Crecimiento */}
              <div style={{
                background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 15px 40px rgba(52, 211, 153, 0.25)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-60px",
                  right: "-60px",
                  width: "200px",
                  height: "200px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%"
                }}></div>
                
                <div style={{ position: "relative", zIndex: "10" }}>
                  <div style={{ 
                    fontSize: "16px", 
                    fontWeight: "600", 
                    color: "rgba(255, 255, 255, 0.9)", 
                    marginBottom: "12px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "20px" }}>📈</span>
                    Crecimiento
                  </div>
                  <div style={{ 
                    fontSize: "48px", 
                    fontWeight: "900", 
                    color: "white",
                    lineHeight: "1",
                    marginBottom: "8px"
                  }}>
                    {crecimiento}%
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "500"
                  }}>
                    Comparado con el período anterior
                  </div>
                </div>
              </div>

              {/* Métrica 3: Promedio por Venta */}
              <div style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 15px 40px rgba(139, 92, 246, 0.25)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-60px",
                  right: "-60px",
                  width: "200px",
                  height: "200px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%"
                }}></div>
                
                <div style={{ position: "relative", zIndex: "10" }}>
                  <div style={{ 
                    fontSize: "16px", 
                    fontWeight: "600", 
                    color: "rgba(255, 255, 255, 0.9)", 
                    marginBottom: "12px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "20px" }}>📊</span>
                    Ticket Promedio
                  </div>
                  <div style={{ 
                    fontSize: "48px", 
                    fontWeight: "900", 
                    color: "white",
                    lineHeight: "1",
                    marginBottom: "8px"
                  }}>
                    ${promedioVenta}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "500"
                  }}>
                    Valor promedio por transacción
                  </div>
                </div>
              </div>
            </div>

            {/* Primera Fila de Gráficos */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))",
              gap: "28px",
              marginBottom: "40px"
            }}>
              {/* Gráfico de Ventas Mensuales */}
              <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "32px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      color: "white",
                      boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)"
                    }}>
                      📊
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#2C3E50",
                        margin: "0 0 6px 0"
                      }}>
                        Ventas por Período
                      </h3>
                      <p style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: "0",
                        fontWeight: "500"
                      }}>
                        Distribución de ingresos por {selectedPeriod}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "300px" }}>
                  <Bar data={ventasMensualesData} options={ventasMensualesOptions} />
                </div>
              </div>

              {/* Gráfico de Tendencias */}
              <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "32px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      color: "white",
                      boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)"
                    }}>
                      📈
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#2C3E50",
                        margin: "0 0 6px 0"
                      }}>
                        Tendencia de Ventas
                      </h3>
                      <p style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: "0",
                        fontWeight: "500"
                      }}>
                        Evolución temporal de tus ingresos
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "300px" }}>
                  <Line 
                    data={tendenciaData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `$${context.parsed.y.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Segunda Fila de Gráficos */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "28px",
              marginBottom: "40px"
            }}>
              {/* Top Productos */}
              <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "32px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      color: "white",
                      boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)"
                    }}>
                      🏆
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#2C3E50",
                        margin: "0 0 6px 0"
                      }}>
                        Productos Más Vendidos
                      </h3>
                      <p style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: "0",
                        fontWeight: "500"
                      }}>
                        Top 5 productos por ingresos
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "300px", padding: "0 20px" }}>
                  <Doughnut 
                    data={productosTopData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            font: {
                              size: 12,
                              family: "'Inter', sans-serif"
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `$${context.parsed.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${((context.parsed / stats.totalIngresos) * 100).toFixed(1)}%)`;
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>

                {/* Lista de productos */}
                <div style={{ marginTop: "24px" }}>
                  {stats.productosTop.slice(0, 5).map((producto, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: index % 2 === 0 ? "#f8fafc" : "transparent",
                        borderRadius: "12px",
                        marginBottom: "8px",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? "#f8fafc" : "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          background: [
                            "#FF6B35",
                            "#3B82F6",
                            "#34D399",
                            "#A855F7",
                            "#F59E0B"
                          ][index % 5],
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "14px"
                        }}>
                          {index + 1}
                        </div>
                        <span style={{
                          fontWeight: "600",
                          color: "#2C3E50",
                          fontSize: "14px",
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {producto.nombre || "Producto sin nombre"}
                        </span>
                      </div>
                      <span style={{
                        fontWeight: "700",
                        color: "#FF6B35",
                        fontSize: "14px"
                      }}>
                        ${(producto.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estados de Pedidos */}
              <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "32px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      color: "white",
                      boxShadow: "0 8px 20px rgba(52, 211, 153, 0.3)"
                    }}>
                      📦
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#2C3E50",
                        margin: "0 0 6px 0"
                      }}>
                        Estados de Pedidos
                      </h3>
                      <p style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: "0",
                        fontWeight: "500"
                      }}>
                        Distribución por estado actual
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "300px", padding: "0 20px" }}>
                  <Pie 
                    data={estadosData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            font: {
                              size: 12,
                              family: "'Inter', sans-serif"
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>

                {/* Resumen de estados */}
                <div style={{ marginTop: "24px" }}>
                  {stats.pedidosPorEstado.slice(0, 5).map((estado, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: index % 2 === 0 ? "#f8fafc" : "transparent",
                        borderRadius: "12px",
                        marginBottom: "8px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "12px",
                          height: "12px",
                          background: [
                            "#34D399",
                            "#3B82F6",
                            "#F59E0B",
                            "#EF4444",
                            "#94A3B8"
                          ][index % 5],
                          borderRadius: "50%"
                        }}></div>
                        <span style={{
                          fontWeight: "600",
                          color: "#475569",
                          fontSize: "14px",
                          textTransform: "capitalize"
                        }}>
                          {estado.estado || "Desconocido"}
                        </span>
                      </div>
                      <span style={{
                        fontWeight: "700",
                        color: "#2C3E50",
                        fontSize: "14px"
                      }}>
                        {estado.cantidad || 0} pedidos
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabla de Clientes Recurrentes */}
            {stats.clientesRecurrentes.length > 0 && (
              <div style={{
                background: "white",
                borderRadius: "24px",
                padding: "32px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                marginBottom: "40px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "32px"
                }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "white",
                    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)"
                  }}>
                    👥
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#2C3E50",
                      margin: "0 0 6px 0"
                    }}>
                      Clientes Recurrentes
                    </h3>
                    <p style={{
                      color: "#64748b",
                      fontSize: "14px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Top clientes por frecuencia de compra
                    </p>
                  </div>
                </div>

                <div style={{
                  overflowX: "auto",
                  borderRadius: "16px",
                  border: "1px solid #f1f5f9"
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "800px"
                  }}>
                    <thead>
                      <tr style={{
                        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        borderBottom: "2px solid #e5e7eb"
                      }}>
                        <th style={{
                          padding: "16px 24px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Cliente
                        </th>
                        <th style={{
                          padding: "16px 24px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Total Comprado
                        </th>
                        <th style={{
                          padding: "16px 24px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Pedidos
                        </th>
                        <th style={{
                          padding: "16px 24px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Última Compra
                        </th>
                        <th style={{
                          padding: "16px 24px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Fidelidad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.clientesRecurrentes.slice(0, 10).map((cliente, index) => (
                        <tr 
                          key={index}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            transition: "all 0.3s ease",
                            background: index % 2 === 0 ? "#fafafa" : "white"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = index % 2 === 0 ? "#fafafa" : "white";
                          }}
                        >
                          <td style={{
                            padding: "20px 24px",
                            fontWeight: "600",
                            color: "#2C3E50",
                            fontSize: "15px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{
                                width: "40px",
                                height: "40px",
                                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "700",
                                fontSize: "16px",
                                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
                              }}>
                                {(cliente.nombre || cliente.nombreCliente || "C").charAt(0).toUpperCase()}
                              </div>
                              {cliente.nombre || cliente.nombreCliente || "Cliente Anónimo"}
                            </div>
                          </td>
                          <td style={{
                            padding: "20px 24px",
                            fontWeight: "700",
                            color: "#3B82F6",
                            fontSize: "15px"
                          }}>
                            ${(cliente.total || cliente.totalComprado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{
                            padding: "20px 24px",
                            fontWeight: "600",
                            color: "#475569",
                            fontSize: "15px"
                          }}>
                            {cliente.pedidos || cliente.cantidadPedidos || 0}
                          </td>
                          <td style={{
                            padding: "20px 24px",
                            fontWeight: "500",
                            color: "#64748b",
                            fontSize: "14px"
                          }}>
                            {cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString('es-ES') : "N/A"}
                          </td>
                          <td style={{
                            padding: "20px 24px"
                          }}>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              <div style={{
                                flex: "1",
                                height: "8px",
                                background: "#e5e7eb",
                                borderRadius: "4px",
                                overflow: "hidden"
                              }}>
                                <div style={{
                                  width: `${Math.min((cliente.pedidos || cliente.cantidadPedidos || 0) * 20, 100)}%`,
                                  height: "100%",
                                  background: (cliente.pedidos || cliente.cantidadPedidos || 0) >= 5 
                                    ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                                    : (cliente.pedidos || cliente.cantidadPedidos || 0) >= 3
                                    ? "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
                                    : "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
                                  borderRadius: "4px"
                                }}></div>
                              </div>
                              <span style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#475569",
                                minWidth: "40px"
                              }}>
                                {(cliente.pedidos || cliente.cantidadPedidos || 0) >= 5 ? "Alta" : 
                                 (cliente.pedidos || cliente.cantidadPedidos || 0) >= 3 ? "Media" : "Baja"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Resumen Estadístico */}
            <div style={{
              background: "linear-gradient(135deg, #2C3E50 0%, #4A5568 100%)",
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
              color: "white",
              marginBottom: "40px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "32px"
              }}>
                <div style={{
                  fontSize: "32px"
                }}>
                  📋
                </div>
                <div>
                  <h3 style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    margin: "0 0 8px 0"
                  }}>
                    Resumen del Período
                  </h3>
                  <p style={{
                    color: "#CBD5E0",
                    fontSize: "14px",
                    margin: "0",
                    fontWeight: "500"
                  }}>
                    Estadísticas clave del período seleccionado
                  </p>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "24px"
              }}>
                <div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#CBD5E0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px"
                  }}>
                    Período Analizado
                  </div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700"
                  }}>
                    {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#CBD5E0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px"
                  }}>
                    Total Pedidos
                  </div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700"
                  }}>
                    {stats.totalPedidos}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#CBD5E0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px"
                  }}>
                    Ingreso Promedio
                  </div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700"
                  }}>
                    ${promedioVenta}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#CBD5E0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px"
                  }}>
                    Productos Únicos
                  </div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700"
                  }}>
                    {stats.productosTop.length}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#CBD5E0",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px"
                  }}>
                    Clientes Activos
                  </div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700"
                  }}>
                    {stats.clientesRecurrentes.length}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
        
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
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 44px !important;
          }
        }
        
        @media (max-width: 768px) {
          .main-container {
            padding: 24px 16px !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .filters-container {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .period-filters {
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
          
          .chart-container {
            padding: 20px !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-section {
            padding: 40px 24px !important;
          }
          
          .metric-card {
            padding: 24px !important;
          }
          
          .summary-grid {
            grid-templateColumns: 1fr !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
          overflow-x: hidden;
        }
        
        button {
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
        }
        
        p, span, div, td, th {
          font-family: 'Inter', sans-serif;
        }
        
        canvas {
          max-width: 100% !important;
          max-height: 100% !important;
        }
        
        /* Mejoras para tablas */
        table {
          border-collapse: separate;
          border-spacing: 0;
        }
        
        th {
          position: sticky;
          top: 0;
          background: #f8fafc;
          z-index: 10;
        }
        
        /* Animaciones suaves */
        * {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}