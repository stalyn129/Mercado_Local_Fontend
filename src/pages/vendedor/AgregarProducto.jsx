import { useState, useEffect, useRef } from "react";
import Footer from "../../components/Footer.jsx";

export default function AgregarProducto() {
  const fileInputRef = useRef(null);
  
  // ✅ CORREGIDO: Usar tu IP para que móvil pueda acceder
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
  
  // Estados para validaciones
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

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

  // ==================== VALIDACIONES ====================
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "nombreProducto":
        if (!value.trim()) {
          error = "El nombre del producto es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        } else if (value.trim().length > 100) {
          error = "El nombre no puede exceder los 100 caracteres";
        }
        break;
        
      case "descripcionProducto":
        if (value.trim().length > 500) {
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
        } else if (parseInt(value) < 1) {
          error = "El stock debe ser al menos 1 unidad";
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
    const newErrors = {};
    
    // Validar cada campo
    Object.keys(form).forEach(key => {
      if (key !== "estadoProducto") { // Excluir estado
        const error = validateField(key, form[key]);
        if (error) newErrors[key] = error;
      }
    });
    
    // Validar imagen
    if (!selectedImageFile) {
      newErrors.imagen = "Debe seleccionar una imagen del producto";
    } else {
      // Validar tipo de imagen
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(selectedImageFile.type)) {
        newErrors.imagen = "Formato de imagen no válido. Use JPG, PNG o GIF";
      }
      
      // ✅ CORREGIDO: 10MB (consistente con backend)
      if (selectedImageFile.size > 10 * 1024 * 1024) {
        newErrors.imagen = "La imagen no puede superar los 10MB";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar automáticamente cuando cambian los campos
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [form, selectedImageFile]);

  useEffect(() => {
    if (!user || user.rol !== "VENDEDOR") {
      alert("Debes iniciar sesión como vendedor");
      window.location.href = "/login";
      return;
    }

    const cargarCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/categorias/listar`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        console.log("✅ Categorías cargadas:", data);
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

    // Validar antes de establecer
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, imagen: "Formato de imagen no válido. Use JPG, PNG o GIF" }));
      return;
    }
    
    // ✅ CORREGIDO: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imagen: "La imagen no puede superar los 10MB" }));
      return;
    }

    setSelectedImageFile(file);
    setErrors(prev => ({ ...prev, imagen: "" }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ✅✅✅ FUNCIÓN CORREGIDA handleSubmit
  const handleSubmit = async () => {
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(form).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    setShowValidationSummary(true);

    // Validar formulario
    if (!validateForm()) {
      // Mostrar resumen de errores
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

    if (!user || (!user.id && !user.idUsuario && !user.idVendedor)) {
      alert("Error: No se pudo identificar el usuario. Por favor, inicie sesión nuevamente.");
      return;
    }

    setLoading(true);

    try {
      // ✅ CORREGIDO: PASO 1 - Subir la imagen
      console.log("📤 Subiendo imagen...");
      console.log("🔗 Endpoint:", `${API_URL}/upload/producto`);
      console.log("📁 Archivo:", selectedImageFile.name, selectedImageFile.type);
      
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      // ✅ CORREGIDO: SINGULAR "upload" no PLURAL "uploads"
      const uploadResponse = await fetch(`${API_URL}/upload/producto`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      console.log("📊 Status upload:", uploadResponse.status, uploadResponse.statusText);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ Error al subir imagen:", errorText);
        throw new Error(`Error al subir imagen: ${uploadResponse.status} - ${errorText}`);
      }

      // ✅ CORREGIDO: Recibir como JSON
      const uploadResult = await uploadResponse.json();
      console.log("✅ Resultado upload:", uploadResult);

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || "Error desconocido al subir imagen");
      }

      // ✅ CORREGIDO: Usar la RUTA RELATIVA (path)
      const imagePath = uploadResult.path; // "/uploads/productos/uuid.jpg"
      console.log("🖼️ Ruta para BD:", imagePath);
      console.log("🔗 URL completa:", uploadResult.url);

      // ✅ CORREGIDO: PASO 2 - Crear el producto
      console.log("📦 Creando producto...");
      const body = {
        idUsuario: user.idUsuario || user.idVendedor || user.id,
        idVendedor: user.idVendedor || user.idUsuario || user.id,
        idSubcategoria: parseInt(form.idSubcategoria),
        nombreProducto: form.nombreProducto.trim(),
        descripcionProducto: form.descripcionProducto.trim(),
        precioProducto: parseFloat(form.precioProducto),
        stockProducto: parseInt(form.stockProducto),
        unidad: form.unidad,
        // ✅ CORREGIDO: Guardar PATH relativo
        imagenProducto: imagePath
      };

      console.log("📦 Payload enviado:", body);

      const response = await fetch(`${API_URL}/productos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      console.log("📊 Status creación:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Producto creado:", result);
        alert("✅ Producto creado correctamente");

        // Limpiar formulario
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
        setErrors({});
        setTouched({});
        setShowValidationSummary(false);
        
        // Redirigir después de 1 segundo
        setTimeout(() => {
          window.location.href = "/vendedor/gestionar-productos";
        }, 1000);
        
      } else {
        const error = await response.text();
        console.error("❌ Error del servidor:", error);
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
    
    // Validación en tiempo real para precio y stock
    if (name === "precioProducto") {
      // Evitar números negativos y 0
      if (value !== "" && (parseFloat(value) <= 0 || isNaN(parseFloat(value)))) {
        setErrors(prev => ({ ...prev, [name]: "El precio debe ser mayor a 0" }));
      } else if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    }
    
    if (name === "stockProducto") {
      // Evitar números negativos y 0
      if (value !== "" && (parseInt(value) < 1 || !/^\d+$/.test(value))) {
        setErrors(prev => ({ ...prev, [name]: "El stock debe ser al menos 1 unidad" }));
      } else if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    }
    
    setForm({ ...form, [name]: value });
    
    // Marcar campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Limpiar error específico si no es precio/stock (ya se manejan arriba)
    if (errors[name] && !["precioProducto", "stockProducto"].includes(name)) {
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

  const analizarPrecio = async () => {
    if (!form.nombreProducto || form.nombreProducto.length < 3) {
      setPrecioIA(null);
      return;
    }

    setAnalizando(true);
    
    try {
      console.log("🤖 Enviando petición a IA para:", form.nombreProducto);
      console.log("📏 Unidad seleccionada:", form.unidad);
      console.log("💰 Precio ingresado:", parseFloat(form.precioProducto) || 0);
      
      const FASTAPI_URL = "http://localhost:8000";
      
      const datosEnvio = {
        nombre: form.nombreProducto,
        precio: parseFloat(form.precioProducto) || 0,
        unidad: form.unidad
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
          precio_ingresado: data.precio_ingresado || parseFloat(form.precioProducto) || 0,
          unidad_analizada: data.unidad || form.unidad,
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

  // Y también actualiza el useEffect para que reaccione a cambios en la unidad:
  useEffect(() => {
    if (form.nombreProducto.trim().length > 3 && form.precioProducto) {
      const timer = setTimeout(() => {
        console.log("🔄 Ejecutando análisis IA con datos:", {
          nombre: form.nombreProducto,
          precio: form.precioProducto,
          unidad: form.unidad
        });
        analizarPrecio();
      }, 1000); // Aumenta a 1 segundo para dar tiempo a escribir

      return () => clearTimeout(timer);
    } else {
      setPrecioIA(null);
    }
  }, [form.nombreProducto, form.precioProducto, form.unidad]); // ✅ Agrega form.unidad como dependencia

  useEffect(() => {
    if (form.nombreProducto.trim().length > 3) {
      const timer = setTimeout(() => {
        console.log("🔄 Ejecutando análisis IA con:", {
          nombre: form.nombreProducto,
          precio: form.precioProducto,
          unidad: form.unidad // Agrega esto para debug
        });
        analizarPrecio();
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setPrecioIA(null);
    }
  }, [form.nombreProducto, form.precioProducto, form.unidad]);

  // Contador de caracteres
  const characterCount = {
    nombre: form.nombreProducto.length,
    descripcion: form.descripcionProducto.length
  };

  // Función para determinar el color según el estado del precio
  const getEstadoColor = (estado) => {
    if (!estado) return { color: "#6B7280", border: "#D1D5DB", bg: "#F9FAFB" };
    
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes("muy_bajo") || estadoLower.includes("bajo") || estadoLower.includes("ligeramente_bajo")) {
      return { color: "#F59E0B", border: "#FCD34D", bg: "#FEF3C7" }; // Amarillo
    } else if (estadoLower.includes("adecuado")) {
      return { color: "#10B981", border: "#34D399", bg: "#D1FAE5" }; // Verde
    } else if (estadoLower.includes("ligeramente_alto") || estadoLower.includes("alto") || estadoLower.includes("muy_alto")) {
      return { color: "#EF4444", border: "#FCA5A5", bg: "#FEE2E2" }; // Rojo
    } else {
      return { color: "#6B7280", border: "#D1D5DB", bg: "#F9FAFB" }; // Gris
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

        {/* Resumen de validación */}
        {showValidationSummary && Object.keys(errors).length > 0 && (
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
                margin: "0"
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
                <li key={field} style={{ marginBottom: "4px" }}>
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
                    border: errors.imagen ? "3px dashed #EF4444" : 
                           imagePreview ? "none" : "3px dashed #FF6B35",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    minHeight: "400px"
                  }}
                  onClick={triggerFileInput}
                  data-field="imagen"
                >
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      {/* Overlay de información */}
                      <div style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        right: "10px",
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span>{selectedImageFile?.name}</span>
                        <span>{selectedImageFile ? (selectedImageFile.size / 1024 / 1024).toFixed(2) : 0} MB</span>
                      </div>
                    </>
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
                          marginBottom: "4px"
                        }}>
                          {errors.imagen ? "Error en imagen" : "Sube una imagen"}
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: errors.imagen ? "#EF4444" : "#94a3b8",
                          fontWeight: "500"
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
                  onChange={handleImage}
                  style={{ display: "none" }}
                />
                
                <div>
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
                      width: "100%"
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
                    {imagePreview ? "🔄 Cambiar Imagen" : "📤 Seleccionar Imagen"}
                  </button>
                  
                  {/* Información de validación de imagen */}
                  {selectedImageFile && !errors.imagen && (
                    <div style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      background: "#DCFCE7",
                      borderRadius: "8px",
                      border: "1px solid #BBF7D0",
                      fontSize: "12px",
                      color: "#065F46",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span>✅</span>
                      <span>
                        Imagen válida: {selectedImageFile.name} • {(selectedImageFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>
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
                        marginBottom: "0"
                      }}>
                        Nombre del Producto
                      </label>
                      <span style={{
                        fontSize: "12px",
                        color: characterCount.nombre > 80 ? "#EF4444" : 
                               characterCount.nombre > 60 ? "#F59E0B" : "#94a3b8",
                        fontWeight: "500"
                      }}>
                        {characterCount.nombre}/100
                      </span>
                    </div>
                    <input
                      type="text"
                      name="nombreProducto"
                      value={form.nombreProducto}
                      onChange={handleChange}
                      onBlur={(e) => {
                        handleBlur(e);
                        e.target.style.borderColor = errors.nombreProducto ? "#EF4444" : "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                      placeholder="Ej: Queso fresco artesanal"
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
                        gap: "6px"
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
                        marginBottom: "0"
                      }}>
                        Descripción
                      </label>
                      <span style={{
                        fontSize: "12px",
                        color: characterCount.descripcion > 400 ? "#EF4444" : 
                               characterCount.descripcion > 300 ? "#F59E0B" : "#94a3b8",
                        fontWeight: "500"
                      }}>
                        {characterCount.descripcion}/500
                      </span>
                    </div>
                    <textarea
                      name="descripcionProducto"
                      value={form.descripcionProducto}
                      onChange={handleChange}
                      onBlur={(e) => {
                        handleBlur(e);
                        e.target.style.borderColor = errors.descripcionProducto ? "#EF4444" : "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                      placeholder="Describe las características, origen, ingredientes, etc..."
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
                        gap: "6px"
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
                        marginBottom: "8px"
                      }}>
                        Categoría
                      </label>
                      <select
                        name="idCategoria"
                        value={form.idCategoria}
                        onChange={handleChange}
                        onBlur={(e) => {
                          handleBlur(e);
                          e.target.style.borderColor = errors.idCategoria ? "#EF4444" : "#e5e7eb";
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
                          <option key={c.idCategoria || c.id} value={c.idCategoria || c.id}>
                            {c.nombreCategoria || c.nombre}
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
                          gap: "6px"
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
                        marginBottom: "8px"
                      }}>
                        Subcategoría
                      </label>
                      <select
                        name="idSubcategoria"
                        value={form.idSubcategoria}
                        onChange={handleChange}
                        onBlur={(e) => {
                          handleBlur(e);
                          e.target.style.borderColor = errors.idSubcategoria ? "#EF4444" : "#e5e7eb";
                        }}
                        disabled={!form.idCategoria}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          border: errors.idSubcategoria ? "2px solid #EF4444" : 
                                 (touched.idSubcategoria && !form.idCategoria) ? "2px solid #F59E0B" :
                                 touched.idSubcategoria ? "2px solid #3B82F6" : "2px solid #e5e7eb",
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
                      {errors.idSubcategoria && (
                        <div style={{
                          marginTop: "8px",
                          fontSize: "13px",
                          color: "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          <span>❌</span>
                          {errors.idSubcategoria}
                        </div>
                      )}
                      {!form.idCategoria && touched.idSubcategoria && (
                        <div style={{
                          marginTop: "8px",
                          fontSize: "13px",
                          color: "#F59E0B",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
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
                      marginBottom: "8px"
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
                        value={form.precioProducto}
                        onChange={handleChange}
                        onBlur={(e) => {
                          handleBlur(e);
                          e.target.style.borderColor = errors.precioProducto ? "#EF4444" : "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        }}
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
                        gap: "6px"
                      }}>
                        <span>❌</span>
                        {errors.precioProducto}
                      </div>
                    )}
                    {!errors.precioProducto && form.precioProducto && (
                      <div style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "#10B981",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span>✅</span>
                        Precio válido: ${parseFloat(form.precioProducto).toFixed(2)}
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
                      marginBottom: "8px"
                    }}>
                      Stock
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      name="stockProducto"
                      value={form.stockProducto}
                      onChange={handleChange}
                      onBlur={(e) => {
                        handleBlur(e);
                        e.target.style.borderColor = errors.stockProducto ? "#EF4444" : "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
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
                        gap: "6px"
                      }}>
                        <span>❌</span>
                        {errors.stockProducto}
                      </div>
                    )}
                    {!errors.stockProducto && form.stockProducto && (
                      <div style={{
                        marginTop: "8px",
                        fontSize: "13px",
                        color: parseInt(form.stockProducto) > 50 ? "#10B981" : 
                               parseInt(form.stockProducto) > 20 ? "#F59E0B" : "#EF4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span>
                          {parseInt(form.stockProducto) > 50 ? "✅" : 
                           parseInt(form.stockProducto) > 20 ? "⚠️" : "🔄"}
                        </span>
                        {parseInt(form.stockProducto) > 50 ? "Stock suficiente" : 
                         parseInt(form.stockProducto) > 20 ? "Stock moderado" : "Stock bajo"}
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
                      <option value="gramo">Gramo (g)</option>
                      <option value="mililitro">Mililitro (ml)</option>
                      <option value="docena">Docena</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INTELIGENCIA ARTIFICIAL */}
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
                              setForm(prev => ({ ...prev, unidad: precioIA.unidad_sugerida }));
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
                              Tu Precio ({precioIA.unidad_original_usuario || form.unidad})
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
                              setForm(prev => ({ ...prev, unidad: precioIA.unidad_sugerida }));
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
                              por {precioIA.unidad_analizada || form.unidad}
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
                              por {form.unidad}
                            </div>
                          </div>

                          {/* Estado - CORREGIDO */}
                          <div style={{

                            borderRadius: "14px",
                            padding: "20px",
                            border: `2px solid ${getEstadoColor(precioIA.estado).border}`,
                            textAlign: "center",
                            background: getEstadoColor(precioIA.estado).bg
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
                            {getEstadoColor(precioIA.estado).color === "#F59E0B" ? 
                             "Puedes aumentar tu precio para igualar el mercado" :
                             getEstadoColor(precioIA.estado).color === "#EF4444" ?
                             "Considera bajar tu precio para ser más competitivo" :
                             "Este precio maximiza tus ventas manteniendo una buena rentabilidad"}
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
                              {precioIA.productos_similares.slice(0, 5).map((prod, index) => (
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
              onClick={() => {
                if (Object.keys(touched).length > 0) {
                  if (confirm("¿Está seguro de cancelar? Se perderán los datos no guardados.")) {
                    window.history.back();
                  }
                } else {
                  window.history.back();
                }
              }}
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
            boxShadow: 0 0 0 8px rgba(139, 92, 246, 0.2), 0 12px 35px rgba(139, 92, 246, 0.25);
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