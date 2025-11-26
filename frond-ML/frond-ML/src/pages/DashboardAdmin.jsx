import { useState, useEffect } from "react";
import { Menu, X, Users, Package, Store, Settings, BarChart3, TrendingUp, ShoppingCart, AlertCircle, LogOut, Bell } from "lucide-react";

// Configuración de la API
const API_BASE_URL = "http://localhost:8080/api"; // Cambia esto a tu URL de Spring Boot

export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ usuarios: 0, vendedores: 0, productos: 0, ventas: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Llamadas paralelas a tu API de Spring Boot
      const [statsRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`),
        fetch(`${API_BASE_URL}/admin/activities`)
      ]);

      if (!statsRes.ok || !activitiesRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();

      setStats({
        usuarios: statsData.totalUsuarios || 0,
        vendedores: statsData.totalVendedores || 0,
        productos: statsData.totalProductos || 0,
        ventas: statsData.totalVentas || 0
      });

      setActivities(activitiesData.map(act => ({
        id: act.id,
        tipo: act.tipo,
        mensaje: act.mensaje,
        tiempo: formatTimeAgo(act.fecha),
        activo: act.activo || false
      })));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      // Datos de fallback si falla la API
      setStats({ usuarios: 324, vendedores: 87, productos: 1420, ventas: 24500 });
      setActivities([
        { id: 1, tipo: "nuevo_vendedor", mensaje: 'Nuevo vendedor registrado: "Granja El Sol"', tiempo: "Hace 5 min", activo: true },
        { id: 2, tipo: "producto_aprobado", mensaje: 'Producto aprobado: "Tomates Orgánicos 1kg"', tiempo: "Hace 12 min", activo: false },
        { id: 3, tipo: "reporte", mensaje: "Usuario reportó problema técnico", tiempo: "Hace 1 hora", activo: false },
        { id: 4, tipo: "inventario", mensaje: "Actualización de inventario completada", tiempo: "Hace 2 horas", activo: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (fecha) => {
    const ahora = new Date();
    const fechaEvento = new Date(fecha);
    const diffMs = ahora - fechaEvento;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHoras = Math.floor(diffMins / 60);
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    const diffDias = Math.floor(diffHoras / 24);
    return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Cargando datos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.errorContainer}>
          <AlertCircle size={48} style={{ color: '#ef4444' }} />
          <h3 style={styles.errorTitle}>Error al cargar datos</h3>
          <p style={styles.errorMessage}>{error}</p>
          <button onClick={fetchDashboardData} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      );
    }

    switch(activeTab) {
      case "dashboard":
        return (
          <>
            <div style={styles.statsGrid}>
              <StatCard title="Usuarios Totales" value={stats.usuarios} icon={<Users size={24} />} trend="+12%" />
              <StatCard title="Vendedores Activos" value={stats.vendedores} icon={<Store size={24} />} trend="+5%" />
              <StatCard title="Productos Registrados" value={stats.productos} icon={<Package size={24} />} trend="+23%" />
              <StatCard title="Ventas del Mes" value={`$${(stats.ventas / 1000).toFixed(1)}K`} icon={<ShoppingCart size={24} />} trend="+18%" />
            </div>

            <div style={styles.contentGrid}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <BarChart3 size={24} />
                  Actividad Reciente
                </h3>
                <div style={styles.activitiesList}>
                  {activities.map((activity) => (
                    <div key={activity.id} style={styles.activityItem}>
                      <div style={{...styles.activityDot, backgroundColor: activity.activo ? '#6b8e4e' : '#8fad77', animation: activity.activo ? 'pulse 2s infinite' : 'none'}}></div>
                      <span style={styles.activityText}>{activity.mensaje}</span>
                      <span style={styles.activityTime}>{activity.tiempo}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <AlertCircle size={24} />
                  Alertas
                </h3>
                <div style={styles.alertsList}>
                  <AlertItem color="orange" title="Productos pendientes" description="15 productos esperando aprobación" />
                  <AlertItem color="blue" title="Solicitudes de vendedor" description="8 nuevas solicitudes de registro" />
                  <AlertItem color="green" title="Sistema actualizado" description="Versión 1.0.0 instalada" />
                </div>
              </div>
            </div>
          </>
        );
      
      case "usuarios":
      case "vendedores":
      case "productos":
      case "configuracion":
        return <ContentPlaceholder title={`Gestión de ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`} icon={getIconForTab(activeTab)} />;
      default:
        return null;
    }
  };

  const getIconForTab = (tab) => {
    const icons = {
      usuarios: <Users size={32} />,
      vendedores: <Store size={32} />,
      productos: <Package size={32} />,
      configuracion: <Settings size={32} />
    };
    return icons[tab];
  };

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>

      <aside style={{...styles.sidebar, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <Store size={20} />
          </div>
          <div style={styles.logoText}>
            <h2 style={styles.logoTitle}>MercadoLocal</h2>
            <p style={styles.logoSubtitle}>Panel Admin</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { key: "dashboard", icon: <BarChart3 size={18}/>, label: "Dashboard" },
            { key: "usuarios", icon: <Users size={18}/>, label: "Usuarios" },
            { key: "vendedores", icon: <Store size={18}/>, label: "Vendedores" },
            { key: "productos", icon: <Package size={18}/>, label: "Productos" }
          ].map(item => (
            <NavButton key={item.key} {...item} active={activeTab === item.key} onClick={() => setActiveTab(item.key)} />
          ))}
          <div style={styles.navDivider}>
            <NavButton icon={<Settings size={18}/>} label="Configuración" active={activeTab === "configuracion"} onClick={() => setActiveTab("configuracion")} />
          </div>
        </nav>

        <div style={styles.sidebarFooter}>
          <p style={{ margin: 0 }}>v1.0.0</p>
        </div>
      </aside>

      <main style={{...styles.main, marginLeft: sidebarOpen ? '260px' : '0'}}>
        <header style={styles.header}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuButton}>
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/> }
          </button>

          <h1 style={styles.headerTitle}>Panel Administrador</h1>

          <div style={styles.headerActions}>
            <button style={styles.notificationButton}>
              <Bell size={20} style={{ color: '#3a5a40' }} />
              <span style={styles.notificationBadge}></span>
            </button>
            
            <div style={styles.userBadge}>
              <div style={styles.userAvatar}>A</div>
              <span style={styles.userName}>Admin</span>
            </div>

            <button style={styles.logoutButton}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <section style={styles.content}>
          {renderContent()}
        </section>

        <footer style={styles.footer}>
          <p style={{ margin: 0 }}>© 2025 MercadoLocal-IA — Panel Administrativo</p>
        </footer>
      </main>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={styles.overlay}></div>}
    </div>
  );
}

// Componentes optimizados
const StatCard = ({ title, value, icon, trend }) => (
  <div style={styles.statCard}>
    <div style={styles.statCardBg}></div>
    <div style={styles.statCardHeader}>
      <h3 style={styles.statCardTitle}>{title}</h3>
      <div style={styles.statCardIcon}>{icon}</div>
    </div>
    <p style={styles.statCardValue}>{value}</p>
    <div style={styles.statCardTrend}>
      <TrendingUp size={16} style={{ color: '#10b981' }} />
      <p style={styles.statCardTrendText}>{trend} vs mes anterior</p>
    </div>
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className="nav-button" style={{...styles.navButton, ...(active ? styles.navButtonActive : {})}}>
    {icon} {label}
  </button>
);

const AlertItem = ({ color, title, description }) => {
  const config = {
    orange: { bg: '#fff7ed', border: '#f97316', text: '#7c2d12' },
    blue: { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' },
    green: { bg: '#f0fdf4', border: '#10b981', text: '#14532d' }
  }[color];

  return (
    <div style={{...styles.alertItem, backgroundColor: config.bg, borderLeft: `4px solid ${config.border}`}}>
      <AlertCircle size={18} style={{ color: config.border, marginTop: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{...styles.alertTitle, color: config.text}}>{title}</p>
        <p style={{...styles.alertDescription, color: config.text}}>{description}</p>
      </div>
    </div>
  );
};

const ContentPlaceholder = ({ title, icon }) => (
  <div style={styles.placeholder}>
    <div style={styles.placeholderIcon}>{icon}</div>
    <h2 style={styles.placeholderTitle}>{title}</h2>
    <p style={styles.placeholderText}>Esta sección está en desarrollo</p>
    <p style={styles.placeholderSubtext}>Conecta tu API para mostrar datos reales</p>
  </div>
);

// Estilos optimizados
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#faf7ef', color: '#333', fontFamily: 'var(--font-body)', overflow: 'hidden' },
  sidebar: { backgroundColor: '#3a5a40', color: 'white', width: '260px', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', position: 'fixed', height: '100vh', zIndex: 20, boxShadow: '4px 0 10px rgba(0,0,0,0.15)' },
  sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', borderBottom: '1px solid #557340' },
  logo: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #6b8e4e, #557340)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
  logoText: { marginLeft: '12px' },
  logoTitle: { fontSize: '20px', fontWeight: '700', margin: 0, fontFamily: 'var(--font-title)' },
  logoSubtitle: { fontSize: '12px', margin: 0, color: '#a8c99c', fontFamily: 'var(--font-body)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 12px', flex: 1, overflowY: 'auto' },
  navDivider: { marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #557340' },
  navButton: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '400', fontFamily: 'var(--font-body)', textAlign: 'left' },
  navButtonActive: { backgroundColor: '#6b8e4e', fontWeight: '600', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
  sidebarFooter: { padding: '16px', borderTop: '1px solid #557340', textAlign: 'center', fontSize: '12px', color: '#a8c99c' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderBottom: '3px solid #6b8e4e' },
  menuButton: { padding: '10px', background: 'linear-gradient(135deg, #6b8e4e, #557340)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  headerTitle: { fontSize: '24px', fontWeight: '700', background: 'linear-gradient(135deg, #3a5a40, #6b8e4e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, fontFamily: 'var(--font-heading)' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '16px' },
  notificationButton: { position: 'relative', padding: '8px', backgroundColor: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer' },
  notificationBadge: { position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f4e8c1', padding: '8px 16px', borderRadius: '999px', border: '2px solid #6b8e4e', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  userAvatar: { width: '32px', height: '32px', background: 'linear-gradient(135deg, #3a5a40, #6b8e4e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' },
  userName: { fontWeight: '600', fontSize: '14px' },
  logoutButton: { padding: '8px', backgroundColor: 'transparent', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#3a5a40' },
  content: { padding: '24px', flex: 1, overflowY: 'auto' },
  footer: { padding: '12px', textAlign: 'center', background: 'linear-gradient(135deg, #3a5a40, #6b8e4e)', color: 'white', fontSize: '14px', boxShadow: '0 -2px 8px rgba(0,0,0,0.1)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' },
  statCard: { backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', borderLeft: '4px solid #6b8e4e', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' },
  statCardBg: { position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', backgroundColor: '#faf7ef', borderRadius: '50%', marginRight: '-60px', marginTop: '-60px', opacity: 0.5 },
  statCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', position: 'relative', zIndex: 1 },
  statCardTitle: { fontSize: '14px', fontWeight: '600', color: '#3a5a40', margin: 0, fontFamily: 'var(--font-body)' },
  statCardIcon: { width: '48px', height: '48px', background: 'linear-gradient(135deg, #6b8e4e, #557340)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(107,142,78,0.3)', color: 'white' },
  statCardValue: { fontSize: '36px', fontWeight: '700', color: '#333', margin: '0 0 8px 0', position: 'relative', zIndex: 1, fontFamily: 'var(--font-title)' },
  statCardTrend: { display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 },
  statCardTrendText: { fontSize: '14px', color: '#10b981', fontWeight: '600', margin: 0 },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  card: { backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' },
  cardTitle: { fontSize: '20px', fontWeight: '700', color: '#3a5a40', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)' },
  activitiesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  activityItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#faf7ef', borderRadius: '12px' },
  activityDot: { width: '12px', height: '12px', borderRadius: '50%' },
  activityText: { flex: 1, fontSize: '14px' },
  activityTime: { fontSize: '12px', color: '#6b7280', backgroundColor: 'white', padding: '4px 12px', borderRadius: '999px', whiteSpace: 'nowrap' },
  alertsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  alertItem: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '12px' },
  alertTitle: { fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0', fontFamily: 'var(--font-body)' },
  alertDescription: { fontSize: '12px', opacity: 0.8, margin: 0 },
  placeholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' },
  placeholderIcon: { width: '80px', height: '80px', background: 'linear-gradient(135deg, #6b8e4e, #557340)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'white', boxShadow: '0 8px 16px rgba(107,142,78,0.3)' },
  placeholderTitle: { fontSize: '24px', fontWeight: '700', color: '#3a5a40', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' },
  placeholderText: { fontSize: '16px', color: '#6b7280', margin: '0 0 8px 0' },
  placeholderSubtext: { fontSize: '14px', color: '#9ca3af', margin: 0 },
  loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' },
  spinner: { width: '64px', height: '64px', border: '4px solid #6b8e4e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  loadingText: { color: '#3a5a40', fontWeight: '600' },
  errorContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px' },
  errorTitle: { fontSize: '24px', fontWeight: '700', color: '#ef4444', margin: 0 },
  errorMessage: { fontSize: '16px', color: '#6b7280', margin: 0 },
  retryButton: { padding: '12px 24px', background: 'linear-gradient(135deg, #6b8e4e, #557340)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
  
  :root {
    --color-bg: #faf7ef;
    --color-primary: #6b8e4e;
    --color-secondary: #3a5a40;
    --color-accent: #f4e8c1;
    --color-text: #333;
    --font-title: 'Poppins', sans-serif;
    --font-body: 'Comfortaa', sans-serif;
    --font-heading: 'Playfair Display', serif;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .nav-button { transition: all 0.2s; }
  .nav-button:hover { background-color: #557340; transform: translateX(4px); }
`;