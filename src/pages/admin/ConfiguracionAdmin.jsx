// src/pages/admin/ConfiguracionAdmin.jsx
import { useEffect, useState } from "react";
import { 
  Settings, 
  Shield, 
  Database, 
  Bell, 
  Globe, 
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

const API_URL = "http://localhost:8080";

export default function ConfiguracionAdmin() {
  const [circlePositions, setCirclePositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("seguridad");
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTheme] = useState("light");

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
      
      // Configuración por defecto en caso de error
      setConfig({
        tokenExpiration: 24,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        require2FA: false,
        passwordMinLength: 8,
        emailNotifications: true,
        systemName: "MercadoLocal-IA",
        commissionRate: 15,
        productLimitPerVendor: 50,
        currency: "USD",
        timezone: "America/Mexico_City",
        autoBackup: true,
        backupFrequency: "daily",
        keepLogsDays: 30
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
    setSuccess(null);
    
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
      
      setSuccess("✅ Configuración guardada exitosamente");
      
      // Recargar configuración actualizada después de un breve delay
      setTimeout(() => {
        fetchConfig();
      }, 1000);
      
    } catch (err) {
      setError(`Error al guardar configuración: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // =================== RESTAURAR VALORES POR DEFECTO ===================
  const handleReset = async () => {
    if (!window.confirm("¿Estás seguro de restaurar los valores por defecto?\n\nSe perderán todos los cambios no guardados.")) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
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
      setSuccess("⚙️ Configuración restaurada a valores por defecto");
      
    } catch (err) {
      setError(`Error al restaurar configuración: ${err.message}`);
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
      
      setSuccess("📥 Configuración exportada exitosamente");
      
    } catch (err) {
      setError(`Error al exportar configuración: ${err.message}`);
    }
  };

  // =================== MANEJAR CAMBIOS EN CONFIG ===================
  const handleConfigChange = (key, value) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // =================== COMPONENTE CONFIG INPUT ===================
  const ConfigInput = ({ label, value, onChange, type = "text", min, max, step, options, unit }) => {
    return (
      <div style={styles.configInputContainer}>
        <label style={styles.configLabel(colorPalette)}>{label}</label>
        {type === "select" ? (
          <select 
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={styles.configSelect(colorPalette)}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === "number" ? (
          <div style={styles.numberInputContainer}>
            <input
              type="number"
              value={value || ""}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              min={min}
              max={max}
              step={step}
              style={styles.configNumberInput(colorPalette)}
            />
            {unit && <span style={styles.inputUnit(colorPalette)}>{unit}</span>}
          </div>
        ) : type === "checkbox" ? (
          <label style={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              style={styles.configCheckbox(colorPalette)}
            />
            <span style={styles.checkboxLabel(colorPalette)}>
              {value ? "Activado" : "Desactivado"}
            </span>
          </label>
        ) : (
          <input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={styles.configTextInput(colorPalette)}
          />
        )}
      </div>
    );
  };

  // =================== COMPONENTE CONFIG CARD ===================
  const ConfigCard = ({ title, icon, children, color }) => {
    return (
      <div style={{
        ...styles.configCard(colorPalette),
        borderTop: `4px solid ${color}`,
        boxShadow: activeTab === title.toLowerCase() ? `0 8px 32px ${color}20` : styles.configCard(colorPalette).boxShadow
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
  };

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
                Configuración del Sistema
              </h1>
              <p style={styles.headerDescription(colorPalette)}>
                Sistema {config?.systemName || 'MercadoLocal-IA'} • Personaliza y controla todos los parámetros
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

        {success && (
          <div style={styles.successState(colorPalette)}>
            <div style={styles.successIcon}>
              <CheckCircle size={24} />
            </div>
            <div style={styles.successContent}>
              <h4 style={styles.successTitle}>Éxito</h4>
              <p style={styles.successText}>{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} style={styles.successButton}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard(colorPalette), borderTopColor: colorPalette.primary}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.primary}20`, color: colorPalette.primary}}>
              <ShieldCheck size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber(colorPalette)}>6</h3>
              <p style={styles.statLabel(colorPalette)}>CONFIGURACIONES DE SEGURIDAD</p>
              <span style={styles.statTrend(colorPalette)}>
                <TrendingUp size={14} /> Sistema protegido
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard(colorPalette), borderTopColor: colorPalette.warning}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.warning}20`, color: colorPalette.warning}}>
              <Globe size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber(colorPalette)}>5</h3>
              <p style={styles.statLabel(colorPalette)}>PARÁMETROS GLOBALES</p>
              <span style={styles.statTrend(colorPalette)}>
                <TrendingUp size={14} /> Configurados activamente
              </span>
            </div>
          </div>
          
          <div style={{...styles.statCard(colorPalette), borderTopColor: colorPalette.secondary}}>
            <div style={{...styles.statIcon, backgroundColor: `${colorPalette.secondary}20`, color: colorPalette.secondary}}>
              <Database size={22} />
            </div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber(colorPalette)}>3</h3>
              <p style={styles.statLabel(colorPalette)}>CONFIGURACIONES DE AUDITORÍA</p>
              <span style={styles.statTrend(colorPalette)}>
                <TrendingUp size={14} /> Sistema monitoreado
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={styles.tabsContainer(colorPalette)}>
          {[
            { id: "seguridad", label: "Seguridad", icon: <Shield size={18} />, color: colorPalette.primary },
            { id: "parametros", label: "Parámetros", icon: <Globe size={18} />, color: colorPalette.warning },
            { id: "auditoria", label: "Auditoría", icon: <Database size={18} />, color: colorPalette.secondary }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton(colorPalette),
                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
                color: activeTab === tab.id ? tab.color : colorPalette.textSecondary,
                background: activeTab === tab.id ? `${tab.color}10` : 'transparent'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Configuración Content */}
        <div style={styles.configContent(colorPalette)}>
          
          {/* Seguridad */}
          {activeTab === "seguridad" && config && (
            <div style={styles.configSection}>
              <ConfigCard 
                title="Seguridad" 
                icon={<Shield size={24} />} 
                color={colorPalette.primary}
              >
                <div style={styles.configGrid}>
                  <ConfigInput
                    label="Expiración del token JWT (horas)"
                    value={config.tokenExpiration}
                    onChange={(val) => handleConfigChange("tokenExpiration", val)}
                    type="number"
                    min={1}
                    max={720}
                    unit="horas"
                  />
                  
                  <ConfigInput
                    label="Tiempo de sesión (minutos)"
                    value={config.sessionTimeout}
                    onChange={(val) => handleConfigChange("sessionTimeout", val)}
                    type="number"
                    min={5}
                    max={1440}
                    unit="minutos"
                  />
                  
                  <ConfigInput
                    label="Máximo de intentos de login"
                    value={config.maxLoginAttempts}
                    onChange={(val) => handleConfigChange("maxLoginAttempts", val)}
                    type="number"
                    min={1}
                    max={10}
                  />
                  
                  <ConfigInput
                    label="Longitud mínima de contraseña"
                    value={config.passwordMinLength}
                    onChange={(val) => handleConfigChange("passwordMinLength", val)}
                    type="number"
                    min={6}
                    max={32}
                    unit="caracteres"
                  />
                  
                  <ConfigInput
                    label="Requerir autenticación de dos factores"
                    value={config.require2FA}
                    onChange={(val) => handleConfigChange("require2FA", val)}
                    type="checkbox"
                  />
                  
                  <ConfigInput
                    label="Notificaciones de seguridad por email"
                    value={config.emailNotifications}
                    onChange={(val) => handleConfigChange("emailNotifications", val)}
                    type="checkbox"
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
                  <li style={styles.tipListLi(colorPalette)}>Habilita 2FA para administradores y vendedores</li>
                  <li style={styles.tipListLi(colorPalette)}>Configura contraseñas de al menos 12 caracteres</li>
                  <li style={styles.tipListLi(colorPalette)}>Revisa regularmente los logs de seguridad</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Parámetros */}
          {activeTab === "parametros" && config && (
            <div style={styles.configSection}>
              <ConfigCard 
                title="Parámetros Generales" 
                icon={<Globe size={24} />} 
                color={colorPalette.warning}
              >
                <div style={styles.configGrid}>
                  <ConfigInput
                    label="Nombre del sistema"
                    value={config.systemName}
                    onChange={(val) => handleConfigChange("systemName", val)}
                    type="text"
                  />
                  
                  <ConfigInput
                    label="Comisión de venta (%)"
                    value={config.commissionRate}
                    onChange={(val) => handleConfigChange("commissionRate", val)}
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    unit="%"
                  />
                  
                  <ConfigInput
                    label="Límite de productos por vendedor"
                    value={config.productLimitPerVendor}
                    onChange={(val) => handleConfigChange("productLimitPerVendor", val)}
                    type="number"
                    min={1}
                    max={1000}
                  />
                  
                  <ConfigInput
                    label="Moneda principal"
                    value={config.currency}
                    onChange={(val) => handleConfigChange("currency", val)}
                    type="select"
                    options={[
                      { value: "USD", label: "USD - Dólar Americano" },
                      { value: "MXN", label: "MXN - Peso Mexicano" },
                      { value: "EUR", label: "EUR - Euro" },
                      { value: "COP", label: "COP - Peso Colombiano" }
                    ]}
                  />
                  
                  <ConfigInput
                    label="Zona horaria"
                    value={config.timezone}
                    onChange={(val) => handleConfigChange("timezone", val)}
                    type="select"
                    options={[
                      { value: "America/Mexico_City", label: "Ciudad de México" },
                      { value: "America/Bogota", label: "Bogotá" },
                      { value: "America/Lima", label: "Lima" },
                      { value: "America/Santiago", label: "Santiago" },
                      { value: "UTC", label: "UTC" }
                    ]}
                  />
                </div>
              </ConfigCard>
              
              <div style={styles.configTips(colorPalette)}>
                <div style={styles.tipHeader}>
                  <Bell size={18} color={colorPalette.info} />
                  <h4 style={styles.tipTitle(colorPalette)}>Configuraciones Importantes</h4>
                </div>
                <ul style={styles.tipList}>
                  <li style={styles.tipListLi(colorPalette)}>La comisión de venta se aplica a todas las transacciones</li>
                  <li style={styles.tipListLi(colorPalette)}>El límite de productos ayuda a mantener la calidad del catálogo</li>
                  <li style={styles.tipListLi(colorPalette)}>Configura la moneda según tu mercado principal</li>
                  <li style={styles.tipListLi(colorPalette)}>Las notificaciones mantienen a los usuarios informados</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Auditoría */}
          {activeTab === "auditoria" && config && (
            <div style={styles.configSection}>
              <ConfigCard 
                title="Auditoría & Respaldos" 
                icon={<Database size={24} />} 
                color={colorPalette.secondary}
              >
                <div style={styles.configGrid}>
                  <ConfigInput
                    label="Respaldo automático"
                    value={config.autoBackup}
                    onChange={(val) => handleConfigChange("autoBackup", val)}
                    type="checkbox"
                  />
                  
                  <ConfigInput
                    label="Frecuencia de respaldo"
                    value={config.backupFrequency}
                    onChange={(val) => handleConfigChange("backupFrequency", val)}
                    type="select"
                    options={[
                      { value: "hourly", label: "Cada hora" },
                      { value: "daily", label: "Diario" },
                      { value: "weekly", label: "Semanal" },
                      { value: "monthly", label: "Mensual" }
                    ]}
                  />
                  
                  <ConfigInput
                    label="Mantener logs por (días)"
                    value={config.keepLogsDays}
                    onChange={(val) => handleConfigChange("keepLogsDays", val)}
                    type="number"
                    min={1}
                    max={365}
                    unit="días"
                  />
                  
                  <div style={styles.backupActions}>
                    <button style={styles.backupButton} onClick={handleExportConfig}>
                      <Download size={16} />
                      Exportar configuración
                    </button>
                    <button style={{...styles.backupButton, background: colorPalette.light, color: colorPalette.dark}} onClick={handleReset}>
                      <RefreshCw size={16} />
                      Restaurar valores por defecto
                    </button>
                  </div>
                  
                  <div style={styles.storageInfo(colorPalette)}>
                    <h4 style={styles.storageTitle(colorPalette)}>Información de Almacenamiento</h4>
                    <div style={styles.storageStats}>
                      <div style={styles.storageStat(colorPalette)}>
                        <span style={styles.storageLabel(colorPalette)}>Logs del sistema:</span>
                        <span style={styles.storageValue(colorPalette)}>2.4 GB</span>
                      </div>
                      <div style={styles.storageStat(colorPalette)}>
                        <span style={styles.storageLabel(colorPalette)}>Respaldos totales:</span>
                        <span style={styles.storageValue(colorPalette)}>15</span>
                      </div>
                      <div style={styles.storageStat(colorPalette)}>
                        <span style={styles.storageLabel(colorPalette)}>Espacio disponible:</span>
                        <span style={styles.storageValue(colorPalette)}>48.2 GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ConfigCard>
              
              <div style={styles.configTips(colorPalette)}>
                <div style={styles.tipHeader}>
                  <Database size={18} color={colorPalette.dark} />
                  <h4 style={styles.tipTitle(colorPalette)}>Recomendaciones de Respaldo</h4>
                </div>
                <ul style={styles.tipList}>
                  <li style={styles.tipListLi(colorPalette)}>Realiza respaldos manuales antes de cambios importantes</li>
                  <li style={styles.tipListLi(colorPalette)}>Guarda respaldos en ubicaciones externas seguras</li>
                  <li style={styles.tipListLi(colorPalette)}>Verifica periódicamente la integridad de los respaldos</li>
                  <li style={styles.tipListLi(colorPalette)}>Mantén un historial de al menos 30 días de logs</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Información del Sistema */}
        <div style={styles.systemInfo(colorPalette)}>
          <div style={styles.systemInfoContent}>
            <Settings size={16} />
            <span style={{color: colorPalette.textSecondary}}>
              Panel de Configuración • Sistema {config?.systemName || 'MercadoLocal-IA'} • 
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

        /* Estilos globales para dark mode */
        .dark-mode {
          background-color: #111827;
          color: #F9FAFB;
        }

        .light-mode {
          background-color: #FFFFFF;
          color: #111827;
        }

        [data-theme="dark"] {
          background-color: #111827;
          color: #F9FAFB;
        }

        [data-theme="light"] {
          background-color: #FFFFFF;
          color: #111827;
        }

        /* Aplicar tema a todo el body */
        body {
          transition: background-color 0.3s ease, color 0.3s ease;
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
  
  // Success State
  successState: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: `1px solid rgba(16, 185, 129, 0.2)`,
    borderRadius: '12px',
    marginBottom: '24px',
    animation: 'fadeIn 0.3s ease-out'
  }),
  
  successIcon: {
    color: '#10B981'
  },
  
  successContent: {
    flex: 1
  },
  
  successTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#10B981',
    margin: '0 0 4px 0'
  },
  
  successText: {
    fontSize: '14px',
    color: '#10B981',
    margin: 0
  },
  
  successButton: {
    background: 'transparent',
    border: 'none',
    color: '#10B981',
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
  
  // Tabs
  tabsContainer: (palette) => ({
    background: palette.bgSecondary,
    borderRadius: '12px',
    padding: '16px 24px',
    marginBottom: '24px',
    display: 'flex',
    gap: '16px',
    overflowX: 'auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
  tabButton: (palette) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    borderRadius: '8px',
    flexShrink: 0
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
  
  configTextInput: (palette) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${palette.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    outline: 'none',
    background: palette.bgPrimary,
    color: palette.textPrimary,
    '&:focus': {
      borderColor: '#FF6B35'
    }
  }),
  
  configSelect: (palette) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${palette.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    background: palette.bgPrimary,
    color: palette.textPrimary,
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: '#FF6B35'
    }
  }),
  
  numberInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  configNumberInput: (palette) => ({
    flex: 1,
    padding: '12px 16px',
    border: `2px solid ${palette.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    outline: 'none',
    background: palette.bgPrimary,
    color: palette.textPrimary,
    '&:focus': {
      borderColor: '#FF6B35'
    }
  }),
  
  inputUnit: (palette) => ({
    fontSize: '14px',
    fontWeight: '600',
    color: palette.textSecondary,
    minWidth: '60px',
    transition: 'color 0.3s ease'
  }),
  
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  
  configCheckbox: (palette) => ({
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#FF6B35'
  }),
  
  checkboxLabel: (palette) => ({
    fontSize: '14px',
    fontWeight: '600',
    color: palette.textSecondary,
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
  
  // Backup Actions
  backupActions: {
    gridColumn: '1 / -1',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  
  backupButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },
  
  // Storage Info
  storageInfo: (palette) => ({
    gridColumn: '1 / -1',
    background: palette.light,
    borderRadius: '8px',
    padding: '20px',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
  storageTitle: (palette) => ({
    fontSize: '16px',
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: '16px',
    transition: 'color 0.3s ease'
  }),
  
  storageStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  
  storageStat: (palette) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: palette.bgPrimary,
    borderRadius: '6px',
    border: `1px solid ${palette.border}`,
    transition: 'all 0.3s ease'
  }),
  
  storageLabel: (palette) => ({
    fontSize: '14px',
    color: palette.textSecondary,
    fontWeight: '500',
    transition: 'color 0.3s ease'
  }),
  
  storageValue: (palette) => ({
    fontSize: '16px',
    fontWeight: '700',
    color: palette.textPrimary,
    transition: 'color 0.3s ease'
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