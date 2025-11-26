import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function GestionarPedidos() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

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
      setPedidos(data);
    } catch (err) {
      console.error("❌ Error cargando pedidos:", err);
    } finally {
      setCargando(false);
    }
  };

  const obtenerColorEstado = (estado) => {
    const estados = {
      "Entregado": { bg: "#E8F5E3", color: "#5A8F48" },
      "Cancelado": { bg: "#FFE8EC", color: "#DA3E52" },
      "Pendiente": { bg: "#FFF9E6", color: "#F5C744" },
      "En Proceso": { bg: "#E3F2FD", color: "#2196F3" }
    };
    return estados[estado] || { bg: "#F0F4ED", color: "#6B7F69" };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      {/* Contenedor Principal */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 20px",
        paddingBottom: "80px"
      }}>

        {/* Header Section Mejorado */}
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
          {/* Decoración de fondo */}
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
            {/* Icono decorativo */}
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
            }}>
              🧾
            </div>

            {/* Título principal */}
            <h1 style={{
              fontSize: "42px",
              fontWeight: "800",
              color: "#2D3E2B",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
              lineHeight: "1.2"
            }}>
              Gestión de Pedidos
            </h1>

            {/* Subtítulo */}
            <p style={{
              color: "#6B7F69",
              fontSize: "16px",
              margin: "0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6"
            }}>
              Administra y supervisa todos los pedidos de tus clientes
            </p>
          </div>
        </div>

        {/* Tabla de Pedidos */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px"
            }}>
              <thead>
                <tr style={{
                  background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                  fontWeight: "700",
                  color: "#2D3E2B"
                }}>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>N° Pedido</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Cliente</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fecha</th>
                  <th style={{ padding: "20px 16px", textAlign: "left", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estado</th>
                  <th style={{ padding: "20px 16px", textAlign: "center", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="6" style={{
                      textAlign: "center",
                      padding: "80px 20px",
                      color: "#6B7F69",
                      fontSize: "15px"
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
                      <p style={{ marginTop: "20px", marginBottom: 0, fontWeight: "600" }}>Cargando pedidos...</p>
                    </td>
                  </tr>
                ) : pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{
                      textAlign: "center",
                      padding: "80px 20px"
                    }}>
                      <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
                      <p style={{
                        color: "#2D3E2B",
                        fontSize: "18px",
                        fontWeight: "600",
                        margin: 0
                      }}>
                        No hay pedidos registrados
                      </p>
                      <p style={{
                        color: "#9AAA98",
                        fontSize: "15px",
                        marginTop: "8px"
                      }}>
                        Los pedidos de tus clientes aparecerán aquí
                      </p>
                    </td>
                  </tr>
                ) : (
                  pedidos.map((p) => (
                    <tr key={p.idPedido} style={{
                      borderBottom: "1px solid #F0F4ED",
                      transition: "background 0.2s ease"
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#FAFCF8"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                    >
                      {/* N° Pedido */}
                      <td style={{
                        padding: "16px",
                        fontWeight: "700",
                        color: "#5A8F48",
                        fontSize: "15px"
                      }}>
                        #{p.idPedido}
                      </td>

                      {/* Cliente */}
                      <td style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#2D3E2B",
                        fontSize: "14px"
                      }}>
                        {p.nombreCliente}
                      </td>

                      {/* Total */}
                      <td style={{
                        padding: "16px",
                        fontWeight: "700",
                        color: "#5A8F48",
                        fontSize: "16px"
                      }}>
                        ${p.total}
                      </td>

                      {/* Fecha */}
                      <td style={{
                        padding: "16px",
                        color: "#6B7F69",
                        fontSize: "14px",
                        fontWeight: "500"
                      }}>
                        {p.fecha}
                      </td>

                      {/* Estado */}
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          background: obtenerColorEstado(p.estado).bg,
                          color: obtenerColorEstado(p.estado).color,
                          padding: "8px 16px",
                          borderRadius: "24px",
                          fontSize: "13px",
                          fontWeight: "700",
                          display: "inline-block"
                        }}>
                          {p.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{
                        padding: "16px",
                        textAlign: "center"
                      }}>
                        <button
                          onClick={() => window.location.href = `/vendedor/pedido/${p.idPedido}`}
                          style={{
                            background: "#E3F2FD",
                            color: "#2196F3",
                            border: "2px solid #2196F3",
                            padding: "10px 20px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "13px",
                            transition: "all 0.3s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#2196F3";
                            e.target.style.color = "white";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#E3F2FD";
                            e.target.style.color = "#2196F3";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          🔍 Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          {pedidos.length > 0 && (
            <div style={{
              padding: "24px 28px",
              background: "#FAFCF8",
              borderTop: "2px solid #ECF2E3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              color: "#6B7F69",
              fontWeight: "500"
            }}>
              <span>
                Mostrando <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{pedidos.length}</strong> pedidos
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#5A8F48" }}>
                📊 Total de pedidos
              </span>
            </div>
          )}
        </div>
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