// src/pages/admin/ConfiguracionAdmin.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { 
  Settings, 
  Shield, 
  Bell, 
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Download,
  ShieldCheck,
  AlertTriangle,
  X
} from "lucide-react";
import useNotification from "../../hooks/useNotification";
import Notificaciones from "../../components/Notificaciones";

const API_URL = "http://localhost:8080";

// =================== COMPONENTE DE INPUT NUMÉRICO SEPARADO ===================
const NumberInputComponent = ({ label, value, onChange, min, max, unit, colorPalette }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      onChange(0);
    } else {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        onChange(numVal);
      }
    }
  };

  const handleBlur = (e) => {
    // Primero aplicar estilos visuales
    e.target.style.borderColor = colorPalette.border;
    e.target.style.boxShadow = "none";
    
    // Luego validar el valor
    let numVal = parseFloat(e.target.value);
    if (isNaN(numVal)) {
      numVal = min || 0;
      e.target.value = numVal.toString();
    } else {
      if (min !== undefined && numVal < min) {
        numVal = min;
        e.target.value = numVal.toString();
      }
      if (max !== undefined && numVal > max) {
        numVal = max;
        e.target.value = numVal.toString();
      }
    }
    onChange(numVal);
  };

  return (
    <div style={styles.configInputContainer}>
      <label style={styles.configLabel(colorPalette)}>{label}</label>
      <div style={styles.numberInputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={value || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            all: "unset",
            boxSizing: "border-box",
            display: "block",
            width: "100%",
            padding: "12px 16px",
            border: `2px solid ${colorPalette.border}`,
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: colorPalette.bgPrimary,
            color: colorPalette.textPrimary,
            transition: "all 0.2s ease",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colorPalette.primary;
            e.target.style.boxShadow = `0 0 0 3px ${colorPalette.primary}20`;
          }}
          inputMode="decimal"
        />
        {unit && <span style={styles.inputUnit(colorPalette)}>{unit}</span>}
      </div>
    </div>
  );
};

// =================== COMPONENTE PRINCIPAL ===================
export default function ConfiguracionAdmin() {
  const [circlePositions, setCirclePositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [currentTheme] = useState("light");

  // Usar el hook de notificaciones
  const {
    notificacion,
    setNotificacion,
    notificaciones
  } = useNotification();

  // =================== DETECTAR CAMBIO EN PREFERENCIA DEL SISTEMA ===================
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      applyTheme(currentTheme);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [currentTheme]);

  const applyTheme = (theme) => {
    let themeToApply = theme;
    
    if (theme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      themeToApply = prefersDark ? "dark" : "light";
    }
    
    document.documentElement.setAttribute("data-theme", themeToApply);
    
    if (themeToApply === "dark") {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.classList.remove("light-mode");
    } else {
      document.documentElement.classList.add("light-mode");
      document.documentElement.classList.remove("dark-mode");
    }
    
    localStorage.setItem("theme", themeToApply);
    localStorage.setItem("theme-config", theme);
  };

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
  const getColorPalette = () => {
    return {
      primary: '#FF6B35',
      secondary: '#8B5CF6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      dark: '#111827',
      light: '#F3F4F6',
      bgPrimary: '#FFFFFF',
      bgSecondary: '#F9FAFB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB'
    };
  };

  const colorPalette = getColorPalette();

  // =================== CARGAR CONFIGURACIÓN ===================
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación. Por favor, inicia sesión.");
      }

      const response = await fetch(`${API_URL}/api/admin/config`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        throw new Error(`Error ${response.status}: No se pudo procesar la respuesta del servidor`);
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
        if (response.status === 403) {
          throw new Error("No tienes permisos de administrador para acceder a esta configuración.");
        }
        if (response.status === 404) {
          throw new Error("El servicio de configuración no está disponible.");
        }
        
        throw new Error(
          responseData.error || 
          responseData.message || 
          `Error ${response.status}: ${response.statusText}`
        );
      }

      setConfig(responseData);
      
    } catch (err) {
      let errorMessage = err.message;
      if (err.message.includes("Failed to fetch")) {
        errorMessage = "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8080";
      }
      
      setError(`Error al cargar configuración: ${errorMessage}`);
      notificaciones.error("Error", errorMessage);
      
      // Configuración por defecto en caso de error
      setConfig({
        tokenExpiration: 24,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        passwordMinLength: 8
      });
    } finally {
      setLoading(false);
    }
  };

  // =================== GUARDAR CONFIGURACIÓN ===================
  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`${API_URL}/api/admin/config`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error("Error al procesar respuesta del servidor");
      }
      
      if (!response.ok) {
        throw new Error(result.error || result.message || "Error al guardar configuración");
      }
      
      notificaciones.exito("Configuración guardada", "Los cambios se han guardado correctamente", "config");
      
      // Recargar configuración actualizada después de un breve delay
      setTimeout(() => {
        fetchConfig();
      }, 1000);
      
    } catch (err) {
      const errorMsg = `Error al guardar configuración: ${err.message}`;
      setError(errorMsg);
      notificaciones.error("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // =================== RESTAURAR VALORES POR DEFECTO ===================
  const handleReset = async () => {
    if (!window.confirm("¿Estás seguro de restaurar los valores por defecto?\n\nSe perderán todos los cambios no guardados.")) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`${API_URL}/api/admin/config/restaurar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error("Error al procesar respuesta del servidor");
      }
      
      if (!response.ok) {
        throw new Error(result.error || result.message || "Error al restaurar configuración");
      }
      
      // Recargar configuración actualizada
      await fetchConfig();
      notificaciones.exito("Configuración restaurada", "Se han restaurado los valores por defecto", "🔄");
      
    } catch (err) {
      const errorMsg = `Error al restaurar configuración: ${err.message}`;
      setError(errorMsg);
      notificaciones.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // =================== EXPORTAR CONFIGURACIÓN ===================
  const handleExportConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`${API_URL}/api/admin/config/exportar`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `configuracion_sistema_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      notificaciones.exito("Configuración exportada", "El archivo se ha descargado correctamente", "💾");
      
    } catch (err) {
      const errorMsg = `Error al exportar configuración: ${err.message}`;
      setError(errorMsg);
      notificaciones.error("Error", err.message);
    }
  };

  // =================== MANEJAR CAMBIOS EN CONFIG ===================
  const handleConfigChange = useCallback((key, value) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, [config]);

  // =================== COMPONENTE CONFIG CARD ===================
  const ConfigCard = useCallback(({ title, icon, children, color }) => {
    return (
      <div style={{
        ...styles.configCard(colorPalette),
        borderTop: `4px solid ${color}`,
        boxShadow: `0 8px 32px ${color}20`
      }}>
        <div style={styles.configCardHeader}>
          <div style={{
            ...styles.configCardIcon,
            background: `${color}15`,
            color: color
          }}>
            {icon}
          </div>
          <h3 style={styles.configCardTitle(colorPalette)}>{title}</h3>
        </div>
        <div style={styles.configCardBody}>
          {children}
        </div>
      </div>
    );
  }, [colorPalette]);

  if (loading && !config) {
    return (
      <div style={styles.container(colorPalette)}>
        <div style={styles.loadingContainer(colorPalette)}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingContent}>
            <h3 style={styles.loadingTitle(colorPalette)}>Cargando configuración...</h3>
            <p style={styles.loadingText(colorPalette)}>Conectando con el servidor</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container(colorPalette)}>
      {/* Notificaciones */}
      <Notificaciones 
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
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
        <div style={styles.headerContainer(colorPalette)}>
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
              <Settings size={40} />
            </div>
            
            <div style={styles.headerTitleContainer}>
              <h1 style={styles.dashboardHeaderTitle(colorPalette)}>
                Configuración de Seguridad
              </h1>
              <p style={styles.headerDescription(colorPalette)}>
                Sistema MercadoLocal-IA • Configura y controla parámetros de seguridad
              </p>
            </div>
            
            <div style={styles.actionsContainer}>
              <div style={styles.refreshButtonContainer}>
                <button
                  style={styles.refreshButton}
                  onClick={handleSave}
                  disabled={saving || loading}
                >
                  <Save size={18} /> {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button style={styles.exportButton} onClick={handleExportConfig}>
                  <Download size={18} /> Exportar configuración
                </button>
                <button style={styles.resetButton(colorPalette)} onClick={handleReset}>
                  <RefreshCw size={18} /> Restaurar valores
                </button>
              </div>
              <div style={styles.timeInfo(colorPalette)}>
                <Calendar size={14} />
                Última modificación: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de Error/Éxito */}
        {error && (
          <div style={styles.errorState(colorPalette)}>
            <div style={styles.errorIcon}>
              <AlertCircle size={24} />
            </div>
            <div style={styles.errorContent}>
              <h4 style={styles.errorTitle}>Error</h4>
              <p style={styles.errorText}>{error}</p>
            </div>
            <div style={styles.errorActions}>
              <button onClick={() => fetchConfig()} style={styles.retryButton(colorPalette)}>
                <RefreshCw size={14} /> Reintentar
              </button>
              <button onClick={() => setError(null)} style={styles.errorButton}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard(colorPalette), borderTopColor: colorPalette.primary}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.primary}20`, color: colorPalette.primary}}>
              <ShieldCheck size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber(colorPalette)}>4</h3>
              <p style={styles.statLabel(colorPalette)}>CONFIGURACIONES DE SEGURIDAD</p>
              <span style={styles.statTrend(colorPalette)}>
                <TrendingUp size={14} /> Sistema protegido
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard(colorPalette), borderTopColor: colorPalette.warning}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.warning}20`, color: colorPalette.warning}}>
              <Shield size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber(colorPalette)}>24</h3>
              <p style={styles.statLabel(colorPalette)}>HORAS DE EXPIRACIÓN</p>
              <span style={styles.statTrend(colorPalette)}>
                <TrendingUp size={14} /> Token configurado
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard(colorPalette), borderTopColor: colorPalette.success}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.success}20`, color: colorPalette.success}}>
              <Bell size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber(colorPalette)}>5</h3>
              <p style={styles.statLabel(colorPalette)}>INTENTOS MÁXIMOS</p>
              <span style={styles.statTrend(colorPalette)}>
                <TrendingUp size={14} /> Login protegido
              </span>
            </div>
          </div>
        </div>

        {/* Configuración Content - SOLO SEGURIDAD */}
        <div style={styles.configContent(colorPalette)}>
          <div style={styles.configSection}>
            <ConfigCard 
              title="Configuración de Seguridad" 
              icon={<Shield size={24} />} 
              color={colorPalette.primary}
            >
              <div style={styles.configGrid}>
                <NumberInputComponent
                  label="Expiración del token JWT (horas)"
                  value={config?.tokenExpiration}
                  onChange={(val) => handleConfigChange("tokenExpiration", val)}
                  min={1}
                  max={720}
                  unit="horas"
                  colorPalette={colorPalette}
                />
                
                <NumberInputComponent
                  label="Tiempo de sesión (minutos)"
                  value={config?.sessionTimeout}
                  onChange={(val) => handleConfigChange("sessionTimeout", val)}
                  min={5}
                  max={1440}
                  unit="minutos"
                  colorPalette={colorPalette}
                />
                
                <NumberInputComponent
                  label="Máximo de intentos de login"
                  value={config?.maxLoginAttempts}
                  onChange={(val) => handleConfigChange("maxLoginAttempts", val)}
                  min={1}
                  max={10}
                  colorPalette={colorPalette}
                />
                
                <NumberInputComponent
                  label="Longitud mínima de contraseña"
                  value={config?.passwordMinLength}
                  onChange={(val) => handleConfigChange("passwordMinLength", val)}
                  min={6}
                  max={32}
                  unit="caracteres"
                  colorPalette={colorPalette}
                />
              </div>
            </ConfigCard>
            
            <div style={styles.configTips(colorPalette)}>
              <div style={styles.tipHeader}>
                <AlertTriangle size={18} color={colorPalette.warning} />
                <h4 style={styles.tipTitle(colorPalette)}>Recomendaciones de Seguridad</h4>
              </div>
              <ul style={styles.tipList}>
                <li style={styles.tipListLi(colorPalette)}>Mantén el tiempo de sesión corto para usuarios sensibles</li>
                <li style={styles.tipListLi(colorPalette)}>Configura contraseñas de al menos 12 caracteres</li>
                <li style={styles.tipListLi(colorPalette)}>Revisa regularmente los logs de seguridad</li>
                <li style={styles.tipListLi(colorPalette)}>Limita intentos de login para prevenir ataques</li>
                <li style={styles.tipListLi(colorPalette)}>Exporta la configuración regularmente como respaldo</li>
                <li style={styles.tipListLi(colorPalette)}>Restaura valores por defecto en caso de problemas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div style={styles.systemInfo(colorPalette)}>
          <div style={styles.systemInfoContent}>
            <Settings size={16} />
            <span style={{color: colorPalette.textSecondary}}>
              Panel de Configuración de Seguridad • Sistema MercadoLocal-IA • 
              Versión 2.1.0 • Última actualización: {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Estilos globales - MINIMALISTAS */}
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

        /* SOLUCIÓN DEFINITIVA: Estilos directos para inputs */
        input, select {
          all: initial;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 12px 16px !important;
          border: 2px solid #E5E7EB !important;
          border-radius: 8px !important;
          background-color: white !important;
          color: #111827 !important;
          transition: all 0.2s ease !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }

        input:focus, select:focus {
          border-color: #FF6B35 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1) !important;
        }

        input:hover, select:hover {
          border-color: #D1D5DB !important;
        }

        /* Permitir selección de texto en inputs */
        input {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }

        /* Remover flechas en inputs numéricos */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}

// =================== ESTILOS ===================
const styles = {
  container: (palette) => ({
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: palette.bgPrimary,
    color: palette.textPrimary,
    minHeight: '100vh',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  }),
  
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
  headerContainer: (palette) => ({
    background: palette.bgSecondary,
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
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
  
  dashboardHeaderTitle: (palette) => ({
    fontSize: '32px',
    fontWeight: '700',
    color: palette.textPrimary,
    margin: '0 0 8px 0',
    lineHeight: '1.2',
    transition: 'color 0.3s ease'
  }),
  
  headerDescription: (palette) => ({
    color: palette.textSecondary,
    fontSize: '14px',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
    transition: 'color 0.3s ease'
  }),
  
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  
  refreshButtonContainer: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center'
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
  
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  
  resetButton: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: palette.light,
    color: palette.dark,
    border: `1px solid ${palette.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  }),
  
  timeInfo: (palette) => ({
    padding: '8px 16px',
    background: palette.light,
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: palette.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease'
  }),
  
  // Error State
  errorState: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: `1px solid rgba(239, 68, 68, 0.2)`,
    borderRadius: '12px',
    marginBottom: '24px',
    animation: 'fadeIn 0.3s ease-out'
  }),
  
  errorIcon: {
    color: '#EF4444'
  },
  
  errorContent: {
    flex: 1
  },
  
  errorTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#EF4444',
    margin: '0 0 4px 0'
  },
  
  errorText: {
    fontSize: '14px',
    color: '#EF4444',
    margin: 0
  },
  
  errorActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  retryButton: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  }),
  
  errorButton: {
    background: 'transparent',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  
  // Stats Cards
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  
  statCard: (palette) => ({
    background: palette.bgSecondary,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: `1px solid ${palette.border}`,
    borderTopWidth: '4px',
    borderTopStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease'
  }),
  
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
  
  statNumber: (palette) => ({
    fontSize: '24px',
    fontWeight: '700',
    color: palette.textPrimary,
    margin: '0 0 4px 0',
    transition: 'color 0.3s ease'
  }),
  
  statLabel: (palette) => ({
    fontSize: '13px',
    color: palette.textSecondary,
    margin: '0 0 6px 0',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'color 0.3s ease'
  }),
  
  statTrend: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: palette.textSecondary,
    transition: 'color 0.3s ease'
  }),
  
  // Loading
  loadingContainer: (palette) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px',
    background: palette.bgSecondary,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  loadingContent: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  
  loadingTitle: (palette) => ({
    fontSize: '18px',
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: '8px',
    transition: 'color 0.3s ease'
  }),
  
  loadingText: (palette) => ({
    fontSize: '14px',
    color: palette.textSecondary,
    transition: 'color 0.3s ease'
  }),
  
  // Config Content
  configContent: (palette) => ({
    background: palette.bgSecondary,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
  configSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    animation: 'fadeIn 0.5s ease-out'
  },
  
  configCard: (palette) => ({
    background: palette.light,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  }),
  
  configCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  
  configCardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  configCardTitle: (palette) => ({
    fontSize: '20px',
    fontWeight: '700',
    color: palette.textPrimary,
    margin: 0,
    transition: 'color 0.3s ease'
  }),
  
  configCardBody: {
    flex: 1
  },
  
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  
  // Config Inputs
  configInputContainer: {
    marginBottom: '20px'
  },
  
  configLabel: (palette) => ({
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: '8px',
    transition: 'color 0.3s ease'
  }),
  
  numberInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  inputUnit: (palette) => ({
    fontSize: '14px',
    fontWeight: '600',
    color: palette.textSecondary,
    minWidth: '60px',
    transition: 'color 0.3s ease'
  }),
  
  // Tips Section
  configTips: (palette) => ({
    background: palette.light,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
  tipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  
  tipTitle: (palette) => ({
    fontSize: '18px',
    fontWeight: '700',
    color: palette.textPrimary,
    margin: 0,
    transition: 'color 0.3s ease'
  }),
  
  tipList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  
  tipListLi: (palette) => ({
    padding: '8px 0',
    fontSize: '14px',
    color: palette.textSecondary,
    borderBottom: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
  // System Info
  systemInfo: (palette) => ({
    background: palette.light,
    border: `1px solid ${palette.border}`,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  }),
  
  systemInfoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }
};