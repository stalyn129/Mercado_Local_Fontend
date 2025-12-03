import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PedidoDetalle() {
  // ⬅️ Importante: coincidencia exacta con la ruta
  const { idPedido } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Estados nuevos
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [finalizando, setFinalizando] = useState(false);

  // =========================================
  // CARGAR PEDIDO + DETALLES
  // =========================================
  const cargarPedido = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return navigate("/loginmodal");
    }

    try {
      // 1️⃣ Obtener pedido
      const resPedido = await fetch(`${API_URL}/pedidos/${idPedido}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resPedido.ok) throw new Error("No se pudo cargar el pedido");

      const dataPedido = await resPedido.json();

      // 2️⃣ Obtener detalles
      const resDetalles = await fetch(
        `${API_URL}/pedidos/${idPedido}/detalles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resDetalles.ok)
        throw new Error("No se pudieron cargar los detalles");

      const dataDetalles = await resDetalles.json();

      setPedido(dataPedido);
      setDetalles(dataDetalles);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando pedido:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedido();
  }, [idPedido]);

  // =========================================
  // FINALIZAR COMPRA
  // =========================================
  const finalizarCompra = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/loginmodal");

    setFinalizando(true);

    try {
      const res = await fetch(
        `${API_URL}/pedidos/finalizar/${idPedido}?metodoPago=${metodoPago}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("No se pudo finalizar el pedido");

      alert("🎉 Compra finalizada con éxito!");

      navigate("/"); // redirige al home o donde quieras
    } catch (err) {
      console.error("Error al finalizar:", err);
      alert("❌ Error finalizando la compra");
    }

    setFinalizando(false);
  };

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <div
        style={{
          padding: "50px",
          fontSize: "28px",
          textAlign: "center",
          color: "#5A8F48",
        }}
      >
        Cargando pedido...
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================
  if (!pedido) {
    return (
      <div
        style={{
          padding: "50px",
          fontSize: "22px",
          textAlign: "center",
          color: "#C0392B",
        }}
      >
        Error cargando el pedido ❌
      </div>
    );
  }

  // =========================================
  // VISTA PRINCIPAL
  // =========================================
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      {/* Fuente */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        `}
      </style>

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate(-1)}
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
        }}
      >
        ← Volver
      </button>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 8px 32px rgba(90, 143, 72, 0.12)",
        }}
      >
        {/* TITULO */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "34px",
            fontWeight: "900",
            color: "#2D3E2B",
            marginBottom: "10px",
          }}
        >
          📦 Pedido #{pedido.idPedido}
        </h1>

        <p style={{ fontSize: "16px", color: "#6B7F69" }}>
          Estado:{" "}
          <strong style={{ color: "#2D3E2B" }}>{pedido.estadoPedido}</strong>
        </p>

        <p style={{ fontSize: "16px", color: "#6B7F69" }}>
          Fecha: {new Date(pedido.fechaPedido).toLocaleString()}
        </p>

        <hr style={{ margin: "25px 0", borderColor: "#ECF2E3" }} />

        {/* DETALLES */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px",
            marginBottom: "15px",
            color: "#2D3E2B",
          }}
        >
          🛒 Detalles del pedido
        </h2>

        {detalles.length === 0 ? (
          <p>No hay detalles.</p>
        ) : (
          detalles.map((d, i) => (
            <div
              key={i}
              style={{
                background: "#F9FBF7",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                }}
              >
                {d.producto?.nombreProducto || "Producto sin nombre"}
              </p>

              <p style={{ margin: 0, color: "#6B7F69" }}>
                Cantidad: <strong>{d.cantidad}</strong>
              </p>

              <p
                style={{
                  margin: 0,
                  color: "#2D3E2B",
                  fontWeight: "700",
                }}
              >
                ${parseFloat(d.subtotal).toFixed(2)}
              </p>
            </div>
          ))
        )}

        <hr style={{ margin: "25px 0", borderColor: "#ECF2E3" }} />

        {/* RESUMEN */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px",
            marginBottom: "10px",
            color: "#2D3E2B",
          }}
        >
          💰 Resumen
        </h2>

        <p style={{ color: "#6B7F69", fontSize: "16px" }}>
          Subtotal:{" "}
          <strong style={{ color: "#2D3E2B" }}>
            ${parseFloat(pedido.subtotal).toFixed(2)}
          </strong>
        </p>

        <p style={{ color: "#6B7F69", fontSize: "16px" }}>
          IVA:{" "}
          <strong style={{ color: "#2D3E2B" }}>
            ${parseFloat(pedido.iva).toFixed(2)}
          </strong>
        </p>

        <p
          style={{
            fontSize: "22px",
            fontWeight: "900",
            color: "#2D3E2B",
            marginTop: "10px",
          }}
        >
          TOTAL: ${parseFloat(pedido.total).toFixed(2)}
        </p>

        <hr style={{ margin: "25px 0", borderColor: "#ECF2E3" }} />

        {/* MÉTODO DE PAGO */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px",
            marginBottom: "10px",
            color: "#2D3E2B",
          }}
        >
          💳 Método de pago
        </h2>

        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #B5C9A8",
            fontSize: "16px",
            marginBottom: "20px",
            width: "100%",
          }}
        >
          <option value="EFECTIVO">Efectivo</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="TARJETA">Tarjeta</option>
        </select>

        {/* BOTÓN FINALIZAR */}
        <button
          onClick={finalizarCompra}
          disabled={finalizando}
          style={{
            width: "100%",
            background: finalizando ? "#9EB59A" : "#5A8F48",
            color: "white",
            padding: "15px",
            fontSize: "18px",
            fontWeight: "700",
            borderRadius: "14px",
            border: "none",
            cursor: finalizando ? "not-allowed" : "pointer",
            boxShadow: "0 4px 15px rgba(90, 143, 72, 0.25)",
            marginTop: "20px",
          }}
        >
          {finalizando ? "Procesando..." : "Finalizar Compra ✔"}
        </button>
      </div>
    </div>
  );
}
