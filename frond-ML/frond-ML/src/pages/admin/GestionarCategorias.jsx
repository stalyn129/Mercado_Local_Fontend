import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight, RefreshCcw, Search } from 'lucide-react';

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
    icono: '',
    esSubcategoria: false,
    categoriaId: null
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [editandoModal, setEditandoModal] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch('http://localhost:8080/categorias', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      
      const data = await response.json();
      console.log('Categorías recibidas:', data); // Para depuración
      // Transformar datos para usar en el frontend
      const categoriasTransformadas = data.map(cat => ({
        id: cat.idCategoria,
        nombre: cat.nombreCategoria,
        descripcion: cat.descripcionCategoria,
        icono: cat.icono || '📦',
        subcategorias: cat.subcategorias || []
      }));
      setCategorias(categoriasTransformadas);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar las categorías. Por favor, intenta de nuevo.');
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
    setEditandoModal(false);
    setCategoriaActual(null);
    setFormData({
      nombreCategoria: '',
      descripcionCategoria: '',
      icono: esSubcategoria ? '📄' : '📦',
      esSubcategoria: esSubcategoria,
      categoriaId: categoriaPadreId
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (categoria, esSubcategoria = false, categoriaPadreId = null) => {
    setModoEdicion(true);
    setEditandoModal(true);
    setCategoriaActual(categoria);
    setFormData({
      nombreCategoria: categoria.nombre,
      descripcionCategoria: categoria.descripcion,
      icono: categoria.icono,
      esSubcategoria: esSubcategoria,
      categoriaId: categoriaPadreId
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setEditandoModal(false);
    setCategoriaActual(null);
    setFormData({
      nombreCategoria: '',
      descripcionCategoria: '',
      icono: '',
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
      icono: categoria.icono || '📦',
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
    
    try {
      const body = {
        nombreCategoria: formEdit.nombreCategoria,
        descripcionCategoria: formEdit.descripcionCategoria,
        icono: formEdit.icono,
      };

      if (formEdit.esSubcategoria) {
        body.categoriaId = formEdit.categoriaId;
      }
      
      const response = await fetch(`http://localhost:8080/categorias/${formEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }
      
      await cargarCategorias();
      cancelarEdicionInline();
      alert('✅ Categoría actualizada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la categoría. Por favor, intenta de nuevo.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombreCategoria.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    try {
      const body = {
        nombreCategoria: formData.nombreCategoria,
        descripcionCategoria: formData.descripcionCategoria,
        icono: formData.icono,
      };

      if (formData.esSubcategoria) {
        body.categoriaId = formData.categoriaId;
      }
      
      const url = modoEdicion 
        ? `http://localhost:8080/categorias/${categoriaActual.id}`
        : 'http://localhost:8080/categorias';
      
      const method = modoEdicion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      await cargarCategorias();
      cerrarModal();
      alert(`✅ ${modoEdicion ? 'Categoría actualizada' : 'Categoría creada'} exitosamente`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al ${modoEdicion ? 'actualizar' : 'crear'} la categoría: ${error.message}`);
    }
  };

  const eliminarCategoria = async (id, nombre, esSubcategoria) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?\n\nSi tiene productos asociados, no se podrá eliminar.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 409) {
        alert('⚠️ No se puede eliminar esta categoría porque tiene productos asociados.\n\nPrimero debes eliminar o reasignar los productos.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }
      
      await cargarCategorias();
      alert('✅ Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la categoría. Por favor, intenta de nuevo.');
    }
  };

  // Filtrar categorías basado en la búsqueda
  const categoriasFiltradas = categorias.filter(categoria => 
    categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    categoria.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            width: "50px",
            height: "50px",
            border: "5px solid #ECF2E3",
            borderTop: "5px solid #5A8F48",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }}></div>
          <p style={{ color: "#6B7F69", fontSize: "18px", fontWeight: "600", margin: 0 }}>
            Cargando categorías...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "40px 20px",
        paddingBottom: "80px"
      }}>
        {/* Header */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 8px 32px rgba(90, 143, 72, 0.12)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
            borderRadius: "50%",
            opacity: "0.6"
          }}></div>
          
          <div style={{ position: "relative", zIndex: "1" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{
                  width: "72px",
                  height: "72px",
                  background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(90, 143, 72, 0.3)"
                }}>
                  <span style={{ fontSize: "36px", color: "white" }}>🗂️</span>
                </div>
                <div>
                  <h1 style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#2D3E2B",
                    margin: "0 0 8px 0",
                    letterSpacing: "-0.5px"
                  }}>
                    Gestión de Categorías
                  </h1>
                  <p style={{
                    color: "#6B7F69",
                    fontSize: "16px",
                    margin: 0,
                    fontWeight: "500"
                  }}>
                    {categorias.length} categorías registradas
                  </p>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={cargarCategorias} style={{
                  background: "white",
                  color: "#5A8F48",
                  padding: "14px 24px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  border: "2px solid #5A8F48",
                  cursor: "pointer",
                  fontSize: "15px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease"
                }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#5A8F48";
                    e.target.style.color = "white";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.color = "#5A8F48";
                    e.target.style.transform = "translateY(0)";
                  }}>
                  <RefreshCcw style={{ width: "18px", height: "18px" }} />
                  Recargar
                </button>
                <button onClick={() => abrirModalCrear()} style={{
                  background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                  color: "white",
                  padding: "14px 32px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "15px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 6px 20px rgba(90, 143, 72, 0.35)",
                  transition: "all 0.3s ease"
                }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 24px rgba(90, 143, 72, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.35)";
                  }}>
                  <Plus style={{ width: "18px", height: "18px" }} />
                  Nueva Categoría
                </button>
              </div>
            </div>
            
            <div style={{
              background: "#FAFCF8",
              borderRadius: "12px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              border: "1px solid #E8F5E3"
            }}>
              <div style={{ padding: "0 16px", color: "#6B7F69" }}>
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Buscar categorías por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  border: "none",
                  background: "transparent",
                  fontSize: "15px",
                  color: "#2D3E2B",
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
              {busqueda && (
                <button 
                  onClick={() => setBusqueda('')}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9AAA98",
                    padding: "0 16px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(90, 143, 72, 0.1)",
          border: "1px solid rgba(90, 143, 72, 0.1)"
        }}>
          {error ? (
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <div style={{
                width: "80px",
                height: "80px",
                background: "#FFE8E8",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                color: "#DA3E52"
              }}>
                <span style={{ fontSize: "40px" }}>⚠️</span>
              </div>
              <p style={{ color: "#2D3E2B", fontSize: "18px", fontWeight: "600", margin: "0 0 12px 0" }}>
                Error al cargar categorías
              </p>
              <p style={{ color: "#6B7F69", fontSize: "15px", margin: "0 0 24px 0", maxWidth: "400px"}}>
                {error}
              </p>
              <button onClick={cargarCategorias} style={{
                background: "#5A8F48",
                color: "white",
                padding: "12px 32px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <RefreshCcw size={16} />
                Reintentar
              </button>
            </div>
          ) : categorias.length === 0 ? (
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <div style={{
                width: "100px",
                height: "100px",
                background: "#F9FBF7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px"
              }}>
                <span style={{ fontSize: "48px" }}>📁</span>
              </div>
              <p style={{ color: "#2D3E2B", fontSize: "20px", fontWeight: "600", margin: "0 0 12px 0" }}>
                No hay categorías registradas
              </p>
              <p style={{ color: "#6B7F69", fontSize: "16px", margin: "0 0 32px 0", maxWidth: "400px" }}>
                Comienza creando tu primera categoría para organizar los productos del sistema
              </p>
              <button onClick={() => abrirModalCrear()} style={{
                background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                color: "white",
                padding: "14px 32px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(90, 143, 72, 0.3)"
              }}>
                <Plus size={18} />
                Crear primera categoría
              </button>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0",
                  minWidth: "1000px"
                }}>
                  <thead>
                    <tr style={{
                      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
                      fontWeight: "600",
                      color: "#2D3E2B",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "left", 
                        borderBottom: "2px solid #E8F5E3"
                      }}>CATEGORÍA</th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "left", 
                        borderBottom: "2px solid #E8F5E3"
                      }}>DESCRIPCIÓN</th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "center", 
                        borderBottom: "2px solid #E8F5E3"
                      }}>SUBCATEGORÍAS</th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "center", 
                        borderBottom: "2px solid #E8F5E3"
                      }}>ACCIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categoriasFiltradas.map((categoria, index) => {
                      const categoriaKey = categoria.id || `cat-${index}`;
                      
                      return (
                        <React.Fragment key={`fragment-${categoriaKey}`}>
                          {/* Categoría Principal */}
                          <tr key={`row-${categoriaKey}`} style={{
                            background: "white",
                            borderBottom: "1px solid #F0F4ED",
                            transition: "all 0.2s ease",
                            position: "relative"
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#FAFCF8";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "white";
                              e.currentTarget.style.boxShadow = "none";
                            }}>
                            
                            <td style={{ padding: "20px" }}>
                              {editando === categoria.id ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <input
                                    type="text"
                                    value={formEdit.icono || ""}
                                    onChange={(e) => setFormEdit({ ...formEdit, icono: e.target.value })}
                                    style={{
                                      width: "60px",
                                      padding: "10px",
                                      border: "2px solid #5A8F48",
                                      borderRadius: "10px",
                                      fontSize: "24px",
                                      textAlign: "center",
                                      background: "#FAFCF8",
                                      outline: "none"
                                    }}
                                    placeholder="🍎"
                                  />
                                  <input
                                    type="text"
                                    value={formEdit.nombreCategoria || ""}
                                    onChange={(e) => setFormEdit({ ...formEdit, nombreCategoria: e.target.value })}
                                    style={{
                                      flex: 1,
                                      padding: "12px 16px",
                                      border: "2px solid #5A8F48",
                                      borderRadius: "10px",
                                      fontSize: "15px",
                                      fontWeight: "600",
                                      color: "#2D3E2B",
                                      background: "#FAFCF8",
                                      outline: "none"
                                    }}
                                    placeholder="Nombre de la categoría"
                                  />
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  {(categoria.subcategorias?.length || 0) > 0 && (
                                    <button
                                      onClick={() => toggleExpandir(categoriaKey)}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#6B7F69",
                                        padding: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        borderRadius: "8px",
                                        transition: "all 0.2s"
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = "#E8F5E3"}
                                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                      {expandidas[categoriaKey] ? 
                                        <ChevronDown size={20} style={{ transition: "transform 0.2s" }} /> : 
                                        <ChevronRight size={20} style={{ transition: "transform 0.2s" }} />
                                      }
                                    </button>
                                  )}
                                  <div style={{
                                    width: "56px",
                                    height: "56px",
                                    background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
                                    borderRadius: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: "0",
                                    border: "1px solid #E8F5E3"
                                  }}>
                                    <span style={{ fontSize: "28px" }}>{categoria.icono || '📦'}</span>
                                  </div>
                                  <div>
                                    <div style={{ color: "#2D3E2B", fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>
                                      {categoria.nombre || 'Sin nombre'}
                                    </div>
                                    <div style={{ color: "#6B7F69", fontSize: "12px", fontWeight: "500" }}>
                                      ID: {categoria.id}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>

                            <td style={{ padding: "20px" }}>
                              {editando === categoria.id ? (
                                <textarea
                                  value={formEdit.descripcionCategoria || ""}
                                  onChange={(e) => setFormEdit({ ...formEdit, descripcionCategoria: e.target.value })}
                                  style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #5A8F48",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    color: "#2D3E2B",
                                    background: "#FAFCF8",
                                    outline: "none",
                                    resize: "vertical",
                                    minHeight: "80px",
                                    fontFamily: "inherit"
                                  }}
                                  placeholder="Descripción de la categoría"
                                />
                              ) : (
                                <span style={{ color: "#6B7F69", fontSize: "14px", lineHeight: "1.5" }}>
                                  {categoria.descripcion || "Sin descripción"}
                                </span>
                              )}
                            </td>

                            <td style={{ padding: "20px", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <span style={{
                                  background: "#E8F5E3",
                                  color: "#5A8F48",
                                  padding: "8px 16px",
                                  borderRadius: "20px",
                                  fontSize: "13px",
                                  fontWeight: "700",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  border: "1px solid rgba(90, 143, 72, 0.2)"
                                }}>
                                  <span style={{ fontSize: "16px" }}>📋</span>
                                  {categoria.subcategorias?.length || 0}
                                </span>
                                {categoria.subcategorias?.length > 0 && (
                                  <button
                                    onClick={() => abrirModalCrear(true, categoria.id)}
                                    style={{
                                      background: "transparent",
                                      border: "1px solid #5A8F48",
                                      color: "#5A8F48",
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "8px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#5A8F48";
                                      e.currentTarget.style.color = "white";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                      e.currentTarget.style.color = "#5A8F48";
                                    }}
                                    title="Agregar subcategoría"
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                              </div>
                            </td>

                            <td style={{ padding: "20px", textAlign: "center" }}>
                              {editando === categoria.id ? (
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                  <button onClick={guardarEdicionInline} style={{
                                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    transition: "all 0.2s",
                                    boxShadow: "0 4px 12px rgba(90, 143, 72, 0.3)"
                                  }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                                    <Save size={14} /> Guardar
                                  </button>
                                  <button onClick={cancelarEdicionInline} style={{
                                    background: "#F9FBF7",
                                    color: "#6B7F69",
                                    border: "1px solid #DDE8D0",
                                    padding: "10px 20px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    transition: "all 0.2s"
                                  }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#ECF2E3";
                                      e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "#F9FBF7";
                                      e.currentTarget.style.transform = "translateY(0)";
                                    }}>
                                    <X size={14} /> Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                  <button
                                    onClick={() => abrirModalCrear(true, categoria.id)}
                                    style={{
                                      background: "#E8F5E3",
                                      color: "#5A8F48",
                                      border: "1px solid #5A8F48",
                                      padding: "10px",
                                      borderRadius: "10px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#5A8F48";
                                      e.currentTarget.style.color = "white";
                                      e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "#E8F5E3";
                                      e.currentTarget.style.color = "#5A8F48";
                                      e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                    title="Agregar subcategoría"
                                  >
                                    <Plus size={18} />
                                  </button>
                                  <button
                                    onClick={() => abrirModalEditar(categoria, false)}
                                    style={{
                                      background: "#FFF9E6",
                                      color: "#F5C744",
                                      border: "1px solid #F5C744",
                                      padding: "10px",
                                      borderRadius: "10px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#F5C744";
                                      e.currentTarget.style.color = "white";
                                      e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "#FFF9E6";
                                      e.currentTarget.style.color = "#F5C744";
                                      e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                    title="Editar categoría"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => eliminarCategoria(categoria.id, categoria.nombre, false)}
                                    style={{
                                      background: "#FFE8E8",
                                      color: "#DA3E52",
                                      border: "1px solid #DA3E52",
                                      padding: "10px",
                                      borderRadius: "10px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#DA3E52";
                                      e.currentTarget.style.color = "white";
                                      e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "#FFE8E8";
                                      e.currentTarget.style.color = "#DA3E52";
                                      e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                    title="Eliminar categoría"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>

                          {/* Subcategorías */}
                          {expandidas[categoriaKey] && categoria.subcategorias?.map((sub, subIndex) => {
                            const subKey = sub.id || `sub-${categoriaKey}-${subIndex}`;
                            return (
                              <tr key={subKey} style={{
                                background: "#FAFCF8",
                                borderBottom: "1px solid #F0F4ED",
                                transition: "all 0.2s ease"
                              }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#F5F9F2"}>
                                <td style={{ padding: "16px 20px 16px 80px", position: "relative" }}>
                                  {editando === sub.id ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                      <input
                                        type="text"
                                        value={formEdit.icono || ""}
                                        onChange={(e) => setFormEdit({ ...formEdit, icono: e.target.value })}
                                        style={{
                                          width: "50px",
                                          padding: "8px",
                                          border: "2px solid #5A8F48",
                                          borderRadius: "8px",
                                          fontSize: "20px",
                                          textAlign: "center",
                                          background: "white",
                                          outline: "none"
                                        }}
                                        placeholder="📄"
                                      />
                                      <input
                                        type="text"
                                        value={formEdit.nombreCategoria || ""}
                                        onChange={(e) => setFormEdit({ ...formEdit, nombreCategoria: e.target.value })}
                                        style={{
                                          flex: 1,
                                          padding: "10px 14px",
                                          border: "2px solid #5A8F48",
                                          borderRadius: "8px",
                                          fontSize: "14px",
                                          fontWeight: "600",
                                          background: "white",
                                          outline: "none"
                                        }}
                                        placeholder="Nombre de la subcategoría"
                                      />
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                      <div style={{
                                        width: "48px",
                                        height: "48px",
                                        background: "white",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: "0",
                                        border: "1px solid #E8F5E3",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                                      }}>
                                        <span style={{ fontSize: "22px" }}>{sub.icono || '📄'}</span>
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ color: "#2D3E2B", fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>
                                          {sub.nombre || 'Sin nombre'}
                                        </div>
                                        <div style={{ color: "#9AAA98", fontSize: "11px", fontWeight: "500" }}>
                                          Subcategoría de {categoria.nombre}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: "16px 20px" }}>
                                  {editando === sub.id ? (
                                    <textarea
                                      value={formEdit.descripcionCategoria || ""}
                                      onChange={(e) => setFormEdit({ ...formEdit, descripcionCategoria: e.target.value })}
                                      style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        border: "2px solid #5A8F48",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        background: "white",
                                        outline: "none",
                                        resize: "vertical",
                                        minHeight: "60px",
                                        fontFamily: "inherit"
                                      }}
                                      placeholder="Descripción de la subcategoría"
                                    />
                                  ) : (
                                    <span style={{ color: "#6B7F69", fontSize: "13px", lineHeight: "1.4" }}>
                                      {sub.descripcion || "Sin descripción"}
                                    </span>
                                  )}
                                </td>

                                <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                  <span style={{ 
                                    color: "#9AAA98", 
                                    fontSize: "12px", 
                                    fontWeight: "500",
                                    background: "white",
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    border: "1px solid #ECF2E3"
                                  }}>
                                    Subcategoría
                                  </span>
                                </td>

                                <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                  {editando === sub.id ? (
                                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                      <button onClick={guardarEdicionInline} style={{
                                        background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                                        color: "white",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        transition: "all 0.2s"
                                      }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                                        <Save size={12} /> Guardar
                                      </button>
                                      <button onClick={cancelarEdicionInline} style={{
                                        background: "#F9FBF7",
                                        color: "#6B7F69",
                                        border: "1px solid #DDE8D0",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        transition: "all 0.2s"
                                      }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = "#ECF2E3";
                                          e.currentTarget.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = "#F9FBF7";
                                          e.currentTarget.style.transform = "translateY(0)";
                                        }}>
                                        <X size={12} /> Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                      <button
                                        onClick={() => abrirModalEditar(sub, true, categoria.id)}
                                        style={{
                                          background: "#FFF9E6",
                                          color: "#F5C744",
                                          border: "1px solid #F5C744",
                                          padding: "8px",
                                          borderRadius: "8px",
                                          cursor: "pointer",
                                          transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = "#F5C744";
                                          e.currentTarget.style.color = "white";
                                          e.currentTarget.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = "#FFF9E6";
                                          e.currentTarget.style.color = "#F5C744";
                                          e.currentTarget.style.transform = "translateY(0)";
                                        }}
                                        title="Editar subcategoría"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => eliminarCategoria(sub.id, sub.nombre, true)}
                                        style={{
                                          background: "#FFE8E8",
                                          color: "#DA3E52",
                                          border: "1px solid #DA3E52",
                                          padding: "8px",
                                          borderRadius: "8px",
                                          cursor: "pointer",
                                          transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = "#DA3E52";
                                          e.currentTarget.style.color = "white";
                                          e.currentTarget.style.transform = "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = "#FFE8E8";
                                          e.currentTarget.style.color = "#DA3E52";
                                          e.currentTarget.style.transform = "translateY(0)";
                                        }}
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
              </div>

              {/* Footer */}
              <div style={{
                padding: "24px 32px",
                background: "#FAFCF8",
                borderTop: "1px solid #ECF2E3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                color: "#6B7F69",
                fontWeight: "500"
              }}>
                <div>
                  <span style={{ marginRight: "16px" }}>
                    Mostrando <strong style={{ color: "#5A8F48" }}>{categoriasFiltradas.length}</strong> de {categorias.length} categorías
                  </span>
                  {busqueda && (
                    <span style={{ background: "#E8F5E3", padding: "4px 12px", borderRadius: "12px", fontSize: "13px" }}>
                      Búsqueda: "{busqueda}"
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>🗂️</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#5A8F48" }}>
                    Sistema de categorías
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal para crear/editar */}
        {modalAbierto && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            animation: "fadeIn 0.3s ease"
          }}>
            <div style={{
              background: "white",
              borderRadius: "24px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              animation: "slideUp 0.4s ease",
              overflow: "hidden"
            }}>
              <div style={{
                padding: "28px 32px",
                borderBottom: "1px solid #F0F4ED",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg, #FAFCF8 0%, #ECF2E3 100%)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 20px rgba(90, 143, 72, 0.3)"
                  }}>
                    <span style={{ fontSize: "28px", color: "white" }}>
                      {modoEdicion ? '✏️' : (formData.esSubcategoria ? '📁' : '🗂️')}
                    </span>
                  </div>
                  <div>
                    <h2 style={{
                      margin: 0,
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#2D3E2B",
                      lineHeight: "1.2"
                    }}>
                      {modoEdicion ? 'Editar Categoría' : (formData.esSubcategoria ? 'Nueva Subcategoría' : 'Nueva Categoría')}
                    </h2>
                    <p style={{
                      margin: "4px 0 0 0",
                      color: "#6B7F69",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}>
                      {modoEdicion ? 'Modifica los detalles de la categoría' : 'Completa los datos para crear una nueva categoría'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModal}
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "none",
                    cursor: "pointer",
                    color: "#6B7F69",
                    padding: "10px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.color = "#DA3E52";
                    e.currentTarget.style.transform = "rotate(90deg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                    e.currentTarget.style.color = "#6B7F69";
                    e.currentTarget.style.transform = "rotate(0deg)";
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: "32px" }}>
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "10px"
                  }}>
                    Icono (Emoji) *
                  </label>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{
                      width: "80px",
                      height: "80px",
                      background: "#FAFCF8",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #DDE8D0",
                      fontSize: "40px",
                      flexShrink: "0"
                    }}>
                      {formData.icono || '🍎'}
                    </div>
                    <input
                      type="text"
                      value={formData.icono}
                      onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                      style={{
                        flex: 1,
                        padding: "14px 20px",
                        border: "2px solid #DDE8D0",
                        borderRadius: "12px",
                        fontSize: "24px",
                        textAlign: "center",
                        outline: "none",
                        transition: "border 0.2s",
                        background: "#FAFCF8"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                      onBlur={(e) => e.target.style.borderColor = "#DDE8D0"}
                      placeholder="🍎 📦 📁"
                    />
                  </div>
                  <p style={{
                    margin: "8px 0 0 0",
                    color: "#9AAA98",
                    fontSize: "13px"
                  }}>
                    Ingresa un emoji que represente la categoría
                  </p>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "10px"
                  }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreCategoria}
                    onChange={(e) => setFormData({ ...formData, nombreCategoria: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      border: "2px solid #DDE8D0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      transition: "border 0.2s",
                      background: "#FAFCF8",
                      fontWeight: "500"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                    onBlur={(e) => e.target.style.borderColor = "#DDE8D0"}
                    placeholder="Ej: Frutas y Verduras"
                  />
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "10px"
                  }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcionCategoria}
                    onChange={(e) => setFormData({ ...formData, descripcionCategoria: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      border: "2px solid #DDE8D0",
                      borderRadius: "12px",
                      fontSize: "15px",
                      outline: "none",
                      resize: "vertical",
                      minHeight: "100px",
                      fontFamily: "inherit",
                      transition: "border 0.2s",
                      background: "#FAFCF8",
                      lineHeight: "1.5"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                    onBlur={(e) => e.target.style.borderColor = "#DDE8D0"}
                    placeholder="Describe los productos que pertenecerán a esta categoría..."
                  />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={cerrarModal}
                    style={{
                      flex: 1,
                      padding: "16px",
                      background: "white",
                      border: "2px solid #DDE8D0",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#6B7F69",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#F9FBF7";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    style={{
                      flex: 1,
                      padding: "16px",
                      background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                      boxShadow: "0 6px 20px rgba(90, 143, 72, 0.4)"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 8px 24px rgba(90, 143, 72, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.4)";
                    }}
                  >
                    <Save size={18} />
                    {modoEdicion ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}