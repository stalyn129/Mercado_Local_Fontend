import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import Notificaciones from "../../components/Notificaciones.jsx";
import useNotification from "../../hooks/useNotification.jsx";
import API_URL from "../config/api.js";

export default function VendedorPedidoDetalle() {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);
  const [circlePositions, setCirclePositions] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [infoPago, setInfoPago] = useState(null);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [numeroPedidoVendedor, setNumeroPedidoVendedor] = useState(null);
  const [contadorPedidosVendedor, setContadorPedidosVendedor] = useState(0);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [accionModal, setAccionModal] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  
  // Usar el hook de notificaciones
  const {
    notificacion,
    setNotificacion,
    mostrarNotificacion,
    notificaciones
  } = useNotification();

  // Cargar usuario al montar
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      window.location.href = "/LoginModal";
      return;
    }
    setUser(userData);
    cargarPedidoDetalle(userData.token);
    cargarInfoPago(userData.token);
  }, [idPedido]);

  // Animación de círculos de fondo mejorada
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

  // Función para cargar información específica del pago
  const cargarInfoPago = async (token) => {
    if (!token || !idPedido) return;
    
    try {
      const res = await fetch(`${API_URL}/pedidos/${idPedido}/pago`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        setInfoPago(data);
      } else if (res.status !== 404) {
        console.log("⚠️ No se pudo cargar información adicional del pago");
      }
    } catch (err) {
      console.error("❌ Error cargando información de pago:", err);
    }
  };

  // Función para cargar detalles del pedido
  const cargarPedidoDetalle = async (token) => {
    try {
      setError(null);
      setCargando(true);
      
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.idVendedor) {
        setError("Usuario no autenticado como vendedor");
        setCargando(false);
        return;
      }

      const res = await fetch(`${API_URL}/pedidos/vendedor/detalle/${idPedido}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("No tienes permiso para ver este pedido");
        } else if (res.status === 401) {
          localStorage.removeItem("user");
          window.location.href = "/LoginModal";
          return;
        } else if (res.status === 404) {
          setError(`Pedido #${idPedido} no encontrado`);
        } else {
          setError(`Error ${res.status}: No se pudo cargar el pedido`);
        }
        setCargando(false);
        return;
      }

      const pedidoEncontrado = await res.json();

      if (pedidoEncontrado.vendedor && 
          pedidoEncontrado.vendedor.idVendedor != userData.idVendedor) {
        setError("Este pedido no pertenece a tu tienda");
        setCargando(false);
        return;
      }

      const pedidoFormateado = {
        idPedido: pedidoEncontrado.idPedido || idPedido,
        nombreCliente: pedidoEncontrado.consumidor?.usuario 
          ? `${pedidoEncontrado.consumidor.usuario.nombre} ${pedidoEncontrado.consumidor.usuario.apellido}`
          : pedidoEncontrado.nombreCliente || "Cliente sin nombre",
        fechaPedido: pedidoEncontrado.fechaPedido || pedidoEncontrado.fecha || new Date().toISOString(),
        estadoPedido: pedidoEncontrado.estadoPedido || "CREADO",
        estadoPedidoVendedor: pedidoEncontrado.estadoPedidoVendedor || "NUEVO",
        estadoPago: pedidoEncontrado.estadoPago || "PENDIENTE",
        metodoPago: pedidoEncontrado.metodoPago || "PENDIENTE",
        subtotal: pedidoEncontrado.subtotal || 0,
        iva: pedidoEncontrado.iva || 0,
        total: pedidoEncontrado.total || 0,
        comprobanteUrl: pedidoEncontrado.comprobanteUrl || null,
        fechaSubidaComprobante: pedidoEncontrado.fechaSubidaComprobante || null,
        fechaVerificacionPago: pedidoEncontrado.fechaVerificacionPago || null,
        verificadoPor: pedidoEncontrado.verificadoPor || null,
        motivoRechazo: pedidoEncontrado.motivoRechazo || null,
        idCompraUnificada: pedidoEncontrado.idCompraUnificada || null,
        notas: pedidoEncontrado.notas || null,
        direccionEnvio: pedidoEncontrado.direccionEnvio || null,
        vendedorId: pedidoEncontrado.vendedor?.idVendedor || userData.idVendedor,
        vendedorNombre: pedidoEncontrado.vendedor?.nombreEmpresa || userData.nombreEmpresa,
        consumidorId: pedidoEncontrado.consumidor?.idConsumidor,
        detalles: pedidoEncontrado.detalles || []
      };
      
      setPedido(pedidoFormateado);
      
      let productosCargados = [];
      
      if (pedidoEncontrado.detalles && Array.isArray(pedidoEncontrado.detalles)) {
        productosCargados = pedidoEncontrado.detalles.map(detalle => ({
          idDetalle: detalle.idDetalle || detalle.idDetallePedido,
          nombreProducto: detalle.producto?.nombreProducto || detalle.producto?.nombre || "Producto",
          descripcion: detalle.producto?.descripcionProducto || detalle.producto?.descripcion || "",
          precioUnitario: detalle.precioUnitario || detalle.precio || detalle.producto?.precioProducto || 0,
          cantidad: detalle.cantidad || 1,
          subtotal: detalle.subtotal || (detalle.precioUnitario || 0) * (detalle.cantidad || 1),
          imagenProducto: detalle.producto?.imagenProducto || detalle.producto?.imagenUrl || null,
          productoId: detalle.producto?.idProducto,
          vendedorProductoId: detalle.producto?.vendedor?.idVendedor
        }));
      }
      
      setProductos(productosCargados);
      
      // Cargar número secuencial
      cargarNumeroSecuencialPedido(pedidoEncontrado.idPedido || idPedido, token);
      
    } catch (err) {
      console.error("❌ Error cargando pedido:", err);
      setError("Error de conexión al cargar el pedido");
      notificaciones.error("Error", "No se pudo cargar el pedido");
    } finally {
      setCargando(false);
    }
  };

  // Cargar número secuencial del pedido
  const cargarNumeroSecuencialPedido = async (pedidoId, token) => {
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

  // Función para ejecutar la verificación de pago
  const ejecutarVerificacionPago = async (aprobado) => {
    if (!user || !pedido) return;

    setVerificando(true);

    try {
      const requestBody = {
        aprobado: aprobado,
        motivo: aprobado ? "Pago verificado correctamente por el vendedor" : motivoRechazo
      };

      const res = await fetch(`${API_URL}/pedidos/${pedido.idPedido}/verificar-pago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        const pedidoActualizado = await res.json();
        
        if (aprobado) {
          notificaciones.exito("Pago Verificado", "El pago ha sido aprobado correctamente", "check");
        } else {
          notificaciones.exito("Pago Rechazado", "Se ha notificado al cliente para que re-suba el comprobante");
        }
        
        setPedido(prev => ({
          ...prev,
          estadoPago: pedidoActualizado.estadoPago || (aprobado ? "PAGADO" : "RECHAZADO"),
          fechaVerificacionPago: pedidoActualizado.fechaVerificacionPago || new Date().toISOString(),
          motivoRechazo: pedidoActualizado.motivoRechazo || motivoRechazo,
          verificadoPor: pedidoActualizado.verificadoPor || user.idVendedor.toString()
        }));
        
        setTimeout(() => {
          cargarPedidoDetalle(user.token);
          cargarInfoPago(user.token);
        }, 1000);
        
      } else {
        const errorText = await res.text();
        let errorMessage = "";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || "Error desconocido";
        } catch {
          errorMessage = errorText;
        }
        
        notificaciones.error("Error al Verificar", errorMessage);
        
        if (res.status === 403) {
          setTimeout(() => {
            cargarPedidoDetalle(user.token);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("❌ Error de conexión al verificar pago:", err);
      notificaciones.error("Error de Conexión", "No se pudo conectar con el servidor");
    } finally {
      setVerificando(false);
      setMostrarModalConfirmacion(false);
      setMotivoRechazo("");
    }
  };

  // Función para VERIFICAR PAGO
  const verificarPago = async () => {
    if (!user || !pedido) return;

    setAccionModal("aprobar");
    setMostrarModalConfirmacion({
      titulo: "Verificar Pago",
      mensaje: "¿Estás seguro de que el pago ha sido recibido y verificado?",
    });
  };

  // Función para RECHAZAR PAGO
  const rechazarPago = async () => {
    if (!user || !pedido) return;

    setAccionModal("rechazar");
    setMostrarModalConfirmacion({
      titulo: "Rechazar Pago",
      mensaje: "Ingresa el motivo del rechazo del pago:",
      mostrarInput: true
    });
  };

  // Función para CAMBIAR ESTADO DEL PEDIDO
  const cambiarEstado = async (nuevoEstado) => {
    if (!pedido || !user) return;

    // Validar que el pago esté verificado antes de cambiar estado
    if (pedido.metodoPago === "TRANSFERENCIA" && pedido.estadoPago !== "PAGADO") {
      notificaciones.advertencia(
        "Pago No Verificado", 
        "Debes verificar el pago primero antes de cambiar el estado del pedido"
      );
      return;
    }

    const esEfectivoPendiente = pedido.metodoPago === "EFECTIVO" && pedido.estadoPago === "PENDIENTE";
    const puedeCambiarEstado = pedido.estadoPago === "PAGADO" || esEfectivoPendiente;

    if (!puedeCambiarEstado) {
      notificaciones.advertencia(
        "Pago No Verificado", 
        "El pago no está verificado. No se puede cambiar el estado."
      );
      return;
    }

    setAccionModal("cambiarEstado");
    setMostrarModalConfirmacion({
      titulo: "Cambiar Estado",
      mensaje: `¿Cambiar estado a ${mapearNombreEstado(nuevoEstado)}?`,
      nuevoEstado: nuevoEstado
    });
  };

  // Función para ejecutar el cambio de estado
  const ejecutarCambioEstado = async (nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/pedidos/vendedor/${pedido.idPedido}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          estadoPedidoVendedor: nuevoEstado
        })
      });

      if (res.ok) {
        const pedidoActualizado = await res.json();
        
        notificaciones.exito("Estado Actualizado", `El estado se ha cambiado a ${mapearNombreEstado(nuevoEstado)}`);
        
        setPedido(prev => ({
          ...prev,
          estadoPedidoVendedor: nuevoEstado,
          estadoPedido: pedidoActualizado.estadoPedido || prev.estadoPedido
        }));
        
      } else {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          notificaciones.error("Error al Cambiar Estado", errorData.message || errorData.error);
        } catch {
          notificaciones.error("Error", "No se pudo actualizar el estado");
        }
      }
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      notificaciones.error("Error de Conexión", "No se pudo conectar con el servidor");
    } finally {
      setMostrarModalConfirmacion(false);
    }
  };

  // Descargar comprobante
  const descargarComprobante = async () => {
    if (!user || !pedido) return;

    try {
      if (pedido.comprobanteUrl) {
        const url = pedido.comprobanteUrl.startsWith('http') 
          ? pedido.comprobanteUrl 
          : `${API_URL}${pedido.comprobanteUrl}`;
        
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      
      if (infoPago && infoPago.comprobanteUrl) {
        const url = infoPago.comprobanteUrl.startsWith('http')
          ? infoPago.comprobanteUrl
          : `${API_URL}${infoPago.comprobanteUrl}`;
        
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      
      notificaciones.advertencia("Sin Comprobante", "No hay comprobante disponible para este pedido");
      
    } catch (err) {
      console.error("❌ Error al descargar comprobante:", err);
      notificaciones.error("Error", "No se pudo abrir el comprobante");
    }
  };

  // Obtener próximos estados disponibles
  const obtenerProximosEstados = () => {
    if (!pedido) return [];
    
    const estadoActual = pedido.estadoPedidoVendedor;

    if (pedido.estadoPedido === "CANCELADO") {
      return [];
    }

    if (pedido.metodoPago === "TRANSFERENCIA" && pedido.estadoPago !== "PAGADO") {
      return [];
    }

    const esEfectivoPendiente = pedido.metodoPago === "EFECTIVO" && pedido.estadoPago === "PENDIENTE";
    const puedeCambiarEstado = pedido.estadoPago === "PAGADO" || esEfectivoPendiente;

    if (!puedeCambiarEstado) {
      return [];
    }

    switch (estadoActual) {
      case "NUEVO":
        return ["EN_PROCESO", "CANCELADO"];
      case "EN_PROCESO":
        return ["DESPACHADO", "CANCELADO"];
      case "DESPACHADO":
        return ["ENTREGADO"];
      case "ENTREGADO":
        return [];
      case "CANCELADO":
        return [];
      default:
        return ["NUEVO", "CANCELADO"];
    }
  };

  // Funciones helper
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

  const obtenerEstadoParaMostrar = () => {
    if (!pedido) return "Cargando...";

    if (pedido.estadoPedido === "CANCELADO" || pedido.estadoPago === "CANCELADO") {
      return "Cancelado";
    }
    
    if (pedido.estadoPago === "PENDIENTE") {
      return "Esperando pago";
    }
    
    if (pedido.estadoPago === "EN_VERIFICACION") {
      return "Verificando pago";
    }
    
    if (pedido.estadoPago === "RECHAZADO") {
      return "Pago rechazado";
    }
    
    if (pedido.estadoPago === "PAGADO") {
      return mapearNombreEstado(pedido.estadoPedidoVendedor) || "Pendiente";
    }
    
    return pedido.estadoPedido || "Pendiente";
  };

  const obtenerColorEstado = (estado) => {
    const estados = {
      "Nuevo": { 
        color: "#FF6B35", 
        bg: "rgba(255, 107, 53, 0.15)", 
        border: "#FF6B35", 
        glow: "rgba(255, 107, 53, 0.3)" 
      },
      "En Proceso": { 
        color: "#3B82F6", 
        bg: "rgba(59, 130, 246, 0.15)", 
        border: "#3B82F6", 
        glow: "rgba(59, 130, 246, 0.3)" 
      },
      "Despachado": { 
        color: "#8B5CF6", 
        bg: "rgba(139, 92, 246, 0.15)", 
        border: "#8B5CF6", 
        glow: "rgba(139, 92, 246, 0.3)" 
      },
      "Entregado": { 
        color: "#34D399", 
        bg: "rgba(52, 211, 153, 0.15)", 
        border: "#34D399", 
        glow: "rgba(52, 211, 153, 0.3)" 
      },
      "Cancelado": { 
        color: "#EF4444", 
        bg: "rgba(239, 68, 68, 0.15)", 
        border: "#EF4444", 
        glow: "rgba(239, 68, 68, 0.3)" 
      },
      "Esperando pago": { 
        color: "#F59E0B", 
        bg: "rgba(245, 158, 11, 0.15)", 
        border: "#F59E0B", 
        glow: "rgba(245, 158, 11, 0.3)" 
      },
      "Verificando pago": { 
        color: "#0EA5E9", 
        bg: "rgba(14, 165, 233, 0.15)", 
        border: "#0EA5E9", 
        glow: "rgba(14, 165, 233, 0.3)" 
      },
      "Pago rechazado": { 
        color: "#EC4899", 
        bg: "rgba(236, 72, 153, 0.15)", 
        border: "#EC4899", 
        glow: "rgba(236, 72, 153, 0.3)" 
      }
    };
    return estados[estado] || { 
      color: "#64748b", 
      bg: "rgba(100, 116, 139, 0.15)", 
      border: "#cbd5e1", 
      glow: "rgba(100, 116, 139, 0.3)" 
    };
  };

  const obtenerColorEstadoPago = (estadoPago) => {
    const colores = {
      "PAGADO": { 
        color: "#34D399", 
        bg: "linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(52, 211, 153, 0.1))",
        border: "rgba(52, 211, 153, 0.3)"
      },
      "PENDIENTE": { 
        color: "#F59E0B", 
        bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))",
        border: "rgba(245, 158, 11, 0.3)"
      },
      "EN_VERIFICACION": { 
        color: "#0EA5E9", 
        bg: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.1))",
        border: "rgba(14, 165, 233, 0.3)"
      },
      "RECHAZADO": { 
        color: "#EF4444", 
        bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))",
        border: "rgba(239, 68, 68, 0.3)"
      }
    };
    return colores[estadoPago] || { 
      color: "#64748b", 
      bg: "linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.1))",
      border: "rgba(100, 116, 139, 0.3)"
    };
  };

  const puedeVerificarPago = pedido?.estadoPago === "EN_VERIFICACION" && 
                            pedido?.metodoPago === "TRANSFERENCIA";

  const esPagoEfectivo = pedido?.metodoPago === "EFECTIVO" && pedido?.estadoPago === "PENDIENTE";

  const tieneComprobante = () => {
    return pedido && 
           pedido.metodoPago && 
           (pedido.metodoPago.toUpperCase().includes("TRANSFERENCIA") || 
            pedido.metodoPago.toUpperCase().includes("DEPOSITO")) &&
           pedido.comprobanteUrl;
  };

  const proximosEstados = obtenerProximosEstados();
  const estadoParaMostrar = obtenerEstadoParaMostrar();
  const colorEstado = obtenerColorEstado(estadoParaMostrar);
  const colorEstadoPago = obtenerColorEstadoPago(pedido?.estadoPago);
  const numeroParaMostrar = numeroPedidoVendedor || pedido?.numeroPedidoVendedor || pedido?.idPedido;

  // Manejar volver atrás
  const handleVolver = () => {
    navigate("/vendedor/pedidos");
  };

  // Recargar datos
  const handleRecargar = () => {
    if (user) {
      cargarPedidoDetalle(user.token);
      cargarInfoPago(user.token);
    }
  };

  // Render loading
  if (cargando) {
    return (
      <div style={{ 
        padding: "100px",
        textAlign: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        minHeight: "100vh",
        fontSize: "24px",
        color: "#64748b",
        position: "relative",
        overflow: "hidden"
      }}>
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

  // Render error
  if (error || !pedido) {
    return (
      <div style={{ 
        padding: "100px",
        textAlign: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden"
      }}>
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
          fontWeight: "700",
          fontSize: "32px",
          marginBottom: "15px"
        }}>
          ❌ {error || "Error cargando pedido"}
        </h2>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", position: "relative", zIndex: "10" }}>
          <button
            onClick={handleVolver}
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8C53 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              transition: "all 0.3s ease",
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
          
          <button
            onClick={handleRecargar}
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* Notificaciones */}
      <Notificaciones 
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
      />

      {/* CÍRCULOS DE COLORES ANIMADOS EN EL FONDO */}
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
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px 20px",
        flex: "1",
        width: "100%",
        position: "relative",
        zIndex: "10"
      }}>
        
        {/* Botón de volver */}
        <button
          onClick={handleVolver}
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
          <span style={{ fontSize: "20px" }}>←</span>
          Volver a Pedidos
        </button>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "30px",
          animation: "fadeIn 0.6s ease-out",
          alignItems: "start"
        }}>
          
          {/* COLUMNA IZQUIERDA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* Header del Pedido */}
            <div style={{
              padding: "35px",
              borderRadius: "24px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)"
            }}>
              
              {/* Línea decorativa superior */}
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
              
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "25px",
                marginBottom: "20px",
                position: "relative",
                zIndex: "10"
              }}>
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
                  
                  <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: "900",
                    margin: "15px 0 10px 0",
                    fontSize: "42px",
                    color: "#2C3E50",
                    lineHeight: "1.1",
                    letterSpacing: "-0.5px"
                  }}>
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
                      {new Date(pedido.fechaPedido).toLocaleDateString("es-ES", {
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
                      {pedido.nombreCliente}
                    </div>
                  </div>
                </div>
                
                {/* Estado principal del pedido */}
                <div style={{
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
                }}>
                  <span style={{ position: "relative", zIndex: "2" }}>
                    {estadoParaMostrar}
                  </span>
                </div>
              </div>

              {/* Estados del pedido y pago */}
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
                    background: colorEstadoPago.bg,
                    color: colorEstadoPago.color,
                    padding: "14px 22px",
                    borderRadius: "14px",
                    fontWeight: "800",
                    fontSize: "15px",
                    border: `2px solid ${colorEstadoPago.border}`,
                    boxShadow: `0 4px 15px ${colorEstadoPago.color}20`
                  }}>
                    {pedido.estadoPago}
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
                    ESTADO DEL PEDIDO
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))",
                    color: "#64748b",
                    padding: "14px 22px",
                    borderRadius: "14px",
                    fontWeight: "800",
                    fontSize: "15px",
                    border: "2px solid rgba(229, 231, 235, 0.4)",
                    backdropFilter: "blur(5px)"
                  }}>
                    {mapearNombreEstado(pedido.estadoPedidoVendedor) || "NUEVO"}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Productos */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
              padding: "30px",
              borderRadius: "24px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              flexDirection: "column",
              backdropFilter: "blur(10px)"
            }}>
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
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "#2C3E50",
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.5px"
                  }}>
                    Productos
                  </h2>
                  <p style={{
                    color: "#64748b",
                    fontSize: "15px",
                    margin: "0",
                    fontWeight: "600",
                    background: "rgba(100, 116, 139, 0.1)",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    display: "inline-block"
                  }}>
                    {productos.length} productos en este pedido
                  </p>
                </div>
              </div>

              {productos.length === 0 ? (
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
                </div>
              ) : (
                <div style={{ 
                  flex: 1,
                  overflowY: "auto", 
                  paddingRight: "15px"
                }}>
                  {productos.map((producto, i) => (
                    <div key={producto.idDetalle || i} style={{
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
                    }}>
                      {producto.imagenProducto && (
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
                            src={producto.imagenProducto}
                            alt={producto.nombreProducto}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
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
                        <strong style={{
                          fontSize: "17px",
                          color: "#2C3E50",
                          display: "block",
                          fontWeight: "800",
                          marginBottom: "8px",
                          letterSpacing: "-0.3px"
                        }}>
                          {producto.nombreProducto}
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
                            📦 Cantidad: {producto.cantidad}
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
                            💰 Precio: ${producto.precioUnitario.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div style={{
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
                      }}>
                        ${producto.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones de Pago */}
            {(puedeVerificarPago || esPagoEfectivo) && (
              <div style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
                padding: "30px",
                borderRadius: "24px",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(10px)",
                position: "relative",
                overflow: "hidden"
              }}>
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
                    💰
                  </div>
                  <div>
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#2C3E50",
                      margin: "0 0 6px 0",
                    }}>
                      Verificación de Pago
                    </h2>
                    <p style={{
                      color: "#64748b",
                      fontSize: "15px",
                      margin: "0",
                      fontWeight: "600"
                    }}>
                      Acciones disponibles para este pago
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "15px",
                  position: "relative",
                  zIndex: "10"
                }}>
                  {puedeVerificarPago && (
                    <>
                      <button
                        onClick={verificarPago}
                        disabled={verificando}
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                          color: "white",
                          padding: "16px",
                          fontSize: "16px",
                          fontWeight: "800",
                          borderRadius: "14px",
                          border: "none",
                          cursor: verificando ? "not-allowed" : "pointer",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: verificando ? 0.7 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                          boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)"
                        }}
                      >
                        {verificando ? (
                          <>
                            <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                            Verificando...
                          </>
                        ) : (
                          <>
                            <span>✅</span>
                            Aprobar Pago
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={rechazarPago}
                        disabled={verificando}
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                          color: "white",
                          padding: "16px",
                          fontSize: "16px",
                          fontWeight: "800",
                          borderRadius: "14px",
                          border: "none",
                          cursor: verificando ? "not-allowed" : "pointer",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: verificando ? 0.7 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                          boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)"
                        }}
                      >
                        {verificando ? (
                          <>
                            <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <span>❌</span>
                            Rechazar Pago
                          </>
                        )}
                      </button>
                    </>
                  )}
                  
                  {esPagoEfectivo && (
                    <button
                      onClick={verificarPago}
                      disabled={verificando}
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                        color: "white",
                        padding: "16px",
                        fontSize: "16px",
                        fontWeight: "800",
                        borderRadius: "14px",
                        border: "none",
                        cursor: verificando ? "not-allowed" : "pointer",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: verificando ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        boxShadow: "0 6px 20px rgba(245, 158, 11, 0.4)"
                      }}
                    >
                      {verificando ? (
                        <>
                          <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <span>💵</span>
                          Confirmar Pago (Efectivo Recibido)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cambiar Estado del Pedido */}
            {proximosEstados.length > 0 && (
              <div style={{
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
              }}>
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
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#2C3E50",
                      margin: "0 0 4px 0",
                    }}>
                      Cambiar Estado
                    </h2>
                    <p style={{
                      color: "#64748b",
                      fontSize: "14px",
                      margin: "0",
                      fontWeight: "600"
                    }}>
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
                  {proximosEstados.map((estado) => {
                    const buttonColors = {
                      "NUEVO": { 
                        bg: "linear-gradient(135deg, #FF6B35 0%, #FF8C53 100%)", 
                        shadow: "rgba(255, 107, 53, 0.4)"
                      },
                      "EN_PROCESO": { 
                        bg: "linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)", 
                        shadow: "rgba(59, 130, 246, 0.4)"
                      },
                      "DESPACHADO": { 
                        bg: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", 
                        shadow: "rgba(139, 92, 246, 0.4)"
                      },
                      "ENTREGADO": { 
                        bg: "linear-gradient(135deg, #34D399 0%, #10B981 100%)", 
                        shadow: "rgba(52, 211, 153, 0.4)"
                      },
                      "CANCELADO": { 
                        bg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", 
                        shadow: "rgba(239, 68, 68, 0.4)"
                      }
                    };
                    
                    const color = buttonColors[estado] || { 
                      bg: "linear-gradient(135deg, #64748b 0%, #475569 100%)", 
                      shadow: "rgba(100, 116, 139, 0.4)"
                    };
                    
                    return (
                      <button
                        key={estado}
                        onClick={() => cambiarEstado(estado)}
                        disabled={verificando}
                        style={{
                          width: "100%",
                          background: color.bg,
                          color: "white",
                          padding: "16px",
                          fontSize: "15px",
                          fontWeight: "800",
                          borderRadius: "14px",
                          border: "none",
                          cursor: verificando ? "not-allowed" : "pointer",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: verificando ? 0.7 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          boxShadow: `0 6px 20px ${color.shadow}`
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>
                          {estado === "NUEVO" ? "🆕" :
                           estado === "EN_PROCESO" ? "⚙️" :
                           estado === "DESPACHADO" ? "🚚" :
                           estado === "ENTREGADO" ? "✅" : "❌"}
                        </span>
                        {mapearNombreEstado(estado)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comprobante de Pago */}
            {tieneComprobante() && (
              <div style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
                padding: "30px",
                borderRadius: "24px",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(10px)",
                position: "relative",
                overflow: "hidden"
              }}>
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
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#2C3E50",
                      margin: "0 0 6px 0",
                    }}>
                      Comprobante
                    </h2>
                    <p style={{
                      color: "#64748b",
                      fontSize: "15px",
                      margin: "0",
                      fontWeight: "600"
                    }}>
                      Verificación de pago
                    </p>
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
                    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)"
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
                        borderBottom: "2px solid rgba(229, 231, 235, 0.6)"
                      }}
                    />
                    <div style={{ 
                      padding: "20px", 
                      background: "rgba(248, 250, 252, 0.9)",
                      textAlign: "center",
                      backdropFilter: "blur(5px)"
                    }}>
                      <button
                        onClick={descargarComprobante}
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
                          border: "none",
                          cursor: "pointer",
                          width: "100%"
                        }}
                      >
                        🔗 Abrir comprobante en nueva pestaña
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "30px",
            width: "400px",
            position: "sticky",
            top: "30px"
          }}>
            
            {/* Resumen */}
            <div style={{
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8C53 100%)",
              padding: "35px",
              borderRadius: "24px",
              boxShadow: "0 15px 40px rgba(255, 107, 53, 0.3)",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
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
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px",
                      fontWeight: "900",
                      color: "white",
                      margin: "0 0 6px 0",
                      letterSpacing: "-0.5px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}>
                      Resumen
                    </h2>
                    <p style={{
                      color: "rgba(255, 255, 255, 0.95)",
                      fontSize: "15px",
                      margin: "0",
                      fontWeight: "600",
                      textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                    }}>
                      Detalle de pagos y costos
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                  <span style={{ 
                    fontSize: "15px", 
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "600"
                  }}>
                    Subtotal:
                  </span>
                  <span style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "white",
                    textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}>
                    ${(pedido.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                  <span style={{ 
                    fontSize: "15px", 
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "600"
                  }}>
                    IVA (12%):
                  </span>
                  <span style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "white",
                    textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}>
                    ${(pedido.iva || 0).toFixed(2)}
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "25px",
                  alignItems: "center",
                  padding: "12px 0"
                }}>
                  <span style={{ 
                    fontSize: "15px", 
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "600"
                  }}>
                    Método de pago:
                  </span>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "white",
                    background: "rgba(255, 255, 255, 0.25)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)"
                  }}>
                    {pedido.metodoPago || "No especificado"}
                  </span>
                </div>

                <div style={{
                  borderTop: "2px solid rgba(255, 255, 255, 0.4)",
                  paddingTop: "22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{
                    fontSize: "20px",
                    fontWeight: "900",
                    color: "white",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                  }}>
                    Total:
                  </span>
                  <span style={{
                    fontSize: "38px",
                    fontWeight: "900",
                    color: "white",
                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                    letterSpacing: "-1px"
                  }}>
                    ${(pedido.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)",
              padding: "30px",
              borderRadius: "24px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(10px)"
            }}>
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
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#2C3E50",
                    margin: "0 0 4px 0",
                  }}>
                    Información
                  </h2>
                  <p style={{
                    color: "#64748b",
                    fontSize: "14px",
                    margin: "0",
                    fontWeight: "600"
                    }}>
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
                      {new Date(pedido.fechaPedido).toLocaleString()}
                    </div>
                  </div>
                  
                  {pedido.direccionEnvio && (
                    <div>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#64748b", 
                        fontWeight: "700", 
                        marginBottom: "6px", 
                        textTransform: "uppercase", 
                        letterSpacing: "1.5px" 
                      }}>
                        DIRECCIÓN DE ENVÍO
                      </div>
                      <div style={{ 
                        fontSize: "14px", 
                        color: "#2C3E50", 
                        fontWeight: "600"
                      }}>
                        {pedido.direccionEnvio}
                      </div>
                    </div>
                  )}
                  
                  {pedido.notas && (
                    <div>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#64748b", 
                        fontWeight: "700", 
                        marginBottom: "6px", 
                        textTransform: "uppercase", 
                        letterSpacing: "1.5px" 
                      }}>
                        NOTAS
                      </div>
                      <div style={{ 
                        fontSize: "14px", 
                        color: "#2C3E50", 
                        background: "rgba(254, 243, 199, 0.3)",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "2px solid rgba(245, 158, 11, 0.2)"
                      }}>
                        {pedido.notas}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal de Confirmación Personalizado */}
      {mostrarModalConfirmacion && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "9999",
          backdropFilter: "blur(5px)",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 1) 100%)",
            borderRadius: "24px",
            padding: "35px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            animation: "fadeIn 0.4s ease-out"
          }}>
            <div style={{
              fontSize: "42px",
              textAlign: "center",
              marginBottom: "20px",
              background: "linear-gradient(135deg, #FF6B35, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              ⚠️
            </div>
            
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: "800",
              color: "#2C3E50",
              textAlign: "center",
              marginBottom: "15px"
            }}>
              {mostrarModalConfirmacion.titulo}
            </h3>
            
            <p style={{
              color: "#64748b",
              fontSize: "16px",
              lineHeight: "1.6",
              textAlign: "center",
              marginBottom: "30px",
              background: "rgba(241, 245, 249, 0.6)",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid rgba(229, 231, 235, 0.5)"
            }}>
              {mostrarModalConfirmacion.mensaje}
            </p>

            {mostrarModalConfirmacion.mostrarInput && (
              <div style={{ marginBottom: "25px" }}>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ej: Comprobante ilegible, monto incorrecto, información del banco no coincide..."
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "2px solid rgba(239, 68, 68, 0.3)",
                    fontSize: "14px",
                    fontFamily: "'Inter', sans-serif",
                    minHeight: "120px",
                    resize: "vertical",
                    background: "rgba(248, 250, 252, 0.9)",
                    color: "#2C3E50"
                  }}
                />
              </div>
            )}
            
            <div style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center"
            }}>
              <button
                onClick={() => {
                  if (accionModal === "aprobar") {
                    ejecutarVerificacionPago(true);
                  } else if (accionModal === "rechazar") {
                    if (!motivoRechazo.trim()) {
                      notificaciones.advertencia("Motivo Requerido", "Debes ingresar un motivo para rechazar el pago");
                      return;
                    }
                    ejecutarVerificacionPago(false);
                  } else if (accionModal === "cambiarEstado") {
                    ejecutarCambioEstado(mostrarModalConfirmacion.nuevoEstado);
                  }
                }}
                style={{
                  padding: "16px 32px",
                  background: accionModal === "aprobar" 
                    ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)" 
                    : accionModal === "rechazar"
                    ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
                    : "linear-gradient(135deg, #3B82F6 0%, #2563eb 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "800",
                  transition: "all 0.3s ease",
                  boxShadow: accionModal === "aprobar" 
                    ? "0 6px 20px rgba(16, 185, 129, 0.4)" 
                    : accionModal === "rechazar"
                    ? "0 6px 20px rgba(239, 68, 68, 0.4)"
                    : "0 6px 20px rgba(59, 130, 246, 0.4)",
                  flex: "1",
                  maxWidth: "200px"
                }}
              >
                {accionModal === "aprobar" ? "✅ Aprobar" : 
                 accionModal === "rechazar" ? "❌ Rechazar" : 
                 "✅ Cambiar Estado"}
              </button>
              
              <button
                onClick={() => {
                  setMostrarModalConfirmacion(false);
                  setMotivoRechazo("");
                }}
                style={{
                  padding: "16px 32px",
                  background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "800",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 20px rgba(100, 116, 139, 0.4)",
                  flex: "1",
                  maxWidth: "200px"
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
          transition: all 0.3s ease;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
          margin: 0;
        }
        
        p, span, div, input, textarea {
          font-family: 'Inter', sans-serif;
        }
        
        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.8);
          border-radius: 8px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FF6B35, #8B5CF6);
          border-radius: 8px;
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
            font-size: 24px !important;
          }
          
          .header-section {
            padding: 25px !important;
          }
          
          .button-group {
            flex-direction: column !important;
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
            font-size: 22px !important;
          }
          
          .back-button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}