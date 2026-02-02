import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Notificaciones from "../../components/Notificaciones.jsx";
import useNotification from "../../hooks/useNotification.jsx";
import Footer from "../../components/Footer.jsx";

export default function CheckoutUnificado() {
  const { carrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Hook de notificaciones - CORREGIDO EL NOMBRE
  const { 
    notificacion, 
    setNotificacion,
    confirmacionPago,
    setConfirmacionPago,
    confirmacionesPago,
    notificaciones
  } = useNotification(); // ✅ useNotification en lugar de useNotificacion

  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [numTarjeta, setNumTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [mesExpiracion, setMesExpiracion] = useState("");
  const [anioExpiracion, setAnioExpiracion] = useState("");
  const [titular, setTitular] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [circlePositions, setCirclePositions] = useState([]);

  // ==================== ANIMACIÓN DE CÍRCULOS ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",
        "rgba(52, 211, 153, 0.15)",
        "rgba(59, 130, 246, 0.15)",
        "rgba(168, 85, 247, 0.15)",
        "rgba(239, 68, 68, 0.15)",
        "rgba(245, 158, 11, 0.15)",
        "rgba(14, 165, 233, 0.15)",
        "rgba(236, 72, 153, 0.15)"
      ];
      
      for (let i = 0; i < 10; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 4 + 2 + "px",
          zIndex: 0
        });
      }
      setCirclePositions(circles);
    };

    generateCircles();
    
    const interval = setInterval(() => {
      setCirclePositions(prev => 
        prev.map(circle => ({
          ...circle,
          top: Math.random() * 100,
          left: Math.random() * 100,
          animationDelay: Math.random() * 4 + "s"
        }))
      );
    }, 35000);

    return () => clearInterval(interval);
  }, []);

  // ==================== CÁLCULOS ====================
  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const iva = subtotal * 0.12;
  const total = subtotal + iva;

  // ==================== VALIDACIÓN ====================
  const validarFormulario = () => {
    if (metodoPago === "EFECTIVO") {
      if (!montoEfectivo || montoEfectivo.trim() === "") {
        notificaciones.error("Monto requerido", "Debes ingresar el monto con el que pagarás");
        return false;
      }
      if (parseFloat(montoEfectivo) < total) {
        notificaciones.error("Monto insuficiente", "El monto debe ser mayor o igual al total");
        return false;
      }
      return true;
    }

    if (metodoPago === "TRANSFERENCIA") {
      if (!comprobante) {
        notificaciones.error("Comprobante requerido", "Debes subir el comprobante de transferencia");
        return false;
      }
      return true;
    }

    if (metodoPago === "TARJETA") {
      if (!numTarjeta || numTarjeta.replace(/\s/g, "").length < 15) {
        notificaciones.error("Tarjeta inválida", "Número de tarjeta inválido");
        return false;
      }
      if (!cvv || cvv.length < 3) {
        notificaciones.error("CVV inválido", "CVV inválido");
        return false;
      }
      if (!mesExpiracion || !anioExpiracion) {
        notificaciones.error("Fecha requerida", "Fecha de expiración requerida");
        return false;
      }

      const hoy = new Date();
      const mesActual = hoy.getMonth() + 1;
      const anioActual = hoy.getFullYear();

      if (parseInt(anioExpiracion) < anioActual || 
          (parseInt(anioExpiracion) === anioActual && parseInt(mesExpiracion) < mesActual)) {
        notificaciones.error("Tarjeta vencida", "La tarjeta está vencida");
        return false;
      }

      if (!titular.trim()) {
        notificaciones.error("Titular requerido", "Nombre del titular requerido");
        return false;
      }
      return true;
    }

    return true;
  };

  // ==================== FINALIZAR COMPRA ====================
  const finalizarCompra = async () => {
    // ✅ SE ELIMINÓ LA CONDICIÓN PROBLEMÁTICA
    if (!validarFormulario()) return;

    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.idConsumidor) {
      notificaciones.advertencia("Inicia sesión", "Debes iniciar sesión como consumidor para finalizar la compra");
      setTimeout(() => {
        navigate("/LoginModal");
      }, 1500);
      return;
    }

    const idCompraUnificada = `COMPRA-${Date.now()}-${user.idConsumidor}`;

    setProcesando(true);

    try {
      const resCheckout = await fetch(`${API_URL}/pedidos/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idConsumidor: user.idConsumidor,
          idCompraUnificada: idCompraUnificada,
        }),
      });

      if (!resCheckout.ok) {
        throw new Error("Error al crear pedidos");
      }

      const pedidos = await resCheckout.json();

      let body;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

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
        const fechaCompleta = `${anioExpiracion}-${mesExpiracion.padStart(2, '0')}`;
        body = new FormData();
        body.append("metodoPago", "TARJETA");
        body.append("numTarjeta", numTarjeta.replace(/\s/g, ""));
        body.append("cvv", cvv);
        body.append("fechaTarjeta", fechaCompleta);
        body.append("titular", titular);
      }

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
      await limpiarCarrito();

      notificaciones.exitoCompra(total);

      setTimeout(() => {
        if (pedidos && pedidos.length > 0) {
          navigate(`/pedido/${pedidos[0].idPedido}`);
        } else {
          navigate("/");
        }
      }, 2000);

    } catch (err) {
      console.error("❌ Error:", err);
      notificaciones.error("Error al procesar la compra", err.message);
    } finally {
      setProcesando(false);
    }
  };

  // ==================== MANEJAR CONFIRMACIÓN ====================
  const handleConfirmacionPago = () => {
    if (!validarFormulario()) return;

    if (metodoPago === "EFECTIVO") {
      confirmacionesPago.efectivo(
        total,
        parseFloat(montoEfectivo || total),
        finalizarCompra,
        () => {
          console.log("Compra cancelada");
        }
      );
    } else if (metodoPago === "TARJETA") {
      const tarjetaInfo = {
        numero: numTarjeta || "4111 1111 1111 1111",
        fecha: `${mesExpiracion.padStart(2, '0') || '08'} / ${anioExpiracion || '2032'}`,
        titular: titular || "Maura Calle"
      };
      
      confirmacionesPago.tarjeta(
        total,
        tarjetaInfo,
        finalizarCompra,
        () => {
          console.log("Compra cancelada");
        }
      );
    } else if (metodoPago === "TRANSFERENCIA") {
      confirmacionesPago.transferencia(
        total,
        comprobante,
        finalizarCompra,
        () => {
          console.log("Compra cancelada");
        }
      );
    } else {
      // Para otros métodos, ejecutar directamente
      finalizarCompra();
    }
  };

  // ==================== CARRITO VACÍO ====================
  if (!carrito || carrito.length === 0) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "50px 40px",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          maxWidth: "500px",
          width: "100%"
        }}>
          <div style={{ fontSize: "70px", marginBottom: "20px" }}>🛒</div>
          <h2 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "28px",
            fontWeight: "700",
            color: "#2C3E50",
            marginBottom: "15px"
          }}>
            Tu carrito está vacío
          </h2>
          <p style={{
            color: "#64748b",
            fontSize: "16px",
            marginBottom: "30px",
            lineHeight: "1.6"
          }}>
            Agrega productos antes de proceder al pago
          </p>
          <button
            onClick={() => navigate("/explorar")}
            style={{
              padding: "16px 32px",
              background: "#FF6B35",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.background = "#FF8E53";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#FF6B35";
            }}
          >
            Explorar productos
          </button>
        </div>
      </div>
    );
  }

  // ==================== DATOS PARA SELECTS ====================
  const anios = [];
  const anioActual = new Date().getFullYear();
  for (let i = anioActual; i <= anioActual + 10; i++) {
    anios.push(i);
  }

  const meses = [
    { valor: "01", nombre: "01" },
    { valor: "02", nombre: "02" },
    { valor: "03", nombre: "03" },
    { valor: "04", nombre: "04" },
    { valor: "05", nombre: "05" },
    { valor: "06", nombre: "06" },
    { valor: "07", nombre: "07" },
    { valor: "08", nombre: "08" },
    { valor: "09", nombre: "09" },
    { valor: "10", nombre: "10" },
    { valor: "11", nombre: "11" },
    { valor: "12", nombre: "12" }
  ];

  // ==================== RENDER ====================
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* NOTIFICACIONES */}
      <Notificaciones 
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        confirmacionPago={confirmacionPago}
        setConfirmacionPago={setConfirmacionPago}
        onConfirmarPago={() => {
          if (confirmacionPago?.onConfirmar) {
            confirmacionPago.onConfirmar();
          }
        }}
        onCancelarPago={() => {
          if (confirmacionPago?.onCancelar) {
            confirmacionPago.onCancelar();
          }
          setConfirmacionPago(null);
        }}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
      />
      
      {/* HEADER */}
      <div style={{
        background: "white",
        padding: "80px 20px 60px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "40px",
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {circlePositions.map(circle => (
          <div 
            key={circle.id}
            style={{
              position: "absolute",
              top: `${circle.top}%`,
              left: `${circle.left}%`,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              background: circle.color,
              borderRadius: "50%",
              animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
              animationDelay: circle.animationDelay,
              filter: `blur(${circle.blur})`,
              opacity: 0.8,
              zIndex: circle.zIndex
            }}
          />
        ))}

        <div style={{ position: "relative", zIndex: "10" }}>
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FF6B35",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Finalizar Compra
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "700",
            color: "#FF6B35",
            margin: "0 0 16px 0",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Checkout
          </h1>
          
          <p style={{
            color: "#8B5CF6",
            fontSize: "16px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6",
            fontWeight: "400",
            opacity: 0.8
          }}>
            Completa tu compra de manera segura
          </p>
        </div>
      </div>

      {/* BOTÓN VOLVER */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 30px auto",
        padding: "0 20px"
      }}>
        <button
          onClick={() => navigate("/carrito")}
          style={{
            background: "white",
            border: "2px solid #e5e7eb",
            padding: "12px 24px",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "#FF6B35";
            e.currentTarget.style.color = "#FF6B35";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span>←</span> Volver al carrito
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 60px auto",
        padding: "0 20px",
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: "30px"
      }}>
        
        {/* COLUMNA IZQUIERDA - PRODUCTOS */}
        <div>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "25px"
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "28px",
              fontWeight: "700",
              color: "#2C3E50",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "32px" }}>📦</span>
              Productos ({carrito.length})
            </h2>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #f1f5f9"
            }}>
              <div style={{
                fontSize: "24px",
                color: "#FF6B35",
                display: "flex",
                alignItems: "center"
              }}>
                📊
              </div>
              <div>
                <p style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#64748b",
                  margin: "0"
                }}>
                  Resumen de tu compra
                </p>
                <p style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  margin: "4px 0 0 0"
                }}>
                  {carrito.length} producto(s) en total
                </p>
              </div>
            </div>
          </div>

          {/* LISTA DE PRODUCTOS */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            height: "600px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
          }}>
            
            <div style={{ 
              padding: "25px",
              height: "100%",
              overflowY: "auto"
            }}>
              {carrito.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#FF6B35";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
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
                        objectFit: "cover",
                        border: "2px solid #f1f5f9"
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <strong style={{ 
                      fontSize: "16px",
                      color: "#2C3E50", 
                      display: "block",
                      marginBottom: "6px"
                    }}>
                      {item.producto.nombre}
                    </strong>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px",
                      fontSize: "14px",
                      color: "#64748b"
                    }}>
                      <span style={{ 
                        background: i % 2 === 0 ? "#f8fafc" : "#ffffff",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        border: "1px solid #e2e8f0"
                      }}>
                        Cantidad: {item.cantidad}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: "600" }}>${item.producto.precio.toFixed(2)} c/u</span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#FF6B35",
                    minWidth: "80px",
                    textAlign: "right"
                  }}>
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA - RESUMEN Y PAGO */}
        <div>
          {/* RESUMEN TOTAL */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            marginBottom: "25px"
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "24px",
              fontWeight: "700",
              color: "#2C3E50",
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "28px" }}>💰</span>
              Resumen Total
            </h2>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginBottom: "15px",
              paddingBottom: "15px",
              borderBottom: "1px solid #f1f5f9"
            }}>
              <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                Subtotal:
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginBottom: "25px",
              paddingBottom: "25px",
              borderBottom: "1px solid #f1f5f9"
            }}>
              <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                IVA (12%):
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                ${iva.toFixed(2)}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#2C3E50" }}>
                Total a pagar:
              </span>
              <span style={{ 
                fontSize: "32px", 
                fontWeight: "900", 
                color: "#FF6B35",
                textShadow: "0 2px 4px rgba(255, 107, 53, 0.1)"
              }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "24px",
              fontWeight: "700",
              color: "#2C3E50",
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "28px" }}>💳</span>
              Método de pago
            </h2>

            {/* SELECTOR */}
            <div style={{ marginBottom: "25px" }}>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "16px",
                  color: "#2C3E50",
                  backgroundColor: "white",
                  cursor: "pointer",
                  appearance: "none",
                  transition: "all 0.3s ease",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "600"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="EFECTIVO">💵 Efectivo</option>
                <option value="TRANSFERENCIA">🏦 Transferencia</option>
                <option value="TARJETA">💳 Tarjeta de crédito/débito</option>
              </select>
            </div>

            {/* FORMULARIO POR MÉTODO */}
            {metodoPago === "EFECTIVO" && (
              <div>
                <div style={{
                  background: "linear-gradient(135deg, #FFF3CD 0%, #FFE69C 100%)",
                  border: "2px solid #FFC107",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "20px"
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "14px", 
                    color: "#856404", 
                    lineHeight: "1.6",
                    fontWeight: "600"
                  }}>
                    💵 <strong>Pago contra entrega</strong><br />
                    <span style={{ fontWeight: "normal", fontSize: "13px" }}>
                      Pagarás <strong style={{ color: "#FF6B35" }}>${total.toFixed(2)}</strong> en efectivo cuando recibas tu pedido.
                    </span>
                  </p>
                </div>

                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value)}
                    placeholder={`Monto a entregar (mínimo $${total.toFixed(2)})`}
                    style={{
                      padding: "16px 20px",
                      width: "100%",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "16px",
                      color: "#2C3E50",
                      backgroundColor: "white",
                      transition: "all 0.3s ease",
                      outline: "none",
                      fontFamily: "'Inter', sans-serif"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#FF6B35";
                      e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                
                {montoEfectivo && parseFloat(montoEfectivo) >= total && (
                  <div style={{
                    marginTop: "15px",
                    padding: "12px",
                    background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
                    border: "2px solid #10B981",
                    borderRadius: "10px",
                    textAlign: "center"
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "15px", 
                      color: "#065F46",
                      fontWeight: "700"
                    }}>
                      ✓ Cambio: ${(parseFloat(montoEfectivo) - total).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {metodoPago === "TRANSFERENCIA" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setComprobante(e.target.files[0])}
                    style={{
                      padding: "16px 20px",
                      width: "100%",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "16px",
                      color: "#2C3E50",
                      backgroundColor: "white",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      outline: "none",
                      fontFamily: "'Inter', sans-serif"
                    }}
                  />
                </div>
                
                {comprobante && (
                  <div style={{
                    marginTop: "15px",
                    padding: "12px",
                    background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
                    border: "2px solid #10B981",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <span style={{ fontSize: "20px" }}>✓</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "14px", 
                        color: "#065F46",
                        fontWeight: "700"
                      }}>
                        Comprobante cargado
                      </p>
                      <p style={{ 
                        margin: "4px 0 0 0", 
                        fontSize: "12px", 
                        color: "#065F46",
                        opacity: 0.8
                      }}>
                        {comprobante.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {metodoPago === "TARJETA" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <input
                    type="text"
                    value={numTarjeta}
                    onChange={(e) => setNumTarjeta(e.target.value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    autoComplete="cc-number"
                    style={{
                      padding: "16px 20px",
                      width: "100%",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "16px",
                      color: "#2C3E50",
                      backgroundColor: "white",
                      transition: "all 0.3s ease",
                      outline: "none",
                      fontFamily: "'Inter', sans-serif"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#FF6B35";
                      e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 2fr", 
                  gap: "15px",
                  alignItems: "center"
                }}>
                  <div>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="CVV"
                      maxLength="4"
                      autoComplete="cc-csc"
                      style={{
                        padding: "16px 12px",
                        width: "100%",
                        borderRadius: "12px",
                        border: "2px solid #e5e7eb",
                        fontSize: "16px",
                        color: "#2C3E50",
                        backgroundColor: "white",
                        transition: "all 0.3s ease",
                        outline: "none",
                        fontFamily: "'Courier New', monospace",
                        fontWeight: "600",
                        textAlign: "center",
                        letterSpacing: "3px"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#FF6B35";
                        e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div style={{ 
                    display: "flex", 
                    gap: "10px",
                    alignItems: "center"
                  }}>
                    <div style={{ flex: 1, minWidth: "80px" }}>
                      <select
                        value={mesExpiracion}
                        onChange={(e) => setMesExpiracion(e.target.value)}
                        style={{
                          padding: "16px 12px",
                          width: "100%",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          fontSize: "15px",
                          color: mesExpiracion ? "#2C3E50" : "#94a3b8",
                          backgroundColor: "white",
                          cursor: "pointer",
                          appearance: "none",
                          transition: "all 0.3s ease",
                          outline: "none",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: "600"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#FF6B35";
                          e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        <option value="">Mes</option>
                        {meses.map((mes) => (
                          <option key={mes.valor} value={mes.valor}>
                            {mes.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ 
                      fontSize: "18px", 
                      color: "#94a3b8", 
                      fontWeight: "600",
                      margin: "0 2px"
                    }}>
                      /
                    </div>

                    <div style={{ flex: 1.2, minWidth: "90px" }}>
                      <select
                        value={anioExpiracion}
                        onChange={(e) => setAnioExpiracion(e.target.value)}
                        style={{
                          padding: "16px 12px",
                          width: "100%",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          fontSize: "15px",
                          color: anioExpiracion ? "#2C3E50" : "#94a3b8",
                          backgroundColor: "white",
                          cursor: "pointer",
                          appearance: "none",
                          transition: "all 0.3s ease",
                          outline: "none",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: "600"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#FF6B35";
                          e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        <option value="">Año</option>
                        {anios.map(anio => (
                          <option key={anio} value={anio}>
                            {anio}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={titular}
                    onChange={(e) => setTitular(e.target.value)}
                    placeholder="Nombre del titular (como aparece en la tarjeta)"
                    autoComplete="cc-name"
                    style={{
                      padding: "16px 20px",
                      width: "100%",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "16px",
                      color: "#2C3E50",
                      backgroundColor: "white",
                      transition: "all 0.3s ease",
                      outline: "none",
                      fontFamily: "'Inter', sans-serif"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#FF6B35";
                      e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* BOTÓN FINALIZAR COMPRA */}
            <button
              onClick={handleConfirmacionPago}
              disabled={procesando}
              style={{
                width: "100%",
                marginTop: "30px",
                background: procesando 
                  ? "#94a3b8" 
                  : "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                color: "white",
                padding: "18px",
                fontSize: "18px",
                fontWeight: "800",
                borderRadius: "14px",
                border: "none",
                cursor: procesando ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
                boxShadow: procesando 
                  ? "none" 
                  : "0 6px 20px rgba(255, 107, 53, 0.3)",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                if (!procesando) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 107, 53, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!procesando) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
                }
              }}
            >
              {procesando ? (
                <>
                  <span style={{ 
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                    marginRight: "10px"
                  }}>
                    ⏳
                  </span>
                  Procesando compra...
                </>
              ) : (
                <>
                  <span style={{ marginRight: "10px" }}>✔</span>
                  Finalizar Compra · ${total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* ESTILOS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes floatCircle {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          20% { 
            transform: translate(20px, -25px) scale(1.08); 
          }
          40% { 
            transform: translate(-15px, 20px) scale(0.92); 
          }
          60% { 
            transform: translate(10px, 15px) scale(1.05); 
          }
          80% { 
            transform: translate(-20px, -15px) scale(0.98); 
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        select {
          background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M7 10l5 5 5-5z"/></svg>');
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 14px;
          padding-right: 35px !important;
          padding-left: 12px !important;
          min-height: 52px;
        }
        
        option {
          font-size: 14px;
          padding: 8px 12px;
          font-family: 'Inter', sans-serif;
        }
        
        select:not([value=""]) {
          color: #2C3E50 !important;
        }
        
        @media (max-width: 1024px) {
          .main-container {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 36px !important;
          }
          
          .payment-container {
            grid-template-columns: 1fr !important;
          }
          
          .cvv-date-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          
          .expiration-container {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          
          .expiration-container > div {
            flex: 1 !important;
            min-width: 45% !important;
          }
          
          .expiration-separator {
            flex: 0 0 auto !important;
            margin: 0 4px !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 32px !important;
          }
          
          .product-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
          
          .product-image {
            width: 100% !important;
            height: 150px !important;
          }
          
          .cvv-date-container {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          .expiration-container {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .expiration-separator {
            display: none !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        input:focus, select:focus, button:focus {
          outline: none;
        }
        
        button {
          cursor: pointer;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        input[type="file"]::file-selector-button {
          border: none;
          background: transparent;
          font-family: 'Inter', sans-serif;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}