import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function VendedorPedidoDetalle() {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [circlePositions, setCirclePositions] = useState([]);
  
  // 🔥 NUEVO: Estado para el número secuencial del pedido
  const [numeroPedidoVendedor, setNumeroPedidoVendedor] = useState(null);
  const [contadorPedidosVendedor, setContadorPedidosVendedor] = useState(0);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES MEJORADA ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.12)",
        "rgba(139, 92, 246, 0.12)",
        "rgba(59, 130, 246, 0.12)",
        "rgba(52, 211, 153, 0.12)",
        "rgba(245, 158, 11, 0.12)",
        "rgba(14, 165, 233, 0.12)",
        "rgba(236, 72, 153, 0.12)",
        "rgba(90, 143, 72, 0.12)"
      ];
      
      for (let i = 0; i < 12; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 25 + "s",
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
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Cargar el pedido con todos los estados
  const cargarPedido = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token || localStorage.getItem("authToken");
    
    if (!token) return navigate("/loginmodal");

    try {
      const resPedido = await fetch(
        `${API_URL}/pedidos/vendedor/detalle/${idPedido}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resPedido.ok) {
        throw new Error("No autorizado para ver el pedido");
      }

      const dataPedido = await resPedido.json();
      console.log("📦 Datos del pedido:", dataPedido);

      // 🔥 NUEVO: Extraer la información correctamente
      if (dataPedido.pedido) {
        // Si la respuesta tiene estructura {pedido: ..., numeroPedidoVendedor: ...}
        setPedido(dataPedido.pedido);
        setNumeroPedidoVendedor(dataPedido.numeroPedidoVendedor || dataPedido.pedido.numeroPedidoVendedor);
        setContadorPedidosVendedor(dataPedido.totalPedidosVendedor || 0);
        setDetalles(dataPedido.pedido.detalles || dataPedido.pedido.productos || []);
      } else {
        // Si la respuesta es el pedido directo
        setPedido(dataPedido);
        setDetalles(dataPedido.detalles || dataPedido.productos || []);
        
        // 🔥 Obtener el número secuencial del pedido
        cargarNumeroSecuencialPedido(dataPedido.idPedido || dataPedido.id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando pedido:", err);
      alert("Error al cargar el pedido");
      setLoading(false);
    }
  };

  // 🔥 NUEVO: Cargar el número secuencial del pedido específico
  const cargarNumeroSecuencialPedido = async (pedidoId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token || localStorage.getItem("authToken");
    
    if (!token) return;

    try {
      const res = await fetch(
        `${API_URL}/pedidos/vendedor/pedido/${pedidoId}/numero-secuencial`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setNumeroPedidoVendedor(data.numeroSecuencial || data.posicion);
        setContadorPedidosVendedor(data.totalPedidosVendedor || 0);
      }
    } catch (err) {
      console.error("❌ Error cargando número secuencial:", err);
    }
  };

  // 🔥 NUEVO: Cargar contador de pedidos del vendedor
  const cargarContadorPedidosVendedor = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token || localStorage.getItem("authToken");
    
    if (!token) return;

    try {
      const res = await fetch(
        `${API_URL}/pedidos/vendedor/contador-pedidos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setContadorPedidosVendedor(data.totalPedidos || 0);
      }
    } catch (err) {
      console.error("❌ Error cargando contador de pedidos:", err);
    }
  };

  useEffect(() => {
    cargarPedido();
    cargarContadorPedidosVendedor();
  }, [idPedido]);

  // Función para cambiar el estado del pedido del vendedor
  const cambiarEstado = async (nuevoEstado) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) return navigate("/loginmodal");

    if (!confirm(`¿Cambiar estado a ${mapearNombreEstado(nuevoEstado)}?`)) return;

    setActualizando(true);

    try {
      const res = await fetch(
        `${API_URL}/pedidos/vendedor/${idPedido}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({
            estadoPedidoVendedor: nuevoEstado
          })
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      alert("✅ Estado actualizado correctamente");
      cargarPedido();
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`❌ Error al actualizar el estado: ${err.message}`);
    } finally {
      setActualizando(false);
    }
  };

  // Verificar comprobante de pago
  const tieneComprobante = () => {
    return pedido && 
           pedido.metodoPago && 
           (pedido.metodoPago.toUpperCase().includes("TRANSFERENCIA") || 
            pedido.metodoPago.toUpperCase().includes("DEPOSITO")) &&
           pedido.comprobanteUrl;
  };

  // Obtener próximos estados disponibles según el estado actual
  const obtenerProximosEstados = () => {
    if (!pedido) return [];

    const estadoActual = pedido.estadoPedidoVendedor;
    const estadoPago = pedido.estadoPago;

    // Solo NO permitir si está CANCELADO
    if (pedido.estadoPedido === "CANCELADO" || pedido.estadoPago === "CANCELADO") {
      return [];
    }

    const estadosDisponibles = [];

    // Si no tiene estado, empezar como NUEVO (incluso si pago está pendiente)
    if (!estadoActual || estadoActual === "No asignado") {
      estadosDisponibles.push("NUEVO");
    } else {
      switch (estadoActual) {
        case "NUEVO":
          estadosDisponibles.push("EN_PROCESO", "CANCELADO");
          break;
        case "EN_PROCESO":
          estadosDisponibles.push("DESPACHADO", "CANCELADO");
          break;
        case "DESPACHADO":
          estadosDisponibles.push("ENTREGADO");
          break;
        case "ENTREGADO":
          // No hay más estados después de entregado
          break;
        case "CANCELADO":
          // No se puede cambiar desde cancelado
          break;
      }
    }

    return estadosDisponibles;
  };

  // Función para determinar qué estado mostrar
  const obtenerEstadoParaMostrar = () => {
    if (!pedido) return "Cargando...";

    // Si el pedido está cancelado, mostrar cancelado
    if (pedido.estadoPedido === "CANCELADO" || pedido.estadoPago === "CANCELADO") {
      return "Cancelado";
    }
    
    // Si el pago está pendiente
    if (pedido.estadoPago === "PENDIENTE") {
      return "Esperando pago";
    }
    
    // Si el pago está en verificación
    if (pedido.estadoPago === "EN_VERIFICACION") {
      return "Verificando pago";
    }
    
    // Si el pago fue rechazado
    if (pedido.estadoPago === "RECHAZADO") {
      return "Pago rechazado";
    }
    
    // Si el pago está completado, mostrar estado del vendedor
    if (pedido.estadoPago === "PAGADO") {
      const estadoMap = {
        "NUEVO": "Nuevo",
        "EN_PROCESO": "En Proceso",
        "DESPACHADO": "Despachado",
        "ENTREGADO": "Entregado",
        "CANCELADO": "Cancelado"
      };
      return estadoMap[pedido.estadoPedidoVendedor] || pedido.estadoPedidoVendedor || "Pendiente";
    }
    
    return pedido.estadoPedido || "Pendiente";
  };

  // Obtener color según estado
  const obtenerColorEstado = (estado) => {
    const estados = {
      "Nuevo": { bg: "rgba(255, 107, 53, 0.15)", color: "#FF6B35", border: "#FF6B35", glow: "rgba(255, 107, 53, 0.3)" },
      "En Proceso": { bg: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", border: "#3B82F6", glow: "rgba(59, 130, 246, 0.3)" },
      "Despachado": { bg: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6", border: "#8B5CF6", glow: "rgba(139, 92, 246, 0.3)" },
      "Entregado": { bg: "rgba(52, 211, 153, 0.15)", color: "#34D399", border: "#34D399", glow: "rgba(52, 211, 153, 0.3)" },
      "Cancelado": { bg: "rgba(239, 68, 68, 0.15)", color: "#EF4444", border: "#EF4444", glow: "rgba(239, 68, 68, 0.3)" },
      "Esperando pago": { bg: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "#F59E0B", glow: "rgba(245, 158, 11, 0.3)" },
      "Verificando pago": { bg: "rgba(14, 165, 233, 0.15)", color: "#0EA5E9", border: "#0EA5E9", glow: "rgba(14, 165, 233, 0.3)" },
      "Pago rechazado": { bg: "rgba(236, 72, 153, 0.15)", color: "#EC4899", border: "#EC4899", glow: "rgba(236, 72, 153, 0.3)" }
    };
    return estados[estado] || { bg: "rgba(241, 245, 249, 0.5)", color: "#64748b", border: "#cbd5e1", glow: "rgba(100, 116, 139, 0.3)" };
  };

  // Mapear estado interno a nombre mostrado
  const mapearNombreEstado = (estado) => {
    const estadoMap = {
      "NUEVO": "Nuevo",
      "EN_PROCESO": "En Proceso",
      "DESPACHADO": "Despachado",
      "ENTREGADO": "Entregado",
      "CANCELADO": "Cancelado"
    };
    return estadoMap[estado] || estado;
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "100vh",
          fontSize: "24px",
          color: "#64748b",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Círculos de fondo */}
        {circlePositions.map(circle => (
          <div 
            key={circle.id}
            style={{
              position: "fixed",
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
              zIndex: circle.zIndex,
              pointerEvents: "none"
            }}
          />
        ))}
        
        <div style={{
          display: "inline-block",
          width: "60px",
          height: "60px",
          border: "5px solid rgba(255, 107, 53, 0.1)",
          borderTop: "5px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "25px",
          position: "relative",
          zIndex: "10"
        }}></div>
        <p style={{ 
          position: "relative",
          zIndex: "10",
          fontFamily: "'Inter', sans-serif",
          fontWeight: "600"
        }}>
          Cargando detalles del pedido...
        </p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Círculos de fondo */}
        {circlePositions.map(circle => (
          <div 
            key={circle.id}
            style={{
              position: "fixed",
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
              zIndex: circle.zIndex,
              pointerEvents: "none"
            }}
          />
        ))}
        
        <h2 style={{ 
          color: "#2C3E50", 
          position: "relative",
          zIndex: "10",
          fontFamily: "'Playfair Display', serif",
          fontWeight: "700"
        }}>
          ❌ Error cargando pedido
        </h2>
        <button
          onClick={() => navigate("/vendedor/pedidos")}
          style={{
            marginTop: "25px",
            padding: "14px 28px",
            background: "linear-gradient(135deg, #FF6B35 0%, #FF8C53 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            position: "relative",
            zIndex: "10",
            boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 53, 0.3)";
          }}
        >
          ← Volver a pedidos
        </button>
      </div>
    );
  }

  const estadoParaMostrar = obtenerEstadoParaMostrar();
  const colorEstado = obtenerColorEstado(estadoParaMostrar);
  const proximosEstados = obtenerProximosEstados();
  const user = JSON.parse(localStorage.getItem("user"));
  const esTransferencia = tieneComprobante();
  const debeMostrarSeccionEstado = pedido && 
    (proximosEstados.length > 0 || 
     (!pedido.estadoPedidoVendedor && pedido.estadoPago !== "CANCELADO" && 
      pedido.estadoPedido !== "CANCELADO"));

  // 🔥 NUEVO: Obtener el número del pedido para mostrar
  const numeroParaMostrar = numeroPedidoVendedor || pedido.numeroPedidoVendedor || pedido.idPedido;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* CÍRCULOS DE COLORES ANIMADOS EN EL FONDO - MEJORADO */}
      {circlePositions.map(circle => (
        <div 
          key={circle.id}
          style={{
            position: "fixed",
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
            zIndex: circle.zIndex,
            pointerEvents: "none"
          }}
        />
      ))}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px 20px",
          flex: "1",
          width: "100%",
          position: "relative",
          zIndex: "10"
        }}
      >
        {/* Botón de volver con efecto mejorado */}
        <button
          onClick={() => navigate("/vendedor/pedidos")}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            padding: "14px 24px",
            borderRadius: "14px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "700",
            color: "#FF6B35",
            marginBottom: "25px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "'Inter', sans-serif",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateX(-6px)";
            e.target.style.boxShadow = "0 8px 25px rgba(255, 107, 53, 0.2)";
            e.target.style.borderColor = "#FF6B35";
            e.target.style.background = "#FF6B35";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateX(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.background = "white";
            e.target.style.color = "#FF6B35";
          }}
        >
          <span style={{ 
            fontSize: "20px",
            transition: "transform 0.3s ease"
          }}>←</span>
          Volver a Pedidos
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px",
            animation: "fadeIn 0.6s ease-out",
            alignItems: "start"
          }}
        >
          {/* COLUMNA IZQUIERDA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Header del Pedido - CON EFECTOS MEJORADOS */}
            <div
              style={{
                padding: "35px",
                borderRadius: "24px",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(10px)",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Línea decorativa superior con gradiente animado */}
              <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                height: "5px",
                background: "linear-gradient(90deg, #FF6B35, #8B5CF6, #3B82F6)",
                borderRadius: "24px 24px 0 0",
                animation: "gradientShift 3s ease infinite alternate"
              }}></div>
              
              {/* Elemento decorativo flotante */}
              <div style={{
                position: "absolute",
                top: "-100px",
                right: "-100px",
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(255, 107, 53, 0.05) 0%, rgba(255, 107, 53, 0) 70%)",
                borderRadius: "50%",
                zIndex: "0"
              }}></div>
              
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "25px",
                  marginBottom: "20px",
                  position: "relative",
                  zIndex: "10"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "14px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#FF6B35",
                    marginBottom: "10px",
                    fontWeight: "700",
                    background: "rgba(255, 107, 53, 0.1)",
                    padding: "8px 16px",
                    borderRadius: "30px",
                    display: "inline-block"
                  }}>
                    Detalle del Pedido
                  </div>
                  
                  <h1
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: "900",
                      margin: "15px 0 10px 0",
                      fontSize: "42px",
                      color: "#2C3E50",
                      lineHeight: "1.1",
                      letterSpacing: "-0.5px"
                    }}
                  >
                    {/* 🔥 CAMBIADO: Solo muestra el número secuencial del vendedor */}
                    Pedido #{numeroParaMostrar}
                  </h1>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginTop: "15px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#64748b",
                      background: "rgba(248, 250, 252, 0.8)",
                      padding: "10px 18px",
                      borderRadius: "14px",
                      fontWeight: "600",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(229, 231, 235, 0.5)"
                    }}>
                      <span style={{ 
                        fontSize: "18px", 
                        background: "linear-gradient(135deg, #FF6B35, #FF8C53)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>📅</span>
                      {new Date(pedido.fechaPedido || pedido.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#64748b",
                      background: "rgba(248, 250, 252, 0.8)",
                      padding: "10px 18px",
                      borderRadius: "14px",
                      fontWeight: "600",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(229, 231, 235, 0.5)"
                    }}>
                      <span style={{ 
                        fontSize: "18px", 
                        background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>👤</span>
                      {pedido.consumidor?.usuario?.nombre || pedido.nombreCliente || "N/A"} {pedido.consumidor?.usuario?.apellido || ""}
                    </div>
                  </div>
                </div>
                
                <div
                  style={{
                    background: `linear-gradient(135deg, ${colorEstado.bg.replace('0.15', '0.25')}, rgba(255, 255, 255, 0.1))`,
                    color: colorEstado.color,
                    border: `2px solid ${colorEstado.border}`,
                    padding: "18px 32px",
                    borderRadius: "18px",
                    fontWeight: "900",
                    fontSize: "16px",
                    whiteSpace: "nowrap",
                    boxShadow: `0 6px 20px ${colorEstado.glow}`,
                    textAlign: "center",
                    minWidth: "200px",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    backdropFilter: "blur(5px)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.08) rotate(1deg)";
                    e.currentTarget.style.boxShadow = `0 12px 30px ${colorEstado.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.boxShadow = `0 6px 20px ${colorEstado.glow}`;
                  }}
                >
                  <span style={{
                    position: "relative",
                    zIndex: "2"
                  }}>{estadoParaMostrar}</span>
                  <div style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    background: `linear-gradient(135deg, transparent, ${colorEstado.bg.replace('0.15', '0.1')}, transparent)`,
                    opacity: "0.5",
                    zIndex: "1"
                  }}></div>
                </div>
              </div>

              {/* ESTADOS DEL PEDIDO (RECUADRO ROJO) */}
              <div style={{
                marginTop: "30px",
                paddingTop: "25px",
                borderTop: "2px solid rgba(241, 245, 249, 0.8)",
                display: "flex",
                flexWrap: "wrap",
                gap: "25px",
                position: "relative",
                zIndex: "10"
              }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  flex: "1",
                  minWidth: "220px"
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{ fontSize: "16px" }}>💳</span>
                    ESTADO DEL PAGO
                  </div>
                  <div style={{
                    background: pedido.estadoPago === "PAGADO" ? 
                              "linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(52, 211, 153, 0.1))" : 
                              pedido.estadoPago === "PENDIENTE" ? 
                              "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))" : 
                              "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))",
                    color: pedido.estadoPago === "PAGADO" ? "#34D399" : 
                          pedido.estadoPago === "PENDIENTE" ? "#F59E0B" : "#EF4444",
                    padding: "14px 22px",
                    borderRadius: "14px",
                    fontWeight: "800",
                    fontSize: "15px",
                    border: `2px solid ${pedido.estadoPago === "PAGADO" ? "rgba(52, 211, 153, 0.3)" : 
                            pedido.estadoPago === "PENDIENTE" ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                    boxShadow: `0 4px 15px ${pedido.estadoPago === "PAGADO" ? "rgba(52, 211, 153, 0.2)" : 
                              pedido.estadoPago === "PENDIENTE" ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                    transition: "all 0.3s ease"
                  }}>
                    {pedido.estadoPago || "PENDIENTE"}
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  flex: "1",
                  minWidth: "220px"
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{ fontSize: "16px" }}>📦</span>
                    ESTADO GENERAL
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))",
                    color: "#64748b",
                    padding: "14px 22px",
                    borderRadius: "14px",
                    fontWeight: "800",
                    fontSize: "15px",
                    border: "2px solid rgba(229, 231, 235, 0.4)",
                    backdropFilter: "blur(5px)",
                    transition: "all 0.3s ease"
                  }}>
                    {pedido.estadoPedido || "PENDIENTE"}
                  </div>
                </div>
              </div>
            </div>

            {/* LISTA DE PRODUCTOS (RECUADRO AMARILLO) */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
                padding: "30px",
                borderRadius: "24px",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                backdropFilter: "blur(10px)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "25px",
                flexShrink: 0,
                position: "relative"
              }}>
                <div style={{
                  fontSize: "32px",
                  background: "linear-gradient(135deg, #FF6B35, #FF8C53)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "flex",
                  alignItems: "center"
                }}>
                  🛒
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#2C3E50",
                      margin: "0 0 6px 0",
                      letterSpacing: "-0.5px"
                    }}
                  >
                    Productos
                  </h2>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "15px",
                      margin: "0",
                      fontWeight: "600",
                      background: "rgba(100, 116, 139, 0.1)",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      display: "inline-block"
                    }}
                  >
                    {detalles.length} productos en este pedido
                  </p>
                </div>
              </div>

              {detalles.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "60px 20px", 
                  color: "#94a3b8",
                  background: "rgba(248, 250, 252, 0.8)",
                  borderRadius: "18px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "2px dashed rgba(203, 213, 225, 0.5)"
                }}>
                  <div style={{ 
                    fontSize: "64px", 
                    marginBottom: "20px", 
                    opacity: 0.5,
                    animation: "pulse 2s infinite"
                  }}>📦</div>
                  <p style={{ 
                    fontWeight: "700", 
                    fontSize: "18px", 
                    color: "#64748b",
                    marginBottom: "10px"
                  }}>
                    No hay productos en este pedido
                  </p>
                  <p style={{ 
                    fontSize: "14px", 
                    opacity: 0.7,
                    maxWidth: "300px"
                  }}>
                    Este pedido no contiene productos
                  </p>
                </div>
              ) : (
                <div style={{ 
                  flex: 1,
                  overflowY: "auto", 
                  paddingRight: "15px"
                }}>
                  {detalles.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(250, 252, 248, 0.8)",
                        padding: "22px",
                        borderRadius: "18px",
                        marginBottom: "15px",
                        display: "flex",
                        gap: "22px",
                        alignItems: "center",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: "1px solid rgba(241, 245, 249, 0.5)",
                        backdropFilter: "blur(5px)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(8px) scale(1.02)";
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(255, 107, 53, 0.15)";
                        e.currentTarget.style.borderColor = "#FF6B35";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0) scale(1)";
                        e.currentTarget.style.background = "rgba(250, 252, 248, 0.8)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "rgba(241, 245, 249, 0.5)";
                      }}
                    >
                      {/* Línea decorativa lateral */}
                      <div style={{
                        position: "absolute",
                        left: "0",
                        top: "0",
                        bottom: "0",
                        width: "4px",
                        background: "linear-gradient(to bottom, #FF6B35, #FF8C53)",
                        borderRadius: "0 4px 4px 0",
                        opacity: 0
                      }}></div>

                      {d.producto?.imagenProducto && (
                        <div style={{
                          width: "85px",
                          height: "85px",
                          borderRadius: "14px",
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                          border: "3px solid white",
                          position: "relative",
                          zIndex: "2"
                        }}>
                          <img
                            src={d.producto.imagenProducto}
                            alt={d.producto.nombreProducto}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.4s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                            }}
                          />
                        </div>
                      )}

                      <div style={{ 
                        flex: 1, 
                        minWidth: 0,
                        position: "relative",
                        zIndex: "2"
                      }}>
                        <strong
                          style={{
                            fontSize: "17px",
                            color: "#2C3E50",
                            display: "block",
                            fontWeight: "800",
                            marginBottom: "8px",
                            letterSpacing: "-0.3px"
                          }}
                        >
                          {d.producto?.nombreProducto || d.nombreProducto || "Producto"}
                        </strong>
                        <div style={{
                          display: "flex",
                          gap: "18px",
                          flexWrap: "wrap",
                          marginTop: "10px"
                        }}>
                          <span style={{
                            fontSize: "14px",
                            color: "#64748b",
                            background: "rgba(241, 245, 249, 0.8)",
                            padding: "6px 14px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            border: "1px solid rgba(229, 231, 235, 0.5)"
                          }}>
                            📦 Cantidad: {d.cantidad}
                          </span>
                          <span style={{
                            fontSize: "14px",
                            color: "#64748b",
                            background: "rgba(241, 245, 249, 0.8)",
                            padding: "6px 14px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            border: "1px solid rgba(229, 231, 235, 0.5)"
                          }}>
                            💰 Precio: ${((d.subtotal || d.precio || 0) / d.cantidad).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "900",
                          background: "linear-gradient(135deg, #FF6B35, #FF8C53)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          padding: "12px 22px",
                          borderRadius: "14px",
                          border: "2px solid rgba(255, 107, 53, 0.3)",
                          boxShadow: "0 4px 15px rgba(255, 107, 53, 0.1)",
                          transition: "all 0.3s ease",
                          position: "relative",
                          zIndex: "2"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 107, 53, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 107, 53, 0.1)";
                        }}
                      >
                        ${(d.subtotal || d.precio || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CAMBIAR ESTADO (RECUADRO MORADO) */}
            {debeMostrarSeccionEstado && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
                  padding: "30px",
                  borderRadius: "24px",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Elemento decorativo */}
                <div style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "150px",
                  height: "150px",
                  background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)",
                  borderRadius: "50%",
                  zIndex: "0"
                }}></div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: "10"
                }}>
                  <div style={{
                    fontSize: "28px",
                    background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    🔄
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "24px",
                        fontWeight: "800",
                        color: "#2C3E50",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Cambiar Estado
                    </h2>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: "0",
                        fontWeight: "600"
                      }}
                    >
                      Actualiza el estado del pedido
                    </p>
                  </div>
                </div>

                <div style={{ 
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  position: "relative",
                  zIndex: "10"
                }}>
                  {proximosEstados.length > 0 ? (
                    proximosEstados.map((estado) => {
                      const buttonColors = {
                        "NUEVO": { 
                          bg: "linear-gradient(135deg, #FF6B35 0%, #FF8C53 100%)", 
                          hover: "#FF8C53",
                          shadow: "rgba(255, 107, 53, 0.4)"
                        },
                        "EN_PROCESO": { 
                          bg: "linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)", 
                          hover: "#2563eb",
                          shadow: "rgba(59, 130, 246, 0.4)"
                        },
                        "DESPACHADO": { 
                          bg: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", 
                          hover: "#7C3AED",
                          shadow: "rgba(139, 92, 246, 0.4)"
                        },
                        "ENTREGADO": { 
                          bg: "linear-gradient(135deg, #34D399 0%, #10B981 100%)", 
                          hover: "#10B981",
                          shadow: "rgba(52, 211, 153, 0.4)"
                        },
                        "CANCELADO": { 
                          bg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", 
                          hover: "#DC2626",
                          shadow: "rgba(239, 68, 68, 0.4)"
                        }
                      };
                      
                      const color = buttonColors[estado] || { 
                        bg: "linear-gradient(135deg, #64748b 0%, #475569 100%)", 
                        hover: "#475569",
                        shadow: "rgba(100, 116, 139, 0.4)"
                      };
                      
                      return (
                        <button
                          key={estado}
                          onClick={() => cambiarEstado(estado)}
                          disabled={actualizando}
                          style={{
                            width: "100%",
                            background: color.bg,
                            color: "white",
                            padding: "16px",
                            fontSize: "15px",
                            fontWeight: "800",
                            borderRadius: "14px",
                            border: "none",
                            cursor: actualizando ? "not-allowed" : "pointer",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            opacity: actualizando ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            boxShadow: `0 6px 20px ${color.shadow}`,
                            position: "relative",
                            overflow: "hidden",
                            letterSpacing: "0.3px"
                          }}
                          onMouseEnter={(e) => {
                            if (!actualizando) {
                              e.target.style.transform = "translateY(-4px) scale(1.03)";
                              e.target.style.boxShadow = `0 12px 30px ${color.shadow}`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!actualizando) {
                              e.target.style.transform = "translateY(0) scale(1)";
                              e.target.style.boxShadow = `0 6px 20px ${color.shadow}`;
                            }
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>
                            {estado === "NUEVO" ? "🆕" :
                             estado === "EN_PROCESO" ? "⚙️" :
                             estado === "DESPACHADO" ? "🚚" :
                             estado === "ENTREGADO" ? "✅" : "❌"}
                          </span>
                          {estado === "NUEVO" ? "Marcar como Nuevo" :
                           estado === "EN_PROCESO" ? "Marcar como En Proceso" :
                           estado === "DESPACHADO" ? "Marcar como Despachado" :
                           estado === "ENTREGADO" ? "Marcar como Entregado" :
                           estado === "CANCELADO" ? "Cancelar Pedido" : estado}
                        </button>
                      );
                    })
                  ) : !pedido.estadoPedidoVendedor && (
                    <div style={{ 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "15px"
                    }}>
                      <button
                        onClick={() => cambiarEstado("NUEVO")}
                        disabled={actualizando}
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, #FF6B35 0%, #FF8C53 100%)",
                          color: "white",
                          padding: "16px",
                          fontSize: "15px",
                          fontWeight: "800",
                          borderRadius: "14px",
                          border: "none",
                          cursor: actualizando ? "not-allowed" : "pointer",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: actualizando ? 0.7 : 1,
                          boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px"
                        }}
                        onMouseEnter={(e) => {
                          if (!actualizando) {
                            e.target.style.transform = "translateY(-4px) scale(1.03)";
                            e.target.style.boxShadow = "0 12px 30px rgba(255, 107, 53, 0.5)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!actualizando) {
                            e.target.style.transform = "translateY(0) scale(1)";
                            e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.4)";
                          }
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>🆕</span>
                        Marcar como Nuevo
                      </button>
                      <p style={{ 
                        fontSize: "13px", 
                        color: "#64748b", 
                        lineHeight: "1.6",
                        textAlign: "center",
                        maxWidth: "300px",
                        fontWeight: "500"
                      }}>
                        Asigna este pedido para comenzar a procesarlo
                      </p>
                    </div>
                  )}
                </div>
                
                <div style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "2px solid rgba(241, 245, 249, 0.8)",
                  textAlign: "center",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: "10"
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "700",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}>
                    <span>📋</span>
                    ESTADO ACTUAL
                  </div>
                  <div style={{
                    fontSize: "15px",
                    color: "#2C3E50",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))",
                    padding: "10px 24px",
                    borderRadius: "12px",
                    display: "inline-block",
                    border: "2px solid rgba(229, 231, 235, 0.4)",
                    backdropFilter: "blur(5px)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)"
                  }}>
                    {mapearNombreEstado(pedido.estadoPedidoVendedor) || "No asignado"}
                  </div>
                </div>
              </div>
            )}

            {/* 🔥 SECCIÓN DE COMPROBANTE (si es transferencia) */}
            {esTransferencia && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
                  padding: "30px",
                  borderRadius: "24px",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Elemento decorativo */}
                <div style={{
                  position: "absolute",
                  top: "-50px",
                  left: "-50px",
                  width: "150px",
                  height: "150px",
                  background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)",
                  borderRadius: "50%",
                  zIndex: "0"
                }}></div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "25px",
                  position: "relative",
                  zIndex: "10"
                }}>
                  <div style={{
                    fontSize: "32px",
                    background: "linear-gradient(135deg, #3B82F6, #2563eb)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    📄
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "#2C3E50",
                        margin: "0 0 6px 0",
                      }}
                    >
                      Comprobante
                    </h2>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "15px",
                        margin: "0",
                        fontWeight: "600"
                      }}
                    >
                      Verificación de pago
                    </p>
                  </div>
                </div>
                
                <div style={{ marginBottom: "25px", position: "relative", zIndex: "10" }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    background: "rgba(248, 250, 252, 0.8)",
                    padding: "20px",
                    borderRadius: "14px",
                    border: "1px solid rgba(229, 231, 235, 0.4)",
                    backdropFilter: "blur(5px)"
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: "13px", 
                        color: "#64748b", 
                        fontWeight: "700", 
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "1px"
                      }}>
                        Método de Pago
                      </div>
                      <div style={{ 
                        fontSize: "15px", 
                        color: "#2C3E50", 
                        fontWeight: "800",
                        background: "linear-gradient(135deg, #3B82F6, #2563eb)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>
                        {pedido.metodoPago}
                      </div>
                    </div>
                    {pedido.datosTarjeta && (
                      <div>
                        <div style={{ 
                          fontSize: "13px", 
                          color: "#64748b", 
                          fontWeight: "700", 
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "1px"
                        }}>
                          Datos de pago
                        </div>
                        <div style={{ 
                          fontSize: "15px", 
                          color: "#2C3E50", 
                          fontWeight: "700" 
                        }}>
                          {pedido.datosTarjeta}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setMostrarComprobante(!mostrarComprobante)}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)",
                    color: "white",
                    padding: "18px",
                    fontSize: "16px",
                    fontWeight: "800",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    marginBottom: mostrarComprobante ? "25px" : "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                    position: "relative",
                    zIndex: "10",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-4px)";
                    e.target.style.boxShadow = "0 12px 30px rgba(59, 130, 246, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                  }}
                >
                  <span style={{ fontSize: "20px" }}>
                    {mostrarComprobante ? "⬆️" : "⬇️"}
                  </span>
                  {mostrarComprobante ? "Ocultar Comprobante" : "Ver Comprobante"}
                </button>
                
                {mostrarComprobante && pedido.comprobanteUrl && (
                  <div style={{ 
                    marginTop: "25px", 
                    border: "2px solid rgba(229, 231, 235, 0.6)", 
                    borderRadius: "18px",
                    overflow: "hidden",
                    animation: "fadeIn 0.5s ease-out",
                    position: "relative",
                    zIndex: "10",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)"
                  }}>
                    <img 
                      src={pedido.comprobanteUrl} 
                      alt="Comprobante de pago"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        borderBottom: "2px solid rgba(229, 231, 235, 0.6)",
                        transition: "transform 0.4s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    />
                    <div style={{ 
                      padding: "20px", 
                      background: "rgba(248, 250, 252, 0.9)",
                      textAlign: "center",
                      backdropFilter: "blur(5px)"
                    }}>
                      <a 
                        href={pedido.comprobanteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: "#3B82F6",
                          textDecoration: "none",
                          fontWeight: "800",
                          fontSize: "15px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          transition: "all 0.3s ease",
                          background: "rgba(59, 130, 246, 0.1)",
                          padding: "12px 24px",
                          borderRadius: "12px",
                          border: "2px solid rgba(59, 130, 246, 0.2)"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(59, 130, 246, 0.2)";
                          e.target.style.gap = "15px";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "rgba(59, 130, 246, 0.1)";
                          e.target.style.gap = "10px";
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        🔗 Abrir comprobante en nueva pestaña
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA - Ancho fijo 400px con efectos */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "30px",
            width: "400px",
            position: "sticky",
            top: "30px"
          }}>
            {/* Resumen con efectos premium */}
            <div
              style={{
                background: "linear-gradient(135deg, #FF6B35 0%, #FF8C53 100%)",
                padding: "35px",
                borderRadius: "24px",
                boxShadow: "0 15px 40px rgba(255, 107, 53, 0.3)",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(255, 107, 53, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 107, 53, 0.3)";
              }}
            >
              {/* Elementos decorativos */}
              <div style={{
                position: "absolute",
                top: "-80px",
                right: "-80px",
                width: "200px",
                height: "200px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                zIndex: "0"
              }}></div>
              
              <div style={{
                position: "absolute",
                bottom: "-50px",
                left: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                zIndex: "0"
              }}></div>
              
              <div style={{ position: "relative", zIndex: "10" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "25px"
                }}>
                  <div style={{
                    fontSize: "32px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                  }}>
                    💰
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "28px",
                        fontWeight: "900",
                        color: "white",
                        margin: "0 0 6px 0",
                        letterSpacing: "-0.5px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}
                    >
                      Resumen
                    </h2>
                    <p
                      style={{
                        color: "rgba(255, 255, 255, 0.95)",
                        fontSize: "15px",
                        margin: "0",
                        fontWeight: "600",
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                      }}
                    >
                      Detalle de pagos y costos
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <span style={{ 
                    fontSize: "15px", 
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "600"
                  }}>
                    Subtotal:
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "white",
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    ${(pedido.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <span style={{ 
                    fontSize: "15px", 
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "600"
                  }}>
                    IVA (12%):
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "white",
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    ${(pedido.iva || 0).toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "25px",
                    alignItems: "center",
                    padding: "12px 0"
                  }}
                >
                  <span style={{ 
                    fontSize: "15px", 
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "600"
                  }}>
                    Método de pago:
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "white",
                      background: "rgba(255, 255, 255, 0.25)",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)"
                    }}
                  >
                    {pedido.metodoPago || "No especificado"}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "2px solid rgba(255, 255, 255, 0.4)",
                    paddingTop: "22px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "white",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }}
                  >
                    Total:
                  </span>
                  <span
                    style={{
                      fontSize: "38px",
                      fontWeight: "900",
                      color: "white",
                      textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                      letterSpacing: "-1px"
                    }}
                  >
                    ${(pedido.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información adicional - CON EFECTOS */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
                padding: "30px",
                borderRadius: "24px",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(10px)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "22px"
              }}>
                <div style={{
                  fontSize: "28px",
                  background: "linear-gradient(135deg, #64748b, #475569)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "flex",
                  alignItems: "center"
                }}>
                  ℹ️
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#2C3E50",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Información
                  </h2>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      margin: "0",
                      fontWeight: "600"
                    }}
                  >
                    Detalles adicionales del pedido
                  </p>
                </div>
              </div>
              
              <div style={{ 
                fontSize: "14px", 
                color: "#64748b", 
                lineHeight: "1.7",
                background: "rgba(248, 250, 252, 0.8)",
                padding: "22px",
                borderRadius: "14px",
                border: "1px solid rgba(229, 231, 235, 0.4)",
                maxHeight: "380px",
                overflowY: "auto",
                backdropFilter: "blur(5px)"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#64748b", 
                      fontWeight: "700", 
                      marginBottom: "6px", 
                      textTransform: "uppercase", 
                      letterSpacing: "1.5px" 
                    }}>
                      ID PEDIDO
                    </div>
                    <div style={{ 
                      fontSize: "15px", 
                      color: "#2C3E50", 
                      fontWeight: "800",
                      background: "rgba(255, 107, 53, 0.1)",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      display: "inline-block",
                      border: "2px solid rgba(255, 107, 53, 0.2)"
                    }}>
                      {pedido.idPedido}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#64748b", 
                      fontWeight: "700", 
                      marginBottom: "6px", 
                      textTransform: "uppercase", 
                      letterSpacing: "1.5px" 
                    }}>
                      FECHA CREACIÓN
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#2C3E50", 
                      fontWeight: "700",
                      background: "rgba(248, 250, 252, 0.8)",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "2px solid rgba(229, 231, 235, 0.4)"
                    }}>
                      {new Date(pedido.fechaPedido || pedido.fecha).toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#64748b", 
                      fontWeight: "700", 
                      marginBottom: "6px", 
                      textTransform: "uppercase", 
                      letterSpacing: "1.5px" 
                    }}>
                      ESTADO DEL PAGO
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#2C3E50", 
                      fontWeight: "800",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      background: pedido.estadoPago === "PAGADO" ? 
                                "linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.1))" : 
                                pedido.estadoPago === "PENDIENTE" ? 
                                "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.1))" : 
                                pedido.estadoPago === "COMPLETADO" ? 
                                "linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.1))" : 
                                "linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      border: `2px solid ${pedido.estadoPago === "PAGADO" ? "rgba(52, 211, 153, 0.3)" : 
                              pedido.estadoPago === "PENDIENTE" ? "rgba(245, 158, 11, 0.3)" : 
                              pedido.estadoPago === "COMPLETADO" ? "rgba(52, 211, 153, 0.3)" : "rgba(229, 231, 235, 0.4)"}`
                    }}>
                      {pedido.estadoPago || "PENDIENTE"}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#64748b", 
                      fontWeight: "700", 
                      marginBottom: "6px", 
                      textTransform: "uppercase", 
                      letterSpacing: "1.5px" 
                    }}>
                      ESTADO DEL PEDIDO
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#2C3E50", 
                      fontWeight: "800",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      background: pedido.estadoPedido === "COMPLETADO" ? 
                                "linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.1))" : 
                                pedido.estadoPedido === "PENDIENTE" ? 
                                "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.1))" : 
                                "linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      border: `2px solid ${pedido.estadoPedido === "COMPLETADO" ? "rgba(52, 211, 153, 0.3)" : 
                              pedido.estadoPedido === "PENDIENTE" ? "rgba(245, 158, 11, 0.3)" : "rgba(229, 231, 235, 0.4)"}`
                    }}>
                      {pedido.estadoPedido || "PENDIENTE"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes floatCircle {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          20% { 
            transform: translate(25px, -30px) scale(1.1); 
          }
          40% { 
            transform: translate(-20px, 25px) scale(0.9); 
          }
          60% { 
            transform: translate(15px, 20px) scale(1.05); 
          }
          80% { 
            transform: translate(-25px, -20px) scale(0.95); 
          }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.8;
          }
        }
        
        * { 
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
          overflow-x: hidden;
        }
        
        button {
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          outline: none;
          border: none;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
          margin: 0;
        }
        
        p, span, div, input, textarea {
          font-family: 'Inter', sans-serif;
        }
        
        /* Scrollbar personalizada premium */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.8);
          border-radius: 8px;
          margin: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FF6B35, #8B5CF6);
          border-radius: 8px;
          border: 2px solid rgba(241, 245, 249, 0.8);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #FF8C53, #7C3AED);
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          
          .right-column {
            width: 100% !important;
            position: static !important;
          }
          
          .grid-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 32px !important;
          }
          
          h2 {
            fontSize: 24px !important;
          }
          
          .header-section {
            padding: 25px !important;
          }
          
          .button-group {
            flex-direction: column !important;
          }
          
          .product-section, .state-section {
            height: auto !important;
            min-height: 400px !important;
          }
        }
        
        @media (max-width: 480px) {
          .main-container {
            padding: 20px 15px !important;
          }
          
          h1 {
            font-size: 28px !important;
          }
          
          h2 {
            fontSize: 22px !important;
          }
          
          .back-button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        
        /* Mejoras de rendimiento */
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Transiciones suaves para todos los elementos */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        /* Estilos para enlaces */
        a {
          text-decoration: none;
          color: inherit;
        }
        
        /* Efecto de brillo en hover para botones */
        button:hover {
          filter: brightness(1.1);
        }
        
        /* Efecto de profundidad para tarjetas */
        .card-depth {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card-depth:hover {
          transform: translateY(-5px);
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)";
        }
        
        /* Gradientes animados */
        .animated-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
      `}</style>
    </div>
  );
}