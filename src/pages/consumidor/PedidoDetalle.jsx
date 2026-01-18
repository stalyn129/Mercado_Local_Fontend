import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function PedidoDetalle() {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Detectar origen de navegación
  const origen = location.state?.origen || "CHECKOUT";

  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [numTarjeta, setNumTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [fechaTarjeta, setFechaTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [finalizando, setFinalizando] = useState(false);

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

  // Validación del formulario
  const validarFormulario = () => {
    if (metodoPago === "EFECTIVO") {
      // Ya no es obligatorio el monto, pero si lo pone debe ser mayor o igual
      if (montoEfectivo && parseFloat(montoEfectivo) < pedido.total) {
        alert("❌ El monto debe ser mayor o igual al total del pedido");
        return false;
      }
      // Si no pone monto, está bien (pagará el monto exacto)
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

  // 🆕 FUNCIÓN MEJORADA CON DEBUGGING
  const finalizarCompra = async () => {
  if (!validarFormulario()) return;

  const token = localStorage.getItem("authToken");
  if (!token) return navigate("/loginmodal");

  // 🚨 AVISO ESPECIAL PARA EFECTIVO
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

    // 🔥 CORRECCIÓN PRINCIPAL - Manejo correcto de EFECTIVO
    if (metodoPago === "EFECTIVO") {
      headers["Content-Type"] = "application/json";
      
      // Si el usuario ingresó un monto, lo enviamos, sino enviamos el total exacto
      const montoFinal = montoEfectivo && parseFloat(montoEfectivo) >= pedido.total
        ? parseFloat(montoEfectivo)
        : pedido.total;
      
      body = JSON.stringify({
        metodoPago: "EFECTIVO",
        montoEfectivo: montoFinal
      });
      
      console.log("💵 EFECTIVO - Enviando:", {
        metodoPago: "EFECTIVO",
        montoEfectivo: montoFinal
      });
      
    } else if (metodoPago === "TRANSFERENCIA") {
      // Para TRANSFERENCIA usamos FormData
      body = new FormData();
      body.append("metodoPago", "TRANSFERENCIA");
      if (comprobante) {
        body.append("comprobante", comprobante);
        console.log("🏦 TRANSFERENCIA - Archivo:", comprobante.name);
      }
      
    } else if (metodoPago === "TARJETA") {
      // Para TARJETA usamos FormData
      body = new FormData();
      body.append("metodoPago", "TARJETA");
      body.append("numTarjeta", numTarjeta.replace(/\s/g, ""));
      body.append("cvv", cvv);
      body.append("fechaTarjeta", fechaTarjeta);
      body.append("titular", titular);
      console.log("💳 TARJETA - Datos enviados");
    }

    const url = `${API_URL}/pedidos/finalizar/${idPedido}`;
    console.log("🔵 URL:", url);
    console.log("🔵 Método de pago:", metodoPago);
    console.log("🔵 Headers:", headers);

    const res = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: body,
    });

    console.log("📥 Status de respuesta:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error del servidor:", errorText);
      throw new Error(errorText || "No se pudo finalizar el pedido");
    }

    const data = await res.json();
    console.log("✅ Respuesta exitosa:", data);

    // ✅ Éxito - Mostrar mensaje apropiado según el método de pago
    if (metodoPago === "EFECTIVO") {
      alert(
        `🎉 ¡Pedido confirmado!\n\n` +
        `Pagarás $${pedido.total.toFixed(2)} en efectivo al recibir tu pedido.\n` +
        `El vendedor está preparando tu orden.`
      );
    } else {
      alert("🎉 ¡Compra finalizada con éxito!");
    }

    // Recargar el pedido actualizado
    await cargarPedido();

  } catch (err) {
    console.error("❌ Error completo:", err);
    alert(`❌ Error al finalizar pedido:\n${err.message}`);
  } finally {
    setFinalizando(false);
  }
};

  // 🟢 FUNCIÓN MEJORADA PARA VOLVER O CANCELAR
  const confirmarSalir = async () => {
    if (!pedido) return;

    const pedidoFinalizado =
      pedido.estadoPedido === "CREADO" ||
      pedido.estadoPedido === "PENDIENTE" ||
      pedido.estadoPedido === "PROCESANDO";

    const vieneDeMisPedidos = origen === "MIS_PEDIDOS";

    // 🟢 Si viene del historial o ya está finalizado, solo vuelve
    if (vieneDeMisPedidos || pedidoFinalizado) {
      navigate("/mis-pedidos");
      return;
    }

    // ⚠️ SOLO checkout + pendiente puede cancelar
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

  const estadoColors = {
    PENDIENTE: "#F4B419",
    PENDIENTE_VERIFICACION: "#F4B419",
    PROCESANDO: "#4A90E2",
    COMPLETADO: "#5A8F48",
    CANCELADO: "#E74C3C",
  };

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

  const pedidoFinalizado =
    pedido.estadoPedido === "CREADO" ||
    pedido.estadoPedido === "PENDIENTE" ||
    pedido.estadoPedido === "PROCESANDO";

  const vieneDeMisPedidos = origen === "MIS_PEDIDOS";

  const pedidoCancelable =
    !vieneDeMisPedidos && pedido.estadoPedido === "PENDIENTE";

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
              color: pedidoCancelable ? "#E74C3C" : "#5A8F48",
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
            {pedidoCancelable
              ? "← Cancelar y volver"
              : "← Volver a mis compras"}
          </button>

          {/* VISTA CUANDO YA ESTÁ FINALIZADO - REDISEÑADA */}
          {pedidoFinalizado ? (
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
                  <div
                    style={{
                      background: estadoColors[pedido.estadoPedido] || "#6B7F69",
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
                </div>
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

                    {detalles.map((d, i) => (
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
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
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
                            }}
                          >
                            <span>Cant: {d.cantidad}</span>
                            <span>•</span>
                            <span>${(d.subtotal / d.cantidad).toFixed(2)} c/u</span>
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
                          ${d.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna derecha - Resumen mejorado */}
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
                          ${pedido.subtotal.toFixed(2)}
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
                          ${pedido.iva.toFixed(2)}
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
                        Total pagado
                      </span>
                      <span
                        style={{
                          fontSize: "36px",
                          fontWeight: "900",
                          color: "#5A8F48",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        ${pedido.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Información adicional */}
                    <div
                      style={{
                        marginTop: "24px",
                        padding: "16px",
                        background: "#FAFBF9",
                        borderRadius: "12px",
                        border: "1px solid #F0F4ED",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#6B7F69",
                          lineHeight: "1.6",
                        }}
                      >
                        {pedido.estadoPedido === "CREADO" && (
                          <>
                            ✓ Tu pedido ha sido creado exitosamente. Gracias por tu compra.
                          </>
                        )}
                        {pedido.estadoPedido === "PENDIENTE" && (
                          <>
                            ⏳ Tu pedido está en verificación. Te notificaremos cuando sea procesado.
                          </>
                        )}
                        {pedido.estadoPedido === "PROCESANDO" && (
                          <>
                            🔄 Tu pedido está siendo procesado. Pronto estará listo.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VISTA CUANDO ESTÁ PENDIENTE - CHECKOUT */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: "25px",
                animation: "fadeIn 0.5s ease-out",
              }}
              className="grid-layout"
            >
              {/* COLUMNA PRINCIPAL - Productos y Detalles */}
              <div>
                {/* Header del Pedido */}
                <div
                  style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <h1
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: "900",
                          margin: "0 0 6px 0",
                          fontSize: "32px",
                          color: "#2D3E2B",
                        }}
                      >
                        📦 Pedido #{pedido.idPedido}
                      </h1>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#6B7F69",
                          margin: 0,
                        }}
                      >
                        📅{" "}
                        {new Date(pedido.fechaPedido).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div
                      style={{
                        background: estadoColors[pedido.estadoPedido] || "#6B7F69",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontWeight: "700",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pedido.estadoPedido}
                    </div>
                  </div>
                </div>

                {/* Lista de Productos */}
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
                    🛒 Productos
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
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(90, 143, 72, 0.1)";
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
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
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
                          {(d.subtotal / d.cantidad).toFixed(2)}
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
                        ${d.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMNA DERECHA - Solo si el pedido NO está finalizado */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Resumen de Compra */}
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
                      ${pedido.subtotal.toFixed(2)}
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
                      ${pedido.iva.toFixed(2)}
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
                      ${pedido.total.toFixed(2)}
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
                      transition: "all 0.3s ease",
                    }}
                  >
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="TRANSFERENCIA">🏦 Transferencia</option>
                    <option value="TARJETA">💳 Tarjeta</option>
                  </select>

                  {metodoPago === "EFECTIVO" && (
                    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
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
                            Pagarás <strong>${pedido.total.toFixed(2)}</strong> en efectivo cuando recibas tu pedido.
                          </span>
                        </p>
                      </div>

                      <label style={labelStyle}>Monto que entregarás (opcional):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={montoEfectivo}
                        onChange={(e) => setMontoEfectivo(e.target.value)}
                        placeholder={`Mínimo: $${pedido.total.toFixed(2)}`}
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
                            {(parseFloat(montoEfectivo) - pedido.total).toFixed(2)}
                          </p>
                        )}
                    </div>
                  )}

                  {metodoPago === "TRANSFERENCIA" && (
                    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
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
                      {comprobante && (
                        <p
                          style={{
                            marginTop: "8px",
                            marginBottom: 0,
                            color: "#5A8F48",
                            fontSize: "12px",
                            fontWeight: "600",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ✓ {comprobante.name}
                        </p>
                      )}
                    </div>
                  )}

                  {metodoPago === "TARJETA" && (
                    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
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

                {/* BOTÓN FINALIZAR */}
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
                    boxShadow: finalizando
                      ? "none"
                      : "0 4px 12px rgba(90, 143, 72, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!finalizando) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 8px 20px rgba(90, 143, 72, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!finalizando) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(90, 143, 72, 0.3)";
                    }
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