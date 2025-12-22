import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import {
  obtenerNotificaciones,
  contarNotificaciones,
} from "../services/notificacionService";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNotificaciones, setTotalNotificaciones] = useState(0);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito } = useCarrito();

  // Calcular total del carrito
  const totalCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (userData && token) {
          const parsedUser = JSON.parse(userData);
          console.log("📊 Usuario cargado:", parsedUser); // DEBUG
          setUser(parsedUser);
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

  // Actualizar favoritos desde localStorage
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favoritos")) || [];
    setTotalFavoritos(favs.length);
  }, [location]);

  // Cargar notificaciones
  useEffect(() => {
    if (!user?.idUsuario) return;

    const token = localStorage.getItem("authToken");

    obtenerNotificaciones(user.idUsuario, token)
      .then(setNotificaciones)
      .catch(() => setNotificaciones([]));

    contarNotificaciones(user.idUsuario, token)
      .then(setTotalNotificaciones)
      .catch(() => setTotalNotificaciones(0));

  }, [user, location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const userTagElement = document.querySelector(".user-tag-btn");
      const dropdownElement = document.querySelector(".dropdown-menu");
      const notifElement = document.querySelector(".notif-dropdown");

      if (
        userTagElement &&
        !userTagElement.contains(event.target) &&
        dropdownElement &&
        !dropdownElement.contains(event.target)
      ) {
        setShowUserMenu(false);
      }

      if (
        notifElement &&
        !notifElement.contains(event.target) &&
        !event.target.closest('[aria-label="Notificaciones"]')
      ) {
        setShowNotificaciones(false);
      }
    };

    if (showUserMenu || showNotificaciones) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserMenu, showNotificaciones]);

  const handleCerrarSesion = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setIsMenuOpen(false);
    setShowUserMenu(false);
    window.location.reload(); // Fuerza limpiar contextos (carrito, favoritos, etc.)
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

  const calcularTiempoRelativo = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diferencia = Math.floor((ahora - notifFecha) / 1000); // segundos

    if (diferencia < 60) return "Hace un momento";
    if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} min`;
    if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} h`;
    if (diferencia < 604800) return `Hace ${Math.floor(diferencia / 86400)} días`;
    return notifFecha.toLocaleDateString();
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
      gap: "0.8rem",
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
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)",
      backdropFilter: "blur(20px)",
      borderRadius: "16px",
      boxShadow: "0 12px 48px rgba(58, 90, 64, 0.2)",
      border: "1px solid rgba(58, 90, 64, 0.08)",
      zIndex: "1001",
      minWidth: "200px",
      overflow: "hidden",
    },
    notificacionesDropdown: {
      position: "absolute",
      top: "60px",
      right: "0",
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(20px)",
      borderRadius: "16px",
      boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
      border: "1px solid rgba(0, 0, 0, 0.08)",
      zIndex: "1001",
      width: "340px",
      maxHeight: "450px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    notificacionesHeader: {
      padding: "1rem 1.2rem",
      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
      background: "rgba(255, 255, 255, 0.95)",
      position: "sticky",
      top: "0",
      zIndex: "10",
    },
    notificacionesTitle: {
      fontSize: "1.15rem",
      fontWeight: "700",
      color: "#1c1e21",
      margin: "0",
    },
    notificacionesList: {
      maxHeight: "380px",
      overflowY: "auto",
      overflowX: "hidden",
    },
    notificacionItem: (leido) => ({
      padding: "0.9rem 1.2rem",
      background: leido ? "#ffffff" : "#e7f3ff",
      borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      gap: "0.85rem",
      alignItems: "flex-start",
      position: "relative",
    }),
    notificacionIcono: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #6b8e4e 0%, #5a7a3d 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2rem",
      flexShrink: "0",
      boxShadow: "0 2px 8px rgba(58, 90, 64, 0.2)",
    },
    notificacionContenido: {
      flex: "1",
      minWidth: "0",
    },
    notificacionMensaje: {
      fontSize: "0.9rem",
      fontWeight: "500",
      color: "#1c1e21",
      lineHeight: "1.35",
      marginBottom: "0.25rem",
      wordWrap: "break-word",
    },
    notificacionTiempo: {
      fontSize: "0.75rem",
      color: "#65676b",
      fontWeight: "400",
    },
    notificacionDot: {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      width: "9px",
      height: "9px",
      borderRadius: "50%",
      background: "#1877f2",
    },
    emptyNotificaciones: {
      padding: "2.5rem 2rem",
      textAlign: "center",
      color: "#65676b",
    },
    emptyNotificacionesIcono: {
      fontSize: "3rem",
      marginBottom: "0.8rem",
      opacity: "0.5",
    },
    emptyNotificacionesMensaje: {
      fontSize: "0.95rem",
      fontWeight: "600",
      color: "#1c1e21",
      marginBottom: "0.25rem",
    },
    emptyNotificacionesTexto: {
      fontSize: "0.85rem",
      color: "#65676b",
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
      fontSize: "1.4rem",
      cursor: "pointer",
      padding: "0.5rem 0.6rem",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "10px",
      width: "44px",
      height: "44px",
    },
    badge: (bgColor) => ({
      position: "absolute",
      top: "-6px",
      right: "-6px",
      background: bgColor,
      color: "white",
      borderRadius: "50%",
      fontSize: "11px",
      fontWeight: "700",
      padding: "2px 6px",
      minWidth: "18px",
      textAlign: "center",
      lineHeight: "1",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    }),
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
        gap: 0.5rem !important;
      }

      .login-btn {
        padding: 0.6rem 1.2rem !important;
        font-size: 0.8rem !important;
      }

      .user-tag-btn {
        display: none !important;
      }

      .icon-button {
        width: 40px !important;
        height: 40px !important;
        font-size: 1.2rem !important;
      }

      .notif-dropdown {
        width: 300px !important;
        right: -10px !important;
        max-height: 400px !important;
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
        width: 38px !important;
        height: 38px !important;
        font-size: 1.1rem !important;
      }

      .login-btn {
        display: none !important;
      }

      .notif-dropdown {
        width: 280px !important;
        right: -20px !important;
        max-height: 380px !important;
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
          {/* Iconos para CONSUMIDOR con CONTADORES */}
          {user && user.rol === "CONSUMIDOR" && (
            <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
              <button
                onClick={() => handleNavigate("/favoritos")}
                style={{ ...styles.iconButton, position: "relative" }}
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
                {totalFavoritos > 0 && (
                  <span style={styles.badge("#e53935")}>
                    {totalFavoritos > 99 ? "99+" : totalFavoritos}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavigate("/carrito")}
                style={{ ...styles.iconButton, position: "relative" }}
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
                {totalCarrito > 0 && (
                  <span style={styles.badge("#d32f2f")}>
                    {totalCarrito > 99 ? "99+" : totalCarrito}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowNotificaciones(!showNotificaciones)}
                style={{ ...styles.iconButton, position: "relative" }}
                className="icon-button"
                title="Notificaciones"
                aria-label="Notificaciones"
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
                🔔
                {totalNotificaciones > 0 && (
                  <span style={styles.badge("#ff9800")}>
                    {totalNotificaciones > 99 ? "99+" : totalNotificaciones}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificaciones */}
              {showNotificaciones && (
                <div style={styles.notificacionesDropdown} className="notif-dropdown">
                  <div style={styles.notificacionesHeader}>
                    <h3 style={styles.notificacionesTitle}>Notificaciones</h3>
                  </div>

                  <div style={styles.notificacionesList}>
                    {notificaciones.length === 0 ? (
                      <div style={styles.emptyNotificaciones}>
                        <div style={styles.emptyNotificacionesIcono}>🔔</div>
                        <div style={styles.emptyNotificacionesMensaje}>
                          Sin notificaciones
                        </div>
                        <div style={styles.emptyNotificacionesTexto}>
                          Te avisaremos cuando haya algo nuevo
                        </div>
                      </div>
                    ) : (
                      notificaciones.map((n) => (
                        <div
                          key={n.idNotificacion}
                          style={styles.notificacionItem(n.leido)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = n.leido ? "#f5f5f5" : "#d4e9ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = n.leido ? "#ffffff" : "#e7f3ff";
                          }}
                        >
                          <div style={styles.notificacionIcono}>
                            {n.tipo === "pedido" ? "📦" :
                              n.tipo === "oferta" ? "🎁" :
                                n.tipo === "mensaje" ? "💬" : "🔔"}
                          </div>

                          <div style={styles.notificacionContenido}>
                            <div style={styles.notificacionMensaje}>
                              {n.mensaje}
                            </div>
                            <div style={styles.notificacionTiempo}>
                              {n.fecha ? calcularTiempoRelativo(n.fecha) : "Hace un momento"}
                            </div>
                          </div>

                          {!n.leido && <div style={styles.notificacionDot}></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notificaciones para VENDEDOR */}
          {user && user.rol === "VENDEDOR" && (
            <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
              <button
                onClick={() => setShowNotificaciones(!showNotificaciones)}
                style={{ ...styles.iconButton, position: "relative" }}
                className="icon-button"
                title="Notificaciones"
                aria-label="Notificaciones"
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
                🔔
                {totalNotificaciones > 0 && (
                  <span style={styles.badge("#ff9800")}>
                    {totalNotificaciones > 99 ? "99+" : totalNotificaciones}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificaciones */}
              {showNotificaciones && (
                <div style={styles.notificacionesDropdown} className="notif-dropdown">
                  <div style={styles.notificacionesHeader}>
                    <h3 style={styles.notificacionesTitle}>Notificaciones</h3>
                  </div>

                  <div style={styles.notificacionesList}>
                    {notificaciones.length === 0 ? (
                      <div style={styles.emptyNotificaciones}>
                        <div style={styles.emptyNotificacionesIcono}>🔔</div>
                        <div style={styles.emptyNotificacionesMensaje}>
                          Sin notificaciones
                        </div>
                        <div style={styles.emptyNotificacionesTexto}>
                          Te avisaremos cuando haya algo nuevo
                        </div>
                      </div>
                    ) : (
                      notificaciones.map((n) => (
                        <div
                          key={n.idNotificacion}
                          style={styles.notificacionItem(n.leido)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = n.leido ? "#f5f5f5" : "#d4e9ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = n.leido ? "#ffffff" : "#e7f3ff";
                          }}
                        >
                          <div style={styles.notificacionIcono}>
                            {n.tipo === "pedido" ? "📦" :
                              n.tipo === "oferta" ? "🎁" :
                                n.tipo === "mensaje" ? "💬" : "🔔"}
                          </div>

                          <div style={styles.notificacionContenido}>
                            <div style={styles.notificacionMensaje}>
                              {n.mensaje}
                            </div>
                            <div style={styles.notificacionTiempo}>
                              {n.fecha ? calcularTiempoRelativo(n.fecha) : "Hace un momento"}
                            </div>
                          </div>

                          {!n.leido && <div style={styles.notificacionDot}></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
                👤 {(() => {
                  // Si hay nombre, mostrar nombre + apellido
                  if (user.nombre) {
                    return `${user.nombre} ${user.apellido || ""}`.trim();
                  }
                  // Si no hay nombre, intentar con email o correo
                  if (user.email) return user.email.split('@')[0];
                  if (user.correo) return user.correo.split('@')[0];
                  // Si hay username o usuario
                  if (user.username) return user.username;
                  if (user.usuario) return user.usuario;
                  // Último recurso
                  return "Usuario";
                })()}
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
                    onClick={() => handleNavigate("/mis-pedidos")}
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
                    📦 Mis pedidos
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
                ♡ Favoritos {totalFavoritos > 0 && `(${totalFavoritos})`}
              </button>

              <button
                onClick={() => handleNavigate("/mis-pedidos")}
                style={{ ...styles.navLink, fontSize: "1rem", padding: "0.8rem 1.2rem" }}
                onMouseEnter={(e) => (e.target.style.color = "#6b8e4e")}
                onMouseLeave={(e) => (e.target.style.color = "#3a5a40")}
              >
                📦 Mis pedidos
              </button>
              
              <button
                onClick={() => handleNavigate("/carrito")}
                style={{ ...styles.navLink, fontSize: "1rem", padding: "0.8rem 1.2rem" }}
                onMouseEnter={(e) => (e.target.style.color = "#6b8e4e")}
                onMouseLeave={(e) => (e.target.style.color = "#3a5a40")}
              >
                🛒 Carrito {totalCarrito > 0 && `(${totalCarrito})`}
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
                👤 {(() => {
                  // Si hay nombre, mostrar nombre + apellido
                  if (user.nombre) {
                    return `${user.nombre} ${user.apellido || ""}`.trim();
                  }
                  // Si no hay nombre, intentar con email o correo
                  if (user.email) return user.email.split('@')[0];
                  if (user.correo) return user.correo.split('@')[0];
                  // Si hay username o usuario
                  if (user.username) return user.username;
                  if (user.usuario) return user.usuario;
                  // Último recurso
                  return "Usuario";
                })()}
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