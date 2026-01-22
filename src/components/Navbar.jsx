import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useFavoritos } from "../context/FavoritosContext";
import {
  obtenerNotificaciones,
  contarNotificaciones,
} from "../services/notificacionService";

// IMPORTAR EL LOGO CORRECTO
import logoActual from "../assets/Logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalNotificaciones, setTotalNotificaciones] = useState(0);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito } = useCarrito();
  const { favoritos, cargarFavoritos } = useFavoritos();
  const navbarRef = useRef(null);

  // Calcular total del carrito
  const totalCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // Efecto para controlar el comportamiento de scroll
  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isTop = currentScrollY < 10;
      const isScrollingDown = currentScrollY > lastScrollY;
      const isScrollingUp = currentScrollY < lastScrollY;
      
      setIsAtTop(isTop);
      
      // Si está en el top, siempre mostrar
      if (isTop) {
        setIsVisible(true);
      } 
      // Si está haciendo scroll hacia abajo y NO está en el top, ocultar
      else if (isScrollingDown && currentScrollY > 100) {
        setIsVisible(false);
      }
      // Si está haciendo scroll hacia arriba, mostrar
      else if (isScrollingUp) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
      
      // Limpiar timeout anterior
      clearTimeout(scrollTimeout);
      
      // Si dejó de hacer scroll, mostrar navbar después de 300ms
      scrollTimeout = setTimeout(() => {
        if (!isTop) {
          setIsVisible(true);
        }
      }, 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

  // Efecto para cargar usuario
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");

        if (userData && token) {
          const parsedUser = JSON.parse(userData);
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

  // Efecto para cargar favoritos cuando cambia el usuario o la ubicación
  useEffect(() => {
    if (user?.rol === "CONSUMIDOR") {
      cargarFavoritos();
    }
  }, [user, location, cargarFavoritos]);

  // Efecto para actualizar el contador de favoritos
  useEffect(() => {
    if (user?.rol === "CONSUMIDOR" && favoritos) {
      setTotalFavoritos(favoritos.length);
    } else {
      setTotalFavoritos(0);
    }
  }, [favoritos, user]);

  // Cargar notificaciones
  useEffect(() => {
    if (!user?.idUsuario) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    const cargarNotificaciones = async () => {
      try {
        const notifs = await obtenerNotificaciones(user.idUsuario, token);
        setNotificaciones(notifs || []);
        
        const total = await contarNotificaciones(user.idUsuario, token);
        setTotalNotificaciones(total || 0);
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
        setNotificaciones([]);
        setTotalNotificaciones(0);
      }
    };

    cargarNotificaciones();
  }, [user?.idUsuario, location]);

  // Efecto para cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const userTagElement = document.querySelector(".user-tag-btn");
      const dropdownElement = document.querySelector(".dropdown-menu");
      const notifElement = document.querySelector(".notif-dropdown");
      const mobileMenuElement = document.querySelector(".mobile-menu");
      const hamburgerElement = document.querySelector(".hamburger");

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

      // Cerrar menú móvil al hacer clic fuera
      if (
        mobileMenuElement &&
        !mobileMenuElement.contains(event.target) &&
        hamburgerElement &&
        !hamburgerElement.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    setIsMenuOpen(false);
    setShowUserMenu(false);
    window.location.reload();
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
    const diferencia = Math.floor((ahora - notifFecha) / 1000);

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
      background: isAtTop 
        ? "rgba(255, 255, 255, 0.4)"
        : "rgba(255, 255, 255, 0.9)",
      backdropFilter: isAtTop ? "blur(8px)" : "blur(12px)",
      borderBottom: isAtTop 
        ? "1px solid rgba(255, 107, 53, 0.1)" 
        : "1px solid rgba(255, 107, 53, 0.2)",
      padding: isAtTop ? "1.2rem 4rem" : "0.8rem 4rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      zIndex: "1000",
      fontFamily: "'Playfair Display', 'Georgia', serif", // CAMBIADO: Playfair Display para todo el navbar
      gap: "2rem",
      boxShadow: isAtTop 
        ? "0 2px 10px rgba(255, 107, 53, 0.05)" 
        : "0 4px 20px rgba(255, 107, 53, 0.1)",
      width: "100%",
      boxSizing: "border-box",
      height: isAtTop ? "75px" : "65px",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isVisible ? "translateY(0)" : "translateY(-100%)",
      opacity: isVisible ? 1 : 0,
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
      transition: "all 0.3s ease",
      padding: "0",
    },
    logoImage: {
      height: isAtTop ? "50px" : "42px",
      width: "auto",
      objectFit: "contain",
      transition: "all 0.3s ease",
    },
    navLinks: {
      display: "flex",
      gap: "1rem",
      listStyle: "none",
      margin: "0",
      padding: "0",
      alignItems: "center",
    },
    navLink: {
      textDecoration: "none",
      color: isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B",
      fontSize: "0.95rem",
      fontWeight: "600", // Ajustado para Playfair Display
      transition: "all 0.3s ease",
      display: "inline-block",
      padding: "0.6rem 1rem",
      cursor: "pointer",
      background: "none",
      border: "none",
      position: "relative",
      borderRadius: "8px",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
      position: "relative",
    },
    userTag: {
      color: isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B",
      fontSize: "0.9rem",
      fontWeight: "500", // Ajustado para Playfair Display
      padding: "0.6rem 1rem",
      background: "none",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      whiteSpace: "nowrap",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
    },
    roleTag: {
      color: "white",
      fontSize: "0.7rem",
      fontWeight: "700", // Ajustado para Playfair Display
      padding: "0.3rem 0.7rem",
      background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
      borderRadius: "12px",
      display: "inline-block",
      textTransform: "uppercase",
      marginLeft: "0.3rem",
      boxShadow: "0 2px 6px rgba(255, 107, 53, 0.3)",
      letterSpacing: "0.5px",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
    },
    dropdownMenu: {
      position: "absolute",
      top: "calc(100% + 10px)",
      right: "0",
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(15px)",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)",
      border: "1px solid rgba(255, 107, 53, 0.1)",
      zIndex: "1002",
      minWidth: "180px",
      overflow: "hidden",
    },
    notificacionesDropdown: {
      position: "absolute",
      top: "calc(100% + 10px)",
      right: "0",
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(15px)",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)",
      border: "1px solid rgba(255, 107, 53, 0.1)",
      zIndex: "1002",
      width: "320px",
      maxHeight: "400px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    notificacionesHeader: {
      padding: "1rem",
      borderBottom: "1px solid rgba(255, 107, 53, 0.1)",
      background: "rgba(255, 255, 255, 0.95)",
      position: "sticky",
      top: "0",
      zIndex: "10",
    },
    notificacionesTitle: {
      fontSize: "1rem",
      fontWeight: "700",
      color: "#1E293B",
      margin: "0",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
    },
    notificacionesList: {
      maxHeight: "340px",
      overflowY: "auto",
      overflowX: "hidden",
    },
    notificacionItem: (leido) => ({
      padding: "0.8rem 1rem",
      background: leido ? "rgba(248, 250, 252, 0.5)" : "rgba(255, 107, 53, 0.05)",
      borderBottom: "1px solid rgba(255, 107, 53, 0.05)",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      gap: "0.8rem",
      alignItems: "flex-start",
      position: "relative",
    }),
    notificacionIcono: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      flexShrink: "0",
      boxShadow: "0 2px 6px rgba(255, 107, 53, 0.2)",
    },
    notificacionContenido: {
      flex: "1",
      minWidth: "0",
    },
    notificacionMensaje: {
      fontSize: "0.85rem",
      fontWeight: "500",
      color: "#1E293B",
      lineHeight: "1.3",
      marginBottom: "0.2rem",
      wordWrap: "break-word",
      fontFamily: "'Inter', sans-serif", // Mantenemos Inter para mensajes largos
    },
    notificacionTiempo: {
      fontSize: "0.7rem",
      color: "#64748B",
      fontWeight: "400",
      fontFamily: "'Inter', sans-serif", // Mantenemos Inter para texto pequeño
    },
    notificacionDot: {
      position: "absolute",
      top: "0.8rem",
      right: "0.8rem",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "#FF6B35",
    },
    emptyNotificaciones: {
      padding: "2rem 1.5rem",
      textAlign: "center",
      color: "#64748B",
    },
    emptyNotificacionesIcono: {
      fontSize: "2.5rem",
      marginBottom: "0.8rem",
      opacity: "0.3",
    },
    emptyNotificacionesMensaje: {
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#1E293B",
      marginBottom: "0.2rem",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
    },
    emptyNotificacionesTexto: {
      fontSize: "0.8rem",
      color: "#64748B",
      fontFamily: "'Inter', sans-serif", // Mantenemos Inter para texto explicativo
    },
    dropdownItem: {
      padding: "0.7rem 1rem",
      color: "#1E293B",
      fontSize: "0.85rem",
      fontWeight: "500", // Ajustado para Playfair Display
      cursor: "pointer",
      border: "none",
      background: "none",
      width: "100%",
      textAlign: "left",
      transition: "all 0.2s ease",
      borderBottom: "1px solid rgba(255, 107, 53, 0.05)",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
    },
    dropdownItemLogout: {
      padding: "0.7rem 1rem",
      color: "#EF4444",
      fontSize: "0.85rem",
      fontWeight: "500", // Ajustado para Playfair Display
      cursor: "pointer",
      border: "none",
      background: "none",
      width: "100%",
      textAlign: "left",
      transition: "all 0.2s ease",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
    },
    loginBtn: {
      textDecoration: "none",
      color: "#fff",
      fontSize: "0.9rem",
      fontWeight: "700", // Ajustado para Playfair Display
      padding: "0.6rem 1.5rem",
      border: "none",
      borderRadius: "8px",
      transition: "all 0.3s ease",
      display: "inline-block",
      cursor: "pointer",
      background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
      boxShadow: "0 4px 12px rgba(255, 107, 53, 0.2)",
      fontFamily: "'Playfair Display', serif", // YA ESTABA CORRECTO
    },
    iconButton: {
      background: "none",
      border: "none",
      fontSize: "1.1rem",
      cursor: "pointer",
      padding: "0.5rem",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      width: "42px",
      height: "42px",
      color: isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B",
      position: "relative",
    },
    badge: (bgColor) => ({
      position: "absolute",
      top: "-6px",
      right: "-6px",
      background: bgColor || "#FF6B35",
      color: "white",
      borderRadius: "50%",
      fontSize: "10px",
      fontWeight: "700",
      padding: "2px 5px",
      minWidth: "16px",
      textAlign: "center",
      lineHeight: "1",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      fontFamily: "'Inter', sans-serif", // Mantenemos Inter para badges pequeños
    }),
    hamburger: {
      display: "none",
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      padding: "0.5rem 0.7rem",
      color: isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B",
      transition: "all 0.3s ease",
      borderRadius: "8px",
      width: "42px",
      height: "42px",
      alignItems: "center",
      justifyContent: "center",
    },
    mobileMenu: {
      position: "fixed",
      top: isAtTop ? "75px" : "65px",
      left: "0",
      right: "0",
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(15px)",
      borderBottom: "1px solid rgba(255, 107, 53, 0.1)",
      padding: "1.5rem",
      display: isMenuOpen ? "flex" : "none",
      flexDirection: "column",
      gap: "0.5rem",
      zIndex: "999",
      boxShadow: "0 10px 30px rgba(255, 107, 53, 0.1)",
      maxHeight: "calc(100vh - 75px)",
      overflowY: "auto",
    },
    mobileNavLink: {
      textDecoration: "none",
      color: "#1E293B",
      fontSize: "0.95rem",
      fontWeight: "500", // Ajustado para Playfair Display
      padding: "0.8rem 1rem",
      cursor: "pointer",
      background: "none",
      border: "none",
      textAlign: "left",
      borderRadius: "8px",
      transition: "all 0.2s ease",
      fontFamily: "'Playfair Display', serif", // CAMBIADO: Playfair Display
      width: "100%",
    },
    spacer: {
      height: isAtTop ? "75px" : "65px",
      transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    },
  };

  const handleLogoHover = (e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  };

  const handleLogoLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  const handleLoginClick = () => {
    navigate("/LoginModal");
    setIsMenuOpen(false);
  };

  const renderNavLink = (link) => (
    <div key={link.label} className="nav-link-wrapper" style={{ position: "relative" }}>
      <button
        onClick={() => handleNavigate(link.href)}
        style={styles.navLink}
        className="nav-link"
        onMouseEnter={(e) => {
          e.target.style.color = "#FF6B35";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B";
        }}
      >
        {link.label}
      </button>
    </div>
  );

  const renderMobileNavLink = (link) => (
    <button
      key={link.label}
      onClick={() => handleNavigate(link.href)}
      style={styles.mobileNavLink}
      onMouseEnter={(e) => {
        e.target.style.color = "#FF6B35";
        e.target.style.background = "rgba(255, 107, 53, 0.05)";
      }}
      onMouseLeave={(e) => {
        e.target.style.color = "#1E293B";
        e.target.style.background = "none";
      }}
    >
      {link.label}
    </button>
  );

  const userName = user ? (
    user.nombre ? `${user.nombre} ${user.apellido || ""}`.trim() :
    user.email ? user.email.split('@')[0] :
    user.correo ? user.correo.split('@')[0] :
    user.username || user.usuario || "Usuario"
  ) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');

        /* Aplicar Playfair Display a todos los elementos del navbar */
        .navbar,
        .nav-link,
        .user-tag-btn,
        .login-btn,
        .dropdown-menu button,
        .mobile-menu button,
        .notificaciones-title,
        .empty-notificaciones-mensaje {
          font-family: 'Playfair Display', Georgia, serif !important;
        }

        /* Solo mantener Inter para texto muy pequeño o detalles */
        .badge,
        .notificacion-mensaje,
        .notificacion-tiempo,
        .empty-notificaciones-texto {
          font-family: 'Inter', sans-serif !important;
        }

        /* Scrollbar personalizada */
        .notificaciones-list::-webkit-scrollbar {
          width: 6px;
        }

        .notificaciones-list::-webkit-scrollbar-track {
          background: rgba(255, 107, 53, 0.05);
          border-radius: 3px;
        }

        .notificaciones-list::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 53, 0.2);
          border-radius: 3px;
        }

        .notificaciones-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 107, 53, 0.3);
        }

        /* Asegurar que todos los botones tengan el mismo estilo sin bordes */
        .nav-link, 
        .icon-button,
        .user-tag-btn,
        .hamburger {
          border: none !important;
          box-shadow: none !important;
          background: none !important;
        }

        .nav-link:hover,
        .icon-button:hover,
        .user-tag-btn:hover,
        .hamburger:hover {
          background: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Iconos con el mismo tamaño */
        .icon-button {
          width: 42px !important;
          height: 42px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1.1rem !important;
        }

        .hamburger {
          width: 42px !important;
          height: 42px !important;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .navbar {
            padding-left: 2rem !important;
            padding-right: 2rem !important;
          }

          .nav-links {
            gap: 0.5rem !important;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: ${isAtTop ? "1.2rem 1.5rem" : "0.8rem 1.5rem"} !important;
          }

          .nav-links {
            display: none !important;
          }

          .logo-image {
            height: ${isAtTop ? "45px" : "38px"} !important;
          }

          .hamburger {
            display: flex !important;
          }

          .right-section {
            gap: 0.5rem !important;
          }

          .login-btn {
            padding: 0.5rem 1rem !important;
            font-size: 0.85rem !important;
          }

          .user-tag-btn span:last-child {
            display: none;
          }

          .notif-dropdown {
            width: 280px !important;
            right: -10px !important;
          }

          .mobile-menu {
            top: ${isAtTop ? "75px" : "65px"} !important;
          }

          .navbar-spacer {
            height: ${isAtTop ? "75px" : "65px"} !important;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: ${isAtTop ? "1rem 1rem" : "0.8rem 1rem"} !important;
          }

          .logo-image {
            height: ${isAtTop ? "40px" : "35px"} !important;
          }

          .login-btn {
            display: none !important;
          }

          .notif-dropdown {
            width: 260px !important;
            right: -20px !important;
          }

          .mobile-menu {
            top: ${isAtTop ? "75px" : "65px"} !important;
          }

          .navbar-spacer {
            height: ${isAtTop ? "75px" : "65px"} !important;
          }
        }
      `}</style>

      {/* Contenedor de espaciado para evitar que el contenido quede tapado */}
      <div style={styles.spacer} className="navbar-spacer"></div>

      <nav 
        ref={navbarRef}
        style={styles.navbar} 
        className="navbar"
        onMouseEnter={() => {
          setIsVisible(true);
        }}
      >
        <div style={styles.leftSection} className="left-section">
          <a
            href="/"
            style={styles.logo}
            className="logo"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
          >
            <img
              src={logoActual}
              alt="My Harvest - Mercado Local IA"
              style={styles.logoImage}
              className="logo-image"
              onError={(e) => {
                console.error("Error cargando logo:", e);
                e.target.onerror = null;
                e.target.src = "/logo.png";
              }}
            />
          </a>

          <ul style={styles.navLinks} className="nav-links">
            {navLinks.map(renderNavLink)}
          </ul>
        </div>

        <div style={styles.rightSection} className="right-section">
          {/* FAVORITOS - Solo para CONSUMIDOR */}
          {user && user.rol === "CONSUMIDOR" && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => handleNavigate("/favoritos")}
                style={styles.iconButton}
                className="icon-button"
                title="Favoritos"
                aria-label="Favoritos"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF6B35";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ❤️
                {totalFavoritos > 0 && (
                  <span style={styles.badge("#EF4444")}>
                    {totalFavoritos > 99 ? "99+" : totalFavoritos}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* NOTIFICACIONES - Para todos los usuarios autenticados */}
          {user && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotificaciones(!showNotificaciones)}
                style={styles.iconButton}
                className="icon-button"
                title="Notificaciones"
                aria-label="Notificaciones"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF6B35";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                🔔
                {totalNotificaciones > 0 && (
                  <span style={styles.badge("#F59E0B")}>
                    {totalNotificaciones > 99 ? "99+" : totalNotificaciones}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificaciones */}
              {showNotificaciones && (
                <div style={styles.notificacionesDropdown} className="notif-dropdown">
                  <div style={styles.notificacionesHeader}>
                    <h3 style={styles.notificacionesTitle} className="notificaciones-title">Notificaciones</h3>
                  </div>

                  <div style={styles.notificacionesList} className="notificaciones-list">
                    {notificaciones.length === 0 ? (
                      <div style={styles.emptyNotificaciones}>
                        <div style={styles.emptyNotificacionesIcono}>🔔</div>
                        <div style={styles.emptyNotificacionesMensaje} className="empty-notificaciones-mensaje">
                          Sin notificaciones
                        </div>
                        <div style={styles.emptyNotificacionesTexto} className="empty-notificaciones-texto">
                          Te avisaremos cuando haya algo nuevo
                        </div>
                      </div>
                    ) : (
                      notificaciones.map((n) => (
                        <div
                          key={n.idNotificacion}
                          style={styles.notificacionItem(n.leido)}
                          onClick={() => {
                            setShowNotificaciones(false);
                            if ((n.tipo === "PEDIDO" || n.tipo === "pedido") && n.idPedido) {
                              navigate(
                                user.rol === "VENDEDOR"
                                  ? `/vendedor/pedido/${n.idPedido}`
                                  : `/pedido/${n.idPedido}`
                              );
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = n.leido 
                              ? "rgba(248, 250, 252, 0.8)" 
                              : "rgba(255, 107, 53, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = n.leido 
                              ? "rgba(248, 250, 252, 0.5)" 
                              : "rgba(255, 107, 53, 0.05)";
                          }}
                        >
                          <div style={styles.notificacionIcono}>
                            {n.tipo === "PEDIDO" || n.tipo === "pedido" ? "📦" :
                             n.tipo === "OFERTA" || n.tipo === "oferta" ? "🎁" :
                             n.tipo === "MENSAJE" || n.tipo === "mensaje" ? "💬" : "🔔"}
                          </div>

                          <div style={styles.notificacionContenido}>
                            <div style={styles.notificacionMensaje} className="notificacion-mensaje">
                              {n.mensaje}
                            </div>
                            <div style={styles.notificacionTiempo} className="notificacion-tiempo">
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

          {/* CARRITO - Solo para CONSUMIDOR */}
          {user && user.rol === "CONSUMIDOR" && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => handleNavigate("/carrito")}
                style={styles.iconButton}
                className="icon-button"
                title="Carrito"
                aria-label="Carrito"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF6B35";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                🛒
                {totalCarrito > 0 && (
                  <span style={styles.badge("#10B981")}>
                    {totalCarrito > 99 ? "99+" : totalCarrito}
                  </span>
                )}
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
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.2)";
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
                  e.currentTarget.style.color = "#FF6B35";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                👤 {userName}
                <span style={{ fontSize: "0.9rem", marginLeft: "0.2rem" }}>▼</span>
              </button>

              {/* Dropdown Menu - MOSTRAR "MIS PEDIDOS" SOLO PARA CONSUMIDORES */}
              {showUserMenu && (
                <div style={styles.dropdownMenu} className="dropdown-menu">
                  <button
                    onClick={() => handleNavigate("/perfil")}
                    style={styles.dropdownItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 107, 53, 0.05)";
                      e.currentTarget.style.paddingLeft = "1.2rem";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.paddingLeft = "1rem";
                    }}
                  >
                    👤 Perfil
                  </button>
                  <button
                    onClick={() => handleNavigate("/configuracion")}
                    style={styles.dropdownItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 107, 53, 0.05)";
                      e.currentTarget.style.paddingLeft = "1.2rem";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.paddingLeft = "1rem";
                    }}
                  >
                    ⚙️ Configuración
                  </button>

                  {/* SOLO MOSTRAR "MIS PEDIDOS" PARA CONSUMIDORES */}
                  {user.rol === "CONSUMIDOR" && (
                    <button
                      onClick={() => handleNavigate("/mis-pedidos")}
                      style={styles.dropdownItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 107, 53, 0.05)";
                        e.currentTarget.style.paddingLeft = "1.2rem";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.paddingLeft = "1rem";
                      }}
                    >
                      📦 Mis pedidos
                    </button>
                  )}

                  <button
                    onClick={handleCerrarSesion}
                    style={styles.dropdownItemLogout}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                      e.currentTarget.style.paddingLeft = "1.2rem";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.paddingLeft = "1rem";
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
              e.currentTarget.style.color = "#FF6B35";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isAtTop ? "rgba(30, 41, 59, 0.9)" : "#1E293B";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          {navLinks.map(renderMobileNavLink)}

          {/* FAVORITOS - Solo para CONSUMIDOR en mobile */}
          {user && user.rol === "CONSUMIDOR" && (
            <button
              onClick={() => handleNavigate("/favoritos")}
              style={styles.mobileNavLink}
              onMouseEnter={(e) => {
                e.target.style.color = "#FF6B35";
                e.target.style.background = "rgba(255, 107, 53, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#1E293B";
                e.target.style.background = "none";
              }}
            >
              ❤️ Favoritos {totalFavoritos > 0 && `(${totalFavoritos})`}
            </button>
          )}

          {/* PEDIDOS Y CARRITO - Solo para CONSUMIDOR en mobile */}
          {user && user.rol === "CONSUMIDOR" && (
            <>
              <button
                onClick={() => handleNavigate("/mis-pedidos")}
                style={styles.mobileNavLink}
                onMouseEnter={(e) => {
                  e.target.style.color = "#FF6B35";
                  e.target.style.background = "rgba(255, 107, 53, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#1E293B";
                  e.target.style.background = "none";
                }}
              >
                📦 Mis pedidos
              </button>

              <button
                onClick={() => handleNavigate("/carrito")}
                style={styles.mobileNavLink}
                onMouseEnter={(e) => {
                  e.target.style.color = "#FF6B35";
                  e.target.style.background = "rgba(255, 107, 53, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#1E293B";
                  e.target.style.background = "none";
                }}
              >
                🛒 Carrito {totalCarrito > 0 && `(${totalCarrito})`}
              </button>
            </>
          )}

          {!user ? (
            <button
              onClick={handleLoginClick}
              style={{
                ...styles.loginBtn,
                marginTop: "0.5rem",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 53, 0.2)";
              }}
            >
              Iniciar Sesión
            </button>
          ) : (
            <>
              <div style={{
                ...styles.userTag,
                justifyContent: "center",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}>
                👤 {userName}
              </div>
              
              <button
                onClick={() => handleNavigate("/perfil")}
                style={styles.mobileNavLink}
                onMouseEnter={(e) => {
                  e.target.style.color = "#FF6B35";
                  e.target.style.background = "rgba(255, 107, 53, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#1E293B";
                  e.target.style.background = "none";
                }}
              >
                👤 Perfil
              </button>
              
              <button
                onClick={() => handleNavigate("/configuracion")}
                style={styles.mobileNavLink}
                onMouseEnter={(e) => {
                  e.target.style.color = "#FF6B35";
                  e.target.style.background = "rgba(255, 107, 53, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#1E293B";
                  e.target.style.background = "none";
                }}
              >
                ⚙️ Configuración
              </button>
              
              <button
                onClick={handleCerrarSesion}
                style={{
                  ...styles.loginBtn,
                  marginTop: "0.5rem",
                  width: "100%",
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.2)";
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