import { useEffect, useState } from "react";
import { 
  Package, 
  Trash2, 
  Eye, 
  Pencil, 
  RefreshCcw, 
  X,
  Filter,
  Search,
  TrendingUp,
  PlusCircle,
  MoreVertical,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Store,
  Hash,
  Edit2,
  Save,
  Image as ImageIcon,
  Camera,
  EyeOff,
  Eye as EyeOn,
  RefreshCw,
  Scale,
  Tag,
  BarChart,
  Check,
  AlertTriangle,
  Info,
  Ban,
  Lock,
  Unlock,
  ShieldAlert
} from "lucide-react";
import Notificaciones from "../../components/Notificaciones";
import useNotification from "../../hooks/useNotification";
import API_URL from "../config/api";

export default function ProductosAdmin() {

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});

  const [categoriaSel, setCategoriaSel] = useState("");
  const [subcategoriaSel, setSubcategoriaSel] = useState("");
  const [vendedorSel, setVendedorSel] = useState("");
  const [estadoSel, setEstadoSel] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [modalData, setModalData] = useState(null);
  const [productoParaDesactivar, setProductoParaDesactivar] = useState(null);
  const [productoParaReactivar, setProductoParaReactivar] = useState(null);
  const [alertaDesactivar, setAlertaDesactivar] = useState(false);
  const [alertaReactivar, setAlertaReactivar] = useState(false);
  
  // NUEVO: Hook de notificaciones
  const {
    notificacion,
    setNotificacion,
    notificaciones
  } = useNotification();

  // =================== Círculos flotantes ===================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",
        "rgba(52, 211, 153, 0.15)",
        "rgba(59, 130, 246, 0.15)",
        "rgba(168, 85, 247, 0.15)",
        "rgba(239, 68, 68, 0.15)",
        "rgba(245, 158, 11, 0.15)",
        "rgba(14, 165, 233, 0.15)",
        "rgba(236, 72, 153, 0.15)"
      ];
      
      for (let i = 0; i < 8; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 4 + 2 + "px"
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
    }, 35000);

    return () => clearInterval(interval);
  }, []);

  // =================== Cargar Categorías ===================
  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    try {
      const res = await fetch(`${API_URL}/categorias`);
      const data = await res.json();
      setCategorias(data);
    } catch (e) {
      console.error("Error cargando categorías:", e);
    }
  }

  // =================== Cargar Subcategorías ===================
  useEffect(() => {
    if (categoriaSel) {
      cargarSubcategorias(categoriaSel);
    } else {
      setSubcategorias([]);
    }
  }, [categoriaSel]);

  async function cargarSubcategorias(idCategoria) {
    try {
      const res = await fetch(`${API_URL}/subcategorias/categoria/${idCategoria}`);
      const data = await res.json();
      setSubcategorias(data);
    } catch (e) {
      console.error("Error cargando subcategorías:", e);
    }
  }

  // =================== Cargar Vendedores ===================
  useEffect(() => {
    cargarVendedores();
  }, []);

  async function cargarVendedores() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/vendedor/listar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setVendedores(data);
    } catch (e) {
      console.error("Error cargando vendedores:", e);
    }
  }

  // =================== Cargar Productos CON BORRADO LÓGICO ===================
  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    setLoading(true);
    try {
      notificaciones.info(
        "Cargando productos...",
        "Obteniendo datos del catálogo",
        "caja"
      );

      const res = await fetch(`${API_URL}/productos/admin/listar`); // Endpoint para admin
      const raw = await res.text();

      if (!raw || raw.trim() === "") {
        console.error("⚠️ El backend devolvió una respuesta vacía.");
        setProductos([]);
        notificaciones.advertencia(
          "Catálogo vacío",
          "No se encontraron productos en el sistema",
          "caja"
        );
        return;
      }

      const data = JSON.parse(raw);
      
      // Procesar productos con URL de imagen completa
      const productosProcesados = data.map(producto => {
        // Determinar la URL de la imagen
        let imagenUrl = null;
        
        if (producto.imagenProducto && producto.imagenProducto !== "string") {
          if (producto.imagenProducto.startsWith('http')) {
            imagenUrl = producto.imagenProducto;
          } else if (producto.imagenProducto.includes('.')) {
            imagenUrl = `${API_URL}/uploads/${producto.imagenProducto}`;
          }
        }
        
        // Asegurar que los campos de borrado lógico existan
        return {
          ...producto,
          imagenUrl: imagenUrl,
          activo: producto.activo !== undefined ? producto.activo : true,
          fechaDesactivacion: producto.fechaDesactivacion || null,
          motivoDesactivacion: producto.motivoDesactivacion || null,
          unidad: producto.unidad || "Unidad" // Valor por defecto
        };
      });
      
      setProductos(productosProcesados);
      
      // Mostrar notificación de éxito
      notificaciones.exito(
        "Productos cargados", 
        `Se cargaron ${productosProcesados.length} productos correctamente`,
        "check"
      );

    } catch (e) {
      console.error("❌ Error cargando productos:", e);
      notificaciones.error(
        "Error al cargar productos", 
        "No se pudieron obtener los datos del catálogo",
        "alerta"
      );
    }

    setLoading(false);
  }

  // =================== Función para obtener imagen del producto ===================
  const obtenerImagenProducto = (producto) => {
    if (producto.imagenUrl) {
      return producto.imagenUrl;
    }
    
    if (producto.imagenProducto && producto.imagenProducto !== "string") {
      if (producto.imagenProducto.startsWith('http')) {
        return producto.imagenProducto;
      } else if (producto.imagenProducto.includes('.')) {
        return `${API_URL}/uploads/${producto.imagenProducto}`;
      }
    }
    
    return null;
  };

  // =================== Función para mostrar placeholder de imagen ===================
  const ImagenProducto = ({ producto, style }) => {
    const imagenUrl = obtenerImagenProducto(producto);
    
    if (imagenUrl) {
      return (
        <img 
          src={imagenUrl} 
          alt={producto.nombreProducto}
          style={{
            ...style,
            objectFit: 'cover',
            borderRadius: '8px'
          }}
          onError={(e) => {
            console.error(`Error cargando imagen para producto ${producto.idProducto}:`, imagenUrl);
            e.target.style.display = 'none';
            e.target.parentNode.querySelector('.image-placeholder').style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div 
        className="image-placeholder"
        style={{
          ...style,
          background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        <Camera size={style.width ? parseInt(style.width) / 3 : 20} />
      </div>
    );
  };

  // =================== FILTROS CON BORRADO LÓGICO ===================
  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = 
      p.nombreProducto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombreCategoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombreSubcategoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombreEmpresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.idProducto?.toString().includes(busqueda);
    
    const f1 = categoriaSel ? p.idCategoria === Number(categoriaSel) : true;
    const f2 = subcategoriaSel ? p.idSubcategoria === Number(subcategoriaSel) : true;
    const f3 = vendedorSel ? p.idVendedor === Number(vendedorSel) : true;
    const f4 = estadoSel ? p.estado === estadoSel : true;
    
    return coincideBusqueda && f1 && f2 && f3 && f4;
  });

  // =================== Estadísticas ===================
  const totalProductos = productos.length;
  const productosActivos = productos.filter(p => p.activo === true).length;
  const productosInactivos = productos.filter(p => p.activo === false).length;
  const productosBajoStock = productos.filter(p => p.stockProducto <= 10 && p.stockProducto > 0).length;
  const productosSinStock = productos.filter(p => p.stockProducto === 0).length;
  const totalVendedores = [...new Set(productos.map(p => p.idVendedor))].length;
  const productosConImagen = productos.filter(p => obtenerImagenProducto(p)).length;

  // NUEVO: Función para mostrar alerta de desactivación
  function mostrarAlertaDesactivar(producto) {
    setProductoParaDesactivar(producto);
    setAlertaDesactivar(true);
  }

  // NUEVO: Función para mostrar alerta de reactivación
  function mostrarAlertaReactivar(producto) {
    setProductoParaReactivar(producto);
    setAlertaReactivar(true);
  }

  // NUEVO: Función para cerrar alertas
  function cerrarAlertaDesactivar() {
    setAlertaDesactivar(false);
    setProductoParaDesactivar(null);
  }

  function cerrarAlertaReactivar() {
    setAlertaReactivar(false);
    setProductoParaReactivar(null);
  }

  // =================== BORRADO LÓGICO - DESACTIVAR PRODUCTO ===================
  const realizarDesactivacion = async () => {
    if (!productoParaDesactivar) return;
    
    const { idProducto, nombreProducto } = productoParaDesactivar;

    try {
      const token = localStorage.getItem("token");
      
      // Mostrar notificación de proceso
      notificaciones.info(
        "Desactivando producto...",
        `Procesando solicitud para ${nombreProducto}`,
        "reloj"
      );

      const res = await fetch(`${API_URL}/productos/${idProducto}/desactivar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo: "Desactivado por administrador" })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Actualizar el estado local
        setProductos(prev => prev.map(p => 
          p.idProducto === idProducto ? { 
            ...p, 
            activo: false, 
            estado: "Inactivo",
            motivoDesactivacion: "Desactivado por administrador",
            fechaDesactivacion: new Date().toISOString()
          } : p
        ));
        
        // Mostrar notificación de éxito
        notificaciones.advertencia(
          "⚠️ Producto desactivado",
          `${nombreProducto} ha sido deshabilitado del catálogo`,
          "bloqueo"
        );
        
        cerrarAlertaDesactivar();
      } else {
        notificaciones.error(
          "Error al desactivar",
          data.error || "No se pudo desactivar el producto",
          "error"
        );
        cerrarAlertaDesactivar();
      }
    } catch (e) {
      console.error("Error desactivando:", e);
      notificaciones.error(
        "Error de conexión",
        "No se pudo conectar con el servidor",
        "alerta"
      );
      cerrarAlertaDesactivar();
    }
  };

  // =================== BORRADO LÓGICO - REACTIVAR PRODUCTO ===================
  const realizarReactivacion = async () => {
    if (!productoParaReactivar) return;
    
    const { idProducto, nombreProducto } = productoParaReactivar;

    try {
      const token = localStorage.getItem("token");
      
      // Mostrar notificación de proceso
      notificaciones.info(
        "Reactivando producto...",
        `Procesando solicitud para ${nombreProducto}`,
        "reloj"
      );

      const res = await fetch(`${API_URL}/productos/${idProducto}/reactivar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        // Actualizar el estado local
        setProductos(prev => prev.map(p => 
          p.idProducto === idProducto ? { 
            ...p, 
            activo: true, 
            estado: "Disponible",
            motivoDesactivacion: null,
            fechaDesactivacion: null
          } : p
        ));
        
        // Mostrar notificación de éxito
        notificaciones.exito(
          "✅ Producto reactivado",
          `${nombreProducto} ahora está disponible en el catálogo`,
          "check"
        );
        
        cerrarAlertaReactivar();
      } else {
        notificaciones.error(
          "Error al reactivar",
          data.error || "No se pudo reactivar el producto",
          "error"
        );
        cerrarAlertaReactivar();
      }
    } catch (e) {
      console.error("Error reactivando:", e);
      notificaciones.error(
        "Error de conexión",
        "No se pudo conectar con el servidor",
        "alerta"
      );
      cerrarAlertaReactivar();
    }
  };

  // =================== FUNCIONES DE EDICIÓN (SOLO NOMBRE Y PRECIO) ===================
  function iniciarEdicion(producto) {
    // Solo editar nombre y precio, NO stock ni unidad
    setEditando(producto.idProducto);
    setFormEdit({
      id: producto.idProducto,
      nombreProducto: producto.nombreProducto || "",
      precioProducto: producto.precioProducto || "",
    });
    
    notificaciones.info(
      "Modo edición",
      `Editando producto: ${producto.nombreProducto}`,
      "edit"
    );
  }

  function cancelarEdicion() {
    const producto = productos.find(p => p.idProducto === editando);
    if (producto) {
      notificaciones.info(
        "Edición cancelada",
        `No se guardaron cambios para ${producto.nombreProducto}`,
        "x"
      );
    }
    setEditando(null);
    setFormEdit({});
  }

  async function guardarEdicion() {
    // Validaciones
    if (!formEdit.nombreProducto.trim()) {
      notificaciones.advertencia(
        "Nombre requerido",
        "El nombre del producto no puede estar vacío",
        "alerta"
      );
      return;
    }
    
    if (!formEdit.precioProducto || formEdit.precioProducto <= 0) {
      notificaciones.advertencia(
        "Precio inválido",
        "El precio debe ser mayor a cero",
        "dinero"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Mostrar notificación de proceso
      notificaciones.info(
        "Guardando cambios...",
        "Actualizando información del producto",
        "reloj"
      );
      
      const res = await fetch(`${API_URL}/productos/${formEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreProducto: formEdit.nombreProducto,
          precioProducto: formEdit.precioProducto
        })
      });

      if (res.ok) {
        // Actualizar localmente
        setProductos(prev => prev.map(p => 
          p.idProducto === formEdit.id ? { 
            ...p, 
            nombreProducto: formEdit.nombreProducto,
            precioProducto: formEdit.precioProducto
          } : p
        ));
        
        // Mostrar notificación de éxito
        notificaciones.exito(
          "✅ Producto actualizado",
          "Los cambios se han guardado correctamente",
          "check"
        );
        cancelarEdicion();
      } else {
        const error = await res.json();
        notificaciones.error(
          "Error al guardar",
          error.error || "No se pudo actualizar el producto",
          "error"
        );
      }
    } catch (e) {
      console.error("Error guardando:", e);
      notificaciones.error(
        "Error de conexión",
        "No se pudo conectar con el servidor",
        "alerta"
      );
    }
  }

  // =================== LIMPIAR FILTROS ===================
  function limpiarFiltros() {
    setCategoriaSel("");
    setSubcategoriaSel("");
    setVendedorSel("");
    setEstadoSel("");
    setBusqueda("");
    
    notificaciones.info(
      "Filtros limpiados",
      "Se restablecieron todos los filtros de búsqueda",
      "filter"
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <Notificaciones 
          notificacion={notificacion} 
          setNotificacion={setNotificacion}
          position="bottom-right"
          autoClose={5000}
          showProgress={true}
          pauseOnHover={true}
        />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingContent}>
            <h3 style={styles.loadingTitle}>Cargando productos...</h3>
            <p style={styles.loadingText}>Obteniendo datos del sistema</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Componente de Notificaciones */}
      <Notificaciones 
        notificacion={notificacion} 
        setNotificacion={setNotificacion}
        position="bottom-right"
        autoClose={5000}
        showProgress={true}
        pauseOnHover={true}
      />

      {/* ALERTA PARA DESACTIVAR PRODUCTO */}
      {alertaDesactivar && productoParaDesactivar && (
        <div style={styles.alertaOverlay}>
          <div style={styles.alertaModal}>
            <div style={styles.alertaHeader}>
              <div style={{...styles.alertaIcono, backgroundColor: `${styles.colors.warning}20`, color: styles.colors.warning}}>
                <EyeOff size={48} />
              </div>
              <h3 style={styles.alertaTitulo}>¿Desactivar producto?</h3>
            </div>
            
            <div style={styles.alertaContenido}>
              <p style={styles.alertaMensaje}>¿Confirmas desactivar "{productoParaDesactivar.nombreProducto}"?</p>
              <p style={styles.alertaDetalles}>El producto será removido del catálogo público y no estará disponible para compras.</p>
              
              <div style={{...styles.alertaAdvertencia, borderColor: styles.colors.warning, backgroundColor: `${styles.colors.warning}10`}}>
                <ShieldAlert size={16} style={{color: styles.colors.warning}} />
                <span style={{fontWeight: 'bold', color: styles.colors.warning}}>IMPORTANTE: Los usuarios no podrán ver ni comprar este producto</span>
              </div>
              
              <div style={styles.alertaConsecuencias}>
                <h4 style={styles.consecuenciasTitulo}>Consecuencias:</h4>
                <ul style={styles.consecuenciasLista}>
                  <li>✓ No visible en el catálogo público</li>
                  <li>✓ No disponible para compras</li>
                  <li>✓ Conserva todos sus datos</li>
                  <li>✓ Puede reactivarse en cualquier momento</li>
                </ul>
              </div>
            </div>
            
            <div style={styles.alertaBotones}>
              <button
                onClick={cerrarAlertaDesactivar}
                style={styles.alertaBotonCancelar}
              >
                Cancelar
              </button>
              <button
                onClick={realizarDesactivacion}
                style={{...styles.alertaBotonAccion, backgroundColor: styles.colors.warning}}
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA PARA REACTIVAR PRODUCTO */}
      {alertaReactivar && productoParaReactivar && (
        <div style={styles.alertaOverlay}>
          <div style={styles.alertaModal}>
            <div style={styles.alertaHeader}>
              <div style={{...styles.alertaIcono, backgroundColor: `${styles.colors.success}20`, color: styles.colors.success}}>
                <RefreshCw size={48} />
              </div>
              <h3 style={styles.alertaTitulo}>¿Reactivar producto?</h3>
            </div>
            
            <div style={styles.alertaContenido}>
              <p style={styles.alertaMensaje}>¿Confirmas reactivar "{productoParaReactivar.nombreProducto}"?</p>
              <p style={styles.alertaDetalles}>El producto volverá a estar disponible en el catálogo público.</p>
              
              <div style={{...styles.alertaAdvertencia, borderColor: styles.colors.success, backgroundColor: `${styles.colors.success}10`}}>
                <CheckCircle size={16} style={{color: styles.colors.success}} />
                <span style={{fontWeight: 'bold', color: styles.colors.success}}>El producto será visible y disponible para compras</span>
              </div>
              
              <div style={styles.alertaConsecuencias}>
                <h4 style={styles.consecuenciasTitulo}>Consecuencias:</h4>
                <ul style={styles.consecuenciasLista}>
                  <li>✓ Visible en el catálogo público</li>
                  <li>✓ Disponible para compras</li>
                  <li>✓ Aparecerá en búsquedas</li>
                  <li>✓ Puede agregarse al carrito</li>
                </ul>
              </div>
            </div>
            
            <div style={styles.alertaBotones}>
              <button
                onClick={cerrarAlertaReactivar}
                style={styles.alertaBotonCancelar}
              >
                Cancelar
              </button>
              <button
                onClick={realizarReactivacion}
                style={{...styles.alertaBotonAccion, backgroundColor: styles.colors.success}}
              >
                Reactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header con diseño igual al Dashboard */}
      <div style={styles.headerContainer}>
        {circlePositions.map(circle => (
          <div 
            key={circle.id}
            style={{
              ...styles.floatingCircle,
              top: `${circle.top}%`,
              left: `${circle.left}%`,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              background: circle.color,
              animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
              animationDelay: circle.animationDelay,
              filter: `blur(${circle.blur})`
            }}
          />
        ))}
        
        <div style={styles.headerContent}>
          <div style={styles.headerIconLarge}>
            <Package size={40} />
          </div>
          
          <div style={styles.headerTitleContainer}>
            <h1 style={styles.dashboardHeaderTitle}>
              Gestión de Productos
            </h1>
            <p style={styles.headerDescription}>
              Sistema MercadoLocal • {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div style={styles.refreshButtonContainer}>
            <button
              style={styles.refreshButton}
              onClick={() => {
                cargarProductos();
              }}
              disabled={loading}
            >
              <RefreshCcw size={18} /> {loading ? "Actualizando..." : "Actualizar catálogo"}
            </button>
            <div style={styles.timeInfo}>
              <Calendar size={14} />
              Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - CON BORRADO LÓGICO */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTopColor: '#8B5CF6'}}>
          <div style={{...styles.statIcon, backgroundColor: '#8B5CF620', color: '#8B5CF6'}}>
            <Package size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalProductos}</h3>
            <p style={styles.statLabel}>PRODUCTOS TOTALES</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> Registrados
            </span>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#10B981'}}>
          <div style={{...styles.statIcon, backgroundColor: '#10B98120', color: '#10B981'}}>
            <CheckCircle size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{productosActivos}</h3>
            <p style={styles.statLabel}>ACTIVOS</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {productosActivos > 0 ? `${Math.round((productosActivos/totalProductos)*100)}% del total` : "0%"}
            </span>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#F59E0B'}}>
          <div style={{...styles.statIcon, backgroundColor: '#F59E0B20', color: '#F59E0B'}}>
            <AlertCircle size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{productosBajoStock}</h3>
            <p style={styles.statLabel}>BAJO STOCK</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {productosBajoStock > 0 ? `${Math.round((productosBajoStock/totalProductos)*100)}% del total` : "0%"}
            </span>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#6B7280'}}>
          <div style={{...styles.statIcon, backgroundColor: '#6B728020', color: '#6B7280'}}>
            <EyeOff size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{productosInactivos}</h3>
            <p style={styles.statLabel}>INACTIVOS</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {productosInactivos > 0 ? `${Math.round((productosInactivos/totalProductos)*100)}% del total` : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda CON ESTADO */}
      <div style={styles.filterContainer}>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría, vendedor o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterGroup}>
          <div style={styles.filterSelect}>
            <Filter size={16} style={{ marginRight: '8px' }} />
            <select 
              value={categoriaSel} 
              onChange={(e) => {
                setCategoriaSel(e.target.value);
                setSubcategoriaSel("");
              }}
              style={styles.select}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.idCategoria} value={c.idCategoria}>
                  {c.nombreCategoria}
                </option>
              ))}
            </select>
          </div>
          
          <div style={styles.filterSelect}>
            <Filter size={16} style={{ marginRight: '8px' }} />
            <select 
              value={subcategoriaSel} 
              onChange={(e) => setSubcategoriaSel(e.target.value)}
              disabled={!categoriaSel}
              style={{
                ...styles.select,
                cursor: categoriaSel ? "pointer" : "not-allowed",
                background: categoriaSel ? "white" : "#f9fafb",
                opacity: categoriaSel ? 1 : 0.6
              }}
            >
              <option value="">Todas las subcategorías</option>
              {subcategorias.map(sc => (
                <option key={sc.idSubcategoria} value={sc.idSubcategoria}>
                  {sc.nombreSubcategoria}
                </option>
              ))}
            </select>
          </div>
          
          <div style={styles.filterSelect}>
            <Filter size={16} style={{ marginRight: '8px' }} />
            <select 
              value={vendedorSel} 
              onChange={(e) => setVendedorSel(e.target.value)}
              style={styles.select}
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map(v => (
                <option key={v.idVendedor} value={v.idVendedor}>
                  {v.nombreEmpresa}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterSelect}>
            <Filter size={16} style={{ marginRight: '8px' }} />
            <select 
              value={estadoSel} 
              onChange={(e) => setEstadoSel(e.target.value)}
              style={styles.select}
            >
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Agotado">Agotado</option>
              <option value="Stock Bajo">Stock Bajo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contador y Botón Limpiar */}
      <div style={styles.filterActions}>
        <div style={styles.counter}>
          <Hash size={14} />
          <span>Mostrando <strong style={{color: '#FF6B35'}}>{productosFiltrados.length}</strong> de <strong style={{color: '#FF6B35'}}>{totalProductos}</strong> productos</span>
          <span style={{marginLeft: '16px', color: '#10B981', fontSize: '13px'}}>
            <CheckCircle size={12} style={{marginRight: '4px'}} />
            {productosActivos} activos
          </span>
          <span style={{marginLeft: '16px', color: '#6B7280', fontSize: '13px'}}>
            <EyeOff size={12} style={{marginRight: '4px'}} />
            {productosInactivos} inactivos
          </span>
        </div>
        <button
          onClick={limpiarFiltros}
          style={styles.clearButton}
        >
          <X size={14} />
          Limpiar filtros
        </button>
      </div>

      {/* Tabla de Productos CON BORRADO LÓGICO */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            Catálogo de Productos <span style={styles.tableCount}>({productosFiltrados.length})</span>
          </h3>
        </div>

        <div style={styles.tableWrapper}>
          {productosFiltrados.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📦</div>
              <h4 style={styles.emptyTitle}>No se encontraron productos</h4>
              <p style={styles.emptyText}>
                {busqueda || categoriaSel || subcategoriaSel || vendedorSel || estadoSel
                  ? "Intenta con otros filtros de búsqueda" 
                  : "No hay productos registrados en el sistema"}
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.tableCellHead}>ID</th>
                  <th style={styles.tableCellHead}>Imagen</th>
                  <th style={styles.tableCellHead}>Producto</th>
                  <th style={styles.tableCellHead}>Precio</th>
                  <th style={styles.tableCellHead}>Stock/Unidad</th>
                  <th style={styles.tableCellHead}>Estado</th>
                  <th style={styles.tableCellHead}>Categoría</th>
                  <th style={styles.tableCellHead}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr 
                    key={p.idProducto} 
                    style={{
                      ...styles.tableRow,
                      backgroundColor: !p.activo ? '#f8f9fa' : 
                                      p.stockProducto === 0 ? '#FEF2F2' : 
                                      p.stockProducto <= 10 ? '#FFF9E6' : 'transparent',
                      opacity: !p.activo ? 0.7 : 1,
                      borderLeft: !p.activo ? '4px solid #6B7280' :
                                  p.stockProducto === 0 ? '4px solid #EF4444' : 
                                  p.stockProducto <= 10 ? '4px solid #F59E0B' : 'none'
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.idCell}>
                        <span style={styles.idNumber}>#{p.idProducto}</span>
                        {!p.activo && (
                          <span style={styles.inactiveBadge}>INACTIVO</span>
                        )}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.imageContainer}>
                        <ImagenProducto 
                          producto={p} 
                          style={styles.productImage}
                        />
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      {editando === p.idProducto ? (
                        <div style={styles.editInputs}>
                          <input
                            type="text"
                            value={formEdit.nombreProducto}
                            onChange={(e) => setFormEdit({...formEdit, nombreProducto: e.target.value})}
                            placeholder="Nombre del producto"
                            style={styles.editInput}
                          />
                        </div>
                      ) : (
                        <div style={styles.productInfo}>
                          <div>
                            <div style={styles.productName}>
                              {p.nombreProducto}
                            </div>
                            {p.unidad && (
                              <div style={styles.unitInfo}>
                                <Scale size={12} style={{ marginRight: '6px', color: '#8B5CF6' }} />
                                Unidad: {p.unidad}
                              </div>
                            )}
                            {p.nombreEmpresa && (
                              <div style={styles.vendorInfo}>
                                <Store size={12} style={{ marginRight: '6px', color: '#10B981' }} />
                                {p.nombreEmpresa}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    
                    <td style={styles.tableCell}>
                      {editando === p.idProducto ? (
                        <input
                          type="number"
                          value={formEdit.precioProducto}
                          onChange={(e) => setFormEdit({...formEdit, precioProducto: e.target.value})}
                          placeholder="Precio"
                          style={styles.editInput}
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <div style={styles.priceCell}>
                          <span style={styles.price}>
                            ${Number(p.precioProducto).toFixed(2)}
                          </span>
                          <span style={styles.unitPrice}>
                            por {p.unidad?.toLowerCase() || 'unidad'}
                          </span>
                        </div>
                      )}
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.stockUnitContainer}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: p.stockProducto > 10 ? '#10B98120' : 
                                        p.stockProducto === 0 ? '#EF444420' : '#F59E0B20',
                          color: p.stockProducto > 10 ? '#10B981' : 
                                 p.stockProducto === 0 ? '#EF4444' : '#F59E0B',
                          borderColor: p.stockProducto > 10 ? '#10B98140' : 
                                     p.stockProducto === 0 ? '#EF444440' : '#F59E0B40'
                        }}>
                          {p.stockProducto === 0 ? <X size={12} /> : 
                           p.stockProducto <= 10 ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                          {p.stockProducto} {p.unidad?.toLowerCase() || 'unidades'}
                        </span>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: !p.activo ? '#6B728020' :
                                        p.estado === 'Disponible' ? '#10B98120' : 
                                        p.estado === 'Agotado' ? '#F59E0B20' : 
                                        p.estado === 'Stock Bajo' ? '#F59E0B20' : '#6B728020',
                        color: !p.activo ? '#6B7280' :
                               p.estado === 'Disponible' ? '#10B981' : 
                               p.estado === 'Agotado' ? '#F59E0B' : 
                               p.estado === 'Stock Bajo' ? '#F59E0B' : '#6B7280',
                        borderColor: !p.activo ? '#6B728040' :
                                     p.estado === 'Disponible' ? '#10B98140' : 
                                     p.estado === 'Agotado' ? '#F59E0B40' : '#6B728040'
                      }}>
                        {!p.activo ? <EyeOff size={12} /> :
                         p.estado === 'Disponible' ? <CheckCircle size={12} /> :
                         p.estado === 'Agotado' ? <X size={12} /> :
                         p.estado === 'Stock Bajo' ? <AlertCircle size={12} /> : <EyeOff size={12} />}
                        {!p.activo ? 'Inactivo' : p.estado}
                      </span>
                    </td>
                    
                    <td style={styles.tableCell}>
                      {p.nombreCategoria && (
                        <div style={styles.categoryInfo}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: '#8B5CF620',
                            color: '#8B5CF6',
                            borderColor: '#8B5CF640'
                          }}>
                            {p.nombreCategoria}
                          </span>
                          {p.nombreSubcategoria && (
                            <div style={styles.subcategory}>
                              <Tag size={10} style={{ marginRight: '4px' }} />
                              {p.nombreSubcategoria}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td style={styles.tableCell}>
                      {editando === p.idProducto ? (
                        <div style={styles.editActions}>
                          <button
                            onClick={guardarEdicion}
                            style={styles.saveButton}
                          >
                            <Save size={14} />
                            Guardar
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            style={styles.cancelButton}
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div style={styles.actions}>
                          <button
                            onClick={() => setModalData(p)}
                            style={styles.actionButton}
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {p.activo ? (
                            <>
                              <button
                                onClick={() => iniciarEdicion(p)}
                                style={{...styles.actionButton, backgroundColor: '#F59E0B10', color: '#F59E0B'}}
                                title="Editar nombre/precio"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => mostrarAlertaDesactivar(p)}
                                style={{...styles.actionButton, backgroundColor: '#EF444410', color: '#EF4444'}}
                                title="Deshabilitar producto"
                              >
                                <EyeOff size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => mostrarAlertaReactivar(p)}
                              style={{...styles.actionButton, backgroundColor: '#10B98110', color: '#10B981'}}
                              title="Reactivar producto"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {productosFiltrados.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Mostrando {productosFiltrados.length} de {totalProductos} productos
              {productosActivos > 0 && ` • ${productosActivos} activos`}
              {productosInactivos > 0 && ` • ${productosInactivos} inactivos`}
              {productosBajoStock > 0 && ` • ${productosBajoStock} con stock bajo`}
            </div>
            <div style={styles.paginationControls}>
              <button style={styles.paginationButton} disabled>Anterior</button>
              <span style={styles.paginationPage}>1</span>
              <button style={styles.paginationButton}>Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalles CON BORRADO LÓGICO */}
      {modalData && (
        <div
          style={styles.modalOverlay}
          onClick={() => setModalData(null)}
        >
          <div
            style={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div style={styles.modalImageLarge}>
                <ImagenProducto 
                  producto={modalData} 
                  style={styles.modalImage}
                />
              </div>
              <div>
                <h2 style={styles.modalTitle}>{modalData.nombreProducto}</h2>
                <p style={styles.modalSubtitle}>ID: #{modalData.idProducto}</p>
                {!modalData.activo && (
                  <span style={styles.modalInactiveBadge}>
                    <EyeOff size={12} /> Producto Inactivo
                  </span>
                )}
              </div>
              <button
                onClick={() => setModalData(null)}
                style={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalGrid}>
              <div style={styles.modalItem}>
                <span style={styles.modalLabel}>Precio:</span>
                <span style={styles.modalValuePrice}>
                  ${Number(modalData.precioProducto).toFixed(2)} por {modalData.unidad?.toLowerCase() || 'unidad'}
                </span>
              </div>
              
              <div style={styles.modalItem}>
                <span style={styles.modalLabel}>Stock:</span>
                <span style={{
                  ...styles.modalValue,
                  color: modalData.stockProducto > 10 ? '#10B981' : 
                         modalData.stockProducto === 0 ? '#EF4444' : '#F59E0B'
                }}>
                  {modalData.stockProducto} {modalData.unidad?.toLowerCase() || 'unidades'}
                </span>
              </div>
              
              <div style={styles.modalItem}>
                <span style={styles.modalLabel}>Unidad:</span>
                <span style={styles.modalValue}>
                  <Scale size={14} style={{ marginRight: '6px' }} />
                  {modalData.unidad || 'Unidad'}
                </span>
              </div>
              
              <div style={styles.modalItem}>
                <span style={styles.modalLabel}>Estado:</span>
                <span style={{
                  ...styles.modalValue,
                  color: !modalData.activo ? '#6B7280' :
                         modalData.estado === 'Disponible' ? '#10B981' : 
                         modalData.estado === 'Agotado' ? '#F59E0B' : '#6B7280'
                }}>
                  {!modalData.activo ? 'Inactivo' : modalData.estado}
                </span>
              </div>
              
              {modalData.nombreCategoria && (
                <div style={styles.modalItem}>
                  <span style={styles.modalLabel}>Categoría:</span>
                  <span style={styles.modalValue}>{modalData.nombreCategoria}</span>
                </div>
              )}
              
              {modalData.nombreSubcategoria && (
                <div style={styles.modalItem}>
                  <span style={styles.modalLabel}>Subcategoría:</span>
                  <span style={styles.modalValue}>{modalData.nombreSubcategoria}</span>
                </div>
              )}
              
              {modalData.nombreEmpresa && (
                <div style={styles.modalItem}>
                  <span style={styles.modalLabel}>Vendedor:</span>
                  <span style={styles.modalValue}>
                    <Store size={14} style={{ marginRight: '6px' }} />
                    {modalData.nombreEmpresa}
                  </span>
                </div>
              )}
              
              {!modalData.activo && modalData.motivoDesactivacion && (
                <div style={styles.modalItem}>
                  <span style={styles.modalLabel}>Motivo desactivación:</span>
                  <span style={{...styles.modalValue, color: '#EF4444', fontSize: '13px'}}>
                    {modalData.motivoDesactivacion}
                  </span>
                </div>
              )}
              
              {!modalData.activo && modalData.fechaDesactivacion && (
                <div style={styles.modalItem}>
                  <span style={styles.modalLabel}>Desactivado el:</span>
                  <span style={{...styles.modalValue, color: '#6B7280', fontSize: '13px'}}>
                    {new Date(modalData.fechaDesactivacion).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setModalData(null)}
                style={styles.modalButtonSecondary}
              >
                Cerrar
              </button>
              
              {!modalData.activo ? (
                <button
                  onClick={() => {
                    mostrarAlertaReactivar(modalData);
                    setModalData(null);
                  }}
                  style={styles.modalButton}
                >
                  <RefreshCw size={14} />
                  Reactivar Producto
                </button>
              ) : (
                <button
                  onClick={() => {
                    mostrarAlertaDesactivar(modalData);
                    setModalData(null);
                  }}
                  style={{...styles.modalButton, backgroundColor: '#EF4444'}}
                >
                  <EyeOff size={14} />
                  Desactivar Producto
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información del Sistema */}
      <div style={styles.systemInfo}>
        <div style={styles.systemInfoContent}>
          <Shield size={16} />
          <span>
            Panel de Administración de Productos • Sistema MercadoLocal • {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Estilos globales */}
      <style>{`
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ESTILOS ACTUALIZADOS CON BORRADO LÓGICO, UNIDADES Y ALERTAS
const styles = {
  colors: {
    primary: '#FF6B35',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
  },
  
  // ALERTAS
  alertaOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.3s ease-out'
  },
  
  alertaModal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '90%',
    maxWidth: '500px',
    overflow: 'hidden',
    animation: 'slideUp 0.4s ease-out'
  },
  
  alertaHeader: {
    padding: '32px 32px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #e5e7eb'
  },
  
  alertaIcono: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    border: `2px solid currentColor`
  },
  
  alertaTitulo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  
  alertaContenido: {
    padding: '32px',
    borderBottom: '1px solid #e5e7eb'
  },
  
  alertaMensaje: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 16px 0',
    textAlign: 'center'
  },
  
  alertaDetalles: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 24px 0',
    textAlign: 'center',
    lineHeight: '1.6'
  },
  
  alertaAdvertencia: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid',
    marginBottom: '24px',
    fontSize: '15px',
    fontWeight: '500'
  },
  
  alertaConsecuencias: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  
  consecuenciasTitulo: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 12px 0'
  },
  
  consecuenciasLista: {
    margin: 0,
    paddingLeft: '20px',
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '1.8'
  },
  
  alertaBotones: {
    padding: '24px 32px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  
  alertaBotonCancelar: {
    padding: '14px 28px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  
  alertaBotonAccion: {
    padding: '14px 28px',
    backgroundColor: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px'
  },
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  loadingContent: {
    textAlign: 'center'
  },
  
  loadingTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px'
  },
  
  loadingText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  
  // Header estilo Dashboard
  headerContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb'
  },
  
  floatingCircle: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.6,
    zIndex: 1
  },
  
  headerContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  
  headerIconLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
    marginBottom: '10px'
  },
  
  headerTitleContainer: {
    textAlign: 'center',
    width: '100%'
  },
  
  dashboardHeaderTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  },
  
  headerDescription: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  },
  
  refreshButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#FF6B35',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '140px'
  },
  
  timeInfo: {
    padding: '8px 16px',
    background: '#f3f4f6',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  
  statCard: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    borderTopWidth: '4px',
    borderTopStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease'
  },
  
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  statContent: {
    flex: 1
  },
  
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 6px 0',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280'
  },
  
  filterContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  
  searchBox: {
    flex: 1,
    maxWidth: '400px',
    position: 'relative'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  filterGroup: {
    display: 'flex',
    gap: '12px'
  },
  
  filterSelect: {
    display: 'flex',
    alignItems: 'center'
  },
  
  select: {
    padding: '10px 32px 10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
    minWidth: '140px',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  filterActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  
  counter: {
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  
  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  
  tableCount: {
    color: '#6b7280',
    fontWeight: '500'
  },
  
  tableActions: {
    display: 'flex',
    gap: '12px'
  },
  
  exportButton: {
    padding: '8px 16px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  tableWrapper: {
    overflowX: 'auto',
    minHeight: '200px'
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: '0.5'
  },
  
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  
  emptyText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    maxWidth: '300px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1100px'
  },
  
  tableHead: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  
  tableCellHead: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'all 0.2s ease'
  },
  
  tableCell: {
    padding: '20px',
    fontSize: '14px',
    color: '#374151'
  },
  
  idCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  
  idNumber: {
    fontWeight: '700',
    color: '#FF6B35',
    fontSize: '13px'
  },
  
  inactiveBadge: {
    background: '#6B728020',
    color: '#6B7280',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'inline-block'
  },
  
  // Estilos para imágenes
  imageContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative'
  },
  
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  
  productName: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px'
  },
  
  unitInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#8B5CF6',
    marginBottom: '4px'
  },
  
  vendorInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  },
  
  editInputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  editInput: {
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  priceCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  
  price: {
    fontWeight: '700',
    color: '#FF6B35',
    fontSize: '16px'
  },
  
  unitPrice: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  
  stockUnitContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid transparent'
  },
  
  categoryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  
  subcategory: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '2px'
  },
  
  actions: {
    display: 'flex',
    gap: '8px'
  },
  
  actionButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  editActions: {
    display: 'flex',
    gap: '8px'
  },
  
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#f3f4f6',
    color: '#6b7280',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  pagination: {
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  paginationInfo: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  paginationButton: {
    padding: '8px 16px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '100px'
  },
  
  paginationPage: {
    padding: '8px 16px',
    background: '#FF6B35',
    color: 'white',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'center'
  },
  
  systemInfo: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  systemInfoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  
  // Modal mejorado
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    position: 'relative'
  },
  
  modalImageLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0
  },
  
  modalImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0',
    flex: 1
  },
  
  modalSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  
  modalInactiveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#EF444420',
    color: '#EF4444',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '4px'
  },
  
  modalClose: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '8px'
  },
  
  modalGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px'
  },
  
  modalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6'
  },
  
  modalLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
    minWidth: '120px'
  },
  
  modalValue: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    textAlign: 'right'
  },
  
  modalValuePrice: {
    fontSize: '18px',
    color: '#FF6B35',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  
  modalButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1
  },
  
  modalButtonSecondary: {
    padding: '10px 20px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1
  }
};