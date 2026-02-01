// src/hooks/useNotification.jsx
import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: "success",
    titulo: "",
    mensaje: "",
    icono: ""
  });

  // NUEVO: Estado para confirmación de pago
  const [confirmacionPago, setConfirmacionPago] = useState(null);

  const mostrarNotificacion = useCallback((tipo, titulo, mensaje, icono = null) => {
    const iconosPorTipo = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    };

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
      // Iconos de pago
      efectivo: "💵",
      tarjeta: "💳",
      transferencia: "🏦",
      billete: "💰",
      pago: "💸"
    };

    const iconoFinal = icono 
      ? (iconosPersonalizados[icono] || icono) 
      : iconosPorTipo[tipo];

    setNotificacion({
      mostrar: true,
      tipo,
      titulo,
      mensaje,
      icono: iconoFinal
    });
  }, []);

  // NUEVO: Función para mostrar confirmación de pago
  const mostrarConfirmacionPago = useCallback((metodo, total, detalles = {}, onConfirmar, onCancelar) => {
    const subtotal = total / 1.12;
    const iva = total - subtotal;

    setConfirmacionPago({
      mostrar: true,
      metodo,
      subtotal,
      iva,
      total,
      detalles,
      onConfirmar,
      onCancelar
    });
  }, []);

  // NUEVO: Funciones específicas por método de pago
  const confirmacionesPago = {
    efectivo: (total, montoRecibido, onConfirmar, onCancelar) => 
      mostrarConfirmacionPago("EFECTIVO", total, { montoRecibido }, onConfirmar, onCancelar),
    
    tarjeta: (total, tarjetaInfo, onConfirmar, onCancelar) => 
      mostrarConfirmacionPago("TARJETA", total, { tarjeta: tarjetaInfo }, onConfirmar, onCancelar),
    
    transferencia: (total, comprobante, onConfirmar, onCancelar) => 
      mostrarConfirmacionPago("TRANSFERENCIA", total, { comprobante }, onConfirmar, onCancelar)
  };

  const ocultarNotificacion = useCallback(() => {
    setNotificacion(prev => ({ ...prev, mostrar: false }));
  }, []);

  // NUEVO: Ocultar confirmación de pago
  const ocultarConfirmacionPago = useCallback(() => {
    setConfirmacionPago(null);
  }, []);

  // Funciones predefinidas para uso común
  const notificaciones = {
    // Éxito
    exito: (titulo, mensaje, icono = null) => 
      mostrarNotificacion("success", titulo, mensaje, icono),
    
    exitoAgregarCarrito: (nombreProducto) => 
      mostrarNotificacion("success", "¡Producto agregado!", `${nombreProducto} ha sido añadido al carrito`, "carrito"),
    
    exitoEliminarCarrito: (nombreProducto) => 
      mostrarNotificacion("success", "¡Producto eliminado!", `${nombreProducto} ha sido removido del carrito`, "🗑️"),
    
    exitoCompra: (total) => 
      mostrarNotificacion("success", "¡Compra exitosa!", `Tu compra de $${total.toFixed(2)} ha sido procesada correctamente`, "💰"),
    
    exitoGuardar: () => 
      mostrarNotificacion("success", "¡Guardado!", "Los cambios se han guardado correctamente", "💾"),
    
    // Error
    error: (titulo, mensaje, icono = null) => 
      mostrarNotificacion("error", titulo, mensaje, icono),
    
    errorStock: () => 
      mostrarNotificacion("error", "Sin stock", "Este producto no está disponible por el momento", "caja"),
    
    errorGenerico: (mensaje = "Ha ocurrido un error inesperado") => 
      mostrarNotificacion("error", "Error", mensaje, "❌"),
    
    errorConexion: () => 
      mostrarNotificacion("error", "Error de conexión", "No se pudo conectar con el servidor", "📡"),
    
    // Advertencia
    advertencia: (titulo, mensaje, icono = null) => 
      mostrarNotificacion("warning", titulo, mensaje, icono),
    
    advertenciaLogin: () => 
      mostrarNotificacion("warning", "Inicia sesión", "Debes iniciar sesión para realizar esta acción", "bloqueo"),
    
    advertenciaPermisos: () => 
      mostrarNotificacion("warning", "Acceso restringido", "No tienes permisos para realizar esta acción", "usuario"),
    
    advertenciaCarritoVacio: () => 
      mostrarNotificacion("warning", "Carrito vacío", "Agrega productos para comenzar tu compra", "🛒"),
    
    // Información
    info: (titulo, mensaje, icono = null) => 
      mostrarNotificacion("info", titulo, mensaje, icono),
    
    infoCarritoActualizado: (nombreProducto, cantidad) => 
      mostrarNotificacion("info", "Carrito actualizado", `${nombreProducto}: ${cantidad} unidades`, "🛒"),
    
    infoFavoritoAgregado: (nombreProducto) => 
      mostrarNotificacion("info", "Agregado a favoritos", `${nombreProducto} ha sido guardado en tus favoritos`, "corazon"),
    
    infoProcesoIniciado: () => 
      mostrarNotificacion("info", "Proceso iniciado", "Estamos procesando tu solicitud", "⏱️"),
    
    infoCargaCompletada: () => 
      mostrarNotificacion("info", "Carga completada", "Todos los datos se han cargado correctamente", "✅")
  };

  return {
    notificacion,
    setNotificacion,
    mostrarNotificacion,
    ocultarNotificacion,
    notificaciones,
    // NUEVO: Exportar funciones de confirmación de pago
    confirmacionPago,
    setConfirmacionPago,
    mostrarConfirmacionPago,
    ocultarConfirmacionPago,
    confirmacionesPago
  };
};

export default useNotification;