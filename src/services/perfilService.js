import API_URL from "../config/api.js";

export async function obtenerPerfil() {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_URL}/usuarios/perfil`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Error al cargar perfil");
  }

  return res.json();
}

// Nueva función para actualizar perfil
export async function actualizarPerfil(datos) {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${API_URL}/usuarios/perfil`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar perfil");
  }

  return res.json();
}