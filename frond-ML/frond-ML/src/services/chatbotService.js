export async function enviarMensaje(mensaje, rol, idConsumidor) {
  const res = await fetch("http://localhost:8080/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje, rol, idConsumidor })
  });
  return await res.json();
}
