import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import StarRating from "../../components/StarRating.jsx";
import Footer from "../../components/Footer.jsx";

export default function VendedorPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarCarrito } = useCarrito();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [vendedor, setVendedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);
  
  // ==================== NOTIFICACIONES MEJORADAS ====================
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: "success", // success, error, warning, info
    titulo: "",
    mensaje: "",
    icono: ""
  });

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
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
      
      for (let i = 0; i < 6; i++) {
        circles.push({
          id: i,
          size: Math.random() * 60 + 30,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 20 + 25 + "s",
          blur: Math.random() * 3 + 2 + "px",
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
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ===================== CARGAR PERFIL =====================
  useEffect(() => {
    if (!id) {
      setError("ID de vendedor inválido");
      setLoading(false);
      return;
    }

    const cargarPerfil = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/vendedores/${id}`);
        if (!res.ok) throw new Error("Error cargando vendedor");

        const data = await res.json();

        setVendedor({
          idVendedor: data.idVendedor,
          nombreEmpresa: data.nombreEmpresa,
          nombre: data.nombreVendedor,
          apellido: data.apellidoVendedor,
          direccion: data.direccion,
          telefono: data.telefono,
          calificacionPromedio: data.calificacionPromedio || 0
        });

        setProductos(data.productos || []);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el perfil del vendedor");
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();

    // Verificar usuario logueado y su rol
    const verificarUsuario = () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");
        
        if (token && userData) {
          const usuario = JSON.parse(userData);
          setUsuarioLogueado(usuario);
          setRolUsuario(usuario.rol || null);
        } else {
          setUsuarioLogueado(null);
          setRolUsuario(null);
        }
      } catch (error) {
        console.error("Error al verificar usuario:", error);
        setUsuarioLogueado(null);
        setRolUsuario(null);
      }
    };

    verificarUsuario();
  }, [id]);

  // ===================== MOSTRAR NOTIFICACIÓN =====================
  const mostrarNotificacion = (tipo, titulo, mensaje, icono = null) => {
    // Iconos por defecto según el tipo
    const iconosPorTipo = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    };

    setNotificacion({
      mostrar: true,
      tipo,
      titulo,
      mensaje,
      icono: icono || iconosPorTipo[tipo]
    });

    // Ocultar notificación después de 4 segundos
    setTimeout(() => {
      setNotificacion({
        mostrar: false,
        tipo: "",
        titulo: "",
        mensaje: "",
        icono: ""
      });
    }, 4000);
  };

  // ===================== AGREGAR AL CARRITO - CON NOTIFICACIONES =====================
  const handleAgregarCarrito = async (producto) => {
    console.log("🛒 Intentando agregar producto:", {
      nombre: producto.nombreProducto,
      stock: producto.stockProducto,
      usuario: usuarioLogueado,
      rol: rolUsuario
    });
    
    // 1. Verificar si está logueado
    if (!usuarioLogueado) {
      mostrarNotificacion(
        "warning",
        "Inicia sesión",
        "Debes iniciar sesión para agregar productos al carrito",
        "🔒"
      );
      
      // Redirigir después de un breve delay para que se vea la notificación
      setTimeout(() => {
        navigate("/LoginModal");
      }, 1500);
      return;
    }

    // 2. Verificar si es CONSUMIDOR
    if (rolUsuario !== "CONSUMIDOR") {
      mostrarNotificacion(
        "error",
        "Acceso restringido",
        "Solo los CONSUMIDORES pueden agregar productos al carrito",
        "👤"
      );
      return;
    }

    // 3. Verificar stock
    if (producto.stockProducto <= 0) {
      mostrarNotificacion(
        "error",
        "Sin stock",
        "Este producto no está disponible por el momento",
        "📦"
      );
      return;
    }

    try {
      console.log("✅ Todas las verificaciones pasadas");
      
      // Verificar token
      const token = localStorage.getItem("authToken");
      if (!token) {
        mostrarNotificacion(
          "warning",
          "Sesión expirada",
          "Por favor, inicia sesión nuevamente",
          "⏰"
        );
        
        setTimeout(() => {
          navigate("/LoginModal");
        }, 1500);
        return;
      }
      
      // Intentar agregar al carrito
      await agregarCarrito(producto.idProducto, 1);
      
      // Mostrar notificación de éxito
      mostrarNotificacion(
        "success",
        "¡Producto agregado!",
        `${producto.nombreProducto} ha sido añadido al carrito`,
        "🛒"
      );
      
    } catch (error) {
      console.error("❌ Error al agregar al carrito:", error);
      mostrarNotificacion(
        "error",
        "Error",
        "No se pudo agregar el producto al carrito",
        "😔"
      );
    }
  };

  // ===================== FUNCIÓN PARA DETERMINAR ICONO Y ESTADO =====================
  const getIconoYEstado = (producto) => {
    // Si no hay usuario logueado → Candado
    if (!usuarioLogueado) {
      return {
        icono: "🔒",
        puedeAgregar: false,
        tooltip: "Inicia sesión como CONSUMIDOR",
        cursor: "not-allowed"
      };
    }
    
    // Si hay usuario pero NO es CONSUMIDOR → Candado
    if (rolUsuario !== "CONSUMIDOR") {
      return {
        icono: "🔒",
        puedeAgregar: false,
        tooltip: "Solo para CONSUMIDORES",
        cursor: "not-allowed"
      };
    }
    
    // Si es CONSUMIDOR pero sin stock → Cruz
    if (producto.stockProducto <= 0) {
      return {
        icono: "✗",
        puedeAgregar: false,
        tooltip: "Sin stock",
        cursor: "not-allowed"
      };
    }
    
    // Si es CONSUMIDOR con stock → Carrito
    return {
      icono: "🛒",
      puedeAgregar: true,
      tooltip: "Agregar al carrito",
      cursor: "pointer"
    };
  };

  // ===================== CALIFICACIÓN PROMEDIO =====================
  const promedioGeneral =
    productos.length > 0
      ? (
          productos.reduce(
            (acc, p) => acc + (p.promedioValoracion || 0),
            0
          ) / productos.length
        ).toFixed(1)
      : 0;

  // ===================== ESTADOS =====================
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando perfil del vendedor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>😔</div>
          <p style={styles.errorTitle}>Oops! Algo salió mal</p>
          <p style={styles.errorMessage}>{error}</p>
          <button style={styles.btnBack} onClick={() => navigate(-1)}>
            ← Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* NOTIFICACIÓN FLOTANTE */}
      {notificacion.mostrar && (
        <div 
          style={{
            ...styles.notificacion,
            background: styles.notificacionColores[notificacion.tipo].background,
            borderColor: styles.notificacionColores[notificacion.tipo].borderColor,
            transform: "translateX(0)",
            opacity: 1
          }}
        >
          <div style={styles.notificacionIcono}>
            {notificacion.icono}
          </div>
          <div style={styles.notificacionContenido}>
            <div style={styles.notificacionTitulo}>
              {notificacion.titulo}
            </div>
            <div style={styles.notificacionMensaje}>
              {notificacion.mensaje}
            </div>
          </div>
          <button 
            onClick={() => setNotificacion({...notificacion, mostrar: false})}
            style={styles.notificacionCerrar}
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER CON INFORMACIÓN DEL VENDEDOR ARRIBA - DISEÑO MEJORADO */}
      <div style={styles.header}>
        {/* CÍRCULOS DE FONDO */}
        {circlePositions.map(circle => (
          <div key={circle.id} style={{
            ...styles.circle,
            top: `${circle.top}%`,
            left: `${circle.left}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            background: circle.color,
            animationDelay: circle.animationDelay,
            animationDuration: circle.animationDuration,
            filter: `blur(${circle.blur})`
          }} />
        ))}

        {/* CONTENIDO DEL HEADER CON INFORMACIÓN DEL VENDEDOR */}
        <div style={styles.headerContent}>
          {/* TÍTULO PEQUEÑO */}
          <div style={styles.headerSubtitle}>Perfil del Vendedor</div>
          
          {/* INFORMACIÓN DEL VENDEDOR EN TARJETA BLANCA */}
          <div style={styles.vendorCard}>
            <div style={styles.vendorInfo}>
              {/* AVATAR */}
              <div style={styles.avatar}>
                {vendedor.nombreEmpresa.charAt(0).toUpperCase()}
              </div>
              
              {/* INFORMACIÓN DEL VENDEDOR - NO DEL USUARIO */}
              <div style={styles.vendorDetails}>
                <h1 style={styles.vendorName}>{vendedor.nombreEmpresa}</h1>
                
                {/* VENDEDOR INFO (nombre del vendedor) */}
                <div style={styles.vendorInfoBadge}>
                  <span>👨‍🌾</span>
                  Vendedor: {vendedor.nombre} {vendedor.apellido}
                  <span style={{
                    background: "#FF6B35",
                    color: "white",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    marginLeft: "8px"
                  }}>
                    VENDEDOR
                  </span>
                </div>
                
                {/* MENSAJE DE ESTADO PARA EL USUARIO LOGUEADO */}
                <div style={styles.userStatusSection}>
                  {usuarioLogueado && (
                    <div style={styles.userStatus}>
                      <div style={{
                        ...styles.userStatusBadge,
                        background: rolUsuario === "CONSUMIDOR" ? "#10B98115" : "#3B82F615",
                        borderColor: rolUsuario === "CONSUMIDOR" ? "#10B98130" : "#3B82F630",
                        color: rolUsuario === "CONSUMIDOR" ? "#10B981" : "#3B82F6"
                      }}>
                        <span>Tú: </span>
                        {usuarioLogueado.nombres} {usuarioLogueado.apellidos}
                        <span style={{
                          background: rolUsuario === "CONSUMIDOR" ? "#10B981" : "#3B82F6",
                          color: "white",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          marginLeft: "8px"
                        }}>
                          {rolUsuario}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p style={styles.statusMessage}>
                    {usuarioLogueado 
                      ? (rolUsuario === "CONSUMIDOR" 
                          ? "✅ Puedes agregar productos al carrito" 
                          : "ℹ️ Solo CONSUMIDORES pueden agregar al carrito")
                      : "👤 Inicia sesión como CONSUMIDOR para comprar"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* INFORMACIÓN DETALLADA DEL VENDEDOR */}
            <div style={styles.vendorStats}>
              <div style={styles.statGrid}>
                <div style={styles.statItem}>
                  <div style={styles.statIcon}>⭐</div>
                  <div>
                    <div style={styles.statLabel}>Calificación</div>
                    <div style={styles.statValue}>{promedioGeneral}</div>
                  </div>
                </div>
                
                <div style={styles.statItem}>
                  <div style={styles.statIcon}>📦</div>
                  <div>
                    <div style={styles.statLabel}>Productos</div>
                    <div style={styles.statValue}>{productos.length}</div>
                  </div>
                </div>
                
                <div style={styles.statItem}>
                  <div style={styles.statIcon}>📍</div>
                  <div>
                    <div style={styles.statLabel}>Dirección</div>
                    <div style={styles.statValueSmall}>{vendedor.direccion}</div>
                  </div>
                </div>
                
                <div style={styles.statItem}>
                  <div style={styles.statIcon}>📞</div>
                  <div>
                    <div style={styles.statLabel}>Teléfono</div>
                    <div style={styles.statValue}>{vendedor.telefono}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE PRODUCTOS */}
      <div style={styles.productsSection}>
        {/* ENCABEZADO DE PRODUCTOS */}
        <div style={styles.productsHeader}>
          <div style={styles.productsTitleContainer}>
            <div style={styles.productsIcon}>🥕</div>
            <div>
              <h2 style={styles.productsTitle}>Productos Disponibles</h2>
              <p style={styles.productsSubtitle}>
                Explora todos los productos de {vendedor.nombreEmpresa}
              </p>
            </div>
          </div>
          
          <div style={styles.productsCount}>
            <span>📊</span>
            <span>{productos.length} productos</span>
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        {productos.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <p style={styles.emptyTitle}>No hay productos disponibles</p>
            <p style={styles.emptyMessage}>
              Este vendedor no tiene productos disponibles en este momento.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.productsGrid}>
              {productos.map(p => {
                // Determinar icono y estado del botón
                const { icono, puedeAgregar, tooltip, cursor } = getIconoYEstado(p);
                
                return (
                  <div
                    key={p.idProducto}
                    style={styles.productCard}
                    onClick={() => navigate(`/producto/${p.idProducto}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    {/* IMAGEN DEL PRODUCTO */}
                    <div style={styles.productImageContainer}>
                      <img
                        src={p.imagenProducto || "https://via.placeholder.com/280x200/FF6B35/FFFFFF?text=Producto"}
                        alt={p.nombreProducto}
                        style={styles.productImage}
                      />
                      
                      {/* BADGE DE STOCK */}
                      <div style={{
                        ...styles.stockBadge,
                        background: p.stockProducto <= 0 ? "#EF4444" : 
                                  (p.stockProducto <= 10 ? "#F59E0B" : "#10B981")
                      }}>
                        {p.stockProducto <= 0 ? "✗ Agotado" : 
                         p.stockProducto <= 10 ? `⚡ ${p.stockProducto}` : "✓ Disponible"}
                      </div>
                    </div>

                    {/* INFORMACIÓN DEL PRODUCTO */}
                    <div style={styles.productContent}>
                      <h3 style={styles.productName}>{p.nombreProducto}</h3>
                      
                      {/* RATING */}
                      {p.promedioValoracion > 0 && (
                        <div style={styles.productRating}>
                          <StarRating rating={p.promedioValoracion || 0} size={16} />
                          <span style={styles.ratingNumber}>
                            {p.promedioValoracion.toFixed(1)}
                          </span>
                          <span style={styles.ratingCount}>
                            ({p.totalValoraciones || 0})
                          </span>
                        </div>
                      )}

                      {/* PRECIO Y BOTÓN */}
                      <div style={styles.productFooter}>
                        <div style={styles.productPrice}>
                          ${typeof p.precioProducto === 'number' ? p.precioProducto.toFixed(2) : p.precioProducto}
                        </div>
                        
                        {/* BOTÓN DE AGREGAR AL CARRITO - MEJORADO */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (puedeAgregar) {
                              handleAgregarCarrito(p);
                            } else if (!usuarioLogueado) {
                              mostrarNotificacion(
                                "warning",
                                "Inicia sesión",
                                "Debes iniciar sesión para agregar productos al carrito",
                                "🔒"
                              );
                              
                              setTimeout(() => {
                                navigate("/LoginModal");
                              }, 1500);
                            }
                          }}
                          style={{
                            ...styles.addButton,
                            background: puedeAgregar ? "#FF6B35" : "#e5e7eb",
                            cursor: cursor,
                            opacity: puedeAgregar ? 1 : 0.7
                          }}
                          onMouseEnter={(e) => {
                            if (puedeAgregar) {
                              e.currentTarget.style.transform = "scale(1.1)";
                              e.currentTarget.style.background = "#FF8E53";
                            } else {
                              e.currentTarget.style.transform = "scale(1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (puedeAgregar) {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.background = "#FF6B35";
                            }
                          }}
                          title={tooltip}
                        >
                          <span style={{ 
                            color: puedeAgregar ? "white" : "#94a3b8",
                            fontSize: "22px",
                            display: "block"
                          }}>
                            {icono}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={styles.productsFooter}>
              <p style={styles.footerText}>
                Has visto todos los productos de {vendedor.nombreEmpresa}
              </p>
              <p style={styles.footerSubtext}>
                {usuarioLogueado && rolUsuario !== "CONSUMIDOR" ? (
                  <span>
                    Para comprar, necesitas una cuenta de <strong style={{ color: "#FF6B35" }}>CONSUMIDOR</strong>
                  </span>
                ) : (
                  <span>
                    Mostrando <strong style={{ color: "#FF6B35" }}>{productos.length}</strong> productos del vendedor
                  </span>
                )}
              </p>
            </div>
          </>
        )}
      </div>
      
      <Footer />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes floatCircle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(15px, -20px) scale(1.05); }
          50% { transform: translate(-10px, 15px) scale(0.95); }
          75% { transform: translate(5px, 10px) scale(1.02); }
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
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        button {
          cursor: pointer;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}

/* ===================== ESTILOS ===================== */
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflowX: "hidden"
  },
  
  // ==================== NOTIFICACIONES ====================
  notificacion: {
    position: "fixed",
    top: "30px",
    right: "30px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px 25px",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    border: "2px solid",
    maxWidth: "400px",
    minWidth: "350px",
    animation: "slideIn 0.4s ease-out forwards",
    fontFamily: "'Inter', sans-serif",
    backdropFilter: "blur(10px)",
    transform: "translateX(100%)",
    opacity: 0,
    transition: "all 0.4s ease"
  },
  
  notificacionColores: {
    success: {
      background: "linear-gradient(135deg, #10B98115, #10B98108)",
      borderColor: "#10B98150",
      color: "#10B981"
    },
    error: {
      background: "linear-gradient(135deg, #EF444415, #EF444408)",
      borderColor: "#EF444450",
      color: "#EF4444"
    },
    warning: {
      background: "linear-gradient(135deg, #F59E0B15, #F59E0B08)",
      borderColor: "#F59E0B50",
      color: "#F59E0B"
    },
    info: {
      background: "linear-gradient(135deg, #3B82F615, #3B82F608)",
      borderColor: "#3B82F650",
      color: "#3B82F6"
    }
  },
  
  notificacionIcono: {
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.9)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  },
  
  notificacionContenido: {
    flex: 1
  },
  
  notificacionTitulo: {
    fontSize: "16px",
    fontWeight: "800",
    marginBottom: "5px",
    letterSpacing: "0.3px"
  },
  
  notificacionMensaje: {
    fontSize: "14px",
    fontWeight: "500",
    opacity: 0.9,
    lineHeight: "1.5"
  },
  
  notificacionCerrar: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "inherit",
    opacity: 0.7,
    cursor: "pointer",
    padding: "5px",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    ":hover": {
      opacity: 1,
      background: "rgba(255, 255, 255, 0.2)"
    }
  },
  
  // Loading
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f8f9fa"
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "5px solid #f1f5f9",
    borderTop: "5px solid #FF6B35",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#2C3E50",
    fontWeight: "600"
  },
  
  // Error
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f8f9fa",
    padding: "20px"
  },
  errorCard: {
    background: "white",
    padding: "50px",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    maxWidth: "500px"
  },
  errorIcon: {
    fontSize: "80px",
    marginBottom: "20px",
    opacity: 0.7
  },
  errorTitle: {
    color: "#2C3E50",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 15px 0"
  },
  errorMessage: {
    color: "#64748b",
    fontSize: "16px",
    margin: "0 0 30px 0",
    lineHeight: "1.6"
  },
  btnBack: {
    padding: "16px 36px",
    background: "#FF6B35",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
      background: "#FF8E53",
      boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)"
    }
  },
  
  // Header - DISEÑO MEJORADO
  header: {
    background: "white",
    padding: "40px 20px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    borderBottom: "1px solid #f1f5f9"
  },
  circle: {
    position: "absolute",
    borderRadius: "50%",
    animation: "floatCircle 30s ease-in-out infinite",
    opacity: 0.8,
    zIndex: 0
  },
  headerContent: {
    position: "relative",
    zIndex: "10",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 15px"
  },
  headerSubtitle: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: "14px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#FF6B35",
    marginBottom: "15px",
    fontWeight: "500"
  },
  
  // Tarjeta del vendedor
  vendorCard: {
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
    marginTop: "10px"
  },
  vendorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginBottom: "25px",
    flexWrap: "wrap"
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF6B35, #FF8E53)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "700",
    color: "white",
    fontFamily: "'Playfair Display', serif",
    boxShadow: "0 6px 15px rgba(255, 107, 53, 0.3)",
    flexShrink: 0
  },
  vendorDetails: {
    flex: 1,
    textAlign: "left"
  },
  vendorName: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "28px",
    fontWeight: "800",
    color: "#2C3E50",
    margin: "0 0 10px 0",
    lineHeight: "1.2"
  },
  vendorInfoBadge: {
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#FF6B3515",
    border: "2px solid #FF6B3530",
    color: "#FF6B35",
    marginBottom: "10px"
  },
  userStatusSection: {
    marginTop: "15px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "15px"
  },
  userStatus: {
    marginBottom: "8px"
  },
  userStatusBadge: {
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "2px solid"
  },
  statusMessage: {
    color: "#8B5CF6",
    fontSize: "15px",
    margin: "5px 0 0 0",
    fontWeight: "400",
    opacity: 0.9
  },
  
  // Estadísticas del vendedor
  vendorStats: {
    marginTop: "20px"
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px"
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
    }
  },
  statIcon: {
    fontSize: "24px",
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #FF6B35, #FF8E53)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    flexShrink: 0
  },
  statLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px"
  },
  statValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "18px",
    fontWeight: "800",
    color: "#2C3E50",
    margin: "0"
  },
  statValueSmall: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2C3E50",
    margin: "0",
    lineHeight: "1.3"
  },
  
  // Products Section
  productsSection: {
    maxWidth: "1200px",
    margin: "40px auto 60px auto",
    padding: "0 20px"
  },
  productsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px"
  },
  productsTitleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  },
  productsIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #FF6B35, #FF8E53)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "white"
  },
  productsTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#FF6B35",
    margin: "0 0 5px 0"
  },
  productsSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    color: "#64748b",
    margin: "0",
    fontWeight: "500"
  },
  productsCount: {
    background: "#FF6B3515",
    border: "2px solid #FF6B3530",
    padding: "10px 20px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "800",
    color: "#FF6B35",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  
  // Products Grid
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "25px",
    marginBottom: "40px"
  },
  productCard: {
    background: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid #f1f5f9"
  },
  productImageContainer: {
    position: "relative",
    overflow: "hidden",
    height: "180px",
    background: "#f8f9fa"
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease"
  },
  stockBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    color: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.2)",
    zIndex: "2"
  },
  productContent: {
    padding: "20px"
  },
  productName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#2C3E50",
    margin: "0 0 10px 0",
    lineHeight: "1.4",
    minHeight: "48px",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },
  productRating: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "15px",
    flexWrap: "wrap"
  },
  ratingNumber: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600"
  },
  ratingCount: {
    fontSize: "12px",
    color: "#94a3b8"
  },
  productFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  },
  productPrice: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#FF6B35",
    lineHeight: "1"
  },
  addButton: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.3s ease",
    fontSize: "20px",
    position: "relative"
  },
  
  // Empty State
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
  },
  emptyIcon: {
    fontSize: "60px",
    marginBottom: "20px",
    opacity: 0.7
  },
  emptyTitle: {
    color: "#2C3E50",
    fontSize: "20px",
    fontWeight: "700",
    margin: "0 0 10px 0"
  },
  emptyMessage: {
    color: "#64748b",
    fontSize: "15px",
    margin: "0 0 20px 0",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: "1.6"
  },
  
  // Products Footer
  productsFooter: {
    textAlign: "center",
    padding: "25px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)"
  },
  footerText: {
    color: "#64748b",
    fontSize: "15px",
    fontWeight: "600",
    margin: "0 0 8px 0"
  },
  footerSubtext: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "0"
  }
};