import React, { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    },
    navLink: {
      textDecoration: "none",
      color: "#666",
      fontSize: "0.9rem",
      fontWeight: "600",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      display: "inline-block",
      padding: "0.4rem 0",
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

      .login-btn {
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
          </ul>
        </div>

        <div style={styles.rightSection} className="right-section">
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

          <a
            href="/login"
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
            Ingresar
          </a>

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
          <a
            href="/login"
            style={{ ...styles.loginBtn, textAlign: "center", marginTop: "0.5rem" }}
            onClick={() => setIsMenuOpen(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3a5a40";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#3a5a40";
            }}
          >
            Ingresar
          </a>
        </div>
      )}
    </>
  );
}