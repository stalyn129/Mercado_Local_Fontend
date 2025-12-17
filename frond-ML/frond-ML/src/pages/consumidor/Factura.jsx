import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Factura() {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);

  const facturaRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/loginmodal");

    fetch(`${API_URL}/pedidos/${idPedido}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setPedido);

    fetch(`${API_URL}/pedidos/${idPedido}/detalles`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setDetalles);
  }, [idPedido]);

  const descargarPDF = async () => {
    const canvas = await html2canvas(facturaRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`Factura_Pedido_${idPedido}.pdf`);
  };

  if (!pedido) return <p style={{ padding: 50 }}>Cargando factura...</p>;

  return (
    <div style={{ background: "#F9FBF7", minHeight: "100vh", padding: 40 }}>
      
      {/* FACTURA */}
      <div
        ref={facturaRef}
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "white",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>
          🧾 FACTURA
        </h1>

        <hr />

        <p><strong>Pedido:</strong> #{pedido.idPedido}</p>
        <p><strong>Fecha:</strong> {new Date(pedido.fechaPedido).toLocaleString()}</p>
        <p><strong>Método de pago:</strong> {pedido.metodoPago}</p>
        <p><strong>Estado:</strong> {pedido.estadoPedido}</p>

        <hr />

        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Producto</th>
              <th align="center">Cantidad</th>
              <th align="right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((d, i) => (
              <tr key={i}>
                <td>{d.producto.nombreProducto}</td>
                <td align="center">{d.cantidad}</td>
                <td align="right">${d.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <p><strong>Subtotal:</strong> ${pedido.subtotal.toFixed(2)}</p>
        <p><strong>IVA:</strong> ${pedido.iva.toFixed(2)}</p>
        <h3><strong>Total:</strong> ${pedido.total.toFixed(2)}</h3>
      </div>

      {/* BOTONES */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={descargarPDF}
          style={{
            padding: "14px 30px",
            background: "#5A8F48",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "700",
            cursor: "pointer",
            marginRight: 15
          }}
        >
          📄 Descargar PDF
        </button>

        <button
          onClick={() => navigate("/mis-pedidos")}
          style={{
            padding: "14px 30px",
            background: "#ddd",
            border: "none",
            borderRadius: 10,
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Ver mis pedidos
        </button>
      </div>
    </div>
  );
}
