import React, { useState } from "react";

// Componente LoginModal
function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    console.log("Login:", { email, password, rememberMe });
    // Aquí iría tu lógica de autenticación
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
    // Aquí iría tu lógica de Google OAuth
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(8px);
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .modal-box {
          background: linear-gradient(135deg, #fffdf7 0%, #faf7ef 100%);
          width: 420px;
          max-width: 90%;
          padding: 40px 35px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(58, 90, 64, 0.3);
          position: relative;
          animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          font-family: "Comfortaa", sans-serif;
          border: 2px solid rgba(107, 142, 78, 0.15);
        }

        .close-btn {
          position: absolute;
          right: 20px;
          top: 20px;
          width: 36px;
          height: 36px;
          font-size: 24px;
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: #3a5a40;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .close-btn:hover {
          background: #e74c3c;
          color: white;
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .modal-logo {
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #6b8e4e 0%, #5a7a3d 100%);
          border-radius: 50%;
          box-shadow: 0 8px 20px rgba(107, 142, 78, 0.3);
        }

        .logo-icon {
          font-size: 70px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .modal-title {
          text-align: center;
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 700;
          color: #3a5a40;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .modal-subtitle {
          text-align: center;
          font-size: 14px;
          color: #6b8e4e;
          margin-bottom: 25px;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #3a5a40;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          padding-right: 45px;
          border-radius: 12px;
          border: 2px solid #e0ddd0;
          background: white;
          font-family: "Comfortaa", sans-serif;
          font-size: 14px;
          transition: all 0.3s ease;
          color: #333;
          box-sizing: border-box;
        }

        .input-field:focus {
          outline: none;
          border-color: #6b8e4e;
          box-shadow: 0 0 0 3px rgba(107, 142, 78, 0.1);
          transform: translateY(-2px);
        }

        .input-field::placeholder {
          color: #aaa;
        }

        .input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #6b8e4e;
        }

        .toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b8e4e;
          transition: all 0.3s ease;
          padding: 5px;
        }

        .toggle-password:hover {
          transform: translateY(-50%) scale(1.2);
        }

        .options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0 25px;
          font-size: 13px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #3a5a40;
          font-weight: 500;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #6b8e4e;
        }

        .forgot-btn {
          border: none;
          background: none;
          color: #d48f27;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .forgot-btn:hover {
          color: #b87520;
          text-decoration: underline;
        }

        .login-btn-modal {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6b8e4e 0%, #5a7a3d 100%);
          border: none;
          color: white;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Comfortaa", sans-serif;
          box-shadow: 0 6px 20px rgba(107, 142, 78, 0.3);
        }

        .login-btn-modal:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(107, 142, 78, 0.4);
          background: linear-gradient(135deg, #5a7a3d 0%, #4a6a2d 100%);
        }

        .login-btn-modal:active {
          transform: translateY(-1px);
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 25px 0;
          color: #999;
          font-size: 13px;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ddd, transparent);
        }

        .divider span {
          padding: 0 15px;
          font-weight: 500;
        }

        .google-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid #e0ddd0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Comfortaa", sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .google-btn:hover {
          border-color: #6b8e4e;
          background: #f9f9f9;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .google-btn img {
          width: 24px;
          height: 24px;
        }

        .create-account {
          margin-top: 25px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .create-btn {
          background: none;
          border: none;
          color: #d48f27;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          text-decoration: underline;
          text-decoration-color: transparent;
        }

        .create-btn:hover {
          color: #b87520;
          text-decoration-color: #b87520;
        }

        @media (max-width: 480px) {
          .modal-box {
            padding: 30px 25px;
            width: 95%;
          }

          .modal-logo {
            width: 110px;
            height: 110px;
          }

          .logo-icon {
            font-size: 55px;
          }

          .modal-title {
            font-size: 24px;
          }

          .modal-subtitle {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>

          <div className="modal-logo">
            <div className="logo-icon">🛒</div>
          </div>

          <h2 className="modal-title">Mercado Local-IA</h2>
          <p className="modal-subtitle">Bienvenido de vuelta</p>

          <div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="input-field"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="input-icon">📧</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar contraseña"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Recuérdame
              </label>
              <button className="forgot-btn" onClick={() => console.log("Forgot password")}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button className="login-btn-modal" onClick={handleSubmit}>
              Iniciar sesión
            </button>
          </div>

          <div className="divider">
            <span>o continúa con</span>
          </div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
            />
            Iniciar sesión con Google
          </button>

          <div className="create-account">
            ¿No tienes cuenta?{" "}
            <button className="create-btn" onClick={() => console.log("Crear cuenta")}>
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente Navbar
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
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
        </div>
      )}

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}