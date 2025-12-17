import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MisPedidos() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.idConsumidor) {
      navigate("/loginmodal");
      return;
    }

    fetch(`${API_URL}/pedidos/consumidor/${user.idConsumidor}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando pedidos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        Cargando pedidos...
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
        <h1 style={{ marginBottom: 30, color: "#2D3E2B" }}>
          📦 Mis pedidos
        </h1>

        {pedidos.length === 0 ? (
          <p>No tienes pedidos todavía.</p>
        ) : (
          pedidos.map(p => (
            <div
              key={p.idPedido}
              style={{
                background: "white",
                padding: 20,
                borderRadius: 12,
                marginBottom: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>
                  Pedido #{p.idPedido}
                </h3>
                <p style={{ margin: "6px 0", color: "#6B7F69" }}>
                  Fecha: {new Date(p.fechaPedido).toLocaleString()}
                </p>
                <p style={{ margin: 0 }}>
                  Estado:{" "}
                  <strong style={{ color: "#5A8F48" }}>
                    {p.estadoPedido}
                  </strong>
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: "700", fontSize: 18 }}>
                  ${p.total.toFixed(2)}
                </p>

                <button
                  onClick={() => navigate(`/pedido/${p.idPedido}`)}
                  style={{
                    marginRight: 8,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: "#ECF2E3"
                  }}
                >
                  Ver
                </button>

                <button
                  onClick={() => navigate(`/factura/${p.idPedido}`)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: "#5A8F48",
                    color: "white"
                  }}
                >
                  Factura
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
