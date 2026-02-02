import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import { useFavoritos } from "../../context/FavoritosContext.jsx";
import Footer from "../../components/Footer.jsx";
import Notificaciones from "../../components/Notificaciones.jsx";
import useNotification from "../../hooks/useNotification.jsx";
import API_URL from "../../config/api.js";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarCarrito } = useCarrito();
  const { esFavorito, cargarFavoritos, favoritos } = useFavoritos();

  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [imgSeleccionada, setImgSeleccionada] = useState(null);
  const [nuevaValoracion, setNuevaValoracion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [showEnvio, setShowEnvio] = useState(false);
  const [showReembolso, setShowReembolso] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [agregandoAlCarrito, setAgregandoAlCarrito] = useState(false);
  const [comprandoAhora, setComprandoAhora] = useState(false);
  const [enviandoReseña, setEnviandoReseña] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("user"));
  const rol = usuario?.rol;
  const esConsumidor = rol === "CONSUMIDOR";
  const esVendedor = rol === "VENDEDOR";

  // ==================== SISTEMA DE NOTIFICACIONES ====================
  const {
    notificacion,
    setNotificacion,
    notificaciones
  } = useNotification();

  const getProducto = async () => {
    try {
      const res = await fetch(`${API_URL}/productos/detalle/${id}`);
      const data = await res.json();
      setProducto(data);
      setImgSeleccionada(data.imagenProducto);
    } catch (err) {
      console.log("Error obteniendo detalle:", err);
      notificaciones.error("Error", "No se pudo cargar el producto");
    }
  };

  useEffect(() => {
    getProducto();
  }, [id]);

  if (!producto) {
    return (
      <div style={{ 
        padding: "50px", 
        fontSize: "24px", 
        textAlign: "center", 
        color: "#FF6B35",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "5px solid #f1f5f9",
          borderTop: "5px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const guardado = esFavorito(producto.idProducto);

  const bloquearSiNoConsumidor = () => {
    if (esVendedor) {
      notificaciones.advertencia("Acción no disponible", "Esta función solo está disponible para consumidores", "⚠️");
      return true;
    }
    return false;
  };

  const toggleFavorito = async () => {
    if (bloquearSiNoConsumidor()) return;

    const token = localStorage.getItem("authToken");
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!token || !usuario?.idConsumidor) {
      notificaciones.advertenciaLogin();
      setTimeout(() => navigate("/LoginModal"), 1500);
      return;
    }

    // ✅ VERIFICAR SI YA ES FAVORITO - MOSTRAR ADVERTENCIA ESPECIAL
    if (guardado) {
      notificaciones.advertencia(
        "Producto ya en favoritos", 
        `"${producto.nombreProducto}" ya está en tus favoritos. Para eliminarlo, ve a la sección de Favoritos.`,
        "❤️"
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/favoritos/agregar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          idConsumidor: usuario.idConsumidor,
          idProducto: producto.idProducto
        })
      });

      if (res.ok) {
        await cargarFavoritos();
        notificaciones.exito(
          "¡Añadido a favoritos!", 
          `"${producto.nombreProducto}" se agregó a tus favoritos`,
          "❤️"
        );
      } else {
        notificaciones.error("Error", "No se pudo agregar a favoritos");
      }
    } catch (err) {
      console.error("Error:", err);
      notificaciones.errorGenerico();
    }
  };

  const handleAddCarrito = async () => {
    if (bloquearSiNoConsumidor()) return;

    const usuario = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!usuario || !token) {
      notificaciones.advertenciaLogin();
      setTimeout(() => navigate("/LoginModal"), 1500);
      return;
    }

    try {
      setAgregandoAlCarrito(true);
      await agregarCarrito(producto.idProducto, cantidad);
      notificaciones.exitoAgregarCarrito(producto.nombreProducto);
    } catch (error) {
      console.error(error);
      if (error.message === "Usuario no autenticado") {
        notificaciones.advertenciaLogin();
        setTimeout(() => navigate("/LoginModal"), 1500);
      } else {
        notificaciones.error("Error", "No se pudo agregar al carrito");
      }
    } finally {
      setAgregandoAlCarrito(false);
    }
  };

  const comprarAhora = async () => {
  if (bloquearSiNoConsumidor()) return;

  const token = localStorage.getItem("authToken");
  const usuario = JSON.parse(localStorage.getItem("user"));

  if (!token || !usuario?.idConsumidor) {
    notificaciones.advertenciaLogin();
    setTimeout(() => navigate("/LoginModal"), 1500);
    return;
  }

  const body = {
    idConsumidor: usuario.idConsumidor,
    idVendedor: producto.idVendedor,
    metodoPago: "TARJETA", // Solo como placeholder
    detalles: [
      {
        idProducto: producto.idProducto,
        cantidad: cantidad
      }
    ]
  };

  try {
    setComprandoAhora(true);
    
    // ✅ MOSTRAR NOTIFICACIÓN DE PROCESANDO
    notificaciones.info(
      "Procesando tu compra",
      "Estamos creando tu pedido...",
      "⏳"
    );

    const res = await fetch(`${API_URL}/pedidos/comprar-ahora`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error en compra:", errorText);
      notificaciones.error("Error", "No se pudo crear el pedido. Intenta nuevamente.");
      return;
    }

    const pedido = await res.json();
    console.log("RESPUESTA DEL PEDIDO =>", pedido);
    
    // ✅ NOTIFICACIÓN DE ÉXITO SOLO PARA CONFIRMAR QUE EL PEDIDO SE CREÓ
    notificaciones.exito(
      "¡Pedido creado!", 
      "Ahora serás redirigido para completar el pago",
      "✅"
    );
    
    // ✅ Redirigir a la página del pedido (que mostrará el checkout)
    // El pedido estará en estado PENDIENTE y mostrará el formulario de pago
    setTimeout(() => {
      navigate(`/pedido/${pedido.idPedido}`, {
        state: { origen: "CHECKOUT" }
      });
    }, 1500);

  } catch (err) {
    console.error("Error:", err);
    notificaciones.error("Error", "Ocurrió un error inesperado al procesar tu compra");
  } finally {
    setComprandoAhora(false);
  }
};

  const enviarReseña = async () => {
    if (bloquearSiNoConsumidor()) return;

    const token = localStorage.getItem("authToken");
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!token || !usuario?.idConsumidor) {
      notificaciones.advertenciaLogin();
      return;
    }

    if (!nuevoComentario.trim()) {
      notificaciones.advertencia("Comentario vacío", "Por favor escribe un comentario", "📝");
      return;
    }

    try {
      setEnviandoReseña(true);
      const res = await fetch(`${API_URL}/valoraciones/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          idProducto: producto.idProducto,
          idConsumidor: usuario.idConsumidor,
          calificacion: nuevaValoracion,
          comentario: nuevoComentario
        })
      });

      if (!res.ok) throw new Error();

      notificaciones.exito("Reseña enviada", "Gracias por tu valoración", "⭐");
      setNuevoComentario("");
      setNuevaValoracion(5);
      getProducto();

    } catch (e) {
      notificaciones.error("Error", "No se pudo enviar la reseña");
    } finally {
      setEnviandoReseña(false);
    }
  };

  // ✅ FUNCIÓN PARA VER PERFIL DE VENDEDOR (ÚNICA OPCIÓN)
  const verPerfilVendedor = () => {
    setMenuOpen(false);
    navigate(`/vendedores/${producto.idVendedor}`);
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>

      {/* COMPONENTE DE NOTIFICACIONES PREMIUM */}
      <Notificaciones
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px", flex: "1", width: "100%" }}>

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
            color: "#FF6B35",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(255, 107, 53, 0.1)",
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#FF6B35";
            e.target.style.color = "white";
            e.target.style.transform = "translateX(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "white";
            e.target.style.color = "#FF6B35";
            e.target.style.transform = "translateX(0)";
          }}
        >
          ← Volver
        </button>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "45% 55%", 
          gap: "30px", 
          background: "white", 
          borderRadius: "20px", 
          padding: "30px", 
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)" 
        }}>

          {/* Columna Izquierda - Imágenes */}
          <div>
            <img
              src={imgSeleccionada}
              style={{ 
                width: "100%", 
                height: "400px", 
                borderRadius: "16px", 
                objectFit: "cover", 
                marginBottom: "15px" 
              }}
              alt="Producto"
            />

            {/* Vendedor Info - SOLO VER PERFIL */}
            <div style={{ 
              background: "#f8f9fa", 
              padding: "16px", 
              borderRadius: "14px",
              position: "relative"
            }}>
              <p style={{ 
                fontSize: "12px", 
                color: "#8B5CF6", 
                margin: "0 0 6px 0", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                Vendedor
              </p>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between" 
              }}>
                <div>
                  <p style={{ 
                    fontSize: "16px", 
                    fontWeight: "700", 
                    color: "#2C3E50", 
                    margin: "0", 
                    fontFamily: "'Inter', sans-serif" 
                  }}>
                    👨‍🌾 {producto.nombreVendedor}
                  </p>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#64748b", 
                    margin: "4px 0 0 0", 
                    fontFamily: "'Inter', sans-serif" 
                  }}>
                    {producto.nombreEmpresa}
                  </p>
                </div>
                
                {/* ✅ BOTÓN ÚNICO - VER PERFIL */}
                <button
                  onClick={verPerfilVendedor}
                  style={{
                    background: "#8B5CF6",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "all 0.3s ease",
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.2)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#A78BFA";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#8B5CF6";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 8px rgba(139, 92, 246, 0.2)";
                  }}
                >
                  👤 Ver Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Info Producto */}
          <div>
            <div style={{ marginBottom: "12px" }}>
              <p style={{ 
                fontSize: "12px", 
                fontWeight: "600", 
                color: "#FF6B35", 
                margin: "0 0 6px 0", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                PRODUCTO DISPONIBLE
              </p>
              <h1 style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#2C3E50",
                margin: "0",
                fontFamily: "'Playfair Display', serif"
              }}>
                {producto.nombreProducto}
              </h1>
            </div>

            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              marginBottom: "16px" 
            }}>
              <div style={{ fontSize: "20px", color: "#F59E0B" }}>⭐</div>
              <span style={{ 
                fontSize: "16px", 
                fontWeight: "700", 
                color: "#F59E0B", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                {producto.promedioValoracion?.toFixed(1) || 0}
              </span>
              <span style={{ 
                fontSize: "13px", 
                color: "#64748b", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                ({producto.totalValoraciones} reseñas)
              </span>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)",
              padding: "18px",
              borderRadius: "14px",
              marginBottom: "18px"
            }}>
              <p style={{ 
                fontSize: "11px", 
                color: "#FF6B35", 
                margin: "0", 
                fontWeight: "600", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                PRECIO
              </p>
              <h2 style={{ 
                fontSize: "36px", 
                fontWeight: "900", 
                color: "#FF6B35", 
                margin: "6px 0 0 0", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                ${parseFloat(producto.precioProducto).toFixed(2)}
              </h2>
              <p style={{ 
                fontSize: "11px", 
                color: "#64748b", 
                margin: "6px 0 0 0", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                Por unidad: {producto.unidad}
              </p>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <p style={{ 
                fontSize: "13px", 
                fontWeight: "600", 
                color: "#2C3E50", 
                margin: "0 0 10px 0", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                Cantidad
              </p>
              <div style={{
                display: "flex",
                gap: "10px",
                background: "#f8f9fa",
                padding: "10px",
                borderRadius: "10px",
                width: "fit-content"
              }}>
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#FF6B35",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#FF6B35"}
                  onMouseLeave={(e) => e.target.style.background = "white"}
                >
                  −
                </button>
                <div style={{
                  width: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "15px",
                  color: "#2C3E50",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {cantidad}
                </div>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#FF6B35",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#FF6B35"}
                  onMouseLeave={(e) => e.target.style.background = "white"}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "10px", 
              marginBottom: "12px" 
            }}>
              <button
                onClick={handleAddCarrito}
                disabled={esVendedor || agregandoAlCarrito}
                style={{
                  background: esVendedor ? "#94a3b8" : "#FF6B35",
                  color: "white",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: (esVendedor || agregandoAlCarrito) ? "not-allowed" : "pointer",
                  opacity: esVendedor ? 0.6 : (agregandoAlCarrito ? 0.8 : 1),
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  if (!esVendedor && !agregandoAlCarrito) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {agregandoAlCarrito ? (
                  <>
                    <span style={{ 
                      width: "16px", 
                      height: "16px", 
                      border: "2px solid white",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></span>
                    Agregando...
                  </>
                ) : "🛒 Carrito"}
              </button>
              <button
                onClick={comprarAhora}
                disabled={esVendedor || comprandoAhora}
                style={{
                  background: esVendedor ? "#94a3b8" : "#2C3E50",
                  color: "white",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: (esVendedor || comprandoAhora) ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: esVendedor ? 0.6 : (comprandoAhora ? 0.8 : 1),
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  if (!esVendedor && !comprandoAhora) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(44, 62, 80, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {comprandoAhora ? (
                  <>
                    <span style={{ 
                      width: "16px", 
                      height: "16px", 
                      border: "2px solid white",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></span>
                    Procesando...
                  </>
                ) : "⚡ Comprar"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <button
                onClick={toggleFavorito}
                disabled={esVendedor}
                style={{
                  background: guardado ? "#FF6B35" : "#f8f9fa",
                  color: guardado ? "white" : "#2C3E50",
                  border: guardado ? "none" : "2px solid #e5e7eb",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: esVendedor ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: esVendedor ? 0.5 : 1,
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif"
                }}
                onMouseEnter={(e) => {
                  if (!esVendedor) {
                    if (guardado) {
                      e.target.style.background = "#dc2626";
                      e.target.style.color = "white";
                      e.target.style.border = "2px solid #dc2626";
                    } else {
                      e.target.style.background = "#FF6B35";
                      e.target.style.color = "white";
                      e.target.style.border = "2px solid #FF6B35";
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!esVendedor) {
                    if (guardado) {
                      e.target.style.background = "#FF6B35";
                      e.target.style.color = "white";
                      e.target.style.border = "none";
                    } else {
                      e.target.style.background = "#f8f9fa";
                      e.target.style.color = "#2C3E50";
                      e.target.style.border = "2px solid #e5e7eb";
                    }
                  }
                }}
              >
                {guardado ? "❤️ En Favoritos" : "🤍 Guardar"}
              </button>
              <button
                onClick={() => setShowEnvio(true)}
                style={{
                  background: "#f8f9fa",
                  color: "#2C3E50",
                  border: "2px solid #e5e7eb",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#FF6B35";
                  e.target.style.color = "white";
                  e.target.style.border = "2px solid #FF6B35";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f8f9fa";
                  e.target.style.color = "#2C3E50";
                  e.target.style.border = "2px solid #e5e7eb";
                }}
              >
                🚚 Envío
              </button>
              <button
                onClick={() => setShowReembolso(true)}
                style={{
                  background: "#f8f9fa",
                  color: "#2C3E50",
                  border: "2px solid #e5e7eb",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#FF6B35";
                  e.target.style.color = "white";
                  e.target.style.border = "2px solid #FF6B35";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f8f9fa";
                  e.target.style.color = "#2C3E50";
                  e.target.style.border = "2px solid #e5e7eb";
                }}
              >
                💵 Reembolso
              </button>
            </div>
          </div>
        </div>

        {/* Descripción y Reseñas */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "30px", 
          marginTop: "30px" 
        }}>

          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#FF6B35",
              margin: "0 0 16px 0",
              fontFamily: "'Playfair Display', serif"
            }}>
              📋 Descripción
            </h2>
            <p style={{
              background: "#f8f9fa",
              padding: "18px",
              borderRadius: "12px",
              color: "#2C3E50",
              lineHeight: "1.6",
              fontSize: "14px",
              margin: 0,
              fontFamily: "'Inter', sans-serif",
              borderLeft: "4px solid #FF6B35"
            }}>
              {producto.descripcionProducto}
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#FF6B35",
              margin: "0 0 16px 0",
              fontFamily: "'Playfair Display', serif"
            }}>
              ⭐ Reseñas
            </h2>

            {producto.valoraciones?.length > 0 ? (
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {producto.valoraciones.map((v, i) => (
                  <div key={i} style={{
                    background: "#f8f9fa",
                    padding: "14px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center" 
                    }}>
                      <strong style={{ 
                        color: "#2C3E50", 
                        fontSize: "14px", 
                        fontFamily: "'Inter', sans-serif" 
                      }}>
                        {v.nombreConsumidor}
                      </strong>
                      <span style={{ 
                        fontSize: "13px", 
                        fontWeight: "700", 
                        color: "#F59E0B", 
                        fontFamily: "'Inter', sans-serif" 
                      }}>
                        ⭐ {v.calificacion}
                      </span>
                    </div>
                    <p style={{ 
                      color: "#64748b", 
                      fontSize: "13px", 
                      margin: "8px 0 0 0", 
                      fontFamily: "'Inter', sans-serif" 
                    }}>
                      {v.comentario}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ 
                textAlign: "center", 
                color: "#64748b", 
                fontSize: "14px", 
                fontFamily: "'Inter', sans-serif" 
              }}>
                Aún no hay reseñas
              </p>
            )}
          </div>
        </div>

        {esConsumidor && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginTop: "30px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#FF6B35",
              margin: "0 0 18px 0",
              fontFamily: "'Playfair Display', serif"
            }}>
              ✍️ Escribe tu reseña
            </h2>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "16px", 
              marginBottom: "16px" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  fontWeight: "600", 
                  color: "#2C3E50", 
                  marginBottom: "8px", 
                  fontSize: "13px", 
                  fontFamily: "'Inter', sans-serif" 
                }}>
                  Calificación
                </label>
                <select
                  value={nuevaValoracion}
                  onChange={(e) => setNuevaValoracion(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2px solid #e5e7eb",
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif",
                    color: "#2C3E50",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "2px solid #FF6B35";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "2px solid #e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ Excelente</option>
                  <option value="4">⭐⭐⭐⭐ Muy Bueno</option>
                  <option value="3">⭐⭐⭐ Bueno</option>
                  <option value="2">⭐⭐ Regular</option>
                  <option value="1">⭐ Malo</option>
                </select>
              </div>
            </div>

            <label style={{ 
              display: "block", 
              fontWeight: "600", 
              color: "#2C3E50", 
              marginBottom: "8px", 
              fontSize: "13px", 
              fontFamily: "'Inter', sans-serif" 
            }}>
              Tu comentario
            </label>
            <textarea
              placeholder="Cuéntanos tu experiencia con este producto..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                padding: "14px",
                borderRadius: "10px",
                border: "2px solid #e5e7eb",
                fontSize: "13px",
                fontFamily: "'Inter', sans-serif",
                resize: "none",
                color: "#2C3E50",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.border = "2px solid #FF6B35";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "2px solid #e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />

            <button
              onClick={enviarReseña}
              disabled={enviandoReseña}
              style={{
                marginTop: "14px",
                padding: "12px 28px",
                background: "#FF6B35",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: enviandoReseña ? "not-allowed" : "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
                opacity: enviandoReseña ? 0.8 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                if (!enviandoReseña) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.3)";
                  e.target.style.background = "#FF8E53";
                }
              }}
              onMouseLeave={(e) => {
                if (!enviandoReseña) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#FF6B35";
                }
              }}
            >
              {enviandoReseña ? (
                <>
                  <span style={{ 
                    width: "16px", 
                    height: "16px", 
                    border: "2px solid white",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }}></span>
                  Enviando...
                </>
              ) : "Enviar Reseña"}
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      {showEnvio && (
        <Modal close={() => setShowEnvio(false)} title="📦 Política de Envío">
          <div style={{ color: "#374151", fontFamily: "'Inter', sans-serif", lineHeight: "2" }}>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Envío dentro de 24-48 horas</p>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Entregas dentro de la ciudad</p>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Producto fresco garantizado</p>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Coordinación directa con el vendedor</p>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Seguimiento disponible</p>
          </div>
        </Modal>
      )}

      {showReembolso && (
        <Modal close={() => setShowReembolso(false)} title="💵 Política de Reembolso">
          <div style={{ color: "#374151", fontFamily: "'Inter', sans-serif", lineHeight: "2" }}>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Reembolso hasta 48h tras entrega</p>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Requiere evidencia fotográfica</p>
            <p style={{ color: "#ef4444", margin: "8px 0" }}>✗ No cubre daño por mal uso</p>
            <p style={{ color: "#ef4444", margin: "8px 0" }}>✗ No aplica para productos perecederos vencidos</p>
            <p style={{ color: "#10B981", margin: "8px 0" }}>✓ Proceso en 3-5 días hábiles</p>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}

function Modal({ title, children, close }) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
        padding: "32px",
        borderRadius: "20px",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        animation: "slideIn 0.3s ease",
        fontFamily: "'Inter', sans-serif"
      }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#FF6B35",
          margin: "0 0 20px 0",
          fontFamily: "'Playfair Display', serif",
          textAlign: "center"
        }}>
          {title}
        </h2>
        <div style={{ 
          marginBottom: "30px", 
          fontSize: "15px" 
        }}>
          {children}
        </div>
        <button
          onClick={close}
          style={{
            width: "100%",
            padding: "14px",
            background: "#FF6B35",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "15px",
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#FF8E53";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#FF6B35";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Cerrar ✖
        </button>
      </div>
    </div>
  );
}