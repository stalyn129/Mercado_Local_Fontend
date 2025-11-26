import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cargando, setCargando] = useState(true);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const vendedor = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token || vendedor?.rol !== "VENDEDOR") {
      navigate("/login");
      return;
    }
    cargarProducto();
    cargarCategorias();
  }, []);

  const cargarProducto = async () => {
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      console.log("🟡 Producto recibido:", data);
      
      // Normalizar estructura si viene con IDs simples
      const productoNormalizado = {
        ...data,
        subcategoria: typeof data.subcategoria === 'object' && data.subcategoria !== null
          ? data.subcategoria
          : { idSubcategoria: data.idSubcategoria },
        idCategoria: data.subcategoria?.idCategoria || data.idCategoria
      };
      
      setProducto(productoNormalizado);
      
      // Cargar subcategorías de la categoría actual
      if (productoNormalizado.idCategoria) {
        cargarSubcategoriasPorCategoria(productoNormalizado.idCategoria);
      }
      
      setCargando(false);
    } catch (error) {
      console.error("❌ Error al cargar producto:", error);
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias/listar`);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
    }
  };

  // 🔥 Cargar subcategorías filtradas por categoría
  const cargarSubcategoriasPorCategoria = async (idCategoria) => {
    try {
      const res = await fetch(`${API_URL}/subcategorias/categoria/${idCategoria}`);
      const data = await res.json();
      setSubcategorias(data);
    } catch (error) {
      console.error("❌ No se pudo cargar subcategorías por categoría", error);
      setSubcategorias([]);
    }
  };

  // 🔥 ACTUALIZACIÓN CON FORMDATA Y UPLOAD DE IMAGEN
  const actualizarProducto = async () => {
    const formData = new FormData();
    formData.append("nombreProducto", producto.nombreProducto);
    formData.append("descripcionProducto", producto.descripcionProducto);
    formData.append("precioProducto", producto.precioProducto);
    formData.append("stockProducto", producto.stockProducto);
    formData.append("idSubcategoria", producto.subcategoria.idSubcategoria);
    formData.append("idUsuario", vendedor.idUsuario);

    if (selectedImage) {
      formData.append("imagen", selectedImage);
    }

    try {
      const res = await fetch(`${API_URL}/productos/editar/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert("✔ Producto actualizado correctamente");
        navigate("/vendedor/gestionar-productos");
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        alert("❌ Error al actualizar producto");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  if (cargando || !producto) {
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            display: "inline-block",
            width: "60px",
            height: "60px",
            border: "6px solid #ECF2E3",
            borderTop: "6px solid #5A8F48",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ 
            marginTop: "24px", 
            color: "#6B7F69",
            fontSize: "16px",
            fontWeight: "600"
          }}>
            Cargando producto...
          </p>
        </div>
      </div>
    );
  }

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
        
        {/* Header Section */}
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
              ✏️
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
              Editar Producto
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
              Actualiza la información de tu producto orgánico
            </p>
          </div>
        </div>

        {/* Formulario Principal */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "48px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "48px",
            alignItems: "start"
          }}>
            
            {/* Sección de Imagen */}
            <div>
              <label style={{
                display: "block",
                fontSize: "15px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                📸 Imagen del Producto
              </label>
              
              <div style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                border: "3px solid #ECF2E3",
                marginBottom: "20px"
              }}>
                <img 
                  src={selectedImage ? URL.createObjectURL(selectedImage) : producto.imagenProducto}
                  alt={producto.nombreProducto}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    display: "block"
                  }} 
                />
              </div>

              <label 
                htmlFor="file-upload"
                style={{
                  display: "block",
                  background: "linear-gradient(135deg, #F5C744 0%, #E5B734 100%)",
                  color: "white",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(245, 199, 68, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(245, 199, 68, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(245, 199, 68, 0.3)";
                }}
              >
                📁 Cambiar Imagen
              </label>
              <input 
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{display: "none"}}
                onChange={(e)=>setSelectedImage(e.target.files[0])}
              />
              
              {selectedImage && (
                <p style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#5A8F48",
                  fontWeight: "600",
                  textAlign: "center"
                }}>
                  ✓ Nueva imagen seleccionada
                </p>
              )}
            </div>

            {/* Formulario de Datos */}
            <div>
              {/* Nombre del Producto */}
              <div style={{ marginBottom: "28px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  🏷️ Nombre del Producto
                </label>
                <input 
                  type="text"
                  value={producto.nombreProducto || ""} 
                  onChange={(e)=>setProducto({...producto, nombreProducto:e.target.value})}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "16px",
                    border: "2px solid #ECF2E3",
                    borderRadius: "12px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                  onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
                />
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: "28px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  📝 Descripción
                </label>
                <textarea 
                  value={producto.descripcionProducto || ""} 
                  onChange={(e)=>setProducto({...producto, descripcionProducto:e.target.value})}
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "15px",
                    border: "2px solid #ECF2E3",
                    borderRadius: "12px",
                    fontFamily: "inherit",
                    color: "#2D3E2B",
                    resize: "vertical",
                    transition: "all 0.3s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                  onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
                />
              </div>

              {/* Precio y Stock */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "28px"
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#2D3E2B",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    💰 Precio
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={producto.precioProducto || ""} 
                    onChange={(e)=>setProducto({...producto, precioProducto:e.target.value})}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      fontSize: "18px",
                      border: "2px solid #ECF2E3",
                      borderRadius: "12px",
                      fontWeight: "700",
                      color: "#5A8F48",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                    onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
                  />
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#2D3E2B",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    📦 Stock
                  </label>
                  <input 
                    type="number" 
                    value={producto.stockProducto || ""} 
                    onChange={(e)=>setProducto({...producto, stockProducto:e.target.value})}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      fontSize: "18px",
                      border: "2px solid #ECF2E3",
                      borderRadius: "12px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                    onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div style={{ marginBottom: "28px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  🗂️ Categoría
                </label>
                <select
                  value={producto.idCategoria || ""}
                  onChange={(e) => {
                    const idCategoria = parseInt(e.target.value);
                    
                    setProducto({
                      ...producto,
                      idCategoria: idCategoria,
                      subcategoria: { idSubcategoria: "" }
                    });

                    if (idCategoria) {
                      cargarSubcategoriasPorCategoria(idCategoria);
                    } else {
                      setSubcategorias([]);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "15px",
                    border: "2px solid #ECF2E3",
                    borderRadius: "12px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    outline: "none",
                    background: "white"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                  onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
                >
                  <option value="">-- Seleccione una categoría --</option>
                  {categorias.map(c => (
                    <option key={c.idCategoria} value={c.idCategoria}>
                      {c.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategoría */}
              <div style={{ marginBottom: "32px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  🏷️ Subcategoría
                </label>
                <select 
                  value={producto.subcategoria?.idSubcategoria || ""}
                  onChange={(e)=>setProducto({
                    ...producto, 
                    subcategoria: { idSubcategoria: parseInt(e.target.value) }
                  })}
                  disabled={!producto.idCategoria}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    fontSize: "15px",
                    border: "2px solid #ECF2E3",
                    borderRadius: "12px",
                    fontWeight: "600",
                    color: producto.idCategoria ? "#2D3E2B" : "#B0BEB0",
                    cursor: producto.idCategoria ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease",
                    outline: "none",
                    background: producto.idCategoria ? "white" : "#F8FAF6",
                    opacity: producto.idCategoria ? 1 : 0.6
                  }}
                  onFocus={(e) => producto.idCategoria && (e.target.style.borderColor = "#5A8F48")}
                  onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
                >
                  <option value="">
                    {producto.idCategoria 
                      ? "-- Seleccione una subcategoría --" 
                      : "-- Primero seleccione una categoría --"}
                  </option>
                  {subcategorias.map(s => (
                    <option key={s.idSubcategoria} value={s.idSubcategoria}>
                      {s.nombreSubcategoria}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones de Acción */}
              <div style={{
                display: "flex",
                gap: "16px",
                paddingTop: "24px",
                borderTop: "2px solid #F0F4ED"
              }}>
                <button
                  onClick={actualizarProducto}
                  style={{
                    flex: "1",
                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    color: "white",
                    padding: "18px 32px",
                    fontWeight: "700",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    boxShadow: "0 6px 20px rgba(90, 143, 72, 0.35)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px)";
                    e.target.style.boxShadow = "0 8px 24px rgba(90, 143, 72, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.35)";
                  }}
                >
                  💾 Guardar Cambios
                </button>

                <button
                  onClick={() => navigate("/vendedor/gestionar-productos")}
                  style={{
                    background: "#F0F4ED",
                    color: "#6B7F69",
                    padding: "18px 32px",
                    fontWeight: "700",
                    borderRadius: "14px",
                    border: "2px solid #DDE8D0",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#DDE8D0";
                    e.target.style.color = "#2D3E2B";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#F0F4ED";
                    e.target.style.color = "#6B7F69";
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
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