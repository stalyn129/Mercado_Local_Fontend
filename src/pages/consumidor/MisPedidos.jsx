import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

// Helper para formatear dinero
const money = (value) =>
  value !== null && value !== undefined
    ? value.toFixed(2)
    : "0.00";

// Helper para nombres amigables
const generarNombreAmigable = (id) => {
  const idCorto = id?.toString();
  return idCorto ? `Compra #${idCorto.slice(-6)}` : "Compra múltiple";
};

// Helper para estados en español
const getEstadoLabel = (estado) => {
  const estados = {
    PENDIENTE: "⏳ Pendiente de pago",
    PROCESANDO: "📦 Procesando pedido",
    PENDIENTE_VERIFICACION: "🔍 Verificando pago",
    COMPLETADO: "✅ Completado",
    COMPLETADA: "✅ Completada",
    CANCELADO: "❌ Cancelado",
    CANCELADA: "❌ Cancelada"
  };
  return estados[estado] || estado;
};

// Helper para obtener color del estado
const getEstadoColor = (estado) => {
  const colores = {
    PENDIENTE: "#F59E0B",
    PROCESANDO: "#3B82F6",
    PENDIENTE_VERIFICACION: "#8B5CF6",
    COMPLETADO: "#10B981",
    COMPLETADA: "#10B981",
    CANCELADO: "#EF4444",
    CANCELADA: "#EF4444"
  };
  return colores[estado] || "#64748b";
};

// Helper para obtener emoji del estado
const getEstadoEmoji = (estado) => {
  const emojis = {
    PENDIENTE: "⏳",
    PROCESANDO: "📦",
    PENDIENTE_VERIFICACION: "🔍",
    COMPLETADO: "✅",
    COMPLETADA: "✅",
    CANCELADO: "❌",
    CANCELADA: "❌"
  };
  return emojis[estado] || "📋";
};

// Helper para formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  
  const date = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  
  if (date.toDateString() === hoy.toDateString()) {
    return `Hoy a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  if (date.toDateString() === ayer.toDateString()) {
    return `Ayer a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  const diffDias = Math.floor((hoy - date) / (1000 * 60 * 60 * 24));
  if (diffDias < 7) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dias[date.getDay()]} a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  const opciones = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('es-ES', opciones);
};

// Helper para ordenar por fecha
const ordenarPorFecha = (array, fechaKey = 'fechaCompra') => {
  return [...array].sort((a, b) => {
    const fechaA = new Date(a[fechaKey] || 0);
    const fechaB = new Date(b[fechaKey] || 0);
    return fechaB - fechaA;
  });
};

export default function MisPedidosUnificados({ modo: modoProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const modo = modoProp || location.state?.modo || "lista";

  // Todas las compras (solo unificadas)
  const [comprasUnificadas, setComprasUnificadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos", "pendiente", "procesando", "pendiente_verificacion", "completada", "cancelada"

  // Animación de círculos
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
      
      for (let i = 0; i < 8; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 3 + 1 + "px",
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

  // Función para obtener compras unificadas del backend
  const obtenerComprasUnificadas = async () => {
    const token = localStorage.getItem("authToken");

    try {
      console.log("🔄 Obteniendo compras unificadas del backend...");
      
      // 1. Primero intentar obtener compras unificadas directamente
      const response = await fetch(`${API_URL}/pedidos/compras-unificadas`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let compras = [];
      
      if (response.ok) {
        const data = await response.json();
        compras = Array.isArray(data) ? data : [];
        console.log("✅ Compras unificadas obtenidas del endpoint específico:", compras.length);
      } else {
        console.log("⚠️ No se pudo obtener compras unificadas específicas, intentando con el endpoint general...");
        
        // 2. Si no funciona, usar el endpoint general
        const responseGeneral = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!responseGeneral.ok) {
          const txt = await responseGeneral.text();
          throw new Error(`HTTP ${responseGeneral.status}: ${txt}`);
        }

        const dataGeneral = await responseGeneral.json();
        
        // Extraer compras unificadas si existen en la respuesta
        if (dataGeneral.comprasUnificadas && Array.isArray(dataGeneral.comprasUnificadas)) {
          compras = dataGeneral.comprasUnificadas;
          console.log("✅ Compras unificadas obtenidas del endpoint general:", compras.length);
        } else {
          console.log("ℹ️ No se encontraron compras unificadas en la respuesta del backend");
          compras = [];
        }
      }

      // 3. Procesar las compras obtenidas
      const comprasProcesadas = compras.map(compra => {
        // Asegurarse de que la compra tenga todos los campos necesarios
        const pedidos = compra.pedidos || [];
        const totalGeneral = compra.totalGeneral || pedidos.reduce((sum, p) => sum + (p.total || p.montoTotal || 0), 0);
        const fechaCompra = compra.fechaCompra || (pedidos[0]?.fechaPedido || pedidos[0]?.fechaCreacion);
        const estadoCompra = compra.estadoCompra || "PROCESANDO";
        
        // Calcular cantidad de vendedores únicos
        const vendedoresUnicos = new Set();
        pedidos.forEach(p => {
          const idVendedor = p.vendedor?.idVendedor || p.idVendedor;
          if (idVendedor) vendedoresUnicos.add(idVendedor);
        });
        
        return {
          idCompraUnificada: compra.idCompraUnificada || compra.id,
          pedidos: pedidos,
          totalGeneral,
          fechaCompra,
          metodoPago: compra.metodoPago || 'PENDIENTE',
          estadoCompra,
          cantidadPedidos: pedidos.length,
          cantidadVendedores: vendedoresUnicos.size,
          idMostrar: compra.idCompraUnificada || compra.id,
          fechaMostrar: fechaCompra,
          totalMostrar: totalGeneral,
          esIndividual: pedidos.length === 1 // Si solo tiene un pedido, es individual
        };
      });
      
      // 4. Ordenar por fecha (más reciente primero)
      const comprasOrdenadas = ordenarPorFecha(comprasProcesadas);
      
      console.log("🛍️ Compras unificadas finales procesadas:", comprasOrdenadas.length);
      console.log("📋 Detalle de compras:", comprasOrdenadas.map(c => ({
        id: c.idCompraUnificada,
        pedidos: c.cantidadPedidos,
        estado: c.estadoCompra,
        total: c.totalMostrar,
        esIndividual: c.esIndividual
      })));
      
      setComprasUnificadas(comprasOrdenadas);
      setLoading(false);
      
    } catch (err) {
      console.error("Error cargando compras unificadas:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/loginmodal");
      return;
    }

    obtenerComprasUnificadas();
  }, []);

  // Estadísticas para los filtros
  const estadisticas = {
    total: comprasUnificadas.length,
    pendiente: comprasUnificadas.filter(c => c.estadoCompra === "PENDIENTE").length,
    procesando: comprasUnificadas.filter(c => c.estadoCompra === "PROCESANDO").length,
    pendiente_verificacion: comprasUnificadas.filter(c => c.estadoCompra === "PENDIENTE_VERIFICACION").length,
    completada: comprasUnificadas.filter(c => c.estadoCompra === "COMPLETADA").length,
    cancelada: comprasUnificadas.filter(c => c.estadoCompra === "CANCELADA").length
  };

  // Aplicar filtro de estado
  const comprasFiltradas = comprasUnificadas.filter(compra => {
    if (filtroEstado === "todos") return true;
    if (filtroEstado === "pendiente") return compra.estadoCompra === "PENDIENTE";
    if (filtroEstado === "procesando") return compra.estadoCompra === "PROCESANDO";
    if (filtroEstado === "pendiente_verificacion") return compra.estadoCompra === "PENDIENTE_VERIFICACION";
    if (filtroEstado === "completada") return compra.estadoCompra === "COMPLETADA";
    if (filtroEstado === "cancelada") return compra.estadoCompra === "CANCELADA";
    return true;
  });

  // Calcular total filtrado
  const totalFiltrado = comprasFiltradas.reduce((sum, c) => sum + (c.totalMostrar || 0), 0);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* HEADER */}
      {modo === "lista" && (
        <div style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
          padding: "100px 20px 60px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          marginBottom: "40px",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
        }}>
          
          {circlePositions.map(circle => (
            <div 
              key={circle.id}
              style={{
                position: "absolute",
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
                zIndex: circle.zIndex
              }}
            />
          ))}

          <div style={{ 
            position: "relative", 
            zIndex: "10",
            padding: "0 15px"
          }}>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "13px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#FF6B35",
              marginBottom: "16px",
              fontWeight: "600",
              background: "rgba(255, 107, 53, 0.08)",
              padding: "8px 20px",
              borderRadius: "20px",
              display: "inline-block",
              backdropFilter: "blur(10px)"
            }}>
              📋 Todas mis compras
            </div>
            
            <h1 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "3.5rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "20px 0",
              lineHeight: "1.1",
              maxWidth: "800px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              Historial de Compras
            </h1>
            
            <p style={{
              color: "#64748b",
              fontSize: "18px",
              margin: "0 auto",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontWeight: "400",
              fontFamily: "'Inter', sans-serif",
              opacity: 0.9,
              background: "rgba(255, 255, 255, 0.7)",
              padding: "16px 24px",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)"
            }}>
              {estadisticas.total > 0 
                ? `Tienes ${estadisticas.total} compra${estadisticas.total > 1 ? 's' : ''} en tu historial`
                : "Aquí verás todas tus compras realizadas"
              }
            </p>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: modo === "lista" ? "1400px" : "100%",
        margin: modo === "lista" ? "0 auto 60px" : "0",
        padding: modo === "lista" ? "0 24px" : "0",
      }}>
        
        {/* PANEL DE FILTROS */}
        {!loading && estadisticas.total > 0 && modo === "lista" && (
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            marginBottom: "40px",
            border: "1px solid #f1f5f9",
            position: "relative",
            overflow: "hidden"
          }}>
            
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "200px",
              height: "200px",
              background: "linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
              borderRadius: "0 24px 0 100%",
              zIndex: 0
            }} />
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px"
              }}>
                <div>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#1e293b",
                    margin: "0 0 8px 0",
                    fontFamily: "'Montserrat', sans-serif"
                  }}>
                    Filtra tus compras
                  </h2>
                  <p style={{
                    fontSize: "15px",
                    color: "#64748b",
                    margin: "0",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Todas tus compras unificadas en un solo lugar
                  </p>
                </div>
                
                <div style={{
                  fontSize: "15px",
                  color: "#94a3b8",
                  fontWeight: "600",
                  background: "#f8fafc",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span>📊</span>
                  {comprasFiltradas.length} de {estadisticas.total} compras
                </div>
              </div>
              
              {/* FILTROS POR ESTADO */}
              <div>
                <div style={{
                  fontSize: "16px",
                  color: "#475569",
                  fontWeight: "700",
                  marginBottom: "16px",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Estado de la compra:
                </div>
                
                <div style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <button
                    onClick={() => setFiltroEstado("todos")}
                    style={{
                      padding: "12px 24px",
                      background: filtroEstado === "todos" 
                        ? "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)" 
                        : "white",
                      color: filtroEstado === "todos" ? "white" : "#475569",
                      border: filtroEstado === "todos" ? "none" : "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "'Inter', sans-serif",
                      boxShadow: filtroEstado === "todos" 
                        ? "0 6px 20px rgba(255, 107, 53, 0.25)" 
                        : "0 2px 8px rgba(0, 0, 0, 0.04)"
                    }}
                  >
                    Todas las compras ({estadisticas.total})
                  </button>
                  
                  {estadisticas.pendiente > 0 && (
                    <button
                      onClick={() => setFiltroEstado("pendiente")}
                      style={{
                        padding: "12px 24px",
                        background: filtroEstado === "pendiente" 
                          ? "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)" 
                          : "#fef3c7",
                        color: filtroEstado === "pendiente" ? "white" : "#92400E",
                        border: filtroEstado === "pendiente" ? "none" : "1px solid #fde68a",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: filtroEstado === "pendiente" 
                          ? "0 6px 20px rgba(245, 158, 11, 0.25)" 
                          : "0 2px 8px rgba(245, 158, 11, 0.1)"
                      }}
                    >
                      ⏳ Pendientes ({estadisticas.pendiente})
                    </button>
                  )}
                  
                  {estadisticas.procesando > 0 && (
                    <button
                      onClick={() => setFiltroEstado("procesando")}
                      style={{
                        padding: "12px 24px",
                        background: filtroEstado === "procesando" 
                          ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" 
                          : "#dbeafe",
                        color: filtroEstado === "procesando" ? "white" : "#1E40AF",
                        border: filtroEstado === "procesando" ? "none" : "1px solid #bfdbfe",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: filtroEstado === "procesando" 
                          ? "0 6px 20px rgba(59, 130, 246, 0.25)" 
                          : "0 2px 8px rgba(59, 130, 246, 0.1)"
                      }}
                    >
                      📦 En proceso ({estadisticas.procesando})
                    </button>
                  )}
                  
                  {estadisticas.pendiente_verificacion > 0 && (
                    <button
                      onClick={() => setFiltroEstado("pendiente_verificacion")}
                      style={{
                        padding: "12px 24px",
                        background: filtroEstado === "pendiente_verificacion" 
                          ? "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)" 
                          : "#f3e8ff",
                        color: filtroEstado === "pendiente_verificacion" ? "white" : "#6D28D9",
                        border: filtroEstado === "pendiente_verificacion" ? "none" : "1px solid #e9d5ff",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: filtroEstado === "pendiente_verificacion" 
                          ? "0 6px 20px rgba(139, 92, 246, 0.25)" 
                          : "0 2px 8px rgba(139, 92, 246, 0.1)"
                      }}
                    >
                      🔍 Verificando pago ({estadisticas.pendiente_verificacion})
                    </button>
                  )}
                  
                  {estadisticas.completada > 0 && (
                    <button
                      onClick={() => setFiltroEstado("completada")}
                      style={{
                        padding: "12px 24px",
                        background: filtroEstado === "completada" 
                          ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)" 
                          : "#d1fae5",
                        color: filtroEstado === "completada" ? "white" : "#065F46",
                        border: filtroEstado === "completada" ? "none" : "1px solid #a7f3d0",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: filtroEstado === "completada" 
                          ? "0 6px 20px rgba(16, 185, 129, 0.25)" 
                          : "0 2px 8px rgba(16, 185, 129, 0.1)"
                      }}
                    >
                      ✅ Completadas ({estadisticas.completada})
                    </button>
                  )}
                  
                  {estadisticas.cancelada > 0 && (
                    <button
                      onClick={() => setFiltroEstado("cancelada")}
                      style={{
                        padding: "12px 24px",
                        background: filtroEstado === "cancelada" 
                          ? "linear-gradient(135deg, #EF4444 0%, #F87171 100%)" 
                          : "#fee2e2",
                        color: filtroEstado === "cancelada" ? "white" : "#991B1B",
                        border: filtroEstado === "cancelada" ? "none" : "1px solid #fecaca",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: filtroEstado === "cancelada" 
                          ? "0 6px 20px rgba(239, 68, 68, 0.25)" 
                          : "0 2px 8px rgba(239, 68, 68, 0.1)"
                      }}
                    >
                      ❌ Canceladas ({estadisticas.cancelada})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "100px 20px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{
              display: "inline-block",
              width: "70px",
              height: "70px",
              border: "6px solid #f1f5f9",
              borderTop: "6px solid #FF6B35",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "32px"
            }}></div>
            <p style={{
              marginTop: "25px",
              fontSize: "20px",
              color: "#1e293b",
              fontWeight: "700",
              fontFamily: "'Montserrat', sans-serif",
              marginBottom: "12px"
            }}>
              Cargando tu historial de compras...
            </p>
            <p style={{
              fontSize: "15px",
              color: "#64748b",
              maxWidth: "400px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Estamos organizando todas tus compras para mostrarte una vista clara y ordenada.
            </p>
          </div>
        ) : estadisticas.total === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{ 
              fontSize: "80px", 
              marginBottom: "25px", 
              opacity: 0.7,
              background: "linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block"
            }}>🛒</div>
            <p style={{
              color: "#1e293b",
              fontSize: "28px",
              fontWeight: "800",
              margin: "0 0 16px 0",
              fontFamily: "'Montserrat', sans-serif"
            }}>
              ¡Aún no tienes compras!
            </p>
            <p style={{
              color: "#64748b",
              fontSize: "16px",
              margin: "0 0 40px 0",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6",
              fontFamily: "'Inter', sans-serif"
            }}>
              Cuando realices compras unificadas, aparecerán aquí organizadas por fecha.
            </p>
            {modo === "lista" && (
              <button
                onClick={() => navigate("/explorar")}
                style={{
                  padding: "18px 40px",
                  background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: "0 10px 25px rgba(255, 107, 53, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(255, 107, 53, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 107, 53, 0.3)";
                }}
              >
                Explorar productos
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* RESUMEN DE FILTROS APLICADOS */}
            {filtroEstado !== "todos" && (
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "20px 28px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                marginBottom: "32px",
                border: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px"
              }}>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#1e293b",
                    margin: "0 0 8px 0",
                    fontFamily: "'Montserrat', sans-serif"
                  }}>
                    Resultados del filtro
                  </h3>
                  <p style={{
                    fontSize: "15px",
                    color: "#64748b",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Mostrando {comprasFiltradas.length} compras {
                      filtroEstado === "pendiente" ? "pendientes de pago" :
                      filtroEstado === "procesando" ? "en proceso" :
                      filtroEstado === "pendiente_verificacion" ? "verificando pago" :
                      filtroEstado === "completada" ? "completadas" : "canceladas"
                    }
                  </p>
                </div>
                
                <div style={{
                  fontSize: "15px",
                  color: "#FF6B35",
                  fontWeight: "800",
                  fontFamily: "'Inter', sans-serif",
                  background: "#FFF5F0",
                  padding: "10px 20px",
                  borderRadius: "14px",
                  border: "2px solid #FF6B35"
                }}>
                  Total filtrado: ${money(totalFiltrado)}
                </div>
                
                <button
                  onClick={() => setFiltroEstado("todos")}
                  style={{
                    padding: "12px 24px",
                    background: "#f8fafc",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>🔄</span>
                  Ver todas las compras
                </button>
              </div>
            )}
            
            {/* LISTA DE COMPRAS UNIFICADAS */}
            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
              gap: "28px"
            }}>
              {comprasFiltradas.map((compra, index) => (
                <div
                  key={compra.idCompraUnificada}
                  style={{
                    background: "white",
                    borderRadius: "24px",
                    padding: "28px",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #f1f5f9",
                    transition: "all 0.4s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onClick={() => {
                    navigate(`/mi-compra-unificada/${compra.idCompraUnificada}`, {
                      state: {
                        compraData: compra,
                        pedidos: compra.pedidos || [],
                        totalCompra: compra.totalMostrar || 0,
                        metodoPago: compra.metodoPago || 'PENDIENTE'
                      }
                    });
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 20px 50px rgba(0, 0, 0, 0.15)";
                    e.currentTarget.style.borderColor = "#8B5CF6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
                    e.currentTarget.style.borderColor = "#f1f5f9";
                  }}
                >
                  {/* Fondo de acento */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "120px",
                    height: "120px",
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(217, 70, 239, 0.08) 100%)",
                    borderRadius: "0 24px 0 100%",
                    zIndex: 0
                  }} />
                  
                  {/* Badge "MÁS RECIENTE" para el primero */}
                  {index === 0 && comprasFiltradas[0] === compra && (
                    <div style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                      color: "white",
                      padding: "8px 20px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "800",
                      boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                      zIndex: "2",
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "0.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>🆕</span> MÁS RECIENTE
                    </div>
                  )}
                  
                  {/* Badge "COMPRA ÚNICA" si es individual */}
                  {compra.esIndividual && (
                    <div style={{
                      position: "absolute",
                      top: comprasFiltradas[0] === compra ? "60px" : "20px",
                      right: "20px",
                      background: "linear-gradient(135deg, #FF6B35 0%, #FF9E6D 100%)",
                      color: "white",
                      padding: "6px 16px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "800",
                      boxShadow: "0 4px 15px rgba(255, 107, 53, 0.4)",
                      zIndex: "2",
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "0.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <span>📦</span> COMPRA ÚNICA
                    </div>
                  )}
                  
                  <div style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 28,
                    flexWrap: "wrap",
                    marginBottom: "20px"
                  }}>
                    {/* Sección izquierda - Info de la compra */}
                    <div style={{ flex: 1, minWidth: "280px" }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 16, 
                        marginBottom: 16 
                      }}>
                        <span style={{ 
                          fontSize: "36px",
                          background: getEstadoColor(compra.estadoCompra),
                          color: "white",
                          width: "56px",
                          height: "56px",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 8px 20px ${getEstadoColor(compra.estadoCompra)}40`
                        }}>
                          {getEstadoEmoji(compra.estadoCompra)}
                        </span>
                        <div>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: "22px", 
                            color: "#1e293b",
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: "800",
                            marginBottom: "6px"
                          }}>
                            {generarNombreAmigable(compra.idCompraUnificada)}
                          </h3>
                          <p style={{ 
                            margin: "0", 
                            fontSize: "14px", 
                            color: "#64748b",
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            {formatearFecha(compra.fechaMostrar)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Info de la compra */}
                      <div style={{ 
                        display: "flex",
                        gap: "12px",
                        marginTop: "16px",
                        flexWrap: "wrap"
                      }}>
                        <span style={{ 
                          background: "#F5F3FF", 
                          padding: "6px 12px", 
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: "800",
                          color: "#8B5CF6",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          border: "1px solid #DDD6FE"
                        }}>
                          <span>📦</span>
                          {compra.cantidadPedidos || 0} pedido(s)
                        </span>
                        
                        {compra.cantidadVendedores > 1 && (
                          <span style={{ 
                            background: "#F5F3FF", 
                            padding: "6px 12px", 
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#8B5CF6",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            border: "1px solid #DDD6FE"
                          }}>
                            <span>👤</span>
                            {compra.cantidadVendedores || 0} vendedor(es)
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
                        {/* Método de pago */}
                        {compra.metodoPago && compra.metodoPago !== 'PENDIENTE' && (
                          <div style={{ 
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#475569",
                            fontFamily: "'Inter', sans-serif",
                            border: "1px solid #e2e8f0"
                          }}>
                            {compra.metodoPago === 'EFECTIVO' ? '💵 Efectivo' : 
                             compra.metodoPago === 'TRANSFERENCIA' ? '🏦 Transferencia' : 
                             compra.metodoPago === 'TARJETA' ? '💳 Tarjeta' : compra.metodoPago}
                          </div>
                        )}
                        
                        {/* Badge de estado */}
                        <div style={{
                          display: "inline-block",
                          padding: "8px 20px",
                          borderRadius: "18px",
                          background: `${getEstadoColor(compra.estadoCompra)}15`,
                          fontSize: "14px",
                          fontWeight: "800",
                          color: getEstadoColor(compra.estadoCompra),
                          fontFamily: "'Inter', sans-serif",
                          border: `2px solid ${getEstadoColor(compra.estadoCompra)}30`,
                          backdropFilter: "blur(10px)"
                        }}>
                          {getEstadoLabel(compra.estadoCompra)}
                        </div>
                      </div>
                    </div>

                    {/* Sección derecha - Precio y acciones */}
                    <div style={{ 
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 20,
                      minWidth: "160px",
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0"
                    }}>
                      {/* Precio destacado */}
                      <div>
                        <div style={{ 
                          fontSize: "14px", 
                          color: "#64748b", 
                          marginBottom: "6px",
                          fontWeight: "600",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Total
                        </div>
                        <div style={{ 
                          fontWeight: "900", 
                          fontSize: "36px", 
                          color: "#8B5CF6",
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1
                        }}>
                          ${money(compra.totalMostrar || 0)}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div style={{ display: "flex", gap: 10, flexDirection: "column", width: "100%" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/mi-compra-unificada/${compra.idCompraUnificada}`, {
                              state: {
                                compraData: compra,
                                pedidos: compra.pedidos || [],
                                totalCompra: compra.totalMostrar || 0,
                                metodoPago: compra.metodoPago || 'PENDIENTE'
                              }
                            });
                          }}
                          style={{
                            padding: "12px 20px",
                            borderRadius: "12px",
                            border: "2px solid #8B5CF6",
                            cursor: "pointer",
                            background: "white",
                            color: "#8B5CF6",
                            fontSize: "14px",
                            fontWeight: "700",
                            transition: "all 0.3s ease",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            fontFamily: "'Inter', sans-serif"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#F5F3FF";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          <span>🔍</span>
                          Ver detalles
                        </button>

                        {(compra.estadoCompra === "COMPLETADA" || compra.estadoCompra === "PENDIENTE_VERIFICACION") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/factura-consolidada/${compra.idCompraUnificada}`, {
                                state: {
                                  compraData: compra
                                }
                              });
                            }}
                            style={{
                              padding: "12px 20px",
                              borderRadius: "12px",
                              border: "none",
                              cursor: "pointer",
                              background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                              color: "white",
                              fontSize: "14px",
                              fontWeight: "700",
                              transition: "all 0.3s ease",
                              boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
                              whiteSpace: "nowrap",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 10px 25px rgba(16, 185, 129, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.3)";
                            }}
                          >
                            <span>📄</span>
                            Ver factura
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* RESUMEN FINAL */}
            {modo === "lista" && estadisticas.total > 0 && (
              <div style={{
                textAlign: "center",
                padding: "32px",
                background: "white",
                borderRadius: "24px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                marginTop: "48px",
                border: "1px solid #f1f5f9"
              }}>
                <p style={{
                  color: "#475569",
                  fontSize: "18px",
                  fontWeight: "700",
                  margin: "0 0 12px 0",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  {comprasFiltradas.length === estadisticas.total 
                    ? `✅ Historial completo - ${estadisticas.total} compras en total`
                    : `🔍 ${comprasFiltradas.length} compras encontradas`
                  }
                </p>
                <p style={{
                  color: "#94a3b8",
                  fontSize: "16px",
                  margin: "0",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  flexWrap: "wrap"
                }}>
                  {estadisticas.pendiente > 0 && (
                    <>
                      <span style={{ 
                        color: "#F59E0B", 
                        fontWeight: "800", 
                        background: "#FEF3C7", 
                        padding: "6px 16px", 
                        borderRadius: "10px",
                        border: "2px solid #F59E0B"
                      }}>
                        {estadisticas.pendiente} pendientes
                      </span>
                      <span style={{ color: "#94a3b8" }}>•</span>
                    </>
                  )}
                  <span style={{ 
                    color: "#3B82F6", 
                    fontWeight: "800", 
                    background: "#DBEAFE", 
                    padding: "6px 16px", 
                    borderRadius: "10px",
                    border: "2px solid #3B82F6"
                  }}>
                    {estadisticas.procesando} en proceso
                  </span>
                  <span style={{ color: "#94a3b8" }}>•</span>
                  {estadisticas.pendiente_verificacion > 0 && (
                    <>
                      <span style={{ 
                        color: "#8B5CF6", 
                        fontWeight: "800", 
                        background: "#F5F3FF", 
                        padding: "6px 16px", 
                        borderRadius: "10px",
                        border: "2px solid #8B5CF6"
                      }}>
                        {estadisticas.pendiente_verificacion} verificando
                      </span>
                      <span style={{ color: "#94a3b8" }}>•</span>
                    </>
                  )}
                  <span style={{ 
                    color: "#10B981", 
                    fontWeight: "800", 
                    background: "#D1FAE5", 
                    padding: "6px 16px", 
                    borderRadius: "10px",
                    border: "2px solid #10B981"
                  }}>
                    {estadisticas.completada} completadas
                  </span>
                  {estadisticas.cancelada > 0 && (
                    <>
                      <span style={{ color: "#94a3b8" }}>•</span>
                      <span style={{ 
                        color: "#EF4444", 
                        fontWeight: "800", 
                        background: "#FEE2E2", 
                        padding: "6px 16px", 
                        borderRadius: "10px",
                        border: "2px solid #EF4444"
                      }}>
                        {estadisticas.cancelada} canceladas
                      </span>
                    </>
                  )}
                  <span style={{ color: "#94a3b8" }}>•</span>
                  <span style={{ 
                    color: "#FF6B35", 
                    fontWeight: "800", 
                    background: "#FFF5F0", 
                    padding: "6px 16px", 
                    borderRadius: "10px",
                    border: "2px solid #FF6B35"
                  }}>
                    Total: ${money(totalFiltrado)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {modo === "lista" && <Footer />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
        
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
        
        /* Responsive */
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(auto-fill, minmax(480px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 2.5rem !important;
          }
          
          /* Filtros responsive */
          div[style*="display: flex; gap: 10px;"] {
            flex-direction: column !important;
          }
          
          button[style*="padding: 12px 24px"] {
            width: 100% !important;
            justify-content: center !important;
          }
          
          /* Header responsive */
          div[style*="display: flex; justify-content: space-between;"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          
          div[style*="text-align: right"] {
            text-align: left !important;
            align-items: flex-start !important;
          }
          
          /* Card content responsive */
          div[style*="display: flex; justify-content: space-between; align-items: center;"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
        }
        
        @media (max-width: 480px) {
          div[style*="padding: 28px"] {
            padding: 20px !important;
          }
          
          h1 {
            font-size: 2rem !important;
          }
          
          h2 {
            font-size: 22px !important;
          }
          
          h3 {
            fontSize: 18px !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8fafc;
        }
        
        input:focus, select:focus, button:focus {
          outline: none;
        }
        
        button {
          cursor: pointer;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}