import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function Pedido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const user = JSON.parse(localStorage.getItem("user"));

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedido();
  }, []);

  const cargarPedido = async () => {
    try {
      const res = await fetch(`${API}/pedidos/${id}/detalles`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await res.json();
      setPedido(data);
    } catch (error) {
      console.error("Error cargando pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando pedido...</p>;
  if (!pedido) return <p>No se encontró el pedido</p>;

  return (
    <>
      <div className="contenedor">
        <h2>📦 Pedido #{pedido.id}</h2>

        <p><strong>Estado:</strong> {pedido.estado}</p>
        <p><strong>Total:</strong> ${pedido.total}</p>

        <h3>Detalles</h3>
        {pedido.detalles?.map((d) => (
          <div key={d.id} className="detalle">
            <span>{d.producto.nombre}</span>
            <span>x{d.cantidad}</span>
            <span>${d.subtotal}</span>
          </div>
        ))}

        <button onClick={() => navigate(`/factura/${pedido.id}`)}>
          Ver factura
        </button>
      </div>

      <Footer />
    </>
  );
}
