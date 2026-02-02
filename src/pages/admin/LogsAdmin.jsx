import { useEffect, useState } from "react";
import { 
  FileSearch, 
  AlertCircle, 
  Filter, 
  Download, 
  RefreshCw, 
  Clock, 
  User, 
  Activity, 
  X,
  Search,
  ChevronDown,
  BarChart3,
  Shield,
  Database,
  Terminal,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  TrendingUp,
  Package,
  Layers,
  AlertOctagon
} from "lucide-react";
// IMPORTACIONES DE NOTIFICACIONES
import Notificaciones from "../../components/Notificaciones";
import useNotification from "../../hooks/useNotification";

const API_URL = "http://localhost:8080";

export default function LogsAdmin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [token, setToken] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchLogs = () => {
    if (!token) {
      setError("No hay token de autenticación");
      setLoading(false);
      notificaciones.advertenciaLogin();
      return;
    }

    setLoading(true);
    setRefreshing(true);
    setError(null);
    
    // Notificación de inicio de carga
    notificaciones.info("Cargando registros", "Obteniendo logs del sistema...", "reloj");

    fetch(`${API_URL}/admin/logs`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error("Error cargando logs");
        return res.json();
      })
      .then(data => {
        const logsArray = Array.isArray(data) ? data : [];
        setLogs(logsArray);
        setLoading(false);
        setRefreshing(false);
        
        // Notificación de éxito
        if (logsArray.length > 0) {
          notificaciones.exito(
            "Registros cargados", 
            `Se cargaron ${logsArray.length} registros correctamente`,
            "check"
          );
        } else {
          notificaciones.advertencia(
            "Sin registros", 
            "No se encontraron registros en el sistema", 
            "caja"
          );
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
        setRefreshing(false);
        notificaciones.errorConexion();
      });
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.accion?.toLowerCase().includes(filter.toLowerCase()) ||
      log.usuario?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesType = filterType === "all" || log.tipo === filterType;
    
    return matchesSearch && matchesType;
  });

  const exportLogs = () => {
    if (filteredLogs.length === 0) {
      notificaciones.advertencia(
        "Sin datos para exportar", 
        "No hay registros que coincidan con los filtros aplicados", 
        "caja"
      );
      return;
    }
    
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Notificación de éxito
    notificaciones.exito(
      "Logs exportados", 
      `Se han exportado ${filteredLogs.length} registros en formato JSON`,
      "exportar"
    );
  };

  const getLogTypeColor = (tipo) => {
    const colors = {
      info: { 
        bg: "rgba(59, 130, 246, 0.15)", 
        color: "#3B82F6", 
        border: "#3B82F6",
        icon: <Info size={16} />,
        gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)'
      },
      warning: { 
        bg: "rgba(245, 158, 11, 0.15)", 
        color: "#F59E0B", 
        border: "#F59E0B",
        icon: <AlertTriangle size={16} />,
        gradient: 'linear-gradient(135deg, #F59E0B, #D97706)'
      },
      error: { 
        bg: "rgba(239, 68, 68, 0.15)", 
        color: "#EF4444", 
        border: "#EF4444",
        icon: <AlertOctagon size={16} />,
        gradient: 'linear-gradient(135deg, #EF4444, #DC2626)'
      },
      success: { 
        bg: "rgba(16, 185, 129, 0.15)", 
        color: "#10B981", 
        border: "#10B981",
        icon: <CheckCircle size={16} />,
        gradient: 'linear-gradient(135deg, #10B981, #059669)'
      }
    };
    return colors[tipo] || colors.info;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const limpiarFiltros = () => {
    setFilter("");
    setFilterType("all");
    notificaciones.info("Filtros limpiados", "Se han restablecido todos los filtros", "check");
  };

  const handleRefresh = () => {
    notificaciones.infoProcesoIniciado();
    fetchLogs();
  };

  // =================== COMPONENTE SELECTOR DE FILTROS ===================
  const FilterSelector = () => {
    return (
      <div style={styles.selectorFiltroContainer}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={styles.selectorFiltroBoton}
        >
          <Filter size={16} />
          <span>
            Filtros: 
            {filter ? ` "${filter}"` : 
             filterType === "all" ? ' Todos' : 
             filterType === "info" ? ' Información' :
             filterType === "warning" ? ' Advertencias' :
             filterType === "error" ? ' Errores' :
             filterType === "success" ? ' Éxitos' : ` ${filterType}`}
          </span>
          <ChevronDown size={16} />
        </button>
        
        {showFilters && (
          <div style={styles.selectorFiltroMenu}>
            <div style={styles.busquedaFiltroContainer}>
              <Search size={14} style={styles.busquedaFiltroIcon} />
              <input
                type="text"
                placeholder="Buscar por acción o usuario..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.busquedaFiltroInput}
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  style={styles.busquedaFiltroClear}
                >
                  <X size={12} />
                </button>
              )}
            </div>
            
            <div style={styles.opcionesContainer}>
              {["all", "info", "warning", "error", "success"].map((type) => {
                const typeConfig = getLogTypeColor(type === "all" ? "info" : type);
                const isActive = filterType === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilters(false);
                      if (type !== "all") {
                        const count = logs.filter(l => l.tipo === type).length;
                        notificaciones.info(
                          "Filtro aplicado", 
                          `Mostrando ${type === "info" ? "información" : 
                           type === "warning" ? "advertencias" : 
                           type === "error" ? "errores" : "éxitos"} (${count} registros)`, 
                          "config"
                        );
                      } else {
                        notificaciones.info(
                          "Filtro aplicado", 
                          "Mostrando todos los tipos de registros", 
                          "config"
                        );
                      }
                    }}
                    style={{
                      ...styles.opcionFiltro,
                      backgroundColor: isActive ? `${typeConfig.color}15` : 'transparent',
                      color: isActive ? typeConfig.color : '#6b7280',
                      borderLeft: isActive ? `3px solid ${typeConfig.color}` : '3px solid transparent'
                    }}
                  >
                    {type !== "all" && typeConfig.icon}
                    <span style={styles.opcionTexto}>
                      {type === "all" ? 'Todos los tipos' : 
                       type === "info" ? 'Información' :
                       type === "warning" ? 'Advertencias' :
                       type === "error" ? 'Errores' :
                       'Éxitos'}
                    </span>
                    <span style={styles.opcionCount}>
                      {type === "all" ? logs.length : 
                       logs.filter(l => l.tipo === type).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calcular estadísticas
  const stats = {
    total: logs.length,
    info: logs.filter(l => l.tipo === 'info').length,
    warning: logs.filter(l => l.tipo === 'warning').length,
    error: logs.filter(l => l.tipo === 'error').length,
    success: logs.filter(l => l.tipo === 'success').length
  };

  if (loading) {
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
        
        <div style={styles.mainContent}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingContent}>
              <h3 style={styles.loadingTitle}>Analizando Registros del Sistema</h3>
              <p style={styles.loadingText}>Cargando eventos y actividad...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Terminal size={40} />
            </div>
            
            <div style={styles.headerTitleContainer}>
              <h1 style={styles.dashboardHeaderTitle}>
                Registros y Auditoría del Sistema
              </h1>
              <p style={styles.headerDescription}>
                Sistema MercadoLocal-IA • {logs.length} eventos registrados • Monitoreo en tiempo real
              </p>
            </div>
            
            <div style={styles.refreshButtonContainer}>
              <button
                style={styles.refreshButton}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw size={18} /> {refreshing ? "Actualizando..." : "Actualizar registros"}
              </button>
              <div style={styles.timeInfo}>
                <Clock size={14} />
                Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderTopColor: colorPalette.primary}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.primary}20`, color: colorPalette.primary}}>
              <Database size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.total}</h3>
              <p style={styles.statLabel}>TOTAL DE REGISTROS</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> Sistema activo
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard, borderTopColor: colorPalette.info}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.info}20`, color: colorPalette.info}}>
              <Info size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.info}</h3>
              <p style={styles.statLabel}>INFORMACIÓN</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> Eventos informativos
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard, borderTopColor: colorPalette.warning}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.warning}20`, color: colorPalette.warning}}>
              <AlertTriangle size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.warning}</h3>
              <p style={styles.statLabel}>ADVERTENCIAS</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> Atención requerida
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard, borderTopColor: colorPalette.danger}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.danger}20`, color: colorPalette.danger}}>
              <AlertOctagon size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.error}</h3>
              <p style={styles.statLabel}>ERRORES</p>
              <span style={styles.statTrend}>
                <TrendingUp size={14} /> Requieren acción inmediata
              </span>
            </div>
          </div>
        </div>

        {error ? (
          <div style={styles.errorState}>
            <div style={styles.errorIcon}>
              <AlertCircle size={48} />
            </div>
            <h4 style={styles.errorTitle}>Error al cargar registros</h4>
            <p style={styles.errorText}>
              {error}
            </p>
            <button onClick={handleRefresh} style={styles.errorButton}>
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Control Panel */}
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <h3 style={styles.tableTitle}>
                  Registros de Actividad
                  <span style={styles.tableCount}>
                    ({filteredLogs.length} resultados de {logs.length})
                  </span>
                </h3>
                <div style={styles.tableActions}>
                  <button 
                    onClick={exportLogs}
                    disabled={filteredLogs.length === 0}
                    style={{
                      ...styles.exportButton,
                      opacity: filteredLogs.length === 0 ? 0.5 : 1,
                      cursor: filteredLogs.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Download size={16} />
                    Exportar JSON
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div style={styles.filtrosContainer}>
                <FilterSelector />
                
                {(filter || filterType !== "all") && (
                  <button
                    onClick={limpiarFiltros}
                    style={styles.limpiarFiltrosButton}
                  >
                    <X size={14} />
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Logs List */}
              <div style={styles.logsContent}>
                {filteredLogs.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      <FileSearch size={48} />
                    </div>
                    <h4 style={styles.emptyTitle}>No se encontraron registros</h4>
                    <p style={styles.emptyText}>
                      {filter || filterType !== "all" 
                        ? "Intenta ajustar los filtros de búsqueda"
                        : "Los registros aparecerán aquí cuando ocurran eventos en el sistema"}
                    </p>
                  </div>
                ) : (
                  <div style={styles.logsList}>
                    {filteredLogs.map((log, index) => {
                      const typeConfig = getLogTypeColor(log.tipo);
                      return (
                        <div
                          key={log.id || index}
                          style={styles.logCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.12)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.05)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div style={styles.logHeader}>
                            <div style={{
                              ...styles.logTypeBadge,
                              background: typeConfig.bg,
                              color: typeConfig.color,
                              border: `2px solid ${typeConfig.border}`
                            }}>
                              {typeConfig.icon}
                              <span>{log.tipo}</span>
                            </div>
                            
                            <div style={styles.logTimestamp}>
                              <Clock size={14} />
                              {formatDate(log.fecha)}
                            </div>
                          </div>
                          
                          <div style={styles.logBody}>
                            <h4 style={styles.logAction}>
                              {log.accion}
                            </h4>
                            
                            <div style={styles.logMeta}>
                              <span style={styles.logUser}>
                                <User size={14} />
                                <strong>{log.usuario || 'Sistema'}</strong>
                              </span>
                              
                              {log.ip && (
                                <span style={styles.logIp}>
                                  <Activity size={14} />
                                  {log.ip}
                                </span>
                              )}
                            </div>
                            
                            {log.detalles && (
                              <div style={styles.logDetails}>
                                <p style={styles.detailsText}>
                                  {log.detalles}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Información del Sistema */}
              <div style={styles.systemInfo}>
                <div style={styles.systemInfoContent}>
                  <Terminal size={16} />
                  <span>
                    Panel de Auditoría • Sistema MercadoLocal-IA • 
                    {stats.total} registros • {stats.error} errores • {stats.warning} advertencias • 
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

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
    alignItems: 'center',
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
    minWidth: '280px',
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
    alignItems: 'center',
    gap: '10px'
  },
  
  opcionTexto: {
    flex: 1
  },
  
  opcionCount: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#9ca3af',
    background: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  
  limpiarFiltrosButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#f3f4f6',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  // Contenedor de Tabla/Logs
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
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
  
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  // Logs Content
  logsContent: {
    minHeight: '400px'
  },
  
  logsList: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '600px',
    overflowY: 'auto'
  },
  
  logCard: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    animation: 'fadeIn 0.5s ease-out'
  },
  
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  
  logTypeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  logTimestamp: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  logBody: {
    flex: 1
  },
  
  logAction: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
    lineHeight: '1.5'
  },
  
  logMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  
  logUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500'
  },
  
  logIp: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500'
  },
  
  logDetails: {
    padding: '12px',
    background: 'white',
    borderRadius: '8px',
    borderLeft: '3px solid #FF6B35',
    marginTop: '12px'
  },
  
  detailsText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.6',
    fontStyle: 'italic'
  },
  
  // Empty State
  emptyState: {
    padding: '80px 20px',
    textAlign: 'center'
  },
  
  emptyIcon: {
    color: '#d1d5db',
    marginBottom: '16px'
  },
  
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6b7280',
    margin: '0 0 8px 0'
  },
  
  emptyText: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
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