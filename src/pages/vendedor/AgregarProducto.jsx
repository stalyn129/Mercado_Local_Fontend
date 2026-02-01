import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = "http://192.168.1.13:8080";
  const FASTAPI_URL = "http://localhost:8000";

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
  
  // ✅ NUEVO: Estados para IA
  const [precioIA, setPrecioIA] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [iaPulsing, setIaPulsing] = useState(false);

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

  // ==================== FUNCIÓN PARA ANALIZAR PRECIO CON IA ====================
  const analizarPrecio = async () => {
    if (!producto?.nombreProducto || producto.nombreProducto.length < 3) {
      setPrecioIA(null);
      return;
    }

    setAnalizando(true);

    try {
      console.log("🤖 Enviando petición a IA para:", producto.nombreProducto);
      console.log("📏 Unidad seleccionada:", producto.unidad);
      console.log("💰 Precio ingresado:", parseFloat(producto.precioProducto) || 0);

      const datosEnvio = {
        nombre: producto.nombreProducto,
        precio: parseFloat(producto.precioProducto) || 0,
        unidad: producto.unidad
      };

      console.log("📦 Datos enviados a IA:", datosEnvio);

      const res = await fetch(`${FASTAPI_URL}/api/ia/precio/recomendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosEnvio)
      });

      console.log("📡 Estado respuesta:", res.status, res.statusText);

      if (!res.ok) {
        console.error(`❌ Error HTTP: ${res.status} - ${res.statusText}`);
        setPrecioIA(null);
        return;
      }

      const responseText = await res.text();
      console.log("📄 Respuesta completa recibida:", responseText);

      if (!responseText || responseText.trim() === "") {
        console.warn("⚠️ Respuesta vacía del servidor");
        setPrecioIA(null);
        return;
      }

      const data = JSON.parse(responseText);
      console.log("✅ Respuesta IA parseada exitosamente:", data);

      // Manejar diferentes tipos de respuesta
      if (data.error) {
        console.error("❌ Error en respuesta:", data.error);
        setPrecioIA({
          error: true,
          message: data.message || "Error en el análisis",
          similar_found: false
        });
      } else if (!data.similar_found) {
        // Caso: no se encontraron productos o no hay conversión posible
        console.log("⚠️ No se encontraron productos similares o conversión no posible");
        setPrecioIA({
          similar_found: false,
          message: data.message || "No se encontraron productos comparables",
          precio_ingresado: data.precio_ingresado || parseFloat(producto.precioProducto) || 0,
          unidad_analizada: data.unidad || producto.unidad,
          unidades_disponibles: data.unidades_disponibles || [],
          unidad_sugerida: data.unidad_sugerida,
          consejo: data.consejo || "Intenta con otra unidad de medida"
        });
      } else {
        // Caso normal: productos encontrados
        console.log("✅ Productos similares encontrados:", data.total_productos);
        setPrecioIA(data);
      }

    } catch (error) {
      console.error("❌ Error de red o conexión:", error);
      setPrecioIA({
        error: true,
        message: "Error de conexión con el servidor",
        similar_found: false
      });
    } finally {
      setAnalizando(false);
    }
  };

  // Efecto para analizar precio cuando cambian los datos relevantes
  useEffect(() => {
    if (producto?.nombreProducto?.trim().length > 3 && producto.precioProducto) {
      const timer = setTimeout(() => {
        console.log("🔄 Ejecutando análisis IA con datos:", {
          nombre: producto.nombreProducto,
          precio: producto.precioProducto,
          unidad: producto.unidad
        });
        analizarPrecio();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setPrecioIA(null);
    }
  }, [producto?.nombreProducto, producto?.precioProducto, producto?.unidad]);

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

  // ✅ CORREGIDO: La imagen NO es obligatoria en edición
  const validateForm = () => {
    if (!producto) return false;
    
    const newErrors = {};
    
    // Validar cada campo obligatorio
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
    
    // ✅ CORREGIDO: Solo validar imagen si se seleccionó una nueva
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

  // ✅ CORREGIDO: Función actualizarProducto con manejo correcto de imagen
  const actualizarProducto = async () => {
    if (isSubmitting || !producto) return;
    
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(producto).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // ✅ CORREGIDO: No marcar imagen como tocada si no se seleccionó
    if (!selectedImage) {
      setTouched(prev => ({ ...prev, imagen: false }));
    }
    
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

    try {
      // ✅ PASO 1: Subir nueva imagen SOLO si se seleccionó una
      let nuevaImagenPath = null;
      
      if (selectedImage) {
        console.log("📤 Subiendo nueva imagen...");
        const formDataImagen = new FormData();
        formDataImagen.append("file", selectedImage);
        
        const uploadResponse = await fetch(`${API_URL}/upload/producto`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formDataImagen
        });
        
        console.log("📊 Status upload:", uploadResponse.status, uploadResponse.statusText);
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("❌ Error al subir imagen:", errorText);
          throw new Error(`Error al subir imagen: ${uploadResponse.status} - ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log("✅ Resultado upload:", uploadResult);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Error desconocido al subir imagen");
        }
        
        nuevaImagenPath = uploadResult.path;
        console.log("🖼️ Nueva ruta de imagen:", nuevaImagenPath);
      }
      
      // ✅ PASO 2: Preparar datos para actualizar
      const datosActualizacion = {
        nombreProducto: producto.nombreProducto.trim(),
        descripcionProducto: producto.descripcionProducto?.trim() || "",
        precioProducto: producto.precioProducto,
        stockProducto: producto.stockProducto,
        unidad: producto.unidad,
        idSubcategoria: producto.subcategoria.idSubcategoria,
        idUsuario: vendedor.idUsuario || vendedor.idVendedor || vendedor.id
      };
      
      // ✅ CORREGIDO: Agregar nueva imagen solo si se subió una
      if (nuevaImagenPath) {
        datosActualizacion.imagenProducto = nuevaImagenPath;
      }
      
      console.log("📦 Datos de actualización:", datosActualizacion);
      
      // ✅ PASO 3: Enviar actualización
      const res = await fetch(`${API_URL}/productos/editar/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(datosActualizacion)
      });

      if (res.ok) {
        const result = await res.json();
        console.log("✅ Producto actualizado:", result);
        alert("✔ Producto actualizado correctamente");
        
        // Limpiar errores
        setErrors({});
        setTouched({});
        setSelectedImage(null);
        
        // Redirigir después de 1 segundo
        setTimeout(() => {
          navigate("/vendedor/gestionar-productos");
        }, 1000);
      } else {
        const errorText = await res.text();
        console.error("❌ Error del servidor:", errorText);
        alert(`❌ Error al actualizar producto: ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert(`❌ Error al conectar con el servidor: ${error.message}`);
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

  // ✅ NUEVO: Función para eliminar la imagen seleccionada
  const eliminarImagenSeleccionada = () => {
    setSelectedImage(null);
    setErrors(prev => ({ ...prev, imagen: "" }));
  };

  // ==================== FUNCIONES PARA IA ====================
  // Función para determinar el color según el estado del precio
  const getEstadoColor = (estado) => {
    if (!estado) return { color: "#6B7280", border: "#D1D5DB", bg: "#F9FAFB" };

    const estadoLower = estado.toLowerCase();

    if (estadoLower.includes("muy_bajo") || estadoLower.includes("bajo") || estadoLower.includes("ligeramente_bajo")) {
      return { color: "#F59E0B", border: "#FCD34D", bg: "#FEF3C7" };
    } else if (estadoLower.includes("adecuado")) {
      return { color: "#10B981", border: "#34D399", bg: "#D1FAE5" };
    } else if (estadoLower.includes("ligeramente_alto") || estadoLower.includes("alto") || estadoLower.includes("muy_alto")) {
      return { color: "#EF4444", border: "#FCA5A5", bg: "#FEE2E2" };
    } else {
      return { color: "#6B7280", border: "#D1D5DB", bg: "#F9FAFB" };
    }
  };

  // Función para determinar el icono según el estado del precio
  const getEstadoIcono = (estado) => {
    if (!estado) return "❓";

    const estadoLower = estado.toLowerCase();

    if (estadoLower.includes("muy_bajo")) return "📉📉";
    if (estadoLower.includes("bajo")) return "📉";
    if (estadoLower.includes("ligeramente_bajo")) return "↘️";
    if (estadoLower.includes("adecuado")) return "✅";
    if (estadoLower.includes("ligeramente_alto")) return "↗️";
    if (estadoLower.includes("alto")) return "📈";
    if (estadoLower.includes("muy_alto")) return "📈📈";
    return "❓";
  };

  // Función para determinar el texto según el estado del precio
  const getEstadoTexto = (estado) => {
    if (!estado) return "Sin análisis";

    const estadoLower = estado.toLowerCase();

    if (estadoLower.includes("muy_bajo")) return "Muy por debajo";
    if (estadoLower.includes("bajo")) return "Por debajo";
    if (estadoLower.includes("ligeramente_bajo")) return "Ligeramente bajo";
    if (estadoLower.includes("adecuado")) return "Adecuado";
    if (estadoLower.includes("ligeramente_alto")) return "Ligeramente alto";
    if (estadoLower.includes("alto")) return "Por encima";
    if (estadoLower.includes("muy_alto")) return "Muy por encima";
    return estado;
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
              // ✅ CORREGIDO: Solo mostrar borde rojo si hay error con imagen seleccionada
              border: (errors.imagen && selectedImage) ? "2px solid #FECACA" : "1px solid #f1f5f9",
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
                    // ✅ CORREGIDO: Solo mostrar borde rojo si hay error con imagen seleccionada
                    border: (errors.imagen && selectedImage) ? "3px dashed #EF4444" : 
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
                      {!selectedImage && producto.imagenProducto && (
                        <div style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(59, 130, 246, 0.9)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          backdropFilter: "blur(4px)",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          📷 ACTUAL
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "15px",
                      // ✅ CORREGIDO: Solo mostrar rojo si hay error con imagen seleccionada
                      color: (errors.imagen && selectedImage) ? "#EF4444" : "#FF6B35",
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      padding: "20px"
                    }}>
                      <div style={{ 
                        fontSize: "48px",
                        animation: "float 3s ease-in-out infinite" 
                      }}>
                        {(errors.imagen && selectedImage) ? "❌" : "📸"}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "4px",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {(errors.imagen && selectedImage) ? "Error en imagen" : "Sube una imagen (Opcional)"}
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: (errors.imagen && selectedImage) ? "#EF4444" : "#94a3b8",
                          fontWeight: "500",
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {(errors.imagen && selectedImage) || "Haz clic para cambiar la imagen actual (Máx. 10MB)"}
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
                    background: (errors.imagen && selectedImage) ? "#FEF2F2" : "white",
                    color: (errors.imagen && selectedImage) ? "#EF4444" : "#FF6B35",
                    border: `2px solid ${(errors.imagen && selectedImage) ? "#EF4444" : "#FF6B35"}`,
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
                    e.target.style.boxShadow = (errors.imagen && selectedImage) ? 
                      "0 6px 20px rgba(239, 68, 68, 0.2)" : 
                      "0 6px 20px rgba(255, 107, 53, 0.2)";
                    e.target.style.background = (errors.imagen && selectedImage) ? "#EF4444" : "#FF6B35";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                    e.target.style.background = (errors.imagen && selectedImage) ? "#FEF2F2" : "white";
                    e.target.style.color = (errors.imagen && selectedImage) ? "#EF4444" : "#FF6B35";
                  }}
                >
                  {selectedImage || producto.imagenProducto ? "🔄 Cambiar Imagen" : "📤 Seleccionar Imagen"}
                </button>

                {/* ✅ NUEVO: Botón para eliminar imagen seleccionada */}
                {selectedImage && (
                  <button
                    type="button"
                    onClick={eliminarImagenSeleccionada}
                    style={{
                      background: "#FEF2F2",
                      color: "#EF4444",
                      border: "2px solid #FECACA",
                      borderRadius: "14px",
                      padding: "12px 20px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontFamily: "'Inter', sans-serif"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.2)";
                      e.target.style.background = "#EF4444";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#FEF2F2";
                      e.target.style.color = "#EF4444";
                    }}
                  >
                    🗑️ Eliminar imagen seleccionada
                  </button>
                )}

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

          {/* ✅✅✅ SECCIÓN DE INTELIGENCIA ARTIFICIAL */}
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
              {/* Contenido de IA */}
              <div style={{ position: "relative", zIndex: "2" }}>
                {/* Header */}
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
                </div>

                {analizando ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
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
                    <h5 style={{ fontSize: "24px", fontWeight: "700", color: "#2C3E50", margin: "0 0 10px 0" }}>
                      Analizando mercado...
                    </h5>
                    <p style={{ fontSize: "16px", color: "#64748b", margin: "0" }}>
                      Buscando productos similares y analizando precios
                    </p>
                  </div>
                ) : precioIA && (
                  <>
                    {/* CASO 1: Error o sin productos */}
                    {(precioIA.error || !precioIA.similar_found) && (
                      <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div style={{
                          fontSize: "64px",
                          marginBottom: "20px",
                          color: precioIA.error ? "#EF4444" : "#F59E0B"
                        }}>
                          {precioIA.error ? "❌" : "⚠️"}
                        </div>

                        <h5 style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: precioIA.error ? "#7F1D1D" : "#92400E",
                          margin: "0 0 16px 0"
                        }}>
                          {precioIA.error ? "Error en el análisis" : "Análisis no disponible"}
                        </h5>

                        <p style={{
                          fontSize: "16px",
                          color: "#64748b",
                          margin: "0 0 20px 0",
                          lineHeight: "1.6"
                        }}>
                          {precioIA.message || "No se pudo analizar el precio"}
                        </p>

                        {/* Mostrar unidades disponibles si existen */}
                        {precioIA.unidades_disponibles && precioIA.unidades_disponibles.length > 0 && (
                          <div style={{
                            background: "rgba(139, 92, 246, 0.1)",
                            borderRadius: "12px",
                            padding: "20px",
                            margin: "20px 0",
                            border: "1px solid rgba(139, 92, 246, 0.2)"
                          }}>
                            <div style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#8B5CF6",
                              marginBottom: "8px"
                            }}>
                              📦 Unidades disponibles en el mercado:
                            </div>
                            <div style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                              justifyContent: "center"
                            }}>
                              {precioIA.unidades_disponibles.map((unidad, index) => (
                                <span key={index} style={{
                                  background: "white",
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  border: "1px solid #E9D5FF",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#8B5CF6"
                                }}>
                                  {unidad}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mostrar sugerencia de unidad si existe */}
                        {precioIA.unidad_sugerida && (
                          <div style={{
                            background: "rgba(52, 211, 153, 0.1)",
                            borderRadius: "12px",
                            padding: "20px",
                            margin: "20px 0",
                            border: "1px solid rgba(52, 211, 153, 0.2)"
                          }}>
                            <div style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#10B981",
                              marginBottom: "8px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              💡 Recomendación
                            </div>
                            <p style={{
                              fontSize: "16px",
                              color: "#065F46",
                              margin: "0",
                              lineHeight: "1.6"
                            }}>
                              <strong>Cambia la unidad a "{precioIA.unidad_sugerida}"</strong> para obtener una recomendación precisa del precio.
                              Los productos similares se venden por {precioIA.unidad_sugerida === "unidad" ? "unidad" : precioIA.unidad_sugerida}.
                            </p>
                          </div>
                        )}

                        {/* Botón para cambiar unidad (opcional) */}
                        {precioIA.unidad_sugerida && (
                          <button
                            onClick={() => {
                              setProducto(prev => ({ ...prev, unidad: precioIA.unidad_sugerida }));
                              setTimeout(() => {
                                analizarPrecio();
                              }, 500);
                            }}
                            style={{
                              background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "12px",
                              padding: "12px 24px",
                              fontSize: "15px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              marginTop: "10px"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "none";
                            }}
                          >
                            🔄 Cambiar a {precioIA.unidad_sugerida}
                          </button>
                        )}
                      </div>
                    )}

                    {/* CASO 2: Estado "unidad_diferente" (conversión a unidad sugerida) */}
                    {precioIA.similar_found && precioIA.estado === "unidad_diferente" && (
                      <>
                        {/* Mensaje de advertencia */}
                        <div style={{
                          background: "rgba(245, 158, 11, 0.1)",
                          borderRadius: "12px",
                          padding: "20px",
                          marginBottom: "24px",
                          border: "1px solid rgba(245, 158, 11, 0.2)"
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px"
                          }}>
                            <div style={{ fontSize: "24px", color: "#F59E0B" }}>⚠️</div>
                            <div>
                              <h5 style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "#92400E",
                                margin: "0 0 4px 0"
                              }}>
                                Atención: Unidad diferente
                              </h5>
                              <p style={{
                                fontSize: "14px",
                                color: "#92400E",
                                margin: "0",
                                opacity: 0.9
                              }}>
                                {precioIA.mensaje_estado || "Los productos similares se venden en otra unidad"}
                              </p>
                            </div>
                          </div>

                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid rgba(245, 158, 11, 0.2)"
                          }}>
                            <span style={{ fontSize: "14px", color: "#92400E" }}>🔁</span>
                            <span style={{ fontSize: "14px", color: "#92400E", fontWeight: "600" }}>
                              Precio calculado en {precioIA.unidad_analizada} (sugerida)
                            </span>
                          </div>
                        </div>

                        {/* Tarjetas principales */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: screenSize === "mobile" ? "1fr" : "1fr 1fr 1fr",
                          gap: "16px",
                          marginBottom: "24px"
                        }}>
                          {/* Precio Promedio (en unidad sugerida) */}
                          <div style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "20px",
                            border: "2px solid #E9D5FF",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                              Precio Promedio ({precioIA.unidad_analizada})
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "800", color: "#8B5CF6", marginBottom: "8px" }}>
                              ${precioIA.precio_promedio?.toFixed(2) || "0.00"}
                            </div>
                          </div>

                          {/* Tu Precio (en unidad original) */}
                          <div style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "20px",
                            border: "2px solid #FFEDD5",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#FF6B35", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                              Tu Precio ({precioIA.unidad_original_usuario || producto.unidad})
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "800", color: "#FF6B35", marginBottom: "8px" }}>
                              ${precioIA.precio_ingresado?.toFixed(2) || "0.00"}
                            </div>
                          </div>

                          {/* Recomendación */}
                          <div style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "20px",
                            border: "2px solid #A7F3D0",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#10B981", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                              Recomendación
                            </div>
                            <div style={{ fontSize: "16px", fontWeight: "800", color: "#10B981", marginBottom: "8px" }}>
                              Usa {precioIA.unidad_sugerida}
                            </div>
                          </div>
                        </div>

                        {/* Recomendación principal */}
                        <div style={{
                          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                          borderRadius: "16px",
                          padding: "24px",
                          marginBottom: "24px",
                          color: "white"
                        }}>
                          <div style={{ fontSize: "14px", fontWeight: "600", opacity: 0.9, marginBottom: "4px" }}>
                            RECOMENDACIÓN DE INTELIGENCIA ARTIFICIAL
                          </div>
                          <div style={{ fontSize: "48px", fontWeight: "800", textAlign: "center", margin: "20px 0" }}>
                            ${precioIA.recomendado?.toFixed(2) || "0.00"}
                          </div>
                          <div style={{ fontSize: "14px", opacity: 0.9, textAlign: "center", marginBottom: "16px" }}>
                            Precio sugerido por {precioIA.unidad_analizada}
                          </div>
                          <button
                            onClick={() => {
                              setProducto(prev => ({ ...prev, unidad: precioIA.unidad_sugerida }));
                            }}
                            style={{
                              background: "white",
                              color: "#8B5CF6",
                              border: "none",
                              borderRadius: "8px",
                              padding: "10px 20px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              display: "block",
                              margin: "0 auto",
                              width: "fit-content"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "none";
                            }}
                          >
                            🔄 Cambiar unidad a {precioIA.unidad_sugerida}
                          </button>
                        </div>
                      </>
                    )}

                    {/* CASO 3: Análisis normal (similar_found: true) */}
                    {precioIA.similar_found && precioIA.estado !== "unidad_diferente" && (
                      <>
                        {/* Mostrar advertencia si la unidad es inapropiada */}
                        {precioIA.unidad_inapropiada && (
                          <div style={{
                            background: "rgba(245, 158, 11, 0.1)",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "24px",
                            border: "1px solid rgba(245, 158, 11, 0.2)"
                          }}>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "12px"
                            }}>
                              <div style={{ fontSize: "24px", color: "#F59E0B" }}>⚠️</div>
                              <div>
                                <h5 style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  color: "#92400E",
                                  margin: "0 0 4px 0"
                                }}>
                                  Unidad inapropiada
                                </h5>
                                <p style={{
                                  fontSize: "14px",
                                  color: "#92400E",
                                  margin: "0",
                                  opacity: 0.9
                                }}>
                                  {precioIA.consejo || `Los huevos no se venden por ${producto.unidad}. Usa '${precioIA.unidad_sugerida}'`}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setProducto(prev => ({ ...prev, unidad: precioIA.unidad_sugerida }));
                                setTimeout(() => {
                                  analizarPrecio();
                                }, 500);
                              }}
                              style={{
                                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 20px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "10px"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              🔄 Cambiar a {precioIA.unidad_sugerida}
                            </button>
                          </div>
                        )}

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
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                              Precio Promedio
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "800", color: "#8B5CF6", marginBottom: "8px" }}>
                              ${precioIA.precio_promedio?.toFixed(2) || "0.00"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#8B5CF6", opacity: 0.7 }}>
                              por {precioIA.unidad_analizada || producto.unidad}
                            </div>
                          </div>

                          {/* Tu Precio */}
                          <div style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "20px",
                            border: "2px solid #FFEDD5",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#FF6B35", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                              Tu Precio
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "800", color: "#FF6B35", marginBottom: "8px" }}>
                              ${precioIA.precio_ingresado?.toFixed(2) || "0.00"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#FF6B35", opacity: 0.7 }}>
                              por {producto.unidad}
                            </div>
                          </div>

                          {/* Estado */}
                          <div style={{
                            borderRadius: "14px",
                            padding: "20px",
                            border: `2px solid ${getEstadoColor(precioIA.estado).border}`,
                            textAlign: "center",
                            backgroundColor: getEstadoColor(precioIA.estado).bg
                          }}>
                            <div style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: getEstadoColor(precioIA.estado).color,
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              marginBottom: "8px"
                            }}>
                              Estado
                            </div>
                            <div style={{
                              fontSize: "20px",
                              fontWeight: "800",
                              color: getEstadoColor(precioIA.estado).color,
                              marginBottom: "4px"
                            }}>
                              {getEstadoIcono(precioIA.estado)} {getEstadoTexto(precioIA.estado)}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: getEstadoColor(precioIA.estado).color,
                              opacity: 0.8
                            }}>
                              {precioIA.diferencia_porcentaje ?
                                (precioIA.diferencia_porcentaje > 0 ?
                                  `+${precioIA.diferencia_porcentaje.toFixed(1)}%` :
                                  `${precioIA.diferencia_porcentaje.toFixed(1)}%`) :
                                "0%"}
                            </div>
                          </div>
                        </div>

                        {/* Recomendación */}
                        <div style={{
                          background: getEstadoColor(precioIA.estado).color === "#10B981" ?
                            "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" :
                            getEstadoColor(precioIA.estado).color === "#F59E0B" ?
                              "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" :
                              "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                          borderRadius: "16px",
                          padding: "24px",
                          marginBottom: "24px",
                          color: "white",
                          textAlign: "center"
                        }}>
                          <div style={{ fontSize: "14px", fontWeight: "600", opacity: 0.9, marginBottom: "4px" }}>
                            RECOMENDACIÓN DE INTELIGENCIA ARTIFICIAL
                          </div>
                          <div style={{ fontSize: "48px", fontWeight: "800", margin: "20px 0" }}>
                            ${precioIA.recomendado?.toFixed(2) || "0.00"}
                          </div>
                          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "16px" }}>
                            {precioIA.unidad_inapropiada ?
                              `Precio sugerido por ${precioIA.unidad_sugerida}` :
                              (getEstadoColor(precioIA.estado).color === "#F59E0B" ?
                                "Puedes aumentar tu precio para igualar el mercado" :
                                getEstadoColor(precioIA.estado).color === "#EF4444" ?
                                  "Considera bajar tu precio para ser más competitivo" :
                                  "Este precio maximiza tus ventas manteniendo una buena rentabilidad")}
                          </div>
                          {precioIA.diferencia_porcentaje && Math.abs(precioIA.diferencia_porcentaje) > 5 && (
                            <div style={{
                              background: "rgba(255, 255, 255, 0.2)",
                              borderRadius: "8px",
                              padding: "10px",
                              fontSize: "13px",
                              marginTop: "10px"
                            }}>
                              {precioIA.diferencia_porcentaje < 0 ?
                                `Tu precio está ${Math.abs(precioIA.diferencia_porcentaje).toFixed(1)}% por debajo del promedio` :
                                `Tu precio está ${Math.abs(precioIA.diferencia_porcentaje).toFixed(1)}% por encima del promedio`}
                              {precioIA.unidad_inapropiada && " (comparación usando unidad sugerida)"}
                            </div>
                          )}
                        </div>

                        {/* Productos similares */}
                        {precioIA.productos_similares && precioIA.productos_similares.length > 0 && (
                          <div style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "20px",
                            border: "2px solid #E9D5FF"
                          }}>
                            <div style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#8B5CF6",
                              marginBottom: "16px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              🔍 Productos similares encontrados ({precioIA.total_productos})
                            </div>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: screenSize === "mobile" ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
                              gap: "12px",
                              maxHeight: "300px",
                              overflowY: "auto",
                              padding: "8px"
                            }}>
                              {precioIA.productos_similares.map((prod, index) => (
                                <div key={index} style={{
                                  background: "#faf5ff",
                                  borderRadius: "10px",
                                  padding: "12px",
                                  border: "1px solid #E9D5FF"
                                }}>
                                  <div style={{
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#6D28D9",
                                    marginBottom: "4px"
                                  }}>
                                    {prod.nombre?.length > 40 ? prod.nombre.substring(0, 40) + "..." : prod.nombre}
                                  </div>
                                  <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "12px",
                                    color: "#7C3AED"
                                  }}>
                                    <span>${prod.precio_original?.toFixed(2)} / {prod.unidad_original}</span>
                                    {prod.conversion_necesaria && (
                                      <span style={{ color: "#F59E0B" }}>🔄 Convertido</span>
                                    )}
                                  </div>
                                  <div style={{
                                    fontSize: "11px",
                                    color: "#94a3b8",
                                    marginTop: "4px"
                                  }}>
                                    {prod.nombre_empresa}
                                  </div>
                                  {prod.direccion_empresa && (
                                    <div style={{
                                      fontSize: "10px",
                                      color: "#64748b",
                                      marginTop: "2px"
                                    }}>
                                      📍 {prod.direccion_empresa.length > 30 ? prod.direccion_empresa.substring(0, 30) + "..." : prod.direccion_empresa}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
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