import { useEffect, useState } from "react";
import { 
  UserCheck, 
  UserX, 
  RefreshCcw, 
  Edit2, 
  Trash2, 
  X, 
  Save,
  Users,
  Shield,
  Mail,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  AlertTriangle,
  Info,
  ShieldAlert,
  Ban,
  Lock,
  Unlock
} from "lucide-react";
import Notificaciones from "../../components/Notificaciones";
import useNotification from "../../hooks/useNotification";
import API_URL from "../../config/api";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [miIdUsuario, setMiIdUsuario] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [circlePositions, setCirclePositions] = useState([]);
  const [userName, setUserName] = useState("");
  
  // Estados para alertas
  const [alertaActivar, setAlertaActivar] = useState(null);
  const [alertaEliminar, setAlertaEliminar] = useState(null);
  const [usuarioParaActivar, setUsuarioParaActivar] = useState(null);
  const [usuarioParaEliminar, setUsuarioParaEliminar] = useState(null);
  
  // NUEVO: Hook de notificaciones
  const {
    notificacion,
    setNotificacion,
    notificaciones
  } = useNotification();

  useEffect(() => {
    // Generar círculos flotantes
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
    
    // Obtener nombre del usuario desde localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const nombre = user.nombre || '';
        const apellido = user.apellido || '';
        setUserName(nombre && apellido ? `${nombre} ${apellido}` : 'Administrador');
      } catch (e) {
        setUserName("Administrador");
      }
    }
    
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

  const getToken = () => {
    const token = localStorage.getItem("token") || "";
    if (token && !miIdUsuario) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMiIdUsuario(payload.idUsuario);
      } catch (e) {
        console.error("Error decodificando token:", e);
        notificaciones.error("Error de autenticación", "No se pudo verificar tu sesión", "bloqueo");
      }
    }
    return token;
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  async function obtenerUsuarios() {
    setLoading(true);
    const token = getToken();

    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const raw = await res.text();
      if (!raw) {
        setUsuarios([]);
        setLoading(false);
        return;
      }

      const data = JSON.parse(raw);
      // Mapear "Inactivo" a "Suspendido" para mostrar
      const usuariosMapeados = data.map(usuario => ({
        ...usuario,
        estado: usuario.estado === "Inactivo" ? "Suspendido" : usuario.estado
      }));
      setUsuarios(usuariosMapeados);
      
      // Mostrar notificación de éxito
      notificaciones.exito(
        "Usuarios cargados", 
        `Se han cargado ${usuariosMapeados.length} usuarios correctamente`,
        "banco"
      );
    } catch (e) {
      console.error("Error cargando usuarios:", e);
      notificaciones.error(
        "Error al cargar usuarios", 
        "No se pudieron cargar los datos de usuarios. Verifica tu conexión.",
        "alerta"
      );
    }

    setLoading(false);
  }

  // NUEVO: Función para mostrar alerta de activación/desactivación
  function mostrarAlertaActivar(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    setUsuarioParaActivar({ id, usuario });
    
    if (usuario.estado === "Activo") {
      setAlertaActivar({
        tipo: "warning",
        titulo: "¿Suspender usuario?",
        mensaje: `¿Confirmas suspender a ${usuario.nombre} ${usuario.apellido}?`,
        detalles: "El usuario no podrá acceder al sistema hasta que lo reactives.",
        icono: <Lock size={48} />,
        color: "#F59E0B",
        accion: "Suspender",
        cancelar: "Cancelar"
      });
    } else {
      setAlertaActivar({
        tipo: "success",
        titulo: "¿Activar usuario?",
        mensaje: `¿Confirmas activar a ${usuario.nombre} ${usuario.apellido}?`,
        detalles: "El usuario podrá acceder al sistema normalmente.",
        icono: <Unlock size={48} />,
        color: "#10B981",
        accion: "Activar",
        cancelar: "Cancelar"
      });
    }
  }

  // NUEVO: Función para mostrar alerta de eliminación
  function mostrarAlertaEliminar(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    setUsuarioParaEliminar({ id, usuario });
    
    setAlertaEliminar({
      tipo: "danger",
      titulo: "¿Eliminar usuario?",
      mensaje: `¿Confirmas eliminar permanentemente a ${usuario.nombre} ${usuario.apellido}?`,
      detalles: "⚠️ Esta acción NO se puede deshacer. Todos los datos del usuario serán eliminados.",
      icono: <Ban size={48} />,
      color: "#EF4444",
      accion: "Eliminar",
      cancelar: "Cancelar",
      advertencia: "ADVERTENCIA: Esta acción es permanente"
    });
  }

  // NUEVO: Función para cerrar alertas
  function cerrarAlertaActivar() {
    setAlertaActivar(null);
    setUsuarioParaActivar(null);
  }

  function cerrarAlertaEliminar() {
    setAlertaEliminar(null);
    setUsuarioParaEliminar(null);
  }

  // NUEVO: Función que realiza el cambio de estado
  async function realizarCambioEstado() {
    if (!usuarioParaActivar) return;
    
    const { id, usuario } = usuarioParaActivar;
    const token = getToken();

    try {
      const res = await fetch(`${API}/${id}/estado`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const nuevoEstado = usuario.estado === "Activo" ? "Suspendido" : "Activo";
        
        // Mostrar notificación específica según el cambio
        if (nuevoEstado === "Activo") {
          notificaciones.exito(
            "✅ Usuario activado",
            `${usuario.nombre} ${usuario.apellido} ahora puede acceder al sistema`,
            "usuario"
          );
        } else {
          notificaciones.advertencia(
            "⚠️ Usuario suspendido",
            `${usuario.nombre} ${usuario.apellido} ha sido suspendido del sistema`,
            "bloqueo"
          );
        }
        
        cerrarAlertaActivar();
        obtenerUsuarios();
      } else if (res.status === 403) {
        notificaciones.advertencia(
          "Permisos insuficientes",
          "No tienes permisos para cambiar el estado de este usuario",
          "bloqueo"
        );
        cerrarAlertaActivar();
      } else {
        notificaciones.error(
          "Error al cambiar estado",
          "No se pudo actualizar el estado del usuario",
          "error"
        );
        cerrarAlertaActivar();
      }
    } catch (e) {
      notificaciones.error(
        "Error de conexión",
        "No se pudo conectar con el servidor",
        "alerta"
      );
      cerrarAlertaActivar();
    }
  }

  // NUEVO: Función que realiza la eliminación
  async function realizarEliminacion() {
    if (!usuarioParaEliminar) return;
    
    const { id, usuario } = usuarioParaEliminar;
    const token = getToken();

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        notificaciones.exito(
          "🗑️ Usuario eliminado",
          `${usuario.nombre} ${usuario.apellido} ha sido eliminado permanentemente del sistema`,
          "check"
        );
        cerrarAlertaEliminar();
        obtenerUsuarios();
      } else if (res.status === 403) {
        notificaciones.advertencia(
          "Permisos insuficientes",
          "No tienes permisos para eliminar este usuario",
          "bloqueo"
        );
        cerrarAlertaEliminar();
      } else {
        notificaciones.error(
          "Error al eliminar",
          "No se pudo eliminar el usuario del sistema",
          "error"
        );
        cerrarAlertaEliminar();
      }
    } catch (e) {
      notificaciones.error(
        "Error de conexión",
        "No se pudo conectar con el servidor",
        "alerta"
      );
      cerrarAlertaEliminar();
    }
  }

  function iniciarEdicion(usuario) {
    if (miIdUsuario === usuario.id) {
      notificaciones.advertencia(
        "⚠️ Edición restringida",
        "Por seguridad, no puedes editar tu propio usuario en este panel",
        "bloqueo"
      );
      return;
    }

    setEditando(usuario.id);
    setFormEdit({
      id: usuario.id,
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      correo: usuario.correo || "",
      fechaNacimiento: usuario.fechaNacimiento || "",
      rol: usuario.rol || (usuario.esAdministrador ? "ADMIN" : "CONSUMIDOR"),
      estado: usuario.estado || "Activo",
      contrasena: ""
    });

    notificaciones.info(
      "✏️ Modo edición",
      `Ahora puedes editar los datos de ${usuario.nombre} ${usuario.apellido}`,
      "edit"
    );
  }

  function cancelarEdicion() {
    const usuario = usuarios.find(u => u.id === editando);
    if (usuario) {
      notificaciones.info(
        "Edición cancelada",
        `No se guardaron los cambios para ${usuario.nombre} ${usuario.apellido}`,
        "x"
      );
    }
    setEditando(null);
    setFormEdit({});
  }

  async function guardarEdicion() {
    const token = getToken();
    const usuarioOriginal = usuarios.find(u => u.id === editando);
    
    if (!token) {
      notificaciones.advertencia(
        "Sesión requerida",
        "Debes iniciar sesión para guardar cambios",
        "bloqueo"
      );
      return;
    }

    if (miIdUsuario === editando) {
      notificaciones.advertencia(
        "Edición restringida",
        "No puedes editar tu propio usuario por seguridad",
        "bloqueo"
      );
      return;
    }

    if (!formEdit.nombre || !formEdit.apellido || !formEdit.correo) {
      notificaciones.advertencia(
        "Campos incompletos",
        "Completa todos los campos obligatorios (nombre, apellido y correo)",
        "alerta"
      );
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEdit.correo)) {
      notificaciones.advertencia(
        "Correo inválido",
        "Ingresa un correo electrónico válido",
        "correo"
      );
      return;
    }

    try {
      // Mapear "Suspendido" de vuelta a "Inactivo" para la API
      const datosParaAPI = {
        ...formEdit,
        estado: formEdit.estado === "Suspendido" ? "Inactivo" : formEdit.estado
      };

      notificaciones.info(
        "Guardando cambios...",
        "Actualizando datos del usuario",
        "reloj"
      );

      const res = await fetch(`${API}/${editando}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(datosParaAPI)
      });

      if (res.ok) {
        notificaciones.exito(
          "✅ Cambios guardados",
          `Usuario ${formEdit.nombre} ${formEdit.apellido} actualizado correctamente`,
          "check"
        );
        obtenerUsuarios();
        cancelarEdicion();
      } else if (res.status === 403) {
        notificaciones.advertencia(
          "Permisos insuficientes",
          "No tienes permisos para editar usuarios",
          "bloqueo"
        );
      } else {
        notificaciones.error(
          "Error al guardar",
          "No se pudieron guardar los cambios en el servidor",
          "error"
        );
      }
    } catch (e) {
      notificaciones.error(
        "Error de conexión",
        "No se pudo conectar con el servidor para guardar los cambios",
        "alerta"
      );
    }
  }

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = 
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.id?.toString().includes(busqueda);
    
    const coincideRol = filtroRol === "todos" || usuario.rol === filtroRol;
    const coincideEstado = filtroEstado === "todos" || usuario.estado === filtroEstado;
    
    return coincideBusqueda && coincideRol && coincideEstado;
  });

  // Estadísticas
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.estado === "Activo").length;
  const usuariosSuspendidos = usuarios.filter(u => u.estado === "Suspendido").length;
  const usuariosAdmin = usuarios.filter(u => u.rol === "ADMIN").length;
  const usuariosVendedor = usuarios.filter(u => u.rol === "VENDEDOR").length;

  // NUEVO: Función para exportar datos
  const handleExportarCSV = () => {
    if (usuariosFiltrados.length === 0) {
      notificaciones.advertencia(
        "Sin datos",
        "No hay datos para exportar con los filtros actuales",
        "caja"
      );
      return;
    }

    try {
      const headers = ['ID', 'Nombre', 'Apellido', 'Correo', 'Rol', 'Estado', 'Fecha Registro'];
      const csvData = usuariosFiltrados.map(user => [
        user.id,
        user.nombre || '',
        user.apellido || '',
        user.correo || '',
        user.rol || '',
        user.estado || '',
        user.fechaRegistro || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      notificaciones.exito(
        "📥 Exportación exitosa",
        `Se exportaron ${usuariosFiltrados.length} usuarios a CSV`,
        "descarga"
      );
    } catch (error) {
      notificaciones.error(
        "Error al exportar",
        "No se pudo generar el archivo CSV",
        "error"
      );
    }
  };

  // NUEVO: Función para limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroRol("todos");
    setFiltroEstado("todos");
    
    notificaciones.info(
      "Filtros limpiados",
      "Se restablecieron todos los filtros de búsqueda",
      "filter"
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Notificaciones 
          notificacion={notificacion} 
          setNotificacion={setNotificacion}
          position="bottom-right"
          autoClose={5000}
          showProgress={true}
          pauseOnHover={true}
        />
        <div style={styles.spinner}></div>
        <div style={styles.loadingContent}>
          <h3 style={styles.loadingTitle}>Cargando usuarios...</h3>
          <p style={styles.loadingText}>Obteniendo datos del sistema</p>
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

      {/* ALERTA PARA ACTIVAR/DESACTIVAR USUARIO */}
      {alertaActivar && (
        <div style={styles.alertaOverlay}>
          <div style={styles.alertaModal}>
            <div style={styles.alertaHeader}>
              <div style={{...styles.alertaIcono, backgroundColor: `${alertaActivar.color}20`, color: alertaActivar.color}}>
                {alertaActivar.icono}
              </div>
              <h3 style={styles.alertaTitulo}>{alertaActivar.titulo}</h3>
            </div>
            
            <div style={styles.alertaContenido}>
              <p style={styles.alertaMensaje}>{alertaActivar.mensaje}</p>
              <p style={styles.alertaDetalles}>{alertaActivar.detalles}</p>
              
              {alertaActivar.tipo === "warning" && (
                <div style={{...styles.alertaAdvertencia, borderColor: alertaActivar.color}}>
                  <AlertTriangle size={16} style={{color: alertaActivar.color}} />
                  <span>El usuario no podrá acceder al sistema</span>
                </div>
              )}
            </div>
            
            <div style={styles.alertaBotones}>
              <button
                onClick={cerrarAlertaActivar}
                style={styles.alertaBotonCancelar}
              >
                {alertaActivar.cancelar}
              </button>
              <button
                onClick={realizarCambioEstado}
                style={{...styles.alertaBotonAccion, backgroundColor: alertaActivar.color}}
              >
                {alertaActivar.accion}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA PARA ELIMINAR USUARIO */}
      {alertaEliminar && (
        <div style={styles.alertaOverlay}>
          <div style={styles.alertaModal}>
            <div style={styles.alertaHeader}>
              <div style={{...styles.alertaIcono, backgroundColor: `${alertaEliminar.color}20`, color: alertaEliminar.color}}>
                {alertaEliminar.icono}
              </div>
              <h3 style={styles.alertaTitulo}>{alertaEliminar.titulo}</h3>
            </div>
            
            <div style={styles.alertaContenido}>
              <p style={styles.alertaMensaje}>{alertaEliminar.mensaje}</p>
              <p style={styles.alertaDetalles}>{alertaEliminar.detalles}</p>
              
              <div style={{...styles.alertaAdvertencia, borderColor: alertaEliminar.color, backgroundColor: `${alertaEliminar.color}10`}}>
                <ShieldAlert size={16} style={{color: alertaEliminar.color}} />
                <span style={{fontWeight: 'bold', color: alertaEliminar.color}}>{alertaEliminar.advertencia}</span>
              </div>
              
              <div style={styles.alertaConsecuencias}>
                <h4 style={styles.consecuenciasTitulo}>Esta acción eliminará:</h4>
                <ul style={styles.consecuenciasLista}>
                  <li>✓ Todos los datos personales del usuario</li>
                  <li>✓ Historial de compras/ventas relacionadas</li>
                  <li>✓ Acceso permanente al sistema</li>
                  <li>✓ Información almacenada en la base de datos</li>
                </ul>
              </div>
            </div>
            
            <div style={styles.alertaBotones}>
              <button
                onClick={cerrarAlertaEliminar}
                style={styles.alertaBotonCancelar}
              >
                {alertaEliminar.cancelar}
              </button>
              <button
                onClick={realizarEliminacion}
                style={{...styles.alertaBotonAccion, backgroundColor: alertaEliminar.color}}
              >
                {alertaEliminar.accion}
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
            <Users size={40} />
          </div>
          
          <div style={styles.headerTitleContainer}>
            <h1 style={styles.dashboardHeaderTitle}>
              Gestión de Usuarios
            </h1>
            <p style={styles.headerDescription}>
              {userName || 'Administrador'} • {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div style={styles.refreshButtonContainer}>
            <button
              style={styles.refreshButton}
              onClick={obtenerUsuarios}
              disabled={loading}
            >
              <RefreshCcw size={18} /> {loading ? "Actualizando..." : "Actualizar datos"}
            </button>
            <div style={styles.timeInfo}>
              <Calendar size={14} />
              Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTopColor: '#8B5CF6'}}>
          <div style={{...styles.statIcon, backgroundColor: '#8B5CF620', color: '#8B5CF6'}}>
            <Shield size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{usuariosAdmin}</h3>
            <p style={styles.statLabel}>ADMINISTRADORES</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {usuariosAdmin > 0 ? `${Math.round((usuariosAdmin/totalUsuarios)*100)}% del total` : "0%"}
            </span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTopColor: '#F59E0B'}}>
          <div style={{...styles.statIcon, backgroundColor: '#F59E0B20', color: '#F59E0B'}}>
            <Package size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{usuariosVendedor}</h3>
            <p style={styles.statLabel}>VENDEDORES</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {usuariosVendedor > 0 ? `${Math.round((usuariosVendedor/totalUsuarios)*100)}% del total` : "0%"}
            </span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTopColor: '#FF6B35'}}>
          <div style={{...styles.statIcon, backgroundColor: '#FF6B3520', color: '#FF6B35'}}>
            <Users size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalUsuarios}</h3>
            <p style={styles.statLabel}>USUARIOS TOTALES</p>
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
            <h3 style={styles.statNumber}>{usuariosActivos}</h3>
            <p style={styles.statLabel}>USUARIOS ACTIVOS</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {usuariosActivos > 0 ? `+${Math.round((usuariosActivos/totalUsuarios)*100)}%` : "+0%"}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div style={styles.filterContainer}>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, correo o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterGroup}>
          <div style={styles.filterSelect}>
            <Filter size={16} style={{ marginRight: '8px' }} />
            <select 
              value={filtroRol} 
              onChange={(e) => setFiltroRol(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="VENDEDOR">Vendedor</option>
              <option value="CONSUMIDOR">Consumidor</option>
            </select>
          </div>
          <div style={styles.filterSelect}>
            <Filter size={16} style={{ marginRight: '8px' }} />
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>
          {(busqueda || filtroRol !== "todos" || filtroEstado !== "todos") && (
            <button
              onClick={limpiarFiltros}
              style={styles.limpiarFiltrosButton}
              title="Limpiar filtros"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            Usuarios Registrados <span style={styles.tableCount}>({usuariosFiltrados.length})</span>
          </h3>
          <div style={styles.tableActions}>
            <button 
              style={styles.exportButton}
              onClick={handleExportarCSV}
              disabled={usuariosFiltrados.length === 0}
            >
              Exportar CSV
            </button>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.tableCellHead}>ID</th>
                <th style={styles.tableCellHead}>Usuario</th>
                <th style={styles.tableCellHead}>Correo</th>
                <th style={styles.tableCellHead}>Rol</th>
                <th style={styles.tableCellHead}>Estado</th>
                <th style={styles.tableCellHead}>Fecha Registro</th>
                <th style={styles.tableCellHead}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyState}>
                    <div style={styles.emptyIcon}>👤</div>
                    <h4 style={styles.emptyTitle}>No se encontraron usuarios</h4>
                    <p style={styles.emptyText}>
                      {busqueda || filtroRol !== "todos" || filtroEstado !== "todos" 
                        ? "Intenta con otros filtros de búsqueda" 
                        : "No hay usuarios registrados en el sistema"}
                    </p>
                    {(busqueda || filtroRol !== "todos" || filtroEstado !== "todos") && (
                      <button
                        onClick={limpiarFiltros}
                        style={styles.limpiarFiltrosEmptyButton}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr 
                    key={usuario.id} 
                    style={{
                      ...styles.tableRow,
                      backgroundColor: usuario.id === miIdUsuario ? '#FFF9E6' : 
                                      usuario.estado === 'Suspendido' ? '#FEF2F2' : 'transparent',
                      borderLeft: usuario.id === miIdUsuario ? '4px solid #FF6B35' : 
                                 usuario.estado === 'Suspendido' ? '4px solid #EF4444' : 'none'
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.idCell}>
                        <span style={styles.idNumber}>#{usuario.id}</span>
                        {usuario.id === miIdUsuario && (
                          <span style={styles.youBadge}>
                            <Info size={10} style={{marginRight: '3px'}} />
                            Tú
                          </span>
                        )}
                        {usuario.estado === 'Suspendido' && (
                          <span style={styles.suspendedBadge}>
                            <AlertTriangle size={10} style={{marginRight: '3px'}} />
                            SUSPENDIDO
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      {editando === usuario.id ? (
                        <div style={styles.editInputs}>
                          <input
                            type="text"
                            value={formEdit.nombre}
                            onChange={(e) => setFormEdit({...formEdit, nombre: e.target.value})}
                            placeholder="Nombre"
                            style={styles.editInput}
                          />
                          <input
                            type="text"
                            value={formEdit.apellido}
                            onChange={(e) => setFormEdit({...formEdit, apellido: e.target.value})}
                            placeholder="Apellido"
                            style={styles.editInput}
                          />
                        </div>
                      ) : (
                        <div style={styles.userInfo}>
                          <div style={{
                            ...styles.userAvatar,
                            opacity: usuario.estado === 'Suspendido' ? 0.7 : 1,
                            background: usuario.estado === 'Suspendido' 
                              ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' 
                              : 'linear-gradient(135deg, #FF6B35, #FF8E53)'
                          }}>
                            {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                          </div>
                          <div>
                            <div style={styles.userName}>
                              {usuario.nombre} {usuario.apellido}
                            </div>
                            <div style={styles.userDetails}>
                              <Calendar size={12} style={{ marginRight: '4px' }} />
                              {usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento).toLocaleDateString('es-ES') : 'No especificada'}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    
                    <td style={styles.tableCell}>
                      {editando === usuario.id ? (
                        <input
                          type="email"
                          value={formEdit.correo}
                          onChange={(e) => setFormEdit({...formEdit, correo: e.target.value})}
                          placeholder="correo@ejemplo.com"
                          style={styles.emailInput}
                        />
                      ) : (
                        <div style={styles.emailCell}>
                          <Mail size={14} style={{ marginRight: '8px', color: '#6b7280' }} />
                          {usuario.correo}
                        </div>
                      )}
                    </td>
                    
                    <td style={styles.tableCell}>
                      {editando === usuario.id ? (
                        <select
                          value={formEdit.rol}
                          onChange={(e) => setFormEdit({...formEdit, rol: e.target.value})}
                          style={styles.roleSelect}
                        >
                          <option value="CONSUMIDOR">Consumidor</option>
                          <option value="VENDEDOR">Vendedor</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      ) : (
                        <span style={{
                          ...styles.badge,
                          backgroundColor: usuario.rol === 'ADMIN' ? '#8B5CF620' : 
                                        usuario.rol === 'VENDEDOR' ? '#F59E0B20' : '#3B82F620',
                          color: usuario.rol === 'ADMIN' ? '#8B5CF6' : 
                                 usuario.rol === 'VENDEDOR' ? '#F59E0B' : '#3B82F6',
                          borderColor: usuario.rol === 'ADMIN' ? '#8B5CF640' : 
                                     usuario.rol === 'VENDEDOR' ? '#F59E0B40' : '#3B82F640',
                          opacity: usuario.estado === 'Suspendido' ? 0.7 : 1
                        }}>
                          {usuario.rol === 'ADMIN' ? <Shield size={12} /> : 
                           usuario.rol === 'VENDEDOR' ? <Package size={12} /> : <Users size={12} />}
                          {usuario.rol}
                        </span>
                      )}
                    </td>
                    
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: usuario.estado === 'Activo' ? '#10B98120' : '#EF444420',
                        color: usuario.estado === 'Activo' ? '#10B981' : '#EF4444',
                        borderColor: usuario.estado === 'Activo' ? '#10B98140' : '#EF444440'
                      }}>
                        {usuario.estado === 'Activo' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {usuario.estado}
                      </span>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <span style={styles.dateText}>
                        {usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString('es-ES') : 
                         usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento).toLocaleDateString('es-ES') : 
                         'No disponible'}
                      </span>
                    </td>
                    
                    <td style={styles.tableCell}>
                      {editando === usuario.id ? (
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
                            onClick={() => iniciarEdicion(usuario)}
                            style={styles.actionButton}
                            title="Editar usuario"
                            disabled={usuario.id === miIdUsuario}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => mostrarAlertaActivar(usuario.id)}
                            style={{
                              ...styles.actionButton,
                              backgroundColor: usuario.estado === 'Activo' ? '#F59E0B10' : '#10B98110',
                              color: usuario.estado === 'Activo' ? '#F59E0B' : '#10B981'
                            }}
                            title={usuario.estado === 'Activo' ? 'Suspender usuario' : 'Activar usuario'}
                            disabled={usuario.id === miIdUsuario}
                          >
                            {usuario.estado === 'Activo' ? <Lock size={16} /> : <Unlock size={16} />}
                          </button>
                          {usuario.id !== miIdUsuario && (
                            <button
                              onClick={() => mostrarAlertaEliminar(usuario.id)}
                              style={{...styles.actionButton, backgroundColor: '#EF444410', color: '#EF4444'}}
                              title="Eliminar usuario"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <button style={{...styles.actionButton, backgroundColor: '#F3F4F6', color: '#6b7280'}}>
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {usuariosFiltrados.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Mostrando {usuariosFiltrados.length} de {totalUsuarios} usuarios
              {usuariosSuspendidos > 0 && ` • ${usuariosSuspendidos} suspendido${usuariosSuspendidos !== 1 ? 's' : ''}`}
            </div>
            <div style={styles.paginationControls}>
              <button style={styles.paginationButton} disabled>Anterior</button>
              <span style={styles.paginationPage}>1</span>
              <button style={styles.paginationButton}>Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Información del Sistema */}
      <div style={styles.systemInfo}>
        <div style={styles.systemInfoContent}>
          <Shield size={16} />
          <span>
            Panel de Administración de Usuarios • Sistema MercadoLocal • {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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

// Estilos mejorados con alertas
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
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
    zIndex: 9999,
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
  
  // ESTILOS EXISTENTES
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
    marginBottom: '24px',
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
    gap: '12px',
    alignItems: 'center'
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
  
  limpiarFiltrosButton: {
    padding: '10px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
  
  tableWrapper: {
    overflowX: 'auto'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px'
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
  
  youBadge: {
    background: '#FF6B3520',
    color: '#FF6B35',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content'
  },
  
  suspendedBadge: {
    background: '#EF444420',
    color: '#EF4444',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content'
  },
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0
  },
  
  userName: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px'
  },
  
  userDetails: {
    fontSize: '12px',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center'
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
  
  emailCell: {
    display: 'flex',
    alignItems: 'center'
  },
  
  emailInput: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    outline: 'none'
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
  
  roleSelect: {
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
    minWidth: '140px',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  
  dateText: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500'
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
    margin: '0 0 16px 0',
    maxWidth: '300px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  limpiarFiltrosEmptyButton: {
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
  }
};