import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        
        if (userData && token) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const userTagElement = document.querySelector(".user-tag-btn");
      const dropdownElement = document.querySelector(".dropdown-menu");
      
      if (
        userTagElement &&
        !userTagElement.contains(event.target) &&
        dropdownElement &&
        !dropdownElement.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserMenu]);

  const handleCerrarSesion = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setIsMenuOpen(false);
    setShowUserMenu(false);
    navigate("/");
  };

  const getNavLinks = () => {
    const baseLinks = [{ label: "Inicio", href: "/" }];

    if (!user) {
      return [...baseLinks, { label: "Explorar", href: "/explorar" }];
    }

    if (user.rol === "VENDEDOR") {
      return [...baseLinks, { label: "Dashboard", href: "/vendedor" }];
    }

    if (user.rol === "CONSUMIDOR") {
      return [...baseLinks, { label: "Explorar", href: "/explorar" }];
    }

    if (user.rol === "ADMIN") {
      return [...baseLinks, { label: "Gestión", href: "/admin" }];
    }

    return baseLinks;
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setShowUserMenu(false);
  };

  const navLinks = getNavLinks();

  if (loading) {
    return null;
  }

  const styles = {
    navbar: {
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(244, 232, 193, 0.3) 100%)",
      backdropFilter: "blur(20px)",
      borderBottom: "2px solid rgba(58, 90, 64, 0.1)",
      padding: "0.8rem 4rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: "0",
      zIndex: "1000",
      fontFamily: "'Comfortaa', sans-serif",
      gap: "2rem",
      boxShadow: "0 8px 32px rgba(58, 90, 64, 0.08)",
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
      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      padding: "0",
    },
    logoImage: {
      height: "50px",
      width: "auto",
      objectFit: "contain",
      transition: "all 0.4s ease",
      filter: "drop-shadow(0 2px 4px rgba(58, 90, 64, 0.1))",
    },
    navLinks: {
      display: "flex",
      gap: "0.5rem",
      listStyle: "none",
      margin: "0",
      padding: "0",
      alignItems: "center",
    },
    navLink: {
      textDecoration: "none",
      color: "#3a5a40",
      fontSize: "0.95rem",
      fontWeight: "600",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      display: "inline-block",
      padding: "0.6rem 1.2rem",
      cursor: "pointer",
      background: "none",
      border: "none",
      position: "relative",
      overflow: "hidden",
    },
    navLinkUnderline: {
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "2px",
      background: "linear-gradient(90deg, #6b8e4e 0%, #3a5a40 100%)",
      transform: "scaleX(0)",
      transformOrigin: "right",
      transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "1.2rem",
      position: "relative",
    },
    userTag: {
      color: "#3a5a40",
      fontSize: "0.9rem",
      fontWeight: "600",
      padding: "0.6rem 1.2rem",
      background: "linear-gradient(135deg, rgba(244, 232, 193, 0.5) 0%, rgba(244, 232, 193, 0.3) 100%)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      whiteSpace: "nowrap",
      border: "1px solid rgba(58, 90, 64, 0.1)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 12px rgba(58, 90, 64, 0.08)",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    roleTag: {
      color: "white",
      fontSize: "0.7rem",
      fontWeight: "800",
      padding: "0.35rem 0.9rem",
      background: "linear-gradient(135deg, #6b8e4e 0%, #5a7a3d 100%)",
      borderRadius: "16px",
      display: "inline-block",
      textTransform: "uppercase",
      marginLeft: "0.5rem",
      boxShadow: "0 2px 8px rgba(58, 90, 64, 0.3)",
      letterSpacing: "0.5px",
    },
    dropdownMenu: {
      position: "absolute",
      top: "70px",
      right: "0",
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(244, 232, 193, 0.4) 100%)",
      backdropFilter: "blur(20px)",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(58, 90, 64, 0.15)",
      border: "1px solid rgba(58, 90, 64, 0.1)",
      zIndex: "1001",
      minWidth: "200px",
      overflow: "hidden",
    },
    dropdownItem: {
      padding: "0.8rem 1.5rem",
      color: "#3a5a40",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      background: "none",
      width: "100%",
      textAlign: "left",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      borderBottom: "1px solid rgba(58, 90, 64, 0.05)",
    },
    dropdownItemLogout: {
      padding: "0.8rem 1.5rem",
      color: "#d32f2f",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      background: "none",
      width: "100%",
      textAlign: "left",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    loginBtn: {
      textDecoration: "none",
      color: "#fff",
      fontSize: "0.9rem",
      fontWeight: "700",
      padding: "0.7rem 2rem",
      border: "none",
      borderRadius: "8px",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      display: "inline-block",
      cursor: "pointer",
      background: "linear-gradient(135deg, #6b8e4e 0%, #5a7a3d 100%)",
      boxShadow: "0 4px 15px rgba(58, 90, 64, 0.2)",
      position: "relative",
      overflow: "hidden",
    },
    iconButton: {
      background: "rgba(244, 232, 193, 0.3)",
      border: "none",
      fontSize: "1.3rem",
      cursor: "pointer",
      padding: "0.4rem 0.5rem",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
    },
    hamburger: {
      display: "none",
      background: "rgba(244, 232, 193, 0.3)",
      border: "none",
      fontSize: "1.8rem",
      cursor: "pointer",
      padding: "0.6rem 0.8rem",
      color: "#3a5a40",
      transition: "all 0.3s ease",
      borderRadius: "10px",
    },
    mobileMenu: {
      position: "absolute",
      top: "100%",
      left: "0",
      right: "0",
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(244, 232, 193, 0.4) 100%)",
      backdropFilter: "blur(20px)",
      borderBottom: "2px solid rgba(58, 90, 64, 0.1)",
      padding: "1.5rem 2rem",
      display: isMenuOpen ? "flex" : "none",
      flexDirection: "column",
      gap: "0.8rem",
      zIndex: "999",
      boxShadow: "0 8px 32px rgba(58, 90, 64, 0.1)",
    },
  };

  const keyframes = `
    @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600&display=swap');

    .nav-link-wrapper:hover .nav-link-underline {
      transform: scaleX(1);
      transform-origin: left;
    }

    @media (max-width: 1024px) {
      .nav-links {
        gap: 0.2rem !important;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.6rem 1.5rem !important;
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
        padding: 0.6rem 1.2rem !important;
        font-size: 0.8rem !important;
      }

      .user-tag-btn {
        display: none !important;
      }

      .icon-buttons-container {
        gap: 0.3rem !important;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        padding: 0.6rem 1rem !important;
      }

      .logo-image {
        height: 55px !important;
      }

      .icon-button {
        font-size: 1.2rem !important;
      }

      .login-btn {
        display: none !important;
      }
    }
  `;

  const handleLogoHover = (e) => {
    e.currentTarget.style.transform = "scale(1.1) rotate(2deg)";
    e.currentTarget.style.filter = "drop-shadow(0 8px 16px rgba(58, 90, 64, 0.2))";
  };

  const handleLogoLeave = (e) => {
    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
    e.currentTarget.style.filter = "drop-shadow(0 2px 4px rgba(58, 90, 64, 0.1))";
  };

  const handleLoginClick = () => {
    navigate("/LoginModal");
    setIsMenuOpen(false);
  };

  const renderNavLink = (link) => (
    <div key={link.label} className="nav-link-wrapper" style={{ position: "relative" }}>
      <a
        href={link.href}
        style={styles.navLink}
        className="nav-link"
        onClick={() => setIsMenuOpen(false)}
        onMouseEnter={(e) => {
          e.target.style.color = "#6b8e4e";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "#3a5a40";
        }}
      >
        {link.label}
        <span className="nav-link-underline" style={styles.navLinkUnderline}></span>
      </a>
    </div>
  );

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
            {navLinks.map((link) => (
              <li key={link.label}>{renderNavLink(link)}</li>
            ))}
          </ul>
        </div>

        <div style={styles.rightSection} className="right-section">
          {/* Iconos para CONSUMIDOR */}
          {user && user.rol === "CONSUMIDOR" && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleNavigate("/favoritos")}
                style={styles.iconButton}
                className="icon-button"
                title="Favoritos"
                aria-label="Favoritos"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15) rotate(-5deg)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(244, 232, 193, 0.7) 0%, rgba(244, 232, 193, 0.5) 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(58, 90, 64, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                  e.currentTarget.style.background = "rgba(244, 232, 193, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ♡
              </button>

              <button
                onClick={() => handleNavigate("/carrito")}
                style={styles.iconButton}
                className="icon-button"
                title="Carrito"
                aria-label="Carrito"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(244, 232, 193, 0.7) 0%, rgba(244, 232, 193, 0.5) 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(58, 90, 64, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                  e.currentTarget.style.background = "rgba(244, 232, 193, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                🛒
              </button>
            </div>
          )}

          {/* Login o User Menu */}
          {!user ? (
            <button
              onClick={handleLoginClick}
              style={styles.loginBtn}
              className="login-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(58, 90, 64, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(58, 90, 64, 0.2)";
              }}
            >
              Iniciar Sesión
            </button>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={styles.userTag}
                className="user-tag-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(244, 232, 193, 0.7) 0%, rgba(244, 232, 193, 0.5) 100%)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(244, 232, 193, 0.5) 0%, rgba(244, 232, 193, 0.3) 100%)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                👤 {user.nombre || user.correo}
                <span style={styles.roleTag}>{user.rol}</span>
                <span style={{ fontSize: "1rem", marginLeft: "0.3rem" }}>▼</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div style={styles.dropdownMenu} className="dropdown-menu">
                  <button
                    onClick={() => handleNavigate("/perfil")}
                    style={styles.dropdownItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(244, 232, 193, 0.5)";
                      e.currentTarget.style.paddingLeft = "1.8rem";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.paddingLeft = "1.5rem";
                    }}
                  >
                    👤 Perfil
                  </button>
                  <button
                    onClick={() => handleNavigate("/configuracion")}
                    style={styles.dropdownItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(244, 232, 193, 0.5)";
                      e.currentTarget.style.paddingLeft = "1.8rem";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.paddingLeft = "1.5rem";
                    }}
                  >
                    ⚙️ Configuración
                  </button>
                  <button
                    onClick={handleCerrarSesion}
                    style={styles.dropdownItemLogout}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(211, 47, 47, 0.1)";
                      e.currentTarget.style.paddingLeft = "1.8rem";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.paddingLeft = "1.5rem";
                    }}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            style={styles.hamburger}
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(244, 232, 193, 0.6)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(244, 232, 193, 0.3)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          {navLinks.map((link) => (
            <div key={link.label}>{renderNavLink(link)}</div>
          ))}

          {user && user.rol === "CONSUMIDOR" && (
            <>
              <button
                onClick={() => handleNavigate("/favoritos")}
                style={{ ...styles.navLink, fontSize: "1rem", padding: "0.8rem 1.2rem" }}
                onMouseEnter={(e) => (e.target.style.color = "#6b8e4e")}
                onMouseLeave={(e) => (e.target.style.color = "#3a5a40")}
              >
                ♡ Favoritos
              </button>
              <button
                onClick={() => handleNavigate("/carrito")}
                style={{ ...styles.navLink, fontSize: "1rem", padding: "0.8rem 1.2rem" }}
                onMouseEnter={(e) => (e.target.style.color = "#6b8e4e")}
                onMouseLeave={(e) => (e.target.style.color = "#3a5a40")}
              >
                🛒 Carrito
              </button>
            </>
          )}

          {!user ? (
            <button
              onClick={handleLoginClick}
              style={{ ...styles.loginBtn, textAlign: "center", marginTop: "0.5rem", width: "100%" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(58, 90, 64, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(58, 90, 64, 0.2)";
              }}
            >
              Iniciar Sesión
            </button>
          ) : (
            <>
              <div style={{ ...styles.userTag, justifyContent: "center", marginTop: "0.5rem" }}>
                👤 {user.nombre || user.correo}
                <span style={styles.roleTag}>{user.rol}</span>
              </div>
              <button
                onClick={() => handleNavigate("/perfil")}
                style={{ ...styles.navLink, padding: "0.8rem 1.2rem" }}
                onMouseEnter={(e) => (e.target.style.color = "#6b8e4e")}
                onMouseLeave={(e) => (e.target.style.color = "#3a5a40")}
              >
                👤 Perfil
              </button>
              <button
                onClick={() => handleNavigate("/configuracion")}
                style={{ ...styles.navLink, padding: "0.8rem 1.2rem" }}
                onMouseEnter={(e) => (e.target.style.color = "#6b8e4e")}
                onMouseLeave={(e) => (e.target.style.color = "#3a5a40")}
              >
                ⚙️ Configuración
              </button>
              <button
                onClick={handleCerrarSesion}
                style={{ ...styles.loginBtn, textAlign: "center", width: "100%", background: "linear-gradient(135deg, #ef5350 0%, #d32f2f 100%)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(211, 47, 47, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(211, 47, 47, 0.2)";
                }}
              >
                🚪 Cerrar Sesión
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}