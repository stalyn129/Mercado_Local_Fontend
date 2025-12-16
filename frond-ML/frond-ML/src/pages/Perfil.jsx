import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfil } from "../services/perfilService";
import Footer from "../components/Footer";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/LoginModal");
      return;
    }

    obtenerPerfil()
      .then(setPerfil)
      .catch(() => navigate("/LoginModal"))
      .finally(() => setLoading(false));
  }, [navigate]);

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
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (!perfil) return null;

  const InfoItem = ({ label, value }) => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 0",
      borderBottom: "1px solid #ECF2E3"
    }}>
      <span style={{
        color: "#6B7F69",
        fontSize: "14px",
        fontWeight: "500"
      }}>
        {label}
      </span>
      <span style={{
        color: "#2D3E2B",
        fontSize: "14px",
        fontWeight: "700",
        textAlign: "right"
      }}>
        {value || "N/A"}
      </span>
    </div>
  );

  const ActionButton = ({ children, onClick, variant = "primary", icon }) => {
    const isPrimary = variant === "primary";
    const isGoogle = variant === "google";
    
    return (
      <button
        onClick={onClick}
        style={{
          padding: "12px 20px",
          background: isGoogle 
            ? "white" 
            : isPrimary 
              ? "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)" 
              : "#ECF2E3",
          color: isGoogle ? "#2D3E2B" : isPrimary ? "white" : "#5A8F48",
          border: isGoogle ? "2px solid #E0E0E0" : "none",
          borderRadius: "12px",
          fontWeight: "700",
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "center",
          boxShadow: isPrimary 
            ? "0 4px 12px rgba(90, 143, 72, 0.25)" 
            : isGoogle
              ? "0 2px 8px rgba(0, 0, 0, 0.08)"
              : "none"
        }}
        onMouseEnter={(e) => {
          if (isGoogle) {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
            e.currentTarget.style.transform = "translateY(-2px)";
          } else {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = isPrimary 
              ? "0 6px 16px rgba(90, 143, 72, 0.35)" 
              : "0 2px 8px rgba(90, 143, 72, 0.2)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isPrimary 
            ? "0 4px 12px rgba(90, 143, 72, 0.25)" 
            : isGoogle 
              ? "0 2px 8px rgba(0, 0, 0, 0.08)"
              : "none";
        }}
      >
        {icon && <span style={{ fontSize: "18px" }}>{icon}</span>}
        {children}
      </button>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      <div style={{
        background: "white",
        borderRadius: "0 0 40px 40px",
        padding: "60px 32px",
        marginBottom: "40px",
        boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
        position: "relative",
        overflow: "hidden"
      }}>
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
          background: "linear-gradient(135deg, rgba(236, 242, 227, 0.8) 0%, rgba(221, 232, 208, 0.5) 100%)",
          borderRadius: "50%",
          filter: "blur(25px)",
          zIndex: "0",
          animation: "float4 9s ease-in-out infinite"
        }}></div>

        <div style={{
          position: "relative",
          zIndex: "1",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            textAlign: "center"
          }}>
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
              border: "4px solid rgba(90, 143, 72, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 8px 24px rgba(90, 143, 72, 0.2)"
            }}>
              {perfil.nombre?.charAt(0)}{perfil.apellido?.charAt(0)}
            </div>

            <div style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "12px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#9AAA98",
              fontWeight: "500",
              marginTop: "8px"
            }}>
              Información del usuario
            </div>

            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "48px",
                fontWeight: "700",
                color: "#2D3E2B",
                margin: "0 0 12px 0",
                letterSpacing: "1px",
                lineHeight: "1.2"
              }}>
                {perfil.nombre} {perfil.apellido}
              </h1>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  background: "#4ADE80",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "pulse 2s ease-in-out infinite"
                }}></span>
                <span style={{
                  color: "#6B7F69",
                  fontSize: "15px",
                  fontWeight: "500"
                }}>
                  {perfil.estado}
                </span>
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center"
            }}>
              <span style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                color: "#5A8F48",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid rgba(90, 143, 72, 0.15)"
              }}>
                {perfil.rol === "CONSUMIDOR" && "🛒"}
                {perfil.rol === "VENDEDOR" && "🏪"}
                {perfil.rol === "ADMIN" && "🛡️"}
                {perfil.rol}
              </span>
              
              {perfil.esAdministrador && (
                <span style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #FFE5E9 0%, #FFD0D9 100%)",
                  color: "#DA3E52",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "1px solid rgba(218, 62, 82, 0.15)"
                }}>
                  ⚙️ Permisos Admin
                </span>
              )}
              
              <span style={{
                padding: "10px 24px",
                background: "rgba(249, 251, 247, 0.8)",
                color: "#6B7F69",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                border: "1px solid rgba(90, 143, 72, 0.1)"
              }}>
                📅 Miembro desde {perfil.fechaRegistro?.split("T")[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px 60px 20px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)"
        }}>
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "14px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#9AAA98",
            marginBottom: "4px",
            fontWeight: "500"
          }}>
            Acciones disponibles
          </div>
          
          <h3 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: "28px",
            fontWeight: "700",
            color: "#2D3E2B",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ fontSize: "32px" }}>⚡</span>
            Acciones Rápidas
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px"
          }}>
            {perfil.rol === "CONSUMIDOR" && (
              <>
                <ActionButton onClick={() => navigate("/editar-perfil")} icon="✏️">
                  Editar perfil
                </ActionButton>
                <ActionButton onClick={() => navigate("/favoritos")} variant="secondary" icon="❤️">
                  Ver favoritos
                </ActionButton>
                <ActionButton onClick={() => navigate("/pedido")} variant="secondary" icon="📦">
                  Mis pedidos
                </ActionButton>
              </>
            )}
            
            {perfil.rol === "VENDEDOR" && (
              <>
                <ActionButton onClick={() => navigate("/editar-empresa")} icon="✏️">
                  Editar empresa
                </ActionButton>
                <ActionButton onClick={() => navigate("/vendedor/pedidos")} variant="secondary" icon="📊">
                  Gestionar pedidos
                </ActionButton>
                <ActionButton onClick={() => navigate("/vendedor/resenas")} variant="secondary" icon="⭐">
                  Ver reseñas
                </ActionButton>
              </>
            )}
            
            {perfil.rol === "ADMIN" && (
              <>
                <ActionButton onClick={() => navigate("/admin")} icon="⚙️">
                  Panel Admin
                </ActionButton>
                <ActionButton onClick={() => navigate("/usuarios")} variant="secondary" icon="👥">
                  Gestionar usuarios
                </ActionButton>
              </>
            )}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: perfil.rol === "VENDEDOR" ? "1fr" : "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(90, 143, 72, 0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.12)";
          }}>
            <div style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#9AAA98",
              marginBottom: "8px",
              fontWeight: "500"
            }}>
              Información personal
            </div>
            
            <h3 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "24px",
              fontWeight: "700",
              color: "#2D3E2B",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "28px" }}>📄</span>
              Datos Personales
            </h3>
            
            <div>
              <InfoItem label="Correo electrónico" value={perfil.correo} />
              <InfoItem label="Fecha de nacimiento" value={perfil.fechaNacimiento} />
              <InfoItem label="Fecha de registro" value={perfil.fechaRegistro?.split("T")[0]} />
            </div>

            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #ECF2E3" }}>
              <ActionButton 
                onClick={() => {
                  console.log("Vincular con Google");
                }} 
                variant="google"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Vincular cuenta de Google
              </ActionButton>
            </div>
          </div>

          {perfil.rol === "CONSUMIDOR" && (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(90, 143, 72, 0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.12)";
            }}>
              <div style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "12px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#9AAA98",
                marginBottom: "8px",
                fontWeight: "500"
              }}>
                Perfil de comprador
              </div>
              
              <h3 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "28px" }}>🛒</span>
                Datos de Consumidor
              </h3>
              
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
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(90, 143, 72, 0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.12)";
            }}>
              <div style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "12px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#9AAA98",
                marginBottom: "8px",
                fontWeight: "500"
              }}>
                Información comercial
              </div>
              
              <h3 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "28px" }}>🏪</span>
                Datos de la Empresa
              </h3>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "0 40px"
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
              
              <div style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "2px solid #ECF2E3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px"
              }}>
                <span style={{ fontSize: "32px" }}>⭐</span>
                <div>
                  <p style={{
                    fontSize: "14px",
                    color: "#9AAA98",
                    margin: "0 0 4px 0",
                    fontWeight: "500",
                    letterSpacing: "1px",
                    textTransform: "uppercase"
                  }}>
                    Calificación promedio
                  </p>
                  <p style={{
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#5A8F48",
                    margin: "0"
                  }}>
                    {perfil.calificacionPromedio ?? "Sin calificación"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {perfil.rol === "ADMIN" && (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(90, 143, 72, 0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(90, 143, 72, 0.12)";
            }}>
              <div style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "12px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#9AAA98",
                marginBottom: "8px",
                fontWeight: "500"
              }}>
                Permisos especiales
              </div>
              
              <h3 style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2D3E2B",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "28px" }}>🛡️</span>
                Administrador
              </h3>
              
              <p style={{
                color: "#6B7F69",
                fontSize: "15px",
                lineHeight: "1.7",
                margin: "0"
              }}>
                Tienes permisos administrativos completos en MercadoLocal. Puedes gestionar usuarios, productos, vendedores y todas las configuraciones del sistema.
              </p>
            </div>
          )}
        </div>

        <div style={{
          marginTop: "32px",
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.08)"
        }}>
          <p style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#5A8F48",
            margin: "0 0 8px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "24px" }}>🌱</span>
            Gracias por ser parte de MercadoLocal
          </p>
          <p style={{
            fontSize: "14px",
            color: "#9AAA98",
            margin: "0"
          }}>
            Juntos apoyamos el comercio local y sostenible
          </p>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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