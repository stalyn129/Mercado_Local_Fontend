import { useEffect, useState } from "react";
import { FileSearch, AlertCircle, Filter, Download, RefreshCcw, Clock, User, Activity, X } from "lucide-react";

const API_URL = "http://localhost:8080";

export default function LogsAdmin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchLogs = () => {
    if (!token) {
      setError("No hay token de autenticación");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

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
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
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
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLogTypeColor = (tipo) => {
    const colors = {
      info: { bg: "#E8F5E3", color: "#5A8F48", border: "#5A8F48" },
      warning: { bg: "#FFF9E6", color: "#F5C744", border: "#F5C744" },
      error: { bg: "#FFF0F2", color: "#DA3E52", border: "#DA3E52" },
      success: { bg: "#E8F5E3", color: "#5A8F48", border: "#5A8F48" }
    };
    return colors[tipo] || colors.info;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return dateString.replace("T", " ").substring(0, 19);
  };

  const limpiarFiltros = () => {
    setFilter("");
    setFilterType("all");
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            display: "inline-block",
            width: "50px",
            height: "50px",
            border: "5px solid #ECF2E3",
            borderTop: "5px solid #5A8F48",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }}></div>
          <p style={{ 
            color: "#6B7F69",
            fontSize: "18px",
            fontWeight: "600",
            margin: 0
          }}>
            Cargando registros...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      <div style={{ 
        maxWidth: "1600px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px"
      }}>
        
        {/* Header Section */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decoración de fondo */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
            borderRadius: "50%",
            opacity: "0.5",
            zIndex: "0"
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
            borderRadius: "50%",
            opacity: "0.1",
            zIndex: "0"
          }}></div>

          <div style={{ 
            position: "relative", 
            zIndex: "1",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ textAlign: "center" }}>
              {/* Icono decorativo */}
              <div style={{
                fontSize: "56px",
                marginBottom: "16px",
                filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
              }}>
                📋
              </div>

              {/* Título principal */}
              <h1 style={{ 
                fontSize: "42px", 
                fontWeight: "800", 
                color: "#2D3E2B",
                marginBottom: "12px",
                letterSpacing: "-0.5px",
                lineHeight: "1.2"
              }}>
                Registro del Sistema
              </h1>

              {/* Subtítulo */}
              <p style={{ 
                color: "#6B7F69", 
                fontSize: "16px",
                margin: "0 0 32px 0",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: "1.6"
              }}>
                Monitorea todas las actividades y eventos del sistema en tiempo real
              </p>

              {/* Botones */}
              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={fetchLogs}
                  style={{
                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    color: "white",
                    padding: "16px 40px",
                    fontWeight: "700",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 6px 20px rgba(90, 143, 72, 0.35)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px)";
                    e.target.style.boxShadow = "0 8px 24px rgba(90, 143, 72, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.35)";
                  }}
                >
                  <RefreshCcw style={{ width: "20px", height: "20px" }} />
                  Actualizar Registros
                </button>

                <button
                  onClick={exportLogs}
                  disabled={filteredLogs.length === 0}
                  style={{
                    background: filteredLogs.length === 0 ? "#E0E0E0" : "#F5C744",
                    color: filteredLogs.length === 0 ? "#999" : "white",
                    padding: "16px 40px",
                    fontWeight: "700",
                    borderRadius: "14px",
                    border: "none",
                    cursor: filteredLogs.length === 0 ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: filteredLogs.length === 0 ? "none" : "0 6px 20px rgba(245, 199, 68, 0.35)",
                    transition: "all 0.3s ease",
                    opacity: filteredLogs.length === 0 ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (filteredLogs.length > 0) {
                      e.target.style.transform = "translateY(-3px)";
                      e.target.style.boxShadow = "0 8px 24px rgba(245, 199, 68, 0.45)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filteredLogs.length > 0) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 6px 20px rgba(245, 199, 68, 0.35)";
                    }
                  }}
                >
                  <Download style={{ width: "20px", height: "20px" }} />
                  Exportar JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "32px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <h2 style={{ 
              fontSize: "22px",
              fontWeight: "700",
              color: "#2D3E2B",
              margin: 0
            }}>
              🔍 Filtros de Búsqueda
            </h2>
            <button
              onClick={limpiarFiltros}
              style={{
                background: "#FFF9E6",
                color: "#F5C744",
                border: "2px solid #F5C744",
                padding: "10px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#F5C744";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#FFF9E6";
                e.target.style.color = "#F5C744";
              }}
            >
              Limpiar filtros
            </button>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "20px"
          }}>
            {/* Buscar */}
            <div>
              <label style={{ 
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2D3E2B",
                marginBottom: "8px"
              }}>
                Buscar en logs
              </label>
              <input
                type="text"
                placeholder="Buscar por acción o usuario..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #ECF2E3",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2D3E2B",
                  fontWeight: "500",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
              />
            </div>

            {/* Tipo */}
            <div>
              <label style={{ 
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2D3E2B",
                marginBottom: "8px"
              }}>
                Tipo de evento
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #ECF2E3",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2D3E2B",
                  fontWeight: "500",
                  outline: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
              >
                <option value="all">Todos</option>
                <option value="info">Información</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
                <option value="success">Éxito</option>
              </select>
            </div>
          </div>

          {/* Contador */}
          <div style={{
            padding: "16px 20px",
            background: "#FAFCF8",
            borderRadius: "12px",
            border: "2px solid #ECF2E3",
            fontSize: "14px",
            color: "#6B7F69",
            fontWeight: "500"
          }}>
            Mostrando <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{filteredLogs.length}</strong> de <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{logs.length}</strong> registros
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            background: "#FFF0F2",
            border: "2px solid #DA3E52",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "start",
            gap: "16px"
          }}>
            <AlertCircle style={{ color: "#DA3E52", flexShrink: 0, marginTop: "2px" }} size={24} />
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: "18px",
                fontWeight: "700",
                color: "#DA3E52",
                margin: "0 0 8px 0"
              }}>
                Error al cargar logs
              </h3>
              <p style={{ 
                fontSize: "14px",
                color: "#DA3E52",
                margin: 0
              }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredLogs.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "80px 20px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
              <p style={{ 
                color: "#2D3E2B", 
                fontSize: "18px",
                fontWeight: "600",
                margin: 0
              }}>
                No hay registros disponibles
              </p>
              <p style={{ 
                color: "#9AAA98", 
                fontSize: "15px",
                marginTop: "8px"
              }}>
                {filter || filterType !== "all" 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Los logs aparecerán aquí cuando se generen eventos"}
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const typeColors = getLogTypeColor(log.tipo);
              return (
                <div
                  key={log.id || index}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 2px 12px rgba(90, 143, 72, 0.08)",
                    border: "2px solid #F0F4ED",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.15)";
                    e.currentTarget.style.borderColor = "#5A8F48";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(90, 143, 72, 0.08)";
                    e.currentTarget.style.borderColor = "#F0F4ED";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "start", gap: "16px", flexWrap: "wrap" }}>
                    
                    {/* Badge de tipo */}
                    {log.tipo && (
                      <div style={{
                        background: typeColors.bg,
                        color: typeColors.color,
                        border: `2px solid ${typeColors.border}`,
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        flexShrink: 0
                      }}>
                        {log.tipo}
                      </div>
                    )}

                    {/* Contenido */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <p style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                        margin: "0 0 12px 0",
                        lineHeight: "1.5"
                      }}>
                        {log.accion}
                      </p>
                      
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "16px",
                        fontSize: "14px",
                        color: "#6B7F69",
                        flexWrap: "wrap"
                      }}>
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <User style={{ width: "16px", height: "16px", color: "#9AAA98" }} />
                          <strong>{log.usuario || 'Sistema'}</strong>
                        </span>
                        
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <Clock style={{ width: "16px", height: "16px", color: "#9AAA98" }} />
                          {formatDate(log.fecha)}
                        </span>
                        
                        {log.ip && (
                          <span style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <Activity style={{ width: "16px", height: "16px", color: "#9AAA98" }} />
                            {log.ip}
                          </span>
                        )}
                      </div>
                      
                      {log.detalles && (
                        <p style={{ 
                          fontSize: "13px",
                          color: "#9AAA98",
                          margin: "12px 0 0 0",
                          fontStyle: "italic",
                          lineHeight: "1.5"
                        }}>
                          {log.detalles}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}