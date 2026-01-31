import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

// Helper para formatear dinero
const money = (value) =>
  value !== null && value !== undefined
    ? value.toFixed(2)
    : "0.00";

// Helper para mostrar estados en español
const getEstadoLabel = (estado) => {
  const estados = {
    PENDIENTE: "Pendiente de pago",
    PROCESANDO: "En proceso",
    PENDIENTE_VERIFICACION: "Verificando pago",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado"
  };
  return estados[estado] || estado;
};

// Helper para obtener el emoji del estado
const getEstadoEmoji = (estado) => {
  const emojis = {
    PENDIENTE: "⏳",
    PROCESANDO: "📦",
    PENDIENTE_VERIFICACION: "🔍",
    COMPLETADO: "✅",
    CANCELADO: "❌"
  };
  return emojis[estado] || "📋";
};

// Helper para formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const date = new Date(fecha);
  const opciones = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return date.toLocaleDateString('es-ES', opciones);
};

export default function MiCompraUnificada() {
  const { idCompra } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [compraData, setCompraData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [circlePositions, setCirclePositions] = useState([]);

  // Obtener datos pasados por estado (si vienen del historial)
  const datosDesdeHistorial = location.state || {};

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.15)",
        "rgba(52, 211, 153, 0.15)",
        "rgba(59, 130, 246, 0.15)",
        "rgba(168, 85, 247, 0.15)",
        "rgba(239, 68, 68, 0.15)",
        "rgba(245, 158, 11, 0.15)",
        "rgba(14, 165, 233, 0.15)",
        "rgba(236, 72, 153, 0.15)"
      ];
      
      for (let i = 0; i < 10; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 25 + 30 + "s",
          blur: Math.random() * 4 + 2 + "px",
          zIndex: 0
        });
      }
      setCirclePositions(circles);
    };

    generateCircles();
    
    const interval = setInterval(() => {
      setCirclePositions(prev => 
        prev.map(circle => ({
          ...circle,
          top: Math.random() * 100,
          left: Math.random() * 100,
          animationDelay: Math.random() * 4 + "s"
        }))
      );
    }, 35000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCompraUnificada = async () => {
      const token = localStorage.getItem("authToken");

      if (!idCompra || idCompra === "undefined") {
        console.error("❌ ID de compra no válido:", idCompra);
        setError("ID de compra no válido");
        setLoading(false);

        // Si tenemos datos del historial, usarlos
        if (datosDesdeHistorial.compraData) {
          console.log("✅ Usando datos del historial");
          setCompraData(datosDesdeHistorial.compraData);
          setLoading(false);
        }
        return;
      }

      try {
        console.log(`📡 Buscando compra unificada: ${idCompra}`);

        const response = await fetch(`${API_URL}/pedidos/compra-unificada/${idCompra}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error del servidor: ${response.status}`, errorText);

          // Si el servidor da error, usar datos del historial
          if (datosDesdeHistorial.compraData) {
            console.log("⚠️ Usando datos del historial debido a error del servidor");
            setCompraData(datosDesdeHistorial.compraData);
            setLoading(false);
            return;
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("✅ Datos recibidos del backend:", data);
        setCompraData(data);

      } catch (err) {
        console.error("❌ Error cargando compra unificada:", err);

        // Si hay error pero tenemos datos del historial, usarlos
        if (datosDesdeHistorial.compraData) {
          console.log("✅ Usando datos del historial debido a error");
          setCompraData(datosDesdeHistorial.compraData);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Si ya tenemos datos del historial, no hacer fetch
    if (datosDesdeHistorial.compraData) {
      console.log("✅ Ya tenemos datos del historial, omitiendo fetch");
      setCompraData(datosDesdeHistorial.compraData);
      setLoading(false);
      return;
    }

    fetchCompraUnificada();
  }, [idCompra, API_URL, datosDesdeHistorial]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "5px solid #f1f5f9",
          borderTop: "5px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{
          marginTop: "20px",
          fontSize: "16px",
          color: "#64748b",
          fontWeight: "600"
        }}>
          Cargando detalles de la compra...
        </p>
      </div>
    );
  }

  if (error && !compraData) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "40px"
      }}>
        <div style={{ 
          fontSize: "64px", 
          marginBottom: "20px",
          color: "#FF6B35" 
        }}>⚠️</div>
        <h2 style={{ 
          color: "#2C3E50", 
          marginBottom: "10px",
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontSize: "32px"
        }}>Error</h2>
        <p style={{ 
          color: "#64748b", 
          textAlign: "center", 
          marginBottom: "20px",
          maxWidth: "500px"
        }}>
          {error}
        </p>
        <button
          onClick={() => navigate("/mis-pedidos")}
          style={{
            padding: "16px 32px",
            background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
            border: "none",
            color: "white",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "16px",
            transition: "all 0.3s ease",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 107, 53, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
          }}
        >
          Volver a mis compras
        </button>
      </div>
    );
  }

  // Si no hay datos del historial ni del backend
  if (!compraData) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "40px"
      }}>
        <div style={{ 
          fontSize: "64px", 
          marginBottom: "20px",
          color: "#FF6B35"
        }}>📭</div>
        <h2 style={{ 
          color: "#2C3E50", 
          marginBottom: "10px",
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontSize: "32px"
        }}>Compra no encontrada</h2>
        <p style={{ 
          color: "#64748b", 
          textAlign: "center", 
          marginBottom: "20px",
          maxWidth: "500px"
        }}>
          No se encontraron datos para la compra #{idCompra || "desconocida"}
        </p>
        <button
          onClick={() => navigate("/mis-pedidos")}
          style={{
            padding: "16px 32px",
            background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
            border: "none",
            color: "white",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "16px",
            transition: "all 0.3s ease",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 107, 53, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
          }}
        >
          Volver a mis compras
        </button>
      </div>
    );
  }

  // Datos de la compra (vienen del historial o del backend)
  const {
    idCompraUnificada = idCompra,
    pedidos = [],
    totalGeneral = 0,
    metodoPago = 'PENDIENTE',
    estadoCompra = 'PROCESANDO',
    fechaCompra,
    cantidadPedidos = pedidos.length,
    cantidadVendedores = 0
  } = compraData;

  // Calcular cantidad de vendedores si no viene
  const vendedoresUnicos = new Set();
  pedidos.forEach(pedido => {
    const idVendedor = pedido.vendedor?.idVendedor || pedido.idVendedor;
    if (idVendedor) vendedoresUnicos.add(idVendedor);
  });

  const vendedoresCount = cantidadVendedores > 0 ? cantidadVendedores : vendedoresUnicos.size;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* HEADER CON CÍRCULOS ANIMADOS */}
      <div style={{
        background: "white",
        padding: "60px 20px 40px 20px", // REDUCIDO: de 80px/60px a 60px/40px
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        marginBottom: "30px", // REDUCIDO: de 40px a 30px
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {circlePositions.map(circle => (
          <div 
            key={circle.id}
            style={{
              position: "absolute",
              top: `${circle.top}%`,
              left: `${circle.left}%`,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              background: circle.color,
              borderRadius: "50%",
              animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
              animationDelay: circle.animationDelay,
              filter: `blur(${circle.blur})`,
              opacity: 0.8,
              zIndex: circle.zIndex
            }}
          />
        ))}

        <div style={{ position: "relative", zIndex: "10" }}>
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#FF6B35",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Detalles de Compra Unificada
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "36px", // REDUCIDO: de 48px a 36px
            fontWeight: "700",
            color: "#2C3E50",
            margin: "0 0 12px 0", // REDUCIDO: de 16px a 12px
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Compra #{idCompraUnificada}
          </h1>
          
          <p style={{
            color: "#64748b", // CAMBIADO: de #8B5CF6 a #64748b
            fontSize: "15px", // REDUCIDO: de 16px a 15px
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.5", // REDUCIDO: de 1.6 a 1.5
            fontWeight: "400"
          }}>
            Revisa el estado y detalles de todos tus pedidos
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 50px auto", // REDUCIDO: de 60px a 50px
        padding: "0 20px"
      }}>
        
        {/* ESTADÍSTICAS DE LA COMPRA - MÁS DELGADAS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "18px", // REDUCIDO: de 20px a 18px
          marginBottom: "30px" // REDUCIDO: de 40px a 30px
        }}>
          
          {/* TOTAL DE LA COMPRA */}
          <div style={{
            background: "white",
            borderRadius: "14px", // REDUCIDO: de 16px a 14px
            padding: "20px", // REDUCIDO: de 30px a 20px (más delgado)
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)", // Sombras más sutiles
            transition: "all 0.3s ease",
            borderLeft: "4px solid #FF6B35",
            height: "100px" // ALTURA FIJA para hacerlas más delgadas
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)"; // REDUCIDO: de -4px a -3px
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.1)"; // REDUCIDO
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "15px",
              height: "100%"
            }}>
              <div style={{
                fontSize: "28px", // REDUCIDO: de 32px a 28px
                color: "#FF6B35",
                background: "rgba(255, 107, 53, 0.1)",
                width: "50px", // REDUCIDO: de 60px a 50px
                height: "50px", // REDUCIDO: de 60px a 50px
                borderRadius: "10px", // REDUCIDO: de 12px a 10px
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                💰
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: "13px", // REDUCIDO: de 14px a 13px
                  color: "#64748b",
                  margin: "0 0 6px 0", // REDUCIDO: de 4px a 6px
                  fontWeight: "600"
                }}>
                  Total de la compra
                </p>
                <p style={{
                  fontSize: "26px", // REDUCIDO: de 32px a 26px
                  fontWeight: "900",
                  color: "#2C3E50",
                  margin: "0",
                  fontFamily: "'Playfair Display', serif"
                }}>
                  ${money(totalGeneral)}
                </p>
              </div>
            </div>
          </div>

          {/* ESTADO */}
          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
            transition: "all 0.3s ease",
            borderLeft: "4px solid #8B5CF6",
            height: "100px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "15px",
              height: "100%"
            }}>
              <div style={{
                fontSize: "28px",
                color: "#8B5CF6",
                background: "rgba(139, 92, 246, 0.1)",
                width: "50px",
                height: "50px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {getEstadoEmoji(estadoCompra)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "0 0 6px 0",
                  fontWeight: "600"
                }}>
                  Estado
                </p>
                <p style={{
                  fontSize: "17px", // REDUCIDO: de 20px a 17px
                  fontWeight: "800",
                  color: estadoCompra === "COMPLETADA" ? "#10B981" :
                         estadoCompra === "PENDIENTE" ? "#F59E0B" :
                         estadoCompra === "CANCELADO" ? "#EF4444" : "#8B5CF6",
                  margin: "0"
                }}>
                  {estadoCompra === "COMPLETADA" ? "✅ Completada" :
                   estadoCompra === "PENDIENTE" ? "⏳ Pendiente" :
                   estadoCompra === "CANCELADO" ? "❌ Cancelada" : "🔄 En proceso"}
                </p>
              </div>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
            transition: "all 0.3s ease",
            borderLeft: "4px solid #10B981",
            height: "100px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "15px",
              height: "100%"
            }}>
              <div style={{
                fontSize: "28px",
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.1)",
                width: "50px",
                height: "50px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {metodoPago === 'EFECTIVO' ? '💵' :
                 metodoPago === 'TRANSFERENCIA' ? '🏦' :
                 metodoPago === 'TARJETA' ? '💳' : '💰'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "0 0 6px 0",
                  fontWeight: "600"
                }}>
                  Método de pago
                </p>
                <p style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "#10B981",
                  margin: "0"
                }}>
                  {metodoPago === 'EFECTIVO' ? 'Efectivo' :
                   metodoPago === 'TRANSFERENCIA' ? 'Transferencia' :
                   metodoPago === 'TARJETA' ? 'Tarjeta' : metodoPago}
                </p>
              </div>
            </div>
          </div>

          {/* FECHA DE COMPRA */}
          {fechaCompra && (
            <div style={{
              background: "white",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
              transition: "all 0.3s ease",
              borderLeft: "4px solid #F59E0B",
              height: "100px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
            }}
            >
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "15px",
                height: "100%"
              }}>
                <div style={{
                  fontSize: "28px",
                  color: "#F59E0B",
                  background: "rgba(245, 158, 11, 0.1)",
                  width: "50px",
                  height: "50px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  📅
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: "13px",
                    color: "#64748b",
                    margin: "0 0 6px 0",
                    fontWeight: "600"
                  }}>
                    Fecha de compra
                  </p>
                  <p style={{
                    fontSize: "15px", // REDUCIDO: de 16px a 15px
                    fontWeight: "700",
                    color: "#2C3E50",
                    margin: "0"
                  }}>
                    {new Date(fechaCompra).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RESUMEN DE ESTADÍSTICAS - MÁS DELGADAS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "18px", // REDUCIDO: de 20px a 18px
          marginBottom: "30px" // REDUCIDO: de 40px a 30px
        }}>
          <div style={{
            background: "white",
            borderRadius: "14px", // REDUCIDO: de 16px a 14px
            padding: "20px", // REDUCIDO: de 25px a 20px
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
            textAlign: "center",
            transition: "all 0.3s ease",
            height: "110px" // ALTURA FIJA para hacerlas más delgadas
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)"; // REDUCIDO: de -4px a -3px
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ 
              fontSize: "38px", // REDUCIDO: de 42px a 38px
              color: "#FF6B35", 
              marginBottom: "8px",
              fontWeight: "900",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {cantidadPedidos}
            </div>
            <div style={{ 
              fontSize: "15px", // REDUCIDO: de 16px a 15px
              color: "#64748b", 
              fontWeight: "600",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              📦 Pedidos
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
            textAlign: "center",
            transition: "all 0.3s ease",
            height: "110px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.06)";
          }}
          >
            <div style={{ 
              fontSize: "38px", 
              color: "#8B5CF6", 
              marginBottom: "8px",
              fontWeight: "900",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {vendedoresCount}
            </div>
            <div style={{ 
              fontSize: "15px", 
              color: "#64748b", 
              fontWeight: "600",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              👥 Vendedores
            </div>
          </div>
        </div>

        {/* LISTA DE PEDIDOS */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "25px", // REDUCIDO: de 30px a 25px
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          marginBottom: "25px"
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "26px", // REDUCIDO: de 28px a 26px
            fontWeight: "700",
            color: "#2C3E50",
            marginBottom: "25px", // REDUCIDO: de 30px a 25px
            display: "flex",
            alignItems: "center",
            gap: "10px" // REDUCIDO: de 12px a 10px
          }}>
            <span style={{ fontSize: "30px" }}>📦</span>
            Pedidos incluidos ({pedidos.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}> {/* REDUCIDO: de 20px a 18px */}
            {pedidos.map((pedido, index) => {
              const pedidoId = pedido.idPedido || pedido.id;
              const totalPedido = pedido.total || pedido.montoTotal || 0;
              const estadoPedido = pedido.estadoPedido || pedido.estado;

              return (
                <div
                  key={pedidoId || index}
                  style={{
                    background: "white",
                    borderRadius: "14px", // REDUCIDO: de 16px a 14px
                    padding: "22px", // REDUCIDO: de 25px a 22px
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
                    border: "2px solid #f1f5f9",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)"; // REDUCIDO: de -4px a -3px
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.borderColor = "#FF6B35";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.borderColor = "#f1f5f9";
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "22px", // REDUCIDO: de 24px a 22px
                    flexWrap: "wrap"
                  }}>
                    {/* Sección izquierda - Info del pedido */}
                    <div style={{ flex: 1, minWidth: "280px" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "10px" // REDUCIDO: de 12px a 10px
                      }}>
                        <div style={{
                          fontSize: "30px", // REDUCIDO: de 32px a 30px
                          background: estadoPedido === "COMPLETADO" ? "rgba(16, 185, 129, 0.1)" :
                                    estadoPedido === "PENDIENTE" ? "rgba(245, 158, 11, 0.1)" :
                                    estadoPedido === "CANCELADO" ? "rgba(239, 68, 68, 0.1)" : "rgba(139, 92, 246, 0.1)",
                          width: "55px", // REDUCIDO: de 60px a 55px
                          height: "55px", // REDUCIDO: de 60px a 55px
                          borderRadius: "11px", // REDUCIDO: de 12px a 11px
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: estadoPedido === "COMPLETADO" ? "#10B981" :
                                estadoPedido === "PENDIENTE" ? "#F59E0B" :
                                estadoPedido === "CANCELADO" ? "#EF4444" : "#8B5CF6"
                        }}>
                          {getEstadoEmoji(estadoPedido)}
                        </div>
                        <div>
                          <h3 style={{
                            margin: 0,
                            fontSize: "21px", // REDUCIDO: de 22px a 21px
                            color: "#2C3E50",
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            fontWeight: "700"
                          }}>
                            Pedido #{pedidoId}
                          </h3>
                          
                          {/* Estado */}
                          <div style={{
                            display: "inline-block",
                            padding: "5px 14px", // REDUCIDO: de 6px 16px
                            borderRadius: "18px", // REDUCIDO: de 20px
                            background: estadoPedido === "COMPLETADO"
                              ? "rgba(16, 185, 129, 0.1)"
                              : estadoPedido === "PENDIENTE"
                                ? "rgba(245, 158, 11, 0.1)"
                                : estadoPedido === "CANCELADO"
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : "rgba(139, 92, 246, 0.1)",
                            fontSize: "13px", // REDUCIDO: de 14px a 13px
                            fontWeight: "700",
                            color: estadoPedido === "COMPLETADO"
                              ? "#10B981"
                              : estadoPedido === "PENDIENTE"
                                ? "#F59E0B"
                                : estadoPedido === "CANCELADO"
                                  ? "#EF4444"
                                  : "#8B5CF6",
                            marginTop: "6px" // REDUCIDO: de 8px a 6px
                          }}>
                            {getEstadoLabel(estadoPedido)}
                          </div>
                        </div>
                      </div>

                      {/* Fecha */}
                      {pedido.fechaPedido && (
                        <p style={{
                          margin: "10px 0", // REDUCIDO: de 12px
                          color: "#64748b",
                          fontSize: "14px", // REDUCIDO: de 15px a 14px
                          display: "flex",
                          alignItems: "center",
                          gap: "6px" // REDUCIDO: de 8px
                        }}>
                          <span style={{ fontSize: "16px" }}>📅</span>
                          {formatearFecha(pedido.fechaPedido)}
                        </p>
                      )}

                      {/* Vendedor */}
                      {pedido.vendedor && (
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px", // REDUCIDO: de 8px 16px
                          borderRadius: "10px", // REDUCIDO: de 12px
                          background: "#f8fafc",
                          fontSize: "13px", // REDUCIDO: de 14px a 13px
                          fontWeight: "600",
                          color: "#64748b",
                          marginTop: "6px" // REDUCIDO: de 8px
                        }}>
                          <span style={{ fontSize: "15px" }}>👤</span>
                          Vendedor: {pedido.vendedor.nombre || `#${pedido.vendedor.idVendedor}`}
                        </div>
                      )}
                    </div>

                    {/* Sección derecha - Precio y acciones */}
                    <div style={{
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "14px" // REDUCIDO: de 16px a 14px
                    }}>
                      {/* Precio */}
                      <div style={{
                        fontWeight: "900",
                        fontSize: "34px", // REDUCIDO: de 36px a 34px
                        color: "#FF6B35",
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        lineHeight: 1,
                        textShadow: "0 2px 4px rgba(255, 107, 53, 0.1)"
                      }}>
                        ${money(totalPedido)}
                      </div>

                      {/* Botones de acción */}
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}> {/* REDUCIDO: de 12px a 10px */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/pedido/${pedidoId}`);
                          }}
                          style={{
                            padding: "10px 20px", // REDUCIDO: de 12px 24px
                            borderRadius: "10px", // REDUCIDO: de 12px
                            border: "2px solid #FF6B35",
                            cursor: "pointer",
                            background: "white",
                            color: "#FF6B35",
                            fontSize: "14px", // REDUCIDO: de 15px a 14px
                            fontWeight: "700",
                            transition: "all 0.3s ease",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontFamily: "'Inter', sans-serif"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#FF6B35";
                            e.target.style.color = "white";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 15px rgba(255, 107, 53, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.color = "#FF6B35";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          <span>🔍</span>
                          Ver detalles
                        </button>

                        {(estadoPedido === "COMPLETADO" || estadoPedido === "PENDIENTE_VERIFICACION") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/factura-consolidada/${idCompraUnificada}`, {
                                state: {
                                  compraData: compraData
                                }
                              });
                            }}
                            style={{
                              padding: "10px 20px",
                              borderRadius: "10px",
                              border: "none",
                              cursor: "pointer",
                              background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                              color: "white",
                              fontSize: "14px",
                              fontWeight: "700",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
                              whiteSpace: "nowrap",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontFamily: "'Inter', sans-serif"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 6px 16px rgba(139, 92, 246, 0.35)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.25)";
                            }}
                          >
                            <span>📄</span>
                            Ver factura
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÓN VOLVER AL FINAL (ÚNICO) */}
        <div style={{ textAlign: "center", marginTop: "30px" }}> {/* REDUCIDO: de 40px a 30px */}
          <button
            onClick={() => navigate("/mis-pedidos")}
            style={{
              padding: "14px 28px", // REDUCIDO: de 16px 32px
              background: "white",
              border: "2px solid #e5e7eb",
              color: "#64748b",
              borderRadius: "10px", // REDUCIDO: de 12px
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "15px", // REDUCIDO: de 16px a 15px
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)"; // REDUCIDO: de -3px a -2px
              e.currentTarget.style.borderColor = "#FF6B35";
              e.currentTarget.style.color = "#FF6B35";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ← Volver al historial de compras
          </button>
        </div>
      </div>

      <Footer />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes floatCircle {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          20% { 
            transform: translate(20px, -25px) scale(1.08); 
          }
          40% { 
            transform: translate(-15px, 20px) scale(0.92); 
          }
          60% { 
            transform: translate(10px, 15px) scale(1.05); 
          }
          80% { 
            transform: translate(-20px, -15px) scale(0.98); 
          }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 28px !important;
          }
          
          .stats-container {
            grid-template-columns: 1fr !important;
          }
          
          .pedido-container {
            flex-direction: column !important;
            gap: 16px !important;
          }
          
          .pedido-actions {
            flex-direction: column !important;
            width: 100% !important;
          }
          
          .pedido-actions button {
            width: 100% !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 24px !important;
          }
          
          .header-container {
            padding: 40px 20px 30px 20px !important;
          }
          
          .info-card {
            padding: 16px !important;
            height: auto !important;
          }
          
          .stat-card {
            height: auto !important;
            padding: 16px !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        input:focus, select:focus, button:focus {
          outline: none;
        }
        
        button {
          cursor: pointer;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}