import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Componente Navbar
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Función para obtener el usuario desde localStorage
  const getUsuario = () => {
    try {
      const userData = localStorage.getItem("usuario");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  };

  const user = getUsuario();

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setIsMenuOpen(false);
    navigate("/");
  };

  const styles = {
    navbar: {
      background: "rgba(255, 255, 255, 0.5)",
      backdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(229, 229, 229, 0.2)",
      padding: "0.6rem 4rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: "0",
      zIndex: "1000",
      fontFamily: "'Comfortaa', sans-serif",
      gap: "2rem",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
      maxWidth: "100%",
      width: "100%",
      boxSizing: "border-box",
      height: "70px",
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: "3rem",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      cursor: "pointer",
      transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      padding: "0",
    },
    logoImage: {
      height: "50px",
      width: "auto",
      objectFit: "contain",
      transition: "transform 0.3s ease",
    },
    navLinks: {
      display: "flex",
      gap: "2.5rem",
      listStyle: "none",
      margin: "0",
      padding: "0",
      alignItems: "center",
    },
    navLink: {
      textDecoration: "none",
      color: "#666",
      fontSize: "0.9rem",
      fontWeight: "600",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      display: "inline-block",
      padding: "0.4rem 0",
      cursor: "pointer",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
    },
    iconButton: {
      background: "none",
      border: "none",
      fontSize: "1.3rem",
      cursor: "pointer",
      padding: "0.5rem",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
    },
    loginBtn: {
      textDecoration: "none",
      color: "#3a5a40",
      fontSize: "0.9rem",
      fontWeight: "700",
      padding: "0.6rem 1.5rem",
      border: "1.5px solid #3a5a40",
      borderRadius: "6px",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      display: "inline-block",
      cursor: "pointer",
      background: "transparent",
    },
    userTag: {
      color: "#3a5a40",
      fontSize: "0.9rem",
      fontWeight: "600",
      padding: "0.5rem 1rem",
      background: "rgba(244, 232, 193, 0.3)",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      whiteSpace: "nowrap",
    },
    logoutBtn: {
      color: "#d32f2f",
      fontSize: "0.85rem",
      fontWeight: "600",
      padding: "0.5rem 1rem",
      border: "1.5px solid #d32f2f",
      borderRadius: "6px",
      background: "transparent",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    },
    hamburger: {
      display: "none",
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      padding: "0.5rem",
      color: "#333",
      transition: "all 0.3s ease",
    },
    mobileMenu: {
      position: "absolute",
      top: "100%",
      left: "0",
      right: "0",
      background: "rgba(255, 255, 255, 0.5)",
      backdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(229, 229, 229, 0.2)",
      padding: "1.5rem 2rem",
      display: isMenuOpen ? "flex" : "none",
      flexDirection: "column",
      gap: "1rem",
      zIndex: "999",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    },
  };

  const keyframes = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

    @media (max-width: 1024px) {
      .nav-links {
        gap: 1.8rem !important;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.5rem 1.5rem !important;
        gap: 1rem !important;
      }

      .left-section {
        gap: 1rem !important;
      }

      .nav-links {
        display: none !important;
      }

      .logo-image {
        height: 70px !important;
      }

      .hamburger {
        display: flex !important;
      }

      .right-section {
        gap: 0.8rem !important;
      }

      .login-btn {
        padding: 0.5rem 1rem !important;
        font-size: 0.8rem !important;
      }

      .user-tag {
        display: none !important;
      }

      .logout-btn {
        font-size: 0.75rem !important;
        padding: 0.4rem 0.8rem !important;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        padding: 0.5rem 1rem !important;
      }

      .logo-image {
        height: 55px !important;
      }

      .icon-button {
        font-size: 1rem !important;
      }

      .login-btn, .logout-btn {
        display: none !important;
      }
    }
  `;

  const handleLogoHover = (e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  };

  const handleLogoLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/loginmodal");
    setIsMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <style>{keyframes}</style>

      <nav style={styles.navbar} className="navbar">
        <div style={styles.leftSection} className="left-section">
          <a
            href="/"
            style={styles.logo}
            className="logo"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-ZdqQwZy7zh5KfT32FjRlSaTpsHX04y.png"
              alt="Mercado Local IA"
              style={styles.logoImage}
              className="logo-image"
            />
          </a>

          <ul style={styles.navLinks} className="nav-links">
            <li>
              <a
                href="/"
                style={styles.navLink}
                className="nav-link"
                onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
                onMouseLeave={(e) => (e.target.style.color = "#666")}
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href="/explorar"
                style={styles.navLink}
                className="nav-link"
                onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
                onMouseLeave={(e) => (e.target.style.color = "#666")}
              >
                Explorar
              </a>
            </li>

            {/* Links dinámicos según rol */}
            {user && user.rol === "Vendedor" && (
              <li>
                <a
                  onClick={() => handleNavigate("/vendedor")}
                  style={styles.navLink}
                  className="nav-link"
                  onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
                  onMouseLeave={(e) => (e.target.style.color = "#666")}
                >
                  Dashboard
                </a>
              </li>
            )}

            {user && user.rol === "Administrador" && (
              <li>
                <a
                  onClick={() => handleNavigate("/admin")}
                  style={styles.navLink}
                  className="nav-link"
                  onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
                  onMouseLeave={(e) => (e.target.style.color = "#666")}
                >
                  Gestión
                </a>
              </li>
            )}
          </ul>
        </div>

        <div style={styles.rightSection} className="right-section">
          {/* Mostrar iconos solo si hay usuario (cualquier rol) */}
          {user && (
            <>
              <button
                style={styles.iconButton}
                className="icon-button"
                title="Favoritos"
                aria-label="Favoritos"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#3a5a40";
                  e.currentTarget.style.transform = "scale(1.2)";
                  e.currentTarget.style.background = "rgba(244, 232, 193, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#333";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "none";
                }}
              >
                ♡
              </button>

              <button
                style={styles.iconButton}
                className="icon-button"
                title="Carrito"
                aria-label="Carrito"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#3a5a40";
                  e.currentTarget.style.transform = "scale(1.2)";
                  e.currentTarget.style.background = "rgba(244, 232, 193, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#333";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "none";
                }}
              >
                🛒
              </button>
            </>
          )}

          {/* Mostrar botón de login o info de usuario */}
          {!user ? (
            <button
              onClick={handleLoginClick}
              style={styles.loginBtn}
              className="login-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3a5a40";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(58, 90, 64, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#3a5a40";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Iniciar Sesión
            </button>
          ) : (
            <>
              <div style={styles.userTag} className="user-tag">
                👤 {user.nombre} {user.apellido}
              </div>
              <button
                onClick={handleCerrarSesion}
                style={styles.logoutBtn}
                className="logout-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#d32f2f";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(211, 47, 47, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#d32f2f";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Cerrar Sesión
              </button>
            </>
          )}

          <button
            style={styles.hamburger}
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#3a5a40";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#333";
            }}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          <a
            href="/"
            style={styles.navLink}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
            onMouseLeave={(e) => (e.target.style.color = "#666")}
          >
            Inicio
          </a>
          <a
            href="/explorar"
            style={styles.navLink}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
            onMouseLeave={(e) => (e.target.style.color = "#666")}
          >
            Explorar
          </a>

          {/* Links móviles según rol */}
          {user && user.rol === "Vendedor" && (
            <a
              onClick={() => handleNavigate("/vendedor")}
              style={styles.navLink}
              onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
              onMouseLeave={(e) => (e.target.style.color = "#666")}
            >
              Dashboard
            </a>
          )}

          {user && user.rol === "Administrador" && (
            <a
              onClick={() => handleNavigate("/admin")}
              style={styles.navLink}
              onMouseEnter={(e) => (e.target.style.color = "#3a5a40")}
              onMouseLeave={(e) => (e.target.style.color = "#666")}
            >
              Gestión
            </a>
          )}

          {!user ? (
            <button
              onClick={handleLoginClick}
              style={{ ...styles.loginBtn, textAlign: "center", marginTop: "0.5rem" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3a5a40";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#3a5a40";
              }}
            >
              Iniciar Sesión
            </button>
          ) : (
            <>
              <div style={{ ...styles.userTag, justifyContent: "center", marginTop: "0.5rem" }}>
                👤 {user.nombre} {user.apellido}
              </div>
              <button
                onClick={handleCerrarSesion}
                style={{ ...styles.logoutBtn, textAlign: "center", width: "100%" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#d32f2f";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#d32f2f";
                }}
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}