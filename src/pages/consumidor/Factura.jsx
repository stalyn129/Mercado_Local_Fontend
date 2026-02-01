import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Footer from "../../components/Footer.jsx";
import Notificaciones from "../../components/Notificaciones"; // NUEVO: Importar componente de notificaciones
import useNotification from "../../hooks/useNotification"; // NUEVO: Importar hook de notificaciones

export default function Factura() {
  const { idPedido, idCompra } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [facturaData, setFacturaData] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoFactura, setTipoFactura] = useState("individual");
  const [facturaBackend, setFacturaBackend] = useState(null);
  const [creandoFactura, setCreandoFactura] = useState(false);
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [viendoPDF, setViendoPDF] = useState(false);

  // NUEVO: Usar el hook de notificaciones
  const { notificacion, setNotificacion, notificaciones } = useNotification();

  const facturaRef = useRef();

  // Función para obtener factura del backend
  const obtenerFacturaBackend = async (idPedido) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/api/facturas/pedido/${idPedido}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error obteniendo factura del backend:", error);
      // NUEVO: Mostrar notificación de error
      notificaciones.error("Error de conexión", "No se pudo conectar con el servidor", "📡");
      return null;
    }
  };

  // Función para crear factura en el backend
  const crearFacturaBackend = async (idPedido) => {
    try {
      setCreandoFactura(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/api/facturas`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idPedido })
      });
      
      if (!response.ok) {
        // NUEVO: Mostrar notificación de error
        notificaciones.error("Error al crear", "No se pudo generar la factura", "❌");
        return null;
      }
      
      const nuevaFactura = await response.json();
      setCreandoFactura(false);
      
      // NUEVO: Mostrar notificación de éxito
      notificaciones.exito("Factura creada", "La factura se ha generado correctamente", "📄");
      return nuevaFactura;
    } catch (error) {
      console.error("Error creando factura:", error);
      setCreandoFactura(false);
      // NUEVO: Mostrar notificación de error
      notificaciones.error("Error al crear", "Ocurrió un error al generar la factura", "❌");
      return null;
    }
  };

  // Función simplificada para descargar PDF del backend
  const descargarPDFBackend = async () => {
    if (descargandoPDF) return;
    
    try {
      setDescargandoPDF(true);
      
      if (!facturaBackend || !facturaBackend.idFactura) {
        console.log("No hay factura backend, usando PDF local");
        await descargarPDFLocal();
        return;
      }
      
      const token = localStorage.getItem("authToken");
      
      const response = await fetch(`${API_URL}/api/facturas/${facturaBackend.idFactura}/descargar-pdf`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura_${facturaBackend.numeroFactura || facturaBackend.idFactura}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // NUEVO: Mostrar notificación de éxito
        notificaciones.exito("PDF descargado", "El archivo se ha descargado correctamente", "📥");
      } else {
        throw new Error("Endpoint no disponible");
      }
      
    } catch (error) {
      console.log('Usando PDF local:', error.message);
      // NUEVO: Mostrar notificación informativa
      notificaciones.info("Generando PDF", "Creando versión local del documento", "⚙️");
      await descargarPDFLocal();
    } finally {
      setDescargandoPDF(false);
    }
  };

  // Función simplificada para ver PDF del backend
  const verPDFBackend = async () => {
    if (viendoPDF) return;
    
    try {
      setViendoPDF(true);
      
      if (!facturaBackend || !facturaBackend.idFactura) {
        console.log("No hay factura backend, usando PDF local");
        await verPDFLocal();
        return;
      }
      
      const token = localStorage.getItem("authToken");
      
      const response = await fetch(`${API_URL}/api/facturas/${facturaBackend.idFactura}/pdf`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // NUEVO: Mostrar notificación de éxito
        notificaciones.exito("PDF abierto", "El documento se ha abierto en una nueva pestaña", "👁️");
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 10000);
      } else {
        throw new Error("Endpoint no disponible");
      }
      
    } catch (error) {
      console.log('Usando PDF local:', error.message);
      // NUEVO: Mostrar notificación informativa
      notificaciones.info("Abriendo PDF", "Generando vista previa del documento", "⚙️");
      await verPDFLocal();
    } finally {
      setViendoPDF(false);
    }
  };

  // Función para ver PDF local
  const verPDFLocal = async () => {
    try {
      const elemento = facturaRef.current;
      
      if (!elemento) {
        throw new Error("Elemento de factura no encontrado");
      }
      
      // NUEVO: Mostrar notificación de proceso iniciado
      notificaciones.infoProcesoIniciado();
      
      const originalStyles = {
        boxShadow: elemento.style.boxShadow,
        border: elemento.style.border,
        margin: elemento.style.margin,
        padding: elemento.style.padding
      };
      
      elemento.style.boxShadow = 'none';
      elemento.style.border = '1px solid #e5e7eb';
      elemento.style.margin = '0';
      elemento.style.padding = '20px';
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        windowHeight: elemento.scrollHeight
      });
      
      Object.assign(elemento.style, originalStyles);
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      // NUEVO: Mostrar notificación de éxito
      notificaciones.exito("PDF generado", "La vista previa se ha abierto correctamente", "✅");
      
    } catch (error) {
      console.error('Error generando PDF local:', error);
      // NUEVO: Mostrar notificación de error
      notificaciones.error("Error al generar", "No se pudo crear el PDF", "❌");
    }
  };

  // Función para descargar PDF local
  const descargarPDFLocal = async () => {
    try {
      setDescargandoPDF(true);
      const elemento = facturaRef.current;
      
      if (!elemento) {
        throw new Error("Elemento de factura no encontrado");
      }
      
      // NUEVO: Mostrar notificación de proceso iniciado
      notificaciones.infoProcesoIniciado();
      
      const originalStyles = {
        boxShadow: elemento.style.boxShadow,
        border: elemento.style.border,
        margin: elemento.style.margin,
        padding: elemento.style.padding
      };
      
      elemento.style.boxShadow = 'none';
      elemento.style.border = '1px solid #e5e7eb';
      elemento.style.margin = '0';
      elemento.style.padding = '20px';
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        windowHeight: elemento.scrollHeight
      });
      
      Object.assign(elemento.style, originalStyles);
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const numeroFactura = generarNumeroFactura();
      const nombreArchivo = `Factura_${numeroFactura}.pdf`;
      
      pdf.save(nombreArchivo);
      
      // NUEVO: Mostrar notificación de éxito
      notificaciones.exito("PDF descargado", "El documento se ha guardado en tu dispositivo", "📥");
      
    } catch (error) {
      console.error('Error generando PDF local:', error);
      // NUEVO: Mostrar notificación de error
      notificaciones.error("Error al descargar", "No se pudo generar el archivo PDF", "❌");
    } finally {
      setDescargandoPDF(false);
    }
  };

  // Función para cargar detalles de un pedido
  const cargarDetallesPedido = async (token, idPedido) => {
    try {
      const response = await fetch(`${API_URL}/pedidos/${idPedido}/detalles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar detalles del pedido ${idPedido}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error cargando detalles del pedido ${idPedido}:`, error);
      return [];
    }
  };

  // Función para cargar productos de múltiples pedidos
  const cargarProductosDePedidos = async (token, pedidos) => {
    if (!pedidos || pedidos.length === 0) return [];
    
    const todosLosProductos = [];
    
    for (const pedido of pedidos) {
      const pedidoId = pedido.idPedido || pedido.id;
      if (!pedidoId) continue;
      
      try {
        const detalles = await cargarDetallesPedido(token, pedidoId);
        
        detalles.forEach(detalle => {
          const productoInfo = detalle.producto || {};
          const precioUnitario = detalle.precioUnitario || (detalle.subtotal / (detalle.cantidad || 1)) || 0;
          const cantidad = detalle.cantidad || 1;
          const subtotal = detalle.subtotal || (precioUnitario * cantidad);
          
          todosLosProductos.push({
            idProducto: productoInfo.idProducto || detalle.idProducto,
            nombreProducto: productoInfo.nombreProducto || "Producto",
            precio: precioUnitario,
            cantidad: cantidad,
            subtotal: subtotal,
            idPedido: pedidoId
          });
        });
        
      } catch (error) {
        console.error(`Error procesando pedido ${pedidoId}:`, error);
      }
    }
    
    return todosLosProductos;
  };

  // Convertir detalles de factura backend al formato del frontend
  const convertirDetallesFacturaBackend = (facturaBackend) => {
    if (!facturaBackend.detallesPorVendedor || facturaBackend.detallesPorVendedor.length === 0) {
      return [];
    }
    
    const detalles = [];
    
    facturaBackend.detallesPorVendedor.forEach(vendedorDetalle => {
      vendedorDetalle.productos.forEach(producto => {
        detalles.push({
          nombreProducto: producto.nombre,
          cantidad: producto.cantidad,
          precio: producto.precioUnitario,
          subtotal: producto.subtotal
        });
      });
    });
    
    return detalles;
  };

  // Manejar la creación de factura
  const handleCrearFactura = async () => {
    if (!idPedido) return;
    
    const nuevaFactura = await crearFacturaBackend(idPedido);
    if (nuevaFactura) {
      setFacturaBackend(nuevaFactura);
      setFacturaData(nuevaFactura);
      const detallesConvertidos = convertirDetallesFacturaBackend(nuevaFactura);
      setDetalles(detallesConvertidos);
    }
  };

  // Efecto principal para cargar datos
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // NUEVO: Mostrar notificación de advertencia
      notificaciones.advertenciaLogin();
      setTimeout(() => {
        navigate("/loginmodal");
      }, 1500);
      return;
    }

    setLoading(true);

    const compraUnificadaData = location.state?.compraData;
    
    if (compraUnificadaData) {
      setTipoFactura("consolidada");
      setFacturaData(compraUnificadaData);
      
      cargarProductosDePedidos(token, compraUnificadaData.pedidos || [])
        .then(productos => {
          setDetalles(productos);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error cargando productos:", error);
          setLoading(false);
        });
    } 
    else if (idCompra) {
      setTipoFactura("consolidada");
      
      fetch(`${API_URL}/pedidos/compra-unificada/${idCompra}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`Error ${res.status} al cargar compra unificada`);
          return res.json();
        })
        .then(async (data) => {
          setFacturaData(data);
          
          const productos = await cargarProductosDePedidos(token, data.pedidos || []);
          setDetalles(productos);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error cargando factura consolidada:", err);
          // NUEVO: Mostrar notificación de error
          notificaciones.error("Error al cargar", "No se pudo cargar la información de la compra", "caja");
          setLoading(false);
        });
    }
    else if (idPedido) {
      setTipoFactura("individual");
      
      const cargarDatosCompletos = async () => {
        try {
          const facturaExistente = await obtenerFacturaBackend(idPedido);
          
          if (facturaExistente) {
            setFacturaBackend(facturaExistente);
            setFacturaData(facturaExistente);
            const detallesConvertidos = convertirDetallesFacturaBackend(facturaExistente);
            setDetalles(detallesConvertidos);
            setLoading(false);
            // NUEVO: Mostrar notificación de éxito
            notificaciones.exito("Factura cargada", "Información de factura cargada correctamente", "📄");
            return;
          }
          
          // NUEVO: Mostrar notificación de carga
          notificaciones.info("Cargando datos", "Obteniendo información del pedido...", "📦");
          
          const [pedidoData, detallesData] = await Promise.all([
            fetch(`${API_URL}/pedidos/${idPedido}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
              if (!res.ok) throw new Error(`Error ${res.status} al cargar pedido`);
              return res.json();
            }),
            fetch(`${API_URL}/pedidos/${idPedido}/detalles`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
              if (!res.ok) throw new Error(`Error ${res.status} al cargar detalles`);
              return res.json();
            })
          ]);
          
          setFacturaData(pedidoData);
          setDetalles(detallesData);
          setLoading(false);
          
          // NUEVO: Mostrar notificación de éxito
          notificaciones.exito("Datos cargados", "Información del pedido cargada correctamente", "✅");
          
        } catch (error) {
          console.error("Error cargando datos:", error);
          // NUEVO: Mostrar notificación de error
          notificaciones.error("Error al cargar", "No se pudo cargar la información del pedido", "❌");
          setLoading(false);
        }
      };
      
      cargarDatosCompletos();
    } else {
      setLoading(false);
    }
  }, [idPedido, idCompra, location.state, navigate]);

  // Generar número de factura
  const generarNumeroFactura = () => {
    if (facturaBackend && facturaBackend.numeroFactura) {
      return facturaBackend.numeroFactura;
    }
    
    if (tipoFactura === "consolidada") {
      const compraId = facturaData?.idCompraUnificada || idCompra;
      const idCorto = compraId ? compraId.split('-').pop().substring(0, 6) : "000000";
      return `FAC-CONS-${idCorto}`;
    } else {
      return `FAC-${String(facturaData?.idPedido || "000000").padStart(6, "0")}`;
    }
  };

  // Calcular totales
  const calcularTotales = () => {
    if (facturaBackend) {
      return {
        subtotal: facturaBackend.subtotal || 0,
        iva: facturaBackend.iva || 0,
        total: facturaBackend.total || 0
      };
    }
    
    if (tipoFactura === "consolidada" && detalles.length > 0) {
      const subtotal = detalles.reduce((sum, producto) => {
        return sum + (producto.subtotal || 0);
      }, 0);
      
      const iva = subtotal * 0.12;
      const total = subtotal + iva;
      
      return { subtotal, iva, total };
    }
    
    return { 
      subtotal: facturaData?.subtotal || 0, 
      iva: facturaData?.iva || 0, 
      total: facturaData?.total || 0 
    };
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return fecha.toString();
    }
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      PENDIENTE: { color: "#F59E0B", bg: "#FEF3C7", texto: "Pendiente" },
      PROCESANDO: { color: "#3B82F6", bg: "#DBEAFE", texto: "Procesando" },
      COMPLETADO: { color: "#10B981", bg: "#D1FAE5", texto: "Completado" },
      CANCELADO: { color: "#EF4444", bg: "#FEE2E2", texto: "Cancelado" },
      ENVIADO: { color: "#6366F1", bg: "#E0E7FF", texto: "Enviado" },
      ENTREGADO: { color: "#059669", bg: "#D1FAE5", texto: "Entregado" },
      EMITIDA: { color: "#10B981", bg: "#D1FAE5", texto: "Emitida" },
      ANULADA: { color: "#EF4444", bg: "#FEE2E2", texto: "Anulada" },
      PAGADA: { color: "#10B981", bg: "#D1FAE5", texto: "Pagada" },
      Emitida: { color: "#10B981", bg: "#D1FAE5", texto: "Emitida" },
      Anulada: { color: "#EF4444", bg: "#FEE2E2", texto: "Anulada" },
      Pagada: { color: "#10B981", bg: "#D1FAE5", texto: "Pagada" }
    };
    return estados[estado] || { color: "#6B7280", bg: "#F3F4F6", texto: estado || "Desconocido" };
  };

  // Componente de círculos flotantes con colores de tu app
  const FloatingCircles = () => (
    <div className="floating-circles no-print" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
        top: '10%',
        left: '5%',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        top: '60%',
        right: '10%',
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite 1s'
      }} />
    </div>
  );

  // Determinar si se puede crear factura
  const puedeCrearFactura = !facturaBackend && 
                           tipoFactura === "individual" && 
                           idPedido &&
                           (facturaData?.estadoPago === 'PAGADO' || 
                            facturaData?.estadoPago === 'Pagado' ||
                            facturaData?.estado === 'COMPLETADO');

  // Estados de carga
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <FloatingCircles />
        <div style={{ textAlign: "center", position: 'relative', zIndex: 1 }}>
          <div style={{
            display: "inline-block",
            width: "50px",
            height: "50px",
            border: "4px solid #f1f5f9",
            borderTop: "4px solid #FF6B35",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{
            marginTop: "15px",
            fontSize: "16px",
            color: "#2C3E50",
            fontWeight: "500",
            fontFamily: "'Inter', sans-serif"
          }}>
            Cargando factura...
          </p>
        </div>
      </div>
    );
  }

  // Sin datos
  if (!facturaData) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: 'relative'
      }}>
        <FloatingCircles />
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          border: "2px solid #FF6B35",
          position: 'relative',
          zIndex: 1,
          maxWidth: "400px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px", color: "#FF6B35" }}>❌</div>
          <h2 style={{ 
            color: "#2C3E50", 
            marginBottom: "10px", 
            fontSize: "20px", 
            fontWeight: "700",
            fontFamily: "'Inter', sans-serif"
          }}>Error al cargar</h2>
          <p style={{ 
            color: "#64748b", 
            marginBottom: "25px", 
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif"
          }}>
            No se pudo cargar la información de la factura
          </p>
          <button
            onClick={() => {
              // NUEVO: Mostrar notificación al volver
              notificaciones.info("Redirigiendo", "Volviendo a tus pedidos...", "📍");
              setTimeout(() => {
                navigate("/mis-pedidos");
              }, 1000);
            }}
            style={{
              padding: "14px 28px",
              background: "#FF6B35",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#FF8E53";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#FF6B35";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Volver a mis pedidos
          </button>
        </div>
      </div>
    );
  }

  const estadoInfo = facturaBackend 
    ? getEstadoInfo(facturaBackend.estado)
    : tipoFactura === "consolidada" 
      ? getEstadoInfo(facturaData.estadoCompra || "PROCESANDO")
      : getEstadoInfo(facturaData.estadoPedido);
      
  const numeroFactura = generarNumeroFactura();
  const totales = calcularTotales();

  return (
    <>
      {/* NUEVO: Componente de notificaciones */}
      <Notificaciones
        notificacion={notificacion}
        setNotificacion={setNotificacion}
        position="top-right"
        autoClose={4000}
        showProgress={true}
        pauseOnHover={true}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* ESTILOS DE IMPRESIÓN */
        @media print {
          body * {
            visibility: hidden;
          }

          .factura-container,
          .factura-container * {
            visibility: visible;
          }

          .factura-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 15mm !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 12px !important;
            color: #2C3E50 !important;
            font-family: 'Inter', sans-serif !important;
          }

          .no-print,
          .floating-circles,
          .no-print * {
            display: none !important;
            visibility: hidden !important;
          }

          .factura-container table {
            border-collapse: collapse !important;
          }
          
          .factura-container th,
          .factura-container td {
            border: 1px solid #e5e7eb !important;
            padding: 6px 8px !important;
          }
          
          .factura-container th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "20px",
        position: 'relative',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <FloatingCircles />

        {/* ALERTA SI NO HAY FACTURA */}
        {puedeCrearFactura && !creandoFactura && (
          <div className="no-print" style={{
            maxWidth: "800px",
            margin: "0 auto 20px auto",
            background: "white",
            color: "#2C3E50",
            padding: "20px 25px",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            border: "2px solid #FF6B35"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{
                fontSize: "24px",
                color: "#FF6B35"
              }}>
                ⚠️
              </div>
              <div>
                <div style={{ 
                  fontWeight: "700", 
                  fontSize: "16px", 
                  marginBottom: "4px",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Factura no generada
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#64748b",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Este pedido está pagado pero no tiene factura. Genere la factura para efectos tributarios.
                </div>
              </div>
            </div>
            <button
              onClick={handleCrearFactura}
              disabled={creandoFactura}
              style={{
                padding: "12px 24px",
                background: "#FF6B35",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minWidth: "180px",
                opacity: creandoFactura ? 0.7 : 1,
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                if (!creandoFactura) {
                  e.target.style.background = "#FF8E53";
                  e.target.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!creandoFactura) {
                  e.target.style.background = "#FF6B35";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              {creandoFactura ? (
                <>
                  <span>⏳</span>
                  Generando...
                </>
              ) : (
                <>
                  <span>📄</span>
                  Generar Factura
                </>
              )}
            </button>
          </div>
        )}

        {/* FACTURA */}
        <div
          ref={facturaRef}
          className="factura-container"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            border: facturaBackend ? "2px solid #10B981" : "2px solid #FF6B35",
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* BADGE DE FACTURA OFICIAL */}
          {facturaBackend && (
            <div style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "#10B981",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
              zIndex: 2,
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
            }}>
              📋 Factura Oficial
            </div>
          )}

          {/* ENCABEZADO CON LOGO */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "25px",
            paddingBottom: "20px",
            borderBottom: "2px solid #f1f5f9"
          }}>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "24px",
                fontWeight: "700",
                color: "#FF6B35",
                marginBottom: "4px",
                letterSpacing: "1px"
              }}>
                MY HARVEST
              </div>
              <div style={{
                fontSize: "12px",
                color: "#64748b",
                letterSpacing: "1px",
                fontWeight: "500",
                fontFamily: "'Inter', sans-serif"
              }}>
                MERCADO LOCAL
              </div>
            </div>
            
            <div style={{
              textAlign: "right"
            }}>
              <div style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "28px",
                fontWeight: "800",
                color: "#2C3E50",
                marginBottom: "8px"
              }}>
                FACTURA
              </div>
              {tipoFactura === "consolidada" && (
                <div style={{
                  fontSize: "12px",
                  color: "#8B5CF6",
                  fontWeight: "700",
                  background: "#F3E5F5",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  display: "inline-block",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Consolidada
                </div>
              )}
            </div>
          </div>

          {/* NÚMERO DE FACTURA */}
          <div style={{
            textAlign: "center",
            padding: "25px",
            marginBottom: "30px",
            background: facturaBackend ? "#D1FAE5" : "#FFF2E8",
            borderRadius: "12px",
            border: facturaBackend ? "2px solid #10B981" : "2px solid #FF6B35"
          }}>
            <div style={{
              fontSize: "11px",
              color: facturaBackend ? "#10B981" : "#FF6B35",
              fontWeight: "700",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontFamily: "'Inter', sans-serif"
            }}>
              N° FACTURA
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: "800",
              color: facturaBackend ? "#10B981" : "#FF6B35",
              marginBottom: "4px",
              fontFamily: "'Inter', sans-serif"
            }}>
              {numeroFactura}
            </div>
            <div style={{ 
              fontSize: "13px", 
              color: "#94a3b8",
              fontFamily: "'Inter', sans-serif"
            }}>
              {tipoFactura === "consolidada" 
                ? `Compra #${facturaData.idCompraUnificada || idCompra}` 
                : `Pedido #${facturaData.idPedido}`}
            </div>
          </div>

          {/* DETALLES DEL PEDIDO - DISEÑO MEJORADO (2 FILAS) */}
          <div style={{
            marginBottom: "30px"
          }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#2C3E50",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'Inter', sans-serif"
            }}>
              <span style={{ color: "#FF6B35" }}>📋</span>
              {tipoFactura === "consolidada" ? "Detalles de la Compra" : "Detalles del Pedido"}
            </h3>
            
            <div style={{
              background: facturaBackend ? "#F0FDF4" : "#FFF7ED",
              padding: "25px",
              borderRadius: "12px",
              border: facturaBackend ? "2px solid #86EFAC" : "2px solid #FDBA74",
              boxShadow: facturaBackend 
                ? "0 2px 8px rgba(22, 163, 74, 0.1)" 
                : "0 2px 8px rgba(251, 146, 60, 0.1)"
            }}>
              {/* PRIMERA FILA - Fecha y Método de pago */}
              <div style={{
                display: "flex",
                gap: "20px",
                marginBottom: "15px"
              }}>
                {/* FECHA DE EMISIÓN */}
                <div style={{
                  flex: 1,
                  background: "white",
                  padding: "16px",
                  borderRadius: "10px",
                  border: facturaBackend ? "1px solid #86EFAC" : "1px solid #FDBA74",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{
                    fontSize: "11px",
                    color: facturaBackend ? "#10B981" : "#FF6B35",
                    marginBottom: "6px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Fecha de emisión
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#2C3E50",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {facturaBackend 
                      ? formatearFecha(facturaBackend.fechaEmision)
                      : formatearFecha(facturaData.fechaCompra || facturaData.fechaPedido)
                    }
                  </div>
                </div>

                {/* MÉTODO DE PAGO */}
                <div style={{
                  flex: 1,
                  background: "white",
                  padding: "16px",
                  borderRadius: "10px",
                  border: facturaBackend ? "1px solid #86EFAC" : "1px solid #FDBA74",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{
                    fontSize: "11px",
                    color: facturaBackend ? "#10B981" : "#FF6B35",
                    marginBottom: "6px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Método de pago
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#2C3E50",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {facturaBackend?.metodoPago || 
                     (facturaData.metodoPago === "EFECTIVO" && "Efectivo") ||
                     (facturaData.metodoPago === "TRANSFERENCIA" && "Transferencia") ||
                     (facturaData.metodoPago === "TARJETA" && "Tarjeta") ||
                     facturaData.metodoPago || "No especificado"}
                  </div>
                </div>
              </div>

              {/* SEGUNDA FILA - N° de Pedido/Compra y Pedidos incluidos */}
              <div style={{
                display: "flex",
                gap: "20px"
              }}>
                {/* N° DE PEDIDO/COMPRA */}
                <div style={{
                  flex: 1,
                  background: "white",
                  padding: "16px",
                  borderRadius: "10px",
                  border: facturaBackend ? "1px solid #86EFAC" : "1px solid #FDBA74",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{
                    fontSize: "11px",
                    color: facturaBackend ? "#10B981" : "#FF6B35",
                    marginBottom: "6px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {tipoFactura === "consolidada" ? "N° de Compra" : "N° de Pedido"}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#2C3E50",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {tipoFactura === "consolidada" 
                      ? `#${facturaData.idCompraUnificada || idCompra}` 
                      : `#${facturaData.idPedido}`}
                  </div>
                </div>

                {/* PEDIDOS INCLUIDOS (solo para consolidada) o ESTADO */}
                <div style={{
                  flex: 1,
                  background: "white",
                  padding: "16px",
                  borderRadius: "10px",
                  border: facturaBackend ? "1px solid #86EFAC" : "1px solid #FDBA74",
                  transition: "all 0.3s ease"
                }}>
                  {tipoFactura === "consolidada" && facturaData.cantidadPedidos ? (
                    <>
                      <div style={{
                        fontSize: "11px",
                        color: facturaBackend ? "#10B981" : "#FF6B35",
                        marginBottom: "6px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Pedidos incluidos
                      </div>
                      <div style={{
                        fontSize: "14px",
                        color: "#2C3E50",
                        fontWeight: "600",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {facturaData.cantidadPedidos} pedido(s)
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        fontSize: "11px",
                        color: facturaBackend ? "#10B981" : "#FF6B35",
                        marginBottom: "6px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Estado
                      </div>
                      <div style={{
                        fontSize: "14px",
                        color: "#2C3E50",
                        fontWeight: "600",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {facturaData.estadoPedido || facturaData.estado || "No especificado"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL CLIENTE (solo para facturas oficiales) */}
          {facturaBackend && (
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#2C3E50",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Inter', sans-serif"
              }}>
                <span style={{ color: "#FF6B35" }}>👤</span>
                Información del Cliente
              </h3>
              
              <div style={{
                background: "#F0F9FF",
                padding: "25px",
                borderRadius: "12px",
                border: "2px solid #BAE6FD",
                boxShadow: "0 2px 8px rgba(56, 189, 248, 0.1)"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px"
                }}>
                  <div>
                    <div style={{
                      fontSize: "11px",
                      color: "#0EA5E9",
                      marginBottom: "6px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Cliente
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#2C3E50",
                      fontWeight: "600",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {facturaBackend.nombreCliente} {facturaBackend.apellidoCliente}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      fontSize: "11px",
                      color: "#0EA5E9",
                      marginBottom: "6px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Cédula/RUC
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#2C3E50",
                      fontWeight: "600",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {facturaBackend.cedulaCliente}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      fontSize: "11px",
                      color: "#0EA5E9",
                      marginBottom: "6px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Email
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#2C3E50",
                      fontWeight: "600",
                      fontFamily: "'Inter', sans-serif",
                      wordBreak: "break-word"
                    }}>
                      {facturaBackend.correoCliente}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTOS */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#2C3E50",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'Inter', sans-serif"
            }}>
              <span style={{ color: "#FF6B35" }}>📦</span>
              {tipoFactura === "consolidada" ? "Productos de la Compra" : "Productos del Pedido"}
            </h3>

            {detalles.length === 0 ? (
              <div style={{
                background: "#F8F9FA",
                padding: "30px",
                borderRadius: "12px",
                textAlign: "center",
                border: "2px dashed #e5e7eb"
              }}>
                <div style={{ fontSize: "36px", marginBottom: "12px", color: "#94a3b8" }}>
                  🛒
                </div>
                <p style={{ 
                  color: "#64748b", 
                  fontSize: "14px",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  No se encontraron productos para mostrar
                </p>
              </div>
            ) : (
              <div style={{
                overflowX: "auto",
                borderRadius: "12px",
                border: "1px solid #e5e7eb"
              }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "500px"
                }}>
                  <thead>
                    <tr style={{
                      background: "#FF6B35",
                      color: "white"
                    }}>
                      <th style={{
                        padding: "16px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Producto
                      </th>
                      <th style={{
                        padding: "16px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        width: "80px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Cant.
                      </th>
                      <th style={{
                        padding: "16px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        width: "100px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Precio Unit.
                      </th>
                      <th style={{
                        padding: "16px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        width: "100px",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((d, i) => {
                      const precio = d.precio || d.precioUnitario || 0;
                      const cantidad = d.cantidad || 1;
                      const subtotal = d.subtotal || (precio * cantidad);
                      
                      return (
                        <tr 
                          key={i} 
                          style={{
                            borderBottom: i < detalles.length - 1 ? "1px solid #f1f5f9" : "none",
                            backgroundColor: i % 2 === 0 ? "white" : "#f8f9fa"
                          }}
                        >
                          <td style={{
                            padding: "16px",
                            fontSize: "14px",
                            color: "#2C3E50",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: "500"
                          }}>
                            {d.nombreProducto || d.producto?.nombreProducto || d.nombre || "Producto"}
                          </td>
                          <td style={{
                            padding: "16px",
                            textAlign: "center",
                            fontSize: "14px",
                            color: "#2C3E50",
                            fontWeight: "600",
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            {cantidad}
                          </td>
                          <td style={{
                            padding: "16px",
                            textAlign: "right",
                            fontSize: "14px",
                            color: "#64748b",
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            ${precio.toFixed(2)}
                          </td>
                          <td style={{
                            padding: "16px",
                            textAlign: "right",
                            fontSize: "14px",
                            color: "#FF6B35",
                            fontWeight: "700",
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            ${subtotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TOTALES */}
          <div style={{
            background: facturaBackend ? "#D1FAE5" : "#FFF2E8",
            padding: "30px",
            borderRadius: "12px",
            border: facturaBackend ? "2px solid #10B981" : "2px solid #FF6B35",
            marginBottom: "25px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px"
            }}>
              <span style={{ 
                fontSize: "15px", 
                color: "#64748b",
                fontWeight: "500",
                fontFamily: "'Inter', sans-serif"
              }}>
                Subtotal
              </span>
              <span style={{ 
                fontSize: "16px", 
                fontWeight: "600", 
                color: "#2C3E50",
                fontFamily: "'Inter', sans-serif"
              }}>
                ${totales.subtotal.toFixed(2)}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
              paddingBottom: "20px",
              borderBottom: facturaBackend ? "2px solid #34D399" : "2px solid #FF8E53"
            }}>
              <span style={{ 
                fontSize: "15px", 
                color: "#64748b",
                fontWeight: "500",
                fontFamily: "'Inter', sans-serif"
              }}>
                IVA (12%)
              </span>
              <span style={{ 
                fontSize: "16px", 
                fontWeight: "600", 
                color: "#2C3E50",
                fontFamily: "'Inter', sans-serif"
              }}>
                ${totales.iva.toFixed(2)}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#2C3E50",
                  marginBottom: "6px",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  TOTAL A PAGAR
                </div>
                {facturaBackend && (
                  <div style={{
                    fontSize: "12px",
                    color: "#10B981",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Factura registrada en sistema
                  </div>
                )}
                {tipoFactura === "consolidada" && !facturaBackend && (
                  <div style={{
                    fontSize: "12px",
                    color: "#8B5CF6",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Incluye todos los productos
                  </div>
                )}
              </div>
              <div style={{
                fontSize: "32px",
                fontWeight: "800",
                color: facturaBackend ? "#10B981" : "#FF6B35",
                fontFamily: "'Inter', sans-serif"
              }}>
                ${totales.total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            paddingTop: "25px",
            borderTop: "2px solid #f1f5f9",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "#FF6B35",
              marginBottom: "10px",
              fontFamily: "'Inter', sans-serif"
            }}>
              My Harvest
            </div>
            <p style={{
              fontSize: "14px",
              color: "#64748b",
              margin: "0 0 10px 0",
              lineHeight: "1.6",
              fontFamily: "'Inter', sans-serif"
            }}>
              Gracias por confiar en nuestra plataforma de productos frescos y locales
            </p>
            <p style={{
              fontSize: "12px",
              color: "#94a3b8",
              margin: 0,
              fontWeight: "500",
              fontFamily: "'Inter', sans-serif"
            }}>
              {facturaBackend 
                ? "Documento válido para efectos tributarios" 
                : "Documento informativo - Genere la factura oficial para efectos tributarios"}
            </p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="no-print" style={{
          maxWidth: "800px",
          margin: "40px auto 0 auto",
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          {/* BOTÓN PARA CREAR FACTURA SI NO EXISTE */}
          {puedeCrearFactura && !creandoFactura && (
            <button
              onClick={handleCrearFactura}
              disabled={creandoFactura}
              style={{
                padding: "16px 28px",
                background: "#FF6B35",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.3s ease",
                opacity: creandoFactura ? 0.7 : 1,
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 4px 12px rgba(255, 107, 53, 0.2)"
              }}
              onMouseEnter={(e) => {
                if (!creandoFactura) {
                  e.target.style.background = "#FF8E53";
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!creandoFactura) {
                  e.target.style.background = "#FF6B35";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.2)";
                }
              }}
            >
              {creandoFactura ? (
                <>
                  <span>⏳</span>
                  Generando...
                </>
              ) : (
                <>
                  <span>📄</span>
                  Generar Factura Oficial
                </>
              )}
            </button>
          )}

          <button
            onClick={descargarPDFBackend}
            disabled={descargandoPDF}
            style={{
              padding: "16px 28px",
              background: facturaBackend ? "#10B981" : "#FF6B35",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              opacity: descargandoPDF ? 0.7 : 1,
              fontFamily: "'Inter', sans-serif",
              boxShadow: facturaBackend 
                ? "0 4px 12px rgba(16, 185, 129, 0.2)" 
                : "0 4px 12px rgba(255, 107, 53, 0.2)"
            }}
            onMouseEnter={(e) => {
              if (!descargandoPDF) {
                e.target.style.background = facturaBackend ? "#34D399" : "#FF8E53";
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = facturaBackend 
                  ? "0 6px 20px rgba(16, 185, 129, 0.3)" 
                  : "0 6px 20px rgba(255, 107, 53, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!descargandoPDF) {
                e.target.style.background = facturaBackend ? "#10B981" : "#FF6B35";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = facturaBackend 
                  ? "0 4px 12px rgba(16, 185, 129, 0.2)" 
                  : "0 4px 12px rgba(255, 107, 53, 0.2)";
              }
            }}
          >
            {descargandoPDF ? (
              <>
                <span>⏳</span>
                Descargando...
              </>
            ) : (
              <>
                <span>📥</span>
                Descargar PDF
              </>
            )}
          </button>

          <button
            onClick={verPDFBackend}
            disabled={viendoPDF}
            style={{
              padding: "16px 28px",
              background: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              opacity: viendoPDF ? 0.7 : 1,
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
            }}
            onMouseEnter={(e) => {
              if (!viendoPDF) {
                e.target.style.background = "#2563EB";
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!viendoPDF) {
                e.target.style.background = "#3B82F6";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.2)";
              }
            }}
          >
            {viendoPDF ? (
              <>
                <span>⏳</span>
                Cargando...
              </>
            ) : (
              <>
                <span>👁️</span>
                Ver PDF
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: "16px 28px",
              background: "white",
              color: facturaBackend ? "#10B981" : "#FF6B35",
              border: `2px solid ${facturaBackend ? "#10B981" : "#FF6B35"}`,
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = facturaBackend ? "#D1FAE5" : "#FFF2E8";
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
            }}
          >
            <span>🖨️</span>
            Imprimir
          </button>

          {/* BOTÓN VER PEDIDO/COMPRA */}
          {tipoFactura === "consolidada" ? (
            <button
              onClick={() => {
                // NUEVO: Mostrar notificación al navegar
                notificaciones.info("Redirigiendo", "Cargando compra unificada...", "🛍️");
                setTimeout(() => {
                  navigate(`/mi-compra-unificada/${facturaData.idCompraUnificada || idCompra}`, {
                    state: { compraData: facturaData }
                  });
                }, 500);
              }}
              style={{
                padding: "16px 28px",
                background: "white",
                color: "#2C3E50",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
            }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8f9fa";
                e.target.style.borderColor = "#2C3E50";
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
              }}
            >
              <span>🛍️</span>
              Ver compra unificada
            </button>
          ) : (
            <button
              onClick={() => {
                // NUEVO: Mostrar notificación al navegar
                notificaciones.info("Redirigiendo", "Cargando detalles del pedido...", "📦");
                setTimeout(() => {
                  navigate(`/pedido/${idPedido}`);
                }, 500);
              }}
              style={{
                padding: "16px 28px",
                background: "white",
                color: "#2C3E50",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.3s ease",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8f9fa";
                e.target.style.borderColor = "#2C3E50";
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
              }}
            >
              <span>📦</span>
              Ver pedido
            </button>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}