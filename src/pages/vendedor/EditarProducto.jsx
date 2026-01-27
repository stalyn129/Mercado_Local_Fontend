import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [screenSize, setScreenSize] = useState("desktop");
  const [circlePositions, setCirclePositions] = useState([]);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const vendedor = JSON.parse(localStorage.getItem("user"));

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.08)",
        "rgba(52, 211, 153, 0.08)",
        "rgba(59, 130, 246, 0.08)",
        "rgba(168, 85, 247, 0.08)",
        "rgba(239, 68, 68, 0.08)",
        "rgba(245, 158, 11, 0.08)",
        "rgba(14, 165, 233, 0.08)",
        "rgba(236, 72, 153, 0.08)"
      ];
      
      for (let i = 0; i < 8; i++) {
        circles.push({
          id: i,
          size: Math.random() * 60 + 30,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 20 + 25 + "s",
          blur: Math.random() * 2 + 1 + "px",
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

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setScreenSize("mobile");
      else if (window.innerWidth < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      
      const productoNormalizado = {
        ...data,
        subcategoria: typeof data.subcategoria === 'object' && data.subcategoria !== null
          ? data.subcategoria
          : { idSubcategoria: data.idSubcategoria },
        idCategoria: data.subcategoria?.idCategoria || data.idCategoria,
        unidad: data.unidad || "kg"
      };
      
      setProducto(productoNormalizado);
      
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

  const actualizarProducto = async () => {
    // Validación de campos obligatorios
    if (!producto.nombreProducto || producto.nombreProducto.trim().length === 0) {
      alert("⚠️ Por favor ingresa el nombre del producto");
      return;
    }

    if (producto.nombreProducto.length < 3) {
      alert("⚠️ El nombre del producto debe tener al menos 3 caracteres");
      return;
    }

    if (producto.nombreProducto.length > 100) {
      alert("⚠️ El nombre del producto no puede exceder 100 caracteres");
      return;
    }

    if (producto.descripcionProducto && producto.descripcionProducto.length > 1000) {
      alert("⚠️ La descripción no puede exceder 1000 caracteres");
      return;
    }

    if (!producto.precioProducto || parseFloat(producto.precioProducto) <= 0) {
      alert("⚠️ Por favor ingresa un precio válido mayor a 0");
      return;
    }

    if (parseFloat(producto.precioProducto) > 999999.99) {
      alert("⚠️ El precio no puede exceder $999,999.99");
      return;
    }

    if (!producto.stockProducto || parseInt(producto.stockProducto) < 0) {
      alert("⚠️ Por favor ingresa un stock válido (mínimo 0)");
      return;
    }

    if (parseInt(producto.stockProducto) > 999999) {
      alert("⚠️ El stock no puede exceder 999,999 unidades");
      return;
    }

    if (!producto.idCategoria) {
      alert("⚠️ Por favor selecciona una categoría");
      return;
    }

    if (!producto.subcategoria?.idSubcategoria) {
      alert("⚠️ Por favor selecciona una subcategoría");
      return;
    }

    // Validar imagen si se seleccionó una nueva
    if (selectedImage) {
      // Validar tamaño de imagen (máximo 5MB)
      if (selectedImage.size > 5 * 1024 * 1024) {
        alert("⚠️ La imagen no puede exceder 5MB");
        return;
      }

      // Validar tipo de imagen
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(selectedImage.type)) {
        alert("⚠️ Solo se permiten imágenes en formato JPG, PNG o WEBP");
        return;
      }
    }

    const formData = new FormData();
    formData.append("nombreProducto", producto.nombreProducto);
    formData.append("descripcionProducto", producto.descripcionProducto);
    formData.append("precioProducto", producto.precioProducto);
    formData.append("stockProducto", producto.stockProducto);
    formData.append("unidad", producto.unidad);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (cargando || !producto) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        gap: "20px"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "5px solid rgba(255, 255, 255, 0.3)",
          borderTop: "5px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <div style={{
          color: "white",
          fontSize: "18px",
          fontWeight: "600"
        }}>
          Cargando producto...
        </div>
      </div>
    );
  }

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
            zIndex: 0,
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
        
        {/* Header */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "50px 40px",
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
              Actualizar Producto
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
              Editar Producto
            </h1>
            
            <p style={{
              color: "#8B5CF6",
              fontSize: "16px",
              margin: "0 auto",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontWeight: "400",
              opacity: 0.8,
              fontFamily: "'Inter', sans-serif"
            }}>
              Actualiza la información de tu producto
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "30px"
        }}>
          
          {/* GRID DE 2 COLUMNAS: IMAGEN + FORMULARIO */}
          <div style={{
            display: "grid",
            gridTemplateColumns: screenSize === "mobile" ? "1fr" : "0.9fr 1.5fr",
            gap: "30px"
          }}>
            
            {/* COLUMNA IZQUIERDA: IMAGEN */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                height: "100%"
              }}>
                <div
                  style={{
                    width: "100%",
                    flex: "1",
                    background: "linear-gradient(135deg, #f0f5f9 0%, #e8f0f5 100%)",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    border: (selectedImage || producto.imagenProducto) ? "none" : "3px dashed #FF6B35",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    minHeight: "400px"
                  }}
                  onClick={triggerFileInput}
                >
                  {selectedImage || producto.imagenProducto ? (
                    <img 
                      src={selectedImage ? URL.createObjectURL(selectedImage) : producto.imagenProducto}
                      alt={producto.nombreProducto}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "15px",
                      color: "#FF6B35",
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      padding: "20px"
                    }}>
                      <div style={{ 
                        fontSize: "48px",
                        animation: "float 3s ease-in-out infinite" 
                      }}>
                        📸
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "4px"
                        }}>
                          Sube una imagen
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "#94a3b8",
                          fontWeight: "500"
                        }}>
                          Haz clic o arrastra
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  style={{ display: "none" }}
                />
                
                <button
                  type="button"
                  onClick={triggerFileInput}
                  style={{
                    background: "white",
                    color: "#FF6B35",
                    border: "2px solid #FF6B35",
                    borderRadius: "14px",
                    padding: "16px 24px",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.2)";
                    e.target.style.background = "#FF6B35";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                    e.target.style.background = "white";
                    e.target.style.color = "#FF6B35";
                  }}
                >
                  {selectedImage || producto.imagenProducto ? "🔄 Cambiar Imagen" : "📤 Seleccionar Imagen"}
                </button>

                {selectedImage && (
                  <p style={{
                    fontSize: "13px",
                    color: "#10B981",
                    fontWeight: "600",
                    textAlign: "center",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    ✓ Nueva imagen seleccionada
                  </p>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: TODO EL FORMULARIO */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px"
            }}>

            {/* INFORMACIÓN DEL PRODUCTO */}
            <div style={{
              background: "#fafbfd",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px"
              }}>
                <div style={{
                  fontSize: "24px",
                  color: "#FF6B35"
                }}>
                  ℹ️
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    margin: "0 0 4px 0",
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                  }}>
                    Información del Producto
                  </h3>
                  <p style={{
                    color: "#64748b",
                    fontSize: "14px",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Detalles básicos del producto
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Nombre */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={producto.nombreProducto || ""} 
                    onChange={(e) => setProducto({...producto, nombreProducto: e.target.value})}
                    placeholder="Ej: Queso fresco artesanal"
                    maxLength={100}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none"
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

                {/* Descripción */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Descripción
                  </label>
                  <textarea
                    value={producto.descripcionProducto || ""} 
                    onChange={(e) => setProducto({...producto, descripcionProducto: e.target.value})}
                    placeholder="Describe las características, origen, ingredientes, etc..."
                    maxLength={1000}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none",
                      minHeight: "100px",
                      resize: "vertical"
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
                    fontSize: "12px",
                    color: (producto.descripcionProducto?.length || 0) > 900 ? "#EF4444" : "#94a3b8",
                    textAlign: "right",
                    marginTop: "4px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {producto.descripcionProducto?.length || 0}/1000 caracteres
                  </div>
                </div>

                {/* Categoría y Subcategoría */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: screenSize === "mobile" ? "1fr" : "1fr 1fr",
                  gap: "20px"
                }}>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Categoría
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
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "2px solid #e5e7eb",
                        fontSize: "15px",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s ease",
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer"
                      }}
                    >
                      <option value="">Seleccione una categoría</option>
                      {categorias.map(c => (
                        <option key={c.idCategoria} value={c.idCategoria}>
                          {c.nombreCategoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#2C3E50",
                      marginBottom: "8px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Subcategoría
                    </label>
                    <select
                      value={producto.subcategoria?.idSubcategoria || ""}
                      onChange={(e) => setProducto({
                        ...producto, 
                        subcategoria: { idSubcategoria: parseInt(e.target.value) }
                      })}
                      disabled={!producto.idCategoria}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "2px solid #e5e7eb",
                        fontSize: "15px",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s ease",
                        outline: "none",
                        backgroundColor: !producto.idCategoria ? "#f8f9fa" : "white",
                        cursor: producto.idCategoria ? "pointer" : "not-allowed",
                        opacity: producto.idCategoria ? 1 : 0.7
                      }}
                    >
                      <option value="">
                        {!producto.idCategoria ? "Seleccione categoría primero" : "Seleccione subcategoría"}
                      </option>
                      {subcategorias.map(s => (
                        <option key={s.idSubcategoria} value={s.idSubcategoria}>
                          {s.nombreSubcategoria}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* PRECIO Y DISPONIBILIDAD */}
            <div style={{
              background: "#fafbfd",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s ease"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px"
              }}>
                <div style={{
                  fontSize: "24px",
                  color: "#FF8E53"
                }}>
                  💰
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    margin: "0 0 4px 0",
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                  }}>
                    Precio y Disponibilidad
                  </h3>
                  <p style={{
                    color: "#64748b",
                    fontSize: "14px",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Detalles de precio, stock y unidad
                  </p>
                </div>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: screenSize === "mobile" ? "1fr" : 
                                 screenSize === "tablet" ? "1fr 1fr" : "1.2fr 1fr 0.9fr",
                gap: "20px"
              }}>
                {/* Precio */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Precio
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontWeight: "700",
                      color: "#FF6B35",
                      fontSize: "16px"
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={producto.precioProducto || ""} 
                      onChange={(e) => setProducto({...producto, precioProducto: e.target.value})}
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "14px 16px 14px 36px",
                        borderRadius: "12px",
                        border: "2px solid #e5e7eb",
                        fontSize: "15px",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s ease",
                        outline: "none"
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
                </div>

                {/* Stock */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Stock
                  </label>
                  <input
                    type="number"
                    value={producto.stockProducto || ""} 
                    onChange={(e) => setProducto({...producto, stockProducto: e.target.value})}
                    placeholder="100"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none"
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

                {/* Unidad */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2C3E50",
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Unidad
                  </label>
                  <select
                    value={producto.unidad || "kg"}
                    onChange={(e) => setProducto({...producto, unidad: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none",
                      backgroundColor: "white",
                      cursor: "pointer"
                    }}
                  >
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="lb">Libra (lb)</option>
                    <option value="unidad">Unidad</option>
                    <option value="litro">Litro</option>
                  </select>
                </div>
              </div>
            </div>
            
            </div> {/* Cierre de columna derecha */}
          </div> {/* Cierre del grid de 2 columnas */}

          {/* Botones de Acción */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "40px",
            paddingTop: "30px",
            borderTop: "1px solid #f1f5f9"
          }}>
            <button
              type="button"
              onClick={() => navigate("/vendedor/gestionar-productos")}
              style={{
                background: "white",
                color: "#64748b",
                border: "2px solid #e5e7eb",
                borderRadius: "14px",
                padding: "16px 36px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.borderColor = "#94a3b8";
                e.target.style.color = "#475569";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.color = "#64748b";
              }}
            >
              ← Cancelar
            </button>
            
            <button
              type="button"
              onClick={actualizarProducto}
              style={{
                background: "#FF6B35",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "16px 48px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.4)";
                e.target.style.background = "#FF8E53";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.3)";
                e.target.style.background = "#FF6B35";
              }}
            >
              💾 Guardar Cambios
            </button>
          </div>
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
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}