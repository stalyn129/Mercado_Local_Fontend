// components/Notificaciones.jsx
import { useEffect, useState } from "react";
import "../styles/Notificaciones.css";  // ← CAMBIADO DE "./" a "../styles/"
const Notificaciones = ({ 
  notificacion, 
  setNotificacion,
  position = "top-right", // top-right, top-left, bottom-right, bottom-left
  autoClose = 4000, // milisegundos
  showProgress = true,
  pauseOnHover = true,
  // NUEVO: Props para confirmaciones de pago
  confirmacionPago = null,
  setConfirmacionPago = null,
  onConfirmarPago = null,
  onCancelarPago = null
}) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isHovering, setIsHovering] = useState(false);

  // Configuraciones por tipo
  const configPorTipo = {
    success: {
      colorPrimario: "#10B981",
      gradiente: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))",
      borde: "rgba(16, 185, 129, 0.4)",
      sombra: "0 15px 35px rgba(16, 185, 129, 0.25)",
      icono: "✅",
      nombre: "Éxito"
    },
    error: {
      colorPrimario: "#EF4444",
      gradiente: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))",
      borde: "rgba(239, 68, 68, 0.4)",
      sombra: "0 15px 35px rgba(239, 68, 68, 0.25)",
      icono: "❌",
      nombre: "Error"
    },
    warning: {
      colorPrimario: "#F59E0B",
      gradiente: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))",
      borde: "rgba(245, 158, 11, 0.4)",
      sombra: "0 15px 35px rgba(245, 158, 11, 0.25)",
      icono: "⚠️",
      nombre: "Advertencia"
    },
    info: {
      colorPrimario: "#3B82F6",
      gradiente: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))",
      borde: "rgba(59, 130, 246, 0.4)",
      sombra: "0 15px 35px rgba(59, 130, 246, 0.25)",
      icono: "ℹ️",
      nombre: "Información"
    }
  };

  // Iconos personalizados
  const iconosPersonalizados = {
    carrito: "🛒",
    bloqueo: "🔒",
    usuario: "👤",
    caja: "📦",
    estrella: "⭐",
    corazon: "❤️",
    banco: "🏦",
    reloj: "⏱️",
    ubicacion: "📍",
    telefono: "📱",
    correo: "📧",
    paquete: "📦",
    etiqueta: "🏷️",
    oferta: "🔥",
    nuevo: "🆕",
    dinero: "💰",
    check: "✅",
    alerta: "🚨",
    config: "⚙️",
    calendario: "📅",
    camara: "📷",
    musica: "🎵",
    deporte: "⚽",
    comida: "🍕",
    viaje: "✈️",
    regalo: "🎁",
    educacion: "📚",
    salud: "🏥",
    tecnologia: "💻",
    // Iconos de pago
    efectivo: "💵",
    tarjeta: "💳",
    transferencia: "🏦",
    billete: "💰",
    pago: "💸"
  };

  // NUEVO: Configuraciones por método de pago
  const configPorMetodoPago = {
    EFECTIVO: {
      colorPrimario: "#10B981",
      gradiente: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))",
      borde: "rgba(16, 185, 129, 0.4)",
      sombra: "0 15px 35px rgba(16, 185, 129, 0.2)",
      icono: "💵",
      nombre: "Efectivo"
    },
    TARJETA: {
      colorPrimario: "#3B82F6",
      gradiente: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08))",
      borde: "rgba(59, 130, 246, 0.4)",
      sombra: "0 15px 35px rgba(59, 130, 246, 0.2)",
      icono: "💳",
      nombre: "Tarjeta"
    },
    TRANSFERENCIA: {
      colorPrimario: "#8B5CF6",
      gradiente: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08))",
      borde: "rgba(139, 92, 246, 0.4)",
      sombra: "0 15px 35px rgba(139, 92, 246, 0.2)",
      icono: "🏦",
      nombre: "Transferencia"
    }
  };

  // Obtener configuración del tipo
  const config = configPorTipo[notificacion.tipo] || configPorTipo.info;
  
  // Obtener icono (personalizado o por tipo)
  const obtenerIcono = () => {
    if (notificacion.icono && iconosPersonalizados[notificacion.icono]) {
      return iconosPersonalizados[notificacion.icono];
    }
    return notificacion.icono || config.icono;
  };

  // Posicionamiento
  const getPositionStyle = () => {
    const positions = {
      "top-right": { top: "30px", right: "30px", left: "auto" },
      "top-left": { top: "30px", left: "30px", right: "auto" },
      "bottom-right": { bottom: "30px", right: "30px", left: "auto" },
      "bottom-left": { bottom: "30px", left: "30px", right: "auto" }
    };
    return positions[position] || positions["top-right"];
  };

  // Manejo de la notificación
  useEffect(() => {
    if (notificacion.mostrar) {
      setVisible(true);
      setProgress(100);

      const progressInterval = setInterval(() => {
        if (!isHovering || !pauseOnHover) {
          setProgress(prev => {
            if (prev <= 0) {
              clearInterval(progressInterval);
              return 0;
            }
            return prev - 100 / (autoClose / 50);
          });
        }
      }, 50);

      const timeout = setTimeout(() => {
        if (!isHovering || !pauseOnHover) {
          setVisible(false);
          setTimeout(() => {
            setNotificacion(prev => ({ ...prev, mostrar: false }));
          }, 400);
        }
      }, autoClose);

      return () => {
        clearTimeout(timeout);
        clearInterval(progressInterval);
      };
    }
  }, [notificacion.mostrar, autoClose, isHovering, pauseOnHover, setNotificacion]);

  // Cerrar manualmente
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setNotificacion(prev => ({ ...prev, mostrar: false }));
    }, 300);
  };

  // NUEVO: Manejo de confirmación de pago
  const handleConfirmarPago = () => {
    if (onConfirmarPago) {
      onConfirmarPago();
    }
    if (setConfirmacionPago) {
      setConfirmacionPago(null);
    }
  };

  const handleCancelarPago = () => {
    if (onCancelarPago) {
      onCancelarPago();
    }
    if (setConfirmacionPago) {
      setConfirmacionPago(null);
    }
  };

  // Si hay confirmación de pago, mostrarla
  if (confirmacionPago && confirmacionPago.mostrar) {
    const metodoConfig = configPorMetodoPago[confirmacionPago.metodo] || configPorMetodoPago.TARJETA;
    const { subtotal = 0, iva = 0, total = 0, detalles = {} } = confirmacionPago;

    return (
      <div className="confirmacion-pago-overlay">
        <div className="confirmacion-pago-modal">
          {/* Fondo con blur */}
          <div 
            className="confirmacion-pago-fondo"
            onClick={handleCancelarPago}
          />
          
          {/* Modal de confirmación */}
          <div 
            className="confirmacion-pago-contenido"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.96) 100%)",
              border: `2px solid ${metodoConfig.borde}`,
              boxShadow: metodoConfig.sombra
            }}
          >
            {/* Icono del método de pago */}
            <div 
              className="confirmacion-pago-icono"
              style={{
                background: metodoConfig.gradiente,
                border: `2px solid ${metodoConfig.borde}`,
                boxShadow: `0 10px 30px ${metodoConfig.colorPrimario}40`
              }}
            >
              {metodoConfig.icono}
            </div>

            {/* Título */}
            <h2 className="confirmacion-pago-titulo">
              Confirmar compra con {metodoConfig.nombre.toLowerCase()}
            </h2>

            {/* Mensaje personalizado por método */}
            <p className="confirmacion-pago-mensaje">
              {confirmacionPago.metodo === "EFECTIVO" && (
                <>
                  ¿Confirmar compra por <strong>${total.toFixed(2)}</strong> en <strong>EFECTIVO</strong>?
                  {detalles.montoRecibido && (
                    <span className="cambio-info">
                      <br />Monto recibido: <strong>${detalles.montoRecibido}</strong>
                      {detalles.montoRecibido > total && (
                        <span className="cambio-positivo">
                          <br />Cambio: <strong>${(detalles.montoRecibido - total).toFixed(2)}</strong>
                        </span>
                      )}
                    </span>
                  )}
                </>
              )}
              {confirmacionPago.metodo === "TARJETA" && (
                <>
                  ¿Confirmar compra por <strong>${total.toFixed(2)}</strong> con <strong>TARJETA</strong>?
                </>
              )}
              {confirmacionPago.metodo === "TRANSFERENCIA" && (
                <>
                  ¿Confirmar compra por <strong>${total.toFixed(2)}</strong> por <strong>TRANSFERENCIA</strong>?
                  {detalles.comprobante && (
                    <span className="comprobante-info">
                      <br />Comprobante: <strong>{detalles.comprobante.name}</strong>
                    </span>
                  )}
                </>
              )}
            </p>

            {/* Detalles del pago */}
            <div className="confirmacion-pago-detalles">
              <div className="detalle-fila">
                <span>Subtotal:</span>
                <span className="detalle-valor">${subtotal.toFixed(2)}</span>
              </div>
              <div className="detalle-fila">
                <span>IVA (12%):</span>
                <span className="detalle-valor">${iva.toFixed(2)}</span>
              </div>
              <div className="detalle-fila total">
                <span>Total a pagar:</span>
                <span className="detalle-total">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Información específica del método */}
            {(confirmacionPago.metodo === "TARJETA" && detalles.tarjeta) && (
              <div className="metodo-info">
                <h3>Método de pago</h3>
                <div className="tarjeta-info">
                  <div className="tarjeta-icono">💳</div>
                  <div>
                    <div className="tarjeta-numero">
                      {detalles.tarjeta.numero || "•••• •••• •••• ••••"}
                    </div>
                    <div className="tarjeta-detalles">
                      {detalles.tarjeta.fecha || "MM / AAAA"} • {detalles.tarjeta.titular || "Nombre del titular"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="confirmacion-pago-botones">
              <button
                className="boton-confirmar"
                onClick={handleConfirmarPago}
                style={{
                  background: `linear-gradient(135deg, ${metodoConfig.colorPrimario} 0%, ${metodoConfig.colorPrimario}90 100%)`
                }}
              >
                Aceptar
              </button>
              <button
                className="boton-cancelar"
                onClick={handleCancelarPago}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay notificación normal, no renderizar
  if (!notificacion.mostrar) return null;

  return (
    <div 
      className={`notificacion-contenedor ${visible ? 'visible' : 'hidden'}`}
      style={getPositionStyle()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        className="notificacion-tarjeta"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.97) 100%)",
          border: `2px solid ${config.borde}`,
          boxShadow: config.sombra
        }}
      >
        {/* Barra de progreso */}
        {showProgress && (
          <div className="notificacion-progreso">
            <div 
              className="progreso-barra"
              style={{
                width: `${progress}%`,
                backgroundColor: config.colorPrimario
              }}
            />
          </div>
        )}

        {/* Icono premium */}
        <div 
          className="notificacion-icono"
          style={{
            background: config.gradiente,
            border: `2px solid ${config.borde}`,
            boxShadow: `0 6px 20px ${config.colorPrimario}30`
          }}
        >
          <div className="icono-fondo"></div>
          <div className="icono-contenido">
            {obtenerIcono()}
          </div>
        </div>

        {/* Contenido */}
        <div className="notificacion-contenido">
          <h3 className="notificacion-titulo">{notificacion.titulo}</h3>
          <p className="notificacion-mensaje">{notificacion.mensaje}</p>
        </div>

        {/* Botón cerrar */}
        <button
          className="notificacion-cerrar"
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>

        {/* Efecto decorativo */}
        <div 
          className="efecto-decorativo"
          style={{
            background: `radial-gradient(circle, ${config.colorPrimario}15 0%, transparent 70%)`
          }}
        />
      </div>
    </div>
  );
};

export default Notificaciones;