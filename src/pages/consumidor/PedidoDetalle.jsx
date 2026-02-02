import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Footer from "../../components/Footer.jsx";
import Notificaciones from "../../components/Notificaciones.jsx";
import useNotification from "../../hooks/useNotification.jsx";
import API_URL from "../../config/api.js";

export default function PedidoDetalle() {
  const { idPedido } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Contexto del carrito para devolver productos
  const { agregarCarrito } = useCarrito();

  const origen = location.state?.origen || "CHECKOUT";

  // Estados del pedido
  const [pedido, setPedido] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para pago (solo si el pedido está pendiente)
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [comprobante, setComprobante] = useState(null);
  const [numTarjeta, setNumTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [mesExpiracion, setMesExpiracion] = useState("");
  const [anioExpiracion, setAnioExpiracion] = useState("");
  const [titular, setTitular] = useState("");
  const [procesando, setProcesando] = useState(false);

  // ✅ NUEVO: Estado para mostrar modal de confirmación
  const [mostrarConfirmacionSalir, setMostrarConfirmacionSalir] = useState(false);
  
  // ✅ Hook de notificaciones COMPLETO (igual que CheckoutUnificado)
  const { 
    notificacion, 
    setNotificacion,
    confirmacionPago,
    setConfirmacionPago,
    confirmacionesPago,
    notificaciones
  } = useNotification();

  // ==================== ANIMACIÓN DE CÍRCULOS ====================
  const [circlePositions, setCirclePositions] = useState([]);

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

  // ==================== FUNCIÓN PARA DETERMINAR SI MOSTRAR CHECKOUT ====================
  const mostrarCheckout = () => {
    if (!pedido) return false;
    const esOrigenCheckout = origen === "CHECKOUT" || !location.state?.origen;
    
    if (esOrigenCheckout && 
        (pedido.estadoPedido === "PENDIENTE" || pedido.estadoPedido === "CREADO") &&
        pedido.estadoPago !== "PAGADO" &&
        pedido.estadoPago !== "EN_VERIFICACION" &&
        pedido.estadoPedido !== "CANCELADO") {
      return true;
    }
    
    return false;
  };

  // ==================== CARGAR PEDIDO ====================
  const cargarPedido = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      notificaciones.advertenciaLogin();
      setTimeout(() => navigate("/LoginModal"), 1500);
      return;
    }

    try {
      const resPedido = await fetch(`${API_URL}/pedidos/${idPedido}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resPedido.ok) {
        throw new Error("No autorizado para ver el pedido");
      }

      const dataPedido = await resPedido.json();

      const resDetalles = await fetch(
        `${API_URL}/pedidos/${idPedido}/detalles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resDetalles.ok) {
        throw new Error("No autorizado para ver los detalles");
      }

      const dataDetalles = await resDetalles.json();

      setPedido(dataPedido);
      setDetalles(dataDetalles);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error cargando pedido:", err);
      setError(err.message);
      setLoading(false);
      notificaciones.error("Error", "No se pudo cargar el pedido");
    }
  };

  useEffect(() => {
    cargarPedido();
  }, [idPedido]);

  // ==================== VALIDACIÓN DEL FORMULARIO ====================
  const validarFormulario = () => {
    if (metodoPago === "EFECTIVO") {
      if (montoEfectivo && parseFloat(montoEfectivo) < pedido.total) {
        notificaciones.error("Monto insuficiente", `El monto debe ser mayor o igual al total: $${formatCurrency(pedido.total)}`);
        return false;
      }
      return true;
    }

    if (metodoPago === "TRANSFERENCIA") {
      if (!comprobante) {
        notificaciones.error("Comprobante requerido", "Debes subir el comprobante de transferencia");
        return false;
      }
    }

    if (metodoPago === "TARJETA") {
      if (!numTarjeta || numTarjeta.replace(/\s/g, "").length < 15) {
        notificaciones.error("Tarjeta inválida", "El número de tarjeta debe tener al menos 15 dígitos");
        return false;
      }
      if (!cvv || cvv.length < 3) {
        notificaciones.error("CVV inválido", "El CVV debe tener al menos 3 dígitos");
        return false;
      }
      if (!mesExpiracion || !anioExpiracion) {
        notificaciones.error("Fecha requerida", "La fecha de expiración es requerida");
        return false;
      }

      // Validar que la fecha no esté vencida
      const hoy = new Date();
      const mesActual = hoy.getMonth() + 1;
      const anioActual = hoy.getFullYear();

      if (parseInt(anioExpiracion) < anioActual || 
          (parseInt(anioExpiracion) === anioActual && parseInt(mesExpiracion) < mesActual)) {
        notificaciones.error("Tarjeta vencida", "La tarjeta está vencida");
        return false;
      }

      if (!titular.trim()) {
        notificaciones.error("Titular requerido", "El nombre del titular es requerido");
        return false;
      }
    }

    return true;
  };

  // ==================== FINALIZAR COMPRA ====================
  const finalizarCompra = async () => {
    // ✅ SE ELIMINÓ LA CONDICIÓN PROBLEMÁTICA - igual que CheckoutUnificado
    if (!validarFormulario()) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      notificaciones.advertenciaLogin();
      setTimeout(() => navigate("/LoginModal"), 1500);
      return;
    }

    setProcesando(true);
    notificaciones.info("Procesando", "Procesando tu pedido...", "⏳");

    try {
      let body;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (metodoPago === "EFECTIVO") {
        headers["Content-Type"] = "application/json";

        const montoFinal = montoEfectivo && parseFloat(montoEfectivo) >= pedido.total
          ? parseFloat(montoEfectivo)
          : pedido.total;

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

      const url = `${API_URL}/pedidos/finalizar/${idPedido}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: body,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "No se pudo finalizar el pedido");
      }

      const data = await res.json();

      if (metodoPago === "EFECTIVO") {
        notificaciones.exito(
          "¡Pedido confirmado!",
          `Pagarás $${pedido.total.toFixed(2)} en efectivo al recibir tu pedido.\nEl vendedor está preparando tu orden.`,
          "🎉"
        );
      } else {
        notificaciones.exito(
          "¡Compra exitosa!",
          "Tu pedido ha sido procesado correctamente",
          "✅"
        );
      }

      await cargarPedido();

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/mis-pedidos");
      }, 2000);

    } catch (err) {
      console.error("❌ Error:", err);
      notificaciones.error(
        "Error en el pago",
        "No se pudo procesar tu pedido. Por favor intenta nuevamente."
      );
    } finally {
      setProcesando(false);
    }
  };

  // ==================== MANEJAR CONFIRMACIÓN DE PAGO ====================
  const handleConfirmacionPago = () => {
    if (!validarFormulario()) return;

    if (metodoPago === "EFECTIVO") {
      confirmacionesPago.efectivo(
        pedido.total,
        parseFloat(montoEfectivo || pedido.total),
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
        pedido.total,
        tarjetaInfo,
        finalizarCompra,
        () => {
          console.log("Compra cancelada");
        }
      );
    } else if (metodoPago === "TRANSFERENCIA") {
      confirmacionesPago.transferencia(
        pedido.total,
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

  // ==================== FUNCIÓN PARA MOSTRAR MODAL DE CONFIRMACIÓN ====================
  const confirmarSalir = () => {
    // Si no hay pedido o no está en checkout, simplemente volver
    if (!pedido || !mostrarCheckout()) {
      navigate("/mis-pedidos");
      return;
    }

    // Mostrar modal de confirmación premium
    setMostrarConfirmacionSalir(true);
  };

  // ==================== FUNCIÓN PARA AGREGAR AL CARRITO VÍA API ====================
  const agregarAlCarritoAPI = async (idProducto, cantidad) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    try {
      console.log(`🔄 Llamando API para agregar al carrito: ${idProducto}, cantidad: ${cantidad}`);
      
      const response = await fetch(`${API_URL}/carrito/agregar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idProducto: idProducto,
          cantidad: cantidad
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error API carrito: ${errorText}`);
        throw new Error(`Error al agregar al carrito: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ API respuesta:`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ Error en agregarAlCarritoAPI:`, error);
      throw error;
    }
  };

  // ==================== FUNCIÓN PARA CANCELAR PEDIDO Y VOLVER AL CARRITO ====================
  const cancelarPedidoYVolver = async () => {
    setMostrarConfirmacionSalir(false);
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      notificaciones.error("Error", "No estás autenticado");
      navigate("/carrito");
      return;
    }

    try {
      notificaciones.info("Cancelando pedido", "Devolviendo productos al carrito...", "🔄");
      
      // 1. LOG DETALLADO: Ver qué tenemos en detalles
      console.log("📋 DETALLES DEL PEDIDO A CANCELAR:", detalles);
      console.log("🔍 ESTRUCTURA DEL PRIMER DETALLE:", detalles[0]);
      
      // 2. Cancelar el pedido en el backend
      console.log(`🔄 Cancelando pedido #${pedido.idPedido}...`);
      const cancelarRes = await fetch(`${API_URL}/pedidos/${pedido.idPedido}/cancelar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!cancelarRes.ok) {
        const errorText = await cancelarRes.text();
        console.error("❌ Error cancelando pedido:", errorText);
        throw new Error("Error al cancelar el pedido: " + errorText);
      }

      console.log("✅ Pedido cancelado en backend");

      // 3. Devolver productos al carrito
      let productosAgregados = 0;
      let productosConError = 0;
      const erroresDetalles = [];
      
      for (const detalle of detalles) {
        try {
          // Extraer el idProducto de diferentes formas posibles
          let idProducto = null;
          
          // Posibles estructuras:
          if (detalle.idProducto) {
            idProducto = detalle.idProducto;
          } else if (detalle.producto?.idProducto) {
            idProducto = detalle.producto.idProducto;
          } else if (detalle.producto?.id) {
            idProducto = detalle.producto.id;
          } else if (detalle.productoId) {
            idProducto = detalle.productoId;
          }
          
          if (!idProducto) {
            console.warn("⚠️ No se encontró idProducto en detalle:", detalle);
            productosConError++;
            erroresDetalles.push({
              detalle,
              error: "No se encontró idProducto",
              estructura: Object.keys(detalle)
            });
            continue;
          }

          console.log(`🔄 Procesando producto: ID=${idProducto}, Cantidad=${detalle.cantidad}, Nombre=${detalle.producto?.nombreProducto || 'Desconocido'}`);
          
          // Intentar con el contexto del carrito primero
          if (agregarCarrito && typeof agregarCarrito === 'function') {
            try {
              console.log(`🔄 Usando contexto para agregar producto ID: ${idProducto}`);
              await agregarCarrito(idProducto, detalle.cantidad);
              console.log(`✅ Producto agregado vía contexto: ${idProducto}`);
            } catch (contextError) {
              console.warn(`⚠️ Contexto falló para ${idProducto}:`, contextError);
              // Fallback a API
              console.log(`🔄 Fallback a API para producto ID: ${idProducto}`);
              await agregarAlCarritoAPI(idProducto, detalle.cantidad);
              console.log(`✅ Producto agregado vía API: ${idProducto}`);
            }
          } else {
            // Si no hay contexto, usar API directamente
            console.log(`🔄 Contexto no disponible, usando API para producto ID: ${idProducto}`);
            await agregarAlCarritoAPI(idProducto, detalle.cantidad);
            console.log(`✅ Producto agregado vía API directa: ${idProducto}`);
          }
          
          productosAgregados++;
          console.log(`✅ Éxito: Producto ${idProducto} agregado al carrito`);
          
        } catch (error) {
          productosConError++;
          console.error(`❌ Error procesando producto:`, error, detalle);
          erroresDetalles.push({
            detalle,
            error: error.message,
            idProducto: detalle.idProducto || detalle.producto?.idProducto
          });
        }
      }

      // 4. Mostrar notificación según resultados
      console.log("📊 RESUMEN:");
      console.log(`- Productos agregados: ${productosAgregados}`);
      console.log(`- Productos con error: ${productosConError}`);
      console.log(`- Errores detallados:`, erroresDetalles);

      if (productosAgregados > 0 && productosConError === 0) {
        notificaciones.exito(
          "✅ Pedido cancelado",
          `${productosAgregados} producto(s) devueltos a tu carrito`,
          "🛒"
        );
      } else if (productosAgregados > 0) {
        notificaciones.advertencia(
          "Pedido cancelado parcialmente",
          `${productosAgregados} producto(s) devueltos al carrito, ${productosConError} no se pudieron agregar`,
          "⚠️"
        );
      } else if (productosConError > 0) {
        notificaciones.error(
          "Error devolviendo productos",
          "No se pudieron devolver los productos al carrito. Por favor, agrégalos manualmente.",
          "❌"
        );
      } else {
        notificaciones.exito(
          "Pedido cancelado",
          "El pedido ha sido cancelado",
          "✅"
        );
      }
      
      // 5. Redirigir al carrito
      console.log("🔄 Redirigiendo a carrito en 1.5 segundos...");
      setTimeout(() => {
        navigate("/carrito");
      }, 1500);
      
    } catch (err) {
      console.error("❌ Error general cancelando pedido:", err);
      notificaciones.error(
        "Error al cancelar",
        "Hubo un problema al cancelar el pedido: " + err.message,
        "❌"
      );
      
      // Aún así redirigir al carrito
      setTimeout(() => {
        navigate("/carrito");
      }, 1500);
    }
  };

  // ==================== FUNCIÓN PARA CANCELAR EL MODAL ====================
  const cancelarSalir = () => {
    setMostrarConfirmacionSalir(false);
    notificaciones.info("Acción cancelada", "Continuas en la página de pago", "❌");
  };

  // ==================== FUNCIÓN PARA FORMATEAR MONEDA ====================
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

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

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}>
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
        
        <div style={{
          display: "inline-block",
          width: "60px",
          height: "60px",
          border: "5px solid #f1f5f9",
          borderTop: "5px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{
          marginTop: "25px",
          fontSize: "18px",
          color: "#2C3E50",
          fontWeight: "600",
          fontFamily: "'Inter', sans-serif"
        }}>
          Cargando detalles del pedido...
        </p>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error || !pedido) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "20px",
        textAlign: "center"
      }}>
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
        
        <div style={{ fontSize: "80px", marginBottom: "25px", opacity: 0.7 }}>❌</div>
        <p style={{
          color: "#2C3E50",
          fontSize: "24px",
          fontWeight: "700",
          margin: "0 0 15px 0",
          fontFamily: "'Inter', sans-serif"
        }}>
          {error || "Error cargando pedido"}
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "16px 36px",
            background: "#FF6B35",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "16px",
            transition: "all 0.3s ease",
            fontFamily: "'Inter', sans-serif",
            marginTop: "20px"
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
          Volver al inicio
        </button>
      </div>
    );
  }

  // ==================== DETERMINAR SI ESTAMOS EN CHECKOUT ====================
  const mostrarVistaCheckout = mostrarCheckout();

  // ==================== RENDER ====================
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* COMPONENTE DE NOTIFICACIONES COMPLETO */}
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

      {/* ✅ MODAL DE CONFIRMACIÓN PREMIUM PARA SALIR */}
      {mostrarConfirmacionSalir && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          backdropFilter: "blur(8px)",
          animation: "fadeIn 0.3s ease"
        }}>
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            border: "2px solid rgba(255, 107, 53, 0.2)",
            animation: "slideIn 0.3s ease",
            fontFamily: "'Inter', sans-serif"
          }}>
            <div style={{
              fontSize: "50px",
              marginBottom: "20px",
              color: "#FF6B35"
            }}>⚠️</div>
            
            <h3 style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#2C3E50",
              margin: "0 0 15px 0"
            }}>
              {mostrarVistaCheckout ? "¿Cancelar pedido?" : "¿Salir de esta página?"}
            </h3>
            
            <p style={{
              fontSize: "16px",
              color: "#64748b",
              margin: "0 0 30px 0",
              lineHeight: "1.5"
            }}>
              {mostrarVistaCheckout 
                ? "Se cancelará el pedido y los productos volverán a tu carrito. Esta acción no se puede deshacer."
                : "Estás a punto de salir de los detalles del pedido. ¿Estás seguro?"
              }
            </p>
            
            <div style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center"
            }}>
              <button
                onClick={cancelarSalir}
                style={{
                  padding: "16px 32px",
                  background: "white",
                  border: "2px solid #FF6B35",
                  color: "#FF6B35",
                  borderRadius: "12px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  flex: 1
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 107, 53, 0.1)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                No, quedarme
              </button>
              
              <button
                onClick={cancelarPedidoYVolver}
                style={{
                  padding: "16px 32px",
                  background: mostrarVistaCheckout ? "#dc2626" : "#FF6B35",
                  border: `2px solid ${mostrarVistaCheckout ? "#dc2626" : "#FF6B35"}`,
                  color: "white",
                  borderRadius: "12px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  flex: 1,
                  boxShadow: mostrarVistaCheckout 
                    ? "0 4px 12px rgba(220, 38, 38, 0.2)" 
                    : "0 4px 12px rgba(255, 107, 53, 0.2)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = mostrarVistaCheckout ? "#ef4444" : "#FF8E53";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = mostrarVistaCheckout 
                    ? "0 6px 16px rgba(220, 38, 38, 0.3)" 
                    : "0 6px 16px rgba(255, 107, 53, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = mostrarVistaCheckout ? "#dc2626" : "#FF6B35";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = mostrarVistaCheckout 
                    ? "0 4px 12px rgba(220, 38, 38, 0.2)" 
                    : "0 4px 12px rgba(255, 107, 53, 0.2)";
                }}
              >
                {mostrarVistaCheckout ? "Sí, cancelar" : "Sí, salir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER CON CÍRCULOS - Mismo diseño que CheckoutUnificado */}
      <div style={{
        background: "white",
        padding: "80px 20px 60px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "40px",
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {/* CÍRCULOS DE COLORES ANIMADOS */}
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
            {mostrarVistaCheckout ? "Finalizar Compra" : "Detalles del Pedido"}
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
            {mostrarVistaCheckout ? "Checkout" : `Pedido #${idPedido}`}
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
            {mostrarVistaCheckout ? "Completa tu compra de manera segura" : "Sigue el estado de tu pedido"}
          </p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 60px auto",
        padding: "0 20px"
      }}>
        
        {/* BOTÓN VOLVER - Mismo diseño que CheckoutUnificado */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={confirmarSalir}
            style={{
              background: "white",
              border: "2px solid #e5e7eb",
              padding: "12px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              color: mostrarVistaCheckout ? "#EF4444" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = mostrarVistaCheckout ? "#EF4444" : "#FF6B35";
              e.currentTarget.style.color = mostrarVistaCheckout ? "#EF4444" : "#FF6B35";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = mostrarVistaCheckout ? "#EF4444" : "#64748b";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span>←</span>
            {mostrarVistaCheckout ? "Cancelar pedido y volver" : "Volver a mis pedidos"}
          </button>
        </div>

        {/* VISTA CHECKOUT (si está pendiente) */}
        {mostrarVistaCheckout ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px"
          }}>
            
            {/* PRODUCTOS */}
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
                  Productos ({detalles.length})
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
                      {detalles.length} producto(s) en total
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
                  {detalles.map((item, i) => (
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
                      {item.producto?.imagenProducto && (
                        <img
                          src={item.producto.imagenProducto}
                          alt={item.producto.nombreProducto}
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
                          {item.producto?.nombreProducto || "Producto"}
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
                          <span style={{ fontWeight: "600" }}>${formatCurrency(item.subtotal / item.cantidad)} c/u</span>
                        </div>
                      </div>

                      <div style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#FF6B35",
                        minWidth: "80px",
                        textAlign: "right"
                      }}>
                        ${formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RESUMEN Y PAGO */}
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
                    ${formatCurrency(pedido.subtotal || 0)}
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
                    ${formatCurrency(pedido.iva || 0)}
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
                    ${formatCurrency(pedido.total || 0)}
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
                          Pagarás <strong style={{ color: "#FF6B35" }}>${formatCurrency(pedido.total || 0)}</strong> en efectivo cuando recibas tu pedido.
                        </span>
                      </p>
                    </div>

                    <div>
                      <input
                        type="number"
                        step="0.01"
                        value={montoEfectivo}
                        onChange={(e) => setMontoEfectivo(e.target.value)}
                        placeholder={`Monto a entregar (mínimo $${formatCurrency(pedido.total || 0)})`}
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
                    
                    {montoEfectivo && parseFloat(montoEfectivo) >= pedido.total && (
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
                          ✓ Cambio: ${formatCurrency(parseFloat(montoEfectivo) - pedido.total)}
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
                      Finalizar Compra · ${formatCurrency(pedido.total || 0)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA DETALLES DEL PEDIDO (si ya está procesado) */
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
          }}>
            
            {/* INFORMACIÓN DEL PEDIDO */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "30px",
              paddingBottom: "25px",
              borderBottom: "2px solid #f1f5f9"
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Playfair Display', 'Georgia', serif",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  marginBottom: "8px"
                }}>
                  Pedido #{pedido.idPedido}
                </h2>
                <p style={{
                  fontSize: "15px",
                  color: "#64748b",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span>📅</span>
                  {new Date(pedido.fechaPedido).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{
                  background: "#FF6B35",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(255, 107, 53, 0.4)",
                }}>
                  {pedido.estadoPedido === "COMPLETADO" && "✓ "}
                  {pedido.estadoPedido}
                </div>
                {pedido.estadoPago && (
                  <div style={{
                    background: pedido.estadoPago === "PAGADO" ? "#10B981" : "#FF6B35",
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: "25px",
                    fontWeight: "700",
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    boxShadow: `0 4px 12px ${pedido.estadoPago === "PAGADO" ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 107, 53, 0.4)"}`,
                  }}>
                    {pedido.estadoPago === "PAGADO" && "✅ "}
                    {pedido.estadoPago}
                  </div>
                )}
              </div>
            </div>

            {/* LISTA DE PRODUCTOS */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2C3E50",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <span style={{ fontSize: "28px" }}>📦</span>
                Productos del pedido
              </h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px"
              }}>
                {detalles.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f8fafc",
                      padding: "20px",
                      borderRadius: "14px",
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                      transition: "all 0.3s ease",
                      border: "1px solid #e2e8f0"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {item.producto?.imagenProducto && (
                      <img
                        src={item.producto.imagenProducto}
                        alt={item.producto.nombreProducto}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "10px",
                          objectFit: "cover",
                          border: "2px solid #e5e7eb"
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
                        {item.producto?.nombreProducto || "Producto"}
                      </strong>
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        gap: "8px",
                        fontSize: "14px",
                        color: "#64748b"
                      }}>
                        <span style={{ 
                          background: "#ffffff",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          border: "1px solid #e2e8f0",
                          display: "inline-block",
                          width: "fit-content"
                        }}>
                          Cantidad: {item.cantidad}
                        </span>
                        <span style={{ fontWeight: "600" }}>${formatCurrency(item.subtotal / item.cantidad)} c/u</span>
                      </div>
                    </div>

                    <div style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#FF6B35",
                      minWidth: "80px",
                      textAlign: "right"
                    }}>
                      ${formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RESUMEN FINAL */}
            <div style={{
              background: "#f8fafc",
              padding: "25px",
              borderRadius: "14px",
              border: "2px solid #e5e7eb"
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "22px",
                fontWeight: "700",
                color: "#2C3E50",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "24px" }}>💰</span>
                Resumen del pedido
              </h3>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginBottom: "25px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                    Subtotal
                  </span>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                    ${formatCurrency(pedido.subtotal || 0)}
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                    IVA (12%)
                  </span>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                    ${formatCurrency(pedido.iva || 0)}
                  </span>
                </div>

                {pedido.metodoPago && (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                      Método de pago
                    </span>
                    <span style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#FF6B35",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255, 107, 53, 0.1)",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: "1px solid rgba(255, 107, 53, 0.3)"
                    }}>
                      {pedido.metodoPago === "EFECTIVO" && "💵 Efectivo"}
                      {pedido.metodoPago === "TRANSFERENCIA" && "🏦 Transferencia"}
                      {pedido.metodoPago === "TARJETA" && "💳 Tarjeta"}
                    </span>
                  </div>
                )}
              </div>

              <div style={{
                background: "#FF6B35",
                padding: "25px",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)"
              }}>
                <span style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "white",
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Total
                </span>
                <span style={{
                  fontSize: "36px",
                  fontWeight: "900",
                  color: "white",
                  fontFamily: "'Playfair Display', serif"
                }}>
                  ${formatCurrency(pedido.total || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
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
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
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
          
          .product-grid {
            grid-template-columns: 1fr !important;
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
          
          .pedido-header {
            flex-direction: column !important;
            gap: 15px !important;
            align-items: flex-start !important;
          }
          
          .pedido-estados {
            flex-wrap: wrap !important;
            gap: 8px !important;
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