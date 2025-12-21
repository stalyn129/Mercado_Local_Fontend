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

  const cargarPedido = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/loginmodal");

    try {
      const resPedido = await fetch(
        `${API_URL}/pedidos/vendedor/detalle/${idPedido}`,
        {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resPedido.ok) {
        throw new Error("No autorizado para ver el pedido");
      }

      const dataPedido = await resPedido.json();

      setPedido(dataPedido);
      setDetalles(dataPedido.detalles || []);
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

  const cambiarEstado = async (nuevoEstado) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.token) return navigate("/loginmodal");

  if (!confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

  setActualizando(true);

  try {
    const res = await fetch(
      `${API_URL}/pedidos/estado/${idPedido}?estado=${nuevoEstado}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    );

    if (!res.ok) throw new Error("Error al cambiar estado");

    alert("✅ Estado actualizado correctamente");
    cargarPedido();
  } catch (err) {
    console.error("❌ Error:", err);
    alert("❌ Error al actualizar el estado");
  } finally {
    setActualizando(false);
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

  const estadoColors = {
    PENDIENTE: "#F4B419",
    PENDIENTE_VERIFICACION: "#F4B419",
    PROCESANDO: "#4A90E2",
    COMPLETADO: "#5A8F48",
    CANCELADO: "#E74C3C",
  };

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
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          maxWidth: "1100px",
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
                    {new Date(pedido.fechaPedido).toLocaleDateString("es-ES", {
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
                    👤 Cliente: {pedido.consumidor?.usuario?.nombre || "N/A"}
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
                  ${pedido.subtotal.toFixed(2)}
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
                  ${pedido.iva.toFixed(2)}
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
                  {pedido.metodoPago}
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

            {/* Cambiar Estado */}
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
                🔄 Cambiar Estado
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => cambiarEstado("PROCESANDO")}
                  disabled={actualizando}
                  style={{
                    width: "100%",
                    background: "#4A90E2",
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
                >
                  📦 En Proceso
                </button>

                <button
                  onClick={() => cambiarEstado("COMPLETADO")}
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
                  }}
                >
                  ✅ Completado
                </button>

                <button
                  onClick={() => cambiarEstado("CANCELADO")}
                  disabled={actualizando}
                  style={{
                    width: "100%",
                    background: "#E74C3C",
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
                >
                  ❌ Cancelado
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}