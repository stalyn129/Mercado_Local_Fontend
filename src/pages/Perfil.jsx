import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfil } from "../services/perfilService";
import Footer from "../components/Footer";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [circlePositions, setCirclePositions] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    totalVentas: 0,
    calificacionPromedio: 0
  });
  const navigate = useNavigate();

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
          size: Math.random() * 100 + 50,
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
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/LoginModal");
      return;
    }

    obtenerPerfil()
      .then(data => {
        setPerfil(data);
        // Si es vendedor, cargar estadísticas adicionales
        if (data.rol === "VENDEDOR") {
          cargarEstadisticasVendedor(data.idVendedor || data._id, token);
        }
      })
      .catch(() => navigate("/LoginModal"))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Función para cargar estadísticas del vendedor
  const cargarEstadisticasVendedor = async (idVendedor, token) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
      
      // 1. Cargar productos del vendedor
      const productosRes = await fetch(`${API_URL}/productos/vendedor/${idVendedor}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const productos = await productosRes.json();
      
      // 2. Cargar pedidos del vendedor
      const pedidosRes = await fetch(`${API_URL}/pedidos/vendedor/${idVendedor}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const pedidos = await pedidosRes.json();
      
      // Calcular estadísticas
      const pedidosPagados = pedidos.filter(p => p.estadoPago === "PAGADO");
      const totalVentas = pedidosPagados.reduce((sum, p) => sum + (p.total || 0), 0);
      
      setEstadisticas({
        totalProductos: productos.length || 0,
        totalPedidos: pedidos.length || 0,
        totalVentas: totalVentas || 0,
        calificacionPromedio: perfil?.calificacionPromedio || 0
      });
      
    } catch (error) {
      console.error("Error cargando estadísticas del vendedor:", error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            width: "60px",
            height: "60px",
            border: "5px solid #f1f5f9",
            borderTop: "5px solid #FF6B35",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{
            marginTop: "25px",
            fontSize: "18px",
            color: "#2C3E50",
            fontWeight: "600",
            fontFamily: "'Inter', sans-serif"
          }}>
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (!perfil) return null;

  // Determinar si el perfil está activo
  const estaActivo = perfil.estado === "activo" || perfil.estado === "Activo" || perfil.activo === true;

  const InfoItem = ({ label, value }) => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 0",
      borderBottom: "1px solid #f1f5f9",
      transition: "all 0.3s ease"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#f8f9fa";
      e.currentTarget.style.paddingLeft = "10px";
      e.currentTarget.style.paddingRight = "10px";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.paddingLeft = "0";
      e.currentTarget.style.paddingRight = "0";
    }}>
      <span style={{
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "600",
        fontFamily: "'Inter', sans-serif"
      }}>
        {label}
      </span>
      <span style={{
        color: "#2C3E50",
        fontSize: "14px",
        fontWeight: "700",
        textAlign: "right",
        fontFamily: "'Inter', sans-serif"
      }}>
        {value || "N/A"}
      </span>
    </div>
  );

  const ActionButton = ({ children, onClick, variant = "primary", icon }) => {
    const isPrimary = variant === "primary";

    return (
      <button
        onClick={onClick}
        style={{
          padding: "14px 20px",
          background: isPrimary ? "#FF6B35" : "white",
          color: isPrimary ? "white" : "#FF6B35",
          border: isPrimary ? "none" : "2px solid #FF6B35",
          borderRadius: "12px",
          fontWeight: "700",
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "center",
          boxShadow: isPrimary ? "0 4px 12px rgba(255, 107, 53, 0.25)" : "none",
          fontFamily: "'Inter', sans-serif",
          minWidth: "180px"
        }}
        onMouseEnter={(e) => {
          if (isPrimary) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 107, 53, 0.35)";
            e.currentTarget.style.background = "#FF8E53";
          } else {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.2)";
            e.currentTarget.style.background = "rgba(255, 107, 53, 0.1)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isPrimary ? "0 4px 12px rgba(255, 107, 53, 0.25)" : "none";
          e.currentTarget.style.background = isPrimary ? "#FF6B35" : "white";
        }}
      >
        {icon && <span style={{ fontSize: "18px" }}>{icon}</span>}
        {children}
      </button>
    );
  };

  // NUEVA VERSIÓN MEJORADA DE STATCARD
  const StatCard = ({ title, value, icon, color, description }) => (
    <div style={{
      flex: "1",
      minWidth: "220px",
      padding: "28px 24px",
      borderRadius: "20px",
      background: `linear-gradient(145deg, ${color}08 0%, ${color}15 100%)`,
      border: `1.5px solid ${color}20`,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
      e.currentTarget.style.boxShadow = `0 15px 35px ${color}30, 0 5px 15px rgba(0, 0, 0, 0.1)`;
      e.currentTarget.style.borderColor = `${color}40`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.05)";
      e.currentTarget.style.borderColor = `${color}20`;
    }}>
      
      {/* Elemento decorativo en esquina */}
      <div style={{
        position: "absolute",
        top: "-25px",
        right: "-25px",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: `${color}08`,
        zIndex: "0"
      }} />
      
      {/* Icono con fondo circular */}
      <div style={{
        position: "relative",
        zIndex: "2",
        width: "64px",
        height: "64px",
        borderRadius: "18px",
        background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "20px",
        boxShadow: `0 8px 20px ${color}40`,
        transition: "all 0.3s ease"
      }}>
        <span style={{ 
          fontSize: "28px",
          color: "white",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
        }}>{icon}</span>
      </div>
      
      {/* Valor principal con efecto de gradiente */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "42px",
        fontWeight: "800",
        background: `linear-gradient(135deg, ${color} 0%, ${color}90 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: "8px",
        lineHeight: "1",
        textShadow: `0 2px 10px ${color}20`
      }}>
        {value}
      </div>
      
      {/* Título con mejor tipografía */}
      <div style={{
        fontSize: "13px",
        color: "#64748b",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        marginBottom: "6px",
        fontFamily: "'Inter', sans-serif"
      }}>
        {title}
      </div>
      
      {/* Descripción (opcional) */}
      {description && (
        <div style={{
          fontSize: "12px",
          color: "#94a3b8",
          fontWeight: "500",
          marginTop: "8px",
          fontFamily: "'Inter', sans-serif",
          lineHeight: "1.4"
        }}>
          {description}
        </div>
      )}
      
      {/* Línea decorativa en la parte inferior */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "24px",
        right: "24px",
        height: "3px",
        background: `linear-gradient(90deg, ${color} 0%, ${color}40 100%)`,
        borderRadius: "3px",
        opacity: "0.6",
        transition: "all 0.3s ease"
      }} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'Inter', sans-serif",
      overflowX: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
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
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(52, 211, 153, 0.3); }
          50% { box-shadow: 0 0 20px rgba(52, 211, 153, 0.5); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={{
        background: "white",
        borderRadius: "0 0 30px 30px",
        padding: "60px 32px 40px 32px",
        marginBottom: "40px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #f1f5f9"
      }}>
        
        {/* CÍRCULOS FLOTANTES */}
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

        <div style={{
          position: "relative",
          zIndex: "10",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            textAlign: "center"
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#FF6B35",
              marginBottom: "6px",
              fontWeight: "500"
            }}>
              Mi Perfil
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "56px",
              fontWeight: "800",
              color: "#FF6B35",
              margin: "0 0 16px 0",
              letterSpacing: "-1px",
              lineHeight: "1.1",
              textShadow: "0 2px 4px rgba(255, 107, 53, 0.1)"
            }}>👤 {perfil.nombre} {perfil.apellido}</h1>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "30px",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              {/* Estado del perfil */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: estaActivo 
                  ? "linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)" 
                  : "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)",
                padding: "12px 24px",
                borderRadius: "50px",
                border: estaActivo 
                  ? "2px solid rgba(52, 211, 153, 0.3)" 
                  : "2px solid rgba(239, 68, 68, 0.3)",
                boxShadow: estaActivo ? "0 4px 15px rgba(52, 211, 153, 0.2)" : "0 4px 15px rgba(239, 68, 68, 0.2)",
                position: "relative",
                overflow: "hidden",
                animation: estaActivo ? "glow 2s ease-in-out infinite" : "none"
              }}>
                <div style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  background: estaActivo 
                    ? "radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%)" 
                    : "radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)",
                  zIndex: "1"
                }} />
                
                <div style={{
                  position: "relative",
                  zIndex: "2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: estaActivo 
                    ? "radial-gradient(circle, #34D399 30%, #10B981 100%)" 
                    : "radial-gradient(circle, #EF4444 30%, #DC2626 100%)",
                  boxShadow: estaActivo 
                    ? "0 0 15px rgba(52, 211, 153, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)" 
                    : "0 0 15px rgba(239, 68, 68, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
                }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "white",
                    animation: "pulse 1.5s ease-in-out infinite",
                    boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
                  }} />
                </div>
                
                <div style={{
                  position: "relative",
                  zIndex: "2",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start"
                }}>
                  <span style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "1px",
                    textTransform: "uppercase"
                  }}>
                    Estado
                  </span>
                  <span style={{
                    fontSize: "16px",
                    color: estaActivo ? "#10B981" : "#DC2626",
                    fontWeight: "700",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    {estaActivo ? "🟢 Activo" : "🔴 Inactivo"}
                  </span>
                </div>
              </div>
              
              <div style={{
                width: "1px",
                height: "35px",
                background: "linear-gradient(to bottom, transparent, #FF6B35, transparent)",
                opacity: 0.3
              }} />
              
              {perfil.fechaRegistro && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)",
                  padding: "12px 24px",
                  borderRadius: "50px",
                  border: "2px solid rgba(255, 107, 53, 0.3)",
                  boxShadow: "0 4px 15px rgba(255, 107, 53, 0.2)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: "radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)",
                    zIndex: "1"
                  }} />
                  
                  <div style={{
                    position: "relative",
                    zIndex: "2",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF6B35, #FF8E53)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(255, 107, 53, 0.3)"
                  }}>
                    <span style={{ 
                      fontSize: "16px", 
                      color: "white",
                      fontWeight: "bold"
                    }}>📅</span>
                  </div>
                  
                  <div style={{
                    position: "relative",
                    zIndex: "2",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start"
                  }}>
                    <span style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "600",
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "1px",
                      textTransform: "uppercase"
                    }}>
                      Miembro desde
                    </span>
                    <span style={{
                      fontSize: "16px",
                      color: "#FF6B35",
                      fontWeight: "700",
                      fontFamily: "'Inter', sans-serif",
                      textShadow: "0 1px 2px rgba(255, 107, 53, 0.2)"
                    }}>
                      {perfil.fechaRegistro?.split("T")[0]}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <p style={{
              color: "#64748b",
              fontSize: "16px",
              margin: "14px auto 0 auto",
              maxWidth: "600px",
              lineHeight: "1.6",
              fontWeight: "400",
              fontFamily: "'Inter', sans-serif",
              opacity: 0.8,
              background: "rgba(255, 107, 53, 0.05)",
              padding: "14px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 107, 53, 0.1)"
            }}>
              {perfil.rol === "CONSUMIDOR" 
                ? "Administra tu cuenta y preferencias de compra" 
                : perfil.rol === "VENDEDOR"
                ? "Gestiona tu negocio y productos"
                : "Panel de administración del sistema"
              }
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px 40px 20px"
      }}>
        {/* 🔥 ACCIONES DISPONIBLES */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "28px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              background: "rgba(255, 107, 53, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "20px", color: "#FF6B35" }}>⚡</span>
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                fontWeight: "700",
                color: "#2C3E50",
                margin: "0 0 4px 0"
              }}>
                Acciones Disponibles
              </h2>
              <p style={{
                color: "#64748b",
                fontSize: "13px",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Gestiona tu cuenta
              </p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px"
          }}>
            {perfil.rol === "CONSUMIDOR" && (
              <>
                <ActionButton onClick={() => navigate("/consumidor/editar-perfil")} icon="✏️">
                  Editar perfil
                </ActionButton>
                <ActionButton onClick={() => navigate("/favoritos")} variant="secondary" icon="❤️">
                  Mis favoritos
                </ActionButton>
                <ActionButton
                  onClick={() => navigate("/mis-pedidos")}
                  variant="secondary"
                  icon="📦"
                >
                  Mis pedidos
                </ActionButton>
                <ActionButton
                  onClick={() => navigate("/carrito")}
                  variant="secondary"
                  icon="🛒"
                >
                  Mi carrito
                </ActionButton>
              </>
            )}

            {perfil.rol === "VENDEDOR" && (
              <>
                {/* SOLO LAS 4 OPCIONES QUE SOLICITASTE */}
                <ActionButton onClick={() => navigate("/vendedor/editar-perfil")} icon="✏️">
                  Editar perfil
                </ActionButton>
                <ActionButton onClick={() => navigate("/vendedor/pedidos")} variant="secondary" icon="📊">
                  Gestionar pedidos
                </ActionButton>
                <ActionButton onClick={() => navigate("/vendedor/resenas")} variant="secondary" icon="⭐">
                  Ver reseñas
                </ActionButton>
                <ActionButton onClick={() => navigate("/vendedor/gestionar-productos")} variant="secondary" icon="📦">
                  Mis productos
                </ActionButton>
              </>
            )}

            {perfil.rol === "ADMIN" && (
              <>
                <ActionButton onClick={() => navigate("/admin/dashboard")} icon="⚙️">
                  Panel Admin
                </ActionButton>
                <ActionButton onClick={() => navigate("/admin/usuarios")} variant="secondary" icon="👥">
                  Gestionar usuarios
                </ActionButton>
                <ActionButton onClick={() => navigate("/admin/reportes")} variant="secondary" icon="📈">
                  Reportes
                </ActionButton>
                <ActionButton onClick={() => navigate("/admin/configuracion")} variant="secondary" icon="⚡">
                  Configuración
                </ActionButton>
              </>
            )}
          </div>
        </div>

        {/* 🔥 ESTADÍSTICAS (Solo para VENDEDOR) - VERSIÓN MEJORADA */}
        {perfil.rol === "VENDEDOR" && (
          <div style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "32px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Efecto de fondo sutil */}
            <div style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              height: "4px",
              background: "linear-gradient(90deg, #FF6B35, #3498DB, #2ECC71, #9B59B6)",
              zIndex: "1"
            }} />
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
              position: "relative",
              zIndex: "2"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #3498DB 0%, #1D4ED8 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 6px 20px rgba(52, 152, 219, 0.3)"
              }}>
                <span style={{ 
                  fontSize: "24px", 
                  color: "white",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                }}>📊</span>
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#2C3E50",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.5px"
                }}>
                  Métricas de Desempeño
                </h2>
                <p style={{
                  color: "#64748b",
                  fontSize: "14px",
                  margin: "0",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Estadísticas en tiempo real de tu negocio
                </p>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
              position: "relative",
              zIndex: "2"
            }}>
              <StatCard 
                title="Productos Activos" 
                value={estadisticas.totalProductos || 0} 
                icon="📦" 
                color="#3498DB"
                description="En tu catálogo"
              />
              <StatCard 
                title="Pedidos Totales" 
                value={estadisticas.totalPedidos || 0} 
                icon="📋" 
                color="#2ECC71"
                description="Procesados"
              />
              <StatCard 
                title="Ventas Totales" 
                value={`$${estadisticas.totalVentas.toFixed(2) || 0}`} 
                icon="💰" 
                color="#9B59B6"
                description="Generadas"
              />
              <StatCard 
                title="Calificación" 
                value={`${(perfil.calificacionPromedio || estadisticas.calificacionPromedio || 0).toFixed(1)}/5.0`} 
                icon="⭐" 
                color="#FFD700"
                description="Promedio de clientes"
              />
            </div>
            
            {/* Información adicional */}
            <div style={{
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
              color: "#94a3b8",
              position: "relative",
              zIndex: "2"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#10B981" }}>🔄</span>
                <span>Actualizado en tiempo real</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#3B82F6" }}>📈</span>
                <span>Tendencia positiva</span>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 INFORMACIÓN PERSONAL */}
        <div style={{
          display: "grid",
          gridTemplateColumns: perfil.rol === "VENDEDOR" ? "1fr" : "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "28px",
          marginBottom: "28px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9",
            transition: "all 0.3s ease"
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
            }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "20px",
                background: "rgba(255, 107, 53, 0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "20px", color: "#FF6B35" }}>📄</span>
              </div>
              <div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#2C3E50",
                  margin: "0 0 4px 0"
                }}>
                  Información Personal
                </h3>
                <p style={{
                  color: "#64748b",
                  fontSize: "13px",
                  margin: "0",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Detalles de tu cuenta
                </p>
              </div>
            </div>

            <div>
              <InfoItem label="Correo electrónico" value={perfil.correo} />
              <InfoItem label="Fecha de nacimiento" value={perfil.fechaNacimiento} />
              <InfoItem label="Fecha de registro" value={perfil.fechaRegistro?.split("T")[0]} />
              <InfoItem label="Estado" value={perfil.estado} />
            </div>

            {/* Vinculación con Google - OPCIONAL */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "2px solid #f1f5f9" }}>
              <button
                onClick={() => {
                  console.log("Vincular con Google");
                }}
                style={{
                  padding: "14px 20px",
                  background: "white",
                  color: "#2C3E50",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  fontFamily: "'Inter', sans-serif",
                  minWidth: "180px",
                  width: "100%"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Vincular cuenta de Google
              </button>
            </div>
          </div>

          {/* INFORMACIÓN ESPECÍFICA POR ROL */}
          {perfil.rol === "CONSUMIDOR" && (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
              }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "20px",
                  background: "rgba(255, 107, 53, 0.1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: "20px", color: "#FF6B35" }}>🛒</span>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    margin: "0 0 4px 0"
                  }}>
                    Perfil de Consumidor
                  </h3>
                  <p style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Información de contacto
                  </p>
                </div>
              </div>

              <div>
                <InfoItem label="Dirección" value={perfil.direccionConsumidor} />
                <InfoItem label="Teléfono" value={perfil.telefonoConsumidor} />
                <InfoItem label="Cédula" value={perfil.cedulaConsumidor} />
              </div>
            </div>
          )}

          {perfil.rol === "VENDEDOR" && (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
              }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "20px",
                  background: "rgba(255, 107, 53, 0.1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: "20px", color: "#FF6B35" }}>🏪</span>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#2C3E50",
                    margin: "0 0 4px 0"
                  }}>
                    Información de la Empresa
                  </h3>
                  <p style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Datos comerciales
                  </p>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0 30px"
              }}>
                <div>
                  <InfoItem label="Nombre de la empresa" value={perfil.nombreEmpresa} />
                  <InfoItem label="RUC" value={perfil.rucEmpresa} />
                </div>
                <div>
                  <InfoItem label="Dirección" value={perfil.direccionEmpresa} />
                  <InfoItem label="Teléfono" value={perfil.telefonoEmpresa} />
                </div>
              </div>

              {/* Calificación promedio */}
              {perfil.calificacionPromedio !== undefined && (
                <div style={{
                  marginTop: "28px",
                  paddingTop: "20px",
                  borderTop: "2px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  justifyContent: "center"
                }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "28px",
                    background: "#FFF2E8",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "24px", color: "#FF6B35" }}>⭐</span>
                  </div>
                  <div>
                    <div style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "600",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Calificación promedio
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#FF6B35"
                    }}>
                      {(perfil.calificacionPromedio || 0).toFixed(1)}/5.0
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {perfil.rol === "ADMIN" && (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              border: "1px solid #f1f5f9",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
              }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px"
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "28px",
                  background: "#FFF2E8",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: "24px", color: "#FF6B35" }}>🛡️</span>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#2C3E50",
                    marginBottom: "4px"
                  }}>
                    Administrador
                  </h3>
                  <p style={{
                    color: "#64748b",
                    fontSize: "13px",
                    margin: "0",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Permisos Administrativos
                  </p>
                </div>
              </div>

              <p style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0",
                fontFamily: "'Inter', sans-serif"
              }}>
                Tienes permisos administrativos completos en MercadoLocal. Puedes gestionar usuarios, productos, vendedores y todas las configuraciones del sistema.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}