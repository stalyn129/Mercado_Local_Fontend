import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function ExplorarProductos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // ==================== STATES ====================
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");

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
    const cumpleBusqueda = p.nombreProducto.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleCategoria = filtroCategoria ? p.idCategoria === parseInt(filtroCategoria) : true;
    const cumpleSubcategoria = filtroSubcategoria ? p.idSubcategoria === parseInt(filtroSubcategoria) : true;
    return cumpleBusqueda && cumpleCategoria && cumpleSubcategoria;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit",
      paddingBottom: "80px"
    }}>
      
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
            Explorar Productos
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
            Descubre nuestros mejores productos orgánicos y sustentables
          </p>
        </div>
      </div>

      {/* FILTROS SECTION */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px",
        marginBottom: "40px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px 32px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          
          {/* Icono de filtro */}
          <span style={{ fontSize: "20px", color: "#5A8F48", fontWeight: "700" }}>🔍</span>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "2px solid #ECF2E3",
              fontSize: "15px",
              color: "#2D3E2B",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5A8F48";
              e.target.style.boxShadow = "0 0 0 3px rgba(90, 143, 72, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ECF2E3";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Categorías */}
          <select
            onChange={(e) => {
              setFiltroCategoria(e.target.value);
              setFiltroSubcategoria("");
            }}
            value={filtroCategoria}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              border: "2px solid #ECF2E3",
              fontSize: "15px",
              color: "#2D3E2B",
              fontWeight: "600",
              cursor: "pointer",
              minWidth: "200px",
              transition: "all 0.3s ease",
              background: "white",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5A8F48";
              e.target.style.boxShadow = "0 0 0 3px rgba(90, 143, 72, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ECF2E3";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">🌿 Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.idCategoria} value={c.idCategoria}>
                {c.nombreCategoria}
              </option>
            ))}
          </select>

          {/* Subcategorías */}
          <select
            onChange={(e) => setFiltroSubcategoria(e.target.value)}
            value={filtroSubcategoria}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              border: "2px solid #ECF2E3",
              fontSize: "15px",
              color: "#2D3E2B",
              fontWeight: "600",
              cursor: "pointer",
              minWidth: "200px",
              transition: "all 0.3s ease",
              background: "white",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#5A8F48";
              e.target.style.boxShadow = "0 0 0 3px rgba(90, 143, 72, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ECF2E3";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">🍃 Todas las subcategorías</option>
            {subcategorias
              .filter(s => !filtroCategoria || s.idCategoria === parseInt(filtroCategoria))
              .map(s => (
                <option key={s.idSubcategoria} value={s.idSubcategoria}>
                  {s.nombreSubcategoria}
                </option>
              ))}
          </select>

          {/* Botón limpiar filtros */}
          {(busqueda || filtroCategoria || filtroSubcategoria) && (
            <button
              onClick={() => {
                setBusqueda("");
                setFiltroCategoria("");
                setFiltroSubcategoria("");
              }}
              style={{
                padding: "12px 20px",
                background: "#FFF0F2",
                color: "#DA3E52",
                border: "2px solid #DA3E52",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#DA3E52";
                e.target.style.color = "white";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(218, 62, 82, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#FFF0F2";
                e.target.style.color = "#DA3E52";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 20px"
      }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px"
          }}>
            <div style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "5px solid #ECF2E3",
              borderTop: "5px solid #5A8F48",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{
              marginTop: "20px",
              fontSize: "16px",
              color: "#6B7F69",
              fontWeight: "600"
            }}>
              Cargando productos...
            </p>
          </div>
        ) : productosFiltrados.length > 0 ? (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "25px",
              marginBottom: "40px"
            }}>
              {productosFiltrados.map(p => (
                <div
                  key={p.idProducto}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(90, 143, 72, 0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
                  }}
                >
                  {/* Imagen del producto */}
                  <div style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "200px",
                    background: "#F9FBF7"
                  }}>
                    <img
                      src={p.imagenProducto}
                      alt={p.nombreProducto}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    />
                  </div>

                  {/* Info del producto */}
                  <div style={{
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    flex: "1"
                  }}>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      marginBottom: "6px",
                      lineHeight: "1.3"
                    }}>
                      {p.nombreProducto}
                    </h3>

                    <p style={{
                      color: "#6B7F69",
                      fontSize: "13px",
                      marginBottom: "12px",
                      fontWeight: "500"
                    }}>
                      {p.nombreSubcategoria || "Sin categoría"}
                    </p>

                    {/* Precio y botón */}
                    <div style={{
                      marginTop: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <div style={{
                        fontSize: "24px",
                        fontWeight: "800",
                        color: "#5A8F48"
                      }}>
                        ${p.precioProducto}
                      </div>

                      <button
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontSize: "14px",
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
                        🛒 Agregar al carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info de resultados */}
            <div style={{
              textAlign: "center",
              padding: "24px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(90, 143, 72, 0.08)"
            }}>
              <p style={{
                color: "#6B7F69",
                fontSize: "15px",
                fontWeight: "600",
                margin: "0"
              }}>
                Mostrando <strong style={{ color: "#5A8F48", fontSize: "16px" }}>
                  {productosFiltrados.length}
                </strong> productos de <strong style={{ color: "#5A8F48", fontSize: "16px" }}>
                  {productos.length}
                </strong> disponibles
              </p>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌱</div>
            <p style={{
              color: "#2D3E2B",
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 8px 0"
            }}>
              No hay productos disponibles
            </p>
            <p style={{
              color: "#9AAA98",
              fontSize: "15px",
              margin: "0"
            }}>
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}