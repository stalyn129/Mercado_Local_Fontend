import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function PedidoDetalle() {
  const { idPedido } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [numTarjeta, setNumTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [fechaTarjeta, setFechaTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  const cargarPedido = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) return navigate("/loginmodal");

  try {
    // ================= PEDIDO =================
    const resPedido = await fetch(`${API_URL}/pedidos/${idPedido}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resPedido.ok) {
      console.error("Error pedido:", resPedido.status);
      throw new Error("No autorizado para ver el pedido");
    }

    const dataPedido = await resPedido.json();

    // ================= DETALLES =================
    const resDetalles = await fetch(
      `${API_URL}/pedidos/${idPedido}/detalles`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!resDetalles.ok) {
      console.error("Error detalles:", resDetalles.status);
      throw new Error("No autorizado para ver los detalles");
    }

    const dataDetalles = await resDetalles.json();

    setPedido(dataPedido);
    setDetalles(dataDetalles);
    setLoading(false);

  } catch (err) {
    console.error("❌ Error cargando pedido:", err);
    setLoading(false);
  }
};


  useEffect(() => {
    cargarPedido();
  }, [idPedido]);

  const finalizarCompra = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/loginmodal");

    setFinalizando(true);

    try {
      let body;

      if (metodoPago === "TRANSFERENCIA" || metodoPago === "TARJETA") {
        body = new FormData();
        body.append("metodoPago", metodoPago);

        if (metodoPago === "TRANSFERENCIA" && comprobante) {
          body.append("comprobante", comprobante);
        }

        if (metodoPago === "TARJETA") {
          body.append("numTarjeta", numTarjeta);
          body.append("cvv", cvv);
          body.append("fechaTarjeta", fechaTarjeta);
          body.append("titular", titular);
        }
      } else {
        body = JSON.stringify({
          metodoPago,
          montoEfectivo,
        });
      }

      const res = await fetch(
        `${API_URL}/pedidos/finalizar/${idPedido}`,
        {
          method: "PUT",
          headers:
            metodoPago === "EFECTIVO"
              ? {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                }
              : {
                  Authorization: `Bearer ${token}`,
                },
          body,
        }
      );

      if (!res.ok) throw new Error("No se pudo finalizar el pedido");

      alert("🎉 Compra finalizada con éxito!");
      navigate("/");
    } catch (err) {
      console.error("Error al finalizar:", err);
      alert("❌ Error finalizando compra");
    }

    setFinalizando(false);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "100px", 
        textAlign: "center",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        minHeight: "100vh",
        fontSize: "24px",
        color: "#6B7F69"
      }}>
        Cargando pedido...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div style={{
        padding: "100px",
        textAlign: "center",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        minHeight: "100vh"
      }}>
        <h2 style={{ color: "#2D3E2B" }}>❌ Error cargando pedido</h2>
        <button 
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            background: "#5A8F48",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const estadoColors = {
    PENDIENTE: "#F4B419",
    PROCESANDO: "#4A90E2",
    COMPLETADO: "#5A8F48",
    CANCELADO: "#E74C3C"
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        input:focus, select:focus {
          outline: none;
          border-color: #5A8F48 !important;
          box-shadow: 0 0 0 3px rgba(90, 143, 72, 0.1);
        }

        * {
          box-sizing: border-box;
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px", flex: "1", width: "100%" }}>
        
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
            transition: "all 0.3s ease"
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
          ← Volver
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "25px", animation: "fadeIn 0.5s ease-out" }}>
          
          {/* COLUMNA IZQUIERDA - Productos y Detalles */}
          <div>
            {/* Header del Pedido */}
            <div style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: "900",
                    margin: "0 0 6px 0",
                    fontSize: "32px",
                    color: "#2D3E2B"
                  }}>
                    📦 Pedido #{pedido.idPedido}
                  </h1>
                  <p style={{ 
                    fontSize: "13px", 
                    color: "#6B7F69",
                    margin: 0
                  }}>
                    📅 {new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div style={{
                  background: estadoColors[pedido.estadoPedido] || "#6B7F69",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "13px",
                  whiteSpace: "nowrap"
                }}>
                  {pedido.estadoPedido}
                </div>
              </div>
            </div>

            {/* Lista de Productos */}
            <div style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "18px",
                marginTop: 0
              }}>
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
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Imagen del producto */}
                  {d.producto?.imagenProducto && (
                    <img 
                      src={d.producto.imagenProducto}
                      alt={d.producto.nombreProducto}
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "10px",
                        objectFit: "cover",
                        flexShrink: 0
                      }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ 
                      fontSize: "15px", 
                      color: "#2D3E2B",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {d.producto?.nombreProducto || "Producto"}
                    </strong>
                    <p style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "13px", 
                      color: "#6B7F69" 
                    }}>
                      Cantidad: {d.cantidad} • Precio: ${(d.subtotal / d.cantidad).toFixed(2)}
                    </p>
                  </div>

                  <div style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "#5A8F48",
                    whiteSpace: "nowrap",
                    flexShrink: 0
                  }}>
                    ${d.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA - Resumen y Pago */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Resumen de Compra */}
            <div style={{
              background: "linear-gradient(135deg, #F9D94A 0%, #F5C542 100%)",
              padding: "22px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "14px",
                marginTop: 0
              }}>
                💰 Resumen
              </h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", color: "#2D3E2B" }}>Subtotal:</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#2D3E2B" }}>
                  ${pedido.subtotal.toFixed(2)}
                </span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontSize: "14px", color: "#2D3E2B" }}>IVA (15%):</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#2D3E2B" }}>
                  ${pedido.iva.toFixed(2)}
                </span>
              </div>
              
              <div style={{
                borderTop: "2px solid rgba(45, 62, 43, 0.2)",
                paddingTop: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#2D3E2B" }}>Total:</span>
                <span style={{ fontSize: "26px", fontWeight: "900", color: "#2D3E2B" }}>
                  ${pedido.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Método de Pago */}
            <div style={{
              background: "white",
              padding: "22px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "14px",
                marginTop: 0
              }}>
                💳 Método de pago
              </h2>

              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                style={{
                  padding: "12px",
                  width: "100%",
                  borderRadius: "10px",
                  border: "2px solid #ECF2E3",
                  marginBottom: "16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#2D3E2B",
                  cursor: "pointer",
                  background: "white",
                  transition: "all 0.3s ease"
                }}
              >
                <option value="EFECTIVO">💵 Efectivo</option>
                <option value="TRANSFERENCIA">🏦 Transferencia</option>
                <option value="TARJETA">💳 Tarjeta</option>
              </select>

              {/* EFECTIVO */}
              {metodoPago === "EFECTIVO" && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <label style={{
                    display: "block",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "6px",
                    fontSize: "13px"
                  }}>
                    Monto recibido:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value)}
                    placeholder="Ej: 50.00"
                    style={{
                      padding: "12px",
                      width: "100%",
                      borderRadius: "10px",
                      border: "2px solid #ECF2E3",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                  />
                  {montoEfectivo && parseFloat(montoEfectivo) >= pedido.total && (
                    <p style={{
                      marginTop: "8px",
                      marginBottom: 0,
                      color: "#5A8F48",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}>
                      ✓ Cambio: ${(parseFloat(montoEfectivo) - pedido.total).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* TRANSFERENCIA */}
              {metodoPago === "TRANSFERENCIA" && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <label style={{
                    display: "block",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "6px",
                    fontSize: "13px"
                  }}>
                    Subir comprobante:
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setComprobante(e.target.files[0])}
                    style={{
                      padding: "10px",
                      width: "100%",
                      borderRadius: "10px",
                      border: "2px solid #ECF2E3",
                      background: "white",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  />
                  {comprobante && (
                    <p style={{
                      marginTop: "8px",
                      marginBottom: 0,
                      color: "#5A8F48",
                      fontSize: "12px",
                      fontWeight: "600",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      ✓ {comprobante.name}
                    </p>
                  )}
                </div>
              )}

              {/* TARJETA */}
              {metodoPago === "TARJETA" && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                  <label style={labelStyle}>Número de tarjeta:</label>
                  <input
                    type="text"
                    value={numTarjeta}
                    onChange={(e) => setNumTarjeta(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    style={inputStyle}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}>CVV:</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        maxLength="4"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Expiración:</label>
                      <input
                        type="month"
                        value={fechaTarjeta}
                        onChange={(e) => setFechaTarjeta(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <label style={labelStyle}>Titular:</label>
                  <input
                    type="text"
                    value={titular}
                    onChange={(e) => setTitular(e.target.value)}
                    placeholder="Nombre completo"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            {/* BOTÓN FINALIZAR */}
            <button
              onClick={finalizarCompra}
              disabled={finalizando}
              style={{
                width: "100%",
                background: finalizando ? "#98A598" : "#5A8F48",
                color: "white",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "700",
                borderRadius: "12px",
                border: "none",
                cursor: finalizando ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: finalizando ? "none" : "0 4px 12px rgba(90, 143, 72, 0.3)"
              }}
              onMouseEnter={(e) => {
                if (!finalizando) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 20px rgba(90, 143, 72, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!finalizando) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.3)";
                }
              }}
            >
              {finalizando ? "⏳ Procesando..." : "✔ Finalizar Compra"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontWeight: "600",
  color: "#2D3E2B",
  marginBottom: "6px",
  fontSize: "13px"
};

const inputStyle = {
  padding: "12px",
  width: "100%",
  borderRadius: "10px",
  border: "2px solid #ECF2E3",
  marginBottom: "12px",
  fontSize: "14px",
  transition: "all 0.3s ease"
};