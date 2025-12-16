const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
