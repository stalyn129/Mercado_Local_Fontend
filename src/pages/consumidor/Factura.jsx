import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Footer from "../../components/Footer.jsx";

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
  const [error, setError] = useState(null);
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [viendoPDF, setViendoPDF] = useState(false);

  const facturaRef = useRef();

  // Función para mostrar toast
  const mostrarToast = (mensaje, tipo = "info") => {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      max-width: 400px;
    `;
    
    if (tipo === "success") {
      toast.style.backgroundColor = "#10B981";
    } else if (tipo === "error") {
      toast.style.backgroundColor = "#EF4444";
    } else if (tipo === "warning") {
      toast.style.backgroundColor = "#F59E0B";
    } else {
      toast.style.backgroundColor = "#3B82F6";
    }
    
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
    
    if (!document.getElementById("toast-styles")) {
      const style = document.createElement("style");
      style.id = "toast-styles";
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  };

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
      return null;
    }
  };

  // Función para crear factura en el backend
  const crearFacturaBackend = async (idPedido) => {
    try {
      setCreandoFactura(true);
      setError(null);
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
        return null;
      }
      
      const nuevaFactura = await response.json();
      setCreandoFactura(false);
      
      mostrarToast("✅ Factura creada exitosamente", "success");
      return nuevaFactura;
    } catch (error) {
      console.error("Error creando factura:", error);
      setCreandoFactura(false);
      return null;
    }
  };

  // Función simplificada para descargar PDF del backend
  const descargarPDFBackend = async () => {
    if (descargandoPDF) return;
    
    try {
      setDescargandoPDF(true);
      
      // Si no hay factura en backend, usar PDF local
      if (!facturaBackend || !facturaBackend.idFactura) {
        console.log("No hay factura backend, usando PDF local");
        await descargarPDFLocal();
        return;
      }
      
      const token = localStorage.getItem("authToken");
      
      // Intentar con el endpoint que existe (según tu controller)
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
        
        mostrarToast("📥 PDF descargado del servidor", "success");
      } else {
        // Si falla, usar PDF local
        throw new Error("Endpoint no disponible");
      }
      
    } catch (error) {
      console.log('Usando PDF local:', error.message);
      mostrarToast("📄 Generando PDF local...", "info");
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
      
      // Si no hay factura en backend, usar PDF local
      if (!facturaBackend || !facturaBackend.idFactura) {
        console.log("No hay factura backend, usando PDF local");
        await verPDFLocal();
        return;
      }
      
      const token = localStorage.getItem("authToken");
      
      // Intentar con el endpoint que existe
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
        
        // Liberar memoria después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 10000);
      } else {
        // Si falla, usar PDF local
        throw new Error("Endpoint no disponible");
      }
      
    } catch (error) {
      console.log('Usando PDF local:', error.message);
      mostrarToast("👁️ Abriendo PDF local...", "info");
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
      
      // Aplicar estilos optimizados para PDF
      const originalStyles = {
        boxShadow: elemento.style.boxShadow,
        border: elemento.style.border,
        margin: elemento.style.margin,
        padding: elemento.style.padding
      };
      
      elemento.style.boxShadow = 'none';
      elemento.style.border = '1px solid #ddd';
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
      
      // Restaurar estilos originales
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
      
      // Abrir en nueva ventana
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
    } catch (error) {
      console.error('Error generando PDF local:', error);
      mostrarToast("❌ Error generando PDF", "error");
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
      
      // Aplicar estilos optimizados para PDF
      const originalStyles = {
        boxShadow: elemento.style.boxShadow,
        border: elemento.style.border,
        margin: elemento.style.margin,
        padding: elemento.style.padding
      };
      
      elemento.style.boxShadow = 'none';
      elemento.style.border = '1px solid #ddd';
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
      
      // Restaurar estilos originales
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
      mostrarToast("📥 PDF descargado exitosamente", "success");
      
    } catch (error) {
      console.error('Error generando PDF local:', error);
      mostrarToast("❌ Error generando PDF", "error");
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
      navigate("/loginmodal");
      return;
    }

    setLoading(true);
    setError(null);

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
          setLoading(false);
        });
    }
    else if (idPedido) {
      setTipoFactura("individual");
      
      const cargarDatosCompletos = async () => {
        try {
          // 1. Intentar obtener factura del backend
          const facturaExistente = await obtenerFacturaBackend(idPedido);
          
          if (facturaExistente) {
            setFacturaBackend(facturaExistente);
            setFacturaData(facturaExistente);
            const detallesConvertidos = convertirDetallesFacturaBackend(facturaExistente);
            setDetalles(detallesConvertidos);
            setLoading(false);
            return;
          }
          
          // 2. Si no hay factura, cargar datos del pedido
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
          
        } catch (error) {
          console.error("Error cargando datos:", error);
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

  // Componente de círculos flotantes
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
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
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
        backgroundColor: 'rgba(52, 152, 219, 0.08)',
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
            border: "4px solid #f0f0f0",
            borderTop: "4px solid #FF6B35",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{
            marginTop: "15px",
            fontSize: "16px",
            color: "#1F2937",
            fontWeight: "500"
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
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #FF6B35",
          position: 'relative',
          zIndex: 1,
          maxWidth: "400px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px", color: "#FF6B35" }}>❌</div>
          <h2 style={{ color: "#1F2937", marginBottom: "10px", fontSize: "20px", fontWeight: "600" }}>Error al cargar</h2>
          <p style={{ color: "#6B7280", marginBottom: "25px", fontSize: "14px" }}>
            No se pudo cargar la información de la factura
          </p>
          <button
            onClick={() => navigate("/mis-pedidos")}
            style={{
              padding: "12px 24px",
              background: "#FF6B35",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#FF8E53";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#FF6B35";
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
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
            color: black !important;
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
            border: 1px solid #ddd !important;
            padding: 6px 8px !important;
          }
          
          .factura-container th {
            background-color: #f5f5f5 !important;
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
        fontFamily: "'Inter', sans-serif"
      }}>
        <FloatingCircles />

        {/* ALERTA SI NO HAY FACTURA */}
        {puedeCrearFactura && !creandoFactura && (
          <div className="no-print" style={{
            maxWidth: "800px",
            margin: "0 auto 20px auto",
            background: "linear-gradient(135deg, #FF6B35, #FF8E53)",
            color: "white",
            padding: "15px 20px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)"
          }}>
            <div>
              <div style={{ fontWeight: "600", fontSize: "16px", marginBottom: "4px" }}>
                ⚠️ Factura no generada
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Este pedido está pagado pero no tiene factura. Genere la factura para efectos tributarios.
              </div>
            </div>
            <button
              onClick={handleCrearFactura}
              disabled={creandoFactura}
              style={{
                padding: "10px 20px",
                background: "white",
                color: "#FF6B35",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minWidth: "150px",
                opacity: creandoFactura ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!creandoFactura) e.target.style.background = "#FFF2E8";
              }}
              onMouseLeave={(e) => {
                if (!creandoFactura) e.target.style.background = "white";
              }}
            >
              {creandoFactura ? (
                <>
                  <span style={{ marginRight: "8px" }}>⏳</span>
                  Generando...
                </>
              ) : (
                <>
                  <span style={{ marginRight: "8px" }}>📄</span>
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
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
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
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
              zIndex: 2
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
            borderBottom: "2px solid #FFD3BE"
          }}>
            <div>
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#FF6B35",
                marginBottom: "4px"
              }}>
                MY HARVEST
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6B7280",
                letterSpacing: "1px"
              }}>
                MERCADO LOCAL
              </div>
            </div>
            
            <div style={{
              textAlign: "right"
            }}>
              <div style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "#1F2937",
                marginBottom: "8px"
              }}>
                FACTURA
              </div>
              {tipoFactura === "consolidada" && (
                <div style={{
                  fontSize: "12px",
                  color: "#9C27B0",
                  fontWeight: "600",
                  background: "#F3E5F5",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  display: "inline-block"
                }}>
                  Consolidada
                </div>
              )}
            </div>
          </div>

          {/* NÚMERO DE FACTURA */}
          <div style={{
            textAlign: "center",
            padding: "20px",
            marginBottom: "25px",
            background: facturaBackend ? "#D1FAE5" : "#FFF2E8",
            borderRadius: "8px",
            border: facturaBackend ? "1px dashed #10B981" : "1px dashed #FF6B35"
          }}>
            <div style={{
              fontSize: "11px",
              color: facturaBackend ? "#10B981" : "#FF6B35",
              fontWeight: "600",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "1.5px"
            }}>
              N° FACTURA
            </div>
            <div style={{
              fontSize: "24px",
              fontWeight: "800",
              color: facturaBackend ? "#10B981" : "#FF6B35",
              marginBottom: "4px"
            }}>
              {numeroFactura}
            </div>
            <div style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {tipoFactura === "consolidada" 
                ? `Compra #${facturaData.idCompraUnificada || idCompra}` 
                : `Pedido #${facturaData.idPedido}`}
            </div>
          </div>

          {/* INFORMACIÓN EN 2 COLUMNAS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px",
            marginBottom: "30px"
          }}>
            {/* DETALLES */}
            <div>
              <h3 style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span style={{ color: "#FF6B35" }}>📋</span>
                {tipoFactura === "consolidada" ? "Detalles de la Compra" : "Detalles del Pedido"}
              </h3>
              
              <div style={{
                background: "#F8F9FA",
                padding: "18px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{
                    fontSize: "11px",
                    color: "#6B7280",
                    marginBottom: "4px"
                  }}>
                    Fecha de emisión
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#1F2937",
                    fontWeight: "600"
                  }}>
                    {facturaBackend 
                      ? formatearFecha(facturaBackend.fechaEmision)
                      : formatearFecha(facturaData.fechaCompra || facturaData.fechaPedido)
                    }
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div style={{
                    fontSize: "11px",
                    color: "#6B7280",
                    marginBottom: "4px"
                  }}>
                    Método de pago
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#1F2937",
                    fontWeight: "600"
                  }}>
                    {facturaBackend?.metodoPago || 
                     (facturaData.metodoPago === "EFECTIVO" && "Efectivo") ||
                     (facturaData.metodoPago === "TRANSFERENCIA" && "Transferencia") ||
                     (facturaData.metodoPago === "TARJETA" && "Tarjeta") ||
                     facturaData.metodoPago || "No especificado"}
                  </div>
                </div>

                {/* DATOS DEL CLIENTE SI HAY FACTURA BACKEND */}
                {facturaBackend && (
                  <>
                    <div style={{ marginBottom: "8px", paddingTop: "12px", borderTop: "1px solid #E5E7EB" }}>
                      <div style={{
                        fontSize: "11px",
                        color: "#6B7280",
                        marginBottom: "4px"
                      }}>
                        Cliente
                      </div>
                      <div style={{
                        fontSize: "14px",
                        color: "#1F2937",
                        fontWeight: "600"
                      }}>
                        {facturaBackend.nombreCliente} {facturaBackend.apellidoCliente}
                      </div>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{
                        fontSize: "11px",
                        color: "#6B7280",
                        marginBottom: "4px"
                      }}>
                        Cédula/RUC
                      </div>
                      <div style={{
                        fontSize: "14px",
                        color: "#1F2937",
                        fontWeight: "600"
                      }}>
                        {facturaBackend.cedulaCliente}
                      </div>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{
                        fontSize: "11px",
                        color: "#6B7280",
                        marginBottom: "4px"
                      }}>
                        Email
                      </div>
                      <div style={{
                        fontSize: "14px",
                        color: "#1F2937",
                        fontWeight: "600"
                      }}>
                        {facturaBackend.correoCliente}
                      </div>
                    </div>
                  </>
                )}

                {tipoFactura === "consolidada" && facturaData.cantidadPedidos && (
                  <div>
                    <div style={{
                      fontSize: "11px",
                      color: "#6B7280",
                      marginBottom: "4px"
                    }}>
                      Pedidos incluidos
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#1F2937",
                      fontWeight: "600"
                    }}>
                      {facturaData.cantidadPedidos} pedido(s)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ESTADO */}
            <div>
              <h3 style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span style={{ color: "#FF6B35" }}>📊</span>
                Estado Actual
              </h3>
              
              <div style={{
                background: estadoInfo.bg,
                border: `2px solid ${estadoInfo.color}`,
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: "600"
                }}>
                  ESTADO ACTUAL
                </div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: estadoInfo.color,
                  marginBottom: "8px"
                }}>
                  {estadoInfo.texto}
                </div>
                {tipoFactura === "consolidada" && (
                  <div style={{
                    fontSize: "11px",
                    color: estadoInfo.color,
                    fontStyle: "italic"
                  }}>
                    Todos los pedidos están {estadoInfo.texto.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRODUCTOS - SIN COLUMNA VENDEDOR */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ color: "#FF6B35" }}>📦</span>
              {tipoFactura === "consolidada" ? "Productos de la Compra" : "Productos del Pedido"}
            </h3>

            {detalles.length === 0 ? (
              <div style={{
                background: "#F8F9FA",
                padding: "30px",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px dashed #E5E7EB"
              }}>
                <div style={{ fontSize: "36px", marginBottom: "12px", color: "#9CA3AF" }}>
                  🛒
                </div>
                <p style={{ color: "#6B7280", fontSize: "14px" }}>
                  No se encontraron productos para mostrar
                </p>
              </div>
            ) : (
              <div style={{
                overflowX: "auto"
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
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        Producto
                      </th>
                      <th style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        width: "80px"
                      }}>
                        Cant.
                      </th>
                      <th style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        width: "100px"
                      }}>
                        Precio Unit.
                      </th>
                      <th style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        width: "100px"
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
                            borderBottom: i < detalles.length - 1 ? "1px solid #ECF2E3" : "none",
                            backgroundColor: i % 2 === 0 ? "white" : "#FAFBF9"
                          }}
                        >
                          <td style={{
                            padding: "12px 16px",
                            fontSize: "14px",
                            color: "#1F2937"
                          }}>
                            {d.nombreProducto || d.producto?.nombreProducto || d.nombre || "Producto"}
                          </td>
                          <td style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            fontSize: "14px",
                            color: "#1F2937",
                            fontWeight: "500"
                          }}>
                            {cantidad}
                          </td>
                          <td style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontSize: "14px",
                            color: "#6B7280"
                          }}>
                            ${precio.toFixed(2)}
                          </td>
                          <td style={{
                            padding: "12px 16px",
                            textAlign: "right",
                            fontSize: "14px",
                            color: "#FF6B35",
                            fontWeight: "600"
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
            padding: "25px",
            borderRadius: "8px",
            border: facturaBackend ? "1px solid #10B981" : "1px solid #FF6B35",
            marginBottom: "25px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px"
            }}>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>
                Subtotal
              </span>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#1F2937" }}>
                ${totales.subtotal.toFixed(2)}
              </span>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              paddingBottom: "15px",
              borderBottom: facturaBackend ? "1px solid #34D399" : "1px solid #FF8E53"
            }}>
              <span style={{ fontSize: "14px", color: "#6B7280" }}>
                IVA (12%)
              </span>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#1F2937" }}>
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
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#1F2937",
                  marginBottom: "4px"
                }}>
                  TOTAL A PAGAR
                </div>
                {facturaBackend && (
                  <div style={{
                    fontSize: "12px",
                    color: "#10B981",
                    fontStyle: "italic"
                  }}>
                    Factura registrada en sistema
                  </div>
                )}
                {tipoFactura === "consolidada" && !facturaBackend && (
                  <div style={{
                    fontSize: "12px",
                    color: "#9C27B0",
                    fontStyle: "italic"
                  }}>
                    Incluye todos los productos
                  </div>
                )}
              </div>
              <div style={{
                fontSize: "28px",
                fontWeight: "800",
                color: facturaBackend ? "#10B981" : "#FF6B35"
              }}>
                ${totales.total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            paddingTop: "20px",
            borderTop: "1px solid #FFD3BE",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#FF6B35",
              marginBottom: "8px"
            }}>
              My Harvest
            </div>
            <p style={{
              fontSize: "13px",
              color: "#6B7280",
              margin: "0 0 8px 0",
              lineHeight: "1.5"
            }}>
              Gracias por confiar en nuestra plataforma de productos frescos y locales
            </p>
            <p style={{
              fontSize: "11px",
              color: "#9CA3AF",
              margin: 0,
              fontStyle: "italic"
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
          margin: "30px auto 0 auto",
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          {/* BOTÓN PARA CREAR FACTURA SI NO EXISTE */}
          {puedeCrearFactura && !creandoFactura && (
            <button
              onClick={handleCrearFactura}
              disabled={creandoFactura}
              style={{
                padding: "12px 24px",
                background: "#FF6B35",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                opacity: creandoFactura ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!creandoFactura) e.target.style.background = "#FF8E53";
              }}
              onMouseLeave={(e) => {
                if (!creandoFactura) e.target.style.background = "#FF6B35";
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
              padding: "12px 24px",
              background: facturaBackend ? "#10B981" : "#FF6B35",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              opacity: descargandoPDF ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!descargandoPDF) e.target.style.background = facturaBackend ? "#34D399" : "#FF8E53";
            }}
            onMouseLeave={(e) => {
              if (!descargandoPDF) e.target.style.background = facturaBackend ? "#10B981" : "#FF6B35";
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
              padding: "12px 24px",
              background: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              opacity: viendoPDF ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!viendoPDF) e.target.style.background = "#2563EB";
            }}
            onMouseLeave={(e) => {
              if (!viendoPDF) e.target.style.background = "#3B82F6";
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
              padding: "12px 24px",
              background: "white",
              color: facturaBackend ? "#10B981" : "#FF6B35",
              border: `1px solid ${facturaBackend ? "#10B981" : "#FF6B35"}`,
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = facturaBackend ? "#D1FAE5" : "#FFF2E8";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
            }}
          >
            <span>🖨️</span>
            Imprimir
          </button>

          {/* BOTÓN VER PEDIDO/COMPRA */}
          {tipoFactura === "consolidada" ? (
            <button
              onClick={() => navigate(`/mi-compra-unificada/${facturaData.idCompraUnificada || idCompra}`, {
                state: { compraData: facturaData }
              })}
              style={{
                padding: "12px 24px",
                background: "white",
                color: "#1F2937",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => {
                e.target.style.background = "#F8F9FA";
                e.target.style.borderColor = "#1F2937";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#E5E7EB";
              }}
            >
              <span>🛍️</span>
              Ver compra unificada
            </button>
          ) : (
            <button
              onClick={() => navigate(`/pedido/${idPedido}`)}
              style={{
                padding: "12px 24px",
                background: "white",
                color: "#1F2937",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#F8F9FA";
                e.target.style.borderColor = "#1F2937";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#E5E7EB";
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