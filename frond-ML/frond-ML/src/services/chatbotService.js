/**
 * Envía un mensaje al chatbot de MercadoLocal (Spring Boot)
 * @param {string} mensaje
 * @param {string} rol
 * @param {number|null} idConsumidor
 * @param {number|null} idVendedor
 * @param {string} token
 * @returns {Promise<{respuesta: string}>}
 */
export async function enviarMensaje(
  mensaje,
  rol,
  idConsumidor,
  idVendedor,
  token
) {
  // Validación básica
  if (!mensaje || !mensaje.trim()) {
    throw new Error("Mensaje vacío");
  }

  const res = await fetch("http://localhost:8080/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      mensaje: mensaje.trim(),
      rol: rol || "GENERAL",
      idConsumidor: idConsumidor ?? null,
      idVendedor: idVendedor ?? null,
    }),
  });

  // Manejo de errores HTTP
  if (!res.ok) {
    let errorMsg = "Error al conectar con el chatbot";

    try {
      const errorData = await res.json();
      errorMsg = errorData?.message || errorMsg;
    } catch (_) {
      // ignorar parseo de error
    }

    throw new Error(errorMsg);
  }

  // Respuesta esperada: { respuesta: "..." }
  return await res.json();
}
