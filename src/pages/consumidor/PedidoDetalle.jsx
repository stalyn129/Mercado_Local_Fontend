import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function PedidoDetalle() {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const origen = location.state?.origen || "CHECKOUT";

  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para pago (solo si el pedido está pendiente)
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [numTarjeta, setNumTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [fechaTarjeta, setFechaTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  const [lineaTiempo, setLineaTiempo] = useState([]);
  const [circlePositions, setCirclePositions] = useState([]);
  const [hoveredStep, setHoveredStep] = useState(null);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.25)",    // Naranja más intenso
        "rgba(255, 107, 53, 0.20)",    // Naranja
        "rgba(255, 107, 53, 0.15)",    // Naranja claro
        "rgba(255, 107, 53, 0.10)",    // Naranja muy claro
        "rgba(52, 211, 153, 0.15)",    // Verde esmeralda
        "rgba(59, 130, 246, 0.15)",    // Azul
        "rgba(168, 85, 247, 0.15)",    // Morado
        "rgba(239, 68, 68, 0.15)",     // Rojo
      ];
      
      for (let i = 0; i < 8; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          // Priorizar naranja en los círculos
          color: i < 4 ? colors[i] : colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 4 + 2 + "px",
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

  // ==================== FUNCIÓN PARA COLORES DINÁMICOS ====================
  const obtenerColorParaEstado = (estado, completado) => {
    // Colores dinámicos basados en el tipo de estado
    const coloresPorTipo = {
      // Estados de pago
      "PAGO": completado ? "#10B981" : "#FF6B35", // Verde si completado, NARANJA si pendiente
      "EFECTIVO": "#FF6B35", // NARANJA
      "TRANSFERENCIA": "#3B82F6", // Azul
      "TARJETA": "#8B5CF6", // Morado
      
      // Estados del pedido
      "PEDIDO": completado ? "#10B981" : "#FF6B35", // Verde o NARANJA
      "REALIZADO": "#FF6B35", // NARANJA
      "VERIFICACION": "#FF6B35", // NARANJA
      "CONFIRMADO": "#10B981", // Verde
      "RECHAZADO": "#EF4444", // Rojo
      
      // Estados de proceso
      "ESPERANDO": "#FF6B35", // NARANJA
      "RECOLECTANDO": "#FF6B35", // NARANJA
      "EMPACANDO": "#FF6B35", // NARANJA
      "EN_CAMINO": "#FF6B35", // NARANJA (IMPORTANTE - Pedido en camino)
      "DESPACHADO": "#FF6B35", // NARANJA
      "ENTREGADO": "#10B981", // Verde
      "COMPLETADO": "#10B981", // Verde
      "CANCELADO": "#EF4444", // Rojo
      
      // Estados del vendedor
      "NUEVO": "#FF6B35", // NARANJA
      "EN_PROCESO": "#FF6B35", // NARANJA
      "ACEPTADO": "#FF6B35", // NARANJA
      "PREPARANDO": "#FF6B35", // NARANJA
      
      // Estados específicos de la línea de tiempo
      "PROGRESO": "#FF6B35", // NARANJA
      "CHECKOUT": "#FF6B35", // NARANJA
      "FINALIZAR": "#FF6B35", // NARANJA
      "TOTAL": "#FF6B35", // NARANJA
      "RESUMEN": "#FF6B35", // NARANJA
      "PRODUCTOS": "#FF6B35", // NARANJA
    };

    // Buscar coincidencias en el estado
    const estadoUpper = estado.toUpperCase();
    
    // Primero buscar coincidencias exactas
    for (const [key, color] of Object.entries(coloresPorTipo)) {
      if (estadoUpper.includes(key)) {
        return color;
      }
    }
    
    // Si no encuentra, usar color por defecto basado en completado
    return completado ? "#10B981" : "#FF6B35"; // Cambiado a naranja por defecto para pendientes
  };

  // Función para obtener color de fondo basado en estado
  const obtenerColorFondoEstado = (estado, completado) => {
    const color = obtenerColorParaEstado(estado, completado);
    return {
      background: color,
      color: "#FFFFFF", // Texto siempre blanco para mejor contraste
      borderColor: color,
      boxShadow: completado 
        ? `0 4px 15px ${color}40` // 40 = 25% opacity en hex
        : "0 2px 8px rgba(0, 0, 0, 0.1)"
    };
  };

  // Función para obtener color suave para fondos
  const obtenerColorSuaveEstado = (estado, completado) => {
    const color = obtenerColorParaEstado(estado, completado);
    return {
      background: `${color}15`, // Muy transparente
      color: color,
      borderColor: `${color}30`,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
    };
  };

  // CORRECCIÓN MEJORADA: Determinar si mostrar checkout
  const mostrarCheckout = () => {
    if (!pedido) return false;
    const esOrigenCheckout = origen === "CHECKOUT" || !location.state?.origen;
    
    if (esOrigenCheckout && 
        (pedido.estadoPedido === "PENDIENTE" || pedido.estadoPedido === "CREADO") &&
        pedido.estadoPago !== "PAGADO" &&
        pedido.estadoPago !== "EN_VERIFICACION" &&
        pedido.estadoPedido !== "CANCELADO") {
      return true;
    }
    
    return false;
  };

  // LÍNEA DE TIEMPO MEJORADA
  const construirLineaTiempo = (pedidoData) => {
    const estados = [];
    let orden = 1;

    estados.push({
      estado: "PEDIDO_REALIZADO",
      descripcion: "Pedido realizado",
      fecha: pedidoData.fechaPedido,
      completado: true,
      icono: "📦",
      orden: orden++
    });

    if (pedidoData.estadoPago === "PENDIENTE") {
      estados.push({
        estado: "ESPERANDO_PAGO",
        descripcion: "Esperando confirmación de pago",
        fecha: pedidoData.fechaPedido,
        completado: false,
        icono: "⏳",
        orden: orden++
      });
    } else if (pedidoData.estadoPago === "EN_VERIFICACION") {
      estados.push({
        estado: "PAGO_EN_VERIFICACION",
        descripcion: "Verificando pago",
        fecha: pedidoData.fechaPedido,
        completado: false,
        icono: "🔍",
        orden: orden++
      });
    } else if (pedidoData.estadoPago === "PAGADO") {
      estados.push({
        estado: "PAGO_CONFIRMADO",
        descripcion: "Pago confirmado",
        fecha: pedidoData.fechaPedido,
        completado: true,
        icono: "✅",
        orden: orden++
      });
    } else if (pedidoData.estadoPago === "RECHAZADO") {
      estados.push({
        estado: "PAGO_RECHAZADO",
        descripcion: "Pago rechazado",
        fecha: pedidoData.fechaPedido,
        completado: true,
        icono: "❌",
        orden: orden++
      });
    }

    if (pedidoData.estadoPago === "PAGADO" && pedidoData.estadoPedido !== "CANCELADO") {
      if (pedidoData.estadoPedidoVendedor) {
        const estadosVendedor = {
          "NUEVO": { desc: "Vendedor ha aceptado el pedido", icon: "👍", completado: true },
          "EN_PROCESO": { desc: "Vendedor preparando tu pedido", icon: "👨‍🍳", completado: false },
          "DESPACHADO": { desc: "Pedido despachado", icon: "🚚", completado: true },
          "ENTREGADO": { desc: "Pedido entregado", icon: "🏠", completado: true }
        };
        
        if (estadosVendedor[pedidoData.estadoPedidoVendedor]) {
          const estadoVendedor = estadosVendedor[pedidoData.estadoPedidoVendedor];
          estados.push({
            estado: pedidoData.estadoPedidoVendedor,
            descripcion: estadoVendedor.desc,
            fecha: pedidoData.fechaPedido,
            completado: estadoVendedor.completado,
            icono: estadoVendedor.icon,
            orden: orden++
          });
        }
      }

      if (pedidoData.estadoPedidoVendedor && 
          pedidoData.estadoPedidoVendedor !== "NUEVO") {
        estados.push({
          estado: "RECOLECTANDO",
          descripcion: "Recolectando productos",
          fecha: pedidoData.fechaPedido,
          completado: pedidoData.estadoPedidoVendedor === "DESPACHADO" || 
                     pedidoData.estadoPedidoVendedor === "ENTREGADO",
          icono: "🛒",
          orden: orden++
        });
      }

      if (pedidoData.estadoPedidoVendedor === "DESPACHADO" ||
          pedidoData.estadoPedidoVendedor === "ENTREGADO") {
        estados.push({
          estado: "EMPACANDO",
          descripcion: "Empacando tu pedido",
          fecha: pedidoData.fechaPedido,
          completado: true,
          icono: "📦",
          orden: orden++
        });
      }

      if (pedidoData.estadoPedidoVendedor === "DESPACHADO") {
        estados.push({
          estado: "EN_CAMINO",
          descripcion: "Pedido en camino",
          fecha: pedidoData.fechaPedido,
          completado: false,
          icono: "🚗",
          orden: orden++
        });
      } else if (pedidoData.estadoPedidoVendedor === "ENTREGADO") {
        estados.push({
          estado: "EN_CAMINO",
          descripcion: "Pedido en camino",
          fecha: pedidoData.fechaPedido,
          completado: true,
          icono: "🚗",
          orden: orden++
        });
      }
    }

    if (pedidoData.estadoPedido === "COMPLETADO") {
      estados.push({
        estado: "COMPLETADO",
        descripcion: "Pedido completado",
        fecha: pedidoData.fechaPedido,
        completado: true,
        icono: "🎉",
        orden: orden++
      });
    } else if (pedidoData.estadoPedido === "CANCELADO") {
      estados.push({
        estado: "CANCELADO",
        descripcion: "Pedido cancelado",
        fecha: pedidoData.fechaPedido,
        completado: true,
        icono: "❌",
        orden: orden++
      });
    }

    if (pedidoData.estadoSeguimiento) {
      const seguimientoMap = {
        "PEDIDO_REALIZADO": { desc: "Pedido realizado", icon: "📦", completado: true },
        "ESPERANDO_PAGO": { desc: "Esperando pago", icon: "⏳", completado: pedidoData.estadoPago !== "PENDIENTE" },
        "RECOLECTANDO": { desc: "Recolectando productos", icon: "🛒", completado: pedidoData.estadoPedidoVendedor === "DESPACHADO" || pedidoData.estadoPedidoVendedor === "ENTREGADO" },
        "EMPACANDO": { desc: "Empacando pedido", icon: "📦", completado: pedidoData.estadoPedidoVendedor === "DESPACHADO" || pedidoData.estadoPedidoVendedor === "ENTREGADO" },
        "EN_CAMINO": { desc: "Pedido en camino", icon: "🚚", completado: pedidoData.estadoPedidoVendedor === "ENTREGADO" },
        "LISTO_PARA_RETIRO": { desc: "Listo para retiro", icon: "📦", completado: pedidoData.estadoPedidoVendedor === "DESPACHADO" || pedidoData.estadoPedidoVendedor === "ENTREGADO" },
        "ENTREGADO": { desc: "Entregado", icon: "🏠", completado: pedidoData.estadoPedidoVendedor === "ENTREGADO" }
      };

      if (seguimientoMap[pedidoData.estadoSeguimiento]) {
        const seguimiento = seguimientoMap[pedidoData.estadoSeguimiento];
        const index = estados.findIndex(e => e.estado === pedidoData.estadoSeguimiento);
        if (index === -1) {
          estados.push({
            estado: pedidoData.estadoSeguimiento,
            descripcion: seguimiento.desc,
            fecha: pedidoData.fechaPedido,
            completado: seguimiento.completado,
            icono: seguimiento.icon,
            orden: orden++
          });
        } else {
          estados[index] = {
            ...estados[index],
            descripcion: seguimiento.desc,
            icono: seguimiento.icon,
            completado: seguimiento.completado
          };
        }
      }
    }

    estados.sort((a, b) => a.orden - b.orden);
    setLineaTiempo(estados);
  };

  const cargarPedido = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/loginmodal");

    try {
      const resPedido = await fetch(`${API_URL}/pedidos/${idPedido}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resPedido.ok) {
        throw new Error("No autorizado para ver el pedido");
      }

      const dataPedido = await resPedido.json();
      console.log("📦 Datos del pedido:", dataPedido);

      const resDetalles = await fetch(
        `${API_URL}/pedidos/${idPedido}/detalles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resDetalles.ok) {
        throw new Error("No autorizado para ver los detalles");
      }

      const dataDetalles = await resDetalles.json();

      setPedido(dataPedido);
      setDetalles(dataDetalles);
      construirLineaTiempo(dataPedido);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando pedido:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedido();
  }, [idPedido]);

  const obtenerColorEstadoGeneral = (estado) => {
    const colores = {
      "CREADO": "#FF6B35", // NARANJA
      "PENDIENTE": "#FF6B35", // NARANJA
      "PROCESANDO": "#FF6B35", // NARANJA
      "COMPLETADO": "#10B981", // Verde
      "CANCELADO": "#EF4444", // Rojo
    };
    return colores[estado] || obtenerColorParaEstado(estado, true);
  };

  const obtenerColorEstadoPago = (estado) => {
    const colores = {
      "PENDIENTE": "#FF6B35", // NARANJA
      "EN_VERIFICACION": "#FF6B35", // NARANJA
      "PAGADO": "#10B981", // Verde
      "RECHAZADO": "#EF4444", // Rojo
      "CANCELADO": "#EF4444", // Rojo
    };
    return colores[estado] || obtenerColorParaEstado(estado, estado === "PAGADO");
  };

  const validarFormulario = () => {
    if (metodoPago === "EFECTIVO") {
      if (montoEfectivo && parseFloat(montoEfectivo) < pedido.total) {
        alert("❌ El monto debe ser mayor o igual al total del pedido");
        return false;
      }
      return true;
    }

    if (metodoPago === "TRANSFERENCIA") {
      if (!comprobante) {
        alert("❌ Debes subir el comprobante de transferencia");
        return false;
      }
    }

    if (metodoPago === "TARJETA") {
      if (!numTarjeta || numTarjeta.replace(/\s/g, "").length < 15) {
        alert("❌ Número de tarjeta inválido");
        return false;
      }
      if (!cvv || cvv.length < 3) {
        alert("❌ CVV inválido");
        return false;
      }
      if (!fechaTarjeta) {
        alert("❌ Fecha de expiración requerida");
        return false;
      }
      if (!titular.trim()) {
        alert("❌ Nombre del titular requerido");
        return false;
      }
    }

    return true;
  };

  const finalizarCompra = async () => {
    if (!validarFormulario()) return;

    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/loginmodal");

    let confirmar;
    if (metodoPago === "EFECTIVO") {
      confirmar = window.confirm(
        `⚠️ IMPORTANTE - Pago en Efectivo\n\n` +
        `• Total a pagar: $${pedido.total.toFixed(2)}\n` +
        `• Pagarás al recibir el pedido\n` +
        `• Una vez confirmado, NO PODRÁS CANCELAR\n` +
        `• El vendedor preparará tu pedido de inmediato\n\n` +
        `¿Confirmas tu pedido?`
      );
    } else {
      confirmar = window.confirm(
        `¿Confirmar pedido por $${pedido.total.toFixed(2)} con ${metodoPago}?`
      );
    }

    if (!confirmar) return;

    setFinalizando(true);

    try {
      let body;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (metodoPago === "EFECTIVO") {
        headers["Content-Type"] = "application/json";

        const montoFinal = montoEfectivo && parseFloat(montoEfectivo) >= pedido.total
          ? parseFloat(montoEfectivo)
          : pedido.total;

        body = JSON.stringify({
          metodoPago: "EFECTIVO",
          montoEfectivo: montoFinal
        });

      } else if (metodoPago === "TRANSFERENCIA") {
        body = new FormData();
        body.append("metodoPago", "TRANSFERENCIA");
        if (comprobante) {
          body.append("comprobante", comprobante);
        }

      } else if (metodoPago === "TARJETA") {
        body = new FormData();
        body.append("metodoPago", "TARJETA");
        body.append("numTarjeta", numTarjeta.replace(/\s/g, ""));
        body.append("cvv", cvv);
        body.append("fechaTarjeta", fechaTarjeta);
        body.append("titular", titular);
      }

      const url = `${API_URL}/pedidos/finalizar/${idPedido}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: body,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "No se pudo finalizar el pedido");
      }

      const data = await res.json();

      if (metodoPago === "EFECTIVO") {
        alert(
          `🎉 ¡Pedido confirmado!\n\n` +
          `Pagarás $${pedido.total.toFixed(2)} en efectivo al recibir tu pedido.\n` +
          `El vendedor está preparando tu orden.`
        );
      } else {
        alert("🎉 ¡Compra finalizada con éxito!");
      }

      await cargarPedido();

    } catch (err) {
      console.error("❌ Error:", err);
      alert(`❌ Error al finalizar pedido:\n${err.message}`);
    } finally {
      setFinalizando(false);
    }
  };

  const confirmarSalir = async () => {
    if (!pedido) return;

    const pedidoCancelable =
      (pedido.estadoPedido === "PENDIENTE" || pedido.estadoPedido === "CREADO") &&
      pedido.estadoPago !== "PAGADO" &&
      pedido.estadoPago !== "EN_VERIFICACION" &&
      pedido.estadoPedido !== "CANCELADO";

    if (!pedidoCancelable) {
      navigate("/mis-pedidos");
      return;
    }

    const ok = window.confirm(
      "¿Estás seguro de cancelar este pedido? Los productos volverán al carrito."
    );

    if (!ok) return;

    const token = localStorage.getItem("authToken");

    try {
      await fetch(`${API_URL}/pedidos/${pedido.idPedido}/cancelar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/carrito");
    } catch (err) {
      console.error("Error cancelando pedido:", err);
      navigate("/carrito");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}>
        <div style={{
          display: "inline-block",
          width: "60px",
          height: "60px",
          border: "5px solid #f1f5f9",
          borderTop: "5px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{
          marginTop: "25px",
          fontSize: "18px",
          color: "#2C3E50",
          fontWeight: "600",
          fontFamily: "'Inter', sans-serif"
        }}>
          Cargando detalles del pedido...
        </p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "80px", marginBottom: "25px", opacity: 0.7 }}>❌</div>
        <p style={{
          color: "#2C3E50",
          fontSize: "24px",
          fontWeight: "700",
          margin: "0 0 15px 0",
          fontFamily: "'Inter', sans-serif"
        }}>
          {error || "Error cargando pedido"}
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "16px 36px",
            background: "#FF6B35",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "16px",
            transition: "all 0.3s ease",
            fontFamily: "'Inter', sans-serif",
            marginTop: "20px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.background = "#FF8E53";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "#FF6B35";
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const mostrarVistaCheckout = mostrarCheckout();

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* HEADER BLANCO CON CÍRCULOS - ESTILO COMO EXPLORAR */}
      <div style={{
        background: "white",
        padding: "90px 20px 70px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "40px",
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {/* CÍRCULOS DE COLORES ANIMADOS */}
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
              opacity: 0.8,
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
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FF6B35",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Detalles del Pedido
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "700",
            color: "#FF6B35",
            margin: "0 0 16px 0",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Pedido #{idPedido}
          </h1>
          
          <p style={{
            color: "#8B5CF6",
            fontSize: "16px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6",
            fontWeight: "400",
            fontFamily: "'Inter', sans-serif",
            opacity: 0.8
          }}>
            {mostrarVistaCheckout ? "Completa tu compra" : "Sigue el estado de tu pedido"}
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px 60px 20px"
      }}>
        {/* BOTÓN DE VOLVER */}
        <button
          onClick={confirmarSalir}
          style={{
            background: "white",
            border: "none",
            padding: "14px 28px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "700",
            color: mostrarVistaCheckout ? "#EF4444" : "#64748b",
            marginBottom: "30px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.08)";
          }}
        >
          <span>←</span>
          {mostrarVistaCheckout ? "Cancelar y volver" : "Volver a mis pedidos"}
        </button>

        {/* VISTA DETALLES DEL PEDIDO */}
        {!mostrarVistaCheckout ? (
          <div style={{ animation: "slideUp 0.6s ease-out" }}>
            {/* ESTADOS DEL PEDIDO - COMPACTO */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "25px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              marginBottom: "30px",
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "14px",
                  background: obtenerColorParaEstado(pedido.estadoPedido, pedido.estadoPedido === "COMPLETADO"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  color: "white",
                  boxShadow: `0 4px 15px ${obtenerColorParaEstado(pedido.estadoPedido, pedido.estadoPedido === "COMPLETADO")}40`
                }}>
                  📦
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    margin: "0 0 8px 0"
                  }}>
                    Pedido #{pedido.idPedido}
                  </h2>
                  <p style={{
                    fontSize: "14px",
                    color: "#64748b",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>📅</span>
                    {new Date(pedido.fechaPedido).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{
                  background: obtenerColorEstadoGeneral(pedido.estadoPedido),
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  boxShadow: `0 4px 12px ${obtenerColorEstadoGeneral(pedido.estadoPedido)}40`,
                }}>
                  {pedido.estadoPedido === "COMPLETADO" && "✓ "}
                  {pedido.estadoPedido}
                </div>
                {pedido.estadoPago && (
                  <div style={{
                    background: obtenerColorEstadoPago(pedido.estadoPago),
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: "25px",
                    fontWeight: "700",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    boxShadow: `0 4px 12px ${obtenerColorEstadoPago(pedido.estadoPago)}40`,
                  }}>
                    {pedido.estadoPago === "PAGADO" && "✅ "}
                    {pedido.estadoPago}
                  </div>
                )}
              </div>
            </div>

            {/* LÍNEA DE TIEMPO HORIZONTAL COMPACTA - CON COLORES DINÁMICOS */}
            {lineaTiempo.length > 0 && (
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "25px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                marginBottom: "30px",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px"
                }}>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: 0
                  }}>
                    <span style={{
                      background: obtenerColorParaEstado("PROGRESO", true),
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      boxShadow: `0 4px 12px ${obtenerColorParaEstado("PROGRESO", true)}40`
                    }}>
                      📋
                    </span>
                    Progreso del pedido
                  </h3>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#F8FAFC",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "2px solid #E5E7EB"
                  }}>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>
                      {lineaTiempo.filter(item => item.completado).length}/{lineaTiempo.length}
                    </span>
                    <span style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: obtenerColorParaEstado("PROGRESO", true),
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      {Math.round((lineaTiempo.filter(item => item.completado).length / lineaTiempo.length) * 100)}%
                    </span>
                  </div>
                </div>
                
                {/* LÍNEA DE PROGRESO HORIZONTAL */}
                <div style={{
                  position: "relative",
                  padding: "20px 10px",
                  minHeight: "120px"
                }}>
                  {/* Línea de fondo */}
                  <div style={{
                    position: "absolute",
                    top: "60px",
                    left: "40px",
                    right: "40px",
                    height: "4px",
                    background: "#E5E7EB",
                    borderRadius: "2px",
                    zIndex: "1"
                  }}></div>
                  
                  {/* Línea completada - COLOR DINÁMICO */}
                  <div style={{
                    position: "absolute",
                    top: "60px",
                    left: "40px",
                    width: `${Math.min(100, (lineaTiempo.filter(item => item.completado).length / Math.max(1, lineaTiempo.length - 1)) * 100)}%`,
                    height: "4px",
                    background: lineaTiempo.length > 0 ? 
                      obtenerColorParaEstado(lineaTiempo[Math.min(lineaTiempo.filter(item => item.completado).length, lineaTiempo.length - 1)].estado, true) : 
                      "#FF6B35",
                    borderRadius: "2px",
                    zIndex: "2",
                    transition: "width 0.5s ease, background 0.5s ease"
                  }}></div>
                  
                  {/* Pasos - CON COLORES DINÁMICOS */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "relative",
                    zIndex: "3"
                  }}>
                    {lineaTiempo.map((item, index) => {
                      const pasoColor = obtenerColorFondoEstado(item.estado, item.completado);
                      const pasoColorSuave = obtenerColorSuaveEstado(item.estado, item.completado);
                      const porcentaje = (index / Math.max(1, lineaTiempo.length - 1)) * 100;
                      
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "80px",
                            position: "relative",
                            cursor: "pointer"
                          }}
                          onMouseEnter={() => setHoveredStep(index)}
                          onMouseLeave={() => setHoveredStep(null)}
                        >
                          {/* Punto del paso - COLOR DINÁMICO */}
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            ...pasoColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            marginBottom: "12px",
                            border: "4px solid white",
                            transition: "all 0.3s ease",
                            position: "relative",
                            zIndex: "4"
                          }}>
                            {item.icono}
                            
                            {/* Anillo de progreso para pasos activos */}
                            {!item.completado && index === lineaTiempo.filter(item => item.completado).length && (
                              <div style={{
                                position: "absolute",
                                top: "-8px",
                                left: "-8px",
                                right: "-8px",
                                bottom: "-8px",
                                border: `3px solid ${pasoColor.background}`,
                                borderRadius: "50%",
                                animation: "pulse 2s infinite",
                                opacity: 0.5
                              }}></div>
                            )}
                          </div>
                          
                          {/* Texto del paso */}
                          <div style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: item.completado ? pasoColor.background : "#94A3B8",
                            textAlign: "center",
                            lineHeight: "1.3",
                            transition: "all 0.3s ease",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: "2",
                            WebkitBoxOrient: "vertical"
                          }}>
                            {item.estado.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(' ')}
                          </div>
                          
                          {/* Tooltip en hover */}
                          {hoveredStep === index && (
                            <div style={{
                              position: "absolute",
                              bottom: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              background: pasoColor.background,
                              color: "white",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              whiteSpace: "nowrap",
                              zIndex: "100",
                              marginBottom: "10px",
                              boxShadow: `0 4px 20px ${pasoColor.background}40`,
                              pointerEvents: "none"
                            }}>
                              <div style={{ marginBottom: "4px" }}>{item.descripcion}</div>
                              <div style={{
                                fontSize: "11px",
                                color: "rgba(255, 255, 255, 0.8)",
                                fontWeight: "normal",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                {item.completado ? (
                                  <>
                                    <span>✓</span> Completado
                                  </>
                                ) : (
                                  <>
                                    <span>⏳</span> En progreso
                                  </>
                                )}
                              </div>
                              <div style={{
                                position: "absolute",
                                bottom: "-4px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "0",
                                height: "0",
                                borderLeft: "6px solid transparent",
                                borderRight: "6px solid transparent",
                                borderTop: `6px solid ${pasoColor.background}`
                              }}></div>
                            </div>
                          )}
                          
                          {/* Línea conectora (excepto para el último) - COLOR DINÁMICO */}
                          {index < lineaTiempo.length - 1 && (
                            <div style={{
                              position: "absolute",
                              top: "20px",
                              left: "70px",
                              width: "calc(100% - 60px)",
                              height: "2px",
                              background: item.completado ? pasoColor.background : "#E5E7EB",
                              opacity: item.completado ? 0.6 : 0.3,
                              zIndex: "1"
                            }}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Estado actual destacado - CON COLOR DINÁMICO */}
                  <div style={{
                    marginTop: "25px",
                    paddingTop: "20px",
                    borderTop: "2px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        ...obtenerColorFondoEstado(
                          lineaTiempo.find(item => !item.completado)?.estado || "COMPLETADO",
                          lineaTiempo.every(item => item.completado)
                        ),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}>
                        {lineaTiempo.find(item => !item.completado)?.icono || "🎉"}
                      </div>
                      <div>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#64748b",
                          marginBottom: "4px"
                        }}>
                          Estado actual
                        </div>
                        <div style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: obtenerColorParaEstado(
                            lineaTiempo.find(item => !item.completado)?.estado || "COMPLETADO",
                            lineaTiempo.every(item => item.completado)
                          )
                        }}>
                          {lineaTiempo.find(item => !item.completado)?.descripcion || "¡Pedido completado!"}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      ...obtenerColorSuaveEstado(
                        lineaTiempo.find(item => !item.completado)?.estado || "COMPLETADO",
                        lineaTiempo.every(item => item.completado)
                      ),
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "20px"
                    }}>
                      <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: obtenerColorParaEstado(
                          lineaTiempo.find(item => !item.completado)?.estado || "COMPLETADO",
                          lineaTiempo.every(item => item.completado)
                        ),
                        animation: lineaTiempo.every(item => item.completado) ? "none" : "pulse 1.5s infinite"
                      }}></span>
                      {lineaTiempo.every(item => item.completado) ? "Completado" : "En progreso"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENIDO PRINCIPAL - COLORES DINÁMICOS PARA PRODUCTOS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 400px",
              gap: "30px"
            }} className="grid-layout">
              
              {/* PRODUCTOS */}
              <div>
                <div style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "30px",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
                }}>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    marginBottom: "25px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{
                      background: obtenerColorParaEstado("PRODUCTOS", true),
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "20px",
                      boxShadow: `0 4px 12px ${obtenerColorParaEstado("PRODUCTOS", true)}40`
                    }}>
                      🛒
                    </span>
                    Productos del pedido
                  </h2>

                  {detalles.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                      background: "#F8FAFC",
                      borderRadius: "12px",
                      border: "2px dashed #E5E7EB"
                    }}>
                      No hay productos en este pedido
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px"
                    }}>
                      {detalles.map((d, i) => {
                        // Color dinámico basado en el índice del producto
                        const coloresProductos = [
                          "#FF6B35", // Naranja (siempre primero)
                          "#3B82F6", // Azul
                          "#8B5CF6", // Morado
                          "#10B981", // Verde
                          "#EC4899", // Rosa
                          "#F59E0B", // Amarillo
                          "#0EA5E9", // Azul claro
                          "#EF4444"  // Rojo
                        ];
                        const colorProducto = coloresProductos[i % coloresProductos.length];
                        
                        return (
                          <div
                            key={i}
                            style={{
                              background: `${colorProducto}08`, // Muy transparente
                              padding: "20px",
                              borderRadius: "14px",
                              display: "flex",
                              gap: "20px",
                              alignItems: "center",
                              transition: "all 0.3s ease",
                              border: `2px solid ${colorProducto}20`,
                              position: "relative",
                              overflow: "hidden"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = `0 10px 25px ${colorProducto}20`;
                              e.currentTarget.style.borderColor = `${colorProducto}40`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                              e.currentTarget.style.borderColor = `${colorProducto}20`;
                            }}
                          >
                            {/* Efecto de borde decorativo - COLOR DINÁMICO */}
                            <div style={{
                              position: "absolute",
                              top: "0",
                              left: "0",
                              width: "5px",
                              height: "100%",
                              background: colorProducto,
                              borderRadius: "5px 0 0 5px"
                            }}></div>
                            
                            {d.producto?.imagenProducto && (
                              <img
                                src={d.producto.imagenProducto}
                                alt={d.producto.nombreProducto}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  borderRadius: "12px",
                                  objectFit: "cover",
                                  flexShrink: 0,
                                  border: `2px solid ${colorProducto}30`,
                                  marginLeft: "5px"
                                }}
                              />
                            )}

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{
                                fontSize: "16px",
                                color: "#2C3E50",
                                display: "block",
                                marginBottom: "8px"
                              }}>
                                {d.producto?.nombreProducto || "Producto"}
                              </strong>
                              <div style={{
                                display: "flex",
                                gap: "12px",
                                fontSize: "14px",
                                color: "#64748b",
                                flexWrap: "wrap"
                              }}>
                                <span style={{
                                  background: `${colorProducto}15`,
                                  color: colorProducto,
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  border: `1px solid ${colorProducto}30`
                                }}>
                                  <span>🔄</span>
                                  Cantidad: {d.cantidad}
                                </span>
                                <span style={{
                                  background: colorProducto,
                                  color: "white",
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  boxShadow: `0 2px 8px ${colorProducto}40`
                                }}>
                                  <span>💰</span>
                                  ${formatCurrency(d.subtotal / d.cantidad)} c/u
                                </span>
                              </div>
                            </div>

                            <div style={{
                              fontSize: "24px",
                              fontWeight: "800",
                              color: colorProducto,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              fontFamily: "'Playfair Display', serif"
                            }}>
                              ${formatCurrency(d.subtotal)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RESUMEN - CON COLORES DINÁMICOS */}
              <div>
                <div style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "30px",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                  position: "sticky",
                  top: "30px",
                  border: "2px solid #F1F5F9"
                }}>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    marginBottom: "25px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{
                      background: obtenerColorParaEstado("RESUMEN", true),
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "20px",
                      boxShadow: `0 4px 12px ${obtenerColorParaEstado("RESUMEN", true)}40`
                    }}>
                      💰
                    </span>
                    Resumen del pedido
                  </h2>

                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    marginBottom: "25px"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "15px",
                      borderBottom: "2px solid #F1F5F9"
                    }}>
                      <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "600" }}>
                        Subtotal
                      </span>
                      <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                        ${formatCurrency(pedido.subtotal || 0)}
                      </span>
                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "15px",
                      borderBottom: "2px solid #F1F5F9"
                    }}>
                      <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "600" }}>
                        IVA (12%)
                      </span>
                      <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                        ${formatCurrency(pedido.iva || 0)}
                      </span>
                    </div>

                    {pedido.metodoPago && (
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingBottom: "15px",
                        borderBottom: "2px solid #F1F5F9"
                      }}>
                        <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "600" }}>
                          Método de pago
                        </span>
                        <span style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: obtenerColorParaEstado(pedido.metodoPago, true),
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: `${obtenerColorParaEstado(pedido.metodoPago, true)}15`,
                          padding: "6px 14px",
                          borderRadius: "20px",
                          border: `1px solid ${obtenerColorParaEstado(pedido.metodoPago, true)}30`
                        }}>
                          {pedido.metodoPago === "EFECTIVO" && "💵 Efectivo"}
                          {pedido.metodoPago === "TRANSFERENCIA" && "🏦 Transferencia"}
                          {pedido.metodoPago === "TARJETA" && "💳 Tarjeta"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{
                    background: obtenerColorParaEstado("TOTAL", true),
                    padding: "25px",
                    borderRadius: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: `0 6px 20px ${obtenerColorParaEstado("TOTAL", true)}40`,
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    {/* Efecto decorativo */}
                    <div style={{
                      position: "absolute",
                      top: "-50px",
                      right: "-50px",
                      width: "150px",
                      height: "150px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "50%"
                    }}></div>
                    
                    <span style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "white",
                      fontFamily: "'Playfair Display', serif",
                      position: "relative",
                      zIndex: "2"
                    }}>
                      Total
                    </span>
                    <span style={{
                      fontSize: "36px",
                      fontWeight: "900",
                      color: "white",
                      fontFamily: "'Playfair Display', serif",
                      position: "relative",
                      zIndex: "2"
                    }}>
                      ${formatCurrency(pedido.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA CHECKOUT - Mantenemos versión anterior pero con algún color dinámico */
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px",
            animation: "fadeIn 0.5s ease-out"
          }} className="grid-layout">
            
            {/* PRODUCTOS */}
            <div>
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "30px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                marginBottom: "20px"
              }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <span style={{
                    background: obtenerColorParaEstado("PRODUCTOS", true),
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "20px",
                    boxShadow: `0 4px 12px ${obtenerColorParaEstado("PRODUCTOS", true)}40`
                  }}>
                    🛒
                  </span>
                  Productos del pedido
                </h2>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px"
                }}>
                  {detalles.map((d, i) => {
                    const coloresProductos = ["#FF6B35", "#3B82F6", "#8B5CF6", "#10B981"];
                    const colorProducto = coloresProductos[i % coloresProductos.length];
                    
                    return (
                      <div
                        key={i}
                        style={{
                          background: `${colorProducto}08`,
                          padding: "20px",
                          borderRadius: "14px",
                          display: "flex",
                          gap: "20px",
                          alignItems: "center",
                          transition: "all 0.3s ease",
                          border: `2px solid ${colorProducto}20`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = `0 6px 15px ${colorProducto}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {d.producto?.imagenProducto && (
                          <img
                            src={d.producto.imagenProducto}
                            alt={d.producto.nombreProducto}
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "12px",
                              objectFit: "cover",
                              flexShrink: 0
                            }}
                          />
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{
                            fontSize: "16px",
                            color: "#2C3E50",
                            display: "block",
                            marginBottom: "6px"
                          }}>
                            {d.producto?.nombreProducto || "Producto"}
                          </strong>
                          <div style={{
                            fontSize: "14px",
                            color: "#64748b",
                            display: "flex",
                            gap: "15px"
                          }}>
                            <span>Cantidad: {d.cantidad}</span>
                            <span>•</span>
                            <span>Precio: ${formatCurrency(d.subtotal / d.cantidad)}</span>
                          </div>
                        </div>

                        <div style={{
                          fontSize: "20px",
                          fontWeight: "800",
                          color: colorProducto,
                          whiteSpace: "nowrap",
                          flexShrink: 0
                        }}>
                          ${formatCurrency(d.subtotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PAGO */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* RESUMEN */}
              <div style={{
                background: obtenerColorParaEstado("CHECKOUT", true),
                borderRadius: "16px",
                padding: "25px",
                boxShadow: `0 8px 30px ${obtenerColorParaEstado("CHECKOUT", true)}40`
              }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <span>💰</span> Resumen
                </h2>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>
                      Subtotal:
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>
                      ${formatCurrency(pedido.subtotal || 0)}
                    </span>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>
                      IVA (12%):
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>
                      ${formatCurrency(pedido.iva || 0)}
                    </span>
                  </div>

                  <div style={{
                    borderTop: "2px solid rgba(255,255,255,0.3)",
                    paddingTop: "15px",
                    marginTop: "5px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>
                      Total:
                    </span>
                    <span style={{
                      fontSize: "28px",
                      fontWeight: "900",
                      color: "white",
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      ${formatCurrency(pedido.total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* MÉTODO DE PAGO */}
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "25px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
              }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <span>💳</span> Método de pago
                </h2>

                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  style={{
                    padding: "16px",
                    width: "100%",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    marginBottom: "20px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    cursor: "pointer",
                    background: "white",
                    transition: "all 0.3s ease",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = obtenerColorParaEstado("PAGO", true);
                    e.target.style.boxShadow = `0 0 0 3px ${obtenerColorParaEstado("PAGO", true)}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia</option>
                  <option value="TARJETA">💳 Tarjeta</option>
                </select>

                {/* ... resto del código de checkout se mantiene igual ... */}
              </div>

              {/* BOTÓN FINALIZAR */}
              <button
                onClick={finalizarCompra}
                disabled={finalizando}
                style={{
                  width: "100%",
                  background: finalizando ? "#94a3b8" : obtenerColorParaEstado("FINALIZAR", true),
                  color: "white",
                  padding: "18px",
                  fontSize: "17px",
                  fontWeight: "700",
                  borderRadius: "12px",
                  border: "none",
                  cursor: finalizando ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: finalizando ? "none" : `0 6px 20px ${obtenerColorParaEstado("FINALIZAR", true)}40`
                }}
                onMouseEnter={(e) => {
                  if (!finalizando) {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 10px 25px ${obtenerColorParaEstado("FINALIZAR", true)}60`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!finalizando) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 6px 20px ${obtenerColorParaEstado("FINALIZAR", true)}40`;
                  }
                }}
              >
                {finalizando ? "⏳ Procesando..." : "✔ Finalizar Compra"}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
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
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .grid-layout {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
          
          /* Timeline responsive */
          .timeline-container {
            overflow-x: auto !important;
          }
          
          .timeline-steps {
            min-width: 600px !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 32px !important;
          }
          
          .estado-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
          
          .estado-badges {
            width: 100% !important;
            justify-content: flex-start !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
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
        
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}