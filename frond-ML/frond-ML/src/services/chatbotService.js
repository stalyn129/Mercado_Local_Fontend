export async function enviarMensaje(mensaje, rol, idUsuario) {
  const res = await fetch("http://localhost:8000/api/ia/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensaje,
      rol,
      id_usuario: idUsuario
    })
  });

  if (!res.ok) {
    throw new Error("Error al conectar con IA");
  }

  return await res.json();
}
