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

      setPedido(dataPedido);
      setDetalles(dataPedido.detalles || dataPedido.productos || []);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando pedido:", err);
      alert("Error al cargar el pedido");
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedido();
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
      "Nuevo": { bg: "#FFF9E6", color: "#F5C744", border: "#F5C744" },
      "En Proceso": { bg: "#E3F2FD", color: "#2196F3", border: "#2196F3" },
      "Despachado": { bg: "#E8F5E9", color: "#4CAF50", border: "#4CAF50" },
      "Entregado": { bg: "#E8F5E3", color: "#5A8F48", border: "#5A8F48" },
      "Cancelado": { bg: "#FFE8EC", color: "#DA3E52", border: "#DA3E52" },
      "Esperando pago": { bg: "#FFF3E0", color: "#FF9800", border: "#FF9800" },
      "Verificando pago": { bg: "#E1F5FE", color: "#03A9F4", border: "#03A9F4" },
      "Pago rechazado": { bg: "#FFEBEE", color: "#F44336", border: "#F44336" }
    };
    return estados[estado] || { bg: "#F0F4ED", color: "#6B7F69", border: "#6B7F69" };
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
          background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
          minHeight: "100vh",
          fontSize: "24px",
          color: "#6B7F69",
        }}
      >
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
        <p>Cargando detalles del pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div
        style={{
          padding: "100px",
          textAlign: "center",
          background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ color: "#2D3E2B" }}>❌ Error cargando pedido</h2>
        <button
          onClick={() => navigate("/vendedor/gestionar-pedidos")}
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
          Volver a pedidos
        </button>
      </div>
    );
  }

  const estadoParaMostrar = obtenerEstadoParaMostrar();
  const colorEstado = obtenerColorEstado(estadoParaMostrar);
  const proximosEstados = obtenerProximosEstados(); // ✅ Ahora se calcula DESPUÉS de verificar pedido
  const user = JSON.parse(localStorage.getItem("user"));
  const esTransferencia = tieneComprobante();
  const debeMostrarSeccionEstado = pedido && 
    (proximosEstados.length > 0 || 
     (!pedido.estadoPedidoVendedor && pedido.estadoPago !== "CANCELADO" && 
      pedido.estadoPedido !== "CANCELADO"));

  return (
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
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px 20px",
          flex: "1",
          width: "100%",
        }}
      >
        <button
          onClick={() => navigate("/vendedor/gestionar-pedidos")}
          style={{
            background: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            color: "#5A8F48",
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
          ← Volver a Pedidos
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "25px",
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          {/* COLUMNA IZQUIERDA */}
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
                      margin: "4px 0 0 0",
                    }}
                  >
                    📅{" "}
                    {new Date(pedido.fechaPedido || pedido.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#2D3E2B",
                      margin: "8px 0 0 0",
                      fontWeight: "600",
                    }}
                  >
                    👤 Cliente: {pedido.consumidor?.usuario?.nombre || pedido.nombreCliente || "N/A"} {pedido.consumidor?.usuario?.apellido || ""}
                  </p>
                </div>
                <div
                  style={{
                    background: colorEstado.bg,
                    color: colorEstado.color,
                    border: `2px solid ${colorEstado.border}`,
                    padding: "10px 20px",
                    borderRadius: "20px",
                    fontWeight: "700",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {estadoParaMostrar}
                </div>
              </div>

              {/* Estados adicionales */}
              <div style={{
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: "1px solid #ECF2E3",
                display: "flex",
                flexWrap: "wrap",
                gap: "15px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "#6B7F69"
                }}>
                  <span style={{
                    background: pedido.estadoPago === "PAGADO" ? "#E8F5E3" : 
                              pedido.estadoPago === "PENDIENTE" ? "#FFF3E0" : "#FFEBEE",
                    color: pedido.estadoPago === "PAGADO" ? "#5A8F48" : 
                          pedido.estadoPago === "PENDIENTE" ? "#FF9800" : "#F44336",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontWeight: "600"
                  }}>
                    💳 {pedido.estadoPago || "PENDIENTE"}
                  </span>
                  <span>Pago</span>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "#6B7F69"
                }}>
                  <span style={{
                    background: "#F0F4ED",
                    color: "#6B7F69",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontWeight: "600"
                  }}>
                    📦 {pedido.estadoPedido || "PENDIENTE"}
                  </span>
                  <span>Pedido general</span>
                </div>

                {pedido.estadoSeguimiento && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#6B7F69"
                  }}>
                    <span style={{
                      background: "#E3F2FD",
                      color: "#2196F3",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontWeight: "600"
                    }}>
                      🚚 {pedido.estadoSeguimiento}
                    </span>
                    <span>Seguimiento</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de Productos */}
            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
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

              {detalles.length === 0 ? (
                <p style={{ color: "#6B7F69", textAlign: "center", padding: "20px" }}>
                  No hay productos en este pedido
                </p>
              ) : (
                detalles.map((d, i) => (
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
                        {d.producto?.nombreProducto || d.nombreProducto || "Producto"}
                      </strong>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "13px",
                          color: "#6B7F69",
                        }}
                      >
                        Cantidad: {d.cantidad} • Precio: $
                        {((d.subtotal || d.precio || 0) / d.cantidad).toFixed(2)}
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
                      ${(d.subtotal || d.precio || 0).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
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
                  ${(pedido.subtotal || 0).toFixed(2)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
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
                  ${(pedido.iva || 0).toFixed(2)}
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
                  Método de pago:
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                  }}
                >
                  {pedido.metodoPago || "No especificado"}
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
                  ${(pedido.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* 🔥 SECCIÓN DE COMPROBANTE (si es transferencia) */}
            {esTransferencia && (
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
                  📄 Comprobante de Pago
                </h2>
                
                <div style={{ marginBottom: "15px" }}>
                  <p style={{ fontSize: "14px", color: "#6B7F69", marginBottom: "10px" }}>
                    <strong>Método:</strong> {pedido.metodoPago}
                  </p>
                  {pedido.datosTarjeta && (
                    <p style={{ fontSize: "14px", color: "#6B7F69", marginBottom: "10px" }}>
                      <strong>Datos de pago:</strong> {pedido.datosTarjeta}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => setMostrarComprobante(!mostrarComprobante)}
                  style={{
                    width: "100%",
                    background: "#2196F3",
                    color: "white",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    marginBottom: mostrarComprobante ? "15px" : "0"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {mostrarComprobante ? "⬆️ Ocultar Comprobante" : "⬇️ Ver Comprobante"}
                </button>
                
                {mostrarComprobante && pedido.comprobanteUrl && (
                  <div style={{ 
                    marginTop: "15px", 
                    border: "1px solid #ECF2E3", 
                    borderRadius: "10px",
                    overflow: "hidden"
                  }}>
                    <img 
                      src={pedido.comprobanteUrl} 
                      alt="Comprobante de pago"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block"
                      }}
                    />
                    <div style={{ 
                      padding: "10px", 
                      background: "#F9FBF7",
                      textAlign: "center"
                    }}>
                      <a 
                        href={pedido.comprobanteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: "#5A8F48",
                          textDecoration: "none",
                          fontWeight: "600"
                        }}
                      >
                        🔗 Abrir comprobante en nueva pestaña
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 🔥 CAMBIAR ESTADO DEL VENDEDOR - CORREGIDO */}
            {debeMostrarSeccionEstado && (
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
                  {pedido.estadoPedidoVendedor ? "🔄 Cambiar Estado" : "🚀 Asignar Estado"}
                </h2>

                {proximosEstados.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {proximosEstados.map((estado) => (
                      <button
                        key={estado}
                        onClick={() => cambiarEstado(estado)}
                        disabled={actualizando}
                        style={{
                          width: "100%",
                          background: estado === "CANCELADO" ? "#E74C3C" : 
                                    estado === "EN_PROCESO" ? "#2196F3" :
                                    estado === "DESPACHADO" ? "#4CAF50" :
                                    estado === "ENTREGADO" ? "#5A8F48" : "#5A8F48",
                          color: "white",
                          padding: "12px",
                          fontSize: "14px",
                          fontWeight: "700",
                          borderRadius: "10px",
                          border: "none",
                          cursor: actualizando ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          opacity: actualizando ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!actualizando) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!actualizando) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }
                        }}
                      >
                        {estado === "NUEVO" ? "🆕 Marcar como Nuevo" :
                         estado === "EN_PROCESO" ? "⚙️ Marcar como En Proceso" :
                         estado === "DESPACHADO" ? "🚚 Marcar como Despachado" :
                         estado === "ENTREGADO" ? "✅ Marcar como Entregado" :
                         estado === "CANCELADO" ? "❌ Cancelar Pedido" : estado}
                      </button>
                    ))}
                  </div>
                ) : !pedido.estadoPedidoVendedor && (
                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={() => cambiarEstado("NUEVO")}
                      disabled={actualizando}
                      style={{
                        width: "100%",
                        background: "#5A8F48",
                        color: "white",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        borderRadius: "10px",
                        border: "none",
                        cursor: actualizando ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                        opacity: actualizando ? 0.6 : 1,
                        marginBottom: "10px"
                      }}
                    >
                      🆕 Marcar como Nuevo
                    </button>
                    <p style={{ fontSize: "12px", color: "#6B7F69" }}>
                      Asigna este pedido para comenzar a procesarlo
                    </p>
                  </div>
                )}
                
                <p style={{
                  fontSize: "12px",
                  color: "#6B7F69",
                  marginTop: "15px",
                  textAlign: "center",
                  fontStyle: "italic"
                }}>
                  Estado actual: {mapearNombreEstado(pedido.estadoPedidoVendedor) || "No asignado"}
                </p>
              </div>
            )}

            {/* Información adicional */}
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
                ℹ️ Información
              </h2>
              
              <div style={{ fontSize: "13px", color: "#6B7F69", lineHeight: "1.6" }}>
                <p><strong>ID Pedido:</strong> {pedido.idPedido}</p>
                <p><strong>Fecha creación:</strong> {new Date(pedido.fechaPedido || pedido.fecha).toLocaleString()}</p>
                <p><strong>Estado del pago:</strong> {pedido.estadoPago || "PENDIENTE"}</p>
                <p><strong>Estado del pedido:</strong> {pedido.estadoPedido || "PENDIENTE"}</p>
                <p><strong>Estado vendedor:</strong> {pedido.estadoPedidoVendedor || "No asignado"}</p>
                {pedido.direccion && (
                  <p><strong>Dirección:</strong> {pedido.direccion}</p>
                )}
                {pedido.telefonoContacto && (
                  <p><strong>Teléfono:</strong> {pedido.telefonoContacto}</p>
                )}
                {pedido.direccionEntrega && (
                  <p><strong>Dirección de entrega:</strong> {pedido.direccionEntrega}</p>
                )}
                {pedido.instruccionesEntrega && (
                  <p><strong>Instrucciones:</strong> {pedido.instruccionesEntrega}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}