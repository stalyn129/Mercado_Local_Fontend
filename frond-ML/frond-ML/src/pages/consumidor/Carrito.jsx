import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Footer from "../../components/Footer.jsx";


export default function Carrito() {
  const {
    carrito,
    actualizarCantidad,
    eliminarProducto,
    limpiarCarrito,
  } = useCarrito();

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIVA] = useState(0);
  const [total, setTotal] = useState(0);

  // Calcular totales
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

  // Comprar TODO el carrito
  const comprarCarrito = async () => {
    const usuario = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!usuario?.idConsumidor) return navigate("/loginmodal");

    if (carrito.length === 0) return alert("Tu carrito está vacío.");

    const firstVendedor = carrito[0].idVendedor;
    const mismoVendedor = carrito.every(
      (p) => p.idVendedor === firstVendedor
    );

    if (!mismoVendedor)
      return alert("Todos los productos deben ser del MISMO vendedor.");

    const body = {
      idConsumidor: usuario.idConsumidor,
      idVendedor: firstVendedor,
      metodoPago: "PENDIENTE",
      detalles: carrito.map((p) => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/pedidos/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al procesar el pedido");

      const pedido = await res.json();

      limpiarCarrito();
      navigate(`/pedido/${pedido.idPedido}`);
    } catch (err) {
      console.error(err);
      alert("Error al procesar la compra");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* HEADER SECTION */}
      <div style={{
        background: "white",
        borderRadius: "0 0 20px 20px",
        padding: "48px 32px",
        marginBottom: "40px",
        boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decoración de fondo */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
          borderRadius: "50%",
          opacity: "0.5",
          zIndex: "0"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "-30px",
          left: "-30px",
          width: "150px",
          height: "150px",
          background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
          borderRadius: "50%",
          opacity: "0.1",
          zIndex: "0"
        }}></div>

        <div style={{ position: "relative", zIndex: "1" }}>
          {/* Icono decorativo */}
          <div style={{
            fontSize: "56px",
            marginBottom: "16px",
            filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
          }}>
            🛒
          </div>

          {/* Título principal */}
          <h1 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#2D3E2B",
            marginBottom: "12px",
            letterSpacing: "-0.5px",
            lineHeight: "1.2"
          }}>
            Mi Carrito
          </h1>

          {/* Subtítulo */}
          <p style={{
            color: "#6B7F69",
            fontSize: "16px",
            margin: "0",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.6"
          }}>
            Revisa tus productos antes de finalizar tu compra
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px 40px 20px",
        flex: "1",
        width: "100%"
      }}>
        {carrito.length === 0 ? (
          // CARRITO VACÍO
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
            minHeight: "60vh"
          }}>
            <div style={{ fontSize: "80px", marginBottom: "24px" }}>🛒</div>
            <h2 style={{
              color: "#2D3E2B",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 12px 0"
            }}>
              Tu carrito está vacío
            </h2>
            <p style={{
              color: "#6B7F69",
              fontSize: "16px",
              marginBottom: "32px"
            }}>
              ¡Explora nuestros productos y añade tus favoritos!
            </p>
            <button
              onClick={() => navigate("/explorar")}
              style={{
                padding: "16px 40px",
                background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                border: "none",
                color: "white",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "16px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
              }}
            >
              Explorar Productos
            </button>
          </div>
        ) : (
          // CARRITO CON PRODUCTOS
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px",
            alignItems: "start"
          }}>
            {/* LISTA DE PRODUCTOS */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
            }}>
              {/* Header de la lista */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
                paddingBottom: "20px",
                borderBottom: "2px solid #ECF2E3"
              }}>
                <div>
                  <h2 style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#2D3E2B",
                    margin: "0 0 6px 0"
                  }}>
                    Productos en tu carrito
                  </h2>
                  <p style={{
                    color: "#6B7F69",
                    fontSize: "14px",
                    margin: "0"
                  }}>
                    {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                
                {carrito.length > 0 && (
                  <button
                    onClick={limpiarCarrito}
                    style={{
                      padding: "10px 20px",
                      background: "#FFF0F2",
                      color: "#DA3E52",
                      border: "2px solid #DA3E52",
                      borderRadius: "10px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#DA3E52";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#FFF0F2";
                      e.target.style.color = "#DA3E52";
                    }}
                  >
                    🗑️ Vaciar carrito
                  </button>
                )}
              </div>

              {/* Productos */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {carrito.map((item, index) => (
                  <div
                    key={item.idProducto}
                    style={{
                      display: "flex",
                      gap: "20px",
                      padding: "20px",
                      background: "#F9FBF7",
                      borderRadius: "16px",
                      border: "2px solid #ECF2E3",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#5A8F48";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(90, 143, 72, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#ECF2E3";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Imagen del producto */}
                    <div style={{
                      position: "relative",
                      flexShrink: 0
                    }}>
                      <img
                        src={item.imagenProducto}
                        alt={item.nombreProducto}
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "12px",
                          objectFit: "cover",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                      />
                    </div>

                    {/* Información del producto */}
                    <div style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}>
                      <div>
                        <h3 style={{
                          margin: "0 0 6px 0",
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#2D3E2B",
                          lineHeight: "1.3"
                        }}>
                          {item.nombreProducto}
                        </h3>
                        
                        <p style={{
                          margin: "0 0 12px 0",
                          color: "#6B7F69",
                          fontSize: "14px",
                          fontWeight: "500"
                        }}>
                          {item.nombreSubcategoria || "Sin categoría"}
                        </p>

                        <div style={{
                          fontSize: "22px",
                          fontWeight: "800",
                          color: "#5A8F48"
                        }}>
                          ${item.precioProducto.toFixed(2)}
                        </div>
                      </div>

                      {/* Controles de cantidad */}
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "12px"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          background: "white",
                          padding: "6px",
                          borderRadius: "10px",
                          border: "2px solid #ECF2E3"
                        }}>
                          <button
                            onClick={() => actualizarCantidad(item.idProducto, item.cantidad - 1)}
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#F9FBF7",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "700",
                              fontSize: "18px",
                              color: "#5A8F48",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#5A8F48";
                              e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "#F9FBF7";
                              e.target.style.color = "#5A8F48";
                            }}
                          >
                            −
                          </button>

                          <span style={{
                            minWidth: "40px",
                            textAlign: "center",
                            fontWeight: "700",
                            fontSize: "16px",
                            color: "#2D3E2B"
                          }}>
                            {item.cantidad}
                          </span>

                          <button
                            onClick={() => actualizarCantidad(item.idProducto, item.cantidad + 1)}
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#F9FBF7",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "700",
                              fontSize: "18px",
                              color: "#5A8F48",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#5A8F48";
                              e.target.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "#F9FBF7";
                              e.target.style.color = "#5A8F48";
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal del producto */}
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px"
                        }}>
                          <div style={{
                            textAlign: "right"
                          }}>
                            <p style={{
                              margin: "0 0 2px 0",
                              fontSize: "12px",
                              color: "#6B7F69",
                              fontWeight: "600"
                            }}>
                              Subtotal
                            </p>
                            <p style={{
                              margin: "0",
                              fontSize: "20px",
                              fontWeight: "800",
                              color: "#2D3E2B"
                            }}>
                              ${(item.precioProducto * item.cantidad).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => eliminarProducto(item.idProducto)}
                            style={{
                              width: "40px",
                              height: "40px",
                              background: "#FFF0F2",
                              border: "2px solid #DA3E52",
                              borderRadius: "10px",
                              cursor: "pointer",
                              color: "#DA3E52",
                              fontWeight: "700",
                              fontSize: "18px",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#DA3E52";
                              e.target.style.color = "white";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "#FFF0F2";
                              e.target.style.color = "#DA3E52";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RESUMEN DE COMPRA */}
            <div style={{
              position: "sticky",
              top: "20px"
            }}>
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
              }}>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#2D3E2B",
                  marginBottom: "24px",
                  paddingBottom: "16px",
                  borderBottom: "2px solid #ECF2E3"
                }}>
                  📋 Resumen de Compra
                </h2>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{
                      color: "#6B7F69",
                      fontSize: "15px",
                      fontWeight: "600"
                    }}>
                      Subtotal
                    </span>
                    <span style={{
                      color: "#2D3E2B",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{
                      color: "#6B7F69",
                      fontSize: "15px",
                      fontWeight: "600"
                    }}>
                      IVA (12%)
                    </span>
                    <span style={{
                      color: "#2D3E2B",
                      fontSize: "18px",
                      fontWeight: "700"
                    }}>
                      ${iva.toFixed(2)}
                    </span>
                  </div>

                  <div style={{
                    height: "1px",
                    background: "#ECF2E3",
                    margin: "8px 0"
                  }}></div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
                    borderRadius: "12px"
                  }}>
                    <span style={{
                      color: "#2D3E2B",
                      fontSize: "18px",
                      fontWeight: "800"
                    }}>
                      Total
                    </span>
                    <span style={{
                      color: "#5A8F48",
                      fontSize: "28px",
                      fontWeight: "900"
                    }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={comprarCarrito}
                  style={{
                    width: "100%",
                    padding: "18px",
                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    border: "none",
                    color: "white",
                    borderRadius: "14px",
                    fontWeight: "800",
                    cursor: "pointer",
                    fontSize: "17px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)",
                    marginBottom: "16px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
                  }}
                >
                  🛍️ Finalizar Compra
                </button>

                <button
                  onClick={() => navigate("/explorar")}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "white",
                    border: "2px solid #5A8F48",
                    color: "#5A8F48",
                    borderRadius: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "15px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#F9FBF7";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                  }}
                >
                  ← Seguir Comprando
                </button>

                {/* Info adicional */}
                <div style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "#F9FBF7",
                  borderRadius: "12px",
                  border: "1px solid #ECF2E3"
                }}>
                  <p style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    color: "#6B7F69",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>✓</span> Compra segura y protegida
                  </p>
                  <p style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    color: "#6B7F69",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>✓</span> Productos frescos y orgánicos
                  </p>
                  <p style={{
                    margin: "0",
                    fontSize: "13px",
                    color: "#6B7F69",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>✓</span> Envío coordinado con el vendedor
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer normal (no fijo) */}
      <Footer />
    </div>
  );
}