import API_URL from "../config/api.js";

// 📥 Obtener notificaciones del usuario
export const obtenerNotificaciones = async (idUsuario, token) => {
  const res = await fetch(
    `${API_URL}/notificaciones/usuario/${idUsuario}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Error al obtener notificaciones");
  }

  return res.json();
};

// 🔢 Contar notificaciones NO leídas
export const contarNotificaciones = async (idUsuario, token) => {
  const res = await fetch(
    `${API_URL}/notificaciones/contar/${idUsuario}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Error al contar notificaciones");
  }

  return res.json();
};
