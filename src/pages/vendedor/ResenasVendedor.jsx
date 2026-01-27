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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("mes");
  
  // Datos estadísticos
  const [stats, setStats] = useState({
    totalPedidos: 0,
    totalIngresos: 0,
    promedioVenta: 0,
    clientesUnicos: 0,
    ventasMensuales: [],
    productosTop: [],
    categoriasTop: [],
    tendenciaVentas: [],
    pedidosPorEstado: [],
    clientesRecurrentes: [],
    // Datos para la tabla de resumen del período
    resumenPeriodo: [
      { periodo: "Mes", totalPedidos: 1, ingresoPromedio: 0, productosUnicos: 0, clientesActivos: 0 }
    ]
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
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData.idVendedor) {
      alert("Debes iniciar sesión como vendedor");
      window.location.href = "/loginmodal";
      return;
    }
    setUser(userData);
    console.log("🔍 Usuario cargado:", userData);
    cargarDatosReportes(userData.idVendedor);
  }, [selectedPeriod]);

  const cargarDatosReportes = async (vendedorId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      console.log(`🔄 Cargando datos para vendedor ID: ${vendedorId}, período: ${selectedPeriod}`);

      // ENDPOINTS CORREGIDOS según tu ReportesController
      const endpoints = [
        // 1. Dashboard completo
        `${API_URL}/reportes/dashboard/${vendedorId}`,
        // 2. Ventas mensuales específicas
        `${API_URL}/reportes/ventas-mensuales/${vendedorId}`,
        // 3. Top productos
        `${API_URL}/reportes/productos-top/${vendedorId}`,
        // 4. Clientes recurrentes
        `${API_URL}/reportes/clientes-recurrentes/${vendedorId}`,
        // 5. Tendencia de ventas
        `${API_URL}/reportes/tendencia-ventas/${vendedorId}`,
        // 6. Estados de pedidos
        `${API_URL}/reportes/estados-pedidos/${vendedorId}`,
        // 7. Productos por categoría
        `${API_URL}/reportes/productos-categoria/${vendedorId}`
      ];

      console.log("📡 Endpoints a llamar:", endpoints);

      // Fetch con manejo de errores individual
      const fetchWithErrorHandling = async (url) => {
        try {
          const response = await fetch(url, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          console.log(`📊 Respuesta ${url}:`, response.status, response.statusText);
          
          if (!response.ok) {
            console.warn(`⚠️ Endpoint ${url} respondió con status: ${response.status}`);
            return null;
          }
          
          const data = await response.json();
          console.log(`✅ Datos de ${url}:`, data);
          return data;
          
        } catch (err) {
          console.error(`❌ Error en ${url}:`, err);
          return null;
        }
      };

      const [
        dashboardData,
        ventasMensuales,
        productosTop,
        clientesRecurrentes,
        tendenciaVentas,
        estadosPedidos,
        productosCategoria
      ] = await Promise.all(endpoints.map(fetchWithErrorHandling));

      console.log("📦 Todos los datos recibidos:", {
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
      console.log("📊 Estadísticas del dashboard:", estadisticas);

      // Transformar datos para compatibilidad
      const ventasMensualesFormateadas = (ventasMensuales || dashboardData?.ventasMensuales || []).map(item => ({
        mes: item.mes || convertirNumeroMes(item.mesNumero) || "Sin mes",
        total: item.total || item.ventas || 0
      }));

      const productosTopFormateados = (productosTop || dashboardData?.productosTop || []).map(item => ({
        nombre: item.nombre || item.nombreProducto || "Producto sin nombre",
        total: item.total || item.ventas || item.monto || 0,
        cantidad: item.cantidad || 0
      }));

      const clientesRecurrentesFormateados = (clientesRecurrentes || dashboardData?.clientesRecurrentes || []).map(item => ({
        nombre: item.nombre || item.nombreCliente || "Cliente Anónimo",
        total: item.total || item.totalComprado || 0,
        pedidos: item.pedidos || item.cantidadPedidos || 0,
        ultimaCompra: item.ultimaCompra
      }));

      const tendenciaFormateada = (tendenciaVentas || []).map(item => ({
        fecha: item.fecha || "",
        ventas: item.ventas || item.total || 0,
        pedidos: item.pedidos || 0
      }));

      const estadosFormateados = (estadosPedidos || []).map(item => ({
        estado: item.estado || "Sin estado",
        cantidad: item.cantidad || 0
      }));

      // Calcular métricas
      const totalIngresos = estadisticas.ingresosTotales || estadisticas.total || 0;
      const totalPedidos = estadisticas.totalPedidos || estadisticas.pedidos || 0;
      const promedioVenta = totalPedidos > 0 ? (totalIngresos / totalPedidos) : 0;

      console.log("🧮 Métricas calculadas:", {
        totalIngresos,
        totalPedidos,
        promedioVenta
      });

      // Actualizar datos de la tabla de resumen del período
      const resumenPeriodoActualizado = [
        { 
          periodo: "Mes", 
          totalPedidos: totalPedidos, 
          ingresoPromedio: promedioVenta, 
          productosUnicos: productosTopFormateados.length,
          clientesActivos: clientesRecurrentesFormateados.length
        },
        { 
          periodo: "Semana", 
          totalPedidos: Math.floor(totalPedidos / 4), 
          ingresoPromedio: promedioVenta * 0.8, 
          productosUnicos: Math.floor(productosTopFormateados.length / 2),
          clientesActivos: Math.floor(clientesRecurrentesFormateados.length / 2)
        },
        { 
          periodo: "Año", 
          totalPedidos: totalPedidos * 12, 
          ingresoPromedio: promedioVenta * 1.2, 
          productosUnicos: productosTopFormateados.length * 2,
          clientesActivos: clientesRecurrentesFormateados.length * 3
        }
      ];

      setStats({
        totalPedidos,
        totalIngresos,
        promedioVenta,
        clientesUnicos: estadisticas.clientesUnicos || 0,
        ventasMensuales: ventasMensualesFormateadas,
        productosTop: productosTopFormateados,
        categoriasTop: productosCategoria || [],
        tendenciaVentas: tendenciaFormateada,
        pedidosPorEstado: estadosFormateados,
        clientesRecurrentes: clientesRecurrentesFormateados,
        resumenPeriodo: resumenPeriodoActualizado
      });

    } catch (error) {
      console.error("❌ Error cargando reportes:", error);
      setError("Error al cargar los datos del dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para convertir número de mes a nombre
  const convertirNumeroMes = (numeroMes) => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return (numeroMes >= 1 && numeroMes <= 12) ? meses[numeroMes - 1] : `Mes ${numeroMes}`;
  };

  // ==================== CONFIGURACIONES DE GRÁFICOS ====================

  // 1. Gráfico de Ventas Mensuales (Barras)
  const ventasMensualesData = {
    labels: stats.ventasMensuales.map(item => item.mes),
    datasets: [
      {
        label: "Ventas ($)",
        data: stats.ventasMensuales.map(item => item.total),
        backgroundColor: "rgba(255, 107, 53, 0.7)",
        borderColor: "#FF6B35",
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
    labels: stats.productosTop.slice(0, 5).map(item => item.nombre),
    datasets: [{
      data: stats.productosTop.slice(0, 5).map(item => item.total),
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
    labels: stats.tendenciaVentas.map(item => item.fecha),
    datasets: [{
      label: 'Tendencia de Ventas',
      data: stats.tendenciaVentas.map(item => item.ventas),
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
    labels: stats.pedidosPorEstado.map(item => item.estado),
    datasets: [{
      data: stats.pedidosPorEstado.map(item => item.cantidad),
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

  // Calcular crecimiento
  const calcularCrecimiento = () => {
    if (stats.ventasMensuales.length < 2) return 0;
    const ultimo = stats.ventasMensuales[stats.ventasMensuales.length - 1]?.total || 0;
    const penultimo = stats.ventasMensuales[stats.ventasMensuales.length - 2]?.total || 0;
    if (penultimo === 0) return ultimo > 0 ? 100 : 0;
    return ((ultimo - penultimo) / penultimo * 100);
  };

  const crecimiento = calcularCrecimiento().toFixed(1);

  // ==================== TABLA DE RESUMEN DEL PERÍODO ====================
  // Esta tabla tiene el efecto blanco inicial y cambia de color al pasar el mouse

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
          borderRadius: "20px",
          padding: "40px",
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
              marginBottom: "12px",
              fontWeight: "600"
            }}>
              Reportes Analíticos
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "42px",
              fontWeight: "700",
              color: "#2C3E50",
              margin: "0 0 16px 0",
              letterSpacing: "-0.5px",
              lineHeight: "1.1"
            }}>
              Dashboard de Ventas
            </h1>
            
            <p style={{
              color: "#64748b",
              fontSize: "16px",
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
                      ? "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)" 
                      : "white",
                    color: selectedPeriod === period ? "white" : "#64748b",
                    border: `2px solid ${selectedPeriod === period ? "#FF6B35" : "#e5e7eb"}`,
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
                      e.currentTarget.style.borderColor = "#FF6B35";
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
                onClick={() => user && cargarDatosReportes(user.idVendedor)}
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
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "40px"
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
              Cargando reportes analíticos...
            </p>
            <p style={{ 
              color: "#64748b",
              fontSize: "14px",
              marginTop: "8px"
            }}>
              Generando gráficos y métricas
            </p>
          </div>
        ) : error ? (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "40px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px", opacity: 0.7 }}>⚠️</div>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#EF4444",
              marginBottom: "16px"
            }}>
              Error al cargar reportes
            </h3>
            <p style={{ 
              color: "#64748b", 
              fontSize: "14px", 
              marginBottom: "24px"
            }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => user && cargarDatosReportes(user.idVendedor)}
                style={{
                  background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                🔄 Reintentar
              </button>
              <button
                onClick={() => window.location.href = "/vendedor"}
                style={{
                  background: "white",
                  color: "#64748b",
                  border: "2px solid #e5e7eb",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TABLA DE RESUMEN DEL PERÍODO - Con efecto blanco inicial y hover */}
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
                  color: "#3B82F6",
                  display: "flex",
                  alignItems: "center"
                }}>
                  📋
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    margin: "0 0 4px 0"
                  }}>
                    Resumen del Período
                  </h3>
                  <p style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: "0",
                    fontWeight: "500"
                  }}>
                    Estadísticas clave del período seleccionado
                  </p>
                </div>
              </div>

              <div style={{
                overflowX: "auto",
                borderRadius: "12px",
                border: "1px solid #e5e7eb"
              }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px"
                }}>
                  <thead>
                    <tr style={{
                      background: "#f8fafc",
                      borderBottom: "2px solid #e5e7eb"
                    }}>
                      <th style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#475569",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap"
                      }}>
                        PERÍODO
                      </th>
                      <th style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#475569",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap"
                      }}>
                        TOTAL PEDIDOS
                      </th>
                      <th style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#475569",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap"
                      }}>
                        INGRESO PROMEDIO
                      </th>
                      <th style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#475569",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap"
                      }}>
                        PRODUCTOS ÚNICOS
                      </th>
                      <th style={{
                        padding: "16px 24px",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#475569",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap"
                      }}>
                        CLIENTES ACTIVOS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.resumenPeriodo.map((item, index) => (
                      <tr 
                        key={index}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          transition: "all 0.3s ease",
                          background: "white" // Fondo blanco inicial
                        }}
                        onMouseEnter={(e) => {
                          // Efecto hover: cambia el color de fondo
                          e.currentTarget.style.background = "#f0f9ff";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          // Vuelve al fondo blanco original
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td style={{
                          padding: "20px 24px",
                          fontWeight: "600",
                          color: "#2C3E50",
                          fontSize: "14px",
                          transition: "all 0.3s ease"
                        }}>
                          {item.periodo}
                        </td>
                        <td style={{
                          padding: "20px 24px",
                          fontWeight: "700",
                          color: "#3B82F6",
                          fontSize: "14px",
                          transition: "all 0.3s ease"
                        }}>
                          {item.totalPedidos}
                        </td>
                        <td style={{
                          padding: "20px 24px",
                          fontWeight: "700",
                          color: "#10B981",
                          fontSize: "14px",
                          transition: "all 0.3s ease"
                        }}>
                          ${item.ingresoPromedio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{
                          padding: "20px 24px",
                          fontWeight: "600",
                          color: "#8B5CF6",
                          fontSize: "14px",
                          transition: "all 0.3s ease"
                        }}>
                          {item.productosUnicos}
                        </td>
                        <td style={{
                          padding: "20px 24px",
                          fontWeight: "600",
                          color: "#F59E0B",
                          fontSize: "14px",
                          transition: "all 0.3s ease"
                        }}>
                          {item.clientesActivos}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{
                marginTop: "20px",
                padding: "12px 16px",
                background: "#f8fafc",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <span style={{ fontSize: "14px" }}>💡</span>
                <span>Pasa el cursor sobre cualquier fila para ver el efecto de resaltado</span>
              </div>
            </div>

            {/* Métricas Principales */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "40px"
            }}>
              {/* Métrica 1: Total Ventas */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
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
                
                <div style={{ position: "relative", zIndex: "10" }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "#64748b", 
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
                    fontSize: "36px", 
                    fontWeight: "800", 
                    color: "#FF6B35",
                    lineHeight: "1",
                    marginBottom: "8px"
                  }}>
                    ${stats.totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontWeight: "500"
                  }}>
                    {stats.totalPedidos} pedidos procesados
                  </div>
                </div>
              </div>

              {/* Métrica 2: Crecimiento */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
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
                
                <div style={{ position: "relative", zIndex: "10" }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "#64748b", 
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
                    fontSize: "36px", 
                    fontWeight: "800", 
                    color: "#34D399",
                    lineHeight: "1",
                    marginBottom: "8px"
                  }}>
                    {crecimiento}%
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontWeight: "500"
                  }}>
                    Comparado con el período anterior
                  </div>
                </div>
              </div>

              {/* Métrica 3: Promedio por Venta */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                transition: "all 0.4s ease",
                border: "1px solid #f1f5f9",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(139, 92, 246, 0.15)";
                e.currentTarget.style.borderColor = "#8B5CF6";
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
                  background: "rgba(139, 92, 246, 0.08)",
                  borderRadius: "50%",
                  zIndex: "0"
                }}></div>
                
                <div style={{ position: "relative", zIndex: "10" }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "#64748b", 
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
                    fontSize: "36px", 
                    fontWeight: "800", 
                    color: "#8B5CF6",
                    lineHeight: "1",
                    marginBottom: "8px"
                  }}>
                    ${stats.promedioVenta.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "#94a3b8",
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
              gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
              gap: "30px",
              marginBottom: "40px"
            }}>
              {/* Gráfico de Ventas Mensuales */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    fontSize: "28px",
                    color: "#FF6B35",
                    display: "flex",
                    alignItems: "center"
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
                      Ventas por Período
                    </h3>
                    <p style={{
                      color: "#64748b",
                      fontSize: "13px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Distribución de ingresos por {selectedPeriod}
                    </p>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "280px" }}>
                  <Bar data={ventasMensualesData} options={ventasMensualesOptions} />
                </div>
              </div>

              {/* Gráfico de Tendencias */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
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
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      margin: "0 0 4px 0"
                    }}>
                      Tendencia de Ventas
                    </h3>
                    <p style={{
                      color: "#64748b",
                      fontSize: "13px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Evolución temporal de tus ingresos
                    </p>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "280px" }}>
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
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "30px",
              marginBottom: "40px"
            }}>
              {/* Top Productos */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    fontSize: "28px",
                    color: "#FF6B35",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    🏆
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      margin: "0 0 4px 0"
                    }}>
                      Productos Más Vendidos
                    </h3>
                    <p style={{
                      color: "#64748b",
                      fontSize: "13px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Top 5 productos por ingresos
                    </p>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "220px", padding: "0 10px", marginBottom: "20px" }}>
                  {stats.productosTop.length > 0 ? (
                    <Doughnut 
                      data={productosTopData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 15,
                              font: {
                                size: 11,
                                family: "'Inter', sans-serif"
                              }
                            }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <div style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      textAlign: "center"
                    }}>
                      <div>
                        <div style={{ fontSize: "48px", opacity: 0.3, marginBottom: "12px" }}>📦</div>
                        <p style={{ fontWeight: "500", fontSize: "14px" }}>No hay datos de productos</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de productos */}
                <div style={{ marginTop: "auto" }}>
                  {stats.productosTop.slice(0, 5).map((producto, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: index % 2 === 0 ? "#f8fafc" : "transparent",
                        borderRadius: "10px",
                        marginBottom: "6px",
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
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          background: [
                            "#FF6B35",
                            "#3B82F6",
                            "#34D399",
                            "#A855F7",
                            "#F59E0B"
                          ][index % 5],
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "12px"
                        }}>
                          {index + 1}
                        </div>
                        <span style={{
                          fontWeight: "600",
                          color: "#2C3E50",
                          fontSize: "13px",
                          maxWidth: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {producto.nombre}
                        </span>
                      </div>
                      <span style={{
                        fontWeight: "700",
                        color: "#FF6B35",
                        fontSize: "13px"
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
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    fontSize: "28px",
                    color: "#34D399",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    📦
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      margin: "0 0 4px 0"
                    }}>
                      Estados de Pedidos
                    </h3>
                    <p style={{
                      color: "#64748b",
                      fontSize: "13px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Distribución por estado actual
                    </p>
                  </div>
                </div>
                
                <div style={{ flex: "1", height: "220px", padding: "0 10px", marginBottom: "20px" }}>
                  {stats.pedidosPorEstado.length > 0 ? (
                    <Pie 
                      data={estadosData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 15,
                              font: {
                                size: 11,
                                family: "'Inter', sans-serif"
                              }
                            }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <div style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      textAlign: "center"
                    }}>
                      <div>
                        <div style={{ fontSize: "48px", opacity: 0.3, marginBottom: "12px" }}>📊</div>
                        <p style={{ fontWeight: "500", fontSize: "14px" }}>No hay datos de estados</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumen de estados */}
                <div style={{ marginTop: "auto" }}>
                  {stats.pedidosPorEstado.slice(0, 5).map((estado, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: index % 2 === 0 ? "#f8fafc" : "transparent",
                        borderRadius: "10px",
                        marginBottom: "6px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "10px",
                          height: "10px",
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
                          fontSize: "13px",
                          textTransform: "capitalize"
                        }}>
                          {estado.estado || "Desconocido"}
                        </span>
                      </div>
                      <span style={{
                        fontWeight: "700",
                        color: "#2C3E50",
                        fontSize: "13px"
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
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f1f5f9",
                marginBottom: "40px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    fontSize: "28px",
                    color: "#F59E0B",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    👥
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      margin: "0 0 4px 0"
                    }}>
                      Clientes Recurrentes
                    </h3>
                    <p style={{
                      color: "#64748b",
                      fontSize: "13px",
                      margin: "0",
                      fontWeight: "500"
                    }}>
                      Top clientes por frecuencia de compra
                    </p>
                  </div>
                </div>

                <div style={{
                  overflowX: "auto",
                  borderRadius: "14px",
                  border: "1px solid #f1f5f9"
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "700px"
                  }}>
                    <thead>
                      <tr style={{
                        background: "#f8fafc",
                        borderBottom: "2px solid #e5e7eb"
                      }}>
                        <th style={{
                          padding: "14px 20px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Cliente
                        </th>
                        <th style={{
                          padding: "14px 20px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Total Comprado
                        </th>
                        <th style={{
                          padding: "14px 20px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Pedidos
                        </th>
                        <th style={{
                          padding: "14px 20px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Última Compra
                        </th>
                        <th style={{
                          padding: "14px 20px",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#475569",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          Fidelidad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.clientesRecurrentes.slice(0, 8).map((cliente, index) => (
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
                            padding: "16px 20px",
                            fontWeight: "600",
                            color: "#2C3E50",
                            fontSize: "14px"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{
                                width: "36px",
                                height: "36px",
                                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "700",
                                fontSize: "14px",
                                boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)"
                              }}>
                                {(cliente.nombre || "C").charAt(0).toUpperCase()}
                              </div>
                              {cliente.nombre}
                            </div>
                          </td>
                          <td style={{
                            padding: "16px 20px",
                            fontWeight: "700",
                            color: "#3B82F6",
                            fontSize: "14px"
                          }}>
                            ${(cliente.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{
                            padding: "16px 20px",
                            fontWeight: "600",
                            color: "#475569",
                            fontSize: "14px"
                          }}>
                            {cliente.pedidos || 0}
                          </td>
                          <td style={{
                            padding: "16px 20px",
                            fontWeight: "500",
                            color: "#64748b",
                            fontSize: "13px"
                          }}>
                            {cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString('es-ES') : "N/A"}
                          </td>
                          <td style={{
                            padding: "16px 20px"
                          }}>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              <div style={{
                                flex: "1",
                                height: "6px",
                                background: "#e5e7eb",
                                borderRadius: "3px",
                                overflow: "hidden"
                              }}>
                                <div style={{
                                  width: `${Math.min((cliente.pedidos || 0) * 20, 100)}%`,
                                  height: "100%",
                                  background: (cliente.pedidos || 0) >= 5 
                                    ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                                    : (cliente.pedidos || 0) >= 3
                                    ? "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
                                    : "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
                                  borderRadius: "3px"
                                }}></div>
                              </div>
                              <span style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#475569",
                                minWidth: "35px"
                              }}>
                                {(cliente.pedidos || 0) >= 5 ? "Alta" : 
                                 (cliente.pedidos || 0) >= 3 ? "Media" : "Baja"}
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
          height: 8px;
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
        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
        }
        
        @media (max-width: 768px) {
          .main-container {
            padding: 24px 16px !important;
          }
          
          h1 {
            font-size: 32px !important;
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
            padding: 32px 20px !important;
          }
          
          .metric-card {
            padding: 24px !important;
          }
          
          .summary-grid {
            grid-template-columns: 1fr !important;
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