import { useState, useEffect } from "react";
import Footer from "../../components/Footer.jsx";

export default function DashboardVendedor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    ingresosTotales: 0,
    pedidos: 0,
    productosDisponibles: 0
  });
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const API_BASE_URL = "http://localhost:8080";

  useEffect(() => {
    // Verificar autenticación
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!userData || !token || userData.rol !== "VENDEDOR") {
      window.location.href = "/loginmodal";
      return;
    }

    setUser(userData);
    // 🔥 CORRECCIÓN: usar idVendedor en lugar de id
    cargarDatos(token, userData.idVendedor);
  }, []);

  const cargarDatos = async (token, vendedorId) => {
    setLoading(true);
    setError(null);

    try {
      // Cargar estadísticas del vendedor
      const statsResponse = await fetch(`${API_BASE_URL}/vendedor/${vendedorId}/estadisticas`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          ingresosTotales: statsData.ingresosTotales || 0,
          pedidos: statsData.totalPedidos || 0,
          productosDisponibles: statsData.productosDisponibles || 0
        });
      } else {
        console.warn("No se pudieron cargar las estadísticas");
      }

      // Cargar pedidos recientes del vendedor
      const pedidosResponse = await fetch(`${API_BASE_URL}/vendedor/${vendedorId}/pedidos/recientes`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (pedidosResponse.ok) {
        const pedidosData = await pedidosResponse.json();
        console.log("Datos de pedidos recibidos:", pedidosData); // DEBUG
        
        // 🔥 CORRECCIÓN: Mejor manejo de datos
        const pedidosFormateados = pedidosData.map((pedido, index) => ({
          id: pedido.idPedido || pedido.id || index,
          numero: pedido.numeroPedido || pedido.numero || `PED-${index + 1}`,
          cliente: pedido.clienteNombre || 
                   `${pedido.cliente?.nombre || ''} ${pedido.cliente?.apellido || ''}`.trim() || 
                   "Cliente sin nombre",
          estado: pedido.estadoPedido || pedido.estado || "Pendiente",
          total: pedido.totalPedido || pedido.total || pedido.montoTotal || 0,
          fecha: pedido.fechaPedido || pedido.fecha || new Date().toISOString()
        }));
        setPedidosRecientes(pedidosFormateados);
      } else {
        console.warn("No se pudieron cargar los pedidos recientes");
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px"
      }}>
        
        {/* Header Mejorado */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
            borderRadius: "50%",
            opacity: "0.5",
            zIndex: "0"
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
            borderRadius: "50%",
            opacity: "0.1",
            zIndex: "0"
          }}></div>

          <div style={{ position: "relative", zIndex: "1" }}>
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
            }}>
              📊
            </div>
            <h1 style={{ 
              fontSize: "42px", 
              fontWeight: "800", 
              color: "#2D3E2B",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
              lineHeight: "1.2"
            }}>
              Tablero Analítico
            </h1>
            <p style={{ 
              color: "#6B7F69", 
              fontSize: "16px",
              margin: 0,
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              Gestiona tus ventas, productos y pedidos en un solo lugar
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#FFF0F2",
            border: "2px solid #DA3E52",
            borderRadius: "12px",
            padding: "16px 24px",
            marginBottom: "30px",
            color: "#DA3E52",
            fontWeight: "600",
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "80px 20px",
            color: "#6B7F69"
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
            <p style={{ marginTop: "20px", fontSize: "16px", fontWeight: "600" }}>
              Cargando datos...
            </p>
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "40px"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #F9D94A 0%, #F5C542 100%)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 8px 24px rgba(249, 217, 74, 0.3)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(249, 217, 74, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(249, 217, 74, 0.3)";
              }}>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#2D3E2B", marginBottom: "12px" }}>
                  💰 Ingresos Totales
                </div>
                <div style={{ fontSize: "40px", fontWeight: "800", color: "#2D3E2B" }}>
                  ${stats.ingresosTotales.toFixed(2)}
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #6B8E6E 0%, #5A7D5D 100%)",
                borderRadius: "20px",
                padding: "32px",
                color: "white",
                boxShadow: "0 8px 24px rgba(107, 142, 110, 0.3)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(107, 142, 110, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(107, 142, 110, 0.3)";
              }}>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", opacity: "0.95" }}>
                  📦 Pedidos
                </div>
                <div style={{ fontSize: "40px", fontWeight: "800" }}>
                  {stats.pedidos}
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #5F8A7D 0%, #4F7A6D 100%)",
                borderRadius: "20px",
                padding: "32px",
                color: "white",
                boxShadow: "0 8px 24px rgba(95, 138, 125, 0.3)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(95, 138, 125, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(95, 138, 125, 0.3)";
              }}>
                <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", opacity: "0.95" }}>
                  🛒 Productos Disponibles
                </div>
                <div style={{ fontSize: "40px", fontWeight: "800" }}>
                  {stats.productosDisponibles}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              marginBottom: "40px"
            }}>
              {[
                { text: "➕ Agregar Producto", color: "#8FAC96", url: "/vendedor/agregar-producto" },
                { text: "📦 Gestionar Productos", color: "#7A9C86", url: "/vendedor/gestionar-productos" },
                { text: "📋 Gestionar Pedidos", color: "#6B8E6E", url: "/vendedor/pedidos" },
                { text: "📊 Análisis de Ventas", color: "#90AA99", url: "/vendedor/analisis" },
                { text: "⭐ Reseñas", color: "#A0B8A8", url: "/vendedor/resenas" }
              ].map((btn, idx) => (
                <button
                  key={`btn-${idx}`}
                  onClick={() => window.location.href = btn.url}
                  style={{
                    background: btn.color,
                    color: "white",
                    border: "none",
                    borderRadius: "14px",
                    padding: "18px 24px",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  {btn.text}
                </button>
              ))}
            </div>

            {/* Contenido Principal */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
              gap: "30px"
            }}>
              {/* Pedidos Recientes - ✅ CORREGIDO DEFINITIVAMENTE */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
              }}>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "24px"
                }}>
                  📋 Pedidos Recientes
                </h2>
                
                {pedidosRecientes.length > 0 ? (
                  <div>
                    {pedidosRecientes.map((pedido, index) => {
                      // 🔥 SOLUCIÓN: Generar key única siempre
                      const uniqueKey = `pedido-${pedido.id}-${pedido.numero}-${index}-${Date.now()}`;
                      
                      return (
                        <div 
                          key={uniqueKey} // ✅ KEY ÚNICA GARANTIZADA
                          style={{
                            background: "#FAFCF8",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "all 0.3s ease",
                            borderLeft: "4px solid transparent"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(5px)";
                            e.currentTarget.style.borderLeftColor = "#6B8E6E";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.borderLeftColor = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "700", color: "#2D3E2B", fontSize: "16px" }}>
                              #{pedido.numero}
                            </div>
                            <div style={{ color: "#6B7F69", fontSize: "13px", marginTop: "4px" }}>
                              {pedido.cliente}
                            </div>
                            <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "2px" }}>
                              {new Date(pedido.fecha).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <span style={{
                              background: pedido.estado.toLowerCase() === "enviado" ? "#C2DBC2" : 
                                        pedido.estado.toLowerCase() === "completado" ? "#D4EDDA" : 
                                        pedido.estado.toLowerCase() === "cancelado" ? "#F8D7DA" : "#FFF3E0",
                              color: pedido.estado.toLowerCase() === "enviado" ? "#2D5A2D" : 
                                    pedido.estado.toLowerCase() === "completado" ? "#155724" : 
                                    pedido.estado.toLowerCase() === "cancelado" ? "#721C24" : "#F5C744",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "700"
                            }}>
                              {pedido.estado}
                            </span>
                            <span style={{ fontWeight: "800", fontSize: "18px", color: "#2D3E2B" }}>
                              ${pedido.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "#6B7F69" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
                    <p style={{ fontWeight: "600" }}>No hay pedidos recientes</p>
                  </div>
                )}
              </div>

              {/* Analítica */}
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
              }}>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "24px"
                }}>
                  📈 Analítica
                </h2>
                <div style={{
                  background: "linear-gradient(135deg, #E8F5EA 0%, #D2E8D5 100%)",
                  height: "300px",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px"
                }}>
                  <div style={{ fontSize: "64px", opacity: "0.7" }}>📊</div>
                  <span style={{ fontSize: "16px", fontWeight: "600", color: "#4A6050" }}>
                    Gráficos de ventas y estadísticas
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}