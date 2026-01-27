import { useState, useEffect, useRef } from "react";
import Footer from "../../components/Footer.jsx";

export default function AgregarProducto() {
  const fileInputRef = useRef(null);
  const API_URL = "http://localhost:8080";

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [screenSize, setScreenSize] = useState("desktop");
  const [precioIA, setPrecioIA] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [circlePositions, setCirclePositions] = useState([]);
  const [iaPulsing, setIaPulsing] = useState(false);

  const [form, setForm] = useState({
    nombreProducto: "",
    descripcionProducto: "",
    precioProducto: "",
    stockProducto: "",
    unidad: "kg",
    estadoProducto: "Disponible",
    idCategoria: "",
    idSubcategoria: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");

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

  // Efecto de pulso para la sección de IA
  useEffect(() => {
    if (precioIA) {
      setIaPulsing(true);
      const timer = setTimeout(() => setIaPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [precioIA]);

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
    if (!user || user.rol !== "VENDEDOR") {
      alert("❌ Debes iniciar sesión como vendedor");
      window.location.href = "/login";
      return;
    }

    const cargarCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/categorias/listar`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setCategorias(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("❌ Error cargando categorías:", err);
        setCategorias([]);
      }
    };
    cargarCategorias();
  }, []);

  useEffect(() => {
    if (!form.idCategoria) {
      setSubcategorias([]);
      return;
    }

    const cargarSubcategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/subcategorias/categoria/${form.idCategoria}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setSubcategorias(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error cargando subcategorías:", err);
        setSubcategorias([]);
      }
    };
    cargarSubcategorias();
  }, [form.idCategoria]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    // Validación de campos obligatorios
    if (!form.nombreProducto || form.nombreProducto.trim().length === 0) {
      alert("⚠️ Por favor ingresa el nombre del producto");
      return;
    }

    if (form.nombreProducto.length < 3) {
      alert("⚠️ El nombre del producto debe tener al menos 3 caracteres");
      return;
    }

    if (form.nombreProducto.length > 100) {
      alert("⚠️ El nombre del producto no puede exceder 100 caracteres");
      return;
    }

    if (form.descripcionProducto && form.descripcionProducto.length > 1000) {
      alert("⚠️ La descripción no puede exceder 1000 caracteres");
      return;
    }

    if (!form.precioProducto || parseFloat(form.precioProducto) <= 0) {
      alert("⚠️ Por favor ingresa un precio válido mayor a 0");
      return;
    }

    if (parseFloat(form.precioProducto) > 999999.99) {
      alert("⚠️ El precio no puede exceder $999,999.99");
      return;
    }

    if (!form.stockProducto || parseInt(form.stockProducto) < 0) {
      alert("⚠️ Por favor ingresa un stock válido (mínimo 0)");
      return;
    }

    if (parseInt(form.stockProducto) > 999999) {
      alert("⚠️ El stock no puede exceder 999,999 unidades");
      return;
    }

    if (!form.idCategoria) {
      alert("⚠️ Por favor selecciona una categoría");
      return;
    }

    if (!form.idSubcategoria) {
      alert("⚠️ Por favor selecciona una subcategoría");
      return;
    }

    if (!selectedImageFile) {
      alert("⚠️ Por favor selecciona una imagen del producto");
      return;
    }

    // Validar tamaño de imagen (máximo 5MB)
    if (selectedImageFile.size > 5 * 1024 * 1024) {
      alert("⚠️ La imagen no puede exceder 5MB");
      return;
    }

    // Validar tipo de imagen
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedImageFile.type)) {
      alert("⚠️ Solo se permiten imágenes en formato JPG, PNG o WEBP");
      return;
    }

    if (!user || (!user.id && !user.idUsuario && !user.idVendedor)) {
      alert("❌ Error: No se pudo identificar el usuario. Por favor, inicie sesión nuevamente.");
      return;
    }

    setLoading(true);

    try {
      // PASO 1: Subir la imagen
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      const uploadResponse = await fetch(`${API_URL}/uploads/producto`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Error al subir imagen: ${errorText}`);
      }

      const imageUrl = await uploadResponse.text();

      // PASO 2: Crear el producto
      const body = {
        idUsuario: user.idUsuario || user.idVendedor || user.id,
        idVendedor: user.idVendedor || user.idUsuario || user.id,
        idSubcategoria: parseInt(form.idSubcategoria),
        nombreProducto: form.nombreProducto,
        descripcionProducto: form.descripcionProducto,
        precioProducto: parseFloat(form.precioProducto),
        stockProducto: parseInt(form.stockProducto),
        unidad: form.unidad,
        imagenProducto: imageUrl
      };

      const response = await fetch(`${API_URL}/productos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        alert("✅ Producto creado correctamente");

        setForm({
          nombreProducto: "",
          descripcionProducto: "",
          precioProducto: "",
          stockProducto: "",
          unidad: "kg",
          estadoProducto: "Disponible",
          idCategoria: "",
          idSubcategoria: ""
        });
        setImagePreview(null);
        setSelectedImageFile(null);
        setPrecioIA(null);
      } else {
        const error = await response.text();
        alert(`❌ Error al crear producto: ${error}`);
      }
    } catch (error) {
      console.error("❌ Error en la petición:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const analizarPrecio = async () => {
    if (!form.nombreProducto || form.nombreProducto.length < 3) return;

    setAnalizando(true);
    try {
      const res = await fetch(`${API_URL}/api/ia/precio/recomendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombreProducto,
          precio: parseFloat(form.precioProducto) || 0 
        })
      });

      const data = await res.json();
      setPrecioIA(data);
    } catch (err) {
      console.error("❌ Error recomendador IA:", err);
    } finally {
      setAnalizando(false);
    }
  };

  useEffect(() => {
    if (form.nombreProducto.trim().length > 3) {
      const timer = setTimeout(() => {
        analizarPrecio();
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setPrecioIA(null);
    }
  }, [form.nombreProducto, form.precioProducto]);

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
              Nuevo Producto
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
              Agregar Producto
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
              Completa el formulario para añadir un nuevo producto a tu catálogo
            </p>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
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
              Guardando producto...
            </div>
          </div>
        )}

        {/* Formulario Reorganizado - Layout de 2 Columnas */}
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
                  border: imagePreview ? "none" : "3px dashed #FF6B35",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  minHeight: "400px"
                }}
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
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
                onChange={handleImage}
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
                {imagePreview ? "🔄 Cambiar Imagen" : "📤 Seleccionar Imagen"}
              </button>
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
                  marginBottom: "8px"
                }}>
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  name="nombreProducto"
                  value={form.nombreProducto}
                  onChange={handleChange}
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
                  name="descripcionProducto"
                  value={form.descripcionProducto}
                  onChange={handleChange}
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
                  color: form.descripcionProducto.length > 900 ? "#EF4444" : "#94a3b8",
                  textAlign: "right",
                  marginTop: "4px",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {form.descripcionProducto.length}/1000 caracteres
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
                    marginBottom: "8px"
                  }}>
                    Categoría
                  </label>
                  <select
                    name="idCategoria"
                    value={form.idCategoria}
                    onChange={handleChange}
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
                      <option key={c.idCategoria || c.id} value={c.idCategoria || c.id}>
                        {c.nombreCategoria || c.nombre}
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
                    marginBottom: "8px"
                  }}>
                    Subcategoría
                  </label>
                  <select
                    name="idSubcategoria"
                    value={form.idSubcategoria}
                    onChange={handleChange}
                    disabled={!form.idCategoria}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none",
                      backgroundColor: !form.idCategoria ? "#f8f9fa" : "white",
                      cursor: form.idCategoria ? "pointer" : "not-allowed",
                      opacity: form.idCategoria ? 1 : 0.7
                    }}
                  >
                    <option value="">
                      {!form.idCategoria ? "Seleccione categoría primero" : "Seleccione subcategoría"}
                    </option>
                    {subcategorias.map(s => (
                      <option key={s.idSubcategoria || s.id} value={s.idSubcategoria || s.id}>
                        {s.nombreSubcategoria || s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CARTA 3: PRECIO Y DISPONIBILIDAD */}
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
                    name="precioProducto"
                    value={form.precioProducto}
                    onChange={handleChange}
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
                  name="stockProducto"
                  value={form.stockProducto}
                  onChange={handleChange}
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
                  marginBottom: "8px"
                }}>
                  Unidad
                </label>
                <select
                  name="unidad"
                  value={form.unidad}
                  onChange={handleChange}
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

          {/* INTELIGENCIA ARTIFICIAL - ANCHO COMPLETO DEBAJO */}
          {(analizando || precioIA) && (
            <div style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%)",
              padding: "40px",
              borderRadius: "24px",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              position: "relative",
              overflow: "hidden",
              animation: iaPulsing ? "pulseGlow 2s ease-in-out" : "fadeIn 0.5s ease",
              boxShadow: iaPulsing ? 
                "0 0 0 4px rgba(139, 92, 246, 0.2), 0 10px 30px rgba(139, 92, 246, 0.2)" : 
                "0 8px 25px rgba(139, 92, 246, 0.15)",
              minHeight: "500px"
            }}>
              {/* Círculos decorativos */}
              <div style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "100px",
                height: "100px",
                background: "rgba(139, 92, 246, 0.1)",
                borderRadius: "50%",
                animation: "rotateSlow 20s linear infinite"
              }}></div>
              
              <div style={{
                position: "absolute",
                bottom: "-20px",
                left: "-20px",
                width: "80px",
                height: "80px",
                background: "rgba(255, 107, 53, 0.1)",
                borderRadius: "50%",
                animation: "rotateSlow 15s linear infinite reverse"
              }}></div>
              
              {/* Contenido de IA */}
              <div style={{ position: "relative", zIndex: "2" }}>
                {/* Header con efecto especial */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      fontSize: "28px",
                      background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      boxShadow: "0 6px 15px rgba(139, 92, 246, 0.3)",
                      animation: "bounce 2s ease-in-out infinite"
                    }}>
                      🤖
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#2C3E50",
                        margin: "0 0 4px 0",
                        background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "'Playfair Display', 'Georgia', serif"
                      }}>
                        Asistente de Precios IA
                      </h4>
                      <p style={{
                        fontSize: "13px",
                        color: "#8B5CF6",
                        fontWeight: "600",
                        margin: "0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        <span style={{
                          width: "8px",
                          height: "8px",
                          background: "#8B5CF6",
                          borderRadius: "50%",
                          animation: "pulseDot 1.5s ease-in-out infinite"
                        }}></span>
                        Análisis en tiempo real del mercado
                      </p>
                    </div>
                  </div>
                  
                  {precioIA && (
                    <div style={{
                      background: "white",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "2px solid #8B5CF6",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span style={{ 
                        fontSize: "14px", 
                        fontWeight: "600", 
                        color: "#8B5CF6" 
                      }}>
                        🔥 Actualizado hace 2s
                      </span>
                    </div>
                  )}
                </div>

                {analizando ? (
                  <div style={{
                    textAlign: "center",
                    padding: "80px 20px"
                  }}>
                    <div style={{
                      position: "relative",
                      display: "inline-block",
                      marginBottom: "20px"
                    }}>
                      <div style={{
                        width: "80px",
                        height: "80px",
                        border: "4px solid rgba(139, 92, 246, 0.1)",
                        borderTop: "4px solid #8B5CF6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto"
                      }}></div>
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "32px",
                        color: "#8B5CF6"
                      }}>
                        🧠
                      </div>
                    </div>
                    <h5 style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#2C3E50",
                      margin: "0 0 10px 0"
                    }}>
                      Analizando mercado...
                    </h5>
                    <p style={{
                      fontSize: "16px",
                      color: "#64748b",
                      margin: "0"
                    }}>
                      Buscando productos similares y analizando precios
                    </p>
                  </div>
                ) : precioIA && (
                  <>
                    {/* Tarjetas principales */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: screenSize === "mobile" ? "1fr" : "1fr 1fr 1fr",
                      gap: "16px",
                      marginBottom: "24px"
                    }}>
                      {/* Precio Promedio */}
                      <div style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "20px",
                        border: "2px solid #E9D5FF",
                        textAlign: "center",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#8B5CF6",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "8px",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Precio Promedio
                        </div>
                        <div style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "#8B5CF6",
                          marginBottom: "8px",
                          fontFamily: "'Playfair Display', 'Georgia', serif"
                        }}>
                          ${precioIA.precio_promedio}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          fontWeight: "500",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Basado en {precioIA.productos_similares?.length || 0} productos similares
                        </div>
                      </div>

                      {/* Tu Precio */}
                      <div style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "20px",
                        border: "2px solid #FFEDD5",
                        textAlign: "center",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#FF6B35",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "8px",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Tu Precio
                        </div>
                        <div style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "#FF6B35",
                          marginBottom: "8px",
                          fontFamily: "'Playfair Display', 'Georgia', serif"
                        }}>
                          ${precioIA.precio_ingresado}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          fontWeight: "500",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Precio que estás ingresando
                        </div>
                      </div>

                      {/* Estado */}
                      <div style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "20px",
                        border: precioIA.estado === "adecuado" ? "2px solid #A7F3D0" :
                                precioIA.estado === "bajo" ? "2px solid #FEF3C7" : 
                                "2px solid #FECACA",
                        textAlign: "center",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: precioIA.estado === "adecuado" ? "#10B981" :
                                 precioIA.estado === "bajo" ? "#F59E0B" : 
                                 "#EF4444",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "8px",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Estado
                        </div>
                        <div style={{
                          fontSize: "20px",
                          fontWeight: "800",
                          color: precioIA.estado === "adecuado" ? "#10B981" :
                                 precioIA.estado === "bajo" ? "#F59E0B" : 
                                 "#EF4444",
                          marginBottom: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          fontFamily: "'Playfair Display', 'Georgia', serif"
                        }}>
                          {precioIA.estado === "adecuado" ? (
                            <>✅ Adecuado</>
                          ) : precioIA.estado === "bajo" ? (
                            <>⬇️ Por debajo</>
                          ) : (
                            <>⬆️ Por encima</>
                          )}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          fontWeight: "500",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          Comparado con el mercado
                        </div>
                      </div>
                    </div>

                    {/* Recomendación Destacada */}
                    <div style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      borderRadius: "16px",
                      padding: "24px",
                      marginBottom: "24px",
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)"
                    }}>
                      <div style={{
                        position: "absolute",
                        top: "-50px",
                        right: "-50px",
                        width: "150px",
                        height: "150px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%"
                      }}></div>
                      
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "16px"
                      }}>
                        <div style={{
                          fontSize: "32px",
                          background: "rgba(255, 255, 255, 0.2)",
                          width: "56px",
                          height: "56px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          💡
                        </div>
                        <div>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            opacity: 0.9,
                            marginBottom: "4px",
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            RECOMENDACIÓN DE INTELIGENCIA ARTIFICIAL
                          </div>
                          <div style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            fontFamily: "'Playfair Display', 'Georgia', serif"
                          }}>
                            Precio Sugerido
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: "48px",
                        fontWeight: "800",
                        textAlign: "center",
                        margin: "20px 0",
                        textShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        fontFamily: "'Playfair Display', 'Georgia', serif"
                      }}>
                        ${precioIA.recomendado}
                      </div>
                      
                      <div style={{
                        fontSize: "14px",
                        opacity: 0.9,
                        textAlign: "center",
                        maxWidth: "500px",
                        margin: "0 auto",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Este precio maximiza tus ventas manteniendo una buena rentabilidad
                      </div>
                    </div>

                    {/* Productos Similares */}
                    {precioIA.productos_similares && precioIA.productos_similares.length > 0 && (
                      <div style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "20px",
                        border: "1px solid #e5e7eb"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "16px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              fontSize: "20px",
                              color: "#8B5CF6"
                            }}>
                              📊
                            </div>
                            <h5 style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              color: "#2C3E50",
                              margin: "0",
                              fontFamily: "'Playfair Display', 'Georgia', serif"
                            }}>
                              Productos Similares ({precioIA.productos_similares.length})
                            </h5>
                          </div>
                          <span style={{
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: "600",
                            background: "#f1f5f9",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            Análisis del mercado
                          </span>
                        </div>
                        
                        <div style={{
                          maxHeight: "180px",
                          overflowY: "auto",
                          paddingRight: "8px",
                          scrollbarWidth: "thin",
                          scrollbarColor: "#8B5CF6 #f1f5f9"
                        }}>
                          {precioIA.productos_similares.map((p, i) => (
                            <div 
                              key={i} 
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 16px",
                                marginBottom: "8px",
                                background: i % 2 === 0 ? "#fafbfd" : "white",
                                borderRadius: "10px",
                                border: "1px solid #f1f5f9",
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateX(4px)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateX(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                              }}>
                                <div style={{
                                  width: "32px",
                                  height: "32px",
                                  background: "linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 100%)",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px"
                                }}>
                                  #{i + 1}
                                </div>
                                <div>
                                  <div style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#2C3E50",
                                    fontFamily: "'Inter', sans-serif"
                                  }}>
                                    {p.nombre.length > 40 ? p.nombre.substring(0, 40) + "..." : p.nombre}
                                  </div>
                                </div>
                              </div>
                              <div style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#FF6B35",
                                fontFamily: "'Playfair Display', 'Georgia', serif"
                              }}>
                                ${p.precio}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

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
              onClick={() => window.history.back()}
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
                gap: "10px"
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
              onClick={handleSubmit}
              disabled={loading}
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
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.4)";
                  e.target.style.background = "#FF8E53";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.3)";
                  e.target.style.background = "#FF6B35";
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "18px",
                    height: "18px",
                    border: "3px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "3px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }}></div>
                  Guardando...
                </>
              ) : (
                <>
                  💾 Guardar Producto
                </>
              )}
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
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0), 0 8px 25px rgba(139, 92, 246, 0.15);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.2), 0 12px 35px rgba(139, 92, 246, 0.25);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
          .form-grid-container {
            grid-template-columns: 1fr !important;
          }
          
          .image-section {
            position: static !important;
            max-height: 300px !important;
          }
          
          .ia-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 768px) {
          .main-container {
            padding: 20px 16px !important;
          }
          
          .header-section {
            padding: 30px 20px !important;
          }
          
          .form-section {
            padding: 20px !important;
          }
          
          .price-stock-grid {
            grid-template-columns: 1fr !important;
          }
          
          .ia-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .action-buttons {
            flex-direction: column !important;
          }
          
          .action-buttons button {
            width: 100% !important;
          }
        }
        
        @media (max-width: 640px) {
          .ia-cards-grid {
            grid-template-columns: 1fr !important;
          }
          
          .ia-main-grid {
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