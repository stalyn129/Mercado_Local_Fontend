import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import Footer from "../../components/Footer.jsx";
import StarRating from "../../components/StarRating.jsx";

export default function ExplorarProductos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const navigate = useNavigate();
  const { agregarCarrito } = useCarrito();

  // ==================== STATES ====================
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [circlePositions, setCirclePositions] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    // Generar círculos de colores vivos como en móvil
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",    // Naranja claro
        "rgba(52, 211, 153, 0.15)",    // Verde esmeralda
        "rgba(59, 130, 246, 0.15)",    // Azul
        "rgba(168, 85, 247, 0.15)",    // Morado
        "rgba(239, 68, 68, 0.15)",     // Rojo
        "rgba(245, 158, 11, 0.15)",    // Amarillo
        "rgba(14, 165, 233, 0.15)",    // Azul claro
        "rgba(236, 72, 153, 0.15)"     // Rosa
      ];
      
      for (let i = 0; i < 12; i++) {
        circles.push({
          id: i,
          size: Math.random() * 100 + 50, // Tamaño entre 50px y 150px
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s", // Muy lento
          blur: Math.random() * 4 + 2 + "px",
          zIndex: 0
        });
      }
      setCirclePositions(circles);
    };

    generateCircles();
    
    // Animar los círculos muy lentamente
    const interval = setInterval(() => {
      setCirclePositions(prev => 
        prev.map(circle => ({
          ...circle,
          top: Math.random() * 100,
          left: Math.random() * 100,
          animationDelay: Math.random() * 4 + "s"
        }))
      );
    }, 35000); // Cambia cada 35 segundos (super lento)

    return () => clearInterval(interval);
  }, []);

  // ==================== USE EFFECT ====================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await Promise.all([
          cargarProductos(),
          cargarCategorias(),
          cargarSubcategorias()
        ]);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();

    const checkGuestMode = () => {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");
      
      if (!token && !user) {
        setIsGuestMode(true);
      } else {
        setIsGuestMode(false);
      }
    };

    checkGuestMode();
  }, []);

  // ==================== FETCH ====================
  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos/listar`);
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProductos(data);
    } catch (e) {
      console.error("❌ Error cargando productos", e);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias/listar`);
      const data = await res.json();
      setCategorias(data);
    } catch (e) {
      console.log("Error cargando categorias", e);
    }
  };

  const cargarSubcategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/subcategorias/listar`);
      const data = await res.json();
      setSubcategorias(data);
    } catch (e) {
      console.log("Error cargando subcategorias", e);
    }
  };

  // ==================== FILTROS ====================
  const productosFiltrados = productos.filter((p) => {
    const cumpleBusqueda = 
      p.nombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.nombreCategoria && p.nombreCategoria.toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.nombreSubcategoria && p.nombreSubcategoria.toLowerCase().includes(busqueda.toLowerCase()));
    
    const cumpleCategoria = filtroCategoria ? p.idCategoria === parseInt(filtroCategoria) : true;
    const cumpleSubcategoria = filtroSubcategoria ? p.idSubcategoria === parseInt(filtroSubcategoria) : true;
    return cumpleBusqueda && cumpleCategoria && cumpleSubcategoria;
  });

  // 🔥 FUNCIÓN PARA AGREGAR AL CARRITO
  const handleAgregarCarrito = async (producto) => {
    if (producto.stockProducto <= 0) {
      alert("Sin stock: Este producto no está disponible por el momento");
      return;
    }

    if (isGuestMode) {
      let carritoLocal = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingIndex = carritoLocal.findIndex(
        item => item.producto.idProducto === producto.idProducto
      );
      
      let nuevoCarrito;
      
      if (existingIndex >= 0) {
        nuevoCarrito = [...carritoLocal];
        nuevoCarrito[existingIndex].cantidad += 1;
      } else {
        nuevoCarrito = [...carritoLocal, { producto, cantidad: 1 }];
      }
      
      localStorage.setItem("guestCart", JSON.stringify(nuevoCarrito));
      alert(`✅ ¡Agregado! ${producto.nombreProducto} agregado al carrito`);
      
    } else {
      const usuario = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("authToken");

      if (!usuario || !token) {
        alert("⚠️ Debes iniciar sesión para agregar productos al carrito");
        navigate("/login");
        return;
      }

      try {
        await agregarCarrito(producto.idProducto, 1);
        alert("✅ Producto añadido al carrito");
      } catch (error) {
        console.error(error);
        alert("❌ No se pudo agregar el producto al carrito");
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* HEADER BLANCO CON CÍRCULOS DE COLORES - COMO EN MÓVIL */}
      <div style={{
        background: "white", // FONDO BLANCO
        padding: "90px 20px 70px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "40px",
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {/* CÍRCULOS DE COLORES ANIMADOS - DETRÁS DEL CONTENIDO */}
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

        <div style={{ 
          position: "relative", 
          zIndex: "10",
          padding: "0 15px"
        }}>
          {/* Título principal - NARANJA */}
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FF6B35", // NARANJA
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Catálogo de Productos
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "700",
            color: "#FF6B35", // NARANJA
            margin: "0 0 16px 0",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Explorar Productos
          </h1>
          
          {/* Subtítulo - MORADO CLARO */}
          <p style={{
            color: "#8B5CF6", // MORADO CLARO
            fontSize: "16px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6",
            fontWeight: "400",
            fontFamily: "'Inter', sans-serif",
            opacity: 0.8
          }}>
            Encuentra lo que necesitas
          </p>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS - MANTENER NARANJA EN BOTONES */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 40px auto",
        padding: "0 20px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "25px"
        }}>
          
          {/* BARRA DE BÚSQUEDA */}
          <div style={{
            position: "relative",
            width: "100%"
          }}>
            <input
              type="text"
              placeholder="Escribe el nombre del producto, categoría o subcategoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "18px 25px 18px 55px",
                borderRadius: "14px",
                border: "2px solid #e5e7eb",
                fontSize: "16px",
                color: "#2C3E50",
                backgroundColor: "white",
                transition: "all 0.3s ease",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                boxSizing: "border-box"
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
            <div style={{
              position: "absolute",
              left: "22px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "20px",
              color: "#94a3b8"
            }}>
              🔍
            </div>
            
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#64748b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* FILTROS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px"
          }}>
            {/* FILTRO POR CATEGORÍA */}
            <div>
              <div style={{ position: "relative" }}>
                <select
                  value={filtroCategoria}
                  onChange={(e) => {
                    setFiltroCategoria(e.target.value);
                    setFiltroSubcategoria("");
                  }}
                  style={{
                    width: "100%",
                    padding: "16px 25px 16px 55px",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    fontSize: "16px",
                    color: filtroCategoria ? "#2C3E50" : "#94a3b8",
                    backgroundColor: "white",
                    cursor: "pointer",
                    appearance: "none",
                    transition: "all 0.3s ease",
                    outline: "none",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: "500"
                  }}
                >
                  <option value="">📂 Selecciona una categoría</option>
                  {categorias.map(c => (
                    <option key={c.idCategoria} value={c.idCategoria}>
                      {c.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FILTRO POR SUBCATEGORÍA */}
            <div>
              <div style={{ position: "relative" }}>
                <select
                  value={filtroSubcategoria}
                  onChange={(e) => setFiltroSubcategoria(e.target.value)}
                  disabled={!filtroCategoria}
                  style={{
                    width: "100%",
                    padding: "16px 25px 16px 55px",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    fontSize: "16px",
                    color: filtroSubcategoria ? "#2C3E50" : "#94a3b8",
                    backgroundColor: !filtroCategoria ? "#f8f9fa" : "white",
                    cursor: filtroCategoria ? "pointer" : "not-allowed",
                    appearance: "none",
                    transition: "all 0.3s ease",
                    outline: "none",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: "500",
                    opacity: filtroCategoria ? 1 : 0.7
                  }}
                >
                  <option value="">
                    {filtroCategoria ? "📍 Selecciona una subcategoría" : "📂 Selecciona categoría primero"}
                  </option>
                  {subcategorias
                    .filter(s => !filtroCategoria || s.idCategoria === parseInt(filtroCategoria))
                    .map(s => (
                      <option key={s.idSubcategoria} value={s.idSubcategoria}>
                        {s.nombreSubcategoria}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* CONTADOR Y ACCIONES */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "20px",
            borderTop: "1px solid #f1f5f9"
          }}>
            {/* CONTADOR */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                fontSize: "28px",
                color: "#FF6B35",
                display: "flex",
                alignItems: "center"
              }}>
                📊
              </div>
              <div>
                <p style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#64748b",
                  margin: "0",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Resultados encontrados
                </p>
                <p style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#2C3E50",
                  margin: "5px 0 0 0",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {productosFiltrados.length} <span style={{ fontSize: "16px", fontWeight: "600", color: "#94a3b8" }}>productos</span>
                </p>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN - CON NARANJA */}
            <div style={{ display: "flex", gap: "15px" }}>
              {(busqueda || filtroCategoria || filtroSubcategoria) && (
                <button
                  onClick={() => {
                    setBusqueda("");
                    setFiltroCategoria("");
                    setFiltroSubcategoria("");
                  }}
                  style={{
                    padding: "14px 28px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "15px",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "#f1f5f9";
                  }}
                >
                  <span>🔄</span>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE PRODUCTOS - MANTENER NARANJA */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 60px auto",
        padding: "0 20px"
      }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)"
          }}>
            <div style={{
              display: "inline-block",
              width: "60px",
              height: "60px",
              border: "5px solid #f1f5f9",
              borderTop: "5px solid #FF6B35", // NARANJA
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
              Cargando catálogo de productos...
            </p>
          </div>
        ) : productosFiltrados.length > 0 ? (
          <>
            <div className="grid-container" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "25px",
              marginBottom: "50px"
            }}>
              {productosFiltrados.map(p => (
                <div
                  key={p.idProducto}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.4s ease",
                    cursor: "pointer",
                    position: "relative",
                    border: "1px solid #f1f5f9"
                  }}
                  onClick={() => navigate(`/producto/${p.idProducto}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
                  }}
                >
                  {/* Imagen del producto */}
                  <div style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "200px",
                    background: "#f8f9fa"
                  }}>
                    <img
                      src={p.imagenProducto}
                      alt={p.nombreProducto}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease"
                      }}
                    />
                    
                    {/* Badge de stock - CON NARANJA */}
                    <div style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      background: p.stockProducto <= 0 ? "#EF4444" : (p.stockProducto <= 10 ? "#F59E0B" : "#10B981"),
                      color: "white",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                      zIndex: "2",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {p.stockProducto <= 0 ? (
                        <>✗ Agotado</>
                      ) : p.stockProducto <= 10 ? (
                        <>⚡ {p.stockProducto} disponibles</>
                      ) : (
                        <>✓ Disponible</>
                      )}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div style={{ padding: "22px" }}>
                    {/* Nombre del producto */}
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      margin: "0 0 8px 0",
                      lineHeight: "1.3",
                      minHeight: "46px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {p.nombreProducto}
                    </h3>

                    {/* Categoría */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px"
                    }}>
                      <span style={{
                        fontSize: "12px",
                        color: "#64748b",
                        background: "#f1f5f9",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {p.nombreSubcategoria || p.nombreCategoria || "General"}
                      </span>
                    </div>

                    {/* Valoración */}
                    {p.promedioValoracion !== undefined && p.promedioValoracion > 0 && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "15px"
                      }}>
                        <StarRating rating={p.promedioValoracion || 0} />
                        <span style={{
                          fontSize: "13px",
                          color: "#64748b",
                          fontWeight: "600",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {p.promedioValoracion.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Pie del producto */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "15px"
                    }}>
                      {/* Precio - NARANJA */}
                      <div>
                        <div style={{
                          fontSize: "28px",
                          fontWeight: "800",
                          color: "#FF6B35", // NARANJA
                          lineHeight: "1",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          ${p.precioProducto.toFixed(2)}
                        </div>
                      </div>

                      {/* Botón de agregar - NARANJA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgregarCarrito(p);
                        }}
                        disabled={p.stockProducto <= 0}
                        style={{
                          background: p.stockProducto <= 0 ? "#94a3b8" : "#FF6B35", // NARANJA
                          width: "50px",
                          height: "50px",
                          borderRadius: "14px",
                          border: "none",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: p.stockProducto > 0 ? "pointer" : "not-allowed",
                          transition: "all 0.3s ease",
                          fontSize: "22px"
                        }}
                        onMouseEnter={(e) => {
                          if (p.stockProducto > 0) {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.background = "#FF8E53";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (p.stockProducto > 0) {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.background = "#FF6B35";
                          }
                        }}
                      >
                        <span style={{ color: "white" }}>
                          {p.stockProducto > 0 ? "🛒" : "✗"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FINAL */}
            <div style={{
              textAlign: "center",
              padding: "30px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
            }}>
              <p style={{
                color: "#64748b",
                fontSize: "16px",
                fontWeight: "600",
                margin: "0 0 10px 0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Has visto todos los productos disponibles
              </p>
              <p style={{
                color: "#94a3b8",
                fontSize: "14px",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Mostrando <strong style={{ color: "#FF6B35" }}>{productosFiltrados.length}</strong> productos
              </p>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <div style={{ fontSize: "80px", marginBottom: "25px", opacity: 0.7 }}>🔍</div>
            <p style={{
              color: "#2C3E50",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 15px 0",
              fontFamily: "'Inter', sans-serif"
            }}>
              No encontramos productos
            </p>
            <p style={{
              color: "#64748b",
              fontSize: "16px",
              margin: "0 0 30px 0",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6",
              fontFamily: "'Inter', sans-serif"
            }}>
              {busqueda 
                ? `No hay resultados para "${busqueda}". Intenta con otras palabras.`
                : "Ajusta los filtros de búsqueda para encontrar lo que necesitas."}
            </p>
            <button
              onClick={() => {
                setBusqueda("");
                setFiltroCategoria("");
                setFiltroSubcategoria("");
              }}
              style={{
                padding: "16px 36px",
                background: "#FF6B35", // NARANJA
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
              Mostrar todos los productos
            </button>
          </div>
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
        
        /* Responsive */
        @media (max-width: 768px) {
          .grid-container {
            grid-templateColumns: repeat(auto-fill, minmax(250px, 1fr)) !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
          
          .filtros-container {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          .grid-container {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 32px !important;
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
        
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
      `}</style>
    </div>
  );
}