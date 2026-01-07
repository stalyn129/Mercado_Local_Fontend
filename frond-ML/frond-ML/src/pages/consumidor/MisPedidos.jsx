import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper para formatear dinero de forma segura
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

// Helper para formatear la fecha de forma más amigable
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

export default function MisPedidos() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados que permiten ver factura
  const estadosConFactura = ["PENDIENTE_VERIFICACION", "COMPLETADO"];

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/loginmodal");
      return;
    }

    fetch(`${API_URL}/pedidos/mis-pedidos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        return res.json();
      })
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando pedidos:", err);
        setLoading(false);
      });
  }, []);

  // 🔥 FILTRO DEFINITIVO - Solo mostrar pedidos válidos
  const pedidosVisibles = pedidos.filter(p =>
    p.total > 0 &&
    ["PENDIENTE_VERIFICACION", "COMPLETADO"].includes(p.estadoPedido)
  );

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🛒</div>
        <p style={{ color: "#6B7F69", fontSize: 16 }}>
          Cargando tus compras...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        padding: "40px 20px"
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 12, color: "#2D3E2B", fontSize: 32 }}>
          🛍️ Mis compras
        </h1>
        <p style={{ marginBottom: 30, color: "#6B7F69", fontSize: 16 }}>
          Aquí puedes ver el historial de todas tus compras
        </p>

        {pedidosVisibles.length === 0 ? (
          <div style={{
            background: "white",
            padding: 60,
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
            <h3 style={{ color: "#2D3E2B", marginBottom: 8 }}>
              Aún no tienes compras realizadas
            </h3>
            <p style={{ color: "#6B7F69" }}>
              Solo se muestran pedidos pagados o en verificación
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                background: "#5A8F48",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 500
              }}
            >
              Ir a la tienda
            </button>
          </div>
        ) : (
          pedidosVisibles.map((p) => (
            <div
              key={p.idPedido}
              style={{
                background: "white",
                padding: 24,
                borderRadius: 12,
                marginBottom: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>
                    {getEstadoEmoji(p.estadoPedido)}
                  </span>
                  <h3 style={{ margin: 0, fontSize: 18, color: "#2D3E2B" }}>
                    Compra del {formatearFecha(p.fechaPedido).split(',')[0]}
                  </h3>
                </div>
                
                <p style={{ margin: "4px 0", color: "#6B7F69", fontSize: 14 }}>
                  📅 {formatearFecha(p.fechaPedido)}
                </p>
                
                <div style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: p.estadoPedido === "COMPLETADO" 
                    ? "#E8F5E9" 
                    : "#FFF8E1",
                  fontSize: 13,
                  fontWeight: 500,
                  color: p.estadoPedido === "COMPLETADO" 
                    ? "#2E7D32" 
                    : "#F57C00"
                }}>
                  {getEstadoLabel(p.estadoPedido)}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ 
                  fontWeight: "700", 
                  fontSize: 24, 
                  color: "#2D3E2B",
                  margin: "0 0 12px 0"
                }}>
                  ${money(p.total)}
                </p>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => navigate(`/pedido/${p.idPedido}`)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 8,
                      border: "1px solid #5A8F48",
                      cursor: "pointer",
                      background: "white",
                      color: "#5A8F48",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#ECF2E3";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "white";
                    }}
                  >
                    Ver detalles
                  </button>

                  <button
                    onClick={() => navigate(`/factura/${p.idPedido}`)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      background: "#5A8F48",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#4A7A38";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#5A8F48";
                    }}
                  >
                    📄 Ver factura
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}