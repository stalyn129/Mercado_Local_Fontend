import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

// Helper para formatear dinero de forma segura
const money = (value) =>
  value !== null && value !== undefined
    ? value.toFixed(2)
    : "0.00";

// Helper para generar nombres amigables y consistentes
const generarNombreAmigable = (id, esUnificada = false) => {
  // Acortar ID para mostrar solo últimos 6 caracteres
  const idCorto = id?.toString()?.slice(-6) || id;
  
  if (esUnificada) {
    return `Compra múltiple #${idCorto}`;
  } else {
    return `Compra directa #${idCorto}`;
  }
};

// Helper para mostrar estados en español (más amigables)
const getEstadoLabel = (estado) => {
  const estados = {
    PENDIENTE: "⏳ Pendiente de pago",
    PROCESANDO: "📦 Procesando pedido",
    PENDIENTE_VERIFICACION: "🔍 Verificando pago",
    COMPLETADO: "✅ Completado",
    CANCELADO: "❌ Cancelado"
  };
  return estados[estado] || estado;
};

// Helper para compras unificadas - Estados más amigables
const getEstadoCompraLabel = (estado) => {
  const estados = {
    COMPLETADA: "✅ Completada - Todo entregado",
    PENDIENTE: "⏳ Pendiente de pago",
    PROCESANDO: "📦 Procesando - Enviando pedidos",
    CANCELADA: "❌ Cancelada"
  };
  return estados[estado] || estado;
};

// Helper para obtener el color del estado
const getEstadoColor = (estado) => {
  const colores = {
    // Estados compartidos
    PENDIENTE: "#F59E0B", // Amarillo/naranja
    PROCESANDO: "#3B82F6", // Azul
    PENDIENTE_VERIFICACION: "#8B5CF6", // Morado
    COMPLETADO: "#10B981", // Verde
    CANCELADO: "#EF4444", // Rojo
    
    // Estados específicos de compras unificadas
    COMPLETADA: "#10B981",
    CANCELADA: "#EF4444"
  };
  return colores[estado] || "#64748b";
};

// Helper para obtener el emoji del estado
const getEstadoEmoji = (estado) => {
  const emojis = {
    // Estados compartidos
    PENDIENTE: "⏳",
    PROCESANDO: "📦",
    PENDIENTE_VERIFICACION: "🔍",
    COMPLETADO: "✅",
    CANCELADO: "❌",
    
    // Estados específicos de compras unificadas
    COMPLETADA: "✅",
    CANCELADA: "❌"
  };
  return emojis[estado] || "📋";
};

// Helper para formatear la fecha de forma más amigable
const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  
  const date = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  
  // Si es hoy
  if (date.toDateString() === hoy.toDateString()) {
    return `Hoy a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Si es ayer
  if (date.toDateString() === ayer.toDateString()) {
    return `Ayer a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Si es esta semana
  const diffDias = Math.floor((hoy - date) / (1000 * 60 * 60 * 24));
  if (diffDias < 7) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dias[date.getDay()]} a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Más de una semana
  const opciones = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('es-ES', opciones);
};

// Helper para ordenar por fecha (más recientes primero)
const ordenarPorFecha = (array, fechaKey = 'fechaPedido') => {
  return [...array].sort((a, b) => {
    const fechaA = new Date(a[fechaKey] || a.fechaCreacion || 0);
    const fechaB = new Date(b[fechaKey] || b.fechaCreacion || 0);
    return fechaB - fechaA; // Más reciente primero
  });
};

export default function MisPedidos({ modo: modoProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // 🎯 MODO REAL - Prioridad: prop > state > default
  const modo = modoProp || location.state?.modo || "lista";

  const [pedidosIndividuales, setPedidosIndividuales] = useState([]);
  const [comprasUnificadas, setComprasUnificadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);
  
  // 🆕 Estados para tabs y filtros
  const [tabActiva, setTabActiva] = useState("todos"); // "todos", "unificadas", "individuales"
  
  // 🆕 Estados para filtros por estado
  const [filtroEstadoUnificadas, setFiltroEstadoUnificadas] = useState("todos"); // "todos", "pendiente", "procesando", "completada", "cancelada"
  const [filtroEstadoIndividuales, setFiltroEstadoIndividuales] = useState("todos"); // "todos", "pendiente", "procesando", "completado", "cancelado"

  // Estados que permiten ver factura
  const estadosConFactura = ["PENDIENTE_VERIFICACION", "COMPLETADO"];

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
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

  // 🆕 Función para cargar pedidos y compras unificadas
  const fetchDatos = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status}: ${txt}`);
      }

      const data = await response.json();
      
      if (data.pedidosIndividuales && data.comprasUnificadas) {
        // Ordenar por fecha (más recientes primero)
        const pedidosOrdenados = ordenarPorFecha(data.pedidosIndividuales || []);
        const comprasOrdenadas = ordenarPorFecha(data.comprasUnificadas || [], 'fechaCompra');
        
        setPedidosIndividuales(pedidosOrdenados);
        setComprasUnificadas(comprasOrdenadas);
      } else if (Array.isArray(data)) {
        const pedidosOrdenados = ordenarPorFecha(data || []);
        setPedidosIndividuales(pedidosOrdenados);
        setComprasUnificadas([]);
      } else {
        setPedidosIndividuales([]);
        setComprasUnificadas([]);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error("Error cargando datos:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/loginmodal");
      return;
    }

    fetchDatos();
  }, []);

  // 🔥 LÓGICA PARA DETECTAR COMPRAS UNIFICADAS
  const [comprasUnificadasReales, setComprasUnificadasReales] = useState([]);
  const [pedidosIndividualesReales, setPedidosIndividualesReales] = useState([]);
  const [totalCompras, setTotalCompras] = useState(0);

  useEffect(() => {
    if (loading) return;

    console.log("🔄 Procesando datos para detectar compras...");
    console.log("Compras unificadas del backend:", comprasUnificadas);
    console.log("Pedidos individuales del backend:", pedidosIndividuales.length);

    // 1. Si el backend ya devolvió compras unificadas, usarlas directamente
    if (comprasUnificadas.length > 0) {
      console.log("✅ Usando compras unificadas del backend:", comprasUnificadas.length);
      const comprasOrdenadas = ordenarPorFecha(comprasUnificadas, 'fechaCompra');
      const pedidosOrdenados = ordenarPorFecha(pedidosIndividuales);
      
      setComprasUnificadasReales(comprasOrdenadas);
      setPedidosIndividualesReales(pedidosOrdenados);
      setTotalCompras(comprasUnificadas.length + pedidosIndividuales.length);
      return;
    }
    
    // 2. Si no, procesar los pedidos individuales para detectar compras unificadas
    console.log("🔍 Analizando", pedidosIndividuales.length, "pedidos para detectar compras unificadas...");
    
    // Agrupar pedidos por idCompraUnificada
    const gruposPorCompra = {};
    
    pedidosIndividuales.forEach(pedido => {
      const idCompra = pedido.idCompraUnificada;
      
      if (idCompra && idCompra !== null && idCompra !== undefined && idCompra !== '') {
        if (!gruposPorCompra[idCompra]) {
          gruposPorCompra[idCompra] = [];
        }
        gruposPorCompra[idCompra].push(pedido);
      }
    });
    
    console.log("📊 Grupos detectados por idCompraUnificada:", Object.keys(gruposPorCompra).length);
    
    // Crear compras unificadas solo para grupos con más de 1 pedido
    const comprasUnificadasDetectadas = [];
    const pedidosIndividualesDetectados = [];
    
    Object.entries(gruposPorCompra).forEach(([idCompra, pedidosEnGrupo]) => {
      console.log(`  Grupo ${idCompra}: ${pedidosEnGrupo.length} pedidos`);
      
      if (pedidosEnGrupo.length > 1) {
        // Es una compra unificada
        const totalGeneral = pedidosEnGrupo.reduce((sum, p) => sum + (p.total || p.montoTotal || 0), 0);
        const primerPedido = pedidosEnGrupo[0];
        const pedidosOrdenados = [...pedidosEnGrupo].sort((a, b) => a.idPedido - b.idPedido);
        const estados = pedidosOrdenados.map(p => p.estadoPedido);
        
        // Determinar estado de la compra
        let estadoCompra = "PROCESANDO";
        if (estados.every(e => e === "COMPLETADO")) estadoCompra = "COMPLETADA";
        else if (estados.some(e => e === "PENDIENTE" || e === "PENDIENTE_VERIFICACION")) estadoCompra = "PENDIENTE";
        else if (estados.some(e => e === "CANCELADO")) estadoCompra = "CANCELADA";
        
        comprasUnificadasDetectadas.push({
          idCompraUnificada: idCompra,
          pedidos: pedidosOrdenados,
          totalGeneral,
          fechaCompra: primerPedido.fechaPedido || primerPedido.fechaCreacion,
          metodoPago: primerPedido.metodoPago || 'PENDIENTE',
          estadoCompra,
          cantidadPedidos: pedidosOrdenados.length,
          cantidadVendedores: new Set(pedidosOrdenados.map(p => p.vendedor?.idVendedor || p.idVendedor || 0)).size
        });
        
        console.log(`    -> Creando compra unificada: ${idCompra} con ${pedidosOrdenados.length} pedidos, estado: ${estadoCompra}`);
      } else {
        // Es un pedido individual (aunque tenga idCompraUnificada)
        pedidosIndividualesDetectados.push(...pedidosEnGrupo);
      }
    });
    
    const pedidosSinIdCompra = pedidosIndividuales.filter(p => 
      !p.idCompraUnificada || 
      p.idCompraUnificada === null || 
      p.idCompraUnificada === undefined || 
      p.idCompraUnificada === ''
    );
    
    pedidosIndividualesDetectados.push(...pedidosSinIdCompra);
    
    // Ordenar por fecha (más recientes primero)
    const comprasOrdenadas = comprasUnificadasDetectadas.sort((a, b) => 
      new Date(b.fechaCompra) - new Date(a.fechaCompra)
    );
    
    const pedidosOrdenados = pedidosIndividualesDetectados.sort((a, b) => 
      new Date(b.fechaPedido || b.fechaCreacion) - new Date(a.fechaPedido || a.fechaCreacion)
    );
    
    console.log("✅ Resultados del procesamiento:");
    console.log(`   Compras unificadas: ${comprasOrdenadas.length}`);
    console.log(`   Pedidos individuales: ${pedidosOrdenados.length}`);
    
    // DEBUG: Mostrar detalles de las compras unificadas detectadas
    if (comprasOrdenadas.length > 0) {
      console.log("📋 Detalles de compras unificadas detectadas:");
      comprasOrdenadas.forEach((compra, idx) => {
        console.log(`   ${idx + 1}. ID: ${compra.idCompraUnificada}, Estado: ${compra.estadoCompra}, Pedidos: ${compra.pedidos?.length}, Total: $${compra.totalGeneral}`);
      });
    }
    
    setComprasUnificadasReales(comprasOrdenadas);
    setPedidosIndividualesReales(pedidosOrdenados);
    setTotalCompras(comprasOrdenadas.length + pedidosOrdenados.length);
    
  }, [loading, pedidosIndividuales, comprasUnificadas]);

  // 🆕 Filtrar compras unificadas por estado
  const comprasUnificadasFiltradas = comprasUnificadasReales.filter(compra => {
    if (filtroEstadoUnificadas === "todos") return true;
    if (filtroEstadoUnificadas === "pendiente") return compra.estadoCompra === "PENDIENTE";
    if (filtroEstadoUnificadas === "procesando") return compra.estadoCompra === "PROCESANDO";
    if (filtroEstadoUnificadas === "completada") return compra.estadoCompra === "COMPLETADA";
    if (filtroEstadoUnificadas === "cancelada") return compra.estadoCompra === "CANCELADA";
    return true;
  });

  // 🆕 Filtrar pedidos individuales por estado
  const pedidosIndividualesFiltrados = pedidosIndividualesReales.filter(pedido => {
    if (filtroEstadoIndividuales === "todos") return true;
    if (filtroEstadoIndividuales === "pendiente") return pedido.estadoPedido === "PENDIENTE" || pedido.estadoPedido === "PENDIENTE_VERIFICACION";
    if (filtroEstadoIndividuales === "procesando") return pedido.estadoPedido === "PROCESANDO";
    if (filtroEstadoIndividuales === "completado") return pedido.estadoPedido === "COMPLETADO";
    if (filtroEstadoIndividuales === "cancelado") return pedido.estadoPedido === "CANCELADO";
    return true;
  });

  // 🆕 Determinar qué mostrar según la pestaña activa
  const mostrarTodos = tabActiva === "todos";
  const mostrarUnificadas = tabActiva === "unificadas";
  const mostrarIndividuales = tabActiva === "individuales";

  // 🆕 Contadores por estado para estadísticas
  const contarPorEstado = (array, estadoKey) => {
    const counts = {
      pendiente: 0,
      procesando: 0,
      completado: 0,
      cancelado: 0,
      total: array.length
    };
    
    array.forEach(item => {
      const estado = item[estadoKey];
      if (estado === "PENDIENTE" || estado === "PENDIENTE_VERIFICACION") counts.pendiente++;
      else if (estado === "PROCESANDO") counts.procesando++;
      else if (estado === "COMPLETADO" || estado === "COMPLETADA") counts.completado++;
      else if (estado === "CANCELADO" || estado === "CANCELADA") counts.cancelado++;
    });
    
    return counts;
  };

  const estadisticasUnificadas = contarPorEstado(comprasUnificadasReales, 'estadoCompra');
  const estadisticasIndividuales = contarPorEstado(pedidosIndividualesReales, 'estadoPedido');

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* HEADER CON GRADIENTE Y CÍRCULOS DE COLORES */}
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
              📋 Tu Historial de Compras
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
              Mis Pedidos y Compras
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
              {totalCompras > 0 
                ? `Tienes ${totalCompras} compra${totalCompras > 1 ? 's' : ''} en tu historial`
                : "Aquí verás todos tus pedidos realizados"
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
        
        {/* 🆕 TABS DE FILTRADO - SOLO SI HAY COMPRAS */}
        {!loading && totalCompras > 0 && modo === "lista" && (
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
            {/* Fondo decorativo */}
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
                    Organiza tus compras
                  </h2>
                  <p style={{
                    fontSize: "15px",
                    color: "#64748b",
                    margin: "0",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Filtra y busca tus pedidos por tipo y estado
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
                  {(() => {
                    if (mostrarTodos) return `${totalCompras} compras totales`;
                    if (mostrarUnificadas) return `${comprasUnificadasReales.length} compras múltiples`;
                    if (mostrarIndividuales) return `${pedidosIndividualesReales.length} compras directas`;
                    return "";
                  })()}
                </div>
              </div>
              
              {/* TABS PRINCIPALES */}
              <div style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                paddingBottom: "8px",
                marginBottom: "28px"
              }}>
                {/* TAB TODOS */}
                <button
                  onClick={() => {
                    setTabActiva("todos");
                    setFiltroEstadoUnificadas("todos");
                    setFiltroEstadoIndividuales("todos");
                  }}
                  style={{
                    padding: "18px 32px",
                    background: tabActiva === "todos" 
                      ? "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)" 
                      : "white",
                    color: tabActiva === "todos" ? "white" : "#475569",
                    border: tabActiva === "todos" ? "none" : "1px solid #e2e8f0",
                    borderRadius: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: tabActiva === "todos" 
                      ? "0 10px 25px rgba(255, 107, 53, 0.3)" 
                      : "0 4px 12px rgba(0, 0, 0, 0.05)"
                  }}
                  onMouseEnter={(e) => {
                    if (tabActiva !== "todos") {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.background = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tabActiva !== "todos") {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.background = "white";
                    }
                  }}
                >
                  <span style={{ fontSize: "20px", filter: tabActiva === "todos" ? "brightness(0) invert(1)" : "none" }}>📋</span>
                  Todas las compras
                  <span style={{
                    fontSize: "14px",
                    background: tabActiva === "todos" ? "rgba(255, 255, 255, 0.25)" : "rgba(100, 116, 139, 0.08)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "700",
                    minWidth: "40px",
                    textAlign: "center"
                  }}>
                    {totalCompras}
                  </span>
                </button>
                
                {/* TAB UNIFICADAS */}
                {comprasUnificadasReales.length > 0 && (
                  <button
                    onClick={() => {
                      setTabActiva("unificadas");
                      setFiltroEstadoUnificadas("todos");
                    }}
                    style={{
                      padding: "18px 32px",
                      background: tabActiva === "unificadas" 
                        ? "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)"
                        : "white",
                      color: tabActiva === "unificadas" ? "white" : "#475569",
                      border: tabActiva === "unificadas" ? "none" : "1px solid #e2e8f0",
                      borderRadius: "16px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      boxShadow: tabActiva === "unificadas" 
                        ? "0 10px 25px rgba(139, 92, 246, 0.3)" 
                        : "0 4px 12px rgba(0, 0, 0, 0.05)"
                    }}
                    onMouseEnter={(e) => {
                      if (tabActiva !== "unificadas") {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.background = "#f8fafc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tabActiva !== "unificadas") {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                        e.currentTarget.style.background = "white";
                      }
                    }}
                  >
                    <span style={{ fontSize: "20px", filter: tabActiva === "unificadas" ? "brightness(0) invert(1)" : "none" }}>🛍️</span>
                    Compras múltiples
                    <span style={{
                      fontSize: "14px",
                      background: tabActiva === "unificadas" ? "rgba(255, 255, 255, 0.25)" : "rgba(100, 116, 139, 0.08)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "700",
                      minWidth: "40px",
                      textAlign: "center"
                    }}>
                      {comprasUnificadasReales.length}
                    </span>
                  </button>
                )}
                
                {/* TAB INDIVIDUALES */}
                {pedidosIndividualesReales.length > 0 && (
                  <button
                    onClick={() => {
                      setTabActiva("individuales");
                      setFiltroEstadoIndividuales("todos");
                    }}
                    style={{
                      padding: "18px 32px",
                      background: tabActiva === "individuales" 
                        ? "linear-gradient(135deg, #FF6B35 0%, #FF9E6D 100%)"
                        : "white",
                      color: tabActiva === "individuales" ? "white" : "#475569",
                      border: tabActiva === "individuales" ? "none" : "1px solid #e2e8f0",
                      borderRadius: "16px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      boxShadow: tabActiva === "individuales" 
                        ? "0 10px 25px rgba(255, 107, 53, 0.3)" 
                        : "0 4px 12px rgba(0, 0, 0, 0.05)"
                    }}
                    onMouseEnter={(e) => {
                      if (tabActiva !== "individuales") {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.background = "#f8fafc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tabActiva !== "individuales") {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                        e.currentTarget.style.background = "white";
                      }
                    }}
                  >
                    <span style={{ fontSize: "20px", filter: tabActiva === "individuales" ? "brightness(0) invert(1)" : "none" }}>📦</span>
                    Compras directas
                    <span style={{
                      fontSize: "14px",
                      background: tabActiva === "individuales" ? "rgba(255, 255, 255, 0.25)" : "rgba(100, 116, 139, 0.08)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "700",
                      minWidth: "40px",
                      textAlign: "center"
                    }}>
                      {pedidosIndividualesReales.length}
                    </span>
                  </button>
                )}
              </div>
              
              {/* 🆕 FILTROS POR ESTADO - SEGÚN PESTAÑA ACTIVA */}
              {(mostrarUnificadas || mostrarIndividuales) && (
                <div style={{
                  paddingTop: "24px",
                  borderTop: "2px solid #f1f5f9"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px"
                  }}>
                    <span style={{ 
                      fontSize: "16px", 
                      color: "#475569", 
                      fontWeight: "700",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Filtrar por estado:
                    </span>
                    <span style={{
                      fontSize: "14px",
                      color: "#94a3b8",
                      background: "#f1f5f9",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontWeight: "600"
                    }}>
                      {mostrarUnificadas 
                        ? `${comprasUnificadasFiltradas.length} de ${comprasUnificadasReales.length} resultados`
                        : `${pedidosIndividualesFiltrados.length} de ${pedidosIndividualesReales.length} resultados`
                      }
                    </span>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}>
                    {/* Filtro para compras unificadas */}
                    {mostrarUnificadas && (
                      <>
                        <button
                          onClick={() => setFiltroEstadoUnificadas("todos")}
                          style={{
                            padding: "12px 24px",
                            background: filtroEstadoUnificadas === "todos" 
                              ? "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)" 
                              : "white",
                            color: filtroEstadoUnificadas === "todos" ? "white" : "#475569",
                            border: filtroEstadoUnificadas === "todos" ? "none" : "1px solid #e2e8f0",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "14px",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontFamily: "'Inter', sans-serif",
                            boxShadow: filtroEstadoUnificadas === "todos" 
                              ? "0 6px 20px rgba(255, 107, 53, 0.25)" 
                              : "0 2px 8px rgba(0, 0, 0, 0.04)"
                          }}
                          onMouseEnter={(e) => {
                            if (filtroEstadoUnificadas !== "todos") {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (filtroEstadoUnificadas !== "todos") {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                            }
                          }}
                        >
                          Todos ({estadisticasUnificadas.total})
                        </button>
                        
                        {estadisticasUnificadas.pendiente > 0 && (
                          <button
                            onClick={() => setFiltroEstadoUnificadas("pendiente")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoUnificadas === "pendiente" 
                                ? "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)" 
                                : "#fef3c7",
                              color: filtroEstadoUnificadas === "pendiente" ? "white" : "#92400E",
                              border: filtroEstadoUnificadas === "pendiente" ? "none" : "1px solid #fde68a",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoUnificadas === "pendiente" 
                                ? "0 6px 20px rgba(245, 158, 11, 0.25)" 
                                : "0 2px 8px rgba(245, 158, 11, 0.1)"
                            }}
                          >
                            ⏳ Pendientes ({estadisticasUnificadas.pendiente})
                          </button>
                        )}
                        
                        {estadisticasUnificadas.procesando > 0 && (
                          <button
                            onClick={() => setFiltroEstadoUnificadas("procesando")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoUnificadas === "procesando" 
                                ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" 
                                : "#dbeafe",
                              color: filtroEstadoUnificadas === "procesando" ? "white" : "#1E40AF",
                              border: filtroEstadoUnificadas === "procesando" ? "none" : "1px solid #bfdbfe",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoUnificadas === "procesando" 
                                ? "0 6px 20px rgba(59, 130, 246, 0.25)" 
                                : "0 2px 8px rgba(59, 130, 246, 0.1)"
                            }}
                          >
                            📦 En proceso ({estadisticasUnificadas.procesando})
                          </button>
                        )}
                        
                        {estadisticasUnificadas.completado > 0 && (
                          <button
                            onClick={() => setFiltroEstadoUnificadas("completada")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoUnificadas === "completada" 
                                ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)" 
                                : "#d1fae5",
                              color: filtroEstadoUnificadas === "completada" ? "white" : "#065F46",
                              border: filtroEstadoUnificadas === "completada" ? "none" : "1px solid #a7f3d0",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoUnificadas === "completada" 
                                ? "0 6px 20px rgba(16, 185, 129, 0.25)" 
                                : "0 2px 8px rgba(16, 185, 129, 0.1)"
                            }}
                          >
                            ✅ Completadas ({estadisticasUnificadas.completado})
                          </button>
                        )}
                        
                        {estadisticasUnificadas.cancelado > 0 && (
                          <button
                            onClick={() => setFiltroEstadoUnificadas("cancelada")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoUnificadas === "cancelada" 
                                ? "linear-gradient(135deg, #EF4444 0%, #F87171 100%)" 
                                : "#fee2e2",
                              color: filtroEstadoUnificadas === "cancelada" ? "white" : "#991B1B",
                              border: filtroEstadoUnificadas === "cancelada" ? "none" : "1px solid #fecaca",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoUnificadas === "cancelada" 
                                ? "0 6px 20px rgba(239, 68, 68, 0.25)" 
                                : "0 2px 8px rgba(239, 68, 68, 0.1)"
                            }}
                          >
                            ❌ Canceladas ({estadisticasUnificadas.cancelado})
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Filtro para pedidos individuales */}
                    {mostrarIndividuales && (
                      <>
                        <button
                          onClick={() => setFiltroEstadoIndividuales("todos")}
                          style={{
                            padding: "12px 24px",
                            background: filtroEstadoIndividuales === "todos" 
                              ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" 
                              : "white",
                            color: filtroEstadoIndividuales === "todos" ? "white" : "#475569",
                            border: filtroEstadoIndividuales === "todos" ? "none" : "1px solid #e2e8f0",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "14px",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontFamily: "'Inter', sans-serif",
                            boxShadow: filtroEstadoIndividuales === "todos" 
                              ? "0 6px 20px rgba(59, 130, 246, 0.25)" 
                              : "0 2px 8px rgba(0, 0, 0, 0.04)"
                          }}
                          onMouseEnter={(e) => {
                            if (filtroEstadoIndividuales !== "todos") {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (filtroEstadoIndividuales !== "todos") {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                            }
                          }}
                        >
                          Todos ({estadisticasIndividuales.total})
                        </button>
                        
                        {estadisticasIndividuales.pendiente > 0 && (
                          <button
                            onClick={() => setFiltroEstadoIndividuales("pendiente")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoIndividuales === "pendiente" 
                                ? "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)" 
                                : "#fef3c7",
                              color: filtroEstadoIndividuales === "pendiente" ? "white" : "#92400E",
                              border: filtroEstadoIndividuales === "pendiente" ? "none" : "1px solid #fde68a",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoIndividuales === "pendiente" 
                                ? "0 6px 20px rgba(245, 158, 11, 0.25)" 
                                : "0 2px 8px rgba(245, 158, 11, 0.1)"
                            }}
                          >
                            ⏳ Pendientes ({estadisticasIndividuales.pendiente})
                          </button>
                        )}
                        
                        {estadisticasIndividuales.procesando > 0 && (
                          <button
                            onClick={() => setFiltroEstadoIndividuales("procesando")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoIndividuales === "procesando" 
                                ? "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" 
                                : "#dbeafe",
                              color: filtroEstadoIndividuales === "procesando" ? "white" : "#1E40AF",
                              border: filtroEstadoIndividuales === "procesando" ? "none" : "1px solid #bfdbfe",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoIndividuales === "procesando" 
                                ? "0 6px 20px rgba(59, 130, 246, 0.25)" 
                                : "0 2px 8px rgba(59, 130, 246, 0.1)"
                            }}
                          >
                            📦 En proceso ({estadisticasIndividuales.procesando})
                          </button>
                        )}
                        
                        {estadisticasIndividuales.completado > 0 && (
                          <button
                            onClick={() => setFiltroEstadoIndividuales("completado")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoIndividuales === "completado" 
                                ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)" 
                                : "#d1fae5",
                              color: filtroEstadoIndividuales === "completado" ? "white" : "#065F46",
                              border: filtroEstadoIndividuales === "completado" ? "none" : "1px solid #a7f3d0",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoIndividuales === "completado" 
                                ? "0 6px 20px rgba(16, 185, 129, 0.25)" 
                                : "0 2px 8px rgba(16, 185, 129, 0.1)"
                            }}
                          >
                            ✅ Completados ({estadisticasIndividuales.completado})
                          </button>
                        )}
                        
                        {estadisticasIndividuales.cancelado > 0 && (
                          <button
                            onClick={() => setFiltroEstadoIndividuales("cancelado")}
                            style={{
                              padding: "12px 24px",
                              background: filtroEstadoIndividuales === "cancelado" 
                                ? "linear-gradient(135deg, #EF4444 0%, #F87171 100%)" 
                                : "#fee2e2",
                              color: filtroEstadoIndividuales === "cancelado" ? "white" : "#991B1B",
                              border: filtroEstadoIndividuales === "cancelado" ? "none" : "1px solid #fecaca",
                              borderRadius: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontSize: "14px",
                              transition: "all 0.2s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Inter', sans-serif",
                              boxShadow: filtroEstadoIndividuales === "cancelado" 
                                ? "0 6px 20px rgba(239, 68, 68, 0.25)" 
                                : "0 2px 8px rgba(239, 68, 68, 0.1)"
                            }}
                          >
                            ❌ Cancelados ({estadisticasIndividuales.cancelado})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
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
              Estamos organizando todos tus pedidos para mostrarte una vista clara y ordenada.
            </p>
          </div>
        ) : totalCompras === 0 ? (
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
              Cuando realices compras, aparecerán aquí organizadas por fecha. Los pedidos más recientes se mostrarán primero.
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
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "48px"
          }}>
            {/* 🔥 SECCIÓN DE COMPRAS UNIFICADAS - SÓLO SI CORRESPONDE */}
            {((mostrarTodos && comprasUnificadasReales.length > 0) || mostrarUnificadas) && comprasUnificadasFiltradas.length > 0 && (
              <div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                  gap: "20px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      color: "white",
                      boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)"
                    }}>
                      🛍️
                    </div>
                    <div>
                      <h2 style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "#1e293b",
                        margin: "0 0 8px 0",
                        fontFamily: "'Montserrat', sans-serif"
                      }}>
                        Compras con varios vendedores
                      </h2>
                      <p style={{
                        fontSize: "15px",
                        color: "#64748b",
                        margin: "0",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Pedidos agrupados de diferentes vendedores en una sola compra
                        {mostrarUnificadas && filtroEstadoUnificadas !== "todos" && (
                          <span style={{ 
                            color: getEstadoColor(filtroEstadoUnificadas === "procesando" ? "PROCESANDO" : 
                                              filtroEstadoUnificadas === "pendiente" ? "PENDIENTE" : 
                                              filtroEstadoUnificadas === "completada" ? "COMPLETADA" : 
                                              "CANCELADA"),
                            fontWeight: "700",
                            marginLeft: "8px",
                            background: `${getEstadoColor(filtroEstadoUnificadas === "procesando" ? "PROCESANDO" : 
                                                        filtroEstadoUnificadas === "pendiente" ? "PENDIENTE" : 
                                                        filtroEstadoUnificadas === "completada" ? "COMPLETADA" : 
                                                        "CANCELADA")}15`,
                            padding: "4px 12px",
                            borderRadius: "12px"
                          }}>
                            • Filtrando por {filtroEstadoUnificadas === "pendiente" ? "pendientes" : 
                                            filtroEstadoUnificadas === "procesando" ? "en proceso" : 
                                            filtroEstadoUnificadas === "completada" ? "completadas" : 
                                            "canceladas"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      fontSize: "15px",
                      color: "#64748b",
                      fontWeight: "600",
                      fontFamily: "'Inter', sans-serif",
                      background: "#f8fafc",
                      padding: "10px 20px",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0"
                    }}>
                      {comprasUnificadasFiltradas.length} de {comprasUnificadasReales.length}
                    </div>
                    <div style={{
                      fontSize: "15px",
                      color: "#8B5CF6",
                      fontWeight: "700",
                      fontFamily: "'Inter', sans-serif",
                      background: "#F5F3FF",
                      padding: "10px 20px",
                      borderRadius: "14px",
                      border: "2px solid #8B5CF6"
                    }}>
                      Total: ${money(comprasUnificadasFiltradas.reduce((sum, c) => sum + (c.totalGeneral || 0), 0))}
                    </div>
                  </div>
                </div>
                
                {/* Mensaje cuando no hay resultados del filtro */}
                {mostrarUnificadas && filtroEstadoUnificadas !== "todos" && comprasUnificadasFiltradas.length === 0 && (
                  <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "white",
                    borderRadius: "24px",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                    marginBottom: "32px",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ 
                      fontSize: "80px", 
                      marginBottom: "20px", 
                      opacity: 0.8,
                      background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "inline-block"
                    }}>
                      {filtroEstadoUnificadas === "pendiente" ? "⏳" : 
                       filtroEstadoUnificadas === "procesando" ? "📦" : 
                       filtroEstadoUnificadas === "completada" ? "✅" : "❌"}
                    </div>
                    <p style={{
                      color: "#1e293b",
                      fontSize: "22px",
                      fontWeight: "700",
                      margin: "0 0 12px 0",
                      fontFamily: "'Montserrat', sans-serif"
                    }}>
                      No hay compras {filtroEstadoUnificadas === "pendiente" ? "pendientes" : 
                                     filtroEstadoUnificadas === "procesando" ? "en proceso" : 
                                     filtroEstadoUnificadas === "completada" ? "completadas" : 
                                     "canceladas"}
                    </p>
                    <p style={{
                      color: "#64748b",
                      fontSize: "15px",
                      margin: "0 0 32px 0",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Todos los pedidos están en otros estados
                    </p>
                    <button
                      onClick={() => setFiltroEstadoUnificadas("todos")}
                      style={{
                        padding: "14px 28px",
                        background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "15px",
                        transition: "all 0.3s ease",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(139, 92, 246, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.3)";
                      }}
                    >
                      Ver todas las compras
                    </button>
                  </div>
                )}
                
                {/* Grid de compras unificadas */}
                {comprasUnificadasFiltradas.length > 0 && (
                  <div style={{ 
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
                    gap: "28px"
                  }}>
                    {comprasUnificadasFiltradas.map((compra) => (
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
                        onClick={() => navigate(`/mi-compra-unificada/${compra.idCompraUnificada}`, {
                          state: {
                            compraData: compra,
                            pedidos: compra.pedidos || [],
                            totalCompra: compra.totalGeneral || 0,
                            metodoPago: compra.metodoPago || 'PENDIENTE'
                          }
                        })}
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
                        
                        {/* Badge de "MÁS RECIENTE" si es la compra más reciente */}
                        {comprasUnificadasFiltradas[0] === compra && (
                          <div style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                            color: "white",
                            padding: "8px 20px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "800",
                            boxShadow: "0 6px 20px rgba(139, 92, 246, 0.4)",
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
                        
                        <div style={{ 
                          position: "relative", 
                          zIndex: "1",
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "flex-start", 
                          marginBottom: "24px",
                          gap: "20px"
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
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
                                  fontWeight: "800",
                                  fontFamily: "'Montserrat', sans-serif"
                                }}>
                                  {generarNombreAmigable(compra.idCompraUnificada, true)}
                                </h3>
                                <p style={{ 
                                  margin: "6px 0 0 0", 
                                  fontSize: "14px", 
                                  color: "#64748b",
                                  fontFamily: "'Inter', sans-serif"
                                }}>
                                  {formatearFecha(compra.fechaCompra)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Estado de la compra */}
                            <div style={{ 
                              display: "inline-block",
                              padding: "8px 20px",
                              borderRadius: "18px",
                              background: `${getEstadoColor(compra.estadoCompra)}15`,
                              fontSize: "14px",
                              fontWeight: "800",
                              color: getEstadoColor(compra.estadoCompra),
                              marginBottom: "16px",
                              fontFamily: "'Inter', sans-serif",
                              border: `2px solid ${getEstadoColor(compra.estadoCompra)}30`,
                              backdropFilter: "blur(10px)"
                            }}>
                              {getEstadoCompraLabel(compra.estadoCompra)}
                            </div>
                            
                            <div style={{ 
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              marginBottom: "20px",
                              flexWrap: "wrap"
                            }}>
                              <span style={{ 
                                background: "#f8fafc", 
                                padding: "8px 16px", 
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#475569",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                border: "1px solid #e2e8f0"
                              }}>
                                <span>📦</span>
                                {compra.cantidadPedidos || compra.pedidos?.length || 0} pedido(s)
                              </span>
                              
                              <span style={{ 
                                background: "#f8fafc", 
                                padding: "8px 16px", 
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#475569",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                border: "1px solid #e2e8f0"
                              }}>
                                <span>👤</span>
                                {compra.cantidadVendedores || new Set(compra.pedidos?.map(p => p.vendedor?.idVendedor || p.idVendedor)).size || 0} vendedor(es)
                              </span>
                            </div>
                            
                            {/* Método de pago */}
                            {compra.metodoPago && compra.metodoPago !== 'PENDIENTE' && (
                              <div style={{ 
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "16px",
                                padding: "8px 16px",
                                background: "#ECF2E3",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#5A8F48",
                                fontFamily: "'Inter', sans-serif",
                                border: "1px solid #d4e7b0"
                              }}>
                                {compra.metodoPago === 'EFECTIVO' ? '💵' : 
                                 compra.metodoPago === 'TRANSFERENCIA' ? '🏦' : 
                                 compra.metodoPago === 'TARJETA' ? '💳' : ''}
                                {compra.metodoPago === 'EFECTIVO' ? 'Pagado en efectivo' : 
                                 compra.metodoPago === 'TRANSFERENCIA' ? 'Pagado por transferencia' : 
                                 compra.metodoPago === 'TARJETA' ? 'Pagado con tarjeta' : compra.metodoPago}
                              </div>
                            )}
                            
                            {/* Lista de pedidos incluidos */}
                            <div style={{ 
                              marginTop: "20px",
                              background: "#F9FBF7",
                              padding: "16px",
                              borderRadius: "14px",
                              border: "1px solid #ECF2E3"
                            }}>
                              <p style={{ 
                                margin: "0 0 12px 0", 
                                fontSize: "15px", 
                                color: "#8B5CF6",
                                fontWeight: "800",
                                fontFamily: "'Inter', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                              }}>
                                <span>📋</span>
                                Pedidos incluidos en esta compra:
                              </p>
                              <div style={{ 
                                display: "flex", 
                                flexWrap: "wrap", 
                                gap: "8px"
                              }}>
                                {compra.pedidos?.map(p => (
                                  <span key={p.idPedido} style={{
                                    background: "#E8F5E9",
                                    padding: "6px 12px",
                                    borderRadius: "12px",
                                    fontSize: "13px",
                                    fontWeight: "800",
                                    color: "#2D3E2B",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontFamily: "'Inter', sans-serif",
                                    border: "1px solid #c8e6c9"
                                  }}>
                                    <span>#{p.idPedido}</span>
                                    <span style={{ fontSize: "12px", opacity: 0.9, fontWeight: "600" }}>(${money(p.total || p.montoTotal || 0)})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ 
                            textAlign: "right", 
                            minWidth: "160px",
                            background: "#f8fafc",
                            padding: "16px",
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0"
                          }}>
                            <div style={{ 
                              fontSize: "14px", 
                              color: "#64748b", 
                              marginBottom: "8px", 
                              fontWeight: "600", 
                              fontFamily: "'Inter', sans-serif" 
                            }}>
                              Total pagado
                            </div>
                            <div style={{ 
                              fontSize: "36px", 
                              fontWeight: "900", 
                              color: "#8B5CF6",
                              fontFamily: "'Inter', sans-serif",
                              marginBottom: "16px",
                              lineHeight: "1"
                            }}>
                              ${money(compra.totalGeneral || 0)}
                            </div>
                            <div style={{
                              fontSize: "13px",
                              color: "#94a3b8",
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: "600"
                            }}>
                              Haz clic para ver detalles
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 🔥 SECCIÓN DE PEDIDOS INDIVIDUALES - SÓLO SI CORRESPONDE */}
            {((mostrarTodos && pedidosIndividualesReales.length > 0) || mostrarIndividuales) && pedidosIndividualesFiltrados.length > 0 && (
              <div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                  gap: "20px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg, #FF6B35 0%, #FF9E6D 100%)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      color: "white",
                      boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)"
                    }}>
                      📦
                    </div>
                    <div>
                      <h2 style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "#1e293b",
                        margin: "0 0 8px 0",
                        fontFamily: "'Montserrat', sans-serif"
                      }}>
                        Compras con un solo vendedor
                      </h2>
                      <p style={{
                        fontSize: "15px",
                        color: "#64748b",
                        margin: "0",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Pedidos realizados directamente a un vendedor
                        {mostrarIndividuales && filtroEstadoIndividuales !== "todos" && (
                          <span style={{ 
                            color: getEstadoColor(filtroEstadoIndividuales.toUpperCase()),
                            fontWeight: "700",
                            marginLeft: "8px",
                            background: `${getEstadoColor(filtroEstadoIndividuales.toUpperCase())}15`,
                            padding: "4px 12px",
                            borderRadius: "12px"
                          }}>
                            • Filtrando por {filtroEstadoIndividuales === "pendiente" ? "pendientes" : 
                                            filtroEstadoIndividuales === "procesando" ? "en proceso" : 
                                            filtroEstadoIndividuales === "completado" ? "completados" : 
                                            "cancelados"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      fontSize: "15px",
                      color: "#64748b",
                      fontWeight: "600",
                      fontFamily: "'Inter', sans-serif",
                      background: "#f8fafc",
                      padding: "10px 20px",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0"
                    }}>
                      {pedidosIndividualesFiltrados.length} de {pedidosIndividualesReales.length}
                    </div>
                    <div style={{
                      fontSize: "15px",
                      color: "#FF6B35",
                      fontWeight: "700",
                      fontFamily: "'Inter', sans-serif",
                      background: "#FFF5F0",
                      padding: "10px 20px",
                      borderRadius: "14px",
                      border: "2px solid #FF6B35"
                    }}>
                      Total: ${money(pedidosIndividualesFiltrados.reduce((sum, p) => sum + (p.total || p.montoTotal || 0), 0))}
                    </div>
                  </div>
                </div>
                
                {/* Mensaje cuando no hay resultados del filtro */}
                {mostrarIndividuales && filtroEstadoIndividuales !== "todos" && pedidosIndividualesFiltrados.length === 0 && (
                  <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "white",
                    borderRadius: "24px",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                    marginBottom: "32px",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ 
                      fontSize: "80px", 
                      marginBottom: "20px", 
                      opacity: 0.8,
                      background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "inline-block"
                    }}>
                      {filtroEstadoIndividuales === "pendiente" ? "⏳" : 
                       filtroEstadoIndividuales === "procesando" ? "📦" : 
                       filtroEstadoIndividuales === "completado" ? "✅" : "❌"}
                    </div>
                    <p style={{
                      color: "#1e293b",
                      fontSize: "22px",
                      fontWeight: "700",
                      margin: "0 0 12px 0",
                      fontFamily: "'Montserrat', sans-serif"
                    }}>
                      No hay pedidos {filtroEstadoIndividuales === "pendiente" ? "pendientes" : 
                                     filtroEstadoIndividuales === "procesando" ? "en proceso" : 
                                     filtroEstadoIndividuales === "completado" ? "completados" : 
                                     "cancelados"}
                    </p>
                    <p style={{
                      color: "#64748b",
                      fontSize: "15px",
                      margin: "0 0 32px 0",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Todos los pedidos están en otros estados
                    </p>
                    <button
                      onClick={() => setFiltroEstadoIndividuales("todos")}
                      style={{
                        padding: "14px 28px",
                        background: "linear-gradient(135deg, #FF6B35 0%, #FF9E6D 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "15px",
                        transition: "all 0.3s ease",
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: "0 8px 25px rgba(255, 107, 53, 0.3)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(255, 107, 53, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 107, 53, 0.3)";
                      }}
                    >
                      Ver todos los pedidos
                    </button>
                  </div>
                )}
                
                {/* Grid de pedidos individuales */}
                {pedidosIndividualesFiltrados.length > 0 && (
                  <div style={{ 
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
                    gap: "28px"
                  }}>
                    {pedidosIndividualesFiltrados.map((p, index) => (
                      <div
                        key={p.idPedido}
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
                        onClick={() => navigate(`/pedido/${p.idPedido}`)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow = "0 20px 50px rgba(0, 0, 0, 0.15)";
                          e.currentTarget.style.borderColor = "#FF6B35";
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
                          background: "linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 158, 109, 0.08) 100%)",
                          borderRadius: "0 24px 0 100%",
                          zIndex: 0
                        }} />
                        
                        {/* Badge de "MÁS RECIENTE" si es el pedido más reciente */}
                        {index === 0 && pedidosIndividualesFiltrados[0] === p && (
                          <div style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: "linear-gradient(135deg, #FF6B35 0%, #FF9E6D 100%)",
                            color: "white",
                            padding: "8px 20px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "800",
                            boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)",
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
                          {/* Sección izquierda - Info del pedido */}
                          <div style={{ flex: 1, minWidth: "280px" }}>
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 16, 
                              marginBottom: 16 
                            }}>
                              <span style={{ 
                                fontSize: "36px",
                                background: getEstadoColor(p.estadoPedido),
                                color: "white",
                                width: "56px",
                                height: "56px",
                                borderRadius: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 8px 20px ${getEstadoColor(p.estadoPedido)}40`
                              }}>
                                {getEstadoEmoji(p.estadoPedido)}
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
                                  {generarNombreAmigable(p.idPedido, false)}
                                </h3>
                                <p style={{ 
                                  margin: "0", 
                                  fontSize: "14px", 
                                  color: "#64748b",
                                  fontFamily: "'Inter', sans-serif"
                                }}>
                                  {formatearFecha(p.fechaPedido)}
                                </p>
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
                              {/* Método de pago */}
                              {p.metodoPago && p.metodoPago !== 'PENDIENTE' && (
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
                                  {p.metodoPago === 'EFECTIVO' ? '💵 Efectivo' : 
                                   p.metodoPago === 'TRANSFERENCIA' ? '🏦 Transferencia' : 
                                   p.metodoPago === 'TARJETA' ? '💳 Tarjeta' : p.metodoPago}
                                </div>
                              )}
                              
                              {/* Badge de estado */}
                              <div style={{
                                display: "inline-block",
                                padding: "8px 20px",
                                borderRadius: "18px",
                                background: `${getEstadoColor(p.estadoPedido)}15`,
                                fontSize: "14px",
                                fontWeight: "800",
                                color: getEstadoColor(p.estadoPedido),
                                fontFamily: "'Inter', sans-serif",
                                border: `2px solid ${getEstadoColor(p.estadoPedido)}30`,
                                backdropFilter: "blur(10px)"
                              }}>
                                {getEstadoLabel(p.estadoPedido)}
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
                                Total pagado
                              </div>
                              <div style={{ 
                                fontWeight: "900", 
                                fontSize: "36px", 
                                color: "#FF6B35",
                                fontFamily: "'Inter', sans-serif",
                                lineHeight: 1
                              }}>
                                ${money(p.total || p.montoTotal || 0)}
                            </div>
                            </div>

                            {/* Botones de acción - SOLO EN MODO LISTA */}
                            {modo === "lista" && (
                              <div style={{ display: "flex", gap: 10, flexDirection: "column", width: "100%" }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/pedido/${p.idPedido}`);
                                  }}
                                  style={{
                                    padding: "12px 20px",
                                    borderRadius: "12px",
                                    border: "2px solid #FF6B35",
                                    cursor: "pointer",
                                    background: "white",
                                    color: "#FF6B35",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    transition: "all 0.3s ease",
                                    whiteSpace: "nowrap",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    fontFamily: "'Inter', sans-serif",
                                    width: "100%"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = "#FFF5F0";
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

                                {estadosConFactura.includes(p.estadoPedido) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/factura/${p.idPedido}`);
                                    }}
                                    style={{
                                      padding: "12px 20px",
                                      borderRadius: "12px",
                                      border: "none",
                                      cursor: "pointer",
                                      background: "linear-gradient(135deg, #FF6B35 0%, #FF9E6D 100%)",
                                      color: "white",
                                      fontSize: "14px",
                                      fontWeight: "700",
                                      transition: "all 0.3s ease",
                                      boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)",
                                      whiteSpace: "nowrap",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "8px",
                                      fontFamily: "'Inter', sans-serif",
                                      width: "100%"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = "translateY(-2px)";
                                      e.target.style.boxShadow = "0 10px 25px rgba(255, 107, 53, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = "translateY(0)";
                                      e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
                                    }}
                                  >
                                    <span>📄</span>
                                    Ver factura
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* FINAL - RESUMEN */}
            {modo === "lista" && totalCompras > 0 && (
              <div style={{
                textAlign: "center",
                padding: "32px",
                background: "white",
                borderRadius: "24px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                marginTop: "32px",
                border: "1px solid #f1f5f9"
              }}>
                <p style={{
                  color: "#475569",
                  fontSize: "18px",
                  fontWeight: "700",
                  margin: "0 0 12px 0",
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  {(() => {
                    if (mostrarTodos) return `✅ Historial completo - ${totalCompras} compras en total`;
                    if (mostrarUnificadas) return `🛍️ ${comprasUnificadasFiltradas.length} compras con varios vendedores`;
                    if (mostrarIndividuales) return `📦 ${pedidosIndividualesFiltrados.length} compras con un vendedor`;
                    return "";
                  })()}
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
                  {mostrarTodos && (
                    <>
                      <span style={{ 
                        color: "#8B5CF6", 
                        fontWeight: "800", 
                        background: "#F5F3FF", 
                        padding: "6px 16px", 
                        borderRadius: "10px",
                        border: "2px solid #8B5CF6"
                      }}>
                        {comprasUnificadasReales.length} compras múltiples
                      </span>
                      <span style={{ color: "#94a3b8" }}>•</span>
                      <span style={{ 
                        color: "#FF6B35", 
                        fontWeight: "800", 
                        background: "#FFF5F0", 
                        padding: "6px 16px", 
                        borderRadius: "10px",
                        border: "2px solid #FF6B35"
                      }}>
                        {pedidosIndividualesReales.length} compras directas
                      </span>
                    </>
                  )}
                  {mostrarUnificadas && (
                    <span>
                      Total gastado: <span style={{ 
                        color: "#8B5CF6", 
                        fontWeight: "800", 
                        background: "#F5F3FF", 
                        padding: "6px 16px", 
                        borderRadius: "10px",
                        border: "2px solid #8B5CF6"
                      }}>${money(comprasUnificadasFiltradas.reduce((sum, c) => sum + (c.totalGeneral || 0), 0))}</span>
                    </span>
                  )}
                  {mostrarIndividuales && (
                    <span>
                      Total gastado: <span style={{ 
                        color: "#FF6B35", 
                        fontWeight: "800", 
                        background: "#FFF5F0", 
                        padding: "6px 16px", 
                        borderRadius: "10px",
                        border: "2px solid #FF6B35"
                      }}>${money(pedidosIndividualesFiltrados.reduce((sum, p) => sum + (p.total || p.montoTotal || 0), 0))}</span>
                    </span>
                  )}
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
          .grid-container {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 2.5rem !important;
          }
          
          /* Tabs responsive */
          div[style*="display: flex; gap: 12px; overflow-x: auto"] {
            flex-direction: column !important;
          }
          
          .tab-button {
            width: 100% !important;
            justify-content: center !important;
          }
          
          /* Grid responsive */
          div[style*="grid-template-columns: repeat(auto-fill, minmax(480px, 1fr))"] {
            grid-template-columns: 1fr !important;
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
          
          div[style*="display: flex; gap: 28px; flex-wrap: wrap;"] {
            flex-direction: column !important;
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
            font-size: 18px !important;
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