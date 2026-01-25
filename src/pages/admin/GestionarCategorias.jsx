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
  Tag,
  Layers
} from 'lucide-react';

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

  // =================== FUNCIÓN PARA GENERAR ABREVIATURAS AUTOMÁTICAS ===================
  const generarAbreviatura = (nombre) => {
    if (!nombre || !nombre.trim()) return 'CAT';
    
    const nombreLimpio = nombre.trim();
    
    // Abreviaturas comunes predefinidas
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
    
    // Buscar si hay una abreviatura común predefinida
    for (const [key, abrev] of Object.entries(abreviaturasComunes)) {
      if (nombreLower.includes(key)) {
        return abrev;
      }
    }
    
    // Si no hay coincidencia, generar abreviatura dinámica
    const palabras = nombreLimpio.split(' ');
    
    if (palabras.length === 1) {
      // Para palabras únicas, tomar primeras letras (máximo 3)
      return nombreLimpio.substring(0, 3).toUpperCase();
    } else {
      // Para múltiples palabras, tomar iniciales
      return palabras
        .filter(palabra => palabra.length > 2) // Filtrar palabras cortas como "y", "de", etc.
        .slice(0, 3) // Máximo 3 iniciales
        .map(palabra => palabra[0])
        .join('')
        .toUpperCase();
    }
  };

  // =================== VERIFICAR AUTENTICACIÓN ===================
  const verificarAutenticacion = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
      window.location.href = '/LoginModal';
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expira = payload.exp * 1000;
      if (Date.now() >= expira) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        window.location.href = '/LoginModal';
        return false;
      }
    } catch (error) {
      console.log('Token no es JWT o error al decodificar');
    }
    
    return true;
  };

  // =================== CÍRCULOS FLOTANTES ===================
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

  // =================== CARGAR CATEGORÍAS Y SUBCATEGORÍAS ===================
  const cargarCategorias = async () => {
    try {
      setCargando(true);
      setError(null);
      
      if (!verificarAutenticacion()) {
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Cargar categorías principales
      const response = await fetch('http://localhost:8080/categorias/listar', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/LoginModal';
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'No se pudieron cargar las categorías'}`);
      }
      
      const categoriasData = await response.json();
      
      // Para cada categoría, cargar sus subcategorías
      const categoriasConSubcategorias = await Promise.all(
        categoriasData.map(async (cat) => {
          try {
            const subResponse = await fetch(`http://localhost:8080/subcategorias/categoria/${cat.idCategoria}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            let subcategorias = [];
            if (subResponse.ok) {
              const subData = await subResponse.json();
              subcategorias = subData.map(sub => ({
                id: sub.idSubcategoria,
                nombre: sub.nombreSubcategoria,
                descripcion: sub.descripcionSubcategoria || '',
                idCategoria: sub.idCategoria,
                abreviatura: generarAbreviatura(sub.nombreSubcategoria)
              }));
            }
            
            return {
              id: cat.idCategoria,
              nombre: cat.nombreCategoria,
              descripcion: cat.descripcionCategoria,
              abreviatura: generarAbreviatura(cat.nombreCategoria),
              subcategorias: subcategorias
            };
          } catch (error) {
            console.error(`Error cargando subcategorías para categoría ${cat.idCategoria}:`, error);
            return {
              id: cat.idCategoria,
              nombre: cat.nombreCategoria,
              descripcion: cat.descripcionCategoria,
              abreviatura: generarAbreviatura(cat.nombreCategoria),
              subcategorias: []
            };
          }
        })
      );
      
      setCategorias(categoriasConSubcategorias);
      
    } catch (error) {
      console.error('Error en cargarCategorias:', error);
      if (error.message.includes('Failed to fetch')) {
        setError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8080');
      } else {
        setError(`Error al cargar las categorías: ${error.message}`);
      }
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
  };

  const guardarEdicionInline = async () => {
    if (!formEdit.nombreCategoria.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    if (!verificarAutenticacion()) {
      return;
    }
    
    try {
      const url = formEdit.esSubcategoria 
        ? `http://localhost:8080/subcategorias/actualizar/${formEdit.id}`
        : `http://localhost:8080/categorias/actualizar/${formEdit.id}`;
      
      const body = formEdit.esSubcategoria ? {
        nombreSubcategoria: formEdit.nombreCategoria,
        descripcionSubcategoria: formEdit.descripcionCategoria,
        idCategoria: formEdit.categoriaId
      } : {
        nombreCategoria: formEdit.nombreCategoria,
        descripcionCategoria: formEdit.descripcionCategoria,
      };
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/LoginModal';
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      await cargarCategorias();
      cancelarEdicionInline();
      alert('✅ Categoría actualizada exitosamente');
    } catch (error) {
      console.error('Error en guardarEdicionInline:', error);
      alert(`Error al actualizar la categoría: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombreCategoria.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    if (!verificarAutenticacion()) {
      return;
    }
    
    try {
      const url = formData.esSubcategoria 
        ? 'http://localhost:8080/subcategorias/crear'
        : 'http://localhost:8080/categorias/crear';
      
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
            ? `http://localhost:8080/subcategorias/actualizar/${categoriaActual.id}`
            : `http://localhost:8080/categorias/actualizar/${categoriaActual.id}`)
        : url;
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(finalUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/LoginModal';
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'Error desconocido'}`);
      }
      
      await cargarCategorias();
      cerrarModal();
      alert(`✅ ${modoEdicion ? 'Categoría actualizada' : 'Categoría creada'} exitosamente`);
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      alert(`Error al ${modoEdicion ? 'actualizar' : 'crear'} la categoría: ${error.message}`);
    }
  };

  const eliminarCategoria = async (id, nombre, esSubcategoria = false) => {
    if (!confirm(`¿Estás seguro de eliminar ${esSubcategoria ? 'la subcategoría' : 'la categoría'} "${nombre}"?\n\nSi tiene productos asociados, no se podrá eliminar.`)) {
      return;
    }

    if (!verificarAutenticacion()) {
      return;
    }

    try {
      const url = esSubcategoria 
        ? `http://localhost:8080/subcategorias/eliminar/${id}`
        : `http://localhost:8080/categorias/eliminar/${id}`;
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/LoginModal ';
        return;
      }
      
      if (response.status === 409) {
        alert('⚠️ No se puede eliminar porque tiene productos asociados.\n\nPrimero debes eliminar o reasignar los productos.');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar'}`);
      }
      
      await cargarCategorias();
      alert(`✅ ${esSubcategoria ? 'Subcategoría' : 'Categoría'} eliminada exitosamente`);
    } catch (error) {
      console.error('Error en eliminarCategoria:', error);
      alert(`Error al eliminar: ${error.message}`);
    }
  };

  // =================== ESTADÍSTICAS ===================
  const totalCategorias = categorias.length;
  const totalSubcategorias = categorias.reduce((acc, cat) => acc + (cat.subcategorias?.length || 0), 0);
  const categoriasSinDescripcion = categorias.filter(cat => !cat.descripcion || cat.descripcion.trim() === '').length;
  const totalElementos = totalCategorias + totalSubcategorias;

  // Filtrar categorías basado en la búsqueda
  const categoriasFiltradas = categorias.filter(categoria => 
    categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    categoria.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    (categoria.abreviatura && categoria.abreviatura.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (cargando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={styles.loadingContent}>
          <h3 style={styles.loadingTitle}>Cargando categorías...</h3>
          <p style={styles.loadingText}>Obteniendo datos del sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
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
              Sistema MercadoLocal-IA • {totalElementos} elemento{totalElementos !== 1 ? 's' : ''} encontrado{totalElementos !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div style={styles.refreshButtonContainer}>
            <button
              style={styles.refreshButton}
              onClick={cargarCategorias}
              disabled={cargando}
            >
              <RefreshCcw size={18} /> {cargando ? "Actualizando..." : "Actualizar catálogo"}
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
            <Folder size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalCategorias}</h3>
            <p style={styles.statLabel}>CATEGORÍAS PRINCIPALES</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> Registradas
            </span>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#F59E0B'}}>
          <div style={{...styles.statIcon, backgroundColor: '#F59E0B20', color: '#F59E0B'}}>
            <File size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalSubcategorias}</h3>
            <p style={styles.statLabel}>SUBCATEGORÍAS</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {totalSubcategorias > 0 ? `${Math.round((totalSubcategorias/totalElementos)*100)}% del total` : "0%"}
            </span>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#3B82F6'}}>
          <div style={{...styles.statIcon, backgroundColor: '#3B82F620', color: '#3B82F6'}}>
            <AlertCircle size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{categoriasSinDescripcion}</h3>
            <p style={styles.statLabel}>SIN DESCRIPCIÓN</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> {categoriasSinDescripcion > 0 ? `${Math.round((categoriasSinDescripcion/totalCategorias)*100)}% del total` : "0%"}
            </span>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: '#10B981'}}>
          <div style={{...styles.statIcon, backgroundColor: '#10B98120', color: '#10B981'}}>
            <Package size={22} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{totalElementos}</h3>
            <p style={styles.statLabel}>TOTAL ELEMENTOS</p>
            <span style={styles.statTrend}>
              <TrendingUp size={14} /> Categorías + Subcategorías
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
            placeholder="Buscar por nombre, descripción o abreviatura..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterActions}>
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={styles.clearButton}
            >
              <X size={14} />
              Limpiar búsqueda
            </button>
          )}
          <button
            onClick={() => abrirModalCrear()}
            style={styles.addButton}
          >
            <Plus size={16} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            Catálogo de Categorías <span style={styles.tableCount}>({totalCategorias})</span>
          </h3>
          <div style={styles.tableActions}>
            <button style={styles.exportButton}>
              Exportar CSV
            </button>
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
            <button onClick={cargarCategorias} style={styles.errorButton}>
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
            <button onClick={() => abrirModalCrear()} style={styles.emptyButton}>
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
                <button onClick={() => setBusqueda('')} style={styles.noResultsButton}>
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
                    
                    return (
                      <React.Fragment key={`fragment-${categoriaKey}`}>
                        {/* Categoría Principal */}
                        <tr key={`row-${categoriaKey}`} style={styles.tableRow}>
                          
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
                                <div style={styles.categoryInitials}>
                                  {categoria.abreviatura || generarAbreviatura(categoria.nombre)}
                                </div>
                                <div>
                                  <div style={styles.categoryName}>
                                    {categoria.nombre || 'Sin nombre'}
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
                                onClick={() => abrirModalCrear(true, categoria.id)}
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
                                  onClick={() => abrirModalEditar(categoria, false)}
                                  style={{...styles.actionButton, backgroundColor: '#10B98110', color: '#10B981'}}
                                  title="Editar categoría"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => eliminarCategoria(categoria.id, categoria.nombre, false)}
                                  style={{...styles.actionButton, backgroundColor: '#EF444410', color: '#EF4444'}}
                                  title="Eliminar categoría"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Subcategorías */}
                        {expandidas[categoriaKey] && categoria.subcategorias?.map((sub, subIndex) => {
                          const subKey = sub.id || `sub-${categoriaKey}-${subIndex}`;
                          return (
                            <tr key={subKey} style={styles.subcategoryRow}>
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
                                      <div style={styles.subcategoryInitials}>
                                        {sub.abreviatura || generarAbreviatura(sub.nombre)}
                                      </div>
                                      <div>
                                        <div style={styles.categoryName}>
                                          {sub.nombre || 'Sin nombre'}
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
                                      onClick={() => abrirModalEditar(sub, true, categoria.id)}
                                      style={{...styles.actionButton, backgroundColor: '#10B98110', color: '#10B981'}}
                                      title="Editar subcategoría"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => eliminarCategoria(sub.id, sub.nombre, true)}
                                      style={{...styles.actionButton, backgroundColor: '#EF444410', color: '#EF4444'}}
                                      title="Eliminar subcategoría"
                                    >
                                      <Trash2 size={16} />
                                    </button>
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

        {/* Paginación */}
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

      {/* Modal para crear/editar */}
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
                onClick={cerrarModal}
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
                onClick={cerrarModal}
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

      {/* Información del Sistema */}
      <div style={styles.systemInfo}>
        <div style={styles.systemInfoContent}>
          <Shield size={16} />
          <span>
            Panel de Administración de Categorías • Sistema MercadoLocal-IA • {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
      `}</style>
    </div>
  );
}

// =================== ESTILOS ===================
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
    backgroundColor: '#fafafa',
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
    background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
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
    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    color: 'white',
    fontWeight: '600',
    fontSize: '12px',
    flexShrink: 0
  },
  
  categoryName: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px'
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
    justifyContent: 'center'
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