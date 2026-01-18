import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import { useFavoritos } from "../../context/FavoritosContext.jsx";
import Footer from "../../components/Footer.jsx";
import ChatVendedor from "../vendedor/ChatVendedor.jsx"; // ✅ CAMBIO 1

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarCarrito } = useCarrito();
  const { esFavorito, cargarFavoritos } = useFavoritos();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [imgSeleccionada, setImgSeleccionada] = useState(null);
  const [nuevaValoracion, setNuevaValoracion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [showEnvio, setShowEnvio] = useState(false);
  const [showReembolso, setShowReembolso] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarChat, setMostrarChat] = useState(false); // ✅ CAMBIO 2

  // 🔐 CONTROL DE ROL
  const usuario = JSON.parse(localStorage.getItem("user"));
  const rol = usuario?.rol;
  const esConsumidor = rol === "CONSUMIDOR";
  const esVendedor = rol === "VENDEDOR";

  const getProducto = async () => {
    try {
      const res = await fetch(`${API_URL}/productos/detalle/${id}`);
      const data = await res.json();
      setProducto(data);
      setImgSeleccionada(data.imagenProducto);
    } catch (err) {
      console.log("Error obteniendo detalle:", err);
    }
  };

  useEffect(() => {
    getProducto();
  }, [id]);

  if (!producto) {
    return (
      <div style={{ padding: "50px", fontSize: "24px", textAlign: "center", color: "#6B7F69" }}>
        Cargando...
      </div>
    );
  }

  const guardado = esFavorito(producto.idProducto);

  const bloquearSiNoConsumidor = () => {
    if (esVendedor) {
      alert("⚠️ Esta acción solo está disponible para consumidores");
      return true;
    }
    return false;
  };

  const toggleFavorito = async () => {
    if (bloquearSiNoConsumidor()) return;

    const token = localStorage.getItem("authToken");
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!token || !usuario?.idConsumidor) {
      return navigate("/login");
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
        alert(guardado ? "Producto eliminado de favoritos 💔" : "Producto agregado a favoritos ❤️");
      } else {
        alert("No se pudo actualizar favoritos");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error al actualizar favoritos");
    }
  };

  const handleAddCarrito = async () => {
  if (bloquearSiNoConsumidor()) return;

  const usuario = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");

  if (!usuario || !token) {
    return navigate("/login");
  }

  try {
    await agregarCarrito(producto.idProducto, cantidad);
    alert("Producto añadido al carrito 🛒");
  } catch (error) {
    console.error(error);
    alert("❌ Error al agregar al carrito");
  }
};


  const comprarAhora = async () => {
    if (bloquearSiNoConsumidor()) return;

    const token = localStorage.getItem("authToken");
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!token || !usuario?.idConsumidor) {
      return navigate("/login");
    }

    const body = {
      idConsumidor: usuario.idConsumidor,
      idVendedor: producto.idVendedor,
      metodoPago: "TARJETA",
      detalles: [
        {
          idProducto: producto.idProducto,
          cantidad: cantidad
        }
      ]
    };

    try {
      const res = await fetch(`${API_URL}/pedidos/comprar-ahora`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        console.log(await res.text());
        return alert("Error al procesar compra");
      }

      const pedido = await res.json();
      console.log("RESPUESTA DEL PEDIDO =>", pedido);
      alert("Compra realizada correctamente 🎉");
      navigate(`/pedido/${pedido.idPedido}`);

    } catch (err) {
      console.error("Error:", err);
      alert("Error inesperado en la compra");
    }
  };

  const enviarReseña = async () => {
    if (bloquearSiNoConsumidor()) return;

    const token = localStorage.getItem("authToken");
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!token || !usuario?.idConsumidor) {
      alert("Debes iniciar sesión como CONSUMIDOR");
      return;
    }

    try {
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

      alert("Reseña enviada 🎉");
      setNuevoComentario("");
      setNuevaValoracion(5);
      getProducto();

    } catch (e) {
      alert("Error al enviar reseña");
    }
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>

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
            color: "#5A8F48",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(90, 143, 72, 0.1)"
          }}
        >
          ← Volver
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "45% 55%", gap: "30px", background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 8px 32px rgba(90, 143, 72, 0.12)" }}>

          {/* Columna Izquierda - Imágenes */}
          <div>
            <img
              src={imgSeleccionada}
              style={{ width: "100%", height: "400px", borderRadius: "16px", objectFit: "cover", marginBottom: "15px" }}
              alt="Producto"
            />

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <img
                src={producto.imagenProducto}
                onClick={() => setImgSeleccionada(producto.imagenProducto)}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  border: imgSeleccionada === producto.imagenProducto ? "3px solid #5A8F48" : "2px solid #ECF2E3",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                alt="Miniatura"
              />
            </div>

            {/* Vendedor Info */}
            <div style={{ background: "#F9FBF7", padding: "16px", borderRadius: "14px" }}>
              <p style={{ fontSize: "12px", color: "#6B7F69", margin: "0 0 6px 0" }}>Vendedor</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: "700", color: "#2D3E2B", margin: "0" }}>
                    👨‍🌾 {producto.nombreVendedor}
                  </p>
                  <p style={{ fontSize: "12px", color: "#6B7F69", margin: "4px 0 0 0" }}>
                    {producto.nombreEmpresa}
                  </p>
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{ border: "none", fontSize: "24px", background: "none", cursor: "pointer" }}
                  >
                    ⋯
                  </button>
                  {menuOpen && (
                    <div style={{
                      position: "absolute",
                      background: "white",
                      top: "40px",
                      right: "0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                      minWidth: "200px",
                      zIndex: 10
                    }}>
                      {/* ✅ CAMBIO 3: Menú actualizado con rutas correctas */}
                      {[
                        {
                          text: "👤 Ver Perfil",
                          action: () => {
                            setMenuOpen(false);
                            navigate(`/vendedores/${producto.idVendedor}`);
                          }
                        },
                        {
                          text: "🛒 Más productos",
                          action: () => {
                            setMenuOpen(false);
                            navigate(`/vendedores/${producto.idVendedor}/productos`);
                          }
                        },
                        {
                          text: "💬 Contactar",
                          action: () => {
                            setMenuOpen(false);
                            setMostrarChat(true);
                          }
                        }
                      ].map((item, i) => (
                        <p
                          key={i}
                          onClick={item.action}
                          style={{
                            padding: "12px 16px",
                            margin: "0",
                            cursor: "pointer",
                            borderBottom: i < 2 ? "1px solid #ECF2E3" : "none",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#F9FBF7"}
                          onMouseLeave={(e) => e.target.style.background = "white"}
                        >
                          {item.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Info Producto */}
          <div>
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#5A8F48", margin: "0 0 6px 0" }}>
                PRODUCTO DISPONIBLE
              </p>
              <h1 style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#2D3E2B",
                margin: "0",
                fontFamily: "'Playfair Display', serif"
              }}>
                {producto.nombreProducto}
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ fontSize: "20px" }}>⭐</div>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#F4B419" }}>
                {producto.promedioValoracion?.toFixed(1) || 0}
              </span>
              <span style={{ fontSize: "13px", color: "#6B7F69" }}>
                ({producto.totalValoraciones} reseñas)
              </span>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #F9D94A 0%, #F5C542 100%)",
              padding: "18px",
              borderRadius: "14px",
              marginBottom: "18px"
            }}>
              <p style={{ fontSize: "11px", color: "#2D3E2B", margin: "0", fontWeight: "600" }}>
                PRECIO
              </p>
              <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#2D3E2B", margin: "6px 0 0 0" }}>
                ${parseFloat(producto.precioProducto).toFixed(2)}
              </h2>
              <p style={{ fontSize: "11px", color: "#6B7F69", margin: "6px 0 0 0" }}>
                Por unidad: {producto.unidad}
              </p>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#2D3E2B", margin: "0 0 10px 0" }}>
                Cantidad
              </p>
              <div style={{
                display: "flex",
                gap: "10px",
                background: "#F9FBF7",
                padding: "10px",
                borderRadius: "10px",
                width: "fit-content"
              }}>
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  style={{
                    background: "white",
                    border: "1px solid #ECF2E3",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#5A8F48"
                  }}
                >
                  −
                </button>
                <div style={{
                  width: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "15px"
                }}>
                  {cantidad}
                </div>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  style={{
                    background: "white",
                    border: "1px solid #ECF2E3",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#5A8F48"
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <button
                onClick={handleAddCarrito}
                disabled={esVendedor}
                style={{
                  background: esVendedor ? "#A5B7A1" : "#5A8F48",
                  color: "white",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: esVendedor ? "not-allowed" : "pointer",
                  opacity: esVendedor ? 0.6 : 1,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  if (!esVendedor) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(90, 143, 72, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                🛒 Carrito
              </button>
              <button
                onClick={comprarAhora}
                disabled={esVendedor}
                style={{
                  background: esVendedor ? "#9E9E9E" : "#2D3E2B",
                  color: "white",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: esVendedor ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: esVendedor ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!esVendedor) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                ⚡ Comprar
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <button
                onClick={toggleFavorito}
                disabled={esVendedor}
                style={{
                  background: guardado ? "#FF7B9C" : "#FFE5E9",
                  color: guardado ? "white" : "#2D3E2B",
                  border: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: esVendedor ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: esVendedor ? 0.5 : 1,
                  transition: "all 0.3s ease"
                }}
              >
                {guardado ? "❤️ Guardado" : "🤍 Guardar"}
              </button>
              <button
                onClick={() => setShowEnvio(true)}
                style={{
                  background: "#FFF3E0",
                  color: "#2D3E2B",
                  border: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                🚚 Envío
              </button>
              <button
                onClick={() => setShowReembolso(true)}
                style={{
                  background: "#E8F5EA",
                  color: "#2D3E2B",
                  border: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                💵 Reembolso
              </button>
            </div>
          </div>
        </div>

        {/* Descripción y Reseñas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "30px" }}>

          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
          }}>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#2D3E2B",
              margin: "0 0 16px 0",
              fontFamily: "'Playfair Display', serif"
            }}>
              📋 Descripción
            </h2>
            <p style={{
              background: "#E4F3DC",
              padding: "18px",
              borderRadius: "12px",
              color: "#2D3E2B",
              lineHeight: "1.6",
              fontSize: "14px",
              margin: 0
            }}>
              {producto.descripcionProducto}
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
          }}>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#2D3E2B",
              margin: "0 0 16px 0",
              fontFamily: "'Playfair Display', serif"
            }}>
              ⭐ Reseñas
            </h2>

            {producto.valoraciones?.length > 0 ? (
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {producto.valoraciones.map((v, i) => (
                  <div key={i} style={{
                    background: "#F9FBF7",
                    padding: "14px",
                    borderRadius: "10px",
                    marginBottom: "10px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#2D3E2B", fontSize: "14px" }}>{v.nombreConsumidor}</strong>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#F4B419" }}>
                        ⭐ {v.calificacion}
                      </span>
                    </div>
                    <p style={{ color: "#6B7F69", fontSize: "13px", margin: "8px 0 0 0" }}>
                      {v.comentario}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#6B7F69", fontSize: "14px" }}>Aún no hay reseñas</p>
            )}
          </div>
        </div>

        {esConsumidor && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginTop: "30px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
          }}>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#2D3E2B",
              margin: "0 0 18px 0",
              fontFamily: "'Playfair Display', serif"
            }}>
              ✍️ Escribe tu reseña
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "8px", fontSize: "13px" }}>
                  Calificación
                </label>
                <select
                  value={nuevaValoracion}
                  onChange={(e) => setNuevaValoracion(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "2px solid #ECF2E3",
                    fontSize: "14px",
                    fontWeight: "600"
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

            <label style={{ display: "block", fontWeight: "600", color: "#2D3E2B", marginBottom: "8px", fontSize: "13px" }}>
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
                border: "2px solid #ECF2E3",
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "none"
              }}
            />

            <button
              onClick={enviarReseña}
              style={{
                marginTop: "14px",
                padding: "12px 28px",
                background: "#5A8F48",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease"
              }}
            >
              Enviar Reseña
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      {showEnvio && (
        <Modal close={() => setShowEnvio(false)} title="📦 Política de Envío">
          <p>✓ Envío dentro de 24-48 horas</p>
          <p>✓ Entregas dentro de la ciudad</p>
          <p>✓ Producto fresco garantizado</p>
        </Modal>
      )}

      {showReembolso && (
        <Modal close={() => setShowReembolso(false)} title="💵 Política de Reembolso">
          <p>✓ Reembolso hasta 48h tras entrega</p>
          <p>✓ Requiere evidencia</p>
          <p>✗ No cubre daño por mal uso</p>
        </Modal>
      )}

      {/* ✅ CAMBIO 4: Chat flotante tipo Facebook Messenger */}
      {mostrarChat && (
        <ChatVendedor
          vendedor={{
            idVendedor: producto.idVendedor,
            nombre: producto.nombreVendedor,
            empresa: producto.nombreEmpresa
          }}
          onClose={() => setMostrarChat(false)}
        />
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
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        maxWidth: "450px",
        width: "90%",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
      }}>
        <h2 style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#2D3E2B",
          margin: "0 0 16px 0",
          fontFamily: "'Playfair Display', serif"
        }}>
          {title}
        </h2>
        <div style={{ color: "#6B7F69", lineHeight: "1.8", marginBottom: "20px", fontSize: "14px" }}>
          {children}
        </div>
        <button
          onClick={close}
          style={{
            width: "100%",
            padding: "10px",
            background: "#5A8F48",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Cerrar ✖
        </button>
      </div>
    </div>
  );
}