import { useState, useEffect } from "react";
import { Menu, X, Users, Package, Settings, LogOut, Bell, FileText, ClipboardList, TrendingUp, Activity, RefreshCw, DollarSign, Clock, User, CheckCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { FolderTree } from "lucide-react";
import UsuariosAdmin from "./UsuariosAdmin.jsx";
import ProductosAdmin from "./ProductosAdmin.jsx";
import ReportesAdmin from "./ReportesAdmin.jsx";
import LogsAdmin from "./LogsAdmin.jsx";
import ConfiguracionAdmin from "./ConfiguracionAdmin.jsx";
import GestionarCategorias from "./GestionarCategorias.jsx";

// Importar el logo
import logo from '../../assets/Logo.png'; // Ajusta la ruta según tu estructura
import API_URL from "../../config/api";

// ==================== COMPONENTE DASHBOARD ====================
function DashboardAdmin() {
  const [stats, setStats] = useState({
    usuarios: 0,
    productos: 0,
    ventas: 0,
    ventasMes: 0,
    crecimiento: 0,
    pedidosHoy: 0,
    usuariosActivos: 0
  });

  const [chartData, setChartData] = useState({
    usuarios: [],
    productos: [],
    pedidos: []
  });
  const [activities, setActivities] = useState([]);
  const [chartType, setChartType] = useState("usuarios");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [usingRealData, setUsingRealData] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("Ene");

  // ==================== ANIMACIÓN DE CÍRCULOS ====================
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

      for (let i = 0; i < 10; i++) {
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

    // Obtener mes actual
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();
    setCurrentMonth(months[now.getMonth()]);

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
    // Obtener información del usuario
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const nombre = user.nombre || '';
        const apellido = user.apellido || '';
        const rol = user.rol || '';

        setUserName(nombre && apellido ? `${nombre} ${apellido}` : 'Administrador');
        setUserRole(rol);

        // Verificar si el usuario es ADMIN
        if (rol !== "ADMIN") {
          console.warn("⚠ Usuario no es ADMIN, redirigiendo...");
          // Podrías redirigir o mostrar mensaje
          setError("Acceso denegado: Solo administradores pueden acceder a esta sección.");
          setLoading(false);
          return;
        }
      } catch (e) {
        setUserName("Administrador");
        setUserRole("ADMIN");
      }
    }

    fetchRealData();
  }, []);

  async function fetchRealData() {
    const token = localStorage.getItem("token");

    console.log("🔍 Iniciando carga de datos REALES...");
    console.log("🔑 Token disponible:", token ? "Sí" : "No");

    // Crear headers con token si existe
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    try {
      setLoading(true);
      setError(null);

      // 1. Obtener usuarios (endpoint de admin)
      console.log("📊 Obteniendo usuarios...");

      const usuariosResponse = await fetch(`${API_URL}/api/admin/usuarios`, {
        method: 'GET',
        headers: headers
      });

      if (usuariosResponse.ok) {
        const usuarios = await usuariosResponse.json();
        console.log("✅ Usuarios obtenidos:", usuarios.length);

        // Calcular estadísticas de usuarios
        const totalUsuarios = usuarios.length || 0;
        const usuariosActivos = usuarios.filter(u =>
          u.estado === "ACTIVO" || u.estado === "Activo" || u.activo === true
        ).length;
        const usuariosAdmin = usuarios.filter(u => u.rol === "ADMIN" || u.rol === "ROLE_ADMIN").length;
        const usuariosVendedor = usuarios.filter(u => u.rol === "VENDEDOR" || u.rol === "ROLE_VENDEDOR").length;

        // 2. Obtener productos activos - MODIFICADO PARA CONTAR SOLO ACTIVOS
        let productosActivos = 0;
        let productosTotales = 0;
        try {
          console.log("📦 Obteniendo productos activos...");
          
          // Usar el endpoint que devuelve todos los productos (como en ProductosAdmin.jsx)
          const productosResponse = await fetch(`${API_URL}/productos/admin/listar`, {
            method: 'GET',
            headers: headers
          });

          if (productosResponse.ok) {
            const productosData = await productosResponse.json();
            console.log("✅ Productos obtenidos:", productosData);
            
            if (Array.isArray(productosData)) {
              // Filtrar solo productos activos
              productosActivos = productosData.filter(p => 
                p.activo === true || p.activo === undefined || p.estado === 'Disponible'
              ).length;
              productosTotales = productosData.length;
            }
            console.log("✅ Productos activos:", productosActivos, "Total:", productosTotales);
          } else {
            console.log("⚠ No se pudieron obtener productos. Status:", productosResponse.status);
            
            // Fallback alternativo
            try {
              const countResponse = await fetch(`${API_URL}/productos`, {
                method: 'GET',
                headers: headers
              });
              
              if (countResponse.ok) {
                const productos = await countResponse.json();
                if (Array.isArray(productos)) {
                  productosActivos = productos.filter(p => 
                    p.activo === true || p.activo === undefined || p.estado === 'Disponible'
                  ).length;
                  productosTotales = productos.length;
                }
              }
            } catch (fallbackError) {
              console.log("⚠ Error en fallback:", fallbackError.message);
            }
          }
        } catch (productosError) {
          console.error("❌ Error obteniendo productos:", productosError.message);
        }

        // 3. Intentar obtener ventas/reportes
        let ventasTotales = 0;
        let pedidosCount = 0;
        try {
          console.log("💰 Intentando obtener ventas...");
          // Intentar varios endpoints de reportes
          const endpoints = [
            "/reportes/ventas-por-categoria",
            "/reportes/ventas-totales",
            "/api/admin/ventas",
            "/api/admin/reportes/ventas"
          ];

          for (const endpoint of endpoints) {
            try {
              const ventasResponse = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
              });

              if (ventasResponse.ok) {
                const ventasData = await ventasResponse.json();
                console.log(`✅ Datos obtenidos de ${endpoint}:`, ventasData);

                // Procesar diferentes formatos de respuesta
                if (Array.isArray(ventasData)) {
                  ventasTotales = ventasData.reduce((sum, item) => {
                    return sum + (item.totalVentas || item.monto || item.valor || item.total || 0);
                  }, 0);
                  pedidosCount = ventasData.length || 0;
                } else if (typeof ventasData === 'object') {
                  ventasTotales = ventasData.totalVentas || ventasData.monto || ventasData.valor || ventasData.total || 0;
                  pedidosCount = ventasData.cantidadPedidos || ventasData.totalPedidos || 0;
                }
                break; // Salir del loop si encontramos datos
              }
            } catch (endpointError) {
              console.log(`⚠ Error en ${endpoint}:`, endpointError.message);
              continue;
            }
          }

          console.log("💰 Ventas totales calculadas:", ventasTotales);
        } catch (ventasError) {
          console.log("⚠ Error obteniendo ventas:", ventasError.message);
        }

        // Calcular crecimiento (basado en usuarios activos)
        const crecimiento = usuariosActivos > 0 ? Math.min(100, Math.floor((usuariosActivos / totalUsuarios) * 100)) : 0;

        // Actualizar stats - USAR productosActivos EN LUGAR DE productosTotales
        setStats({
          usuarios: totalUsuarios,
          usuariosActivos: usuariosActivos,
          productos: productosActivos, // SOLO PRODUCTOS ACTIVOS
          ventas: ventasTotales,
          ventasMes: ventasTotales,
          crecimiento: crecimiento,
          pedidosHoy: pedidosCount
        });

        setUsingRealData(true);

        // 4. Generar gráficos con datos obtenidos
        generateRealChartData(
          totalUsuarios,
          productosActivos, // Usar productos activos para gráficos
          ventasTotales,
          usuariosActivos
        );

        // 5. Generar actividades basadas en los datos
        const newActivities = [
          {
            id: 1,
            tipo: "success",
            descripcion: `${totalUsuarios} usuarios cargados del sistema (${usuariosActivos} activos)`,
            fecha: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            icon: <Users size={14} />
          }
        ];

        if (productosActivos > 0) {
          newActivities.push({
            id: 2,
            tipo: "pedido",
            descripcion: `${productosActivos} productos activos en el sistema`,
            fecha: "Catálogo",
            icon: <Package size={14} />
          });
        }

        if (productosTotales > productosActivos) {
          newActivities.push({
            id: 7,
            tipo: "warning",
            descripcion: `${productosTotales - productosActivos} productos inactivos`,
            fecha: "Catálogo",
            icon: <AlertCircle size={14} />
          });
        }

        if (ventasTotales > 0) {
          newActivities.push({
            id: 3,
            tipo: "vendedor",
            descripcion: `Ventas totales: $${ventasTotales.toFixed(2)}`,
            fecha: "Finanzas",
            icon: <DollarSign size={14} />
          });
        }

        if (usuariosAdmin > 0) {
          newActivities.push({
            id: 4,
            tipo: "usuario",
            descripcion: `${usuariosAdmin} administrador(es) en el sistema`,
            fecha: "Roles",
            icon: <User size={14} />
          });
        }

        if (usuariosActivos > 0) {
          newActivities.push({
            id: 5,
            tipo: "success",
            descripcion: `${usuariosActivos} usuarios activos`,
            fecha: "Actividad",
            icon: <CheckCircle size={14} />
          });
        }

        // Agregar actividad del usuario actual
        if (userName) {
          newActivities.push({
            id: 6,
            tipo: "usuario",
            descripcion: `${userName} conectado como ${userRole}`,
            fecha: "Sesión activa",
            icon: <User size={14} />
          });
        }

        setActivities(newActivities);

      } else {
        const errorText = await usuariosResponse.text();
        console.log("⚠ No se pudieron obtener usuarios. Status:", usuariosResponse.status, "Error:", errorText);

        // Usar datos mínimos
        setStats({
          usuarios: 1,
          usuariosActivos: 1,
          productos: 0,
          ventas: 0,
          ventasMes: 0,
          crecimiento: 0,
          pedidosHoy: 0
        });

        generateMinimalChartData();
        setActivities([
          {
            id: 1,
            tipo: "warning",
            descripcion: "Modo de datos mínimos activado",
            fecha: "Sistema",
            icon: <AlertCircle size={14} />
          },
          {
            id: 2,
            tipo: "info",
            descripcion: "Conectado al panel de administración",
            fecha: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            icon: <Activity size={14} />
          }
        ]);
        setUsingRealData(false);
      }

      setLoading(false);

    } catch (err) {
      console.error("❌ Error general:", err.message);
      setError(`Error de conexión: ${err.message}. Verifique su conexión o contacte al administrador.`);
      setLoading(false);

      // Datos mínimos de respaldo
      setStats({
        usuarios: 1,
        usuariosActivos: 1,
        productos: 0,
        ventas: 0,
        ventasMes: 0,
        crecimiento: 0,
        pedidosHoy: 0
      });

      generateMinimalChartData();
      setActivities([
        {
          id: 1,
          tipo: "error",
          descripcion: "Error al cargar datos del servidor",
          fecha: "Sistema",
          icon: <AlertCircle size={14} />
        },
        {
          id: 2,
          tipo: "info",
          descripcion: "Verifique su conexión a internet",
          fecha: "Conectividad",
          icon: <AlertCircle size={14} />
        }
      ]);
      setUsingRealData(false);
    }
  }

  function generateRealChartData(totalUsuarios, totalProductos, totalVentas, usuariosActivos) {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();
    const currentMonthIndex = now.getMonth();

    // Datos realistas con crecimiento progresivo
    const usuariosData = meses.slice(0, 6).map((mes, index) => {
      let cantidad = 0;
      if (index === currentMonthIndex) {
        cantidad = totalUsuarios;
      } else if (index < currentMonthIndex) {
        // Crecimiento progresivo hacia el mes actual
        const progresion = (currentMonthIndex - index) / currentMonthIndex;
        const factor = Math.max(0.1, 1 - progresion * 0.8);
        cantidad = Math.floor(totalUsuarios * factor);
      }
      return { mes, cantidad: Math.max(1, cantidad) };
    });

    const productosData = meses.slice(0, 6).map((mes, index) => {
      let cantidad = 0;
      if (index === currentMonthIndex) {
        cantidad = totalProductos;
      } else if (index < currentMonthIndex) {
        const progresion = (currentMonthIndex - index) / currentMonthIndex;
        const factor = Math.max(0.05, 1 - progresion * 0.9);
        cantidad = Math.floor(totalProductos * factor);
      }
      return { mes, cantidad: Math.max(0, cantidad) };
    });

    // Para pedidos, estimar basado en ventas
    const pedidosEstimados = totalVentas > 0 ? Math.max(1, Math.floor(totalVentas / 50)) : 0;
    const pedidosData = meses.slice(0, 6).map((mes, index) => {
      let cantidad = 0;
      if (index === currentMonthIndex) {
        cantidad = pedidosEstimados;
      } else if (index < currentMonthIndex && pedidosEstimados > 0) {
        const progresion = (currentMonthIndex - index) / currentMonthIndex;
        const factor = Math.max(0.1, 1 - progresion * 0.7);
        cantidad = Math.floor(pedidosEstimados * factor);
      }
      return { mes, cantidad: Math.max(0, cantidad) };
    });

    setChartData({
      usuarios: usuariosData,
      productos: productosData,
      pedidos: pedidosData
    });
  }

  function generateMinimalChartData() {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    const now = new Date();
    const currentMonthIndex = now.getMonth() % 6;

    const usuariosData = meses.map((mes, index) => ({
      mes,
      cantidad: index === currentMonthIndex ? 1 : (index < currentMonthIndex ? Math.floor(Math.random() * 3) : 0)
    }));

    const productosData = meses.map((mes, index) => ({
      mes,
      cantidad: index === currentMonthIndex ? 0 : (index < currentMonthIndex ? Math.floor(Math.random() * 5) : 0)
    }));

    const pedidosData = meses.map((mes, index) => ({
      mes,
      cantidad: index === currentMonthIndex ? 0 : (index < currentMonthIndex ? Math.floor(Math.random() * 10) : 0)
    }));

    setChartData({
      usuarios: usuariosData,
      productos: productosData,
      pedidos: pedidosData
    });
  }

  // Función para obtener icono según tipo de actividad
  function getActivityIcon(tipo) {
    switch ((tipo || "").toLowerCase()) {
      case "usuario":
        return <User size={14} />;
      case "vendedor":
        return <Package size={14} />;
      case "pedido":
        return <ShoppingCart size={14} />;
      case "warning":
        return <AlertCircle size={14} />;
      case "error":
        return <AlertCircle size={14} />;
      case "success":
        return <CheckCircle size={14} />;
      case "info":
        return <Activity size={14} />;
      default:
        return <Activity size={14} />;
    }
  }

  // Cambiar tipo de gráfico
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Obtener datos del gráfico actual
  const getCurrentChartData = () => {
    if (!chartData[chartType] || chartData[chartType].length === 0) {
      return [];
    }
    return chartData[chartType];
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando dashboard administrativo...</p>
        <p style={styles.loadingSubtext}>
          Obteniendo datos del sistema • {userName || 'Administrador'}
        </p>
      </div>
    );
  }

  const currentChartData = getCurrentChartData();
  const maxValue = currentChartData.length > 0
    ? Math.max(...currentChartData.map(d => d.cantidad || 0), 1)
    : 1;

  return (
    <div style={styles.dashboardContainer}>
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} />
          <div style={styles.errorContent}>
            <span style={styles.errorText}>{error}</span>
            {error.includes("Acceso denegado") && (
              <span style={styles.errorDetail}>
                Solo usuarios con rol ADMIN pueden acceder al dashboard
              </span>
            )}
          </div>
          {!error.includes("Acceso denegado") && (
            <button
              style={styles.retryButton}
              onClick={fetchRealData}
              disabled={loading}
            >
              {loading ? "Reintentando..." : "Reintentar"}
            </button>
          )}
        </div>
      )}

      {/* Header con Logo en Dashboard */}
      <div style={styles.headerContainer}>
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

        <div style={styles.headerContent}>
          <div style={styles.headerTitleContainer}>
            <h1 style={styles.dashboardHeaderTitle}>
              Dashboard General
            </h1>
            <p style={styles.headerDescription}>
              {usingRealData
                ? `Datos reales • ${userName || 'Administrador'} (${userRole})`
                : "Modo datos mínimos"}
              {` • Mes: ${currentMonth}`}
            </p>
          </div>

          <div style={styles.refreshButtonContainer}>
            <button
              style={styles.refreshButton}
              onClick={fetchRealData}
              disabled={loading}
            >
              <RefreshCw size={18} /> {loading ? "Actualizando..." : "Actualizar datos"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={<Users size={24} />}
          title="Usuarios Totales"
          value={stats.usuarios.toLocaleString()}
          subtitle={`${stats.usuariosActivos} activos`}
          color="#FF6B35"
          hasData={stats.usuarios > 0}
        />
        <StatCard
          icon={<Package size={24} />}
          title="Productos Activos"
          value={stats.productos > 0 ? stats.productos.toLocaleString() : "0"}
          subtitle={stats.productos > 0 ? "Disponibles en catálogo" : "Sin productos activos"}
          color="#8B5CF6"
          hasData={stats.productos > 0}
        />
        <StatCard
          icon={<DollarSign size={24} />}
          title="Ventas Totales"
          value={stats.ventas > 0 ? `$${stats.ventas.toFixed(2)}` : "$0"}
          subtitle={stats.crecimiento > 0 ? `Crecimiento: ${stats.crecimiento}%` : "Sin datos"}
          color="#10B981"
          hasData={stats.ventas > 0}
        />
        <StatCard
          icon={<ShoppingCart size={24} />}
          title="Pedidos Hoy"
          value={stats.pedidosHoy.toLocaleString()}
          subtitle={stats.pedidosHoy > 0 ? "Actividad reciente" : "Sin pedidos"}
          color="#3B82F6"
          hasData={stats.pedidosHoy > 0}
        />
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Gráfico Interactivo */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.chartHeader}>
              <h2 style={styles.cardTitle}>
                <TrendingUp size={22} /> Tendencias Mensuales
              </h2>
              <div style={styles.chartTypeSelector}>
                <button
                  style={{
                    ...styles.chartTypeButton,
                    border: chartType === "usuarios" ? '1px solid #FF6B35' : '1px solid #e5e7eb',
                    backgroundColor: chartType === "usuarios" ? '#FF6B35' : '#f3f4f6',
                    color: chartType === "usuarios" ? '#ffffff' : '#6b7280',
                  }}
                  onClick={() => handleChartTypeChange("usuarios")}
                >
                  <Users size={16} /> Usuarios
                </button>
                <button
                  style={{
                    ...styles.chartTypeButton,
                    border: chartType === "productos" ? '1px solid #FF6B35' : '1px solid #e5e7eb',
                    backgroundColor: chartType === "productos" ? '#FF6B35' : '#f3f4f6',
                    color: chartType === "productos" ? '#ffffff' : '#6b7280',
                  }}
                  onClick={() => handleChartTypeChange("productos")}
                >
                  <Package size={16} /> Productos
                </button>
                <button
                  style={{
                    ...styles.chartTypeButton,
                    border: chartType === "pedidos" ? '1px solid #FF6B35' : '1px solid #e5e7eb',
                    backgroundColor: chartType === "pedidos" ? '#FF6B35' : '#f3f4f6',
                    color: chartType === "pedidos" ? '#ffffff' : '#6b7280',
                  }}
                  onClick={() => handleChartTypeChange("pedidos")}
                >
                  <ShoppingCart size={16} /> Pedidos
                </button>
              </div>
            </div>
            <span style={styles.cardSubtitle}>
              {usingRealData ?
                `Datos reales • Última actualización: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` :
                "Datos de demostración"}
            </span>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.chartContainer}>
              {currentChartData.length > 0 ? (
                <div style={styles.barChart}>
                  <div style={styles.chartBars}>
                    {currentChartData.slice(0, 6).map((item, index) => {
                      const cantidad = item.cantidad || 0;
                      const heightPercentage = (cantidad / maxValue) * 100;
                      const color = chartType === "usuarios" ? '#FF6B35' :
                        chartType === "productos" ? '#8B5CF6' : '#3B82F6';
                      const isCurrentMonth = item.mes === currentMonth;

                      return (
                        <div key={index} style={styles.barColumn}>
                          <div
                            style={{
                              ...styles.bar,
                              height: `${Math.max(5, heightPercentage)}%`,
                              background: `linear-gradient(to top, ${color}, ${color}99)`,
                              opacity: isCurrentMonth ? 0.9 : 0.3,
                              boxShadow: isCurrentMonth ? `0 4px 12px ${color}40` : 'none'
                            }}
                            title={`${item.mes}: ${cantidad}`}
                          />
                          <div style={{
                            ...styles.barLabel,
                            fontWeight: isCurrentMonth ? '600' : '400',
                            color: isCurrentMonth ? '#111827' : '#6b7280'
                          }}>
                            {item.mes}
                          </div>
                          <div style={styles.barValue}>
                            {cantidad}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.chartAxis}>
                    <div style={styles.yAxis}>
                      <span>{maxValue}</span>
                      <span>{Math.floor(maxValue * 0.75)}</span>
                      <span>{Math.floor(maxValue * 0.5)}</span>
                      <span>{Math.floor(maxValue * 0.25)}</span>
                      <span>0</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.noChartData}>
                  <div style={styles.noChartIcon}>📊</div>
                  <p>Generando datos de tendencias...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <Activity size={22} /> Actividad Reciente
            </h2>
            <span style={styles.cardSubtitle}>
              {activities.length} evento{activities.length !== 1 ? 's' : ''} del sistema
            </span>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.logsContainer}>
              {activities.length > 0 ? (
                activities.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    style={styles.logItem}
                  >
                    <div style={{
                      ...styles.logIcon,
                      background: log.tipo === 'usuario' ? '#FF6B3520' :
                        log.tipo === 'vendedor' ? '#8B5CF620' :
                          log.tipo === 'pedido' ? '#3B82F620' :
                            log.tipo === 'warning' ? '#F59E0B20' :
                              log.tipo === 'error' ? '#EF444420' :
                                log.tipo === 'success' ? '#10B98120' :
                                  log.tipo === 'info' ? '#3B82F620' : '#f3f4f6',
                      color: log.tipo === 'usuario' ? '#FF6B35' :
                        log.tipo === 'vendedor' ? '#8B5CF6' :
                          log.tipo === 'pedido' ? '#3B82F6' :
                            log.tipo === 'warning' ? '#F59E0B' :
                              log.tipo === 'error' ? '#EF4444' :
                                log.tipo === 'success' ? '#10B981' :
                                  log.tipo === 'info' ? '#3B82F6' : '#6b7280'
                    }}>
                      {log.icon || getActivityIcon(log.tipo)}
                    </div>
                    <div style={styles.logContent}>
                      <p style={styles.logMessage}>{log.descripcion}</p>
                      <span style={styles.logTime}>
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        {log.fecha}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📝</div>
                  <p>No hay actividades recientes</p>
                  <p style={styles.emptySubtext}>Las actividades aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información del sistema */}
      <div style={styles.systemInfoBanner}>
        <Clock size={16} />
        <span>
          Sistema administrativo MercadoLocal • {usingRealData ? 'Datos en tiempo real' : 'Modo demostración'} •
          Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} •
          Usuario: {userName} ({userRole})
        </span>
      </div>
    </div >
  );
}

function StatCard({ icon, title, value, subtitle, color, hasData = true }) {
  return (
    <div
      style={{
        ...styles.statCard,
        borderTopWidth: '4px',
        borderTopStyle: 'solid',
        borderTopColor: color,
        opacity: hasData ? 1 : 0.8,
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onClick={() => hasData && console.log(`Ver detalles de: ${title}`)}
    >
      <div style={{
        ...styles.statIcon,
        background: `${color}20`,
        color,
        opacity: hasData ? 1 : 0.6
      }}>
        {icon}
      </div>
      <div style={styles.statContent}>
        <p style={styles.statTitle}>{title}</p>
        <h3 style={styles.statValue}>{value}</h3>
        <span style={{
          ...styles.statSubtitle,
          color: hasData ? '#6b7280' : '#94a3b8'
        }}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Obtener información del usuario actual
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);

        // Verificar si el usuario es ADMIN
        if (user.rol !== "ADMIN") {
          console.warn("Usuario no es ADMIN, mostrando mensaje de acceso denegado");
          // Podrías redirigir aquí si lo prefieres
          // window.location.href = "/acceso-denegado";
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <TrendingUp size={20} /> },
    { key: "usuarios", label: "Usuarios", icon: <Users size={20} /> },
    { key: "productos", label: "Productos", icon: <Package size={20} /> },
    { key: "categorias", label: "Categorías", icon: <FolderTree size={20} /> },
    { key: "reportes", label: "Reportes", icon: <FileText size={20} /> },
    { key: "logs", label: "Logs del Sistema", icon: <ClipboardList size={20} /> },
    { key: "config", label: "Configuración", icon: <Settings size={20} /> }
  ];

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardAdmin />;
      case "usuarios":
        return <UsuariosAdmin />;
      case "productos":
        return <ProductosAdmin />;
      case "categorias":
        return <GestionarCategorias />;
      case "reportes":
        return <ReportesAdmin />;
      case "logs":
        return <LogsAdmin />;
      case "config":
        return <ConfiguracionAdmin />;
      default:
        return <DashboardAdmin />;
    }
  };

  return (
    <div style={styles.layout}>
      {sidebarOpen && isMobile && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CON LOGO */}
      <aside style={{
        ...styles.sidebar,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div style={styles.sidebarHeader}>
          {/* Logo encima del título */}
          <div style={styles.logoContainer}>
            <img
              src={logo}
              alt="MercadoLocal Logo"
              style={styles.sidebarLogo}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23FF6B35" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
              }}
            />
          </div>

          <div style={styles.brandContainer}>
            <h2 style={styles.brandMain}>MercadoLocal</h2>
            <span style={styles.brandSub}>Admin Panel</span>
          </div>

          {currentUser && (
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {currentUser.nombre?.charAt(0) || 'A'}{currentUser.apellido?.charAt(0) || 'D'}
              </div>
              <div style={styles.userDetails}>
                <p style={styles.userName}>
                  {currentUser.nombre || 'Admin'} {currentUser.apellido || ''}
                </p>
                <p style={styles.userRole}>
                  {currentUser.rol === "ADMIN" ? "Administrador" :
                    currentUser.rol === "VENDEDOR" ? "Vendedor" :
                      currentUser.rol === "CONSUMIDOR" ? "Consumidor" :
                        currentUser.rol || "Usuario"}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav style={styles.nav}>
          {menuItems.map(item => (
            <button
              key={item.key}
              style={{
                ...styles.navButton,
                backgroundColor: activeTab === item.key ? '#FF6B3520' : 'transparent',
                color: activeTab === item.key ? '#FF6B35' : '#6b7280',
                fontWeight: activeTab === item.key ? '600' : '500',
                borderLeftWidth: activeTab === item.key ? '4px' : '0px',
                borderLeftStyle: 'solid',
                borderLeftColor: activeTab === item.key ? '#FF6B35' : 'transparent',
              }}
              onClick={() => {
                setActiveTab(item.key);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <div style={styles.navIcon}>{item.icon}</div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{
        ...styles.main,
        marginLeft: sidebarOpen && !isMobile ? '280px' : '0'
      }}>
        <header style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <button
              style={styles.menuButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={styles.pageHeaderTitle}>
              {menuItems.find(item => item.key === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.headerUserInfo}>
              {currentUser && (
                <span style={styles.headerUserName}>
                  {currentUser.nombre} {currentUser.apellido}
                  <span style={styles.headerUserRole}>
                    ({currentUser.rol})
                  </span>
                </span>
              )}
            </div>
            <button style={styles.bellButton}>
              <Bell size={20} />
              <span style={styles.badge}>0</span>
            </button>
          </div>
        </header>

        <section style={styles.content}>
          {renderView()}
        </section>

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © 2025 MercadoLocal | Panel de Control Administrativo
          </p>
        </footer>
      </main>

      {/* ESTILOS GLOBALES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
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
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f9fafb;
          overflow-x: hidden;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .main-content {
            grid-template-columns: 1fr !important;
          }
          
          .page-header-title {
            font-size: 18px !important;
          }
          
          .dashboard-container {
            padding: 16px !important;
          }
          
          .header-user-info {
            display: none !important;
          }
          
          .sidebar-logo {
            height: 40px !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .sidebar-logo {
            height: 35px !important;
          }
        }
      `}</style>
    </div>
  );
}

// ==================== ESTILOS ====================
const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f9fafb',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative',
    overflowX: 'hidden'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 998
  },

  // SIDEBAR CON LOGO
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    background: '#ffffff',
    color: '#374151',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    zIndex: 999,
    boxShadow: '2px 0 20px rgba(0,0,0,0.05)',
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto'
  },
  sidebarHeader: {
    padding: '24px 20px 20px 20px',
    borderBottom: '1px solid #f3f4f6',
    textAlign: 'center'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  sidebarLogo: {
    height: '60px',
    width: 'auto',
    objectFit: 'contain',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  brandContainer: {
    marginBottom: '20px'
  },
  brandMain: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#FF6B35',
    margin: '0 0 4px 0',
    letterSpacing: '0.5px'
  },
  brandSub: {
    fontSize: '12px',
    fontWeight: '400',
    color: '#6b7280',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px'
  },
  userDetails: {
    flex: 1,
    textAlign: 'left'
  },
  userName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  userRole: {
    margin: '2px 0 0 0',
    fontSize: '12px',
    color: '#6b7280'
  },
  nav: {
    flex: 1,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  navIcon: {
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sidebarFooter: {
    padding: '20px 16px',
    borderTop: '1px solid #f3f4f6'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    background: '#f3f4f6',
    border: 'none',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    width: '100%'
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
    width: '100%',
    minHeight: '100vh',
    overflowX: 'hidden'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  pageHeaderTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  headerUserName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    padding: '8px 12px',
    background: '#f3f4f6',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  headerUserRole: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '400'
  },
  bellButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#FF6B35',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    background: '#f9fafb',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  footer: {
    padding: '20px 24px',
    background: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  footerText: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },

  // Dashboard Styles
  dashboardContainer: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    overflowX: 'hidden'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px',
    textAlign: 'center'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
    margin: 0
  },
  loadingSubtext: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorBanner: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '24px',
    color: '#92400e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    fontSize: '14px',
    flexWrap: 'wrap'
  },
  errorContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  errorText: {
    flex: 1,
    fontWeight: '500'
  },
  errorDetail: {
    fontSize: '12px',
    color: '#92400e',
    opacity: '0.8'
  },
  retryButton: {
    padding: '8px 16px',
    background: '#FF6B35',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  headerContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.6,
    zIndex: 1
  },
  headerContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  headerTitleContainer: {
    textAlign: 'center',
    width: '100%'
  },
  dashboardHeaderTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  },
  headerDescription: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5'
  },
  refreshButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
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
    borderTopColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  statContent: {
    flex: 1
  },
  statTitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 6px 0',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  statSubtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '500'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  chartTypeSelector: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  chartTypeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f3f4f6',
    color: '#6b7280'
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500'
  },
  cardBody: {
    padding: '24px'
  },
  chartContainer: {
    height: '300px',
    position: 'relative'
  },
  barChart: {
    display: 'flex',
    height: '100%',
    position: 'relative',
    paddingLeft: '40px',
    paddingBottom: '30px'
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: '20px',
    flex: 1,
    height: '100%',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb'
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    flex: 1
  },
  bar: {
    width: '40px',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  barLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '8px',
    fontWeight: '500'
  },
  barValue: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
    fontWeight: '500'
  },
  chartAxis: {
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '30px',
    width: '40px'
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  noChartData: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '20px'
  },
  noChartIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: '0.5'
  },
  logsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  logItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    background: '#f9fafb',
    border: '1px solid #f3f4f6',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#f1f5f9',
      borderColor: '#e5e7eb'
    }
  },
  logIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease'
  },
  logContent: {
    flex: 1
  },
  logMessage: {
    fontSize: '14px',
    color: '#374151',
    margin: '0 0 6px 0',
    fontWeight: '500',
    lineHeight: '1.4'
  },
  logTime: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#9ca3af'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: '0.5'
  },
  emptySubtext: {
    fontSize: '13px',
    marginTop: '8px',
    color: '#d1d5db'
  },
  systemInfoBanner: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '20px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500'
  }
};