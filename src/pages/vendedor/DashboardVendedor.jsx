import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import Footer from "../../components/Footer.jsx";
import API_URL from "../../config/api.js";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardVendedor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    ingresosTotales: 0,
    pedidos: 0,
    productosDisponibles: 0
  });
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [circlePositions, setCirclePositions] = useState([]);
  const [chartData, setChartData] = useState(null);

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
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!userData || !token || userData.rol !== "VENDEDOR") {
      window.location.href = "/LoginModal";
      return;
    }

    setUser(userData);
    cargarDatos(token, userData.idVendedor);
  }, []);

  const cargarDatos = async (token, vendedorId) => {
    setLoading(true);
    setError(null);

    try {
      // Cargar estadísticas del vendedor
      const statsResponse = await fetch(`${API_URL}/vendedor/${vendedorId}/estadisticas`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          ingresosTotales: statsData.ingresosTotales || 0,
          pedidos: statsData.totalPedidos || 0,
          productosDisponibles: statsData.productosDisponibles || 0
        });
      }

      // Cargar pedidos recientes
      const pedidosResponse = await fetch(`${API_URL}/vendedor/${vendedorId}/pedidos/recientes`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (pedidosResponse.ok) {
        const pedidosData = await pedidosResponse.json();
        const pedidosFormateados = pedidosData.map((pedido, index) => ({
          id: pedido.idPedido || pedido.id || index,
          numero: pedido.numeroPedido || pedido.numero || `PED-${index + 1}`,
          cliente: pedido.clienteNombre || 
                   `${pedido.cliente?.nombre || ''} ${pedido.cliente?.apellido || ''}`.trim() || 
                   "Cliente sin nombre",
          estado: pedido.estadoPedido || pedido.estado || "Pendiente",
          total: pedido.totalPedido || pedido.total || pedido.montoTotal || 0,
          fecha: pedido.fechaPedido || pedido.fecha || new Date().toISOString()
        }));
        setPedidosRecientes(pedidosFormateados);
        
        // Generar datos del gráfico basado en pedidos reales
        generarDatosGrafico(pedidosFormateados);
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const generarDatosGrafico = (pedidos) => {
    if (!pedidos || pedidos.length === 0) {
      // Si no hay pedidos, mostrar datos de ejemplo
      setChartData({
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
          {
            label: 'Ventas ($)',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(255, 107, 53, 0.5)',
            borderColor: '#FF6B35',
            borderWidth: 2,
            borderRadius: 8,
            fill: true,
            tension: 0.4
          }
        ]
      });
      return;
    }

    // Agrupar pedidos por mes para datos reales
    const ventasPorMes = {};
    
    // Inicializar todos los meses del año
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    meses.forEach(mes => ventasPorMes[mes] = 0);
    
    // Procesar pedidos reales
    pedidos.forEach(pedido => {
      try {
        const fecha = new Date(pedido.fecha);
        const mes = meses[fecha.getMonth()]; // Obtener nombre del mes
        ventasPorMes[mes] += pedido.total || 0;
      } catch (e) {
        console.warn("Error procesando fecha del pedido:", e);
      }
    });

    // Tomar solo los últimos 6 meses para el gráfico
    const mesActual = new Date().getMonth();
    const ultimos6Meses = [];
    const ultimos6Ventas = [];
    
    for (let i = 5; i >= 0; i--) {
      const mesIndex = (mesActual - i + 12) % 12;
      const mesNombre = meses[mesIndex];
      ultimos6Meses.push(mesNombre);
      ultimos6Ventas.push(ventasPorMes[mesNombre] || 0);
    }

    setChartData({
      labels: ultimos6Meses,
      datasets: [
        {
          label: 'Ventas ($)',
          data: ultimos6Ventas,
          backgroundColor: 'rgba(255, 107, 53, 0.5)',
          borderColor: '#FF6B35',
          borderWidth: 2,
          borderRadius: 8,
          fill: true,
          tension: 0.4
        }
      ]
    });
  };

  // Opciones para el gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: '#64748b'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#2C3E50',
        bodyColor: '#64748b',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(241, 245, 249, 0.8)'
        },
        ticks: {
          color: '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          callback: function(value) {
            return '$' + value;
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(241, 245, 249, 0.5)'
        },
        ticks: {
          color: '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
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
        
        {/* Header */}
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
              Panel de Vendedor
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
              Dashboard Analítico
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
              Gestiona tus ventas, productos y pedidos en tiempo real
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#FFF0F2",
            border: "2px solid #FF6B35",
            borderRadius: "12px",
            padding: "16px 24px",
            marginBottom: "30px",
            color: "#FF6B35",
            fontWeight: "600",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 12px rgba(255, 107, 53, 0.1)"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "80px 20px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
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
              Cargando datos del dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "40px"
            }}>
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
                  💰 Ingresos Totales
                </div>
                <div style={{ 
                  fontSize: "42px", 
                  fontWeight: "800", 
                  color: "#FF6B35",
                  position: "relative",
                  zIndex: "1"
                }}>
                  ${stats.ingresosTotales.toFixed(2)}
                </div>
                <div style={{
                  marginTop: "15px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  position: "relative",
                  zIndex: "1"
                }}>
                  <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Ingresos acumulados
                </div>
              </div>

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
                  📦 Pedidos Totales
                </div>
                <div style={{ 
                  fontSize: "42px", 
                  fontWeight: "800", 
                  color: "#3B82F6",
                  position: "relative",
                  zIndex: "1"
                }}>
                  {stats.pedidos}
                </div>
                <div style={{
                  marginTop: "15px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  position: "relative",
                  zIndex: "1"
                }}>
                  <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Pedidos procesados
                </div>
              </div>

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
                  🛒 Productos Disponibles
                </div>
                <div style={{ 
                  fontSize: "42px", 
                  fontWeight: "800", 
                  color: "#34D399",
                  position: "relative",
                  zIndex: "1"
                }}>
                  {stats.productosDisponibles}
                </div>
                <div style={{
                  marginTop: "15px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  position: "relative",
                  zIndex: "1"
                }}>
                  <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> En inventario
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              marginBottom: "40px"
            }}>
              {[
                { text: "Agregar Producto", color: "#FF6B35", url: "/vendedor/agregar-producto", icon: "➕" },
                { text: "Gestionar Productos", color: "#8B5CF6", url: "/vendedor/gestionar-productos", icon: "📦" },
                { text: "Gestionar Pedidos", color: "#3B82F6", url: "/vendedor/pedidos", icon: "📋" },
                { text: "Análisis de Ventas", color: "#34D399", url: "/vendedor/analisis", icon: "📊" },
                { text: "Reseñas", color: "#F59E0B", url: "/vendedor/resenas", icon: "⭐" }
              ].map((btn, idx) => (
                <button
                  key={`btn-${idx}`}
                  onClick={() => window.location.href = btn.url}
                  style={{
                    background: "white",
                    color: btn.color,
                    border: `2px solid ${btn.color}`,
                    borderRadius: "14px",
                    padding: "20px 24px",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-4px)";
                    e.target.style.boxShadow = `0 8px 20px ${btn.color}40`;
                    e.target.style.background = btn.color;
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                    e.target.style.background = "white";
                    e.target.style.color = btn.color;
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{btn.icon}</span>
                  {btn.text}
                </button>
              ))}
            </div>

            {/* Contenido Principal - Solo un gráfico */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
              gap: "30px",
              marginBottom: "40px"
            }}>
              {/* Pedidos Recientes CON SCROLL */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                height: "500px",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                  flexShrink: 0
                }}>
                  <div style={{
                    fontSize: "28px",
                    color: "#FF6B35",
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
                      Pedidos Recientes
                    </h2>
                    <p style={{
                      color: "#64748b",
                      fontSize: "14px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Últimos pedidos realizados
                    </p>
                  </div>
                </div>
                
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: "8px"
                }}>
                  {pedidosRecientes.length > 0 ? (
                    <div>
                      {pedidosRecientes.map((pedido, index) => {
                        const uniqueKey = `pedido-${pedido.id}-${pedido.numero}-${index}-${Date.now()}`;
                        
                        return (
                          <div 
                            key={uniqueKey}
                            style={{
                              background: "#FAFCF8",
                              borderRadius: "14px",
                              padding: "20px",
                              marginBottom: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              transition: "all 0.3s ease",
                              borderLeft: "4px solid transparent",
                              border: "1px solid #f1f5f9",
                              minHeight: "90px"
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
                          >
                            <div>
                              <div style={{ 
                                fontWeight: "800", 
                                color: "#2C3E50", 
                                fontSize: "16px",
                                marginBottom: "6px"
                              }}>
                                #{pedido.numero}
                              </div>
                              <div style={{ 
                                color: "#64748b", 
                                fontSize: "13px", 
                                marginBottom: "4px",
                                fontWeight: "500"
                              }}>
                                👤 {pedido.cliente}
                              </div>
                              <div style={{ 
                                color: "#94A3B8", 
                                fontSize: "12px",
                                fontWeight: "400"
                              }}>
                                🗓️ {new Date(pedido.fecha).toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </div>
                            </div>
                            <div style={{ 
                              display: "flex", 
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: "8px"
                            }}>
                              <span style={{
                                background: pedido.estado.toLowerCase() === "completado" ? "#D1FAE5" : 
                                          pedido.estado.toLowerCase() === "enviado" ? "#CFFAFE" : 
                                          pedido.estado.toLowerCase() === "cancelado" ? "#FEE2E2" : 
                                          "#FEF3C7",
                                color: pedido.estado.toLowerCase() === "completado" ? "#065F46" : 
                                      pedido.estado.toLowerCase() === "enviado" ? "#0E7490" : 
                                      pedido.estado.toLowerCase() === "cancelado" ? "#991B1B" : 
                                      "#92400E",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "700",
                                textTransform: "capitalize",
                                whiteSpace: "nowrap"
                              }}>
                                {pedido.estado}
                              </span>
                              <span style={{ 
                                fontWeight: "800", 
                                fontSize: "18px", 
                                color: "#FF6B35",
                                letterSpacing: "0.5px"
                              }}>
                                ${pedido.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "40px", 
                      color: "#64748b",
                      background: "#f8f9fa",
                      borderRadius: "14px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"
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
                      }}>No hay pedidos recientes</p>
                      <p style={{ 
                        fontSize: "14px",
                        opacity: 0.7
                      }}>Los nuevos pedidos aparecerán aquí</p>
                    </div>
                  )}
                </div>
              </div>

              {/* UN SOLO GRÁFICO - Ventas Mensuales con datos reales */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column",
                height: "500px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    fontSize: "28px",
                    color: "#8B5CF6",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    📈
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      margin: "0 0 4px 0"
                    }}>
                      Ventas Mensuales
                    </h2>
                    <p style={{
                      color: "#64748b",
                      fontSize: "14px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Últimos 6 meses
                    </p>
                  </div>
                </div>
                
                {/* Contenedor del gráfico */}
                <div style={{
                  flex: 1,
                  position: "relative",
                  width: "100%"
                }}>
                  {chartData ? (
                    <Bar 
                      data={chartData} 
                      options={chartOptions}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      gap: "16px"
                    }}>
                      <div style={{ 
                        fontSize: "48px", 
                        opacity: 0.3,
                        animation: "pulse 2s infinite"
                      }}>
                        📊
                      </div>
                      <p style={{ 
                        fontWeight: "600",
                        fontSize: "16px",
                        color: "#2C3E50"
                      }}>
                        Generando gráfico...
                      </p>
                      <p style={{ 
                        fontSize: "14px",
                        opacity: 0.7,
                        textAlign: "center",
                        maxWidth: "300px"
                      }}>
                        Procesando datos de ventas mensuales
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Información adicional del gráfico */}
                <div style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <div style={{
                        width: "12px",
                        height: "12px",
                        background: "#FF6B35",
                        borderRadius: "2px"
                      }}></div>
                      <span style={{
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: "500"
                      }}>
                        Ventas Totales
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: "500"
                  }}>
                    <span style={{ color: "#FF6B35", fontWeight: "700" }}>
                      Total: ${chartData ? chartData.datasets[0].data.reduce((a, b) => a + b, 0).toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
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
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.05); 
            opacity: 0.8;
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
          .grid-container {
            grid-templateColumns: repeat(auto-fill, minmax(250px, 1fr)) !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
        }
        
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 32px !important;
          }
          
          .buttons-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .pedidos-container, .analitica-container {
            height: 400px !important;
          }
        }
        
        @media (max-width: 480px) {
          .buttons-grid {
            grid-template-columns: 1fr !important;
          }
          
          .pedidos-container, .analitica-container {
            height: 350px !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        button {
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
        }
        
        p, span, div {
          font-family: 'Inter', sans-serif;
        }
        
        /* Mejoras para Chart.js */
        canvas {
          max-width: 100% !important;
          max-height: 100% !important;
        }
      `}</style>
    </div>
  );
}