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

  // CORRECCIÓN MEJORADA: Determinar si mostrar checkout
  const mostrarCheckout = () => {
    if (!pedido) return false;

    // Mostrar checkout solo si:
    // 1. Viene de checkout (origen CHECKOUT) o no se especifica origen
    // 2. El pedido está PENDIENTE o CREADO
    // 3. El pago NO está confirmado
    // 4. No está cancelado
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

  // LÍNEA DE TIEMPO MEJORADA - Más precisa
  const construirLineaTiempo = (pedidoData) => {
    const estados = [];
    let orden = 1;

    // Estado 1: Pedido realizado
    estados.push({
      estado: "PEDIDO_REALIZADO",
      descripcion: "Pedido realizado",
      fecha: pedidoData.fechaPedido,
      completado: true,
      icono: "📦",
      orden: orden++
    });

    // Estado 2: Proceso de pago
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

    // Estados de procesamiento solo si el pago está confirmado
    if (pedidoData.estadoPago === "PAGADO" && pedidoData.estadoPedido !== "CANCELADO") {
      
      // Estado 3: Vendedor acepta
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

      // Estado 4: Recolectando (si ya pasó NUEVO)
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

      // Estado 5: Empacando
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

      // Estado 6: En camino
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

    // Estado final: Completado/Cancelado
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

    // Usar EstadoSeguimientoPedido si está disponible (prioridad)
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
        // Reemplazar o agregar estado según corresponda
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

    // Ordenar por orden
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
      "CREADO": "#4A90E2",
      "PENDIENTE": "#F4B419",
      "PROCESANDO": "#2196F3",
      "COMPLETADO": "#5A8F48",
      "CANCELADO": "#E74C3C",
    };
    return colores[estado] || "#6B7F69";
  };

  const obtenerColorEstadoPago = (estado) => {
    const colores = {
      "PENDIENTE": "#F4B419",
      "EN_VERIFICACION": "#FF9800",
      "PAGADO": "#5A8F48",
      "RECHAZADO": "#F44336",
      "CANCELADO": "#E74C3C",
    };
    return colores[estado] || "#6B7F69";
  };

  // Validación del formulario
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

    // Solo permitir cancelar si el pedido está pendiente y no está pagado
    const pedidoCancelable =
      (pedido.estadoPedido === "PENDIENTE" || pedido.estadoPedido === "CREADO") &&
      pedido.estadoPago !== "PAGADO" &&
      pedido.estadoPago !== "EN_VERIFICACION";

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

  // Función auxiliar para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
          minHeight: "100vh",
          fontSize: "24px",
          color: "#6B7F69",
        }}
      >
        Cargando pedido...
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ color: "#2D3E2B" }}>❌ {error || "Error cargando pedido"}</h2>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            background: "#5A8F48",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const labelStyle = {
    display: "block",
    fontWeight: "600",
    color: "#2D3E2B",
    marginBottom: "6px",
    fontSize: "13px",
  };

  const inputStyle = {
    padding: "12px",
    width: "100%",
    borderRadius: "10px",
    border: "2px solid #ECF2E3",
    marginBottom: "12px",
    fontSize: "14px",
    transition: "all 0.3s ease",
  };

  // Determinar qué vista mostrar
  const mostrarVistaCheckout = mostrarCheckout();

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          
          input:focus, select:focus {
            outline: none;
            border-color: #5A8F48 !important;
            box-shadow: 0 0 0 3px rgba(90, 143, 72, 0.1);
          }

          * {
            box-sizing: border-box;
          }

          @media (max-width: 768px) {
            .grid-layout {
              grid-template-columns: 1fr !important;
            }
          }

          .linea-tiempo-item {
            transition: all 0.3s ease;
          }

          .linea-tiempo-item:hover {
            transform: translateX(5px);
          }
        `}</style>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "30px 20px 60px 20px",
            flex: "1",
            width: "100%",
          }}
        >
          <button
            onClick={confirmarSalir}
            style={{
              background: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              color: mostrarVistaCheckout ? "#E74C3C" : "#5A8F48",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(90, 143, 72, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateX(-4px)";
              e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateX(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(90, 143, 72, 0.1)";
            }}
          >
            {mostrarVistaCheckout ? "← Cancelar y volver" : "← Volver a mis pedidos"}
          </button>

          {/* VISTA DETALLES DEL PEDIDO (cuando ya está finalizado) */}
          {!mostrarVistaCheckout ? (
            <div style={{ animation: "slideUp 0.6s ease-out" }}>
              {/* Encabezado con estado */}
              <div
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 25px rgba(90, 143, 72, 0.1)",
                  marginBottom: "25px",
                  border: "1px solid #ECF2E3",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                        }}
                      >
                        📦
                      </div>
                      <h1
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: "900",
                          margin: 0,
                          fontSize: "36px",
                          color: "#2D3E2B",
                        }}
                      >
                        Pedido #{pedido.idPedido}
                      </h1>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6B7F69",
                        margin: "0 0 8px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
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
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <div
                      style={{
                        background: obtenerColorEstadoGeneral(pedido.estadoPedido),
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "25px",
                        fontWeight: "700",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {pedido.estadoPedido === "COMPLETADO" && "✓ "}
                      {pedido.estadoPedido}
                    </div>
                    {pedido.estadoPago && (
                      <div
                        style={{
                          background: obtenerColorEstadoPago(pedido.estadoPago),
                          color: "white",
                          padding: "12px 20px",
                          borderRadius: "25px",
                          fontWeight: "700",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        {pedido.estadoPago === "PAGADO" && "✅ "}
                        {pedido.estadoPago}
                      </div>
                    )}
                    {pedido.estadoPedidoVendedor && (
                      <div
                        style={{
                          background: "#2196F3",
                          color: "white",
                          padding: "12px 20px",
                          borderRadius: "25px",
                          fontWeight: "700",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          boxShadow: "0 4px 12px rgba(33, 150, 243, 0.1)",
                        }}
                      >
                        📦 {pedido.estadoPedidoVendedor}
                      </div>
                    )}
                  </div>
                </div>

                {/* Línea de tiempo del pedido */}
                {lineaTiempo.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#2D3E2B",
                        marginBottom: "20px",
                      }}
                    >
                      📋 Seguimiento del pedido
                    </h3>
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          left: "20px",
                          top: "0",
                          bottom: "0",
                          width: "2px",
                          background: "#ECF2E3",
                          zIndex: "1",
                        }}
                      ></div>

                      {lineaTiempo.map((item, index) => (
                        <div
                          key={index}
                          className="linea-tiempo-item"
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            marginBottom: "25px",
                            position: "relative",
                            zIndex: "2",
                          }}
                        >
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              background: item.completado ? "#5A8F48" : "#E0E0E0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              marginRight: "20px",
                              flexShrink: "0",
                              color: "white",
                            }}
                          >
                            {item.icono}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: "700",
                                fontSize: "15px",
                                color: item.completado ? "#2D3E2B" : "#9E9E9E",
                                marginBottom: "4px",
                              }}
                            >
                              {item.descripcion}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: item.completado ? "#6B7F69" : "#BDBDBD",
                              }}
                            >
                              {item.completado
                                ? "Completado"
                                : "En proceso..."}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 420px",
                  gap: "25px",
                }}
                className="grid-layout"
              >
                {/* Columna izquierda - Productos */}
                <div>
                  <div
                    style={{
                      background: "white",
                      padding: "30px",
                      borderRadius: "20px",
                      boxShadow: "0 4px 25px rgba(90, 143, 72, 0.1)",
                      border: "1px solid #ECF2E3",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#2D3E2B",
                        marginBottom: "20px",
                        marginTop: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>🛒</span> Productos del pedido
                    </h2>

                    {detalles.length === 0 ? (
                      <p style={{ color: "#6B7F69", textAlign: "center", padding: "20px" }}>
                        No hay productos en este pedido
                      </p>
                    ) : (
                      detalles.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#FAFBF9",
                            padding: "20px",
                            borderRadius: "16px",
                            marginBottom: "14px",
                            display: "flex",
                            gap: "18px",
                            alignItems: "center",
                            transition: "all 0.3s ease",
                            border: "1px solid #F0F4ED",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 16px rgba(90, 143, 72, 0.12)";
                            e.currentTarget.style.borderColor = "#E3EBD9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.borderColor = "#F0F4ED";
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
                                flexShrink: 0,
                                border: "2px solid #ECF2E3",
                              }}
                            />
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong
                              style={{
                                fontSize: "16px",
                                color: "#2D3E2B",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              {d.producto?.nombreProducto || "Producto"}
                            </strong>
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                fontSize: "14px",
                                color: "#6B7F69",
                                flexWrap: "wrap",
                              }}
                            >
                              <span>Cant: {d.cantidad}</span>
                              <span>•</span>
                              <span>${formatCurrency(d.subtotal / d.cantidad)} c/u</span>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "#5A8F48",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            ${formatCurrency(d.subtotal)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Columna derecha - Resumen */}
                <div>
                  <div
                    style={{
                      background: "white",
                      padding: "30px",
                      borderRadius: "20px",
                      boxShadow: "0 4px 25px rgba(90, 143, 72, 0.1)",
                      border: "1px solid #ECF2E3",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#2D3E2B",
                        marginBottom: "24px",
                        marginTop: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>💰</span> Resumen del pedido
                    </h2>

                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 0",
                          borderBottom: "1px solid #F0F4ED",
                        }}
                      >
                        <span style={{ fontSize: "15px", color: "#6B7F69" }}>
                          Subtotal
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#2D3E2B",
                          }}
                        >
                          ${formatCurrency(pedido.subtotal || 0)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 0",
                          borderBottom: "1px solid #F0F4ED",
                        }}
                      >
                        <span style={{ fontSize: "15px", color: "#6B7F69" }}>
                          IVA (12%)
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#2D3E2B",
                          }}
                        >
                          ${formatCurrency(pedido.iva || 0)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 0",
                          borderBottom: "2px solid #E3EBD9",
                        }}
                      >
                        <span style={{ fontSize: "15px", color: "#6B7F69" }}>
                          Método de pago
                        </span>
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#2D3E2B",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {pedido.metodoPago === "EFECTIVO" && "💵 Efectivo"}
                          {pedido.metodoPago === "TRANSFERENCIA" && "🏦 Transferencia"}
                          {pedido.metodoPago === "TARJETA" && "💳 Tarjeta"}
                          {!pedido.metodoPago && "No especificado"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "linear-gradient(135deg, #F5F9F3 0%, #EAF2E6 100%)",
                        padding: "20px",
                        borderRadius: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "20px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#2D3E2B",
                        }}
                      >
                        Total
                      </span>
                      <span
                        style={{
                          fontSize: "36px",
                          fontWeight: "900",
                          color: "#5A8F48",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        ${formatCurrency(pedido.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VISTA CHECKOUT (solo cuando el pedido necesita pago) */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: "25px",
                animation: "fadeIn 0.5s ease-out",
              }}
              className="grid-layout"
            >
              {/* COLUMNA IZQUIERDA - Productos */}
              <div>
                <div
                  style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
                    marginBottom: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      marginBottom: "18px",
                      marginTop: 0,
                    }}
                  >
                    🛒 Productos del pedido
                  </h2>

                  {detalles.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#F9FBF7",
                        padding: "16px",
                        borderRadius: "12px",
                        marginBottom: "12px",
                        display: "flex",
                        gap: "15px",
                        alignItems: "center",
                      }}
                    >
                      {d.producto?.imagenProducto && (
                        <img
                          src={d.producto.imagenProducto}
                          alt={d.producto.nombreProducto}
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            fontSize: "15px",
                            color: "#2D3E2B",
                            display: "block",
                          }}
                        >
                          {d.producto?.nombreProducto || "Producto"}
                        </strong>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "13px",
                            color: "#6B7F69",
                          }}
                        >
                          Cantidad: {d.cantidad} • Precio: $
                          {formatCurrency(d.subtotal / d.cantidad)}
                        </p>
                      </div>

                      <div
                        style={{
                          fontSize: "17px",
                          fontWeight: "700",
                          color: "#5A8F48",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        ${formatCurrency(d.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMNA DERECHA - Pago */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Resumen */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #F9D94A 0%, #F5C542 100%)",
                    padding: "22px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      marginBottom: "14px",
                      marginTop: 0,
                    }}
                  >
                    💰 Resumen
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#2D3E2B" }}>
                      Subtotal:
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                      }}
                    >
                      ${formatCurrency(pedido.subtotal || 0)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#2D3E2B" }}>
                      IVA (12%):
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                      }}
                    >
                      ${formatCurrency(pedido.iva || 0)}
                    </span>
                  </div>

                  <div
                    style={{
                      borderTop: "2px solid rgba(45, 62, 43, 0.2)",
                      paddingTop: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#2D3E2B",
                      }}
                    >
                      Total:
                    </span>
                    <span
                      style={{
                        fontSize: "26px",
                        fontWeight: "900",
                        color: "#2D3E2B",
                      }}
                    >
                      ${formatCurrency(pedido.total || 0)}
                    </span>
                  </div>
                </div>

                {/* Método de Pago */}
                <div
                  style={{
                    background: "white",
                    padding: "22px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      marginBottom: "14px",
                      marginTop: 0,
                    }}
                  >
                    💳 Método de pago
                  </h2>

                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    style={{
                      padding: "12px",
                      width: "100%",
                      borderRadius: "10px",
                      border: "2px solid #ECF2E3",
                      marginBottom: "16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#2D3E2B",
                      cursor: "pointer",
                      background: "white",
                    }}
                  >
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="TRANSFERENCIA">🏦 Transferencia</option>
                    <option value="TARJETA">💳 Tarjeta</option>
                  </select>

                  {metodoPago === "EFECTIVO" && (
                    <div>
                      <div
                        style={{
                          background: "#FFF3CD",
                          border: "2px solid #FFC107",
                          padding: "16px",
                          borderRadius: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        <p style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#856404",
                          lineHeight: "1.6",
                          fontWeight: "600"
                        }}>
                          💵 <strong>Pago contra entrega</strong><br />
                          <span style={{ fontWeight: "normal" }}>
                            Pagarás <strong>${formatCurrency(pedido.total || 0)}</strong> en efectivo cuando recibas tu pedido.
                          </span>
                        </p>
                      </div>

                      <label style={labelStyle}>Monto que entregarás (opcional):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={montoEfectivo}
                        onChange={(e) => setMontoEfectivo(e.target.value)}
                        placeholder={`Mínimo: $${formatCurrency(pedido.total || 0)}`}
                        style={inputStyle}
                      />
                      {montoEfectivo &&
                        parseFloat(montoEfectivo) >= pedido.total && (
                          <p
                            style={{
                              marginTop: "8px",
                              marginBottom: 0,
                              color: "#5A8F48",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            ✓ Cambio: $
                            {formatCurrency(parseFloat(montoEfectivo) - pedido.total)}
                          </p>
                        )}
                    </div>
                  )}

                  {metodoPago === "TRANSFERENCIA" && (
                    <div>
                      <label style={labelStyle}>Subir comprobante:</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setComprobante(e.target.files[0])}
                        style={{
                          padding: "10px",
                          width: "100%",
                          borderRadius: "10px",
                          border: "2px solid #ECF2E3",
                          background: "white",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                  )}

                  {metodoPago === "TARJETA" && (
                    <div>
                      <label style={labelStyle}>Número de tarjeta:</label>
                      <input
                        type="text"
                        value={numTarjeta}
                        onChange={(e) =>
                          setNumTarjeta(
                            e.target.value
                              .replace(/\s/g, "")
                              .replace(/(\d{4})/g, "$1 ")
                              .trim()
                          )
                        }
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        style={inputStyle}
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <label style={labelStyle}>CVV:</label>
                          <input
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="123"
                            maxLength="4"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Expiración:</label>
                          <input
                            type="month"
                            value={fechaTarjeta}
                            onChange={(e) => setFechaTarjeta(e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <label style={labelStyle}>Titular:</label>
                      <input
                        type="text"
                        value={titular}
                        onChange={(e) => setTitular(e.target.value)}
                        placeholder="Nombre completo"
                        style={inputStyle}
                      />
                    </div>
                  )}
                </div>

                {/* Botón Finalizar */}
                <button
                  onClick={finalizarCompra}
                  disabled={finalizando}
                  style={{
                    width: "100%",
                    background: finalizando ? "#98A598" : "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    color: "white",
                    padding: "16px",
                    fontSize: "16px",
                    fontWeight: "700",
                    borderRadius: "12px",
                    border: "none",
                    cursor: finalizando ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {finalizando ? "⏳ Procesando..." : "✔ Finalizar Compra"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}