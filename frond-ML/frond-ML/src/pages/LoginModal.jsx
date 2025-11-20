import { useState } from "react"
import logo from "../assets/Logo2.png"

export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión")
      }

      if (rememberMe) {
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
      } else {
        sessionStorage.setItem("authToken", data.token)
        sessionStorage.setItem("user", JSON.stringify(data.user))
      }

      onClose()
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Comfortaa:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

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

        .modal-overlay-mlai {
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
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-box-mlai {
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

        .close-btn-mlai {
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

        .close-btn-mlai:hover {
          background: #e74c3c;
          color: white;
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .modal-title-mlai {
          text-align: center;
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 700;
          color: #3a5a40;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .modal-subtitle-mlai {
          text-align: center;
          font-size: 14px;
          color: #6b8e4e;
          margin-bottom: 25px;
          font-weight: 500;
        }

        .error-message-mlai {
          background: #fee;
          border: 2px solid #fcc;
          color: #c33;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideUp 0.3s ease;
        }

        .form-group-mlai {
          margin-bottom: 18px;
        }

        .form-label-mlai {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #3a5a40;
          margin-bottom: 8px;
        }

        .input-wrapper-mlai {
          position: relative;
        }

        .input-field-mlai {
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

        .input-field-mlai:focus {
          outline: none;
          border-color: #6b8e4e;
          box-shadow: 0 0 0 3px rgba(107, 142, 78, 0.1);
          transform: translateY(-2px);
        }

        .input-field-mlai::placeholder {
          color: #aaa;
        }

        .input-icon-mlai {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #6b8e4e;
        }

        .toggle-password-mlai {
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

        .toggle-password-mlai:hover {
          transform: translateY(-50%) scale(1.2);
        }

        .options-row-mlai {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0 25px;
          font-size: 13px;
        }

        .checkbox-label-mlai {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #3a5a40;
          font-weight: 500;
        }

        .checkbox-label-mlai input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #6b8e4e;
        }

        .forgot-btn-mlai {
          border: none;
          background: none;
          color: #d48f27;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .forgot-btn-mlai:hover {
          color: #b87520;
          text-decoration: underline;
        }

        .login-btn-mlai {
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

        .login-btn-mlai:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(107, 142, 78, 0.4);
          background: linear-gradient(135deg, #5a7a3d 0%, #4a6a2d 100%);
        }

        .login-btn-mlai:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .login-btn-mlai:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider-mlai {
          display: flex;
          align-items: center;
          margin: 25px 0;
          color: #999;
          font-size: 13px;
        }

        .divider-mlai::before,
        .divider-mlai::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ddd, transparent);
        }

        .divider-mlai span {
          padding: 0 15px;
          font-weight: 500;
        }

        .google-btn-mlai {
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

        .google-btn-mlai:hover {
          border-color: #6b8e4e;
          background: #f9f9f9;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .google-btn-mlai img {
          width: 24px;
          height: 24px;
        }

        .create-account-mlai {
          margin-top: 25px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .create-btn-mlai {
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

        .create-btn-mlai:hover {
          color: #b87520;
          text-decoration-color: #b87520;
        }

        @media (max-width: 480px) {
          .modal-box-mlai {
            padding: 30px 25px;
            width: 95%;
          }

          .modal-title-mlai {
            font-size: 24px;
          }

          .modal-subtitle-mlai {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="modal-overlay-mlai" onClick={onClose}>
        <div className="modal-box-mlai" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn-mlai" onClick={onClose}>
            ✕
          </button>

          <div
            style={{
              width: "140px",
              height: "140px",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo Mercado Local-IA"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <h2 className="modal-title-mlai">Mercado Local-IA</h2>
          <p className="modal-subtitle-mlai">Bienvenido de vuelta</p>

          {error && <div className="error-message-mlai">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-mlai">
              <label className="form-label-mlai">Correo electrónico</label>
              <div className="input-wrapper-mlai">
                <input
                  type="email"
                  className="input-field-mlai"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="input-icon-mlai">📧</span>
              </div>
            </div>

            <div className="form-group-mlai">
              <label className="form-label-mlai">Contraseña</label>
              <div className="input-wrapper-mlai">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field-mlai"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-mlai"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar contraseña"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="options-row-mlai">
              <label className="checkbox-label-mlai">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Recuérdame
              </label>
              <button type="button" className="forgot-btn-mlai" onClick={() => console.log("Forgot password")}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button className="login-btn-mlai" type="submit" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="divider-mlai">
            <span>o continúa con</span>
          </div>

          <button className="google-btn-mlai" onClick={handleGoogleLogin} type="button">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
            Iniciar sesión con Google
          </button>

          <div className="create-account-mlai">
            ¿No tienes cuenta?
            <button className="create-btn-mlai" onClick={() => console.log("Crear cuenta")} type="button">
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </>
  )
}