import { useCarrito } from "../context/CarritoContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Carrito() {
  const { carrito, setCarrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIVA] = useState(0);
  const [total, setTotal] = useState(0);

  // Calcular precios automáticamente
  useEffect(() => {
    const sub = carrito.reduce(
      (acc, item) => acc + item.precioProducto * item.cantidad,
      0
    );
    const ivaCalc = sub * 0.12;
    const totalCalc = sub + ivaCalc;

    setSubtotal(sub);
    setIVA(ivaCalc);
    setTotal(totalCalc);
  }, [carrito]);

  const actualizarCantidad = (id, nuevaCantidad) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.idProducto === id
          ? { ...item, cantidad: Math.max(1, nuevaCantidad) }
          : item
      )
    );
  };

  const eliminarProducto = (id) => {
    setCarrito((prev) => prev.filter((item) => item.idProducto !== id));
  };

  const comprarCarrito = async () => {
    const usuario = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!usuario?.idConsumidor) {
      return navigate("/login");
    }

    if (carrito.length === 0) {
      return alert("Tu carrito está vacío");
    }

    // TODOS los productos deben ser del mismo vendedor…
    const firstVendedor = carrito[0].idVendedor;
    const mismoVendedor = carrito.every(
      (item) => item.idVendedor === firstVendedor
    );

    if (!mismoVendedor) {
      return alert("Todos los productos deben ser del MISMO vendedor.");
    }

    const body = {
      idConsumidor: usuario.idConsumidor,
      idVendedor: firstVendedor,
      metodoPago: "TARJETA",
      detalles: carrito.map((producto) => ({
        idProducto: producto.idProducto,
        cantidad: producto.cantidad,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/pedidos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error en la compra");

      const pedido = await res.json();

      limpiarCarrito();

      navigate(`/pedido/${pedido.idPedido}`);
    } catch (err) {
      console.error(err);
      alert("Error al procesar compra");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
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

      <h1
        style={{
          fontSize: "32px",
          fontFamily: "'Playfair Display', serif",
          fontWeight: "900",
          color: "#2D3E2B",
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        🛒 Tu Carrito
      </h1>

      {carrito.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "600",
            color: "#5A8F48",
          }}
        >
          Tu carrito está vacío 😢
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "65% 35%",
            gap: "30px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Lista de productos */}
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
            }}
          >
            {carrito.map((item) => (
              <div
                key={item.idProducto}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px",
                  borderBottom: "1px solid #ECF2E3",
                  paddingBottom: "20px",
                }}
              >
                <img
                  src={item.imagenProducto}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    marginRight: "20px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: "0",
                      fontWeight: "700",
                      color: "#2D3E2B",
                    }}
                  >
                    {item.nombreProducto}
                  </h3>

                  <p
                    style={{
                      margin: "4px 0",
                      fontSize: "14px",
                      color: "#6B7F69",
                    }}
                  >
                    ${item.precioProducto.toFixed(2)}
                  </p>

                  {/* Cantidad */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      onClick={() =>
                        actualizarCantidad(item.idProducto, item.cantidad - 1)
                      }
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#F9FBF7",
                        border: "1px solid #ECF2E3",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>

                    <div
                      style={{
                        width: "35px",
                        textAlign: "center",
                        fontWeight: "700",
                      }}
                    >
                      {item.cantidad}
                    </div>

                    <button
                      onClick={() =>
                        actualizarCantidad(item.idProducto, item.cantidad + 1)
                      }
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#F9FBF7",
                        border: "1px solid #ECF2E3",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => eliminarProducto(item.idProducto)}
                  style={{
                    background: "#FFCDD2",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    color: "#C62828",
                  }}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
              height: "fit-content",
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: "800",
                marginBottom: "10px",
                color: "#2D3E2B",
              }}
            >
              🧾 Resumen
            </h2>

            <p style={{ color: "#6B7F69" }}>
              Subtotal: <strong>${subtotal.toFixed(2)}</strong>
            </p>
            <p style={{ color: "#6B7F69" }}>
              IVA (12%): <strong>${iva.toFixed(2)}</strong>
            </p>
            <p
              style={{
                color: "#2D3E2B",
                fontWeight: "900",
                fontSize: "20px",
                marginTop: "10px",
              }}
            >
              Total: ${total.toFixed(2)}
            </p>

            <button
              onClick={comprarCarrito}
              style={{
                marginTop: "20px",
                width: "100%",
                background: "#5A8F48",
                color: "white",
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              Comprar Ahora 🛍️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
