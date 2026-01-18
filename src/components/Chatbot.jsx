import { useState } from "react";
import { enviarMensaje } from "../services/chatbotService";

/* ===============================
   Convierte URLs en links
================================ */
const linkify = (text) => {
  if (!text) return text;

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      // Quitar signos de puntuación al final
      const cleanUrl = part.replace(/[)\].,;:]+$/, "");

      return (
        <a
          key={index}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1d4ed8", textDecoration: "underline" }}
        >
          {cleanUrl}
        </a>
      );
    }

    return part;
  });
};


export default function Chatbot() {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [abierto, setAbierto] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const enviar = async () => {
    if (!input.trim()) return;

    const mensajeUsuario = input;

    // Mostrar mensaje del usuario
    setMensajes((prev) => [
      ...prev,
      { autor: "user", texto: mensajeUsuario }
    ]);

    setInput("");

    try {
      const data = await enviarMensaje(
        mensajeUsuario,
        user?.rol,
        user?.idConsumidor,
        user?.idVendedor,
        token
      );

      // Respuesta del bot
      setMensajes((prev) => [
        ...prev,
        { autor: "bot", texto: data.respuesta }
      ]);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        {
          autor: "bot",
          texto: "⚠️ Error al conectar con el asistente"
        }
      ]);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        style={styles.floatingButton}
        onClick={() => setAbierto(!abierto)}
        title="Chat MercadoLocal"
      >
        🤖
      </button>

      {/* Ventana del chat */}
      {abierto && (
        <div style={styles.chatbox}>
          <h4 style={styles.title}>🤖 Asistente MercadoLocal</h4>

          <div style={styles.messages}>
            {mensajes.length === 0 && (
              <p style={{ fontSize: "12px", color: "#666" }}>
                Hola 👋 ¿En qué puedo ayudarte?
              </p>
            )}

            {mensajes.map((m, i) => (
              <p
                key={i}
                style={{
                  textAlign: m.autor === "bot" ? "left" : "right",
                  margin: "6px 0"
                }}
              >
                <span
                  style={{
                    ...styles.bubble,
                    background:
                      m.autor === "bot" ? "#F0F4F1" : "#3A5A40",
                    color:
                      m.autor === "bot" ? "#000" : "#fff"
                  }}
                >
                  {linkify(m.texto)}
                </span>
              </p>
            ))}
          </div>

          <div style={styles.inputBox}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
            />
            <button onClick={enviar} style={styles.button}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ===============================
   Estilos
================================ */
const styles = {
  floatingButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#3A5A40",
    color: "#fff",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    zIndex: 9999
  },
  chatbox: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "320px",
    height: "420px",
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    zIndex: 9999
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "15px",
    fontWeight: "700",
    textAlign: "center",
    color: "#3A5A40"
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    fontSize: "13px",
    marginBottom: "10px",
    padding: "4px"
  },
  bubble: {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: "12px",
    maxWidth: "85%",
    wordWrap: "break-word"
  },
  inputBox: {
    display: "flex",
    gap: "6px"
  },
  input: {
    flex: 1,
    padding: "8px",
    fontSize: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  button: {
    padding: "8px 12px",
    fontSize: "12px",
    background: "#3A5A40",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};
