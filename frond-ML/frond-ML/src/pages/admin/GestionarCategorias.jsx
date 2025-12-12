import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight, RefreshCcw } from 'lucide-react';

export default function GestionarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState(null);
  const [expandidas, setExpandidas] = useState({});
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
    esSubcategoria: false,
    categoriaId: null
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/categorias', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }
      
      const data = await response.json();
      setCategorias(data);
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

  const abrirModal = (categoria = null, esSubcategoria = false, categoriaId = null) => {
    if (categoria) {
      setModoEdicion(true);
      setCategoriaActual(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        icono: categoria.icono,
        esSubcategoria: esSubcategoria,
        categoriaId: categoriaId
      });
    } else {
      setModoEdicion(false);
      setCategoriaActual(null);
      setFormData({
        nombre: '',
        descripcion: '',
        icono: '',
        esSubcategoria: esSubcategoria,
        categoriaId: categoriaId
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setCategoriaActual(null);
    setFormData({
      nombre: '',
      descripcion: '',
      icono: '',
      esSubcategoria: false,
      categoriaId: null
    });
  };

  const iniciarEdicion = (categoria, esSubcategoria = false, categoriaId = null) => {
    setEditando(categoria.id);
    setFormEdit({
      id: categoria.id,
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || '',
      icono: categoria.icono || '',
      esSubcategoria: esSubcategoria,
      categoriaId: categoriaId
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setFormEdit({});
  };

  const guardarEdicion = async () => {
    if (!formEdit.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    try {
      const body = {
        nombre: formEdit.nombre,
        descripcion: formEdit.descripcion,
        icono: formEdit.icono,
      };

      if (formEdit.esSubcategoria) {
        body.categoriaId = formEdit.categoriaId;
      }
      
      const response = await fetch(`http://localhost:8080/api/categorias/${formEdit.id}`, {
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
      cancelarEdicion();
      alert('✅ Categoría actualizada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la categoría. Por favor, intenta de nuevo.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    try {
      const body = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        icono: formData.icono,
      };

      if (formData.esSubcategoria) {
        body.categoriaId = formData.categoriaId;
      }
      
      const response = await fetch('http://localhost:8080/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }
      
      await cargarCategorias();
      cerrarModal();
      alert('✅ Categoría creada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la categoría. Por favor, intenta de nuevo.');
    }
  };

  const eliminarCategoria = async (id, nombre, esSubcategoria) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?\n\nSi tiene productos asociados, no se podrá eliminar.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/categorias/${id}`, {
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
      fontFamily: "inherit"
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
          borderRadius: "20px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
            borderRadius: "50%",
            opacity: "0.5"
          }}></div>
          
          <div style={{ position: "relative", zIndex: "1", textAlign: "center" }}>
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
            }}>🗂️</div>
            <h1 style={{
              fontSize: "42px",
              fontWeight: "800",
              color: "#2D3E2B",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
              lineHeight: "1.2"
            }}>
              Gestión de Categorías
            </h1>
            <p style={{
              color: "#6B7F69",
              fontSize: "16px",
              margin: "0 0 32px 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6"
            }}>
              Administra las categorías y subcategorías de productos del sistema
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={cargarCategorias} style={{
                background: "white",
                color: "#5A8F48",
                padding: "16px 32px",
                fontWeight: "700",
                borderRadius: "14px",
                border: "2px solid #5A8F48",
                cursor: "pointer",
                fontSize: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.3s ease"
              }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#5A8F48";
                  e.target.style.color = "white";
                  e.target.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                  e.target.style.color = "#5A8F48";
                  e.target.style.transform = "translateY(0)";
                }}>
                <RefreshCcw style={{ width: "20px", height: "20px" }} />
                Recargar
              </button>
              <button onClick={() => abrirModal()} style={{
                background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                color: "white",
                padding: "16px 40px",
                fontWeight: "700",
                borderRadius: "14px",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 6px 20px rgba(90, 143, 72, 0.35)",
                transition: "all 0.3s ease"
              }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 8px 24px rgba(90, 143, 72, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.35)";
                }}>
                <Plus style={{ width: "20px", height: "20px" }} />
                Nueva Categoría
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          {error ? (
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <p style={{ color: "#DA3E52", fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>
                {error}
              </p>
              <button onClick={cargarCategorias} style={{
                background: "#5A8F48",
                color: "white",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600"
              }}>
                Reintentar
              </button>
            </div>
          ) : categorias.length === 0 ? (
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📁</div>
              <p style={{ color: "#2D3E2B", fontSize: "18px", fontWeight: "600", margin: 0 }}>
                No hay categorías registradas
              </p>
              <p style={{ color: "#9AAA98", fontSize: "15px", marginTop: "8px", marginBottom: "24px" }}>
                Crea tu primera categoría para comenzar
              </p>
              <button onClick={() => abrirModal()} style={{
                background: "#5A8F48",
                color: "white",
                padding: "14px 32px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "15px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <Plus size={18} />
                Crear primera categoría
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1000px"
              }}>
                <thead>
                  <tr style={{
                    background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                    fontWeight: "700",
                    color: "#2D3E2B"
                  }}>
                    <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>CATEGORÍA</th>
                    <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>DESCRIPCIÓN</th>
                    <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>SUBCATEGORÍAS</th>
                    <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {categorias.map((categoria) => (
                    <React.Fragment key={categoria.id}>
                      {/* Categoría Principal */}
                      <tr style={{
                        borderBottom: "1px solid #F0F4ED",
                        transition: "background 0.2s ease",
                        background: "white"
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#FAFCF8"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                        
                        <td style={{ padding: "16px" }}>
                          {editando === categoria.id ? (
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
                                  textAlign: "center"
                                }}
                                placeholder="🍎"
                              />
                              <input
                                type="text"
                                value={formEdit.nombre || ""}
                                onChange={(e) => setFormEdit({ ...formEdit, nombre: e.target.value })}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  border: "2px solid #5A8F48",
                                  borderRadius: "8px",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#2D3E2B"
                                }}
                              />
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              {(categoria.subcategorias?.length || 0) > 0 && (
                                <button
                                  onClick={() => toggleExpandir(categoria.id)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#6B7F69",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center"
                                  }}
                                >
                                  {expandidas[categoria.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                              )}
                              <span style={{ fontSize: "28px" }}>{categoria.icono}</span>
                              <span style={{ color: "#2D3E2B", fontWeight: "700", fontSize: "15px" }}>
                                {categoria.nombre}
                              </span>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "16px" }}>
                          {editando === categoria.id ? (
                            <input
                              type="text"
                              value={formEdit.descripcion || ""}
                              onChange={(e) => setFormEdit({ ...formEdit, descripcion: e.target.value })}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "2px solid #5A8F48",
                                borderRadius: "8px",
                                fontSize: "13px",
                                color: "#2D3E2B"
                              }}
                            />
                          ) : (
                            <span style={{ color: "#6B7F69", fontSize: "13px" }}>
                              {categoria.descripcion || "Sin descripción"}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            background: "#E8F5E3",
                            color: "#5A8F48",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "inline-block"
                          }}>
                            {categoria.subcategorias?.length || 0} subcategorías
                          </span>
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          {editando === categoria.id ? (
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                              <button onClick={guardarEdicion} style={{
                                background: "#5A8F48",
                                color: "white",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: "600",
                                fontSize: "12px"
                              }}>
                                <Save size={14} /> Guardar
                              </button>
                              <button onClick={cancelarEdicion} style={{
                                background: "#9AAA98",
                                color: "white",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: "600",
                                fontSize: "12px"
                              }}>
                                <X size={14} /> Cancelar
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                onClick={() => abrirModal(null, true, categoria.id)}
                                style={{
                                  background: "#E8F5E3",
                                  color: "#5A8F48",
                                  border: "2px solid #5A8F48",
                                  padding: "8px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center"
                                }}
                                title="Agregar subcategoría"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() => iniciarEdicion(categoria, false)}
                                style={{
                                  background: "#FFF9E6",
                                  color: "#F5C744",
                                  border: "2px solid #F5C744",
                                  padding: "8px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center"
                                }}
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => eliminarCategoria(categoria.id, categoria.nombre, false)}
                                style={{
                                  background: "#FFE8E8",
                                  color: "#DA3E52",
                                  border: "2px solid #DA3E52",
                                  padding: "8px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center"
                                }}
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Subcategorías */}
                      {expandidas[categoria.id] && categoria.subcategorias?.map((sub) => (
                        <tr key={sub.id} style={{
                          background: "#F9FBF7",
                          borderBottom: "1px solid #F0F4ED"
                        }}>
                          <td style={{ padding: "12px 16px 12px 60px" }}>
                            {editando === sub.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <input
                                  type="text"
                                  value={formEdit.icono || ""}
                                  onChange={(e) => setFormEdit({ ...formEdit, icono: e.target.value })}
                                  style={{
                                    width: "40px",
                                    padding: "6px",
                                    border: "2px solid #5A8F48",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    textAlign: "center"
                                  }}
                                />
                                <input
                                  type="text"
                                  value={formEdit.nombre || ""}
                                  onChange={(e) => setFormEdit({ ...formEdit, nombre: e.target.value })}
                                  style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    border: "2px solid #5A8F48",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: "600"
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "20px" }}>{sub.icono}</span>
                                <span style={{ color: "#2D3E2B", fontWeight: "600", fontSize: "14px" }}>
                                  {sub.nombre}
                                </span>
                              </div>
                            )}
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            {editando === sub.id ? (
                              <input
                                type="text"
                                value={formEdit.descripcion || ""}
                                onChange={(e) => setFormEdit({ ...formEdit, descripcion: e.target.value })}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  border: "2px solid #5A8F48",
                                  borderRadius: "8px",
                                  fontSize: "12px"
                                }}
                              />
                            ) : (
                              <span style={{ color: "#6B7F69", fontSize: "12px" }}>
                                {sub.descripcion || "Sin descripción"}
                              </span>
                            )}
                          </td>

                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <span style={{ color: "#9AAA98", fontSize: "12px" }}>—</span>
                          </td>

                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            {editando === sub.id ? (
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button onClick={guardarEdicion} style={{
                                  background: "#5A8F48",
                                  color: "white",
                                  border: "none",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  <Save size={12} /> Guardar
                                </button>
                                <button onClick={cancelarEdicion} style={{
                                  background: "#9AAA98",
                                  color: "white",
                                  border: "none",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  <X size={12} /> Cancelar
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button
                                  onClick={() => iniciarEdicion(sub, true, categoria.id)}
                                  style={{
                                    background: "#FFF9E6",
                                    color: "#F5C744",
                                    border: "2px solid #F5C744",
                                    padding: "6px",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                  }}
                                  title="Editar"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => eliminarCategoria(sub.id, sub.nombre, true)}
                                  style={{
                                    background: "#FFE8E8",
                                    color: "#DA3E52",
                                    border: "2px solid #DA3E52",
                                    padding: "6px",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                  }}
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {categorias.length > 0 && (
            <div style={{
              padding: "24px 28px",
              background: "#FAFCF8",
              borderTop: "2px solid #ECF2E3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              color: "#6B7F69",
              fontWeight: "500"
            }}>
              <span>
                Total de categorías: <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{categorias.length}</strong>
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#5A8F48" }}>
                🗂️ Sistema de categorías
              </span>
            </div>
          )}
        </div>

        {/* Modal */}
        {modalAbierto && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}>
            <div style={{
              background: "white",
              borderRadius: "20px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}>
              <div style={{
                padding: "24px 32px",
                borderBottom: "2px solid #F0F4ED",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#2D3E2B"
                }}>
                  {formData.esSubcategoria ? '📁 Nueva Subcategoría' : '🗂️ Nueva Categoría'}
                </h2>
                <button
                  onClick={cerrarModal}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#6B7F69",
                    padding: "4px"
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: "32px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "8px"
                  }}>
                    Icono (Emoji) *
                  </label>
                  <input
                    type="text"
                    value={formData.icono}
                    onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #DDE8D0",
                      borderRadius: "12px",
                      fontSize: "24px",
                      textAlign: "center",
                      outline: "none",
                      transition: "border 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                    onBlur={(e) => e.target.style.borderColor = "#DDE8D0"}
                    placeholder="🍎"
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "8px"
                  }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #DDE8D0",
                      borderRadius: "12px",
                      fontSize: "15px",
                      outline: "none",
                      transition: "border 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                    onBlur={(e) => e.target.style.borderColor = "#DDE8D0"}
                    placeholder="Ej: Frutas"
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3E2B",
                    marginBottom: "8px"
                  }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #DDE8D0",
                      borderRadius: "12px",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      minHeight: "80px",
                      fontFamily: "inherit",
                      transition: "border 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                    onBlur={(e) => e.target.style.borderColor = "#DDE8D0"}
                    placeholder="Descripción opcional de la categoría"
                  />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={cerrarModal}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "white",
                      border: "2px solid #DDE8D0",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#6B7F69",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#F9FBF7"}
                    onMouseLeave={(e) => e.target.style.background = "white"}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                  >
                    <Save size={18} />
                    Crear
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
      `}</style>
    </div>
  );
}