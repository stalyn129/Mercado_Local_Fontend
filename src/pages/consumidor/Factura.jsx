import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Footer from "../../components/Footer.jsx";

export default function Factura() {
  const { idPedido, idCompra } = useParams(); // Ahora soporta dos parámetros
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [facturaData, setFacturaData] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoFactura, setTipoFactura] = useState("individual"); // "individual" o "consolidada"

  const facturaRef = useRef();

  // Función para cargar detalles de un pedido
  const cargarDetallesPedido = async (token, idPedido) => {
    try {
      const response = await fetch(`${API_URL}/pedidos/${idPedido}/detalles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar detalles del pedido ${idPedido}`);
      }
      
      const detallesData = await response.json();
      return detallesData;
    } catch (error) {
      console.error(`Error cargando detalles del pedido ${idPedido}:`, error);
      return [];
    }
  };

  // Función para cargar productos de múltiples pedidos (compra unificada)
  const cargarProductosDePedidos = async (token, pedidos) => {
    if (!pedidos || pedidos.length === 0) return [];
    
    const todosLosProductos = [];
    
    // Cargar detalles de cada pedido
    for (const pedido of pedidos) {
      const pedidoId = pedido.idPedido || pedido.id;
      if (!pedidoId) continue;
      
      try {
        const detalles = await cargarDetallesPedido(token, pedidoId);
        
        // Procesar cada detalle del pedido
        detalles.forEach(detalle => {
          const productoInfo = detalle.producto || {};
          const precioUnitario = detalle.precioUnitario || (detalle.subtotal / detalle.cantidad) || 0;
          const cantidad = detalle.cantidad || 1;
          const subtotal = detalle.subtotal || (precioUnitario * cantidad);
          
          todosLosProductos.push({
            idProducto: productoInfo.idProducto || detalle.idProducto,
            nombreProducto: productoInfo.nombreProducto || "Producto",
            precio: precioUnitario,
            cantidad: cantidad,
            subtotal: subtotal,
            vendedor: pedido.vendedor || { idVendedor: pedido.idVendedor, nombre: `Vendedor #${pedido.idVendedor}` },
            idPedido: pedidoId
          });
        });
        
      } catch (error) {
        console.error(`Error procesando pedido ${pedidoId}:`, error);
      }
    }
    
    return todosLosProductos;
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/loginmodal");

    setLoading(true);

    // 🔍 DEBUG: Ver qué datos llegan
    console.log("🔍 location.state recibido:", location.state);
    console.log("🔍 Parámetros:", { idPedido, idCompra });

    const compraUnificadaData = location.state?.compraData;
    
    // PRIMERO: Si viene de una compra unificada (navegación con state)
    if (compraUnificadaData) {
      console.log("📊 Cargando factura consolidada desde state");
      console.log("📊 Datos de compra recibidos:", compraUnificadaData);
      console.log("📊 Pedidos recibidos:", compraUnificadaData.pedidos);
      
      setTipoFactura("consolidada");
      setFacturaData(compraUnificadaData);
      
      // Cargar productos de todos los pedidos
      cargarProductosDePedidos(token, compraUnificadaData.pedidos || [])
        .then(productos => {
          console.log("✅ Productos cargados:", productos);
          setDetalles(productos);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error cargando productos:", error);
          setLoading(false);
        });
    } 
    // SEGUNDO: Si hay idCompra en los parámetros (ruta directa)
    else if (idCompra) {
      console.log("📊 Cargando factura consolidada por idCompra:", idCompra);
      setTipoFactura("consolidada");
      
      // 1. Obtener datos de la compra unificada
      fetch(`${API_URL}/pedidos/compra-unificada/${idCompra}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`Error ${res.status} al cargar compra unificada`);
          return res.json();
        })
        .then(async (data) => {
          console.log("✅ Datos de compra unificada recibidos:", data);
          setFacturaData(data);
          
          // 2. Cargar productos de todos los pedidos
          const productos = await cargarProductosDePedidos(token, data.pedidos || []);
          console.log("✅ Productos cargados para compra unificada:", productos);
          setDetalles(productos);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error cargando factura consolidada:", err);
          setLoading(false);
        });
    }
    // TERCERO: Si es un pedido individual normal
    else if (idPedido) {
      console.log("📊 Cargando factura individual:", idPedido);
      setTipoFactura("individual");
      
      Promise.all([
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
      ])
        .then(([pedidoData, detallesData]) => {
          console.log("✅ Datos de pedido individual:", pedidoData);
          console.log("✅ Detalles del pedido:", detallesData);
          
          setFacturaData(pedidoData);
          setDetalles(detallesData);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error cargando factura:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [idPedido, idCompra, location.state]);

  // Generar número de factura
  const generarNumeroFactura = () => {
    if (tipoFactura === "consolidada") {
      const compraId = facturaData?.idCompraUnificada || idCompra;
      const idCorto = compraId ? compraId.split('-').pop().substring(0, 6) : "000000";
      return `FAC-CONS-${idCorto}`;
    } else {
      return `FAC-${String(facturaData?.idPedido || "000000").padStart(6, "0")}`;
    }
  };

  // Calcular totales para factura consolidada
  const calcularTotalesConsolidada = () => {
    if (tipoFactura !== "consolidada" || !detalles.length) {
      // Si es individual o no hay detalles, usar los datos del pedido
      return { 
        subtotal: facturaData?.subtotal || 0, 
        iva: facturaData?.iva || 0, 
        total: facturaData?.total || 0 
      };
    }
    
    const subtotal = detalles.reduce((sum, producto) => {
      return sum + (producto.subtotal || 0);
    }, 0);
    
    const iva = subtotal * 0.12; // 12% IVA
    const total = subtotal + iva;
    
    return { subtotal, iva, total };
  };

  // Calcular totales para factura individual
  const calcularTotalesIndividual = () => {
    if (tipoFactura === "consolidada") return calcularTotalesConsolidada();
    
    return { 
      subtotal: facturaData?.subtotal || 0, 
      iva: facturaData?.iva || 0, 
      total: facturaData?.total || 0 
    };
  };

  // Descargar PDF
  const descargarPDF = async () => {
    const elemento = facturaRef.current;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(elemento, {
      scale: 4,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1200,
      windowHeight: elemento.scrollHeight,
      imageTimeout: 0,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.factura-print');
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.transform = 'scale(1)';
        }
      }
    });
    
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(
      (pdfWidth - 20) / imgWidth,
      (pdfHeight - 20) / imgHeight
    );
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    const numeroFactura = generarNumeroFactura();
    const nombreArchivo = tipoFactura === "consolidada" 
      ? `Factura_Consolidada_${numeroFactura}.pdf`
      : `Factura_${numeroFactura}.pdf`;
    
    pdf.save(nombreArchivo);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      PENDIENTE: { color: "#F4B419", bg: "#FFF8E1", texto: "Pendiente", emoji: "⏳" },
      PROCESANDO: { color: "#4A90E2", bg: "#E3F2FD", texto: "Procesando", emoji: "🔄" },
      PENDIENTE_VERIFICACION: { color: "#F57C00", bg: "#FFF3E0", texto: "Verificando", emoji: "🔍" },
      COMPLETADO: { color: "#5A8F48", bg: "#E8F5E9", texto: "Completado", emoji: "✅" },
      CANCELADO: { color: "#E74C3C", bg: "#FFEBEE", texto: "Cancelado", emoji: "❌" }
    };
    return estados[estado] || { color: "#6B7F69", bg: "#F5F5F5", texto: estado, emoji: "📋" };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            width: "60px",
            height: "60px",
            border: "6px solid #ECF2E3",
            borderTop: "6px solid #5A8F48",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{
            marginTop: "20px",
            fontSize: "18px",
            color: "#6B7F69",
            fontWeight: "600"
          }}>
            {tipoFactura === "consolidada" ? "Cargando factura consolidada..." : "Cargando factura..."}
          </p>
        </div>
      </div>
    );
  }

  if (!facturaData) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 4px 25px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>❌</div>
          <h2 style={{ color: "#2D3E2B", marginBottom: "10px" }}>Error al cargar</h2>
          <p style={{ color: "#6B7F69", marginBottom: "30px" }}>
            No se pudo cargar la información de la factura
          </p>
          <button
            onClick={() => navigate("/mis-pedidos")}
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "15px"
            }}
          >
            Volver a mis pedidos
          </button>
        </div>
      </div>
    );
  }

  // 🔍 DEBUG: Mostrar estado actual
  console.log("🔍 DEBUG - Estado actual:");
  console.log("  tipoFactura:", tipoFactura);
  console.log("  facturaData:", facturaData);
  console.log("  detalles:", detalles);

  const estadoInfo = tipoFactura === "consolidada" 
    ? getEstadoInfo(facturaData.estadoCompra || "PROCESANDO")
    : getEstadoInfo(facturaData.estadoPedido);
    
  const numeroFactura = generarNumeroFactura();
  const totales = tipoFactura === "consolidada" 
    ? calcularTotalesConsolidada()
    : calcularTotalesIndividual();

  return (
    <>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
        padding: "40px 20px 60px 20px"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media print {
            body {
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            .factura-print,
            .factura-print * {
              visibility: visible;
            }

            .factura-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 800px !important;
              margin: 0 auto;
              boxShadow: none !important;
            }

            nav,
            footer,
            .navbar,
            .footer,
            .no-print {
              display: none !important;
            }

            #root {
              padding: 0 !important;
              margin: 0 !important;
            }

            @page {
              size: A4;
              margin: 15mm;
            }
          }
        `}</style>

        {/* Botón Volver */}
        <div style={{ maxWidth: "850px", margin: "0 auto 20px auto" }} className="no-print">
          <button
            onClick={() => navigate("/mis-pedidos")}
            style={{
              background: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              color: "#5A8F48",
              boxShadow: "0 2px 8px rgba(90, 143, 72, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateX(-4px)";
              e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateX(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(90, 143, 72, 0.1)";
            }}
          >
            ← Volver a mis pedidos
          </button>
        </div>

        {/* FACTURA */}
        <div
          ref={facturaRef}
          className="factura-print"
          style={{
            maxWidth: "850px",
            margin: "0 auto",
            background: "white",
            padding: "50px",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(90, 143, 72, 0.12)",
            animation: "fadeIn 0.6s ease-out"
          }}
        >
          {/* HEADER */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "35px",
            paddingBottom: "25px",
            borderBottom: "2px solid #ECF2E3"
          }}>
            {/* Logo y título */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "50px",
                height: "50px",
                background: tipoFactura === "consolidada" 
                  ? "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)" 
                  : "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                boxShadow: tipoFactura === "consolidada" 
                  ? "0 4px 12px rgba(156, 39, 176, 0.3)" 
                  : "0 4px 12px rgba(90, 143, 72, 0.3)"
              }}>
                {tipoFactura === "consolidada" ? "🛍️" : "🏪"}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "13px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: tipoFactura === "consolidada" ? "#9C27B0" : "#6B7F69",
                  marginBottom: "4px",
                  fontWeight: "600"
                }}>
                  {tipoFactura === "consolidada" ? "Compra Unificada" : "Don Carlos Market"}
                </div>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "36px",
                  fontWeight: "900",
                  color: "#2D3E2B",
                  margin: "0",
                  letterSpacing: "1px"
                }}>
                  FACTURA {tipoFactura === "consolidada" && "CONSOLIDADA"}
                </h1>
              </div>
            </div>
            
            {/* Número de factura */}
            <div style={{
              textAlign: "right",
              background: tipoFactura === "consolidada" 
                ? "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)" 
                : "linear-gradient(135deg, #F5F9F3 0%, #EAF2E6 100%)",
              padding: "18px 22px",
              borderRadius: "12px",
              border: tipoFactura === "consolidada" 
                ? "2px solid #E1BEE7" 
                : "2px solid #E3EBD9"
            }}>
              <div style={{
                fontSize: "11px",
                color: tipoFactura === "consolidada" ? "#9C27B0" : "#6B7F69",
                marginBottom: "6px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1.5px"
              }}>
                Nº FACTURA
              </div>
              <div style={{
                fontSize: "24px",
                fontWeight: "900",
                color: tipoFactura === "consolidada" ? "#9C27B0" : "#5A8F48",
                fontFamily: "'Playfair Display', serif",
                marginBottom: "2px"
              }}>
                {numeroFactura}
              </div>
              <div style={{ fontSize: "10px", color: "#9AAA98" }}>
                {tipoFactura === "consolidada" 
                  ? `Compra #${facturaData.idCompraUnificada || idCompra}` 
                  : `Pedido #${facturaData.idPedido}`}
              </div>
            </div>
          </div>

          {/* INFORMACIÓN EN 2 COLUMNAS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px",
            marginBottom: "35px"
          }}>
            {/* DETALLES */}
            <div>
              <h3 style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#6B7F69",
                marginBottom: "16px",
                fontWeight: "700"
              }}>
                {tipoFactura === "consolidada" ? "Detalles de la Compra" : "Detalles del Pedido"}
              </h3>
              
              <div style={{
                background: "#FAFBF9",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #ECF2E3"
              }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{
                    fontSize: "10px",
                    color: "#9AAA98",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}>
                    📅 Fecha de emisión
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#2D3E2B",
                    fontWeight: "600"
                  }}>
                    {formatearFecha(facturaData.fechaCompra || facturaData.fechaPedido)}
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div style={{
                    fontSize: "10px",
                    color: "#9AAA98",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}>
                    💳 Método de pago
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#2D3E2B",
                    fontWeight: "600"
                  }}>
                    {facturaData.metodoPago === "EFECTIVO" && "Efectivo"}
                    {facturaData.metodoPago === "TRANSFERENCIA" && "Transferencia bancaria"}
                    {facturaData.metodoPago === "TARJETA" && "Tarjeta de crédito"}
                    {!facturaData.metodoPago && "No especificado"}
                  </div>
                </div>

                {tipoFactura === "consolidada" && facturaData.cantidadPedidos && (
                  <div>
                    <div style={{
                      fontSize: "10px",
                      color: "#9AAA98",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}>
                      📦 Pedidos incluidos
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#2D3E2B",
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
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#6B7F69",
                marginBottom: "16px",
                fontWeight: "700"
              }}>
                Estado
              </h3>
              
              <div style={{
                background: estadoInfo.bg,
                border: `2px solid ${estadoInfo.color}`,
                borderRadius: "10px",
                padding: "20px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>
                  {estadoInfo.emoji}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "#6B7F69",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  Estado actual
                </div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: estadoInfo.color
                }}>
                  {estadoInfo.texto}
                </div>
                {tipoFactura === "consolidada" && (
                  <div style={{
                    fontSize: "11px",
                    color: "#9AAA98",
                    marginTop: "8px",
                    fontStyle: "italic"
                  }}>
                    Todos los pedidos están {estadoInfo.texto.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#6B7F69",
              marginBottom: "14px",
              fontWeight: "700"
            }}>
              {tipoFactura === "consolidada" ? "Productos de la Compra" : "Productos del Pedido"}
              {tipoFactura === "consolidada" && (
                <span style={{
                  fontSize: "11px",
                  color: "#9C27B0",
                  marginLeft: "10px",
                  fontWeight: "600"
                }}>
                  (Consolidada de múltiples vendedores)
                </span>
              )}
            </h3>

            {detalles.length === 0 ? (
              <div style={{
                background: "#FAFBF9",
                padding: "40px",
                borderRadius: "10px",
                textAlign: "center",
                border: "2px dashed #ECF2E3"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", color: "#9AAA98" }}>
                  🛒
                </div>
                <p style={{ color: "#6B7F69", fontSize: "16px", marginBottom: "8px" }}>
                  No se encontraron productos para mostrar
                </p>
                <p style={{ color: "#9AAA98", fontSize: "14px" }}>
                  Es posible que los productos no se hayan cargado correctamente
                </p>
              </div>
            ) : (
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#FAFBF9",
                borderRadius: "10px",
                overflow: "hidden"
              }}>
                <thead>
                  <tr style={{
                    background: tipoFactura === "consolidada"
                      ? "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)"
                      : "linear-gradient(135deg, #F5F9F3 0%, #EAF2E6 100%)",
                    borderBottom: tipoFactura === "consolidada"
                      ? "2px solid #E1BEE7"
                      : "2px solid #E3EBD9"
                  }}>
                    <th style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}>
                      Producto
                    </th>
                    {tipoFactura === "consolidada" && (
                      <th style={{
                        padding: "14px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#2D3E2B",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        width: "120px"
                      }}>
                        Vendedor
                      </th>
                    )}
                    <th style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      width: "80px"
                    }}>
                      Cant.
                    </th>
                    <th style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      width: "100px"
                    }}>
                      Precio Unit.
                    </th>
                    <th style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
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
                      <tr key={i} style={{
                        borderBottom: i < detalles.length - 1 
                          ? tipoFactura === "consolidada" 
                            ? "1px solid #E1BEE7" 
                            : "1px solid #ECF2E3" 
                          : "none"
                      }}>
                        <td style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          color: "#2D3E2B",
                          fontWeight: "500"
                        }}>
                          {d.nombreProducto || d.producto?.nombreProducto || d.nombre || "Producto"}
                        </td>
                        {tipoFactura === "consolidada" && (
                          <td style={{
                            padding: "14px 16px",
                            fontSize: "12px",
                            color: "#9C27B0",
                            fontWeight: "600"
                          }}>
                            {d.vendedor?.nombre || `Vendedor #${d.vendedor?.idVendedor || d.idPedido}`}
                          </td>
                        )}
                        <td style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          fontSize: "14px",
                          color: "#2D3E2B",
                          fontWeight: "600"
                        }}>
                          {cantidad}
                        </td>
                        <td style={{
                          padding: "14px 16px",
                          textAlign: "right",
                          fontSize: "14px",
                          color: "#6B7F69"
                        }}>
                          ${precio.toFixed(2)}
                        </td>
                        <td style={{
                          padding: "14px 16px",
                          textAlign: "right",
                          fontSize: "15px",
                          color: tipoFactura === "consolidada" ? "#9C27B0" : "#5A8F48",
                          fontWeight: "700"
                        }}>
                          ${subtotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* TOTALES */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "35px"
          }}>
            <div style={{
              minWidth: "350px",
              background: tipoFactura === "consolidada"
                ? "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)"
                : "linear-gradient(135deg, #F5F9F3 0%, #EAF2E6 100%)",
              padding: "24px",
              borderRadius: "12px",
              border: tipoFactura === "consolidada"
                ? "2px solid #E1BEE7"
                : "2px solid #E3EBD9"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                paddingBottom: "10px",
                borderBottom: tipoFactura === "consolidada"
                  ? "1px solid #D1C4E9"
                  : "1px solid #D5E3CC"
              }}>
                <span style={{ fontSize: "14px", color: "#6B7F69" }}>
                  Subtotal
                </span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#2D3E2B" }}>
                  ${totales.subtotal.toFixed(2)}
                </span>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "14px",
                paddingBottom: "14px",
                borderBottom: tipoFactura === "consolidada"
                  ? "2px solid #B39DDB"
                  : "2px solid #C5D9BA"
              }}>
                <span style={{ fontSize: "14px", color: "#6B7F69" }}>
                  IVA (12%)
                </span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#2D3E2B" }}>
                  ${totales.iva.toFixed(2)}
                </span>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  Total
                </span>
                <span style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  color: tipoFactura === "consolidada" ? "#9C27B0" : "#5A8F48",
                  fontFamily: "'Playfair Display', serif"
                }}>
                  ${totales.total.toFixed(2)}
                </span>
              </div>
              
              {tipoFactura === "consolidada" && (
                <div style={{
                  fontSize: "11px",
                  color: "#9C27B0",
                  marginTop: "12px",
                  textAlign: "center",
                  fontStyle: "italic"
                }}>
                  Factura consolidada - Incluye productos de múltiples vendedores
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            paddingTop: "25px",
            borderTop: tipoFactura === "consolidada" 
              ? "2px solid #E1BEE7" 
              : "2px solid #ECF2E3",
            textAlign: "center"
          }}>
            <p style={{
              fontSize: "12px",
              color: "#9AAA98",
              margin: "0 0 6px 0",
              lineHeight: "1.6"
            }}>
              {tipoFactura === "consolidada" 
                ? "Gracias por tu compra unificada en Don Carlos Market" 
                : "Gracias por tu compra en Don Carlos Market"}
            </p>
            <p style={{
              fontSize: "11px",
              color: "#B5C4B3",
              margin: "0 0 12px 0",
              lineHeight: "1.6"
            }}>
              Este documento es una factura válida para efectos tributarios
            </p>
            
            {(estadoInfo.texto === "Verificando" || estadoInfo.texto === "Pendiente") && (
              <div style={{
                fontSize: "12px",
                color: "#F57C00",
                margin: "12px auto 0 auto",
                fontWeight: "600",
                padding: "10px 16px",
                background: "#FFF8E1",
                borderRadius: "8px",
                display: "inline-block",
                border: "1px solid #FFECB3"
              }}>
                ⚠️ Esta factura está sujeta a verificación de pago
              </div>
            )}
            
            {estadoInfo.texto === "Completado" && (
              <div style={{
                fontSize: "12px",
                color: tipoFactura === "consolidada" ? "#9C27B0" : "#5A8F48",
                margin: "12px auto 0 auto",
                fontWeight: "600",
                padding: "10px 16px",
                background: tipoFactura === "consolidada" ? "#F3E5F5" : "#E8F5E9",
                borderRadius: "8px",
                display: "inline-block",
                border: tipoFactura === "consolidada" ? "1px solid #E1BEE7" : "1px solid #C8E6C9"
              }}>
                ✅ Pago verificado y confirmado
              </div>
            )}
          </div>
        </div>

        {/* BOTONES */}
        <div style={{
          maxWidth: "850px",
          margin: "25px auto 0 auto",
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap"
        }} className="no-print">
          <button
            onClick={descargarPDF}
            style={{
              padding: "14px 28px",
              background: tipoFactura === "consolidada" 
                ? "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)" 
                : "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: tipoFactura === "consolidada" 
                ? "0 4px 12px rgba(156, 39, 176, 0.3)" 
                : "0 4px 12px rgba(90, 143, 72, 0.3)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = tipoFactura === "consolidada" 
                ? "0 8px 20px rgba(156, 39, 176, 0.4)" 
                : "0 8px 20px rgba(90, 143, 72, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = tipoFactura === "consolidada" 
                ? "0 4px 12px rgba(156, 39, 176, 0.3)" 
                : "0 4px 12px rgba(90, 143, 72, 0.3)";
            }}
          >
            <span style={{ fontSize: "18px" }}>📥</span>
            Descargar PDF
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: "14px 28px",
              background: "white",
              color: tipoFactura === "consolidada" ? "#9C27B0" : "#5A8F48",
              border: `2px solid ${tipoFactura === "consolidada" ? "#9C27B0" : "#5A8F48"}`,
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = tipoFactura === "consolidada" ? "#F3E5F5" : "#ECF2E3";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "18px" }}>🖨️</span>
            Imprimir
          </button>

          {tipoFactura === "consolidada" ? (
            <button
              onClick={() => navigate(`/mi-compra-unificada/${facturaData.idCompraUnificada || idCompra}`, {
                state: { compraData: facturaData }
              })}
              style={{
                padding: "14px 28px",
                background: "white",
                color: "#2D3E2B",
                border: "2px solid #E3EBD9",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#FAFBF9";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "18px" }}>🛍️</span>
              Ver compra unificada
            </button>
          ) : (
            <button
              onClick={() => navigate(`/pedido/${idPedido}`)}
              style={{
                padding: "14px 28px",
                background: "white",
                color: "#2D3E2B",
                border: "2px solid #E3EBD9",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#FAFBF9";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "18px" }}>📦</span>
              Ver pedido
            </button>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}