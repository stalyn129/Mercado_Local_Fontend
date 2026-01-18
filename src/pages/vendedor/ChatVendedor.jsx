export default function ChatVendedor({ vendedor, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.chat}>
        <div style={styles.header}>
          <span>{vendedor.nombre}</span>
          <button onClick={onClose}>✖</button>
        </div>

        <div style={styles.messages}>
          <div style={styles.msgVendedor}>
            Hola 👋 soy {vendedor.nombre}, ¿en qué te ayudo?
          </div>
        </div>

        <div style={styles.inputBox}>
          <input placeholder="Escribe un mensaje..." />
          <button>➤</button>
        </div>
      </div>
    </div>
  );
}
