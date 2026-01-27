import { useState, useEffect } from "react";
import Footer from "../../components/Footer.jsx";

export default function GestionarPedidos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);

  // ==================== ANIMACIÓN DE CÍRCULOS DE COLORES ====================
  useEffect(() => {
    const generateCircles = () => {
      const circles = [];
      const colors = [
        "rgba(255, 107, 53, 0.12)",
        "rgba(52, 211, 153, 0.12)",
        "rgba(59, 130, 246, 0.12)",
        "rgba(168, 85, 247, 0.12)",
        "rgba(239, 68, 68, 0.12)",
        "rgba(245, 158, 11, 0.12)",
        "rgba(14, 165, 233, 0.12)",
        "rgba(236, 72, 153, 0.12)"
      ];
      
      for (let i = 0; i < 10; i++) {
        circles.push({
          id: i,
          size: Math.random() * 80 + 40,
          top: Math.random() * 100,
          left: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 20 + 25 + "s",
          blur: Math.random() * 3 + 1 + "px",
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
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return window.location.href = "/loginmodal";

    cargarPedidos(user.idVendedor, user.token);
  }, []);

  const cargarPedidos = async (idVendedor, token) => {
    try {
      const res = await fetch(`${API_URL}/pedidos/vendedor/${idVendedor}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      // Normalizar los datos
      const pedidosNormalizados = data
        .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
        .map(p => ({
          idPedido: p.idPedido,
          idPedidoVendedor: p.idPedidoVendedor,
          nombreCliente: p.consumidor?.usuario
            ? `${p.consumidor.usuario.nombre} ${p.consumidor.usuario.apellido}`
            : "Cliente sin nombre",
          total: p.total,
          fecha: p.fechaPedido,
          estadoPedido: p.estadoPedido,
          estadoPedidoVendedor: p.estadoPedidoVendedor,
          estadoPago: p.estadoPago,
          estadoSeguimiento: p.estadoSeguimientoPedido
        }));

      console.log("✅ Pedidos normalizados:", pedidosNormalizados);
      setPedidos(pedidosNormalizados);
    } catch (err) {
      console.error("❌ Error cargando pedidos:", err);
      alert("Error al cargar los pedidos. Por favor verifica la consola.");
    } finally {
      setCargando(false);
    }
  };

  // Función para cambiar el estado del pedido del vendedor
  const cambiarEstadoPedido = async (idPedidoVendedor, nuevoEstado, token) => {
    try {
      const res = await fetch(`${API_URL}/pedidos/vendedor/${idPedidoVendedor}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          estadoPedidoVendedor: nuevoEstado
        })
      });

      if (res.ok) {
        alert("Estado actualizado correctamente");
        // Recargar pedidos
        const user = JSON.parse(localStorage.getItem("user"));
        cargarPedidos(user.idVendedor, user.token);
      } else {
        alert("Error al actualizar el estado");
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("Error al actualizar el estado");
    }
  };

  // Determinar qué estado mostrar según el flujo
  const obtenerEstadoParaMostrar = (pedido) => {
    if (pedido.estadoPedido === "CANCELADO" || pedido.estadoPago === "CANCELADO") {
      return "Cancelado";
    }
    
    if (pedido.estadoPago === "PENDIENTE") {
      return "Esperando pago";
    }
    
    if (pedido.estadoPago === "EN_VERIFICACION") {
      return "Verificando pago";
    }
    
    if (pedido.estadoPago === "RECHAZADO") {
      return "Pago rechazado";
    }
    
    if (pedido.estadoPago === "PAGADO") {
      const estadoMap = {
        "NUEVO": "Nuevo",
        "EN_PROCESO": "En Proceso",
        "DESPACHADO": "Despachado",
        "ENTREGADO": "Entregado",
        "CANCELADO": "Cancelado"
      };
      return estadoMap[pedido.estadoPedidoVendedor] || pedido.estadoPedidoVendedor;
    }
    
    return pedido.estadoPedido || "Pendiente";
  };

  // Obtener los próximos estados disponibles según el estado actual
  const obtenerProximosEstados = (pedido) => {
    const estadosDisponibles = [];
    const estadoActual = pedido.estadoPedidoVendedor;
    const estadoPago = pedido.estadoPago;

    if (estadoPago !== "PAGADO" || 
        pedido.estadoPedido === "CANCELADO" || 
        pedido.estadoPago === "CANCELADO") {
      return [];
    }

    switch (estadoActual) {
      case "NUEVO":
        estadosDisponibles.push("EN_PROCESO", "CANCELADO");
        break;
      case "EN_PROCESO":
        estadosDisponibles.push("DESPACHADO", "CANCELADO");
        break;
      case "DESPACHADO":
        estadosDisponibles.push("ENTREGADO");
        break;
      case "ENTREGADO":
        break;
      case "CANCELADO":
        break;
      default:
        estadosDisponibles.push("NUEVO");
    }

    return estadosDisponibles;
  };

  const obtenerColorEstado = (estado) => {
    const estados = {
      "Nuevo": { bg: "#FFF9E6", color: "#F59E0B" },
      "En Proceso": { bg: "#DBEAFE", color: "#3B82F6" },
      "Despachado": { bg: "#D1FAE5", color: "#10B981" },
      "Entregado": { bg: "#DCFCE7", color: "#059669" },
      "Cancelado": { bg: "#FEE2E2", color: "#EF4444" },
      "Esperando pago": { bg: "#FEF3C7", color: "#D97706" },
      "Verificando pago": { bg: "#CFFAFE", color: "#0E7490" },
      "Pago rechazado": { bg: "#FEE2E2", color: "#B91C1C" }
    };
    return estados[estado] || { bg: "#F1F5F9", color: "#64748B" };
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const total = pedidos.length;
    const completados = pedidos.filter(p => obtenerEstadoParaMostrar(p) === "Entregado").length;
    const enProceso = pedidos.filter(p => ["Nuevo", "En Proceso", "Despachado"].includes(obtenerEstadoParaMostrar(p))).length;
    const pendientesPago = pedidos.filter(p => obtenerEstadoParaMostrar(p) === "Esperando pago").length;
    const cancelados = pedidos.filter(p => obtenerEstadoParaMostrar(p) === "Cancelado").length;
    const totalVentas = pedidos.filter(p => p.estadoPago === "PAGADO").reduce((sum, p) => sum + (p.total || 0), 0);

    return {
      total,
      completados,
      enProceso,
      pendientesPago,
      cancelados,
      totalVentas
    };
  };

  const estadisticas = calcularEstadisticas();

  return (
    <div style={{ 
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden",
      position: "relative"
    }}>
      
      {/* CÍRCULOS DE COLORES ANIMADOS EN EL FONDO */}
      {circlePositions.map(circle => (
        <div 
          key={circle.id}
          style={{
            position: "fixed",
            top: `${circle.top}%`,
            left: `${circle.left}%`,
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            background: circle.color,
            borderRadius: "50%",
            animation: `floatCircle ${circle.animationDuration} ease-in-out infinite`,
            animationDelay: circle.animationDelay,
            filter: `blur(${circle.blur})`,
            opacity: 0.7,
            zIndex: circle.zIndex,
            pointerEvents: "none"
          }}
        />
      ))}

      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px",
        position: "relative",
        zIndex: "10"
      }}>
        
        {/* Header con efecto de dashboard */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "60px 40px",
          marginBottom: "40px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          border: "1px solid #f1f5f9"
        }}>
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
              Panel de Pedidos
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "48px",
              fontWeight: "700",
              color: "#2C3E50",
              margin: "0 0 16px 0",
              letterSpacing: "0.5px",
              lineHeight: "1.2"
            }}>
              Gestión de Pedidos
            </h1>
            
            <p style={{
              color: "#8B5CF6",
              fontSize: "16px",
              margin: "0 auto",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontWeight: "400",
              opacity: 0.8
            }}>
              Gestiona y sigue el estado de todos los pedidos de tus clientes
            </p>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "40px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            transition: "all 0.4s ease",
            border: "1px solid #f1f5f9",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(255, 107, 53, 0.15)";
            e.currentTarget.style.borderColor = "#FF6B35";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "#f1f5f9";
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "rgba(255, 107, 53, 0.08)",
              borderRadius: "50%",
              zIndex: "0"
            }}></div>
            
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#64748b", 
              marginBottom: "12px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              position: "relative",
              zIndex: "1"
            }}>
              📦 Total de Pedidos
            </div>
            <div style={{ 
              fontSize: "42px", 
              fontWeight: "800", 
              color: "#FF6B35",
              position: "relative",
              zIndex: "1"
            }}>
              {estadisticas.total}
            </div>
            <div style={{
              marginTop: "15px",
              fontSize: "13px",
              color: "#94a3b8",
              position: "relative",
              zIndex: "1"
            }}>
              <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Pedidos en total
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            transition: "all 0.4s ease",
            border: "1px solid #f1f5f9",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(59, 130, 246, 0.15)";
            e.currentTarget.style.borderColor = "#3B82F6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "#f1f5f9";
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "rgba(59, 130, 246, 0.08)",
              borderRadius: "50%",
              zIndex: "0"
            }}></div>
            
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#64748b", 
              marginBottom: "12px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              position: "relative",
              zIndex: "1"
            }}>
              💰 Total en Ventas
            </div>
            <div style={{ 
              fontSize: "42px", 
              fontWeight: "800", 
              color: "#3B82F6",
              position: "relative",
              zIndex: "1"
            }}>
              ${estadisticas.totalVentas.toFixed(2)}
            </div>
            <div style={{
              marginTop: "15px",
              fontSize: "13px",
              color: "#94a3b8",
              position: "relative",
              zIndex: "1"
            }}>
              <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Ventas confirmadas
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            transition: "all 0.4s ease",
            border: "1px solid #f1f5f9",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(52, 211, 153, 0.15)";
            e.currentTarget.style.borderColor = "#34D399";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.08)";
            e.currentTarget.style.borderColor = "#f1f5f9";
          }}>
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "rgba(52, 211, 153, 0.08)",
              borderRadius: "50%",
              zIndex: "0"
            }}></div>
            
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#64748b", 
              marginBottom: "12px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              position: "relative",
              zIndex: "1"
            }}>
              ✅ Pedidos Completados
            </div>
            <div style={{ 
              fontSize: "42px", 
              fontWeight: "800", 
              color: "#34D399",
              position: "relative",
              zIndex: "1"
            }}>
              {estadisticas.completados}
            </div>
            <div style={{
              marginTop: "15px",
              fontSize: "13px",
              color: "#94a3b8",
              position: "relative",
              zIndex: "1"
            }}>
              <span style={{ color: "#10B981", fontWeight: "600" }}>↑</span> Entregados exitosamente
            </div>
          </div>
        </div>

        {/* Contenedor de Pedidos con diseño moderno */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9",
          position: "relative"
        }}>
          {/* Header de la tabla con icono */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "30px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                fontSize: "32px",
                background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)"
              }}>
                📋
              </div>
              <div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 4px 0"
                }}>
                  Lista de Pedidos
                </h2>
                <p style={{
                  color: "#64748b",
                  fontSize: "14px",
                  margin: "0",
                  fontWeight: "500"
                }}>
                  {pedidos.length} pedidos recibidos
                </p>
              </div>
            </div>
            
            {pedidos.length > 0 && (
              <div style={{
                background: "#f1f5f9",
                padding: "10px 20px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>📈</span>
                <span>En proceso: {estadisticas.enProceso} pedidos</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {cargando ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              marginBottom: "20px"
            }}>
              <div style={{ 
                display: "inline-block",
                width: "60px",
                height: "60px",
                border: "5px solid #f1f5f9",
                borderTop: "5px solid #3B82F6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px"
              }}></div>
              <p style={{ 
                marginTop: "25px", 
                fontSize: "18px", 
                color: "#2C3E50", 
                fontWeight: "600" 
              }}>
                Cargando pedidos...
              </p>
              <p style={{ 
                color: "#64748b",
                fontSize: "14px",
                marginTop: "8px"
              }}>
                Obteniendo información de pedidos
              </p>
            </div>
          ) : pedidos.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 20px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              marginBottom: "20px"
            }}>
              <div style={{ 
                fontSize: "64px", 
                marginBottom: "20px",
                opacity: 0.5,
                animation: "float 3s ease-in-out infinite"
              }}>📦</div>
              <p style={{ 
                fontWeight: "600",
                fontSize: "20px",
                marginBottom: "12px",
                color: "#2C3E50"
              }}>No hay pedidos registrados</p>
              <p style={{ 
                fontSize: "16px",
                color: "#64748b",
                marginBottom: "32px",
                maxWidth: "400px",
                marginLeft: "auto",
                marginRight: "auto"
              }}>
                Los pedidos de tus clientes aparecerán aquí
              </p>
            </div>
          ) : (
            <>
              {/* Tabla de Pedidos */}
              <div style={{ overflowX: "auto", marginBottom: "30px" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  minWidth: "1000px"
                }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)"
                    }}>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>#</span>
                          <span>N° Pedido</span>
                        </div>
                      </th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>👤</span>
                          <span>Cliente</span>
                        </div>
                      </th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>💰</span>
                          <span>Total</span>
                        </div>
                      </th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>📅</span>
                          <span>Fecha</span>
                        </div>
                      </th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "left", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>📊</span>
                          <span>Estado</span>
                        </div>
                      </th>
                      <th style={{ 
                        padding: "22px 20px", 
                        textAlign: "center", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "2px solid #E2E8F0"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          <span>⚡</span>
                          <span>Acciones</span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pedidos.map((p, index) => {
                      const estadoParaMostrar = obtenerEstadoParaMostrar(p);
                      const proximosEstados = obtenerProximosEstados(p);
                      const user = JSON.parse(localStorage.getItem("user"));
                      const colorEstado = obtenerColorEstado(estadoParaMostrar);

                      return (
                        <tr key={p.idPedidoVendedor || p.idPedido} style={{ 
                          borderBottom: index === pedidos.length - 1 ? "none" : "1px solid #f1f5f9",
                          transition: "all 0.3s ease",
                          background: index % 2 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(248, 250, 252, 0.5)"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)";
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(248, 250, 252, 0.5)";
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        >
                          {/* Número de Pedido */}
                          <td style={{ 
                            padding: "20px",
                            borderLeft: "4px solid transparent",
                            borderImage: index % 3 === 0 ? "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%) 1" :
                                      index % 3 === 1 ? "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%) 1" :
                                      "linear-gradient(135deg, #10B981 0%, #34D399 100%) 1"
                          }}>
                            <div style={{ 
                              fontWeight: "800",
                              color: "#2C3E50",
                              fontSize: "16px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              <span style={{
                                background: "#F1F5F9",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#475569"
                              }}>
                                #{index + 1}
                              </span>
                              <div>
                                <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                                  ID: {p.idPedidoVendedor?.toString().substring(0, 8) || p.idPedido?.toString().substring(0, 8) || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Cliente */}
                          <td style={{ 
                            padding: "20px",
                            verticalAlign: "top"
                          }}>
                            <div style={{ 
                              fontWeight: "700",
                              color: "#2C3E50",
                              fontSize: "16px",
                              marginBottom: "6px"
                            }}>
                              {p.nombreCliente}
                            </div>
                          </td>
                          
                          {/* Total */}
                          <td style={{ 
                            padding: "20px",
                            verticalAlign: "top"
                          }}>
                            <div style={{ 
                              fontWeight: "800",
                              color: "#FF6B35",
                              fontSize: "18px",
                              marginBottom: "6px"
                            }}>
                              ${typeof p.total === 'number' ? p.total.toFixed(2) : parseFloat(p.total || 0).toFixed(2)}
                            </div>
                          </td>
                          
                          {/* Fecha */}
                          <td style={{ 
                            padding: "20px",
                            verticalAlign: "top"
                          }}>
                            <div style={{
                              color: "#64748B",
                              fontSize: "14px",
                              fontWeight: "600",
                              marginBottom: "4px"
                            }}>
                              {new Date(p.fecha).toLocaleDateString("es-EC", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })}
                            </div>
                            <div style={{
                              color: "#94A3B8",
                              fontSize: "13px"
                            }}>
                              {new Date(p.fecha).toLocaleTimeString("es-EC", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </td>
                          
                          {/* Estado */}
                          <td style={{ 
                            padding: "20px",
                            verticalAlign: "top"
                          }}>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px"
                            }}>
                              <span style={{
                                background: colorEstado.bg,
                                color: colorEstado.color,
                                padding: "10px 16px",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "800",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                                maxWidth: "200px"
                              }}>
                                <span style={{
                                  width: "8px",
                                  height: "8px",
                                  background: colorEstado.color,
                                  borderRadius: "50%"
                                }}></span>
                                {estadoParaMostrar}
                              </span>
                              
                              {/* Indicador de pago */}
                              {p.estadoPago && (
                                <div style={{
                                  fontSize: "12px",
                                  color: "#64748B",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}>
                                  {p.estadoPago === "PAGADO" ? (
                                    <>
                                      <span style={{ color: "#10B981" }}>✅</span>
                                      <span>Pago confirmado</span>
                                    </>
                                  ) : p.estadoPago === "PENDIENTE" ? (
                                    <>
                                      <span style={{ color: "#F59E0B" }}>⏳</span>
                                      <span>Pago pendiente</span>
                                    </>
                                  ) : (
                                    <>
                                      <span style={{ color: "#EF4444" }}>⚠️</span>
                                      <span>Pago: {p.estadoPago.toLowerCase()}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Acciones */}
                          <td style={{ 
                            padding: "20px",
                            textAlign: "center",
                            verticalAlign: "top"
                          }}>
                            <div style={{ 
                              display: "flex", 
                              flexDirection: "column",
                              gap: "12px",
                              alignItems: "center"
                            }}>
                              {/* Botón Ver Detalles */}
                              <button
                                onClick={() => window.location.href = `/vendedor/pedido/${p.idPedido}`}
                                style={{
                                  background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                                  color: "white",
                                  border: "none",
                                  padding: "12px 24px",
                                  borderRadius: "12px",
                                  cursor: "pointer",
                                  fontWeight: "700",
                                  fontSize: "13px",
                                  transition: "all 0.3s ease",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  width: "100%",
                                  justifyContent: "center",
                                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = "translateY(-3px)";
                                  e.target.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.4)";
                                  e.target.style.background = "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.3)";
                                  e.target.style.background = "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)";
                                }}
                              >
                                <span style={{ fontSize: "16px" }}>🔍</span>
                                Ver Detalles
                              </button>
                              
                              {/* Selector de estado (solo si hay estados disponibles) */}
                              {proximosEstados.length > 0 && (
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      cambiarEstadoPedido(p.idPedidoVendedor, e.target.value, user.token);
                                      e.target.value = ""; // Reset select
                                    }
                                  }}
                                  style={{
                                    padding: "12px 16px",
                                    borderRadius: "12px",
                                    border: "2px solid #3B82F6",
                                    background: "white",
                                    color: "#1E293B",
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    width: "100%",
                                    transition: "all 0.3s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.2)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  <option value="">🔄 Cambiar estado</option>
                                  {proximosEstados.map((estado) => (
                                    <option key={estado} value={estado}>
                                      {estado === "EN_PROCESO" ? "📦 Marcar como En Proceso" :
                                       estado === "DESPACHADO" ? "🚚 Marcar como Despachado" :
                                       estado === "ENTREGADO" ? "✅ Marcar como Entregado" :
                                       estado === "CANCELADO" ? "❌ Cancelar pedido" : estado}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer de estadísticas */}
              <div style={{
                padding: "24px",
                background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
                borderRadius: "16px",
                borderTop: "2px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <div style={{
                    background: "white",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    color: "#475569",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{ 
                      color: "#3B82F6",
                      fontSize: "16px"
                    }}>
                      📊
                    </span>
                    <div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        Resumen de pedidos
                      </div>
                      <div>
                        <strong style={{ color: "#2C3E50", fontSize: "15px" }}>
                          {pedidos.length}
                        </strong> pedidos totales
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#64748B"
                    }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        background: "#10B981",
                        borderRadius: "50%"
                      }}></div>
                      <span>Entregados: <strong>{estadisticas.completados}</strong></span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#64748B"
                    }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        background: "#3B82F6",
                        borderRadius: "50%"
                      }}></div>
                      <span>En proceso: <strong>{estadisticas.enProceso}</strong></span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#64748B"
                    }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        background: "#EF4444",
                        borderRadius: "50%"
                      }}></div>
                      <span>Cancelados: <strong>{estadisticas.cancelados}</strong></span>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  textAlign: "right"
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: "600",
                    marginBottom: "4px"
                  }}>
                    TOTAL EN VENTAS CONFIRMADAS
                  </div>
                  <div style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#10B981",
                    background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    ${estadisticas.totalVentas.toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        /* Estilos para el scroll */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Responsive */
        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          h1 {
            font-size: 36px !important;
          }
        }
        
        @media (max-width: 768px) {
          .main-container {
            padding: 20px 16px !important;
          }
          
          h1 {
            font-size: 32px !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .table-header {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: flex-start !important;
          }
          
          .table-footer {
            flex-direction: column !important;
            gap: 16px !important;
            text-align: center !important;
          }
          
          .status-indicators {
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-section {
            padding: 30px 20px !important;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          background-color: #f8f9fa;
        }
        
        button, input, select {
          font-family: 'Inter', sans-serif;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
        }
        
        p, span, div {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}