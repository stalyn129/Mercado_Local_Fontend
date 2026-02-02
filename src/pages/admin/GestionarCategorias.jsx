import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight, 
  RefreshCcw, 
  Search,
  Folder,
  Shield,
  Calendar,
  TrendingUp,
  Hash,
  AlertCircle,
  Package,
  File,
  CheckCircle,
  XCircle
} from 'lucide-react';
import API_URL from "../config/api";

// NUEVO: Importar componentes de notificación
import Notificaciones from '../../components/Notificaciones.jsx';
import useNotification from '../../hooks/useNotification.jsx';

// Función auxiliar para fetch con timeout
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export default function GestionarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState(null);
  const [expandidas, setExpandidas] = useState({});
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [formData, setFormData] = useState({
    nombreCategoria: '',
    descripcionCategoria: '',
    esSubcategoria: false,
    categoriaId: null
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [circlePositions, setCirclePositions] = useState([]);
  
  // Estados para productos asociados
  const [categoriasConProductos, setCategoriasConProductos] = useState({});
  const [subcategoriasConProductos, setSubcategoriasConProductos] = useState({});

  // NUEVO: Usar el hook de notificaciones
  const {
    notificacion,
    setNotificacion,
    notificaciones,
    ocultarNotificacion
  } = useNotification();

  const generarAbreviatura = (nombre) => {
    if (!nombre || !nombre.trim()) return 'CAT';
    
    const nombreLimpio = nombre.trim();
    
    const abreviaturasComunes = {
      'frutas y verduras': 'FV',
      'lácteos': 'LT',
      'carnes': 'CR',
      'pescados': 'PS',
      'panadería': 'PB',
      'bebidas': 'BB',
      'granos': 'GR',
      'legumbres': 'LG',
      'cereales': 'CR',
      'productos de granja': 'PG',
      'miel': 'ML',
      'conservas': 'CV',
      'mermeladas': 'MR',
      'hierbas': 'HB',
      'especias': 'ES',
      'verduras': 'VD',
      'frutas': 'FT'
    };
    
    const nombreLower = nombreLimpio.toLowerCase();
    
    for (const [key, abrev] of Object.entries(abreviaturasComunes)) {
      if (nombreLower.includes(key)) {
        return abrev;
      }
    }
    
    const palabras = nombreLimpio.split(' ');
    
    if (palabras.length === 1) {
      return nombreLimpio.substring(0, 3).toUpperCase();
    } else {
      return palabras
        .filter(palabra => palabra.length > 2)
        .slice(0, 3)
        .map(palabra => palabra[0])
        .join('')
        .toUpperCase();
    }
  };

  const verificarAutenticacion = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // NUEVO: Reemplazar alert con notificación
      notificaciones.advertencia(
        "Sesión expirada",
        "Por favor, inicia sesión nuevamente.",
        "bloqueo"
      );
      
      setTimeout(() => {
        window.location.href = '/LoginModal';
      }, 2000);
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expira = payload.exp * 1000;
      if (Date.now() >= expira) {
        // NUEVO: Reemplazar alert con notificación
        notificaciones.advertencia(
          "Sesión expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          "reloj"
        );
        
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/LoginModal';
        }, 2000);
        return false;
      }
    } catch (error) {
      console.log('Token no es JWT o error al decodificar');
    }
    
    return true;
  };

  // Función para verificación manual (alternativa)
  const verificarManualProductos = async (id, esSubcategoria = false) => {
    const token = localStorage.getItem('token');
    if (!token) return true; // Por seguridad
    
    const url = esSubcategoria 
      ? `${API_URL}/subcategorias/${id}/productos`
      : `${API_URL}/categorias/${id}/productos`;
    
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, 3000);
      
      if (response.ok) {
        const productos = await response.json();
        // Verificar si es array y tiene elementos
        return Array.isArray(productos) && productos.length > 0;
      }
      return true; // Por seguridad, asumir que sí tiene
    } catch (error) {
      console.error('Error en verificación manual:', error);
      return true; // Por seguridad
    }
  };

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

  useEffect(() => {
    cargarCategorias();
  }, []);

  // =================== FUNCIÓN PRINCIPAL MEJORADA ===================
  const cargarCategorias = async (mostrarNotificacion = true) => {
    try {
      setCargando(true);
      setError(null);
      
      // NUEVO: Mostrar notificación de carga
      if (mostrarNotificacion) {
        notificaciones.info("Cargando categorías", "Obteniendo datos del servidor...", "reloj");
      }
      
      if (!verificarAutenticacion()) {
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Cargar categorías principales
      const response = await fetchWithTimeout('${API_URL}/categorias/listar', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, 10000);
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        notificaciones.advertencia(
          "Acceso restringido",
          "No tienes permisos para acceder a esta sección",
          "bloqueo"
        );
        setTimeout(() => window.location.href = '/LoginModal', 2000);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudieron cargar las categorías'}`);
      }
      
      const categoriasData = await response.json();
      
      // Crear arrays para almacenar estados de productos
      const nuevasCategoriasConProductos = {};
      const nuevasSubcategoriasConProductos = {};
      
      // Para cada categoría, cargar sus subcategorías Y verificar productos asociados
      const categoriasConSubcategorias = await Promise.all(
        categoriasData.map(async (cat) => {
          try {
            // 1. Verificar productos de la categoría PRINCIPAL
            let tieneProductosCategoria = false;
            try {
              const verificarResponse = await fetchWithTimeout(
                `${API_URL}/categorias/${cat.idCategoria}/productos-asociados`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                },
                3000
              );
              
              if (verificarResponse.ok) {
                const resultado = await verificarResponse.json();
                
                // Interpretación detallada del resultado
                if (resultado === true || resultado === false) {
                  tieneProductosCategoria = resultado;
                } else if (typeof resultado === 'number') {
                  tieneProductosCategoria = resultado > 0;
                } else if (typeof resultado === 'object' && resultado !== null) {
                  tieneProductosCategoria = resultado.tieneProductos === true || 
                                           resultado.count > 0 || 
                                           resultado.cantidad > 0 ||
                                           resultado.existe === true;
                } else if (typeof resultado === 'string') {
                  tieneProductosCategoria = resultado.toLowerCase() === 'true' || resultado === '1';
                }
              } else {
                tieneProductosCategoria = true; // Por seguridad
              }
            } catch (error) {
              tieneProductosCategoria = true;
            }
            
            // Guardar en el estado
            nuevasCategoriasConProductos[cat.idCategoria] = tieneProductosCategoria;

            // 2. Cargar subcategorías
            const subResponse = await fetchWithTimeout(
              `${API_URL}/subcategorias/categoria/${cat.idCategoria}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              },
              5000
            );
            
            let subcategorias = [];
            if (subResponse.ok) {
              const subData = await subResponse.json();
              
              // Para cada subcategoría, verificar si tiene productos
              subcategorias = await Promise.all(
                subData.map(async (sub) => {
                  let tieneProductosSub = false;
                  
                  // PRIMERO: Intentar con el endpoint principal
                  try {
                    const verificarSubResponse = await fetchWithTimeout(
                      `${API_URL}/subcategorias/${sub.idSubcategoria}/productos-asociados`,
                      {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      },
                      3000
                    );
                    
                    if (verificarSubResponse.ok) {
                      const resultado = await verificarSubResponse.json();
                      
                      // Interpretación detallada
                      if (resultado === true || resultado === false) {
                        tieneProductosSub = resultado;
                      } else if (typeof resultado === 'number') {
                        tieneProductosSub = resultado > 0;
                      } else if (typeof resultado === 'object' && resultado !== null) {
                        tieneProductosSub = resultado.tieneProductos === true || 
                                           resultado.count > 0 || 
                                           resultado.cantidad > 0 ||
                                           resultado.existe === true;
                      } else if (typeof resultado === 'string') {
                        tieneProductosSub = resultado.toLowerCase() === 'true' || resultado === '1';
                      }
                      
                      // SEGUNDO: Verificación alternativa si el primer resultado parece incorrecto
                      if (tieneProductosSub) {
                        const verifAlternativa = await verificarManualProductos(sub.idSubcategoria, true);
                        if (!verifAlternativa) {
                          tieneProductosSub = false;
                        }
                      }
                      
                    } else {
                      tieneProductosSub = true;
                    }
                  } catch (error) {
                    tieneProductosSub = true;
                  }
                  
                  // Guardar en el estado
                  nuevasSubcategoriasConProductos[sub.idSubcategoria] = tieneProductosSub;
                  
                  return {
                    id: sub.idSubcategoria,
                    nombre: sub.nombreSubcategoria,
                    descripcion: sub.descripcionSubcategoria || '',
                    idCategoria: sub.idCategoria,
                    abreviatura: generarAbreviatura(sub.nombreSubcategoria),
                    tieneProductos: tieneProductosSub
                  };
                })
              );
            }
            
            return {
              id: cat.idCategoria,
              nombre: cat.nombreCategoria,
              descripcion: cat.descripcionCategoria,
              abreviatura: generarAbreviatura(cat.nombreCategoria),
              tieneProductos: tieneProductosCategoria,
              subcategorias: subcategorias
            };
          } catch (error) {
            console.error(`Error cargando categoría ${cat.idCategoria}:`, error);
            return {
              id: cat.idCategoria,
              nombre: cat.nombreCategoria,
              descripcion: cat.descripcionCategoria,
              abreviatura: generarAbreviatura(cat.nombreCategoria),
              tieneProductos: true,
              subcategorias: []
            };
          }
        })
      );
      
      // Actualizar todos los estados de una vez
      setCategorias(categoriasConSubcategorias);
      setCategoriasConProductos(nuevasCategoriasConProductos);
      setSubcategoriasConProductos(nuevasSubcategoriasConProductos);
      
      // NUEVO: Mostrar notificación de éxito
      if (mostrarNotificacion) {
        setTimeout(() => {
          notificaciones.exito(
            "Categorías cargadas",
            `Se cargaron ${categoriasConSubcategorias.length} categorías con éxito`,
            "caja"
          );
        }, 500);
      }
      
    } catch (error) {
      console.error('Error en cargarCategorias:', error);
      
      // NUEVO: Notificación de error
      let mensajeError = 'Error al cargar las categorías';
      if (error.message.includes('Failed to fetch') || error.name === 'AbortError') {
        mensajeError = 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose en ${API_URL}';
        notificaciones.error(
          "Error de conexión",
          mensajeError,
          "📡"
        );
      } else {
        notificaciones.error(
          "Error al cargar",
          `Error al cargar las categorías: ${error.message}`,
          "❌"
        );
      }
      
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const toggleExpandir = (id) => {
    setExpandidas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const abrirModalCrear = (esSubcategoria = false, categoriaPadreId = null) => {
    setModoEdicion(false);
    setCategoriaActual(null);
    setFormData({
      nombreCategoria: '',
      descripcionCategoria: '',
      esSubcategoria: esSubcategoria,
      categoriaId: categoriaPadreId
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (categoria, esSubcategoria = false, categoriaPadreId = null) => {
    setModoEdicion(true);
    setCategoriaActual(categoria);
    setFormData({
      nombreCategoria: categoria.nombre,
      descripcionCategoria: categoria.descripcion,
      esSubcategoria: esSubcategoria,
      categoriaId: categoriaPadreId
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setCategoriaActual(null);
    setFormData({
      nombreCategoria: '',
      descripcionCategoria: '',
      esSubcategoria: false,
      categoriaId: null
    });
  };

  const iniciarEdicionInline = (categoria, esSubcategoria = false, categoriaPadreId = null) => {
    setEditando(categoria.id);
    setFormEdit({
      id: categoria.id,
      nombreCategoria: categoria.nombre || '',
      descripcionCategoria: categoria.descripcion || '',
      esSubcategoria: esSubcategoria,
      categoriaId: categoriaPadreId
    });
  };

  const cancelarEdicionInline = () => {
    setEditando(null);
    setFormEdit({});
    // NUEVO: Notificación de cancelación
    notificaciones.info("Edición cancelada", "Los cambios no se han guardado", "❌");
  };

  const guardarEdicionInline = async () => {
    if (!formEdit.nombreCategoria.trim()) {
      // NUEVO: Reemplazar alert con notificación
      notificaciones.advertencia("Campo requerido", "El nombre es requerido", "⚠️");
      return;
    }
    
    if (!verificarAutenticacion()) {
      return;
    }
    
    try {
      const url = formEdit.esSubcategoria 
        ? `${API_URL}/subcategorias/actualizar/${formEdit.id}`
        : `${API_URL}/categorias/actualizar/${formEdit.id}`;
      
      const body = formEdit.esSubcategoria ? {
        nombreSubcategoria: formEdit.nombreCategoria,
        descripcionSubcategoria: formEdit.descripcionCategoria,
        idCategoria: formEdit.categoriaId
      } : {
        nombreCategoria: formEdit.nombreCategoria,
        descripcionCategoria: formEdit.descripcionCategoria,
      };
      
      const token = localStorage.getItem('token');
      
      // NUEVO: Mostrar notificación de proceso
      notificaciones.info("Guardando cambios", "Actualizando la categoría...", "reloj");
      
      const response = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }, 5000);
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        notificaciones.advertencia(
          "Sesión expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          "bloqueo"
        );
        setTimeout(() => window.location.href = '/LoginModal', 2000);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      await cargarCategorias(false);
      cancelarEdicionInline();
      
      // NUEVO: Reemplazar alert con notificación de éxito
      notificaciones.exito(
        "Categoría actualizada",
        `${formEdit.esSubcategoria ? 'Subcategoría' : 'Categoría'} actualizada exitosamente`,
        "check"
      );
    } catch (error) {
      console.error('Error en guardarEdicionInline:', error);
      
      // NUEVO: Reemplazar alert con notificación de error
      notificaciones.error(
        "Error al actualizar",
        `Error al actualizar la categoría: ${error.message}`,
        "❌"
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombreCategoria.trim()) {
      // NUEVO: Reemplazar alert con notificación
      notificaciones.advertencia("Campo requerido", "El nombre es requerido", "⚠️");
      return;
    }
    
    if (!verificarAutenticacion()) {
      return;
    }
    
    try {
      const url = formData.esSubcategoria 
        ? '${API_URL}/subcategorias/crear'
        : '${API_URL}/categorias/crear';
      
      const body = formData.esSubcategoria ? {
        nombreSubcategoria: formData.nombreCategoria,
        descripcionSubcategoria: formData.descripcionCategoria,
        idCategoria: formData.categoriaId
      } : {
        nombreCategoria: formData.nombreCategoria,
        descripcionCategoria: formData.descripcionCategoria,
      };
      
      const method = modoEdicion ? 'PUT' : 'POST';
      const finalUrl = modoEdicion 
        ? (formData.esSubcategoria 
            ? `${API_URL}/subcategorias/actualizar/${categoriaActual.id}`
            : `${API_URL}/categorias/actualizar/${categoriaActual.id}`)
        : url;
      
      const token = localStorage.getItem('token');
      
      // NUEVO: Mostrar notificación de proceso
      const mensajeProceso = modoEdicion 
        ? `Actualizando ${formData.esSubcategoria ? 'subcategoría' : 'categoría'}...`
        : `Creando ${formData.esSubcategoria ? 'subcategoría' : 'categoría'}...`;
      
      notificaciones.info(
        "Procesando",
        mensajeProceso,
        "reloj"
      );
      
      const response = await fetchWithTimeout(finalUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }, 5000);
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        notificaciones.advertencia(
          "Sesión expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          "bloqueo"
        );
        setTimeout(() => window.location.href = '/LoginModal', 2000);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'Error desconocido'}`);
      }
      
      await cargarCategorias(false);
      cerrarModal();
      
      // NUEVO: Reemplazar alert con notificación de éxito
      const mensajeExito = modoEdicion 
        ? `${formData.esSubcategoria ? 'Subcategoría' : 'Categoría'} actualizada exitosamente`
        : `${formData.esSubcategoria ? 'Subcategoría' : 'Categoría'} creada exitosamente`;
      
      notificaciones.exito(
        modoEdicion ? "Actualizado" : "Creado",
        mensajeExito,
        formData.esSubcategoria ? "etiqueta" : "caja"
      );
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      
      // NUEVO: Reemplazar alert con notificación de error
      const accion = modoEdicion ? 'actualizar' : 'crear';
      notificaciones.error(
        "Error",
        `Error al ${accion} la ${formData.esSubcategoria ? 'subcategoría' : 'categoría'}: ${error.message}`,
        "❌"
      );
    }
  };

  // =================== FUNCIÓN ELIMINAR MEJORADA ===================
  const eliminarCategoria = async (id, nombre, esSubcategoria = false) => {
    if (!verificarAutenticacion()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // 1. VERIFICACIÓN DETALLADA CON EL BACKEND
      const urlVerificar = esSubcategoria 
        ? `${API_URL}/subcategorias/${id}/productos-asociados`
        : `${API_URL}/categorias/${id}/productos-asociados`;
      
      // NUEVO: Mostrar notificación de verificación
      notificaciones.info(
        "Verificando",
        `Verificando productos en ${esSubcategoria ? 'subcategoría' : 'categoría'} "${nombre}"...`,
        "reloj"
      );
      
      const responseVerificar = await fetchWithTimeout(urlVerificar, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, 5000);
      
      let tieneProductos = false;
      if (responseVerificar.ok) {
        const resultado = await responseVerificar.json();
        
        // Análisis detallado del resultado
        if (resultado === true || resultado === false) {
          tieneProductos = resultado;
        } else if (typeof resultado === 'number') {
          tieneProductos = resultado > 0;
        } else if (typeof resultado === 'object' && resultado !== null) {
          tieneProductos = resultado.tieneProductos === true || 
                          resultado.count > 0 || 
                          resultado.cantidad > 0 ||
                          resultado.existe === true;
        } else if (typeof resultado === 'string') {
          tieneProductos = resultado.toLowerCase() === 'true' || resultado === '1';
        }
        
        // VERIFICACIÓN ALTERNATIVA SI EL RESULTADO PARECE SOSPECHOSO
        if (tieneProductos) {
          const verifAlternativa = await verificarManualProductos(id, esSubcategoria);
          if (!verifAlternativa) {
            tieneProductos = false;
          }
        }
      } else {
        const errorText = await responseVerificar.text();
        console.error('Error en verificación:', errorText);
        tieneProductos = true; // Por seguridad
      }
      
      // 2. SI TIENE PRODUCTOS, MOSTRAR ERROR CON NOTIFICACIÓN
      if (tieneProductos) {
        // NUEVO: Reemplazar alert con notificación
        notificaciones.error(
          "No se puede eliminar",
          `La ${esSubcategoria ? 'subcategoría' : 'categoría'} "${nombre}" tiene productos asociados.`,
          "⚠️"
        );
        return;
      }
      
      // 3. CONFIRMACIÓN FINAL
      // Mantenemos window.confirm para la confirmación del usuario
      if (!window.confirm(`¿Estás seguro de eliminar ${esSubcategoria ? 'la subcategoría' : 'la categoría'} "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        // NUEVO: Notificación de cancelación
        notificaciones.info(
          "Eliminación cancelada",
          `La ${esSubcategoria ? 'subcategoría' : 'categoría'} no fue eliminada`,
          "❌"
        );
        return;
      }
      
      // NUEVO: Mostrar notificación de proceso de eliminación
      notificaciones.info(
        "Eliminando",
        `Eliminando ${esSubcategoria ? 'subcategoría' : 'categoría'} "${nombre}"...`,
        "reloj"
      );
      
      // 4. ELIMINAR
      const urlEliminar = esSubcategoria 
        ? `${API_URL}/subcategorias/eliminar/${id}`
        : `${API_URL}/categorias/eliminar/${id}`;
      
      const responseEliminar = await fetchWithTimeout(urlEliminar, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, 5000);
      
      if (responseEliminar.status === 401 || responseEliminar.status === 403) {
        localStorage.removeItem('token');
        notificaciones.advertencia(
          "Sesión expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          "bloqueo"
        );
        setTimeout(() => window.location.href = '/LoginModal', 2000);
        return;
      }
      
      if (responseEliminar.status === 409) {
        const errorText = await responseEliminar.text();
        // NUEVO: Reemplazar alert con notificación
        notificaciones.error(
          "Error de conflicto",
          errorText,
          "❌"
        );
        return;
      }
      
      if (!responseEliminar.ok) {
        const errorText = await responseEliminar.text();
        throw new Error(`Error ${responseEliminar.status}: ${errorText || 'Error al eliminar'}`);
      }
      
      // 5. RECARGAR Y MOSTRAR NOTIFICACIÓN DE CONFIRMACIÓN
      await cargarCategorias(false);
      
      // NUEVO: Reemplazar alert con notificación de éxito
      notificaciones.exito(
        "Eliminado exitosamente",
        `${esSubcategoria ? 'Subcategoría' : 'Categoría'} "${nombre}" eliminada exitosamente`,
        "🗑️"
      );
      
    } catch (error) {
      console.error('Error en eliminarCategoria:', error);
      
      // NUEVO: Reemplazar alert con notificación de error
      if (error.name === 'AbortError') {
        notificaciones.error(
          "Tiempo agotado",
          "Tiempo de espera agotado. Verifica la conexión con el servidor.",
          "📡"
        );
      } else {
        notificaciones.error(
          "Error al eliminar",
          `Error: ${error.message}`,
          "❌"
        );
      }
    }
  };

  // =================== FUNCIÓN PARA DEPURAR LA API ===================
  const depurarAPI = async () => {
    if (!verificarAutenticacion()) {
      return;
    }
    
    const token = localStorage.getItem('token');
    
    // NUEVO: Notificación de inicio de depuración
    notificaciones.info(
      "Depuración iniciada",
      "Iniciando depuración completa de la API...",
      "config"
    );
    
    try {
      // Depurar todas las categorías
      for (const cat of categorias) {
        console.log(`\n📋 DEPURANDO CATEGORÍA: ${cat.nombre} (ID: ${cat.id})`);
        
        // Endpoint de productos-asociados
        try {
          const response1 = await fetch(
            `${API_URL}/categorias/${cat.id}/productos-asociados`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response1.ok) {
            const resultado1 = await response1.json();
            console.log('  📊 /productos-asociados:', {
              resultado: resultado1,
              tipo: typeof resultado1
            });
          } else {
            console.error('  ❌ Error /productos-asociados:', response1.status);
          }
        } catch (error) {
          console.error('  ❌ Error en /productos-asociados:', error);
        }
        
        // Endpoint de productos (alternativo)
        try {
          const response2 = await fetch(
            `${API_URL}/categorias/${cat.id}/productos`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (response2.ok) {
            const resultado2 = await response2.json();
            console.log('  📦 /productos:', {
              esArray: Array.isArray(resultado2),
              cantidad: Array.isArray(resultado2) ? resultado2.length : 'No es array'
            });
          } else {
            console.error('  ❌ Error /productos:', response2.status);
          }
        } catch (error) {
          console.error('  ❌ Error en /productos:', error);
        }
        
        // Depurar subcategorías
        if (cat.subcategorias && cat.subcategorias.length > 0) {
          for (const sub of cat.subcategorias) {
            console.log(`\n    🍎 DEPURANDO SUBCATEGORÍA: ${sub.nombre} (ID: ${sub.id})`);
            
            // Endpoint de productos-asociados
            try {
              const response3 = await fetch(
                `${API_URL}/subcategorias/${sub.id}/productos-asociados`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (response3.ok) {
                const resultado3 = await response3.json();
                console.log('      📊 /productos-asociados:', {
                  resultado: resultado3,
                  tipo: typeof resultado3,
                  stringResult: JSON.stringify(resultado3)
                });
              } else {
                console.error('      ❌ Error /productos-asociados:', response3.status);
              }
            } catch (error) {
              console.error('      ❌ Error en /productos-asociados:', error);
            }
            
            // Endpoint de productos (alternativo)
            try {
              const response4 = await fetch(
                `${API_URL}/subcategorias/${sub.id}/productos`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (response4.ok) {
                const resultado4 = await response4.json();
                console.log('      📦 /productos:', {
                  esArray: Array.isArray(resultado4),
                  cantidad: Array.isArray(resultado4) ? resultado4.length : 'No es array',
                  contenido: Array.isArray(resultado4) && resultado4.length > 0 ? resultado4[0] : 'Vacío'
                });
              } else {
                console.error('      ❌ Error /productos:', response4.status);
              }
            } catch (error) {
              console.error('      ❌ Error en /productos:', error);
            }
          }
        }
      }
      
      console.log('\n✅ DEPURACIÓN COMPLETADA ✅');
      
      // NUEVO: Notificación de finalización
      notificaciones.exito(
        "Depuración completada",
        "Revisa la consola para ver los resultados detallados.",
        "✅"
      );
      
    } catch (error) {
      console.error('Error en depuración:', error);
      
      // NUEVO: Notificación de error en depuración
      notificaciones.error(
        "Error en depuración",
        "Error durante la depuración. Revisa la consola.",
        "❌"
      );
    }
  };

  // =================== ESTADÍSTICAS ===================
  const totalCategorias = categorias.length;
  const totalSubcategorias = categorias.reduce((acc, cat) => acc + (cat.subcategorias?.length || 0), 0);
  const categoriasSinDescripcion = categorias.filter(cat => !cat.descripcion || cat.descripcion.trim() === '').length;
  const totalElementos = totalCategorias + totalSubcategorias;

  // Contar categorías con productos
  const categoriasConProductosCount = Object.values(categoriasConProductos).filter(Boolean).length;
  const categoriasSinProductosCount = totalCategorias - categoriasConProductosCount;

  const categoriasFiltradas = categorias.filter(categoria => 
    categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    categoria.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    (categoria.abreviatura && categoria.abreviatura.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (cargando) {
    return (
      <div style={styles.loadingContainer}>
        {/* NUEVO: Componente de notificaciones */}
        <Notificaciones
          notificacion={notificacion}
          setNotificacion={setNotificacion}
          position="top-right"
          autoClose={4000}
          showProgress={true}
          pauseOnHover={true}
        />
        
        <div style={styles.spinner}></div>
        <div style={styles.loadingContent}>
          <h3 style={styles.loadingTitle}>Cargando categorías...</h3>
          <p style={styles.loadingText}>Verificando productos asociados en todas las categorías</p>
          <div style={styles.loadingProgress}>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* NUEVO: Componente de notificaciones */}
      <Notificaciones
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
      />
      
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
            <Folder size={40} />
          </div>
          
          <div style={styles.headerTitleContainer}>
            <h1 style={styles.dashboardHeaderTitle}>
              Gestión de Categorías
            </h1>
            <p style={styles.headerDescription}>
              Sistema MercadoLocal-IA • {totalElementos} elemento{totalElementos !== 1 ? 's' : ''} • Verificación automática de productos
            </p>
          </div>
          
          <div style={styles.refreshButtonContainer}>
            <button
              style={styles.refreshButton}
              onClick={() => cargarCategorias(true)}
              disabled={cargando}
            >
              <RefreshCcw size={18} /> {cargando ? "Actualizando..." : "Actualizar"}
            </button>
            <div style={styles.timeInfo}>
              <Calendar size={14} />
              Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTopColor: '#8B5CF6'}}>
          <div style={{...styles.statIcon, backgroundColor: '#8B5CF620', color: '#8B5CF6'}}>
            <Folder size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalCategorias}</h3>
            <p style={styles.statLabel}>CATEGORÍAS PRINCIPALES</p>
            <div style={styles.statSubtext}>
              <span style={{ color: '#10B981', fontWeight: '600' }}>
                {categoriasSinProductosCount} sin productos
              </span>
              <span style={{ margin: '0 4px' }}>•</span>
              <span style={{ color: '#EF4444', fontWeight: '600' }}>
                {categoriasConProductosCount} con productos
              </span>
            </div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#F59E0B'}}>
          <div style={{...styles.statIcon, backgroundColor: '#F59E0B20', color: '#F59E0B'}}>
            <File size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalSubcategorias}</h3>
            <p style={styles.statLabel}>SUBCATEGORÍAS</p>
            <div style={styles.statSubtext}>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>
                {Object.values(subcategoriasConProductos).filter(Boolean).length} con productos
              </span>
            </div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#3B82F6'}}>
          <div style={{...styles.statIcon, backgroundColor: '#3B82F620', color: '#3B82F6'}}>
            <AlertCircle size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{categoriasSinDescripcion}</h3>
            <p style={styles.statLabel}>SIN DESCRIPCIÓN</p>
            <div style={styles.statSubtext}>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>
                Requieren atención
              </span>
            </div>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#10B981'}}>
          <div style={{...styles.statIcon, backgroundColor: '#10B98120', color: '#10B981'}}>
            <Package size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalElementos}</h3>
            <p style={styles.statLabel}>TOTAL ELEMENTOS</p>
            <div style={styles.statSubtext}>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>
                Todas las categorías y subcategorías
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.filterContainer}>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o abreviatura..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterActions}>
          {busqueda && (
            <button
              onClick={() => {
                setBusqueda('');
                // NUEVO: Notificación de limpieza
                notificaciones.info("Búsqueda limpiada", "Se limpió el filtro de búsqueda", "🗑️");
              }}
              style={styles.clearButton}
            >
              <X size={14} />
              Limpiar búsqueda
            </button>
          )}
          <button
            onClick={depurarAPI}
            style={{
              ...styles.verifyButton,
              backgroundColor: '#8B5CF6'
            }}
            title="Depurar todos los endpoints de la API"
          >
            <AlertCircle size={16} />
            Depurar API
          </button>
          <button
            onClick={async () => {
              setCargando(true);
              // NUEVO: Notificación de verificación
              notificaciones.info(
                "Verificando productos",
                "Verificando productos en todas las categorías...",
                "reloj"
              );
              await cargarCategorias(false);
              // NUEVO: Notificación de éxito
              notificaciones.exito(
                "Verificación completada",
                "Revisa la consola para detalles.",
                "✅"
              );
            }}
            style={styles.verifyButton}
            title="Verificar productos en todas las categorías"
          >
            <RefreshCcw size={16} />
            Verificar Productos
          </button>
          <button
            onClick={() => {
              abrirModalCrear();
              // NUEVO: Notificación informativa
              notificaciones.info(
                "Crear categoría",
                "Completa los datos para crear una nueva categoría",
                "caja"
              );
            }}
            style={styles.addButton}
          >
            <Plus size={16} />
            Nueva Categoría
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            Catálogo de Categorías <span style={styles.tableCount}>({totalCategorias})</span>
          </h3>
          <div style={styles.tableSubtitle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
              Sin productos
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
              Con productos (no eliminable)
            </span>
          </div>
        </div>

        {error ? (
          <div style={styles.errorState}>
            <div style={styles.errorIcon}>
              <AlertCircle size={48} />
            </div>
            <h4 style={styles.errorTitle}>Error al cargar categorías</h4>
            <p style={styles.errorText}>
              {error}
            </p>
            <button onClick={() => cargarCategorias(true)} style={styles.errorButton}>
              <RefreshCcw size={16} />
              Reintentar
            </button>
          </div>
        ) : categorias.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🗂️</div>
            <h4 style={styles.emptyTitle}>No hay categorías registradas</h4>
            <p style={styles.emptyText}>
              Comienza creando tu primera categoría para organizar los productos del sistema
            </p>
            <button onClick={() => {
              abrirModalCrear();
              notificaciones.info(
                "Crear primera categoría",
                "Completa los datos para crear tu primera categoría",
                "caja"
              );
            }} style={styles.emptyButton}>
              <Plus size={16} />
              Crear primera categoría
            </button>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            {categoriasFiltradas.length === 0 ? (
              <div style={styles.noResults}>
                <Search size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                <h4 style={styles.noResultsTitle}>No se encontraron resultados</h4>
                <p style={styles.noResultsText}>
                  No hay categorías que coincidan con "{busqueda}"
                </p>
                <button onClick={() => {
                  setBusqueda('');
                  notificaciones.info("Búsqueda limpiada", "Se limpió el filtro de búsqueda", "🗑️");
                }} style={styles.noResultsButton}>
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.tableCellHead}>CATEGORÍA</th>
                    <th style={styles.tableCellHead}>DESCRIPCIÓN</th>
                    <th style={styles.tableCellHead}>SUBCATEGORÍAS</th>
                    <th style={styles.tableCellHead}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasFiltradas.map((categoria, index) => {
                    const categoriaKey = categoria.id || `cat-${index}`;
                    const tieneProductos = categoria.tieneProductos !== undefined 
                      ? categoria.tieneProductos 
                      : categoriasConProductos[categoria.id] || false;
                    
                    return (
                      <React.Fragment key={`fragment-${categoriaKey}`}>
                        <tr key={`row-${categoriaKey}`} style={{
                          ...styles.tableRow,
                          backgroundColor: tieneProductos ? '#FEF2F2' : 'transparent',
                          borderLeft: tieneProductos ? '4px solid #EF4444' : '4px solid transparent'
                        }}>
                          
                          <td style={styles.tableCell}>
                            {editando === categoria.id ? (
                              <div style={styles.editInputs}>
                                <input
                                  type="text"
                                  value={formEdit.nombreCategoria || ""}
                                  onChange={(e) => setFormEdit({ ...formEdit, nombreCategoria: e.target.value })}
                                  style={styles.editInput}
                                  placeholder="Nombre de la categoría"
                                />
                              </div>
                            ) : (
                              <div style={styles.categoryInfo}>
                                {(categoria.subcategorias?.length || 0) > 0 && (
                                  <button
                                    onClick={() => toggleExpandir(categoriaKey)}
                                    style={styles.expandButton}
                                  >
                                    {expandidas[categoriaKey] ? 
                                      <ChevronDown size={20} /> : 
                                      <ChevronRight size={20} />
                                    }
                                  </button>
                                )}
                                <div style={{
                                  ...styles.categoryInitials,
                                  background: tieneProductos 
                                    ? 'linear-gradient(135deg, #EF4444, #F87171)' 
                                    : 'linear-gradient(135deg, #10B981, #34D399)'
                                }}>
                                  {categoria.abreviatura || generarAbreviatura(categoria.nombre)}
                                </div>
                                <div>
                                  <div style={styles.categoryName}>
                                    {categoria.nombre || 'Sin nombre'}
                                    {tieneProductos && (
                                      <span style={{
                                        marginLeft: '8px',
                                        fontSize: '11px',
                                        backgroundColor: '#FEE2E2',
                                        color: '#991B1B',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                      }}>
                                        CON PRODUCTOS
                                      </span>
                                    )}
                                  </div>
                                  <div style={styles.categoryId}>
                                    <Hash size={12} /> ID: {categoria.id}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>

                          <td style={styles.tableCell}>
                            {editando === categoria.id ? (
                              <textarea
                                value={formEdit.descripcionCategoria || ""}
                                onChange={(e) => setFormEdit({ ...formEdit, descripcionCategoria: e.target.value })}
                                style={styles.editTextarea}
                                placeholder="Descripción de la categoría"
                              />
                            ) : (
                              <span style={styles.categoryDescription}>
                                {categoria.descripcion || "Sin descripción"}
                              </span>
                            )}
                          </td>

                          <td style={styles.tableCell}>
                            <div style={styles.subcategoriesCell}>
                              <span style={styles.subcategoriesBadge}>
                                <File size={12} />
                                {categoria.subcategorias?.length || 0}
                              </span>
                              <button
                                onClick={() => {
                                  abrirModalCrear(true, categoria.id);
                                  notificaciones.info(
                                    "Crear subcategoría",
                                    `Creando subcategoría para "${categoria.nombre}"`,
                                    "etiqueta"
                                  );
                                }}
                                style={styles.addSubcategoryButton}
                                title="Agregar subcategoría"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>

                          <td style={styles.tableCell}>
                            {editando === categoria.id ? (
                              <div style={styles.editActions}>
                                <button onClick={guardarEdicionInline} style={styles.saveButton}>
                                  <Save size={14} />
                                  Guardar
                                </button>
                                <button onClick={cancelarEdicionInline} style={styles.cancelButton}>
                                  <X size={14} />
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div style={styles.actions}>
                                <button
                                  onClick={() => {
                                    abrirModalEditar(categoria, false);
                                    notificaciones.info(
                                      "Editando categoría",
                                      `Editando categoría: "${categoria.nombre}"`,
                                      "edit"
                                    );
                                  }}
                                  style={{...styles.actionButton, backgroundColor: '#10B98110', color: '#10B981'}}
                                  title="Editar categoría"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => eliminarCategoria(categoria.id, categoria.nombre, false)}
                                  style={{
                                    ...styles.actionButton, 
                                    backgroundColor: tieneProductos ? '#f3f4f6' : '#EF444410', 
                                    color: tieneProductos ? '#9ca3af' : '#EF4444',
                                    cursor: tieneProductos ? 'not-allowed' : 'pointer',
                                    opacity: tieneProductos ? 0.6 : 1
                                  }}
                                  title={tieneProductos 
                                    ? "No se puede eliminar porque tiene productos asociados" 
                                    : "Eliminar categoría"}
                                  disabled={tieneProductos}
                                >
                                  <Trash2 size={16} />
                                </button>
                                <span style={{
                                  ...styles.estadoBadge,
                                  backgroundColor: tieneProductos ? '#FEF3C7' : '#D1FAE5',
                                  color: tieneProductos ? '#92400E' : '#065F46',
                                  border: tieneProductos ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                                  cursor: 'help'
                                }}
                                title={tieneProductos 
                                  ? "Esta categoría tiene productos asociados. No se puede eliminar." 
                                  : "Esta categoría no tiene productos asociados. Se puede eliminar."}
                                >
                                  {tieneProductos ? (
                                    <><XCircle size={10} /> Con productos</>
                                  ) : (
                                    <><CheckCircle size={10} /> Sin productos</>
                                  )}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>

                        {expandidas[categoriaKey] && categoria.subcategorias?.map((sub, subIndex) => {
                          const subKey = sub.id || `sub-${categoriaKey}-${subIndex}`;
                          const tieneProductosSub = sub.tieneProductos !== undefined 
                            ? sub.tieneProductos 
                            : subcategoriasConProductos[sub.id] || false;
                          
                          return (
                            <tr key={subKey} style={{
                              ...styles.subcategoryRow,
                              backgroundColor: tieneProductosSub ? '#FEF2F2' : '#FAFAFA',
                              borderLeft: tieneProductosSub ? '4px solid #EF4444' : '4px solid #10B981'
                            }}>
                              <td style={styles.tableCell}>
                                <div style={{ paddingLeft: '60px' }}>
                                  {editando === sub.id ? (
                                    <div style={styles.editInputs}>
                                      <input
                                        type="text"
                                        value={formEdit.nombreCategoria || ""}
                                        onChange={(e) => setFormEdit({ ...formEdit, nombreCategoria: e.target.value })}
                                        style={styles.editInput}
                                        placeholder="Nombre de la subcategoría"
                                      />
                                    </div>
                                  ) : (
                                    <div style={styles.categoryInfo}>
                                      <div style={{
                                        ...styles.subcategoryInitials,
                                        background: tieneProductosSub 
                                          ? 'linear-gradient(135deg, #EF4444, #F87171)' 
                                          : 'linear-gradient(135deg, #10B981, #34D399)'
                                      }}>
                                        {sub.abreviatura || generarAbreviatura(sub.nombre)}
                                      </div>
                                      <div>
                                        <div style={styles.categoryName}>
                                          {sub.nombre || 'Sin nombre'}
                                          {tieneProductosSub && (
                                            <span style={{
                                              marginLeft: '8px',
                                              fontSize: '10px',
                                              backgroundColor: '#FEE2E2',
                                              color: '#991B1B',
                                              padding: '1px 4px',
                                              borderRadius: '3px',
                                              fontWeight: '600'
                                            }}>
                                              CON PRODUCTOS
                                            </span>
                                          )}
                                        </div>
                                        <div style={styles.subcategoryInfo}>
                                          Subcategoría de {categoria.nombre}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td style={styles.tableCell}>
                                {editando === sub.id ? (
                                  <textarea
                                    value={formEdit.descripcionCategoria || ""}
                                    onChange={(e) => setFormEdit({ ...formEdit, descripcionCategoria: e.target.value })}
                                    style={styles.editTextarea}
                                    placeholder="Descripción de la subcategoría"
                                  />
                                ) : (
                                  <span style={styles.categoryDescription}>
                                    {sub.descripcion || "Sin descripción"}
                                  </span>
                                )}
                              </td>

                              <td style={styles.tableCell}>
                                <span style={styles.subcategoryLabel}>
                                  Subcategoría
                                </span>
                              </td>

                              <td style={styles.tableCell}>
                                {editando === sub.id ? (
                                  <div style={styles.editActions}>
                                    <button onClick={guardarEdicionInline} style={styles.saveButton}>
                                      <Save size={14} />
                                      Guardar
                                    </button>
                                    <button onClick={cancelarEdicionInline} style={styles.cancelButton}>
                                      <X size={14} />
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <div style={styles.actions}>
                                    <button
                                      onClick={() => {
                                        abrirModalEditar(sub, true, categoria.id);
                                        notificaciones.info(
                                          "Editando subcategoría",
                                          `Editando subcategoría: "${sub.nombre}"`,
                                          "edit"
                                        );
                                      }}
                                      style={{...styles.actionButton, backgroundColor: '#10B98110', color: '#10B981'}}
                                      title="Editar subcategoría"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => eliminarCategoria(sub.id, sub.nombre, true)}
                                      style={{
                                        ...styles.actionButton, 
                                        backgroundColor: tieneProductosSub ? '#f3f4f6' : '#EF444410', 
                                        color: tieneProductosSub ? '#9ca3af' : '#EF4444',
                                        cursor: tieneProductosSub ? 'not-allowed' : 'pointer',
                                        opacity: tieneProductosSub ? 0.6 : 1
                                      }}
                                      title={tieneProductosSub 
                                        ? "No se puede eliminar porque tiene productos asociados" 
                                        : "Eliminar subcategoría"}
                                      disabled={tieneProductosSub}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                    <span style={{
                                      ...styles.estadoBadge,
                                      backgroundColor: tieneProductosSub ? '#FEF3C7' : '#D1FAE5',
                                      color: tieneProductosSub ? '#92400E' : '#065F46',
                                      border: tieneProductosSub ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                                      fontSize: '11px',
                                      padding: '2px 8px',
                                      cursor: 'help'
                                    }}
                                    title={tieneProductosSub 
                                      ? "Esta subcategoría tiene productos asociados. No se puede eliminar." 
                                      : "Esta subcategoría no tiene productos asociados. Se puede eliminar."}
                                    >
                                      {tieneProductosSub ? (
                                        <><XCircle size={10} /> Con productos</>
                                      ) : (
                                        <><CheckCircle size={10} /> Sin productos</>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {categoriasFiltradas.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Mostrando {categoriasFiltradas.length} de {totalCategorias} categorías
              {busqueda && ` • Buscando: "${busqueda}"`}
              {totalSubcategorias > 0 && ` • ${totalSubcategorias} subcategorías`}
            </div>
            <div style={styles.paginationControls}>
              <button style={styles.paginationButton} disabled>Anterior</button>
              <span style={styles.paginationPage}>1</span>
              <button style={styles.paginationButton}>Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {modalAbierto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIcon}>
                {modoEdicion ? <Edit2 size={24} /> : (formData.esSubcategoria ? <File size={24} /> : <Folder size={24} />)}
              </div>
              <div>
                <h2 style={styles.modalTitle}>
                  {modoEdicion ? 'Editar Categoría' : (formData.esSubcategoria ? 'Nueva Subcategoría' : 'Nueva Categoría')}
                </h2>
                <p style={styles.modalSubtitle}>
                  {modoEdicion ? 'Modifica los detalles de la categoría' : 'Completa los datos para crear una nueva categoría'}
                </p>
              </div>
              <button
                onClick={() => {
                  cerrarModal();
                  notificaciones.info("Modal cerrado", "La ventana de edición ha sido cerrada", "❌");
                }}
                style={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombreCategoria}
                  onChange={(e) => {
                    const nuevoNombre = e.target.value;
                    setFormData({ ...formData, nombreCategoria: nuevoNombre });
                  }}
                  style={styles.modalInput}
                  placeholder="Ej: Frutas y Verduras"
                />
                {formData.nombreCategoria && (
                  <div style={styles.helperText}>
                    Abreviatura: <strong>{generarAbreviatura(formData.nombreCategoria)}</strong>
                  </div>
                )}
              </div>

              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcionCategoria}
                  onChange={(e) => setFormData({ ...formData, descripcionCategoria: e.target.value })}
                  style={styles.modalTextarea}
                  placeholder="Describe los productos que pertenecerán a esta categoría..."
                  rows={4}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => {
                  cerrarModal();
                  notificaciones.info("Operación cancelada", "La operación ha sido cancelada", "❌");
                }}
                style={styles.modalCancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                style={styles.modalSubmitButton}
              >
                <Save size={18} />
                {modoEdicion ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.systemInfo}>
        <div style={styles.systemInfoContent}>
          <Shield size={16} />
          <span>
            Panel de Administración de Categorías • Sistema MercadoLocal-IA • {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

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

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
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
    textAlign: 'center',
    width: '300px'
  },
  
  loadingTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px'
  },
  
  loadingText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px'
  },
  
  loadingProgress: {
    width: '100%'
  },
  
  progressBar: {
    height: '4px',
    backgroundColor: '#f1f5f9',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    width: '30%',
    animation: 'progress 1.5s ease-in-out infinite'
  },
  
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
  
  statSubtext: {
    fontSize: '12px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap'
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
  
  filterActions: {
    display: 'flex',
    gap: '12px'
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
  
  verifyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  verifyButtonDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#93c5fd',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  
  addButton: {
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
  
  tableSubtitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280'
  },
  
  tableWrapper: {
    overflowX: 'auto',
    minHeight: '200px'
  },
  
  errorState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  
  errorIcon: {
    color: '#EF4444',
    marginBottom: '16px'
  },
  
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  
  errorText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  errorButton: {
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
    margin: '0 auto'
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
    margin: '0 0 20px 0',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  emptyButton: {
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
    margin: '0 auto'
  },
  
  noResults: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  
  noResultsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  
  noResultsText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  
  noResultsButton: {
    padding: '10px 20px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
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
  
  subcategoryRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'all 0.2s ease'
  },
  
  tableCell: {
    padding: '20px',
    fontSize: '14px',
    color: '#374151'
  },
  
  categoryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  expandButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  
  categoryInitials: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0
  },
  
  subcategoryInitials: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '12px',
    flexShrink: 0
  },
  
  categoryName: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  
  categoryId: {
    fontSize: '12px',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  subcategoryInfo: {
    fontSize: '12px',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  categoryDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  
  editInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  editInput: {
    flex: 1,
    padding: '10px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    background: '#f9fafb',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  
  editTextarea: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#f9fafb',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease'
  },
  
  subcategoriesCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center'
  },
  
  subcategoriesBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#8B5CF620',
    color: '#8B5CF6',
    border: '1px solid #8B5CF640'
  },
  
  addSubcategoryButton: {
    background: 'transparent',
    border: '1px solid #F59E0B',
    color: '#F59E0B',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  subcategoryLabel: {
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '500',
    background: '#f3f4f6',
    padding: '4px 12px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center'
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
  
  estadoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '8px'
  },
  
  editActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
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
    position: 'relative'
  },
  
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    position: 'relative'
  },
  
  modalIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  
  modalSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
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
  
  modalBody: {
    marginBottom: '24px'
  },
  
  modalSection: {
    marginBottom: '20px'
  },
  
  modalLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px'
  },
  
  helperText: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic'
  },
  
  modalInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#f9fafb'
  },
  
  modalTextarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    background: '#f9fafb',
    lineHeight: '1.5'
  },
  
  modalFooter: {
    display: 'flex',
    gap: '12px'
  },
  
  modalCancelButton: {
    flex: 1,
    padding: '12px 16px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  
  modalSubmitButton: {
    flex: 1,
    padding: '12px 16px',
    background: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  }
};