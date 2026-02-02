import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../../config/api.js";

export default function ProductosPorVendedor() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/productos/vendedor/${id}`)
      .then(res => res.json())
      .then(data => setProductos(data));
  }, [id]);

  if (!productos.length) return <p>Cargando productos...</p>;

  return (
    <div style={styles.grid}>
      {productos.map(p => (
        <div key={p.id} style={styles.card}>
          <img src={p.imagen} />
          <h4>{p.nombre}</h4>
          <p>${p.precio}</p>
        </div>
      ))}
    </div>
  );
}
