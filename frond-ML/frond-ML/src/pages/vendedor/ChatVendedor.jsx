export default function ChatVendedor({ vendedor, onClose }) {
  return (
    <div className="chat-overlay">
      <div className="chat-box">
        <div className="chat-header">
          <span>{vendedor.nombre}</span>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="chat-messages">
          <div className="mensaje vendedor">
            Hola 👋 ¿En qué te puedo ayudar?
          </div>
        </div>

        <div className="chat-input">
          <input placeholder="Escribe un mensaje..." />
          <button>➤</button>
        </div>
      </div>
    </div>
  );
}
