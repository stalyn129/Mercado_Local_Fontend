import { useEffect, useState } from "react";
import Footer from "../../components/Footer.jsx";

export default function GestionarProductos() {
  const API_URL = "http://localhost:8080";

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);
  
  // Estados para filtros simplificados
  const [filtros, setFiltros] = useState({
    nombre: "",
    categoria: "",
    precioMin: "",
    precioMax: ""
  });
  
  // Estados para opciones de filtro
  const [categoriasUnicas, setCategoriasUnicas] = useState([]);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.12)",
        "rgba(52, 211, 153, 0.12)",
        "rgba(59, 130, 246, 0.12)",
        "rgba(168, 85, 247, 0.12)",
        "rgba(239, 68, 68, 0.12)",
        "rgba(245, 158, 11, 0.12)",
        "rgba(14, 165, 233, 0.12)",
        "rgba(236, 72, 153, 0.12)"
      ];
      
      for (let i = 0; i < 10; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 20 + 25 + "s",
          blur: Math.random() * 3 + 1 + "px",
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      console.warn("⚠ No hay sesión");
      window.location.href = "/loginmodal";
      return;
    }

    if (!user.idVendedor) {
      console.warn("⚠ No existe idVendedor en el localStorage");
      return;
    }

    obtenerProductos(user.idVendedor, user.token);
  }, []);

  const obtenerProductos = async (idVendedor, token) => {
    try {
      const res = await fetch(`${API_URL}/productos/vendedor/${idVendedor}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      console.log("📦 Productos cargados:", data);

      setProductos(data);
      setProductosFiltrados(data);
      
      // Extraer valores únicos para los filtros
      const categorias = [...new Set(data.map(p => p.nombreCategoria).filter(Boolean))];
      setCategoriasUnicas(categorias);
      
    } catch (e) {
      console.error("❌ Error al cargar productos:", e);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNCIONES DE FILTRADO ====================
  const aplicarFiltros = () => {
    let filtrados = [...productos];

    // Filtrar por nombre (búsqueda parcial)
    if (filtros.nombre) {
      filtrados = filtrados.filter(p => 
        p.nombreProducto.toLowerCase().includes(filtros.nombre.toLowerCase()) ||
        (p.descripcionProducto && p.descripcionProducto.toLowerCase().includes(filtros.nombre.toLowerCase()))
      );
    }

    // Filtrar por categoría
    if (filtros.categoria) {
      filtrados = filtrados.filter(p => 
        p.nombreCategoria === filtros.categoria
      );
    }

    // Filtrar por precio mínimo
    if (filtros.precioMin) {
      const min = parseFloat(filtros.precioMin);
      filtrados = filtrados.filter(p => 
        parseFloat(p.precioProducto) >= min
      );
    }

    // Filtrar por precio máximo
    if (filtros.precioMax) {
      const max = parseFloat(filtros.precioMax);
      filtrados = filtrados.filter(p => 
        parseFloat(p.precioProducto) <= max
      );
    }

    setProductosFiltrados(filtrados);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      nombre: "",
      categoria: "",
      precioMin: "",
      precioMax: ""
    });
    setProductosFiltrados(productos);
  };

  // Aplicar filtros automáticamente cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, productos]);

  const eliminarProducto = async (idProducto, nombreProducto) => {
    // Mostrar confirmación
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el producto "${nombreProducto}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) {
      return; // El usuario canceló
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      const res = await fetch(`${API_URL}/productos/eliminar/${idProducto}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        // Eliminar el producto del estado sin recargar
        const nuevosProductos = productos.filter(p => p.idProducto !== idProducto);
        setProductos(nuevosProductos);
        setProductosFiltrados(nuevosProductos);
        alert(`🗑️ Producto "${nombreProducto}" eliminado exitosamente`);
        console.log("🗑️ Producto eliminado:", idProducto);
      } else {
        const text = await res.text(); // para evitar error si no es JSON
        alert(`❌ No se pudo eliminar: ${text || 'Error inesperado'}`);
      }
    } catch (e) {
      console.error("❌ Error al eliminar producto:", e);
      alert("❌ Error de conexión. Verifica tu red e intenta nuevamente.");
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden",
      position: "relative"
    }}>
      
      {/* CÍRCULOS DE COLORES ANIMADOS EN EL FONDO */}
      {circlePositions.map(circle => (
        <div 
          key={circle.id}
          style={{
            position: "fixed",
            top: `${circle.top}%`,
            left: `${circle.left}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            background: circle.color,
            borderRadius: "50%",
            animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
            animationDelay: circle.animationDelay,
            filter: `blur(${circle.blur})`,
            opacity: 0.7,
            zIndex: circle.zIndex,
            pointerEvents: "none"
          }}
        />
      ))}

      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px",
        position: "relative",
        zIndex: "10"
      }}>
        
        {/* Header con efecto de dashboard */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "60px 40px",
          marginBottom: "40px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid #f1f5f9"
        }}>
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
              Panel de Productos
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "48px",
              fontWeight: "700",
              color: "#2C3E50",
              margin: "0 0 16px 0",
              letterSpacing: "0.5px",
              lineHeight: "1.2"
            }}>
              Gestión de Productos
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
              Administra y organiza tu catálogo de productos de manera eficiente
            </p>
          </div>
        </div>

        {/* Contenedor de Productos con diseño de dashboard */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9",
          position: "relative"
        }}>
          {/* Header de la tabla con icono */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "30px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                fontSize: "32px",
                background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)"
              }}>
                📦
              </div>
              <div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 4px 0"
                }}>
                  Lista de Productos
                </h2>
                <p style={{
                  color: "#64748b",
                  fontSize: "14px",
                  margin: "0",
                  fontWeight: "500"
                }}>
                  {productosFiltrados.length} de {productos.length} productos
                </p>
              </div>
            </div>
            
            {productos.length > 0 && (
              <div style={{
                background: "#f1f5f9",
                padding: "10px 20px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>📈</span>
                <span>Total: ${productosFiltrados.reduce((sum, p) => sum + (p.precioProducto || 0), 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* ==================== PANEL DE FILTROS SIMPLIFICADO ==================== */}
          <div style={{
            background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "30px",
            border: "1px solid #E2E8F0"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  fontSize: "20px",
                  color: "#FF6B35"
                }}>
                  🔍
                </div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0"
                }}>
                  Filtros de Búsqueda
                </h3>
              </div>
              
              <button
                onClick={limpiarFiltros}
                style={{
                  background: "white",
                  color: "#64748b",
                  border: "2px solid #E2E8F0",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#F1F5F9";
                  e.target.style.borderColor = "#94A3B8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                  e.target.style.borderColor = "#E2E8F0";
                }}
              >
                🗑️ Limpiar Filtros
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px"
            }}>
              {/* Filtro por nombre */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "8px"
                }}>
                  🔎 Buscar por nombre o descripción
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={filtros.nombre}
                  onChange={handleFiltroChange}
                  placeholder="Ej: Queso, Manzana, etc."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "2px solid #E2E8F0",
                    fontSize: "14px",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF6B35";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Filtro por categoría */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "8px"
                }}>
                  🏷️ Categoría
                </label>
                <select
                  name="categoria"
                  value={filtros.categoria}
                  onChange={handleFiltroChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "2px solid #E2E8F0",
                    fontSize: "14px",
                    backgroundColor: "white",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Todas las categorías</option>
                  {categoriasUnicas.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por rango de precio */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "8px"
                }}>
                  💰 Rango de Precio
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <span style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94A3B8",
                      fontWeight: "600"
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      name="precioMin"
                      value={filtros.precioMin}
                      onChange={handleFiltroChange}
                      placeholder="Mínimo"
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 32px",
                        borderRadius: "10px",
                        border: "2px solid #E2E8F0",
                        fontSize: "14px",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#FF6B35";
                        e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E2E8F0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    <span style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94A3B8",
                      fontWeight: "600"
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      name="precioMax"
                      value={filtros.precioMax}
                      onChange={handleFiltroChange}
                      placeholder="Máximo"
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 32px",
                        borderRadius: "10px",
                        border: "2px solid #E2E8F0",
                        fontSize: "14px",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#FF6B35";
                        e.target.style.boxShadow = "0 0 0 3px rgba(255, 107, 53, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E2E8F0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Indicador de filtros activos */}
            <div style={{ marginTop: "16px" }}>
              {Object.values(filtros).some(val => val !== "") && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "13px",
                  color: "#FF6B35",
                  fontWeight: "600"
                }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    background: "#FF6B35",
                    borderRadius: "50%",
                    animation: "pulse 1.5s ease-in-out infinite"
                  }}></div>
                  <span>
                    Filtros activos: {
                      Object.values(filtros).filter(val => val !== "").length
                    } de 3
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              marginBottom: "20px"
            }}>
              <div style={{ 
                display: "inline-block",
                width: "60px",
                height: "60px",
                border: "5px solid #f1f5f9",
                borderTop: "5px solid #FF6B35",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px"
              }}></div>
              <p style={{ 
                marginTop: "25px", 
                fontSize: "18px", 
                color: "#2C3E50", 
                fontWeight: "600" 
              }}>
                Cargando productos...
              </p>
              <p style={{ 
                color: "#64748b",
                fontSize: "14px",
                marginTop: "8px"
              }}>
                Obteniendo información del catálogo
              </p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              marginBottom: "20px"
            }}>
              {productos.length === 0 ? (
                <>
                  <div style={{ 
                    fontSize: "64px", 
                    marginBottom: "20px",
                    opacity: 0.5,
                    animation: "float 3s ease-in-out infinite"
                  }}>🌿</div>
                  <p style={{ 
                    fontWeight: "600",
                    fontSize: "20px",
                    marginBottom: "12px",
                    color: "#2C3E50"
                  }}>No hay productos registrados</p>
                  <p style={{ 
                    fontSize: "16px",
                    color: "#64748b",
                    marginBottom: "32px",
                    maxWidth: "400px",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}>
                    Comienza agregando tu primer producto al catálogo
                  </p>
                  <button
                    style={{
                      background: "white",
                      color: "#FF6B35",
                      border: "2px solid #FF6B35",
                      padding: "16px 40px",
                      borderRadius: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      boxShadow: "0 6px 20px rgba(255, 107, 53, 0.15)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#FF6B35";
                      e.target.style.color = "white";
                      e.target.style.transform = "translateY(-3px)";
                      e.target.style.boxShadow = "0 8px 25px rgba(255, 107, 53, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.color = "#FF6B35";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.15)";
                    }}
                    onClick={() => window.location.href = "/vendedor/agregar-producto"}
                  >
                    <span style={{ fontSize: "18px" }}>+</span>
                    Agregar Primer Producto
                  </button>
                </>
              ) : (
                <>
                  <div style={{ 
                    fontSize: "64px", 
                    marginBottom: "20px",
                    opacity: 0.5
                  }}>🔍</div>
                  <p style={{ 
                    fontWeight: "600",
                    fontSize: "20px",
                    marginBottom: "12px",
                    color: "#2C3E50"
                  }}>No se encontraron productos</p>
                  <p style={{ 
                    fontSize: "16px",
                    color: "#64748b",
                    marginBottom: "24px",
                    maxWidth: "400px",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}>
                    No hay productos que coincidan con los filtros aplicados
                  </p>
                  <button
                    onClick={limpiarFiltros}
                    style={{
                      background: "white",
                      color: "#3B82F6",
                      border: "2px solid #3B82F6",
                      padding: "12px 32px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "15px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#3B82F6";
                      e.target.style.color = "white";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.color = "#3B82F6";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <span>🗑️</span>
                    Limpiar Filtros
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Tabla de Productos */}
              <div style={{ overflowX: "auto", marginBottom: "30px" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  minWidth: "1000px"
                }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)"
                    }}>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        Imagen
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        Producto
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        Precio
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        Stock
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        Categoría
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        Subcategoría
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "center", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {productosFiltrados.map((p, index) => (
                      <tr key={p.idProducto} style={{ 
                        borderBottom: index === productosFiltrados.length - 1 ? "none" : "1px solid #f1f5f9",
                        transition: "all 0.3s ease",
                        background: index % 2 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(248, 250, 252, 0.5)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)";
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(248, 250, 252, 0.5)";
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      >
                        {/* Imagen */}
                        <td style={{ 
                          padding: "20px",
                          borderLeft: "4px solid transparent",
                          borderImage: index % 3 === 0 ? "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%) 1" :
                                    index % 3 === 1 ? "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) 1" :
                                    "linear-gradient(135deg, #10B981 0%, #34D399 100%) 1"
                        }}>
                          <div style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "12px",
                            overflow: "hidden",
                            position: "relative",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                          }}>
                            <img 
                              src={p.imagenProducto || "https://via.placeholder.com/70x70?text=Sin+Imagen"} 
                              alt={p.nombreProducto}
                              style={{ 
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease"
                              }}
                              onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                            />
                          </div>
                        </td>
                        
                        {/* Nombre del Producto */}
                        <td style={{ 
                          padding: "20px",
                          verticalAlign: "top"
                        }}>
                          <div style={{ 
                            fontWeight: "700",
                            color: "#2C3E50",
                            fontSize: "16px",
                            marginBottom: "6px"
                          }}>
                            {p.nombreProducto}
                          </div>
                          {p.descripcionProducto && (
                            <div style={{
                              color: "#64748B",
                              fontSize: "13px",
                              lineHeight: "1.4",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}>
                              {p.descripcionProducto}
                            </div>
                          )}
                        </td>
                        
                        {/* Precio */}
                        <td style={{ 
                          padding: "20px",
                          verticalAlign: "top"
                        }}>
                          <div style={{ 
                            fontWeight: "800",
                            color: "#FF6B35",
                            fontSize: "18px",
                            marginBottom: "6px"
                          }}>
                            ${Number(p.precioProducto).toFixed(2)}
                          </div>
                          <div style={{
                            color: "#94A3B8",
                            fontSize: "13px",
                            fontWeight: "600"
                          }}>
                            por {p.unidad || "unidad"}
                          </div>
                        </td>
                        
                        {/* Stock */}
                        <td style={{ padding: "20px", verticalAlign: "top" }}>
                          <div style={{
                            background: p.stockProducto > 20 ? "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)" :
                                    p.stockProducto > 10 ? "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)" :
                                    "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
                            color: p.stockProducto > 20 ? "#065F46" :
                                   p.stockProducto > 10 ? "#92400E" : "#991B1B",
                            padding: "10px 16px",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "800",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                          }}>
                            <span>📦</span>
                            <span>{p.stockProducto} unidades</span>
                          </div>
                        </td>
                        
                        {/* Categoría */}
                        <td style={{ 
                          padding: "20px",
                          verticalAlign: "top"
                        }}>
                          <div style={{
                            background: "rgba(139, 92, 246, 0.1)",
                            color: "#7C3AED",
                            padding: "10px 16px",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "700",
                            display: "inline-block"
                          }}>
                            {p.nombreCategoria || "—"}
                          </div>
                        </td>
                        
                        {/* Subcategoría */}
                        <td style={{ 
                          padding: "20px",
                          verticalAlign: "top"
                        }}>
                          <div style={{
                            background: "rgba(255, 107, 53, 0.1)",
                            color: "#FF6B35",
                            padding: "10px 16px",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "600",
                            display: "inline-block"
                          }}>
                            {p.nombreSubcategoria || "—"}
                          </div>
                        </td>
                        
                        {/* Acciones */}
                        <td style={{ 
                          padding: "20px",
                          textAlign: "center",
                          verticalAlign: "top"
                        }}>
                          <div style={{ 
                            display: "flex", 
                            gap: "12px",
                            justifyContent: "center"
                          }}>
                            {/* Botón Editar */}
                            <button 
                              onClick={() => window.location.href = `/vendedor/editar-producto/${p.idProducto}`}
                              style={{ 
                                background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "13px",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                minWidth: "100px",
                                justifyContent: "center",
                                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-3px)";
                                e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.4)";
                                e.target.style.background = "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
                                e.target.style.background = "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)";
                              }}
                            >
                              <span style={{ fontSize: "16px" }}>✏️</span>
                              Editar
                            </button>

                            {/* Botón Eliminar */}
                            <button 
                              onClick={() => eliminarProducto(p.idProducto, p.nombreProducto)}
                              style={{ 
                                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "13px",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                minWidth: "100px",
                                justifyContent: "center",
                                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-3px)";
                                e.target.style.boxShadow = "0 8px 25px rgba(239, 68, 68, 0.4)";
                                e.target.style.background = "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.3)";
                                e.target.style.background = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
                              }}
                            >
                              <span style={{ fontSize: "16px" }}>🗑️</span>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer de estadísticas */}
              <div style={{
                padding: "24px",
                background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
                borderRadius: "16px",
                borderTop: "2px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{ 
                      color: productosFiltrados.length < productos.length ? "#FF6B35" : "#10B981",
                      fontSize: "16px"
                    }}>
                      {productosFiltrados.length < productos.length ? "🔍" : "✅"}
                    </span>
                    <div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        Mostrando
                      </div>
                      <div>
                        <strong style={{ color: "#2C3E50", fontSize: "15px" }}>
                          {productosFiltrados.length}
                        </strong> de {productos.length} productos
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#64748B",
                    fontSize: "14px"
                  }}>
                    <span>🔄</span>
                    <span>Última actualización: <strong>Ahora</strong></span>
                  </div>
                </div>
                
                <div style={{
                  textAlign: "right"
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: "600",
                    marginBottom: "4px"
                  }}>
                    VALOR TOTAL DEL INVENTARIO
                  </div>
                  <div style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#10B981",
                    background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    ${productosFiltrados.reduce((sum, p) => sum + ((p.precioProducto || 0) * (p.stockProducto || 0)), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        /* Estilos para el scroll */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Responsive */
        @media (max-width: 1100px) {
          .grid-container {
            grid-templateColumns: repeat(auto-fill, minmax(250px, 1fr)) !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
        }
        
        @media (max-width: 768px) {
          .main-container {
            padding: 20px 16px !important;
          }
          
          h1 {
            font-size: 32px !important;
          }
          
          .table-header {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: flex-start !important;
          }
          
          .table-footer {
            flex-direction: column !important;
            gap: 16px !important;
            text-align: center !important;
          }
          
          .filters-grid {
            grid-template-columns: 1fr !important;
          }
          
          .price-range {
            flex-direction: column !important;
            gap: 10px !important;
          }
        }
        
        @media (max-width: 480px) {
          .buttons-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        button, input, select {
          font-family: 'Inter', sans-serif;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
        }
        
        p, span, div {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}