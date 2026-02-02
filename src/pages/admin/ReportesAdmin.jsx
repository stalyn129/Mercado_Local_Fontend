import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Package, 
  RefreshCw, 
  AlertCircle, 
  BarChart3, 
  PieChart,
  Calendar,
  DollarSign,
  ShoppingBag,
  Layers,
  Filter,
  ChevronDown,
  X,
  Search
} from "lucide-react";

// IMPORTACIONES CORREGIDAS - Ajusta según tu estructura
import Notificaciones from "../../components/Notificaciones";
import useNotification from "../../hooks/useNotification";
import API_URL from "../../config/api";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// =================== COMPONENTE PRINCIPAL REPORTESADMIN ===================
export default function ReportesAdmin() {
  const [ventasCat, setVentasCat] = useState([]);
  const [stockProd, setStockProd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);
  
  // Estados para filtros
  const [filtroCategorias, setFiltroCategorias] = useState("all");
  const [filtroProductos, setFiltroProductos] = useState("all");
  const [busquedaProductos, setBusquedaProductos] = useState('');
  const [mostrarSelectorCategorias, setMostrarSelectorCategorias] = useState(false);
  const [mostrarSelectorProductos, setMostrarSelectorProductos] = useState(false);
  
  // Estado para interactividad del gráfico de torta
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [statsFromDashboard, setStatsFromDashboard] = useState({ ventas: 0 });

  // =================== USO DE NOTIFICACIONES ===================
  const {
    notificacion,
    setNotificacion,
    notificaciones
  } = useNotification();

  // =================== CÍRCULOS FLOTANTES ===================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",
        "rgba(52, 211, 153, 0.15)",
        "rgba(59, 130, 246, 0.15)",
        "rgba(168, 85, 247, 0.15)",
        "rgba(239, 68, 68, 0.15)",
        "rgba(245, 158, 11, 0.15)",
        "rgba(14, 165, 233, 0.15)",
        "rgba(236, 72, 153, 0.15)"
      ];
      
      for (let i = 0; i < 8; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 4 + 2 + "px"
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

  // Cargar datos reales del backend
  useEffect(() => {
    const cargarDatos = async () => {
      const token = localStorage.getItem("authToken") || 
                    localStorage.getItem("token") || 
                    sessionStorage.getItem("authToken");

      if (!token) {
        setError("No se encontró token de autenticación. Por favor, inicia sesión.");
        setLoading(false);
        notificaciones.advertenciaLogin();
        return;
      }

      try {
        setLoading(true);
        notificaciones.info("Cargando datos", "Obteniendo información de reportes...", "reloj");
        
        const [ventasData, stockData, dashboardStats] = await Promise.all([
          fetch(`${API_URL}/reportes/ventas-por-categoria`, {
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }).then(async res => {
            if (!res.ok) {
              const errorText = await res.text();
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
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`${res.status} en stock: ${errorText}`);
            }
            return res.json();
          }),

          fetch(`${API_URL}/api/admin/simple-stats`, {
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }).then(async res => {
            if (!res.ok) {
              return { ventas: 0 };
            }
            return res.json();
          })
        ]);

        console.log("📊 Datos de ventas recibidos:", ventasData);
        console.log("📦 Datos de stock recibidos:", stockData);
        console.log("📈 Estadísticas del dashboard:", dashboardStats);
        
        // Filtrar categorías vacías o con nombre undefined
        const ventasFiltradas = Array.isArray(ventasData) 
          ? ventasData.filter(item => 
              item && 
              item.categoria && 
              item.categoria.trim() !== "" && 
              item.totalVentas !== undefined
            )
          : [];
        
        // Ordenar ventas de mayor a menor
        const ventasOrdenadas = ventasFiltradas.sort((a, b) => b.totalVentas - a.totalVentas);
        
        // Ordenar stock de mayor a menor
        const stockOrdenado = Array.isArray(stockData) 
          ? stockData.sort((a, b) => b.stock - a.stock)
          : [];
        
        setVentasCat(ventasOrdenadas);
        setStockProd(stockOrdenado);
        
        if (dashboardStats && dashboardStats.ventas) {
          setStatsFromDashboard({ ventas: dashboardStats.ventas });
        }
        
        setLoading(false);
        
        // Mostrar notificación de éxito solo si hay datos
        if (ventasOrdenadas.length > 0 || stockOrdenado.length > 0) {
          notificaciones.exito(
            "Datos cargados", 
            `Se cargaron ${ventasOrdenadas.length} categorías y ${stockOrdenado.length} productos correctamente`,
            "check"
          );
        } else {
          notificaciones.advertencia(
            "Sin datos", 
            "No se encontraron datos para mostrar en los reportes", 
            "caja"
          );
        }
        
      } catch (err) {
        console.error("❌ Error cargando reportes:", err);
        setError(err.message || "Error al cargar los reportes. Verifica tus permisos de administrador.");
        setLoading(false);
        notificaciones.error(
          "Error de conexión", 
          "No se pudo conectar con el servidor. Verifica tu conexión.", 
          "banco"
        );
      }
    };

    cargarDatos();
  }, []);

  // =================== FUNCIONES CON NOTIFICACIONES ===================
  const handleActualizarReportes = () => {
    notificaciones.infoProcesoIniciado();
    window.location.reload();
  };

  const handleSeleccionCategoria = (categoria, total) => {
    setCategoriaSeleccionada({ categoria, total });
    notificaciones.info(
      "Categoría seleccionada", 
      `Has seleccionado "${categoria}" con ventas de $${total.toFixed(2)}`,
      "ubicacion"
    );
  };

  // =================== DATOS FILTRADOS ===================
  const ventasFiltradas = filtroCategorias === "all" 
    ? ventasCat 
    : ventasCat.slice(0, parseInt(filtroCategorias) || ventasCat.length);
    
  const productosFiltrados = stockProd
    .filter(p => 
      busquedaProductos === '' || 
      (p.producto && p.producto.toLowerCase().includes(busquedaProductos.toLowerCase())) ||
      (p.categoria && p.categoria.toLowerCase().includes(busquedaProductos.toLowerCase()))
    )
    .slice(0, filtroProductos === "all" 
      ? stockProd.length 
      : parseInt(filtroProductos) || stockProd.length);

  // =================== CALCULAR ESTADÍSTICAS ===================
  const totalVentasCalculado = ventasCat.reduce((sum, v) => sum + (v.totalVentas || 0), 0);
  const totalVentas = statsFromDashboard.ventas > 0 ? statsFromDashboard.ventas : totalVentasCalculado;
  
  const totalProductos = stockProd.length;
  const stockPromedio = stockProd.length > 0 
    ? stockProd.reduce((sum, p) => sum + (p.stock || 0), 0) / stockProd.length 
    : 0;
  const maxStock = stockProd.length > 0 
    ? Math.max(...stockProd.map(p => p.stock || 0)) 
    : 0;

  // =================== PALETA DE COLORES ===================
  const colorPalette = {
    primary: '#FF6B35',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    dark: '#111827',
    light: '#F3F4F6',
    
    chartColors: [
      '#FF6B35', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
      '#EF4444', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6',
      '#F97316', '#84CC16', '#A855F7', '#22C55E', '#0EA5E9'
    ]
  };

  // =================== PIE CHART: VENTAS POR CATEGORÍA ===================
  const pieData = {
    labels: ventasFiltradas.map(v => v.categoria),
    datasets: [
      {
        label: "Ventas ($)",
        data: ventasFiltradas.map(v => v.totalVentas),
        backgroundColor: ventasFiltradas.map((_, index) => 
          colorPalette.chartColors[index % colorPalette.chartColors.length]
        ),
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 15,
        spacing: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const categoria = ventasFiltradas[index].categoria;
        const total = ventasFiltradas[index].totalVentas;
        handleSeleccionCategoria(categoria, total);
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: { 
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 12, 
            weight: '600' 
          },
          color: colorPalette.dark,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        },
        onHover: (event, legendItem) => {
          const index = legendItem.datasetIndex;
          event.native.target.style.cursor = 'pointer';
        },
        onLeave: (event) => {
          event.native.target.style.cursor = 'default';
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 12,
          weight: '500'
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('es-ES', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(context.raw);
            return label;
          }
        }
      }
    },
    cutout: '55%',
  };

  // =================== BAR CHART: STOCK POR PRODUCTO ===================
  const barData = {
    labels: productosFiltrados.map(p => 
      p.producto && p.producto.length > 20 ? p.producto.substring(0, 20) + '...' : p.producto || 'Producto sin nombre'
    ),
    datasets: [
      {
        label: "Stock disponible",
        data: productosFiltrados.map(p => p.stock || 0),
        backgroundColor: productosFiltrados.map((_, index) => 
          colorPalette.chartColors[(index * 3) % colorPalette.chartColors.length]
        ),
        borderRadius: 8,
        borderWidth: 0,
        borderSkipped: false,
        maxBarThickness: 45,
        hoverBackgroundColor: productosFiltrados.map((_, index) => 
          colorPalette.chartColors[(index * 3 + 1) % colorPalette.chartColors.length]
        ),
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 12,
          weight: '500'
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            return productosFiltrados[index].producto || 'Producto sin nombre';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colorPalette.light,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { 
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 11, 
            weight: '600' 
          },
          padding: 10,
        },
        title: {
          display: true,
          text: 'Cantidad',
          color: '#6b7280',
          font: {
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 12,
            weight: '600'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colorPalette.dark,
          font: { 
            family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 10, 
            weight: '600' 
          },
          maxRotation: 45,
        }
      }
    }
  };

  // =================== COMPONENTE SELECTOR DE FILTROS ===================
  const SelectorFiltro = ({ 
    titulo, 
    valor, 
    onChange, 
    opciones, 
    mostrar, 
    setMostrar,
    esBusqueda = false,
    busqueda = '',
    setBusqueda = () => {}
  }) => {
    return (
      <div style={styles.selectorFiltroContainer}>
        <button
          onClick={() => setMostrar(!mostrar)}
          style={styles.selectorFiltroBoton}
        >
          <Filter size={16} />
          <span>
            {titulo}: 
            {esBusqueda && busqueda ? ` "${busqueda}"` : 
             valor === "all" ? ' Todos' : 
             opciones.find(o => o.value === valor)?.label.replace(/\(\d+\)/, '') || ` ${valor} items`}
          </span>
          <ChevronDown size={16} />
        </button>
        
        {mostrar && (
          <div style={styles.selectorFiltroMenu}>
            {esBusqueda ? (
              <>
                <div style={styles.busquedaFiltroContainer}>
                  <Search size={14} style={styles.busquedaFiltroIcon} />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={styles.busquedaFiltroInput}
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda('')}
                      style={styles.busquedaFiltroClear}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div style={styles.opcionesContainer}>
                  {opciones.map((opcion) => (
                    <button
                      key={opcion.value}
                      onClick={() => {
                        onChange(opcion.value);
                        setMostrar(false);
                        notificaciones.info(
                          "Filtro aplicado", 
                          `Mostrando ${opcion.label.toLowerCase()}`, 
                          "config"
                        );
                      }}
                      style={{
                        ...styles.opcionFiltro,
                        backgroundColor: valor === opcion.value ? '#FF6B3510' : 'transparent',
                        color: valor === opcion.value ? '#FF6B35' : '#6b7280'
                      }}
                    >
                      <span style={styles.opcionTexto}>{opcion.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              opciones.map((opcion) => (
                <button
                  key={opcion.value}
                  onClick={() => {
                    onChange(opcion.value);
                    setMostrar(false);
                    notificaciones.info(
                      "Filtro aplicado", 
                      `Mostrando ${opcion.label.toLowerCase()}`, 
                      "config"
                    );
                  }}
                  style={{
                    ...styles.opcionFiltro,
                    backgroundColor: valor === opcion.value ? '#FF6B3510' : 'transparent',
                    color: valor === opcion.value ? '#FF6B35' : '#6b7280'
                  }}
                >
                  <span style={styles.opcionTexto}>{opcion.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Opciones para los filtros
  const opcionesCategorias = [
    { value: 3, label: 'Top 3 categorías' },
    { value: 5, label: 'Top 5 categorías' },
    { value: 8, label: 'Top 8 categorías' },
    { value: "all", label: 'Todas las categorías' }
  ];

  const opcionesProductos = [
    { value: 5, label: 'Top 5 productos' },
    { value: 8, label: 'Top 8 productos' },
    { value: 12, label: 'Top 12 productos' },
    { value: "all", label: 'Todos los productos' }
  ];

  return (
    <div style={styles.container}>
      {/* COMPONENTE DE NOTIFICACIONES */}
      <Notificaciones 
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={5000}
        showProgress={true}
        pauseOnHover={true}
      />
      
      {/* Círculos flotantes */}
      {circlePositions.map(circle => (
        <div 
          key={circle.id}
          style={{
            ...styles.floatingCircle,
            top: `${circle.top}%`,
            left: `${circle.left}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            background: circle.color,
            animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
            animationDelay: circle.animationDelay,
            filter: `blur(${circle.blur})`
          }}
        />
      ))}
      
      {/* Contenedor Principal */}
      <div style={styles.mainContent}>
        
        {/* Header Section */}
        <div style={styles.headerContainer}>
          {circlePositions.slice(0, 4).map(circle => (
            <div 
              key={`header-${circle.id}`}
              style={{
                ...styles.floatingCircleHeader,
                top: `${circle.top}%`,
                left: `${circle.left}%`,
                width: `${circle.size}px`,
                height: `${circle.size}px`,
                background: circle.color,
                animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
                animationDelay: circle.animationDelay,
                filter: `blur(${circle.blur})`
              }}
            />
          ))}
          
          <div style={styles.headerContent}>
            <div style={styles.headerIconLarge}>
              <BarChart3 size={40} />
            </div>
            
            <div style={styles.headerTitleContainer}>
              <h1 style={styles.dashboardHeaderTitle}>
                Reportes y Estadísticas
              </h1>
              <p style={styles.headerDescription}>
                Sistema MercadoLocal-IA • {stockProd.length} productos • {ventasCat.length} categorías
              </p>
            </div>
            
            <div style={styles.refreshButtonContainer}>
              <button
                style={styles.refreshButton}
                onClick={handleActualizarReportes}
                disabled={loading}
              >
                <RefreshCw size={18} /> {loading ? "Actualizando..." : "Actualizar reportes"}
              </button>
              <div style={styles.timeInfo}>
                <Calendar size={14} />
                Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderTopColor: colorPalette.primary}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.primary}20`, color: colorPalette.primary}}>
              <DollarSign size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>
                {new Intl.NumberFormat('es-ES', { 
                  style: 'currency', 
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(totalVentas)}
              </h3>
              <p style={styles.statLabel}>VENTAS TOTALES</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> {ventasCat.length} categorías
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard, borderTopColor: colorPalette.warning}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.warning}20`, color: colorPalette.warning}}>
              <Package size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stockProd.length}</h3>
              <p style={styles.statLabel}>PRODUCTOS TOTALES</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> En {ventasCat.length} categorías
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard, borderTopColor: colorPalette.success}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.success}20`, color: colorPalette.success}}>
              <ShoppingBag size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{Math.round(stockPromedio)}</h3>
              <p style={styles.statLabel}>STOCK PROMEDIO</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> Por producto
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard, borderTopColor: colorPalette.secondary}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.secondary}20`, color: colorPalette.secondary}}>
              <Layers size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{maxStock}</h3>
              <p style={styles.statLabel}>MÁXIMO STOCK</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> Unidad más abundante
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingContent}>
              <h3 style={styles.loadingTitle}>Cargando reportes...</h3>
              <p style={styles.loadingText}>Obteniendo datos del sistema</p>
            </div>
          </div>
        ) : error ? (
          <div style={styles.errorState}>
            <div style={styles.errorIcon}>
              <AlertCircle size={48} />
            </div>
            <h4 style={styles.errorTitle}>Error al cargar reportes</h4>
            <p style={styles.errorText}>
              {error}
            </p>
            <button onClick={handleActualizarReportes} style={styles.errorButton}>
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Grid de Gráficos con Filtros */}
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <h3 style={styles.tableTitle}>
                  Gráficos de Análisis
                  <span style={styles.tableCount}>
                    ({ventasFiltradas.length} categorías, {productosFiltrados.length} productos)
                  </span>
                </h3>
                {/* BOTÓN EXPORTAR REPORTE ELIMINADO */}
              </div>

              {/* Filtros */}
              <div style={styles.filtrosContainer}>
                <SelectorFiltro
                  titulo="Mostrar categorías"
                  valor={filtroCategorias}
                  onChange={setFiltroCategorias}
                  opciones={opcionesCategorias}
                  mostrar={mostrarSelectorCategorias}
                  setMostrar={setMostrarSelectorCategorias}
                />
                
                <SelectorFiltro
                  titulo="Mostrar productos"
                  valor={filtroProductos}
                  onChange={setFiltroProductos}
                  opciones={opcionesProductos}
                  mostrar={mostrarSelectorProductos}
                  setMostrar={setMostrarSelectorProductos}
                  esBusqueda={true}
                  busqueda={busquedaProductos}
                  setBusqueda={setBusquedaProductos}
                />
              </div>

              <div style={styles.chartsGrid}>
                {/* Card: Ventas por Categoría */}
                <div style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <div style={styles.chartIcon}>
                      <PieChart size={24} />
                    </div>
                    <div>
                      <h3 style={styles.chartTitle}>
                        Distribución de Ventas
                      </h3>
                      <p style={styles.chartSubtitle}>
                        {ventasFiltradas.length} categorías mostradas
                        {categoriaSeleccionada && (
                          <span style={styles.categoriaSeleccionada}>
                            • Seleccionada: <strong>{categoriaSeleccionada.categoria}</strong>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={styles.chartContainer}>
                    <Pie data={pieData} options={pieOptions} />
                    {categoriaSeleccionada && (
                      <div style={styles.seleccionInfo}>
                        <div style={styles.seleccionIcon}>📌</div>
                        <div>
                          <div style={styles.seleccionNombre}>
                            {categoriaSeleccionada.categoria}
                          </div>
                          <div style={styles.seleccionTotal}>
                            {new Intl.NumberFormat('es-ES', { 
                              style: 'currency', 
                              currency: 'USD' 
                            }).format(categoriaSeleccionada.total)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCategoriaSeleccionada(null);
                            notificaciones.info(
                              "Selección limpiada", 
                              "Se ha limpiado la categoría seleccionada", 
                              "check"
                            );
                          }}
                          style={styles.seleccionCerrar}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={styles.chartStats}>
                    <div style={styles.chartStat}>
                      <span style={styles.chartStatLabel}>Categorías totales:</span>
                      <span style={styles.chartStatValue}>{ventasCat.length}</span>
                    </div>
                    <div style={styles.chartStat}>
                      <span style={styles.chartStatLabel}>Mostrando:</span>
                      <span style={styles.chartStatValue}>{ventasFiltradas.length}</span>
                    </div>
                    <div style={styles.chartStat}>
                      <span style={styles.chartStatLabel}>Total Ventas:</span>
                      <span style={styles.chartStatValue}>
                        {new Intl.NumberFormat('es-ES', { 
                          style: 'currency', 
                          currency: 'USD',
                          minimumFractionDigits: 2 
                        }).format(totalVentas)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card: Stock por Producto */}
                <div style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <div style={styles.chartIcon}>
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h3 style={styles.chartTitle}>
                        Stock por Producto
                      </h3>
                      <p style={styles.chartSubtitle}>
                        {productosFiltrados.length} productos mostrados
                        {busquedaProductos && (
                          <span style={styles.busquedaInfo}>
                            • Buscando: "{busquedaProductos}"
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={styles.chartContainer}>
                    <Bar data={barData} options={barOptions} />
                  </div>

                  <div style={styles.chartStats}>
                    <div style={styles.chartStat}>
                      <span style={styles.chartStatLabel}>Productos totales:</span>
                      <span style={styles.chartStatValue}>{stockProd.length}</span>
                    </div>
                    <div style={styles.chartStat}>
                      <span style={styles.chartStatLabel}>Mostrando:</span>
                      <span style={styles.chartStatValue}>{productosFiltrados.length}</span>
                    </div>
                    <div style={styles.chartStat}>
                      <span style={styles.chartStatLabel}>Stock Total:</span>
                      <span style={styles.chartStatValue}>
                        {stockProd.reduce((sum, p) => sum + (p.stock || 0), 0)} unidades
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Sistema */}
              <div style={styles.systemInfo}>
                <div style={styles.systemInfoContent}>
                  <BarChart3 size={16} />
                  <span>
                    Panel de Reportes • Sistema MercadoLocal-IA • 
                    {ventasCat.length} categorías • {stockProd.length} productos • 
                    {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Estilos globales */}
      <style>{`
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

        @keyframes slideInNotification {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes slideOutNotification {
          from {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}

// =================== ESTILOS ===================
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  
  floatingCircle: {
    position: 'fixed',
    borderRadius: '50%',
    opacity: 0.6,
    zIndex: 1,
    pointerEvents: 'none'
  },
  
  floatingCircleHeader: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.3,
    zIndex: 1,
    pointerEvents: 'none'
  },
  
  mainContent: {
    position: 'relative',
    zIndex: 10
  },
  
  // Header con efecto de círculos
  headerContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb'
  },
  
  headerContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  
  headerIconLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
    marginBottom: '10px',
    margin: '0 auto'
  },
  
  headerTitleContainer: {
    textAlign: 'center',
    width: '100%'
  },
  
  dashboardHeaderTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  },
  
  headerDescription: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  },
  
  refreshButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#FF6B35',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  
  timeInfo: {
    padding: '8px 16px',
    background: '#f3f4f6',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  // Stats Cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  
  statCard: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    borderTopWidth: '4px',
    borderTopStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease'
  },
  
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  statContent: {
    flex: 1
  },
  
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 6px 0',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280'
  },
  
  // Filtros
  filtrosContainer: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    background: '#f9fafb'
  },
  
  selectorFiltroContainer: {
    position: 'relative'
  },
  
  selectorFiltroBoton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '180px',
    justifyContent: 'space-between'
  },
  
  selectorFiltroMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 100,
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginTop: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    minWidth: '200px',
    overflow: 'hidden'
  },
  
  busquedaFiltroContainer: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  
  busquedaFiltroIcon: {
    position: 'absolute',
    left: '20px',
    color: '#9ca3af'
  },
  
  busquedaFiltroInput: {
    width: '100%',
    padding: '8px 8px 8px 32px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    background: '#f9fafb'
  },
  
  busquedaFiltroClear: {
    position: 'absolute',
    right: '20px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  
  opcionesContainer: {
    maxHeight: '200px',
    overflowY: 'auto'
  },
  
  opcionFiltro: {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  opcionTexto: {
    flex: 1
  },
  
  // Contenedor de Tabla/Gráficos
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  
  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  
  tableCount: {
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: '8px',
    fontSize: '14px'
  },
  
  tableActions: {
    display: 'flex',
    gap: '12px'
  },
  
  // Grid de Gráficos
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
    gap: '24px',
    padding: '24px'
  },
  
  chartCard: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '520px'
  },
  
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  
  chartIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
    color: 'white',
    flexShrink: 0
  },
  
  chartTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827'
  },
  
  chartSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6b7280'
  },
  
  categoriaSeleccionada: {
    color: '#FF6B35',
    marginLeft: '8px',
    fontWeight: '500'
  },
  
  busquedaInfo: {
    color: '#8B5CF6',
    marginLeft: '8px',
    fontWeight: '500'
  },
  
  chartContainer: {
    flex: 1,
    position: 'relative',
    marginBottom: '20px'
  },
  
  seleccionInfo: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    background: 'white',
    borderRadius: '10px',
    padding: '12px 16px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    border: '2px solid #FF6B35',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10
  },
  
  seleccionIcon: {
    fontSize: '20px',
    color: '#FF6B35'
  },
  
  seleccionNombre: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '2px'
  },
  
  seleccionTotal: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#FF6B35'
  },
  
  seleccionCerrar: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },
  
  chartStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
    gap: '16px'
  },
  
  chartStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    textAlign: 'center'
  },
  
  chartStatLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  chartStatValue: {
    fontSize: '16px',
    color: '#111827',
    fontWeight: '600'
  },
  
  // Loading, Error y SystemInfo
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  loadingContent: {
    textAlign: 'center'
  },
  
  loadingTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px'
  },
  
  loadingText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  
  errorState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  
  errorIcon: {
    color: '#EF4444',
    marginBottom: '16px'
  },
  
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  
  errorText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  errorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '0 auto'
  },
  
  systemInfo: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  systemInfoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }
};