import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

// Helper para formatear dinero
const money = (value) =>
  value !== null && value !== undefined
    ? value.toFixed(2)
    : "0.00";

// Helper para mostrar estados en español
const getEstadoLabel = (estado) => {
  const estados = {
    PENDIENTE: "Pendiente de pago",
    PROCESANDO: "En proceso",
    PENDIENTE_VERIFICACION: "Verificando pago",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado"
  };
  return estados[estado] || estado;
};

// Helper para obtener el emoji del estado
const getEstadoEmoji = (estado) => {
  const emojis = {
    PENDIENTE: "⏳",
    PROCESANDO: "📦",
    PENDIENTE_VERIFICACION: "🔍",
    COMPLETADO: "✅",
    CANCELADO: "❌"
  };
  return emojis[estado] || "📋";
};

// Helper para formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const date = new Date(fecha);
  const opciones = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleDateString('es-ES', opciones);
};

export default function MiCompraUnificada() {
  const { idCompra } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [compraData, setCompraData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener datos pasados por estado (si vienen del historial)
  const datosDesdeHistorial = location.state || {};

  console.log("🔍 Parámetros recibidos:", { idCompra });
  console.log("🔍 Datos desde historial:", datosDesdeHistorial);

  useEffect(() => {
    const fetchCompraUnificada = async () => {
      const token = localStorage.getItem("authToken");

      if (!idCompra || idCompra === "undefined") {
        console.error("❌ ID de compra no válido:", idCompra);
        setError("ID de compra no válido");
        setLoading(false);

        // Si tenemos datos del historial, usarlos
        if (datosDesdeHistorial.compraData) {
          console.log("✅ Usando datos del historial");
          setCompraData(datosDesdeHistorial.compraData);
          setLoading(false);
        }
        return;
      }

      try {
        console.log(`📡 Buscando compra unificada: ${idCompra}`);

        const response = await fetch(`${API_URL}/pedidos/compra-unificada/${idCompra}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error del servidor: ${response.status}`, errorText);

          // Si el servidor da error, usar datos del historial
          if (datosDesdeHistorial.compraData) {
            console.log("⚠️ Usando datos del historial debido a error del servidor");
            setCompraData(datosDesdeHistorial.compraData);
            setLoading(false);
            return;
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("✅ Datos recibidos del backend:", data);
        setCompraData(data);

      } catch (err) {
        console.error("❌ Error cargando compra unificada:", err);

        // Si hay error pero tenemos datos del historial, usarlos
        if (datosDesdeHistorial.compraData) {
          console.log("✅ Usando datos del historial debido a error");
          setCompraData(datosDesdeHistorial.compraData);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Si ya tenemos datos del historial, no hacer fetch
    if (datosDesdeHistorial.compraData) {
      console.log("✅ Ya tenemos datos del historial, omitiendo fetch");
      setCompraData(datosDesdeHistorial.compraData);
      setLoading(false);
      return;
    }

    fetchCompraUnificada();
  }, [idCompra, API_URL, datosDesdeHistorial]);

  // Manejar el error en la línea 306 (probablemente relacionado con strings undefined)
  const safeString = (str) => {
    return str ? String(str).replace(/[^\w\s]/gi, '') : '';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "5px solid #ECF2E3",
          borderTop: "5px solid #5A8F48",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{
          marginTop: "20px",
          fontSize: "16px",
          color: "#6B7F69",
          fontWeight: "600"
        }}>
          Cargando detalles de la compra...
        </p>
      </div>
    );
  }

  if (error && !compraData) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "40px"
      }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
        <h2 style={{ color: "#C62828", marginBottom: "10px" }}>Error</h2>
        <p style={{ color: "#6B7F69", textAlign: "center", marginBottom: "20px" }}>
          {error}
        </p>
        <button
          onClick={() => navigate("/mis-pedidos")}
          style={{
            padding: "14px 28px",
            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
            border: "none",
            color: "white",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "15px",
            transition: "all 0.3s ease"
          }}
        >
          Volver a mis compras
        </button>
      </div>
    );
  }

  // Si no hay datos del historial ni del backend
  if (!compraData) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "40px"
      }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
        <h2 style={{ color: "#2D3E2B", marginBottom: "10px" }}>Compra no encontrada</h2>
        <p style={{ color: "#6B7F69", textAlign: "center", marginBottom: "20px" }}>
          No se encontraron datos para la compra #{idCompra || "desconocida"}
        </p>
        <button
          onClick={() => navigate("/mis-pedidos")}
          style={{
            padding: "14px 28px",
            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
            border: "none",
            color: "white",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "15px",
            transition: "all 0.3s ease"
          }}
        >
          Volver a mis compras
        </button>
      </div>
    );
  }

  // Datos de la compra (vienen del historial o del backend)
  const {
    idCompraUnificada = idCompra,
    pedidos = [],
    totalGeneral = 0,
    metodoPago = 'PENDIENTE',
    estadoCompra = 'PROCESANDO',
    fechaCompra,
    cantidadPedidos = pedidos.length,
    cantidadVendedores = 0
  } = compraData;

  // Calcular cantidad de vendedores si no viene
  const vendedoresUnicos = new Set();
  pedidos.forEach(pedido => {
    const idVendedor = pedido.vendedor?.idVendedor || pedido.idVendedor;
    if (idVendedor) vendedoresUnicos.add(idVendedor);
  });

  const vendedoresCount = cantidadVendedores > 0 ? cantidadVendedores : vendedoresUnicos.size;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>

      {/* HEADER */}
      <div style={{
        background: "white",
        borderRadius: "0 0 20px 20px",
        padding: "40px 32px",
        marginBottom: "40px",
        boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
        position: "relative"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Botón volver */}
          <button
            onClick={() => navigate("/mis-pedidos")}
            style={{
              background: "none",
              border: "none",
              color: "#5A8F48",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
              padding: "8px 0"
            }}
          >
            ← Volver a mis compras
          </button>

          {/* Título */}
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#6B7F69",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Detalles de Compra Unificada
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "700",
            color: "#2D3E2B",
            margin: "0 0 16px 0",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Compra #{idCompraUnificada}
          </h1>

          {/* Resumen */}
          <div style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "20px"
          }}>
            <div style={{
              background: "#E8F5E9",
              padding: "16px 24px",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px"
            }}>
              <div style={{ fontSize: "14px", color: "#6B7F69", marginBottom: "4px" }}>
                Total de la compra
              </div>
              <div style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#5A8F48",
                fontFamily: "'Playfair Display', serif"
              }}>
                ${money(totalGeneral)}
              </div>
            </div>

            <div style={{
              background: "#ECF2E3",
              padding: "16px 24px",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px"
            }}>
              <div style={{ fontSize: "14px", color: "#6B7F69", marginBottom: "4px" }}>
                Estado
              </div>
              <div style={{
                fontSize: "18px",
                fontWeight: "700",
                color: estadoCompra === "COMPLETADA" ? "#2E7D32" :
                  estadoCompra === "PENDIENTE" ? "#856404" : "#F57C00"
              }}>
                {estadoCompra === "COMPLETADA" ? "✅ Completada" :
                  estadoCompra === "PENDIENTE" ? "⏳ Pendiente" :
                    "🔄 En proceso"}
              </div>
            </div>

            <div style={{
              background: "#FFF3CD",
              padding: "16px 24px",
              borderRadius: "12px",
              flex: "1",
              minWidth: "200px"
            }}>
              <div style={{ fontSize: "14px", color: "#6B7F69", marginBottom: "4px" }}>
                Método de pago
              </div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#5A8F48" }}>
                {metodoPago === 'EFECTIVO' ? '💵 Efectivo' :
                  metodoPago === 'TRANSFERENCIA' ? '🏦 Transferencia' :
                    metodoPago === 'TARJETA' ? '💳 Tarjeta' : metodoPago}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        marginBottom: "80px"
      }}>
        {/* Estadísticas */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "40px",
          flexWrap: "wrap"
        }}>
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(90, 143, 72, 0.1)",
            flex: "1",
            minWidth: "250px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "36px", color: "#5A8F48", marginBottom: "8px" }}>
              {cantidadPedidos}
            </div>
            <div style={{ fontSize: "16px", color: "#6B7F69", fontWeight: "600" }}>
              Pedidos
            </div>
          </div>

          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(90, 143, 72, 0.1)",
            flex: "1",
            minWidth: "250px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "36px", color: "#5A8F48", marginBottom: "8px" }}>
              {vendedoresCount}
            </div>
            <div style={{ fontSize: "16px", color: "#6B7F69", fontWeight: "600" }}>
              Vendedores
            </div>
          </div>

          {fechaCompra && (
            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(90, 143, 72, 0.1)",
              flex: "1",
              minWidth: "250px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "20px", color: "#5A8F48", marginBottom: "8px" }}>
                {new Date(fechaCompra).toLocaleDateString('es-ES')}
              </div>
              <div style={{ fontSize: "16px", color: "#6B7F69", fontWeight: "600" }}>
                Fecha de compra
              </div>
            </div>
          )}
        </div>

        {/* LISTA DE PEDIDOS */}
        <h2 style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#2D3E2B",
          marginBottom: "24px",
          fontFamily: "'Playfair Display', serif"
        }}>
          📦 Pedidos incluidos ({pedidos.length})
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {pedidos.map((pedido, index) => {
            const pedidoId = pedido.idPedido || pedido.id;
            const totalPedido = pedido.total || pedido.montoTotal || 0;
            const estadoPedido = pedido.estadoPedido || pedido.estado;

            return (
              <div
                key={pedidoId || index}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap",
                  marginBottom: "20px"
                }}>
                  {/* Sección izquierda - Info del pedido */}
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: "32px" }}>
                        {getEstadoEmoji(estadoPedido)}
                      </span>
                      <h3 style={{
                        margin: 0,
                        fontSize: "22px",
                        color: "#2D3E2B",
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontWeight: "700"
                      }}>
                        Pedido #{pedidoId}
                      </h3>
                    </div>

                    {/* Fecha */}
                    {pedido.fechaPedido && (
                      <p style={{
                        margin: "8px 0 12px 0",
                        color: "#6B7F69",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span style={{ fontSize: "18px" }}>📅</span>
                        {formatearFecha(pedido.fechaPedido)}
                      </p>
                    )}

                    {/* Vendedor */}
                    {pedido.vendedor && (
                      <div style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "12px",
                        background: "#ECF2E3",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#5A8F48",
                        marginRight: "8px",
                        marginBottom: "8px"
                      }}>
                        Vendedor: {pedido.vendedor.nombre || `#${pedido.vendedor.idVendedor}`}
                      </div>
                    )}

                    {/* Estado */}
                    <div style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: estadoPedido === "COMPLETADO"
                        ? "#E8F5E9"
                        : estadoPedido === "PENDIENTE"
                          ? "#FFF3CD"
                          : estadoPedido === "CANCELADO"
                            ? "#FFEBEE"
                            : "#FFF8E1",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: estadoPedido === "COMPLETADO"
                        ? "#2E7D32"
                        : estadoPedido === "PENDIENTE"
                          ? "#856404"
                          : estadoPedido === "CANCELADO"
                            ? "#C62828"
                            : "#F57C00"
                    }}>
                      {getEstadoLabel(estadoPedido)}
                    </div>
                  </div>

                  {/* Sección derecha - Precio y acciones */}
                  <div style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 16
                  }}>
                    {/* Precio */}
                    <div style={{
                      fontWeight: "800",
                      fontSize: "36px",
                      color: "#5A8F48",
                      fontFamily: "'Playfair Display', 'Georgia', serif",
                      lineHeight: 1
                    }}>
                      ${money(totalPedido)}
                    </div>

                    {/* Botones de acción */}
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pedido/${pedidoId}`);
                        }}
                        style={{
                          padding: "12px 24px",
                          borderRadius: "12px",
                          border: "2px solid #5A8F48",
                          cursor: "pointer",
                          background: "white",
                          color: "#5A8F48",
                          fontSize: "15px",
                          fontWeight: "700",
                          transition: "all 0.3s ease",
                          whiteSpace: "nowrap",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#ECF2E3";
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

                      {estadoPedido === "COMPLETADO" || estadoPedido === "PENDIENTE_VERIFICACION" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navegar a la factura consolidada de toda la compra
                              navigate(`/factura-consolidada/${idCompraUnificada}`, {
                                state: {
                                  compraData: compraData  // Pasar los datos de la compra completa
                                }
                              });
                            }}
                            style={{
                              padding: "12px 24px",
                              borderRadius: "12px",
                              border: "none",
                              cursor: "pointer",
                              background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                              color: "white",
                              fontSize: "15px",
                              fontWeight: "700",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 12px rgba(156, 39, 176, 0.25)",
                              whiteSpace: "nowrap",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 6px 16px rgba(156, 39, 176, 0.35)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 4px 12px rgba(156, 39, 176, 0.25)";
                            }}
                          >
                            <span>📄</span>
                            Ver factura consolidada
                          </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón volver */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/mis-pedidos")}
            style={{
              padding: "14px 28px",
              background: "white",
              border: "2px solid #5A8F48",
              color: "#5A8F48",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "15px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#ECF2E3";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
            }}
          >
            ← Volver al historial de compras
          </button>
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