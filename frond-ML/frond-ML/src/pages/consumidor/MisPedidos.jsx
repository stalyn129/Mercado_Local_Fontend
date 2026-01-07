import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

// Helper para formatear dinero de forma segura
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

// Helper para formatear la fecha de forma más amigable
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

export default function MisPedidos() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados que permiten ver factura
  const estadosConFactura = ["PENDIENTE_VERIFICACION", "COMPLETADO"];

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/loginmodal");
      return;
    }

    fetch(`${API_URL}/pedidos/mis-pedidos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        return res.json();
      })
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando pedidos:", err);
        setLoading(false);
      });
  }, []);

  // 🔥 FILTRO DEFINITIVO - Solo mostrar pedidos válidos
  const pedidosVisibles = pedidos.filter(p =>
    p.total > 0 &&
    ["PENDIENTE_VERIFICACION", "COMPLETADO"].includes(p.estadoPedido)
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      
      {/* HEADER SECTION */}
      <div style={{
        background: "white",
        borderRadius: "0 0 20px 20px",
        padding: "48px 32px",
        marginBottom: "40px",
        boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decoración de fondo - Círculos suaves CON ANIMACIÓN */}
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "250px",
          height: "250px",
          background: "linear-gradient(135deg, rgba(90, 143, 72, 0.15) 0%, rgba(74, 122, 58, 0.08) 100%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: "0",
          animation: "float1 8s ease-in-out infinite"
        }}></div>
        
        <div style={{
          position: "absolute",
          top: "50%",
          right: "10%",
          width: "150px",
          height: "150px",
          background: "linear-gradient(135deg, rgba(236, 242, 227, 0.8) 0%, rgba(221, 232, 208, 0.5) 100%)",
          borderRadius: "50%",
          filter: "blur(30px)",
          zIndex: "0",
          animation: "float2 10s ease-in-out infinite"
        }}></div>
        
        <div style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "200px",
          height: "200px",
          background: "linear-gradient(135deg, rgba(90, 143, 72, 0.12) 0%, rgba(74, 122, 58, 0.06) 100%)",
          borderRadius: "50%",
          filter: "blur(35px)",
          zIndex: "0",
          animation: "float3 12s ease-in-out infinite"
        }}></div>
        
        <div style={{
          position: "absolute",
          top: "20%",
          left: "15%",
          width: "120px",
          height: "120px",
          background: "linear-gradient(135deg, rgba(90, 143, 72, 0.1) 0%, rgba(74, 122, 58, 0.05) 100%)",
          borderRadius: "50%",
          filter: "blur(25px)",
          zIndex: "0",
          animation: "float4 9s ease-in-out infinite"
        }}></div>

        <div style={{ position: "relative", zIndex: "1" }}>
          {/* Icono decorativo */}
          <div style={{
            fontSize: "56px",
            marginBottom: "16px",
            filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
          }}>
            🛍️
          </div>

          {/* Título estilo Don Carlos Market */}
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#6B7F69",
            marginBottom: "8px",
            fontWeight: "500"
          }}>
            Historial de Compras
          </div>
          
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "48px",
            fontWeight: "700",
            color: "#2D3E2B",
            margin: "0 0 16px 0",
            letterSpacing: "1px",
            lineHeight: "1.2"
          }}>
            Mis Compras
          </h1>

          {/* Subtítulo */}
          <p style={{
            color: "#6B7F69",
            fontSize: "16px",
            margin: "0 auto",
            maxWidth: "600px",
            lineHeight: "1.6"
          }}>
            {pedidosVisibles.length > 0 
              ? `Tienes ${pedidosVisibles.length} compra${pedidosVisibles.length > 1 ? 's' : ''} realizada${pedidosVisibles.length > 1 ? 's' : ''}`
              : "Aquí aparecerán todas tus compras realizadas"
            }
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        marginBottom: "40px"
      }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
          }}>
            <div style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "5px solid #ECF2E3",
              borderTop: "5px solid #5A8F48",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{
              marginTop: "20px",
              fontSize: "16px",
              color: "#6B7F69",
              fontWeight: "600"
            }}>
              Cargando tus compras...
            </p>
          </div>
        ) : pedidosVisibles.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
            <p style={{
              color: "#2D3E2B",
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 8px 0"
            }}>
              Aún no tienes compras realizadas
            </p>
            <p style={{
              color: "#9AAA98",
              fontSize: "15px",
              margin: "0 0 24px 0"
            }}>
              Solo se muestran pedidos pagados o en verificación
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                border: "none",
                color: "white",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
              }}
            >
              Ir a la tienda
            </button>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            {pedidosVisibles.map((p) => (
              <div
                key={p.idPedido}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(90, 143, 72, 0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.1)";
                }}
              >
                {/* Sección izquierda - Info del pedido */}
                <div style={{ flex: 1, minWidth: "280px" }}>
                  {/* Título con emoji */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    marginBottom: 12 
                  }}>
                    <span style={{ fontSize: "32px" }}>
                      {getEstadoEmoji(p.estadoPedido)}
                    </span>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: "22px", 
                      color: "#2D3E2B",
                      fontFamily: "'Playfair Display', 'Georgia', serif",
                      fontWeight: "700"
                    }}>
                      Compra del {formatearFecha(p.fechaPedido).split(',')[0]}
                    </h3>
                  </div>
                  
                  {/* Fecha completa */}
                  <p style={{ 
                    margin: "0 0 12px 0", 
                    color: "#6B7F69", 
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span style={{ fontSize: "16px" }}>📅</span>
                    {formatearFecha(p.fechaPedido)}
                  </p>
                  
                  {/* Badge de estado */}
                  <div style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background: p.estadoPedido === "COMPLETADO" 
                      ? "#E8F5E9" 
                      : "#FFF8E1",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: p.estadoPedido === "COMPLETADO" 
                      ? "#2E7D32" 
                      : "#F57C00"
                  }}>
                    {getEstadoLabel(p.estadoPedido)}
                  </div>
                </div>

                {/* Sección derecha - Precio y acciones */}
                <div style={{ 
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 16
                }}>
                  {/* Precio destacado */}
                  <div style={{ 
                    fontWeight: "800", 
                    fontSize: "32px", 
                    color: "#5A8F48",
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    lineHeight: 1
                  }}>
                    ${money(p.total)}
                  </div>

                  {/* Botones de acción */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => navigate(`/pedido/${p.idPedido}`)}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        border: "2px solid #5A8F48",
                        cursor: "pointer",
                        background: "white",
                        color: "#5A8F48",
                        fontSize: "14px",
                        fontWeight: "700",
                        transition: "all 0.3s ease",
                        whiteSpace: "nowrap"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#ECF2E3";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "white";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      Ver detalles
                    </button>

                    <button
                      onClick={() => navigate(`/factura/${p.idPedido}`)}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        border: "none",
                        cursor: "pointer",
                        background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "700",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)",
                        whiteSpace: "nowrap"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
                      }}
                    >
                      📄 Ver factura
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-15px, -20px);
          }
          50% {
            transform: translate(10px, -15px);
          }
          75% {
            transform: translate(-5px, 10px);
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(-20px, 15px);
          }
          66% {
            transform: translate(15px, -10px);
          }
        }

        @keyframes float3 {
          0%, 100% {
            transform: translate(0, 0);
          }
          30% {
            transform: translate(20px, -15px);
          }
          60% {
            transform: translate(-10px, 20px);
          }
        }

        @keyframes float4 {
          0%, 100% {
            transform: translate(0, 0);
          }
          40% {
            transform: translate(15px, 20px);
          }
          80% {
            transform: translate(-20px, -10px);
          }
        }
      `}</style>
    </div>
  );
}