import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";
import Notificaciones from "../../components/Notificaciones.jsx";
import useNotification from "../../hooks/useNotification.jsx";

export default function Pedido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const user = JSON.parse(localStorage.getItem("user"));

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==================== SISTEMA DE NOTIFICACIONES ====================
  const {
    notificacion,
    setNotificacion,
    notificaciones
  } = useNotification();

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const cargarPedido = async () => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      notificaciones.advertenciaLogin();
      setTimeout(() => navigate("/LoginModal"), 1500);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      notificaciones.info("Cargando", "Obteniendo detalles del pedido...", "🔄");

      const res = await fetch(`${API}/pedidos/${id}/detalles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          notificaciones.advertenciaLogin();
          setTimeout(() => navigate("/LoginModal"), 1500);
          return;
        }
        if (res.status === 404) {
          throw new Error("Pedido no encontrado");
        }
        throw new Error("No autorizado para ver este pedido");
      }

      const data = await res.json();
      setPedido(data);
      
      notificaciones.exito("✅", "Pedido cargado correctamente", "📦");

    } catch (error) {
      console.error("Error cargando pedido:", error);
      setError(error.message);
      
      notificaciones.error(
        "Error al cargar pedido",
        error.message || "No se pudo cargar la información del pedido"
      );
      
      // Si es error 404, redirigir después de un tiempo
      if (error.message.includes("no encontrado")) {
        setTimeout(() => {
          navigate("/mis-pedidos");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN PARA VER FACTURA
  const verFactura = () => {
    if (!pedido || !pedido.id) {
      notificaciones.advertencia(
        "Información incompleta",
        "No se puede generar la factura sin los datos del pedido",
        "📄"
      );
      return;
    }

    notificaciones.info("Generando factura", "Preparando documento...", "📄");
    
    // Redirigir a la página de factura después de un breve momento
    setTimeout(() => {
      navigate(`/factura/${pedido.id}`);
    }, 500);
  };

  // ✅ FUNCIÓN PARA VOLVER A PEDIDOS
  const volverAPedidos = () => {
    notificaciones.info("Redirigiendo", "Volviendo a tus pedidos...", "🔙");
    
    setTimeout(() => {
      navigate("/mis-pedidos");
    }, 500);
  };

  // ✅ FUNCIÓN PARA IMPRIMIR PEDIDO
  const imprimirPedido = () => {
    if (!pedido) {
      notificaciones.advertencia(
        "Datos no disponibles",
        "No se puede imprimir sin los datos del pedido",
        "🖨️"
      );
      return;
    }

    notificaciones.info("Preparando impresión", "Generando documento para imprimir...", "🖨️");
    
    // Aquí iría la lógica de impresión
    setTimeout(() => {
      window.print();
    }, 800);
  };

  // ✅ FUNCIÓN PARA CANCELAR PEDIDO
  const cancelarPedido = async () => {
    if (!pedido || !pedido.id) return;

    // Primero confirmar con el usuario
    notificaciones.advertencia(
      "¿Cancelar pedido?",
      "Esta acción no se puede deshacer. ¿Estás seguro?",
      "⚠️"
    );

    // Mostrar modal de confirmación premium (opcional)
    const confirmar = window.confirm("¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.");
    
    if (!confirmar) {
      notificaciones.info("Acción cancelada", "El pedido no fue cancelado", "❌");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      notificaciones.advertenciaLogin();
      return;
    }

    try {
      notificaciones.info("Cancelando", "Procesando cancelación del pedido...", "🔄");
      
      const res = await fetch(`${API}/pedidos/${pedido.id}/cancelar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo cancelar el pedido");
      }

      notificaciones.exito(
        "✅ Pedido cancelado",
        "El pedido ha sido cancelado exitosamente",
        "📦"
      );

      // Recargar datos del pedido
      setTimeout(() => {
        cargarPedido();
      }, 1500);

    } catch (error) {
      console.error("Error cancelando pedido:", error);
      notificaciones.error(
        "Error al cancelar",
        "No se pudo cancelar el pedido. Intenta nuevamente."
      );
    }
  };

  // ✅ FUNCIÓN PARA OBTENER COLOR SEGÚN ESTADO
  const obtenerColorEstado = (estado) => {
    const estados = {
      "PENDIENTE": "#FF6B35", // Naranja
      "CREADO": "#FF6B35", // Naranja
      "PROCESANDO": "#FF6B35", // Naranja
      "ENVIADO": "#3B82F6", // Azul
      "ENTREGADO": "#10B981", // Verde
      "COMPLETADO": "#10B981", // Verde
      "CANCELADO": "#EF4444", // Rojo
      "RECHAZADO": "#EF4444", // Rojo
    };
    
    return estados[estado] || "#6B7280"; // Gris por defecto
  };

  // ✅ FUNCIÓN PARA OBTENER ICONO SEGÚN ESTADO
  const obtenerIconoEstado = (estado) => {
    const iconos = {
      "PENDIENTE": "⏳",
      "CREADO": "📝",
      "PROCESANDO": "🔄",
      "ENVIADO": "🚚",
      "ENTREGADO": "✅",
      "COMPLETADO": "🎉",
      "CANCELADO": "❌",
      "RECHAZADO": "🚫",
    };
    
    return iconos[estado] || "📦";
  };

  // ==================== LOADING STATE ====================
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

  // ==================== ERROR STATE ====================
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
        <p style={{
          color: "#64748b",
          fontSize: "16px",
          margin: "0 0 30px 0",
          maxWidth: "400px",
          lineHeight: "1.6"
        }}>
          No se pudo cargar la información del pedido. Verifica que tengas acceso o que el pedido exista.
        </p>
        
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={volverAPedidos}
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
            ← Volver a mis pedidos
          </button>
          
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "16px 32px",
              background: "white",
              color: "#FF6B35",
              border: "2px solid #FF6B35",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.background = "#FFF7ED";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "white";
            }}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER PRINCIPAL ====================
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      
      {/* COMPONENTE DE NOTIFICACIONES */}
      <Notificaciones
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px 60px 20px"
      }}>
        
        {/* HEADER DEL PEDIDO */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          marginBottom: "30px",
          border: "2px solid #f1f5f9"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#8B5CF6",
                marginBottom: "6px",
                fontWeight: "500"
              }}>
                Pedido #{pedido.id}
              </div>
              
              <h1 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "36px",
                fontWeight: "700",
                color: "#2C3E50",
                margin: "0 0 10px 0"
              }}>
                Detalles del Pedido
              </h1>
              
              <p style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>📅</span>
                {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "Fecha no disponible"}
              </p>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "flex-end"
            }}>
              <div style={{
                background: obtenerColorEstado(pedido.estado),
                color: "white",
                padding: "12px 24px",
                borderRadius: "25px",
                fontWeight: "800",
                fontSize: "14px",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: `0 4px 15px ${obtenerColorEstado(pedido.estado)}40`
              }}>
                {obtenerIconoEstado(pedido.estado)} {pedido.estado}
              </div>
              
              <div style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#FF6B35",
                fontFamily: "'Playfair Display', serif"
              }}>
                ${pedido.total ? parseFloat(pedido.total).toFixed(2) : "0.00"}
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            paddingTop: "25px",
            borderTop: "2px solid #f1f5f9"
          }}>
            <button
              onClick={volverAPedidos}
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
              <span>←</span> Volver a pedidos
            </button>
            
            <button
              onClick={verFactura}
              style={{
                background: "#8B5CF6",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = "#A78BFA";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "#8B5CF6";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              📄 Ver factura
            </button>
            
            <button
              onClick={imprimirPedido}
              style={{
                background: "#10B981",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = "#34D399";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "#10B981";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              🖨️ Imprimir pedido
            </button>
            
            {/* Solo mostrar botón de cancelar si el pedido no está completado o cancelado */}
            {(pedido.estado === "PENDIENTE" || pedido.estado === "CREADO" || pedido.estado === "PROCESANDO") && (
              <button
                onClick={cancelarPedido}
                style={{
                  background: "#EF4444",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "15px",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.background = "#F87171";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "#EF4444";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ❌ Cancelar pedido
              </button>
            )}
          </div>
        </div>

        {/* DETALLES DE LOS PRODUCTOS */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          marginBottom: "30px"
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
            <span style={{ fontSize: "28px" }}>🛒</span>
            Productos del pedido
          </h2>

          {pedido.detalles && pedido.detalles.length > 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}>
              {pedido.detalles.map((d, i) => (
                <div
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                    padding: "20px",
                    borderRadius: "12px",
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                    border: "1px solid #e2e8f0"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {d.producto?.imagen && (
                    <img
                      src={d.producto.imagen}
                      alt={d.producto.nombre}
                      style={{
                        width: "80px",
                        height: "80px",
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
                      {d.producto?.nombre || "Producto no disponible"}
                    </strong>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "15px",
                      fontSize: "14px",
                      color: "#64748b",
                      flexWrap: "wrap"
                    }}>
                      <span style={{ 
                        background: "#f1f5f9",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        border: "1px solid #e2e8f0"
                      }}>
                        Cantidad: {d.cantidad}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: "600" }}>
                        ${d.producto?.precio ? parseFloat(d.producto.precio).toFixed(2) : "0.00"} c/u
                      </span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "#FF6B35",
                    minWidth: "100px",
                    textAlign: "right"
                  }}>
                    ${d.subtotal ? parseFloat(d.subtotal).toFixed(2) : "0.00"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "50px 20px",
              color: "#64748b",
              background: "#F8FAFC",
              borderRadius: "12px",
              border: "2px dashed #E5E7EB"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>🛒</div>
              <p style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                margin: "0 0 10px 0" 
              }}>
                No hay productos en este pedido
              </p>
              <p style={{ 
                fontSize: "14px", 
                color: "#94A3B8", 
                margin: 0 
              }}>
                No se encontraron detalles del pedido
              </p>
            </div>
          )}
        </div>

        {/* RESUMEN DEL PEDIDO */}
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
            <span style={{ fontSize: "28px" }}>💰</span>
            Resumen del pedido
          </h2>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginBottom: "30px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "15px",
              borderBottom: "2px solid #f1f5f9"
            }}>
              <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                Subtotal:
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                ${pedido.subtotal ? parseFloat(pedido.subtotal).toFixed(2) : "0.00"}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "15px",
              borderBottom: "2px solid #f1f5f9"
            }}>
              <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                IVA (12%):
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                ${pedido.iva ? parseFloat(pedido.iva).toFixed(2) : "0.00"}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "15px",
              borderBottom: "2px solid #f1f5f9"
            }}>
              <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                Envío:
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#2C3E50" }}>
                ${pedido.envio ? parseFloat(pedido.envio).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          <div style={{
            background: "#FF6B35",
            padding: "25px",
            borderRadius: "14px",
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
              ${pedido.total ? parseFloat(pedido.total).toFixed(2) : "0.00"}
            </span>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* ESTILOS GLOBALES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          
          .estado-total {
            align-items: flex-start !important;
          }
          
          h1 {
            font-size: 28px !important;
          }
        }
        
        @media (max-width: 480px) {
          .action-buttons {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .action-buttons button {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .product-detail {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}