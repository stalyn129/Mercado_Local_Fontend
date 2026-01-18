import { useEffect, useState } from "react";
import Footer from "../../components/Footer.jsx";

export default function GestionarProductos() {
  const API_URL = "http://localhost:8080";

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      console.error("❌ Error al cargar productos:", e);
    } finally {
      setLoading(false);
    }
  };

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
        setProductos(prev => prev.filter(p => p.idProducto !== idProducto));
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
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      {/* Contenedor Principal */}
      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px"
      }}>
        
        {/* Header Section Mejorado */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
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
              🧺
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
              Gestión de Productos
            </h1>

            {/* Subtítulo */}
            <p style={{ 
              color: "#6B7F69", 
              fontSize: "16px",
              margin: "0 0 32px 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6"
            }}>
              Administra tu inventario de productos orgánicos de forma simple y eficiente
            </p>

            {/* Botón Agregar Producto */}
            <button
              style={{
                background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                color: "white",
                padding: "16px 40px",
                fontWeight: "700",
                borderRadius: "14px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 6px 20px rgba(90, 143, 72, 0.35)",
                transition: "all 0.3s ease",
                marginTop: "8px"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 8px 24px rgba(90, 143, 72, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.35)";
              }}
              onClick={() => window.location.href = "/vendedor/agregar-producto"}
            >
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>+</span>
              Agregar Nuevo Producto
            </button>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              minWidth: "1000px"
            }}>
              <thead>
                <tr style={{ 
                  background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                  fontWeight: "700",
                  color: "#2D3E2B"
                }}>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Imagen</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Producto</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Precio</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stock</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Categoría</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Subcategoría</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ 
                      textAlign: "center", 
                      padding: "80px 20px",
                      color: "#6B7F69",
                      fontSize: "15px"
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
                      <p style={{ marginTop: "20px", marginBottom: 0, fontWeight: "600" }}>Cargando productos...</p>
                    </td>
                  </tr>
                ) : productos.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ 
                      textAlign: "center", 
                      padding: "80px 20px" 
                    }}>
                      <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌿</div>
                      <p style={{ 
                        color: "#2D3E2B", 
                        fontSize: "18px",
                        fontWeight: "600",
                        margin: 0
                      }}>
                        No hay productos registrados
                      </p>
                      <p style={{ 
                        color: "#9AAA98", 
                        fontSize: "15px",
                        marginTop: "8px"
                      }}>
                        Comienza agregando tu primer producto orgánico
                      </p>
                    </td>
                  </tr>
                ) : (
                  productos.map((p) => (
                    <tr key={p.idProducto} style={{ 
                      borderBottom: "1px solid #F0F4ED",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#FAFCF8"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      <td style={{ padding: "16px" }}>
                        <img 
                          src={p.imagenProducto} 
                          alt={p.nombreProducto}
                          style={{ 
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            border: "2px solid #ECF2E3"
                          }} 
                        />
                      </td>
                      <td style={{ 
                        padding: "16px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                        fontSize: "14px"
                      }}>
                        {p.nombreProducto}
                      </td>
                      <td style={{ 
                        padding: "16px",
                        fontWeight: "700",
                        color: "#5A8F48",
                        fontSize: "16px"
                      }}>
                        ${p.precioProducto}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          background: p.stockProducto > 10 ? "#E8F5E3" : "#FFF3E0",
                          color: p.stockProducto > 10 ? "#5A8F48" : "#F5C744",
                          padding: "8px 16px",
                          borderRadius: "24px",
                          fontSize: "13px",
                          fontWeight: "700",
                          display: "inline-block"
                        }}>
                          {p.stockProducto} unidades
                        </span>
                      </td>
                      
                      {/* 🔥 NUEVA COLUMNA: CATEGORÍA */}
                      <td style={{ 
                        padding: "16px",
                        color: "#2D3E2B",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}>
                        {p.nombreCategoria || "—"}
                      </td>
                      
                      {/* 🔥 NUEVA COLUMNA: SUBCATEGORÍA */}
                      <td style={{ 
                        padding: "16px",
                        color: "#6B7F69",
                        fontSize: "14px",
                        fontWeight: "500"
                      }}>
                        {p.nombreSubcategoria || "—"}
                      </td>
                      
                      <td style={{ 
                        padding: "16px",
                        textAlign: "center"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          gap: "10px",
                          justifyContent: "center"
                        }}>
                          <button 
                            onClick={() => window.location.href = `/vendedor/editar-producto/${p.idProducto}`}
                            style={{ 
                              background: "#FFF9E6",
                              color: "#F5C744",
                              border: "2px solid #F5C744",
                              padding: "10px 18px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontWeight: "700",
                              fontSize: "13px",
                              transition: "all 0.3s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#F5C744";
                              e.target.style.color = "white";
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(245, 199, 68, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "#FFF9E6";
                              e.target.style.color = "#F5C744";
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "none";
                            }}
                          >
                            ✏️ Editar
                          </button>

                          <button 
                            onClick={() => eliminarProducto(p.idProducto, p.nombreProducto)}
                            style={{ 
                            background: "#FFF0F2",
                            color: "#DA3E52",
                            border: "2px solid #DA3E52",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "13px",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
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
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación/Info */}
          {productos.length > 0 && (
            <div style={{
              padding: "24px 28px",
              background: "#FAFCF8",
              borderTop: "2px solid #ECF2E3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              color: "#6B7F69",
              fontWeight: "500"
            }}>
              <span>
                Mostrando <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{productos.length}</strong> productos
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#5A8F48" }}>
                📊 Total en inventario
              </span>
            </div>
          )}
        </div>
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