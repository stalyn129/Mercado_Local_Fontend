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
      return { 
        subtotal: facturaData?.subtotal || 0, 
        iva: facturaData?.iva || 0, 
        total: facturaData?.total || 0 
      };
    }
    
    const subtotal = detalles.reduce((sum, producto) => {
      return sum + (producto.subtotal || 0);
    }, 0);
    
    const iva = subtotal * 0.12;
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

  // Descargar PDF - VERSIÓN MEJORADA
  const descargarPDF = async () => {
    const elemento = facturaRef.current;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794, // Ancho A4 en píxeles (210mm * 3.78)
      windowHeight: elemento.scrollHeight,
      imageTimeout: 0,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.factura-print');
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.border = '1px solid #ddd';
          clonedElement.style.margin = '0';
          clonedElement.style.padding = '20px';
          clonedElement.style.maxWidth = '100%';
        }
      }
    });
    
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
      PENDIENTE: { color: "#F59E0B", bg: "#FEF3C7", texto: "Pendiente" },
      PROCESANDO: { color: "#3B82F6", bg: "#DBEAFE", texto: "Procesando" },
      PENDIENTE_VERIFICACION: { color: "#8B5CF6", bg: "#EDE9FE", texto: "Verificando" },
      COMPLETADO: { color: "#10B981", bg: "#D1FAE5", texto: "Completado" },
      CANCELADO: { color: "#EF4444", bg: "#FEE2E2", texto: "Cancelado" },
      ENVIADO: { color: "#6366F1", bg: "#E0E7FF", texto: "Enviado" },
      ENTREGADO: { color: "#059669", bg: "#D1FAE5", texto: "Entregado" }
    };
    return estados[estado] || { color: "#6B7280", bg: "#F3F4F6", texto: estado };
  };

  // Componente de círculos flotantes
  const FloatingCircles = () => (
    <div className="floating-circles" style={{
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

  const estadoInfo = tipoFactura === "consolidada" 
    ? getEstadoInfo(facturaData.estadoCompra || "PROCESANDO")
    : getEstadoInfo(facturaData.estadoPedido);
    
  const numeroFactura = generarNumeroFactura();
  const totales = tipoFactura === "consolidada" 
    ? calcularTotalesConsolidada()
    : calcularTotalesIndividual();

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

        /* ESTILOS DE IMPRESIÓN MEJORADOS */
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

          /* Mejorar visibilidad de bordes y texto */
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
          
          .factura-print {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
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
            border: "2px solid #FF6B35",
            position: 'relative',
            zIndex: 1
          }}
        >
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
            background: "#FFF2E8",
            borderRadius: "8px",
            border: "1px dashed #FF6B35"
          }}>
            <div style={{
              fontSize: "11px",
              color: "#FF6B35",
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
              color: "#FF6B35",
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
                    {formatearFecha(facturaData.fechaCompra || facturaData.fechaPedido)}
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
                    {facturaData.metodoPago === "EFECTIVO" && "Efectivo"}
                    {facturaData.metodoPago === "TRANSFERENCIA" && "Transferencia"}
                    {facturaData.metodoPago === "TARJETA" && "Tarjeta"}
                    {!facturaData.metodoPago && "No especificado"}
                  </div>
                </div>

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

          {/* PRODUCTOS */}
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
                  minWidth: "600px"
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
                      {tipoFactura === "consolidada" && (
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          width: "120px"
                        }}>
                          Vendedor
                        </th>
                      )}
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
                          {tipoFactura === "consolidada" && (
                            <td style={{
                              padding: "12px 16px",
                              fontSize: "13px",
                              color: "#9C27B0",
                              fontWeight: "500"
                            }}>
                              {d.vendedor?.nombre || `Vendedor #${d.vendedor?.idVendedor || d.idPedido}`}
                            </td>
                          )}
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
            background: "#FFF2E8",
            padding: "25px",
            borderRadius: "8px",
            border: "1px solid #FF6B35",
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
              borderBottom: "1px solid #FF8E53"
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
                {tipoFactura === "consolidada" && (
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
                color: "#FF6B35"
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
              Documento válido para efectos tributarios
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
          <button
            onClick={descargarPDF}
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
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#FF8E53";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#FF6B35";
            }}
          >
            <span>📥</span>
            Descargar PDF
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#FF6B35",
              border: "1px solid #FF6B35",
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
              e.target.style.background = "#FFF2E8";
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