import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

// 🆕 HELPERS PARA SEGUIMIENTO Y PROGRESO
const pasosSeguimiento = [
  "PEDIDO_REALIZADO",
  "RECOLECTANDO",
  "EMPACANDO",
  "EN_CAMINO",
  "LISTO_PARA_RETIRO",
  "ENTREGADO"
];

const getPasoActivo = (estado) => {
  const index = pasosSeguimiento.indexOf(estado);
  return index !== -1 ? index : 0;
};

const getSeguimientoTexto = (estado) => {
  const textos = {
    PEDIDO_REALIZADO: "Pedido confirmado",
    RECOLECTANDO: "Recolectando productos",
    EMPACANDO: "Empacando pedido",
    EN_CAMINO: "Tu pedido va en camino",
    LISTO_PARA_RETIRO: "Listo para retirar",
    ENTREGADO: "Pedido entregado"
  };
  return textos[estado] || "Procesando pedido";
};

const getPasoLabel = (paso) => {
  const labels = {
    PEDIDO_REALIZADO: "Realizado",
    RECOLECTANDO: "Recolectando",
    EMPACANDO: "Empacando",
    EN_CAMINO: "En camino",
    LISTO_PARA_RETIRO: "Listo",
    ENTREGADO: "Entregado"
  };
  return labels[paso] || paso.replaceAll("_", " ");
};

// 🆕 Helper para verificar si el usuario es repartidor/vendedor
const esRepartidorOVendedor = () => {
  const userRole = localStorage.getItem('userRole');
  return userRole === 'ROLE_REPARTIDOR' || userRole === 'ROLE_VENDEDOR';
};

// 🆕 Helper para verificar si puede marcar como entregado
const puedeMarcarEntregado = (pedido) => {
  return esRepartidorOVendedor() && pedido.estadoSeguimiento === 'EN_CAMINO';
};

export default function MisPedidos({ modo: modoProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // 🎯 MODO REAL - Prioridad: prop > state > default
  const modo = modoProp || location.state?.modo || "lista";

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoAbierto, setPedidoAbierto] = useState(null);

  // Estados que permiten ver factura (LÓGICA SIMPLE QUE FUNCIONA)
  const estadosConFactura = ["PENDIENTE_VERIFICACION", "COMPLETADO"];

  // 🆕 Función para cargar pedidos
  const fetchPedidos = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status}: ${txt}`);
      }

      const data = await response.json();
      setPedidos(data);
      setLoading(false);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setLoading(false);
    }
  };

  // 🆕 Función para marcar como entregado
  const handleMarcarEntregado = async (idPedido, metodoPago) => {
    const confirmar = window.confirm(
      metodoPago === 'EFECTIVO'
        ? '¿Confirmar que el pedido fue entregado y el cliente pagó en efectivo?'
        : '¿Confirmar que el pedido fue entregado?'
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/pedidos/${idPedido}/marcar-entregado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pagado: metodoPago === 'EFECTIVO' })
      });

      if (!response.ok) {
        throw new Error('Error al marcar como entregado');
      }

      alert('✅ Pedido marcado como entregado' + (metodoPago === 'EFECTIVO' ? ' y pagado' : ''));

      // Recargar pedidos
      fetchPedidos();

    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al marcar como entregado: ' + error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/loginmodal");
      return;
    }

    fetchPedidos();
  }, []);

  // 🔥 FILTRO DEFINITIVO - Solo mostrar pedidos válidos
  const pedidosVisibles = pedidos.filter(p =>
    p.total > 0 &&
    ["PENDIENTE", "PENDIENTE_VERIFICACION", "PROCESANDO", "COMPLETADO"].includes(p.estadoPedido)
  );

  return (
    <div style={{
      minHeight: modo === "lista" ? "100vh" : "auto",
      background: modo === "lista" ? "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)" : "transparent",
      fontFamily: "inherit"
    }}>
      
      {/* HEADER SECTION - Solo en modo lista */}
      {modo === "lista" && (
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
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: modo === "lista" ? "1200px" : "100%",
        margin: modo === "lista" ? "0 auto" : "0",
        padding: modo === "lista" ? "0 20px" : "0",
        marginBottom: modo === "lista" ? "40px" : "0"
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
            {modo === "lista" && (
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
            )}
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
                onClick={() => {
                  if (modo === "perfil") {
                    setPedidoAbierto(
                      pedidoAbierto === p.idPedido ? null : p.idPedido
                    );
                  }
                }}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: modo === "perfil" ? "pointer" : "default"
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
                {/* Contenedor principal con flex */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap"
                }}>
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

                    {/* Botones de acción - SOLO EN MODO LISTA */}
                    {modo === "lista" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                        {/* 🆕 Botón para marcar como entregado (solo repartidor/vendedor) */}
                        {puedeMarcarEntregado(p) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarcarEntregado(p.idPedido, p.metodoPago);
                            }}
                            style={{
                              padding: "12px 20px",
                              borderRadius: "12px",
                              border: "none",
                              cursor: "pointer",
                              background: "linear-gradient(135deg, #4CAF50 0%, #45A049 100%)",
                              color: "white",
                              fontSize: "14px",
                              fontWeight: "700",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.25)",
                              whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.35)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.25)";
                            }}
                          >
                            ✅ Marcar como Entregado
                          </button>
                        )}

                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pedido/${p.idPedido}`);
                            }}
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

                          {/* ✅ LÓGICA SIMPLE QUE FUNCIONA */}
                          {estadosConFactura.includes(p.estadoPedido) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/factura/${p.idPedido}`);
                              }}
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
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DESPLEGABLE CON SEGUIMIENTO - SOLO EN MODO PERFIL */}
                {modo === "perfil" && pedidoAbierto === p.idPedido && (
                  <div style={{
                    marginTop: 32,
                    paddingTop: 32,
                    borderTop: "2px solid #E8F5E9"
                  }}>
                    {/* Header decorativo del seguimiento */}
                    <div style={{
                      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
                      borderRadius: "16px",
                      padding: "24px",
                      marginBottom: "24px",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(90, 143, 72, 0.08)"
                    }}>
                      {/* Decoración de fondo sutil */}
                      <div style={{
                        position: "absolute",
                        top: "-30px",
                        right: "-30px",
                        width: "120px",
                        height: "120px",
                        background: "rgba(90, 143, 72, 0.08)",
                        borderRadius: "50%",
                        filter: "blur(30px)"
                      }}></div>

                      <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Título con icono */}
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 12
                        }}>
                          <div style={{
                            width: "48px",
                            height: "48px",
                            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
                          }}>
                            📦
                          </div>
                          <div>
                            <h4 style={{
                              margin: 0,
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "#2D3E2B",
                              fontFamily: "'Playfair Display', 'Georgia', serif"
                            }}>
                              Estado del Pedido
                            </h4>
                            <p style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#6B7F69",
                              marginTop: "4px"
                            }}>
                              Pedido #{p.idPedido}
                            </p>
                          </div>
                        </div>

                        {/* Estado actual destacado */}
                        <div style={{
                          marginTop: 16,
                          padding: "16px",
                          background: "white",
                          borderRadius: "12px",
                          border: "2px solid #E8F5E9",
                          display: "flex",
                          alignItems: "center",
                          gap: 12
                        }}>
                          <span style={{ fontSize: "32px" }}>📍</span>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              margin: 0,
                              fontWeight: 700,
                              color: "#5A8F48",
                              fontSize: "18px",
                              fontFamily: "'Playfair Display', 'Georgia', serif"
                            }}>
                              {getSeguimientoTexto(p.estadoSeguimiento || "PEDIDO_REALIZADO")}
                            </p>
                            <p style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#6B7F69",
                              marginTop: "4px"
                            }}>
                              Actualizado {formatearFecha(p.fechaPedido).split(',')[1]?.trim() || "recientemente"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso mejorada */}
                    <div style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "32px 24px",
                      boxShadow: "0 2px 12px rgba(90, 143, 72, 0.08)",
                      marginBottom: "24px"
                    }}>
                      <h5 style={{
                        margin: "0 0 24px 0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                        textAlign: "center"
                      }}>
                        Línea de tiempo del pedido
                      </h5>

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        position: "relative",
                        marginTop: 16,
                        paddingTop: "8px"
                      }}>
                        {/* Línea de fondo */}
                        <div style={{
                          position: "absolute",
                          top: "15px",
                          left: "0",
                          right: "0",
                          height: "4px",
                          background: "#E0E6D8",
                          zIndex: 0,
                          borderRadius: "2px"
                        }}></div>

                        {/* Línea de progreso animada */}
                        <div style={{
                          position: "absolute",
                          top: "15px",
                          left: "0",
                          width: `${(getPasoActivo(p.estadoSeguimiento || "PEDIDO_REALIZADO") / (pasosSeguimiento.length - 1)) * 100}%`,
                          height: "4px",
                          background: "linear-gradient(90deg, #5A8F48 0%, #4A7A3A 100%)",
                          zIndex: 1,
                          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                          borderRadius: "2px",
                          boxShadow: "0 2px 8px rgba(90, 143, 72, 0.3)"
                        }}></div>

                        {/* Puntos del progreso mejorados */}
                        {pasosSeguimiento.map((paso, index) => {
                          const activo = index <= getPasoActivo(p.estadoSeguimiento || "PEDIDO_REALIZADO");
                          const esActual = index === getPasoActivo(p.estadoSeguimiento || "PEDIDO_REALIZADO");

                          return (
                            <div key={paso} style={{ 
                              flex: 1, 
                              textAlign: "center",
                              position: "relative",
                              zIndex: 2
                            }}>
                              {/* Punto con animación */}
                              <div style={{
                                width: esActual ? 24 : (activo ? 20 : 16),
                                height: esActual ? 24 : (activo ? 20 : 16),
                                borderRadius: "50%",
                                background: activo 
                                  ? "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)" 
                                  : "#C4CFC1",
                                margin: "0 auto 12px",
                                border: activo ? "4px solid white" : "3px solid white",
                                boxShadow: activo 
                                  ? "0 4px 16px rgba(90, 143, 72, 0.4)" 
                                  : "0 2px 8px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                position: "relative"
                              }}>
                                {/* Pulso animado para el paso actual */}
                                {esActual && (
                                  <div style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                    background: "rgba(90, 143, 72, 0.3)",
                                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                                  }}></div>
                                )}
                              </div>

                              {/* Label con estilo mejorado */}
                              <div style={{
                                padding: "8px 4px",
                                borderRadius: "8px",
                                background: activo ? "#F0F7EE" : "transparent",
                                transition: "all 0.3s ease"
                              }}>
                                <small style={{
                                  fontSize: 12,
                                  color: activo ? "#5A8F48" : "#9AAA98",
                                  fontWeight: activo ? 700 : 500,
                                  display: "block",
                                  lineHeight: 1.4,
                                  letterSpacing: "0.3px"
                                }}>
                                  {getPasoLabel(paso)}
                                </small>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Información adicional con mejor diseño */}
                    <div style={{
                      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
                      borderRadius: "16px",
                      padding: "24px",
                      border: "2px solid #E8F5E9"
                    }}>
                      <h5 style={{
                        margin: "0 0 16px 0",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}>
                        <span style={{ fontSize: "18px" }}>📋</span>
                        Detalles del pedido
                      </h5>
                      
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "16px"
                      }}>
                        <div style={{
                          background: "white",
                          padding: "16px",
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                        }}>
                          <span style={{ 
                            color: "#6B7F69", 
                            fontSize: "13px",
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500"
                          }}>
                            ID del Pedido
                          </span>
                          <span style={{ 
                            color: "#2D3E2B", 
                            fontWeight: 700, 
                            fontSize: "16px",
                            fontFamily: "'Courier New', monospace"
                          }}>
                            #{p.idPedido}
                          </span>
                        </div>

                        <div style={{
                          background: "white",
                          padding: "16px",
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                        }}>
                          <span style={{ 
                            color: "#6B7F69", 
                            fontSize: "13px",
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500"
                          }}>
                            Total Pagado
                          </span>
                          <span style={{ 
                            color: "#5A8F48", 
                            fontWeight: 800, 
                            fontSize: "20px",
                            fontFamily: "'Playfair Display', 'Georgia', serif"
                          }}>
                            ${money(p.total)}
                          </span>
                        </div>

                        <div style={{
                          background: "white",
                          padding: "16px",
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                        }}>
                          <span style={{ 
                            color: "#6B7F69", 
                            fontSize: "13px",
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500"
                          }}>
                            Estado
                          </span>
                          <span style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "16px",
                            background: p.estadoPedido === "COMPLETADO" 
                              ? "#E8F5E9" 
                              : "#FFF8E1",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: p.estadoPedido === "COMPLETADO" 
                              ? "#2E7D32" 
                              : "#F57C00"
                          }}>
                            {getEstadoLabel(p.estadoPedido)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modo === "lista" && <Footer />}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-15px, -20px); }
          50% { transform: translate(10px, -15px); }
          75% { transform: translate(-5px, 10px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-20px, 15px); }
          66% { transform: translate(15px, -10px); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          30% { transform: translate(20px, -15px); }
          60% { transform: translate(-10px, 20px); }
        }

        @keyframes float4 {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(15px, 20px); }
          80% { transform: translate(-20px, -10px); }
        }
      `}</style>
    </div>
  );
}