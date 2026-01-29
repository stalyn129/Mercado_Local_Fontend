import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  // ✅ CORREGIDO: Usar tu IP en lugar de localhost
  const API_URL = "http://192.168.1.13:8080";

  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [screenSize, setScreenSize] = useState("desktop");
  const [circlePositions, setCirclePositions] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("authToken");
  const vendedor = JSON.parse(localStorage.getItem("user"));

  // ✅ FUNCIÓN PARA CONSTRUIR URLS DE IMÁGENES
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://via.placeholder.com/150x150?text=Sin+Imagen';
    }
    
    // Si ya es una URL completa
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si es una ruta relativa (/uploads/productos/...)
    if (imagePath.startsWith('/uploads/')) {
      return `${API_URL}${imagePath}`;
    }
    
    // Si solo es un nombre de archivo
    if (imagePath && !imagePath.includes('/')) {
      return `${API_URL}/uploads/productos/${imagePath}`;
    }
    
    return 'https://via.placeholder.com/150x150?text=Error+Imagen';
  };

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

  // ==================== VALIDACIONES ====================
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "nombreProducto":
        if (!value || !value.trim()) {
          error = "El nombre del producto es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        } else if (value.trim().length > 100) {
          error = "El nombre no puede exceder los 100 caracteres";
        }
        break;
        
      case "descripcionProducto":
        if (value && value.trim().length > 500) {
          error = "La descripción no puede exceder los 500 caracteres";
        }
        break;
        
      case "precioProducto":
        if (!value) {
          error = "El precio es obligatorio";
        } else if (isNaN(parseFloat(value))) {
          error = "El precio debe ser un número válido";
        } else if (parseFloat(value) <= 0) {
          error = "El precio debe ser mayor a 0";
        } else if (parseFloat(value) > 999999) {
          error = "El precio no puede exceder $999,999";
        }
        break;
        
      case "stockProducto":
        if (!value) {
          error = "El stock es obligatorio";
        } else if (!/^\d+$/.test(value)) {
          error = "El stock debe ser un número entero";
        } else if (parseInt(value) < 0) {
          error = "El stock no puede ser negativo";
        } else if (parseInt(value) > 100000) {
          error = "El stock no puede exceder 100,000 unidades";
        }
        break;
        
      case "idCategoria":
        if (!value) {
          error = "Debe seleccionar una categoría";
        }
        break;
        
      case "idSubcategoria":
        if (!value) {
          error = "Debe seleccionar una subcategoría";
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    if (!producto) return false;
    
    const newErrors = {};
    
    // Validar cada campo
    Object.keys(producto).forEach(key => {
      if (key !== "estadoProducto" && key !== "imagenProducto") {
        const error = validateField(key, producto[key]);
        if (error) newErrors[key] = error;
      }
    });
    
    // Validar subcategoría
    if (!producto.subcategoria?.idSubcategoria) {
      newErrors.idSubcategoria = "Debe seleccionar una subcategoría";
    }
    
    // Validar imagen si se seleccionó una nueva
    if (selectedImage) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(selectedImage.type)) {
        newErrors.imagen = "Formato de imagen no válido. Use JPG, PNG o GIF";
      }
      
      if (selectedImage.size > 10 * 1024 * 1024) {
        newErrors.imagen = "La imagen no puede superar los 10MB";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const actualizarProducto = async () => {
    if (isSubmitting || !producto) return;
    
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(producto).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validar formulario
    if (!validateForm()) {
      const errorCount = Object.keys(errors).length;
      alert(`Hay ${errorCount} error(es) en el formulario. Por favor, corrígelos antes de continuar.`);
      
      // Hacer scroll al primer error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                       document.querySelector(`[data-field="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("nombreProducto", producto.nombreProducto.trim());
    formData.append("descripcionProducto", producto.descripcionProducto?.trim() || "");
    formData.append("precioProducto", producto.precioProducto);
    formData.append("stockProducto", producto.stockProducto);
    formData.append("unidad", producto.unidad);
    formData.append("idSubcategoria", producto.subcategoria.idSubcategoria);
    formData.append("idUsuario", vendedor.idUsuario || vendedor.idVendedor || vendedor.id);

    if (selectedImage) {
      formData.append("imagen", selectedImage);
    }

    try {
      console.log("📤 Enviando datos de actualización...");
      const res = await fetch(`${API_URL}/productos/editar/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        console.log("✅ Producto actualizado:", result);
        alert("✔ Producto actualizado correctamente");
        
        // Limpiar errores
        setErrors({});
        setTouched({});
        
        // Redirigir después de 1 segundo
        setTimeout(() => {
          window.location.href = "/vendedor/gestionar-productos";
        }, 1000);
      } else {
        const errorText = await res.text();
        console.error("❌ Error del servidor:", errorText);
        alert(`❌ Error al actualizar producto: ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setProducto(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marcar campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar campo individual
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar antes de establecer
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, imagen: "Formato de imagen no válido. Use JPG, PNG o GIF" }));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imagen: "La imagen no puede superar los 10MB" }));
      return;
    }

    setSelectedImage(file);
    setErrors(prev => ({ ...prev, imagen: "" }));
  };

  if (cargando || !producto) {
    return (
      <>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
            borderTopColor: "white",
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
      </>
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

        {/* Resumen de validación */}
        {Object.keys(errors).length > 0 && (
          <div style={{
            background: "#FEF2F2",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            border: "2px solid #FECACA",
            animation: "fadeIn 0.3s ease"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px"
            }}>
              <div style={{
                fontSize: "24px",
                color: "#EF4444"
              }}>
                ⚠️
              </div>
              <h4 style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#991B1B",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Hay {Object.keys(errors).length} error(es) en el formulario
              </h4>
            </div>
            
            <ul style={{
              margin: "0",
              paddingLeft: "20px",
              fontSize: "14px",
              color: "#7F1D1D"
            }}>
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} style={{ marginBottom: "4px", fontFamily: "'Inter', sans-serif" }}>
                  <strong>{field === 'imagen' ? 'Imagen' : 
                          field === 'nombreProducto' ? 'Nombre' :
                          field === 'descripcionProducto' ? 'Descripción' :
                          field === 'precioProducto' ? 'Precio' :
                          field === 'stockProducto' ? 'Stock' :
                          field === 'idCategoria' ? 'Categoría' :
                          field === 'idSubcategoria' ? 'Subcategoría' : field}:</strong> {error}
                </li>
              ))}
            </ul>
          </div>
        )}

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
              border: errors.imagen ? "2px solid #FECACA" : "1px solid #f1f5f9",
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
                    border: errors.imagen ? "3px dashed #EF4444" : 
                           (selectedImage || producto.imagenProducto) ? "none" : "3px dashed #FF6B35",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    minHeight: "400px"
                  }}
                  onClick={triggerFileInput}
                  data-field="imagen"
                >
                  {selectedImage || producto.imagenProducto ? (
                    <div style={{ width: "100%", height: "100%", position: "relative" }}>
                      {/* ✅ CORREGIDO: Usar getImageUrl para mostrar imagen existente */}
                      <img 
                        src={selectedImage ? URL.createObjectURL(selectedImage) : getImageUrl(producto.imagenProducto)}
                        alt={producto.nombreProducto}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      {selectedImage && (
                        <div style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(16, 185, 129, 0.9)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          backdropFilter: "blur(4px)",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          ✓ NUEVA
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "15px",
                      color: errors.imagen ? "#EF4444" : "#FF6B35",
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      padding: "20px"
                    }}>
                      <div style={{ 
                        fontSize: "48px",
                        animation: "float 3s ease-in-out infinite" 
                      }}>
                        {errors.imagen ? "❌" : "📸"}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "4px",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {errors.imagen ? "Error en imagen" : "Sube una imagen"}
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: errors.imagen ? "#EF4444" : "#94a3b8",
                          fontWeight: "500",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {errors.imagen || "Haz clic o arrastra (Máx. 10MB)"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                
                <button
                  type="button"
                  onClick={triggerFileInput}
                  style={{
                    background: errors.imagen ? "#FEF2F2" : "white",
                    color: errors.imagen ? "#EF4444" : "#FF6B35",
                    border: `2px solid ${errors.imagen ? "#EF4444" : "#FF6B35"}`,
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
                    gap: "10px",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = errors.imagen ? 
                      "0 6px 20px rgba(239, 68, 68, 0.2)" : 
                      "0 6px 20px rgba(255, 107, 53, 0.2)";
                    e.target.style.background = errors.imagen ? "#EF4444" : "#FF6B35";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                    e.target.style.background = errors.imagen ? "#FEF2F2" : "white";
                    e.target.style.color = errors.imagen ? "#EF4444" : "#FF6B35";
                  }}
                >
                  {selectedImage || producto.imagenProducto ? "🔄 Cambiar Imagen" : "📤 Seleccionar Imagen"}
                </button>

                {selectedImage && !errors.imagen && (
                  <div style={{
                    fontSize: "13px",
                    color: "#10B981",
                    fontWeight: "600",
                    textAlign: "center",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}>
                    <span>✅</span>
                    <span>Nueva imagen seleccionada: {selectedImage.name}</span>
                  </div>
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
              border: errors.nombreProducto || errors.descripcionProducto || 
                     errors.idCategoria || errors.idSubcategoria ? 
                     "2px solid #FECACA" : "1px solid #f1f5f9",
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
                  color: errors.nombreProducto || errors.descripcionProducto || 
                         errors.idCategoria || errors.idSubcategoria ? 
                         "#EF4444" : "#FF6B35"
                }}>
                  ℹ️
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: errors.nombreProducto || errors.descripcionProducto || 
                           errors.idCategoria || errors.idSubcategoria ? 
                           "#7F1D1D" : "#2C3E50",
                    margin: "0 0 4px 0",
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                  }}>
                    Información del Producto
                  </h3>
                  <p style={{
                    color: errors.nombreProducto || errors.descripcionProducto || 
                           errors.idCategoria || errors.idSubcategoria ? 
                           "#EF4444" : "#64748b",
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
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: errors.nombreProducto ? "#EF4444" : "#2C3E50",
                      marginBottom: "0",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Nombre del Producto
                    </label>
                    <span style={{
                      fontSize: "12px",
                      color: (producto.nombreProducto?.length || 0) > 80 ? "#EF4444" : 
                             (producto.nombreProducto?.length || 0) > 60 ? "#F59E0B" : "#94a3b8",
                      fontWeight: "500",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {(producto.nombreProducto?.length || 0)}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    name="nombreProducto"
                    value={producto.nombreProducto || ""} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Queso fresco artesanal"
                    maxLength={100}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: errors.nombreProducto ? "2px solid #EF4444" : 
                             touched.nombreProducto ? "2px solid #3B82F6" : "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.nombreProducto ? "#EF4444" : "#FF6B35";
                      e.target.style.boxShadow = errors.nombreProducto ? 
                        "0 0 0 3px rgba(239, 68, 68, 0.1)" : 
                        "0 0 0 3px rgba(255, 107, 53, 0.1)";
                    }}
                  />
                  {errors.nombreProducto && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      <span>❌</span>
                      {errors.nombreProducto}
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: errors.descripcionProducto ? "#EF4444" : "#2C3E50",
                      marginBottom: "0",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Descripción
                    </label>
                    <span style={{
                      fontSize: "12px",
                      color: (producto.descripcionProducto?.length || 0) > 400 ? "#EF4444" : 
                             (producto.descripcionProducto?.length || 0) > 300 ? "#F59E0B" : "#94a3b8",
                      fontWeight: "500",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {(producto.descripcionProducto?.length || 0)}/500
                    </span>
                  </div>
                  <textarea
                    name="descripcionProducto"
                    value={producto.descripcionProducto || ""} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Describe las características, origen, ingredientes, etc..."
                    maxLength={500}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: errors.descripcionProducto ? "2px solid #EF4444" : 
                             touched.descripcionProducto ? "2px solid #3B82F6" : "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none",
                      minHeight: "100px",
                      resize: "vertical"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.descripcionProducto ? "#EF4444" : "#FF6B35";
                      e.target.style.boxShadow = errors.descripcionProducto ? 
                        "0 0 0 3px rgba(239, 68, 68, 0.1)" : 
                        "0 0 0 3px rgba(255, 107, 53, 0.1)";
                    }}
                  />
                  {errors.descripcionProducto && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      <span>❌</span>
                      {errors.descripcionProducto}
                    </div>
                  )}
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
                      color: errors.idCategoria ? "#EF4444" : "#2C3E50",
                      marginBottom: "8px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Categoría
                    </label>
                    <select
                      name="idCategoria"
                      value={producto.idCategoria || ""}
                      onChange={(e) => {
                        const idCategoria = parseInt(e.target.value);
                        
                        setProducto(prev => ({
                          ...prev,
                          idCategoria: idCategoria,
                          subcategoria: { idSubcategoria: "" }
                        }));

                        if (idCategoria) {
                          cargarSubcategoriasPorCategoria(idCategoria);
                        } else {
                          setSubcategorias([]);
                        }
                        
                        // Marcar como tocado y validar
                        setTouched(prev => ({ ...prev, idCategoria: true }));
                        if (errors.idCategoria) {
                          setErrors(prev => ({ ...prev, idCategoria: "" }));
                        }
                      }}
                      onBlur={(e) => {
                        const error = validateField("idCategoria", e.target.value);
                        if (error) {
                          setErrors(prev => ({ ...prev, idCategoria: error }));
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: errors.idCategoria ? "2px solid #EF4444" : 
                               touched.idCategoria ? "2px solid #3B82F6" : "2px solid #e5e7eb",
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
                    {errors.idCategoria && (
                      <div style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "#EF4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        <span>❌</span>
                        {errors.idCategoria}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: errors.idSubcategoria ? "#EF4444" : "#2C3E50",
                      marginBottom: "8px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Subcategoría
                    </label>
                    <select
                      name="idSubcategoria"
                      value={producto.subcategoria?.idSubcategoria || ""}
                      onChange={(e) => {
                        const idSubcategoria = parseInt(e.target.value);
                        setProducto(prev => ({
                          ...prev,
                          subcategoria: { idSubcategoria: idSubcategoria }
                        }));
                        
                        // Marcar como tocado y validar
                        setTouched(prev => ({ ...prev, idSubcategoria: true }));
                        if (errors.idSubcategoria) {
                          setErrors(prev => ({ ...prev, idSubcategoria: "" }));
                        }
                      }}
                      onBlur={(e) => {
                        const error = validateField("idSubcategoria", e.target.value);
                        if (error) {
                          setErrors(prev => ({ ...prev, idSubcategoria: error }));
                        }
                      }}
                      disabled={!producto.idCategoria}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: errors.idSubcategoria ? "2px solid #EF4444" : 
                               (touched.idSubcategoria && !producto.idCategoria) ? "2px solid #F59E0B" :
                               touched.idSubcategoria ? "2px solid #3B82F6" : "2px solid #e5e7eb",
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
                    {errors.idSubcategoria && (
                      <div style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "#EF4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        <span>❌</span>
                        {errors.idSubcategoria}
                      </div>
                    )}
                    {!producto.idCategoria && touched.idSubcategoria && (
                      <div style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "#F59E0B",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        <span>⚠️</span>
                        Primero seleccione una categoría
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PRECIO Y DISPONIBILIDAD */}
            <div style={{
              background: "#fafbfd",
              borderRadius: "16px",
              padding: "28px",
              border: errors.precioProducto || errors.stockProducto ? 
                     "2px solid #FECACA" : "1px solid #f1f5f9",
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
                  color: errors.precioProducto || errors.stockProducto ? 
                         "#EF4444" : "#FF8E53"
                }}>
                  💰
                </div>
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: errors.precioProducto || errors.stockProducto ? 
                           "#7F1D1D" : "#2C3E50",
                    margin: "0 0 4px 0",
                    fontFamily: "'Playfair Display', 'Georgia', serif"
                  }}>
                    Precio y Disponibilidad
                  </h3>
                  <p style={{
                    color: errors.precioProducto || errors.stockProducto ? 
                           "#EF4444" : "#64748b",
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
                    color: errors.precioProducto ? "#EF4444" : "#2C3E50",
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
                      color: errors.precioProducto ? "#EF4444" : "#FF6B35",
                      fontSize: "16px"
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="999999"
                      name="precioProducto"
                      value={producto.precioProducto || ""} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "14px 16px 14px 36px",
                        borderRadius: "12px",
                        border: errors.precioProducto ? "2px solid #EF4444" : 
                               touched.precioProducto ? "2px solid #3B82F6" : "2px solid #e5e7eb",
                        fontSize: "15px",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s ease",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = errors.precioProducto ? "#EF4444" : "#FF6B35";
                        e.target.style.boxShadow = errors.precioProducto ? 
                          "0 0 0 3px rgba(239, 68, 68, 0.1)" : 
                          "0 0 0 3px rgba(255, 107, 53, 0.1)";
                      }}
                    />
                  </div>
                  {errors.precioProducto && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      <span>❌</span>
                      {errors.precioProducto}
                    </div>
                  )}
                  {!errors.precioProducto && producto.precioProducto && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#10B981",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      <span>✅</span>
                      Precio válido: ${parseFloat(producto.precioProducto).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: errors.stockProducto ? "#EF4444" : "#2C3E50",
                    marginBottom: "8px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    name="stockProducto"
                    value={producto.stockProducto || ""} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="100"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: errors.stockProducto ? "2px solid #EF4444" : 
                             touched.stockProducto ? "2px solid #3B82F6" : "2px solid #e5e7eb",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.3s ease",
                      outline: "none"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.stockProducto ? "#EF4444" : "#FF6B35";
                      e.target.style.boxShadow = errors.stockProducto ? 
                        "0 0 0 3px rgba(239, 68, 68, 0.1)" : 
                        "0 0 0 3px rgba(255, 107, 53, 0.1)";
                    }}
                  />
                  {errors.stockProducto && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      <span>❌</span>
                      {errors.stockProducto}
                    </div>
                  )}
                  {!errors.stockProducto && producto.stockProducto && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: parseInt(producto.stockProducto) > 50 ? "#10B981" : 
                             parseInt(producto.stockProducto) > 20 ? "#F59E0B" : "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      <span>
                        {parseInt(producto.stockProducto) > 50 ? "✅" : 
                         parseInt(producto.stockProducto) > 20 ? "⚠️" : "🔄"}
                      </span>
                      {parseInt(producto.stockProducto) > 50 ? "Stock suficiente" : 
                       parseInt(producto.stockProducto) > 20 ? "Stock moderado" : "Stock bajo"}
                    </div>
                  )}
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
                    name="unidad"
                    value={producto.unidad || "kg"}
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
                    <option value="gramo">Gramo (g)</option>
                    <option value="mililitro">Mililitro (ml)</option>
                    <option value="docena">Docena</option>
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
              disabled={isSubmitting}
              style={{
                background: "white",
                color: "#64748b",
                border: "2px solid #e5e7eb",
                borderRadius: "14px",
                padding: "16px 36px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "'Inter', sans-serif",
                opacity: isSubmitting ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.borderColor = "#94a3b8";
                  e.target.style.color = "#475569";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.color = "#64748b";
                }
              }}
            >
              ← Cancelar
            </button>
            
            <button
              type="button"
              onClick={actualizarProducto}
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? "#94a3b8" : "#FF6B35",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "16px 48px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.4)";
                  e.target.style.background = "#FF8E53";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.3)";
                  e.target.style.background = "#FF6B35";
                }
              }}
            >
              {isSubmitting ? (
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
                "💾 Guardar Cambios"
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