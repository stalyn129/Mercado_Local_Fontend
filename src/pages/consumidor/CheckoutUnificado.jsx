import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Footer from "../../components/Footer.jsx";

export default function CheckoutUnificado() {
  const { carrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [numTarjeta, setNumTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [fechaTarjeta, setFechaTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Calcular totales
  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const iva = subtotal * 0.12;
  const total = subtotal + iva;

  // 🆕 AGRUPAR PRODUCTOS POR VENDEDOR (para mostrar visualmente)
  const productosPorVendedor = carrito.reduce((acc, item) => {
    const vendedorId = item.producto.vendedor?.idVendedor || 'sin-vendedor';
    const vendedorNombre = item.producto.vendedor?.nombre || 'Vendedor Desconocido';

    if (!acc[vendedorId]) {
      acc[vendedorId] = {
        vendedorId,
        vendedorNombre,
        productos: [],
        subtotal: 0
      };
    }

    acc[vendedorId].productos.push(item);
    acc[vendedorId].subtotal += item.producto.precio * item.cantidad;

    return acc;
  }, {});

  const vendedores = Object.values(productosPorVendedor);

  // Validar formulario
  const validarFormulario = () => {
    if (metodoPago === "EFECTIVO") {
      if (!montoEfectivo || montoEfectivo.trim() === "") {
        alert("❌ Debes ingresar el monto con el que pagarás");
        return false;
      }
      if (parseFloat(montoEfectivo) < total) {
        alert("❌ El monto debe ser mayor o igual al total");
        return false;
      }
      return true;
    }

    if (metodoPago === "TRANSFERENCIA") {
      if (!comprobante) {
        alert("❌ Debes subir el comprobante de transferencia");
        return false;
      }
      return true;
    }

    if (metodoPago === "TARJETA") {
      if (!numTarjeta || numTarjeta.replace(/\s/g, "").length < 15) {
        alert("❌ Número de tarjeta inválido");
        return false;
      }
      if (!cvv || cvv.length < 3) {
        alert("❌ CVV inválido");
        return false;
      }
      if (!fechaTarjeta) {
        alert("❌ Fecha de expiración requerida");
        return false;
      }

      const [anio, mes] = fechaTarjeta.split("-");
      const fechaSeleccionada = new Date(parseInt(anio), parseInt(mes) - 1);
      const hoy = new Date();
      const mesActual = new Date(hoy.getFullYear(), hoy.getMonth());

      if (fechaSeleccionada < mesActual) {
        alert("❌ La tarjeta está vencida");
        return false;
      }

      if (!titular.trim()) {
        alert("❌ Nombre del titular requerido");
        return false;
      }
      return true;
    }

    return true;
  };

  // 🔥 FINALIZAR COMPRA CON MÚLTIPLES PEDIDOS (UNO POR VENDEDOR)
  const finalizarCompra = async () => {
    if (!validarFormulario()) return;

    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.idConsumidor) {
      alert("❌ Debes iniciar sesión");
      navigate("/loginmodal");
      return;
    }

    // 🔥 Generar ID de compra unificada ANTES de crear los pedidos
    const idCompraUnificada = `COMPRA-${Date.now()}-${user.idConsumidor}`;

    const confirmar = window.confirm(
      `¿Confirmar compra por $${total.toFixed(2)} con ${metodoPago}?\n\n` +
      `Se crearán ${vendedores.length} pedido(s) para ${vendedores.length} vendedor(es)`
    );
    if (!confirmar) return;

    setProcesando(true);

    try {
      // 1️⃣ MODIFICAR: Enviar el idCompraUnificada al backend
      console.log("🔵 Creando pedidos con ID de compra:", idCompraUnificada);
      const resCheckout = await fetch(`${API_URL}/pedidos/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idConsumidor: user.idConsumidor,
          idCompraUnificada: idCompraUnificada, // 🔥 NUEVO
        }),
      });

      if (!resCheckout.ok) {
        throw new Error("Error al crear pedidos");
      }

      // 2️⃣ APLICAR MÉTODO DE PAGO A CADA PEDIDO
      const pedidos = await resCheckout.json();
      console.log("✅ Pedidos creados:", pedidos);

      // Preparar body según método de pago
      let body;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      // (Mantén tu lógica existente de preparación de body según método de pago)
      if (metodoPago === "EFECTIVO") {
        headers["Content-Type"] = "application/json";
        const montoFinal = montoEfectivo && parseFloat(montoEfectivo) >= total
          ? parseFloat(montoEfectivo)
          : total;

        body = JSON.stringify({
          metodoPago: "EFECTIVO",
          montoEfectivo: montoFinal
        });
      } else if (metodoPago === "TRANSFERENCIA") {
        body = new FormData();
        body.append("metodoPago", "TRANSFERENCIA");
        if (comprobante) {
          body.append("comprobante", comprobante);
        }
      } else if (metodoPago === "TARJETA") {
        body = new FormData();
        body.append("metodoPago", "TARJETA");
        body.append("numTarjeta", numTarjeta.replace(/\s/g, ""));
        body.append("cvv", cvv);
        body.append("fechaTarjeta", fechaTarjeta);
        body.append("titular", titular);
      }

      // 🔥 FINALIZAR CADA PEDIDO
      const promesasFinalizacion = pedidos.map(async (pedido) => {
        const resFinalizar = await fetch(
          `${API_URL}/pedidos/finalizar/${pedido.idPedido}`,
          {
            method: "PUT",
            headers: headers,
            body: body,
          }
        );

        if (!resFinalizar.ok) {
          throw new Error(`Error al procesar pago del pedido #${pedido.idPedido}`);
        }

        return resFinalizar.json();
      });

      await Promise.all(promesasFinalizacion);
      console.log("✅ Todos los pedidos finalizados");

      // 3️⃣ LIMPIAR CARRITO
      await limpiarCarrito();

      // 4️⃣ 🔥 MODIFICAR: Redirigir a la vista de compra unificada
      alert(
        `🎉 ¡Compra realizada con éxito!\n\n` +
        `Total: $${total.toFixed(2)}\n` +
        `Se crearon ${pedidos.length} pedidos.\n` +
        `Redirigiendo a tu compra...`
      );

      // Redirigir a la nueva vista de compra unificada
      navigate(`/mi-compra/${idCompraUnificada}`, {
        state: {
          pedidos: pedidos,
          totalCompra: total,
          metodoPago: metodoPago
        }
      });

    } catch (err) {
      console.error("❌ Error:", err);
      alert(`❌ Error al procesar la compra: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  if (!carrito || carrito.length === 0) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)"
      }}>
        <h2 style={{ color: "#2D3E2B", marginBottom: "20px" }}>
          Tu carrito está vacío
        </h2>
        <button
          onClick={() => navigate("/explorar")}
          style={{
            padding: "12px 24px",
            background: "#5A8F48",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Explorar productos
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        padding: "40px 20px"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
        `}</style>

        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <button
            onClick={() => navigate("/carrito")}
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
              boxShadow: "0 2px 8px rgba(90, 143, 72, 0.1)"
            }}
          >
            ← Volver al carrito
          </button>

          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#2D3E2B",
              marginBottom: "10px",
              fontFamily: "'Playfair Display', serif"
            }}>
              🛒 Finalizar Compra
            </h1>
            <p style={{ fontSize: "16px", color: "#6B7F69", margin: 0 }}>
              {vendedores.length === 1
                ? "Revisa tus productos y selecciona tu método de pago"
                : `⚠️ Tu compra incluye productos de ${vendedores.length} vendedores diferentes. Se crearán ${vendedores.length} pedidos separados.`
              }
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px"
          }}>
            {/* PRODUCTOS AGRUPADOS POR VENDEDOR */}
            <div style={{
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <h2 style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "20px",
                fontFamily: "'Playfair Display', serif"
              }}>
                📦 Productos ({carrito.length})
              </h2>

              {/* 🆕 MOSTRAR PRODUCTOS AGRUPADOS POR VENDEDOR */}
              {vendedores.map((vendedor, vIndex) => (
                <div key={vIndex} style={{ marginBottom: "30px" }}>
                  {/* Header del vendedor */}
                  <div style={{
                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <strong style={{ fontSize: "16px", display: "block" }}>
                        🏪 {vendedor.vendedorNombre}
                      </strong>
                      <span style={{ fontSize: "12px", opacity: 0.9 }}>
                        {vendedor.productos.length} producto(s)
                      </span>
                    </div>
                    <span style={{ fontSize: "18px", fontWeight: "700" }}>
                      ${vendedor.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Productos del vendedor */}
                  {vendedor.productos.map((item, i) => (
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
                        marginLeft: "20px"
                      }}
                    >
                      {item.producto.imagen && (
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "10px",
                            objectFit: "cover"
                          }}
                        />
                      )}

                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: "15px", color: "#2D3E2B", display: "block" }}>
                          {item.producto.nombre}
                        </strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6B7F69" }}>
                          Cantidad: {item.cantidad} • ${item.producto.precio.toFixed(2)} c/u
                        </p>
                      </div>

                      <div style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        color: "#5A8F48"
                      }}>
                        ${(item.producto.precio * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* RESUMEN Y PAGO */}
            <div>
              <div style={{
                background: "linear-gradient(135deg, #F9D94A 0%, #F5C542 100%)",
                padding: "22px",
                borderRadius: "16px",
                marginBottom: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "14px",
                  marginTop: 0
                }}>
                  💰 Resumen Total
                </h2>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#2D3E2B" }}>Subtotal:</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#2D3E2B" }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontSize: "14px", color: "#2D3E2B" }}>IVA (12%):</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#2D3E2B" }}>
                    ${iva.toFixed(2)}
                  </span>
                </div>

                <div style={{
                  borderTop: "2px solid rgba(45, 62, 43, 0.2)",
                  paddingTop: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "#2D3E2B" }}>
                    Total:
                  </span>
                  <span style={{ fontSize: "26px", fontWeight: "900", color: "#2D3E2B" }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Método de Pago */}
              <div style={{
                background: "white",
                padding: "22px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <h2 style={{
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
                    cursor: "pointer"
                  }}
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia</option>
                  <option value="TARJETA">💳 Tarjeta</option>
                </select>

                {metodoPago === "EFECTIVO" && (
                  <div>
                    <div style={{
                      background: "#FFF3CD",
                      border: "2px solid #FFC107",
                      padding: "16px",
                      borderRadius: "12px",
                      marginBottom: "16px"
                    }}>
                      <p style={{ margin: 0, fontSize: "14px", color: "#856404", lineHeight: "1.6", fontWeight: "600" }}>
                        💵 <strong>Pago contra entrega</strong><br />
                        <span style={{ fontWeight: "normal" }}>
                          Pagarás <strong>${total.toFixed(2)}</strong> en efectivo cuando recibas tu pedido.
                        </span>
                      </p>
                    </div>

                    <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "6px", fontSize: "13px" }}>
                      Monto que entregarás (opcional):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={montoEfectivo}
                      onChange={(e) => setMontoEfectivo(e.target.value)}
                      placeholder={`Mínimo: $${total.toFixed(2)}`}
                      style={{
                        padding: "12px",
                        width: "100%",
                        borderRadius: "10px",
                        border: "2px solid #ECF2E3",
                        fontSize: "14px"
                      }}
                    />
                    {montoEfectivo && parseFloat(montoEfectivo) >= total && (
                      <p style={{ marginTop: "8px", marginBottom: 0, color: "#5A8F48", fontSize: "13px", fontWeight: "600" }}>
                        ✓ Cambio: ${(parseFloat(montoEfectivo) - total).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {metodoPago === "TRANSFERENCIA" && (
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "6px", fontSize: "13px" }}>
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
                      <p style={{ marginTop: "8px", marginBottom: 0, color: "#5A8F48", fontSize: "12px", fontWeight: "600" }}>
                        ✓ {comprobante.name}
                      </p>
                    )}
                  </div>
                )}

                {metodoPago === "TARJETA" && (
                  <div>
                    <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "6px", fontSize: "13px" }}>
                      Número de tarjeta:
                    </label>
                    <input
                      type="text"
                      value={numTarjeta}
                      onChange={(e) => setNumTarjeta(e.target.value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                      placeholder="0000 0000 0000 0000"
                      maxLength="19"
                      style={{
                        padding: "12px",
                        width: "100%",
                        borderRadius: "10px",
                        border: "2px solid #ECF2E3",
                        marginBottom: "12px",
                        fontSize: "14px"
                      }}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "6px", fontSize: "13px" }}>
                          CVV:
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          maxLength="4"
                          style={{
                            padding: "12px",
                            width: "100%",
                            borderRadius: "10px",
                            border: "2px solid #ECF2E3",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "6px", fontSize: "13px" }}>
                          Expiración:
                        </label>
                        <input
                          type="month"
                          value={fechaTarjeta}
                          onChange={(e) => setFechaTarjeta(e.target.value)}
                          style={{
                            padding: "12px",
                            width: "100%",
                            borderRadius: "10px",
                            border: "2px solid #ECF2E3",
                            fontSize: "14px"
                          }}
                        />
                      </div>
                    </div>

                    <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "6px", fontSize: "13px", marginTop: "12px" }}>
                      Titular:
                    </label>
                    <input
                      type="text"
                      value={titular}
                      onChange={(e) => setTitular(e.target.value)}
                      placeholder="Nombre completo"
                      style={{
                        padding: "12px",
                        width: "100%",
                        borderRadius: "10px",
                        border: "2px solid #ECF2E3",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={finalizarCompra}
                  disabled={procesando}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    background: procesando ? "#98A598" : "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    color: "white",
                    padding: "16px",
                    fontSize: "16px",
                    fontWeight: "700",
                    borderRadius: "12px",
                    border: "none",
                    cursor: procesando ? "not-allowed" : "pointer",
                    boxShadow: procesando ? "none" : "0 4px 12px rgba(90, 143, 72, 0.3)"
                  }}
                >
                  {procesando ? "⏳ Procesando..." : "✔ Finalizar Compra"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}