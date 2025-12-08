import { useState, useEffect } from "react";
import { Menu, X, Users, Package, Store, Settings, BarChart3, LogOut, Bell, FileText, ClipboardList, TrendingUp, Activity, RefreshCw, DollarSign } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api";
import UsuariosAdmin from "./UsuariosAdmin.jsx"
import ProductosAdmin from "./ProductosAdmin.jsx"
import ReportesAdmin from "./ReportesAdmin.jsx"
import LogsAdmin from "./LogsAdmin.jsx"
import ConfiguracionAdmin from "./ConfiguracionAdmin.jsx"



// ==================== COMPONENTE DASHBOARD ====================
function DashboardAdmin() {
  const [stats, setStats] = useState({
    usuarios: 0,
    productos: 0,
    ventas: 0,
    ventasMes: 0,
    crecimiento: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No hay token guardado en localStorage");
      return;
    }

    try {
      const statsRes = await fetch("http://localhost:8080/api/admin/stats", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,  // 🔥 AQUÍ LA AUTORIZACIÓN
          "Content-Type": "application/json"
        }
      });

      console.log("Stats response:", statsRes.status);

      if (statsRes.status === 403) {
        throw new Error("❌ Token inválido o sin permisos ADMIN");
      }

      const stats = await statsRes.json();
      console.log("📊 Stats:", stats);

    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button
            style={styles.loginButton}
            onClick={() => window.location.href = "/login"}
          >
            Ir a Login
          </button>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Dashboard General</h1>
          <p style={styles.subtitle}>Resumen de actividad de la plataforma</p>
        </div>
        <button
          style={styles.refreshButton}
          onClick={fetchDashboardData}
          onMouseEnter={(e) => e.currentTarget.style.background = '#5a7d48'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6b8e4e'}
        >
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<Users size={28} />}
          title="Usuarios Totales"
          value={stats.usuarios.toLocaleString()}
          trend="+12%"
          color="#3498db"
        />
        
        <StatCard
          icon={<Package size={28} />}
          title="Productos Publicados"
          value={stats.productos.toLocaleString()}
          trend="+18%"
          color="#9b59b6"
        />
        <StatCard
          icon={<DollarSign size={28} />}
          title="Ventas Totales"
          value={`$${(stats.ventas / 1000).toFixed(1)}K`}
          trend="+22%"
          color="#f39c12"
        />
      </div>

      <div style={styles.mainContent}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <Activity size={24} /> Actividad Reciente
            </h2>
          </div>
          <div style={styles.cardBody}>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  style={styles.activityItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div
                    style={{
                      ...styles.activityDot,
                      background: activity.activo ? '#27ae60' : '#95a5a6'
                    }}
                  ></div>
                  <div style={styles.activityContent}>
                    <p style={styles.activityMessage}>{activity.mensaje}</p>
                    <span style={styles.activityTime}>{activity.tiempo}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <TrendingUp size={24} /> Ventas del Mes
            </h2>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.chartPlaceholder}>
              <div style={styles.chartIcon}>📈</div>
              <p style={styles.chartText}>
                Ventas este mes: <strong>${stats.ventasMes.toLocaleString()}</strong>
              </p>
              <p style={styles.chartSubtext}>
                Crecimiento: <span style={{ color: '#27ae60', fontWeight: '700' }}>
                  +{stats.crecimiento}%
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend, color }) {
  return (
    <div
      style={{ ...styles.statCard, borderLeftColor: color }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{ ...styles.statIcon, background: `${color}15`, color }}>{icon}</div>
      <div style={styles.statContent}>
        <p style={styles.statTitle}>{title}</p>
        <h3 style={styles.statValue}>{value}</h3>
        <span style={styles.statTrend}>
          <TrendingUp size={14} /> {trend}
        </span>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("usuarios");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const menuItems = [
    { key: "usuarios", label: "Usuarios", icon: <Users size={20} /> },
    { key: "productos", label: "Productos", icon: <Package size={20} /> },
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

      <aside style={{
        ...styles.sidebar,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.brand}>
            MercadoLocal
            <span style={styles.brandSub}>Admin Panel</span>
          </h2>
        </div>

        <nav style={styles.nav}>
          {menuItems.map(item => (
            <button
              key={item.key}
              style={{
                ...styles.navButton,
                ...(activeTab === item.key ? styles.navButtonActive : {})
              }}
              onClick={() => {
                setActiveTab(item.key);
                if (isMobile) setSidebarOpen(false);
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.key) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.key) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          style={styles.logoutButton}
          onClick={handleLogout}
          onMouseEnter={(e) => e.currentTarget.style.background = '#a83232'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#c0392b'}
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main style={{
        ...styles.main,
        marginLeft: sidebarOpen && !isMobile ? '280px' : '0'
      }}>
        <header style={styles.headerBar}>
          <div style={styles.headerLeft}>
            <button
              style={styles.menuButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5a7d48'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6b8e4e'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={styles.headerTitle}>Panel Administrativo</h1>
          </div>

          <div style={styles.headerRight}>
            <button style={styles.bellButton}>
              <Bell size={20} />
              <span style={styles.badge}>3</span>
            </button>
          </div>
        </header>

        <section style={styles.content}>
          {renderView()}
        </section>

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © 2025 MercadoLocal-IA | Panel de Control Administrativo
          </p>
        </footer>
      </main>
    </div>
  );
}

// ==================== ESTILOS ====================
const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 998,
    backdropFilter: 'blur(2px)'
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    background: 'linear-gradient(180deg, #2d4a2b 0%, #3a5a40 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    zIndex: 999,
    boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
    overflowY: 'auto'
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  brand: {
    fontSize: '24px',
    fontWeight: '800',
    margin: 0,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  brandSub: {
    fontSize: '12px',
    fontWeight: '400',
    opacity: '0.7',
    letterSpacing: '1px'
  },
  nav: {
    flex: 1,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  navButtonActive: {
    background: 'rgba(255,255,255,0.15)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '20px 16px',
    padding: '14px',
    background: '#c0392b',
    border: 'none',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.2s ease'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease',
    width: '100%'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#fff',
    borderBottom: '3px solid #6b8e4e',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
    background: '#6b8e4e',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2d3e2b',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  bellButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'transparent',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    color: '#3a5a40',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: '#e74c3c',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    background: '#f5f5f5'
  },
  footer: {
    padding: '16px 24px',
    background: '#2d4a2b',
    color: '#fff',
    textAlign: 'center'
  },
  footerText: {
    margin: 0,
    fontSize: '13px',
    opacity: '0.8'
  },
  viewPlaceholder: {
    background: '#fff',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    margin: '24px'
  },
  placeholderTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2d3e2b',
    marginBottom: '16px'
  },
  placeholderText: {
    fontSize: '16px',
    color: '#6b7f69',
    lineHeight: '1.6'
  },
  // Estilos del Dashboard
  dashboardContainer: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #6b8e4e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#666',
    fontSize: '16px',
    fontWeight: '600'
  },
  errorBanner: {
    background: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '12px',
    padding: '16px 24px',
    marginBottom: '24px',
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px'
  },
  loginButton: {
    padding: '8px 20px',
    background: '#6b8e4e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#2d3e2b',
    margin: 0,
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7f69',
    margin: 0
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#6b8e4e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid'
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statContent: {
    flex: 1
  },
  statTitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    marginBottom: '8px',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#2d3e2b',
    margin: 0,
    marginBottom: '4px'
  },
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#27ae60',
    fontWeight: '600'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '2px solid #f0f0f0'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2d3e2b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  cardBody: {
    padding: '20px 24px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    transition: 'all 0.2s ease',
    background: '#fff',
    border: '1px solid #f0f0f0'
  },
  activityDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '4px'
  },
  activityContent: {
    flex: 1
  },
  activityMessage: {
    fontSize: '15px',
    color: '#2d3e2b',
    margin: 0,
    marginBottom: '4px',
    fontWeight: '500'
  },
  activityTime: {
    fontSize: '13px',
    color: '#999',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999'
  },
  chartPlaceholder: {
    background: 'linear-gradient(135deg, #e8f5ea 0%, #d2e8d5 100%)',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center'
  },
  chartIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: '0.7'
  },
  chartText: {
    fontSize: '18px',
    color: '#2d3e2b',
    margin: 0,
    marginBottom: '8px'
  },
  chartSubtext: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  }
};