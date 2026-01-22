import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function GestionarPedidos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.href = "/loginmodal";

    cargarPedidos(user.idVendedor, user.token);
  }, []);

  const cargarPedidos = async (idVendedor, token) => {
    try {
      const res = await fetch(`${API_URL}/pedidos/vendedor/${idVendedor}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      // Normalizar los datos
      const pedidosNormalizados = data
        .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
        .map(p => ({
          idPedido: p.idPedido,
          idPedidoVendedor: p.idPedidoVendedor, // Este ID es específico para el vendedor
          nombreCliente: p.consumidor?.usuario
            ? `${p.consumidor.usuario.nombre} ${p.consumidor.usuario.apellido}`
            : "Cliente sin nombre",
          total: p.total,
          fecha: p.fechaPedido,
          estadoPedido: p.estadoPedido, // Estado general del pedido
          estadoPedidoVendedor: p.estadoPedidoVendedor, // Estado específico del vendedor
          estadoPago: p.estadoPago, // Estado del pago
          estadoSeguimiento: p.estadoSeguimientoPedido // Estado de seguimiento
        }));

      console.log("✅ Pedidos normalizados:", pedidosNormalizados);
      setPedidos(pedidosNormalizados);
    } catch (err) {
      console.error("❌ Error cargando pedidos:", err);
      alert("Error al cargar los pedidos. Por favor verifica la consola.");
    } finally {
      setCargando(false);
    }
  };

  // Función para cambiar el estado del pedido del vendedor
  const cambiarEstadoPedido = async (idPedidoVendedor, nuevoEstado, token) => {
    try {
      const res = await fetch(`${API_URL}/pedidos/vendedor/${idPedidoVendedor}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          estadoPedidoVendedor: nuevoEstado
        })
      });

      if (res.ok) {
        alert("Estado actualizado correctamente");
        // Recargar pedidos
        const user = JSON.parse(localStorage.getItem("user"));
        cargarPedidos(user.idVendedor, user.token);
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("Error al actualizar el estado");
    }
  };

  // Determinar qué estado mostrar según el flujo
  const obtenerEstadoParaMostrar = (pedido) => {
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
      // Mapear estados del vendedor a nombres más amigables
      const estadoMap = {
        "NUEVO": "Nuevo",
        "EN_PROCESO": "En Proceso",
        "DESPACHADO": "Despachado",
        "ENTREGADO": "Entregado",
        "CANCELADO": "Cancelado"
      };
      return estadoMap[pedido.estadoPedidoVendedor] || pedido.estadoPedidoVendedor;
    }
    
    return pedido.estadoPedido || "Pendiente";
  };

  // Obtener los próximos estados disponibles según el estado actual
  const obtenerProximosEstados = (pedido) => {
    const estadosDisponibles = [];
    const estadoActual = pedido.estadoPedidoVendedor;
    const estadoPago = pedido.estadoPago;

    // Solo permitir cambios si el pago está confirmado y no está cancelado
    if (estadoPago !== "PAGADO" || 
        pedido.estadoPedido === "CANCELADO" || 
        pedido.estadoPago === "CANCELADO") {
      return [];
    }

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
      default:
        // Si no tiene estado, empezar como NUEVO
        estadosDisponibles.push("NUEVO");
    }

    return estadosDisponibles;
  };

  const obtenerColorEstado = (estado) => {
    const estados = {
      "Nuevo": { bg: "#FFF9E6", color: "#F5C744" },
      "En Proceso": { bg: "#E3F2FD", color: "#2196F3" },
      "Despachado": { bg: "#E8F5E9", color: "#4CAF50" },
      "Entregado": { bg: "#E8F5E3", color: "#5A8F48" },
      "Cancelado": { bg: "#FFE8EC", color: "#DA3E52" },
      "Esperando pago": { bg: "#FFF3E0", color: "#FF9800" },
      "Verificando pago": { bg: "#E1F5FE", color: "#03A9F4" },
      "Pago rechazado": { bg: "#FFEBEE", color: "#F44336" }
    };
    return estados[estado] || { bg: "#F0F4ED", color: "#6B7F69" };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      {/* Contenedor Principal */}
      <div style={{
        maxWidth: "1400px",
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
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* ... (mismo header que antes) ... */}
        </div>

        {/* Tabla de Pedidos */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1000px"
            }}>
              <thead>
                <tr style={{
                  background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                  fontWeight: "700",
                  color: "#2D3E2B"
                }}>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>N° Pedido</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cliente</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fecha</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="6" style={{
                      textAlign: "center",
                      padding: "80px 20px",
                      color: "#6B7F69",
                      fontSize: "15px"
                    }}>
                      {/* Loading spinner */}
                    </td>
                  </tr>
                ) : pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{
                      textAlign: "center",
                      padding: "80px 20px"
                    }}>
                      {/* Empty state */}
                    </td>
                  </tr>
                ) : (
                  pedidos.map((p, index) => {
                    const estadoParaMostrar = obtenerEstadoParaMostrar(p);
                    const proximosEstados = obtenerProximosEstados(p);
                    const user = JSON.parse(localStorage.getItem("user"));

                    return (
                      <tr key={p.idPedidoVendedor || p.idPedido}>
                        <td style={{
                          padding: "16px",
                          fontWeight: "700",
                          color: "#5A8F48",
                          fontSize: "15px"
                        }}>
                          #{index + 1}
                        </td>

                        <td style={{
                          padding: "16px",
                          fontWeight: "600",
                          color: "#2D3E2B",
                          fontSize: "14px"
                        }}>
                          {p.nombreCliente}
                        </td>

                        <td style={{
                          padding: "16px",
                          fontWeight: "700",
                          color: "#5A8F48",
                          fontSize: "16px"
                        }}>
                          ${typeof p.total === 'number' ? p.total.toFixed(2) : p.total}
                        </td>

                        <td style={{
                          padding: "16px",
                          color: "#6B7F69",
                          fontSize: "14px",
                          fontWeight: "500"
                        }}>
                          {new Date(p.fecha).toLocaleDateString("es-EC", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>

                        <td style={{ padding: "16px" }}>
                          <span style={{
                            background: obtenerColorEstado(estadoParaMostrar).bg,
                            color: obtenerColorEstado(estadoParaMostrar).color,
                            padding: "8px 16px",
                            borderRadius: "24px",
                            fontSize: "13px",
                            fontWeight: "700",
                            display: "inline-block",
                            marginBottom: "8px"
                          }}>
                            {estadoParaMostrar}
                          </span>
                          
                          {/* Indicador de pago */}
                          {p.estadoPago && (
                            <div style={{
                              fontSize: "12px",
                              color: "#6B7F69",
                              marginTop: "4px"
                            }}>
                              {p.estadoPago === "PAGADO" ? "✅ Pago confirmado" : 
                               p.estadoPago === "PENDIENTE" ? "⏳ Pago pendiente" : 
                               `Pago: ${p.estadoPago.toLowerCase()}`}
                            </div>
                          )}
                        </td>

                        <td style={{
                          padding: "16px",
                          textAlign: "center",
                          minWidth: "200px"
                        }}>
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            alignItems: "center"
                          }}>
                            <button
                              onClick={() => window.location.href = `/vendedor/pedido/${p.idPedido}`}
                              style={{
                                background: "#E3F2FD",
                                color: "#2196F3",
                                border: "2px solid #2196F3",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "13px",
                                transition: "all 0.3s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                width: "100%",
                                justifyContent: "center"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#2196F3";
                                e.target.style.color = "white";
                                e.target.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "#E3F2FD";
                                e.target.style.color = "#2196F3";
                                e.target.style.transform = "translateY(0)";
                              }}
                            >
                              🔍 Ver Detalles
                            </button>
                            
                            {/* Selector de estado (solo si hay estados disponibles) */}
                            {proximosEstados.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    cambiarEstadoPedido(p.idPedidoVendedor, e.target.value, user.token);
                                    e.target.value = ""; // Reset select
                                  }
                                }}
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: "8px",
                                  border: "2px solid #5A8F48",
                                  background: "white",
                                  color: "#2D3E2B",
                                  fontWeight: "600",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  width: "100%"
                                }}
                              >
                                <option value="">Cambiar estado...</option>
                                {proximosEstados.map((estado) => (
                                  <option key={estado} value={estado}>
                                    {estado === "EN_PROCESO" ? "Marcar como En Proceso" :
                                     estado === "DESPACHADO" ? "Marcar como Despachado" :
                                     estado === "ENTREGADO" ? "Marcar como Entregado" :
                                     estado === "CANCELADO" ? "Cancelar pedido" : estado}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          {pedidos.length > 0 && (
            <div style={{
              padding: "24px 28px",
              background: "#FAFCF8",
              borderTop: "2px solid #ECF2E3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              color: "#6B7F69",
              fontWeight: "500"
            }}>
              <span>
                Mostrando <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{pedidos.length}</strong> pedidos
              </span>
              <div style={{ display: "flex", gap: "20px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#5A8F48" }}>
                  📊 Total de pedidos
                </span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#2196F3" }}>
                  📋 Estados: Nuevo → En Proceso → Despachado → Entregado
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}