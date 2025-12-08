import { Routes, Route } from "react-router-dom";

// Importa todas tus vistas admin
import DashboardAdmin from "./DashboardAdmin";
import UsuariosAdmin from "./UsuariosAdmin";
import ProductosAdmin from "./ProductosAdmin";
import ReportesAdmin from "./ReportesAdmin";
import LogsAdmin from "./LogsAdmin";
import ConfiguracionAdmin from "./ConfiguracionAdmin";

export default function AdminPanel() {
  return (
    <div className="admin-container">
      
      {/* Aquí sigue tu sidebar y navbar sin tocarlo */}

      <div className="admin-content">

        {/* 🔥 Contenido dinámico por ruta */}
        <Routes>
          <Route path="/" element={<DashboardAdmin />} />
          <Route path="/usuarios" element={<UsuariosAdmin />} />
          <Route path="/productos" element={<ProductosAdmin />} />
          <Route path="/reportes" element={<ReportesAdmin />} />
          <Route path="/logs" element={<LogsAdmin />} />
          <Route path="/config" element={<ConfiguracionAdmin />} />
        </Routes>

      </div>
    </div>
  );
}


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
  header: {
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
    padding: '24px',
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
  }
};