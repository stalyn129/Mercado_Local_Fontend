import { useState } from "react";
import { User, Mail, Lock, Calendar, CheckCircle, AlertCircle, Eye, EyeOff, ShoppingBag, Store, CreditCard, Phone, MapPin, Building2, FileText, ArrowRight } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    fechaNacimiento: "",
    idRol: 3,
    cedula: "",
    direccionConsumidor: "",
    telefonoConsumidor: "",
    nombreEmpresa: "",
    rucEmpresa: "",
    direccionEmpresa: "",
    telefonoEmpresa: "",
    descripcionEmpresa: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleRoleChange = (newRole) => {
    setForm({ ...form, idRol: newRole });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const registrar = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setMessage({ type: "success", text: "¡Registro exitoso! Bienvenido 🎉" });
          
          if (data.token) localStorage.setItem("token", data.token);
          if (data.rol) localStorage.setItem("rol", data.rol);
          if (data.idUsuario) localStorage.setItem("idUsuario", data.idUsuario);
          
          setForm({
            nombre: "", apellido: "", correo: "", contrasena: "", fechaNacimiento: "", idRol: 3,
            cedula: "", direccionConsumidor: "", telefonoConsumidor: "",
            nombreEmpresa: "", rucEmpresa: "", direccionEmpresa: "", telefonoEmpresa: "", descripcionEmpresa: ""
          });
          
          setTimeout(() => {
            if (data.rol === "VENDEDOR") {
              window.location.href = "/vendedor/dashboard";
            } else {
              window.location.href = "/inicio";
            }
          }, 2000);
          
        } else {
          setMessage({ type: "error", text: data.mensaje || "Error en el registro" });
        }
      })
      .catch(error => {
        setMessage({ type: "error", text: "Error en la conexión con el servidor" });
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen p-4 py-12" style={{ background: "linear-gradient(135deg, #FFFDF7 0%, #FAF7EF 100%)" }}>
      <div className="w-full max-w-3xl mx-auto">
        {/* Header Premium */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3A5A40 0%, #6B8E4E 100%)" }}>
              <User className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: "#3A5A40", fontFamily: "Playfair Display, serif" }}>
            Crear Cuenta
          </h1>
          <p className="text-lg" style={{ color: "#666666" }}>
            Únete a nuestra comunidad de productores y consumidores locales
          </p>
        </div>

        {/* Contenedor Principal */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border" style={{ borderColor: "#E0DDD0" }}>
          <div className="p-8 md:p-10 space-y-8 max-h-[700px] overflow-y-auto custom-scrollbar">
            
            {/* Alert Message */}
            {message.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl sticky top-0 z-10 border transition-all ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800 border-green-200" 
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* SELECTOR DE TIPO DE USUARIO */}
            <div>
              <label className="block text-sm font-semibold mb-4" style={{ color: "#3A5A40" }}>
                ¿Cómo te gustaría unirte? *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange(3)}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95"
                  style={{
                    borderColor: form.idRol === 3 ? "#3A5A40" : "#E0DDD0",
                    backgroundColor: form.idRol === 3 ? "#F0F5F1" : "#FFFFFF",
                    color: form.idRol === 3 ? "#3A5A40" : "#AAAAAA"
                  }}
                >
                  <div className="p-3 rounded-xl" style={{ backgroundColor: form.idRol === 3 ? "#6B8E4E" : "#E0DDD0" }}>
                    <ShoppingBag className={`w-6 h-6 ${form.idRol === 3 ? "text-white" : "text-gray-400"}`} strokeWidth={1.5} />
                  </div>
                  <span className="font-semibold text-sm">Consumidor</span>
                  <span className="text-xs text-center opacity-75">Compra productos frescos</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRoleChange(2)}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95"
                  style={{
                    borderColor: form.idRol === 2 ? "#3A5A40" : "#E0DDD0",
                    backgroundColor: form.idRol === 2 ? "#F0F5F1" : "#FFFFFF",
                    color: form.idRol === 2 ? "#3A5A40" : "#AAAAAA"
                  }}
                >
                  <div className="p-3 rounded-xl" style={{ backgroundColor: form.idRol === 2 ? "#D48F27" : "#E0DDD0" }}>
                    <Store className={`w-6 h-6 ${form.idRol === 2 ? "text-white" : "text-gray-400"}`} strokeWidth={1.5} />
                  </div>
                  <span className="font-semibold text-sm">Vendedor</span>
                  <span className="text-xs text-center opacity-75">Vende tus productos</span>
                </button>
              </div>
            </div>

            {/* DATOS GENERALES */}
            <div className="border-t pt-8" style={{ borderColor: "#E0DDD0" }}>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: "#3A5A40", fontFamily: "Playfair Display, serif" }}>
                Información Personal
              </h3>
              
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Nombre *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all"
                      style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }}
                      onFocus={(e) => e.target.style.borderColor = "#6B8E4E"}
                      onBlur={(e) => e.target.style.borderColor = "#E0DDD0"}
                      placeholder="Juan"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Apellido *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input
                      type="text"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all"
                      style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }}
                      onFocus={(e) => e.target.style.borderColor = "#6B8E4E"}
                      onBlur={(e) => e.target.style.borderColor = "#E0DDD0"}
                      placeholder="Pérez"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Correo */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Correo electrónico *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all"
                    style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }}
                    onFocus={(e) => e.target.style.borderColor = "#6B8E4E"}
                    onBlur={(e) => e.target.style.borderColor = "#E0DDD0"}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 border-2 rounded-xl outline-none transition-all"
                    style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }}
                    onFocus={(e) => e.target.style.borderColor = "#6B8E4E"}
                    onBlur={(e) => e.target.style.borderColor = "#E0DDD0"}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                    style={{ color: "#AAAAAA" }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Fecha de nacimiento *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all"
                    style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }}
                    onFocus={(e) => e.target.style.borderColor = "#6B8E4E"}
                    onBlur={(e) => e.target.style.borderColor = "#E0DDD0"}
                    required
                  />
                </div>
              </div>
            </div>

            {/* CAMPOS CONSUMIDOR */}
            {form.idRol === 3 && (
              <div className="border-t pt-8 animate-in fade-in slide-in-from-top" style={{ borderColor: "#E0DDD0" }}>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: "#3A5A40", fontFamily: "Playfair Display, serif" }}>
                  <ShoppingBag className="w-5 h-5" style={{ color: "#6B8E4E" }} strokeWidth={1.5} />
                  Información del Consumidor
                </h3>
                
                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Cédula *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input type="text" name="cedula" value={form.cedula} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="0102030405" required />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Dirección *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input type="text" name="direccionConsumidor" value={form.direccionConsumidor} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="Dirección del domicilio" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input type="text" name="telefonoConsumidor" value={form.telefonoConsumidor} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="0999999999" required />
                  </div>
                </div>
              </div>
            )}

            {/* CAMPOS VENDEDOR */}
            {form.idRol === 2 && (
              <div className="border-t pt-8 animate-in fade-in slide-in-from-top" style={{ borderColor: "#E0DDD0" }}>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: "#3A5A40", fontFamily: "Playfair Display, serif" }}>
                  <Store className="w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                  Información del Negocio
                </h3>
                
                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Nombre del negocio *</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input type="text" name="nombreEmpresa" value={form.nombreEmpresa} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="Frutas Don Pepe" required />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>RUC *</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input type="text" name="rucEmpresa" value={form.rucEmpresa} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="1102345678001" required />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Dirección del negocio *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input type="text" name="direccionEmpresa" value={form.direccionEmpresa} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="Mercado Central, Local 12" required />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Teléfono del negocio *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "#D48F27" }} strokeWidth={1.5} />
                    <input type="text" name="telefonoEmpresa" value={form.telefonoEmpresa} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-all" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="0987654321" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#3A5A40" }}>Descripción del negocio</label>
                  <textarea name="descripcionEmpresa" value={form.descripcionEmpresa} onChange={handleChange} className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all resize-none" style={{ borderColor: "#E0DDD0", backgroundColor: "#FFFDF7" }} onFocus={(e) => e.target.style.borderColor = "#6B8E4E"} onBlur={(e) => e.target.style.borderColor = "#E0DDD0"} placeholder="Venta de verduras frescas y productos orgánicos..." rows="3" />
                </div>
              </div>
            )}

            {/* Botón de Registro */}
            <button
              onClick={registrar}
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 sticky bottom-0"
              style={{
                background: "linear-gradient(135deg, #3A5A40 0%, #6B8E4E 100%)",
                color: "#FFFDF7"
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registrando...
                </>
              ) : (
                <>
                  Registrarse
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </>
              )}
            </button>

            {/* Link Login */}
            <p className="text-center text-sm" style={{ color: "#666666" }}>
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: "#D48F27" }}>
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FAF7EF;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D48F27;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B87520;
        }
      `}</style>
    </div>
  );
}