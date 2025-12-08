import { useEffect, useState } from "react";
import { UserCheck, UserX, RefreshCcw, Edit2, Trash2, X, Save } from "lucide-react";

const API = "http://localhost:8080/api/admin/usuarios";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [miIdUsuario, setMiIdUsuario] = useState(null);

  const getToken = () => {
    const token = localStorage.getItem("token") || "";
    if (token && !miIdUsuario) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMiIdUsuario(payload.idUsuario);
      } catch (e) {
        console.error("Error decodificando token:", e);
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

      const raw = await res.text();
      if (!raw) {
        setUsuarios([]);
        setLoading(false);
        return;
      }

      const data = JSON.parse(raw);
      setUsuarios(data);
    } catch (e) {
      console.error("Error cargando usuarios:", e);
      alert("Error al cargar usuarios: " + e.message);
    }

    setLoading(false);
  }

  async function cambiarEstado(id) {
    const token = getToken();

    try {
      const res = await fetch(`${API}/${id}/estado`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        obtenerUsuarios();
      } else {
        alert("Error al cambiar estado");
      }
    } catch (e) {
      alert("Error al cambiar estado: " + e.message);
    }
  }

  async function eliminarUsuario(id) {
    const token = getToken();
    if (!token) return alert("Inicia sesión.");

    if (miIdUsuario === id) {
      return alert("⚠️ No puedes eliminar tu propio usuario.\n\nEsto es por seguridad del sistema.");
    }

    if (!confirm("¿Estás seguro de eliminar este usuario?\n\nEsta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("✅ Usuario eliminado correctamente");
        obtenerUsuarios();
      } else if (res.status === 403) {
        alert("⚠️ No tienes permisos para eliminar este usuario.");
      } else {
        alert("Error al eliminar usuario");
      }
    } catch (e) {
      alert("Error al eliminar usuario: " + e.message);
    }
  }

  function iniciarEdicion(usuario) {
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
  }

  function cancelarEdicion() {
    setEditando(null);
    setFormEdit({});
  }

  async function guardarEdicion() {
    const token = getToken();
    if (!token) return alert("Inicia sesión.");

    if (miIdUsuario === editando) {
      return alert("⚠️ No puedes editar tu propio usuario por seguridad.\n\nPrueba editando otro usuario de la lista.");
    }

    if (!formEdit.nombre || !formEdit.apellido || !formEdit.correo) {
      return alert("Completa los campos obligatorios.");
    }

    try {
      const res = await fetch(`${API}/${editando}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formEdit)
      });

      if (res.ok) {
        alert("✅ Usuario actualizado correctamente");
        obtenerUsuarios();
        cancelarEdicion();
      } else if (res.status === 403) {
        alert("⚠️ No tienes permisos para editar usuarios.");
      } else {
        alert("Error al actualizar usuario");
      }
    } catch (e) {
      alert("Error al guardar cambios: " + e.message);
    }
  }

  if (loading) {
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
          <p style={{
            color: "#6B7F69",
            fontSize: "18px",
            fontWeight: "600",
            margin: 0
          }}>
            Cargando usuarios...
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
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
            borderRadius: "50%",
            opacity: "0.1"
          }}></div>
          
          <div style={{ position: "relative", zIndex: "1", textAlign: "center" }}>
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
            }}>👥</div>
            <h1 style={{
              fontSize: "42px",
              fontWeight: "800",
              color: "#2D3E2B",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
              lineHeight: "1.2"
            }}>
              Gestión de Usuarios
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
              Administra todos los usuarios del sistema de forma eficiente y segura
            </p>
            <button onClick={obtenerUsuarios} style={{
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
              <RefreshCcw style={{ width: "20px", height: "20px" }} />
              Recargar Usuarios
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
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
                  <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>ID</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nombre</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Apellido</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Correo</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rol</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "80px 20px" }}>
                      <div style={{ fontSize: "64px", marginBottom: "20px" }}>👤</div>
                      <p style={{
                        color: "#2D3E2B",
                        fontSize: "18px",
                        fontWeight: "600",
                        margin: 0
                      }}>
                        No hay usuarios registrados
                      </p>
                      <p style={{
                        color: "#9AAA98",
                        fontSize: "15px",
                        marginTop: "8px"
                      }}>
                        Los usuarios aparecerán aquí cuando se registren
                      </p>
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id} style={{
                      borderBottom: "1px solid #F0F4ED",
                      transition: "background 0.2s ease",
                      background: u.id === miIdUsuario ? "#FFF9E6" : "white"
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = u.id === miIdUsuario ? "#FFF3D6" : "#FAFCF8"}
                      onMouseLeave={(e) => e.currentTarget.style.background = u.id === miIdUsuario ? "#FFF9E6" : "white"}>
                      
                      {/* ID */}
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: "700", color: "#5A8F48", fontSize: "14px" }}>
                        #{u.id}
                        {u.id === miIdUsuario && <span style={{ marginLeft: "6px", fontSize: "16px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>👑</span>}
                      </td>

                      {/* Nombre */}
                      <td style={{ padding: "16px" }}>
                        {editando === u.id ? (
                          <input type="text" value={formEdit.nombre || ""} onChange={e => setFormEdit({ ...formEdit, nombre: e.target.value })} style={{
                            width: "100%", padding: "8px 12px", border: "2px solid #5A8F48", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "#2D3E2B", outline: "none"
                          }} />
                        ) : (
                          <span style={{ color: "#2D3E2B", fontWeight: "600", fontSize: "14px" }}>{u.nombre}</span>
                        )}
                      </td>

                      {/* Apellido */}
                      <td style={{ padding: "16px" }}>
                        {editando === u.id ? (
                          <input type="text" value={formEdit.apellido || ""} onChange={e => setFormEdit({ ...formEdit, apellido: e.target.value })} style={{
                            width: "100%", padding: "8px 12px", border: "2px solid #5A8F48", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "#2D3E2B", outline: "none"
                          }} />
                        ) : (
                          <span style={{ color: "#2D3E2B", fontWeight: "600", fontSize: "14px" }}>{u.apellido}</span>
                        )}
                      </td>

                      {/* Correo */}
                      <td style={{ padding: "16px" }}>
                        {editando === u.id ? (
                          <input type="email" value={formEdit.correo || ""} onChange={e => setFormEdit({ ...formEdit, correo: e.target.value })} style={{
                            width: "100%", padding: "8px 12px", border: "2px solid #5A8F48", borderRadius: "8px", fontSize: "13px", color: "#2D3E2B", outline: "none"
                          }} />
                        ) : (
                          <span style={{ color: "#6B7F69", fontSize: "13px" }}>{u.correo}</span>
                        )}
                      </td>

                      {/* Rol */}
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          background: u.rol === "ADMIN" ? "#E8E3F5" : "#F0F4ED",
                          color: u.rol === "ADMIN" ? "#6B4DA8" : "#6B7F69",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          display: "inline-block"
                        }}>
                          {u.rol}
                        </span>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          background: u.estado === "Activo" ? "#E8F5E3" : "#FFF0F2",
                          color: u.estado === "Activo" ? "#5A8F48" : "#DA3E52",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          display: "inline-block"
                        }}>
                          {u.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {editando === u.id ? (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button onClick={guardarEdicion} style={{
                              background: "#5A8F48", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600", fontSize: "12px", transition: "all 0.2s ease"
                            }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#4A7A3A";
                                e.target.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "#5A8F48";
                                e.target.style.transform = "translateY(0)";
                              }}>
                              <Save style={{ width: "14px", height: "14px" }} /> Guardar
                            </button>
                            <button onClick={cancelarEdicion} style={{
                              background: "#9AAA98", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600", fontSize: "12px", transition: "all 0.2s ease"
                            }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#6B7F69";
                                e.target.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "#9AAA98";
                                e.target.style.transform = "translateY(0)";
                              }}>
                              <X style={{ width: "14px", height: "14px" }} /> Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                            <button onClick={() => iniciarEdicion(u)} style={{
                              background: "#FFF9E6", color: "#F5C744", border: "2px solid #F5C744", padding: "8px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease"
                            }}
                              onMouseEnter={(e) => {
                                e.target.style.background = "#F5C744";
                                e.target.style.color = "white";
                                e.target.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "#FFF9E6";
                                e.target.style.color = "#F5C744";
                                e.target.style.transform = "translateY(0)";
                              }}
                              title="Editar">
                              <Edit2 style={{ width: "16px", height: "16px" }} />
                            </button>
                            <button onClick={() => cambiarEstado(u.id)} style={{
                              background: u.estado === "Activo" ? "#FFF3E0" : "#E8F5E3",
                              color: u.estado === "Activo" ? "#F5C744" : "#5A8F48",
                              border: `2px solid ${u.estado === "Activo" ? "#F5C744" : "#5A8F48"}`,
                              padding: "8px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s ease", fontWeight: "600", fontSize: "12px"
                            }}
                              onMouseEnter={(e) => {
                                if (u.estado === "Activo") {
                                  e.target.style.background = "#F5C744";
                                  e.target.style.color = "white";
                                } else {
                                  e.target.style.background = "#5A8F48";
                                  e.target.style.color = "white";
                                }
                                e.target.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = u.estado === "Activo" ? "#FFF3E0" : "#E8F5E3";
                                e.target.style.color = u.estado === "Activo" ? "#F5C744" : "#5A8F48";
                                e.target.style.transform = "translateY(0)";
                              }}
                              title={u.estado === "Activo" ? "Desactivar usuario y productos" : "Activar usuario"}>
                              {u.estado === "Activo" ? <UserX style={{ width: "16px", height: "16px" }} /> : <UserCheck style={{ width: "16px", height: "16px" }} />}
                              {u.estado === "Activo" ? "Desactivar" : "Activar"}
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

          {/* Footer */}
          {usuarios.length > 0 && (
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
                Total de usuarios: <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{usuarios.length}</strong>
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#5A8F48" }}>
                👥 Sistema de gestión
              </span>
            </div>
          )}
        </div>
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