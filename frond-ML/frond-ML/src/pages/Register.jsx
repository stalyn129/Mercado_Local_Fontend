import { useState } from "react";
import { User, Mail, Lock, Calendar, CheckCircle, AlertCircle, Eye, EyeOff, ShoppingBag, Store, CreditCard, Phone, MapPin, Building2, FileText } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    // Datos generales del usuario
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    fechaNacimiento: "",
    idRol: 3, // 3 = Consumidor, 2 = Vendedor
    
    // Campos CONSUMIDOR
    cedula: "",
    direccionConsumidor: "",
    telefonoConsumidor: "",
    
    // Campos VENDEDOR
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
    
    // Enviamos TODO el formulario al backend
    fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setMessage({ type: "success", text: "¡Registro exitoso! Bienvenido 🎉" });
          
          // Guardamos en localStorage
          if (data.token) localStorage.setItem("token", data.token);
          if (data.rol) localStorage.setItem("rol", data.rol);
          if (data.idUsuario) localStorage.setItem("idUsuario", data.idUsuario);
          
          // Limpiamos formulario
          setForm({
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
          
          // Redirigimos según el rol
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
    <div className="min-h-screen flex items-center justify-center p-4 py-12" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-green-50">Únete a nuestra comunidad</p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-5 max-h-[600px] overflow-y-auto">
          {/* Message Alert */}
          {message.text && (
            <div className={`flex items-center gap-3 p-4 rounded-lg sticky top-0 z-10 ${
              message.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* SELECTOR DE TIPO DE USUARIO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de cuenta *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange(3)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  form.idRol === 3
                    ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <ShoppingBag className="w-8 h-8" />
                <span className="font-semibold text-sm">Consumidor</span>
                <span className="text-xs text-center">Comprar productos</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleChange(2)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  form.idRol === 2
                    ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <Store className="w-8 h-8" />
                <span className="font-semibold text-sm">Vendedor</span>
                <span className="text-xs text-center">Vender productos</span>
              </button>
            </div>
          </div>

          {/* DATOS GENERALES */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos personales</h3>
            
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Juan"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Correo */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de nacimiento *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={form.fechaNacimiento}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS DE CONSUMIDOR */}
          {form.idRol === 3 && (
            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                Información de consumidor
              </h3>
              
              {/* Cédula */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cédula *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="cedula"
                    value={form.cedula}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="0102030405"
                    required
                  />
                </div>
              </div>

              {/* Dirección Consumidor */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="direccionConsumidor"
                    value={form.direccionConsumidor}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Dirección del domicilio"
                    required
                  />
                </div>
              </div>

              {/* Teléfono Consumidor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="telefonoConsumidor"
                    value={form.telefonoConsumidor}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="0999999999"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS DE VENDEDOR */}
          {form.idRol === 2 && (
            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-green-600" />
                Información del negocio
              </h3>
              
              {/* Nombre Empresa */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del negocio *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nombreEmpresa"
                    value={form.nombreEmpresa}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Frutas Don Pepe"
                    required
                  />
                </div>
              </div>

              {/* RUC */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">RUC *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="rucEmpresa"
                    value={form.rucEmpresa}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="1102345678001"
                    required
                  />
                </div>
              </div>

              {/* Dirección Empresa */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección del negocio *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="direccionEmpresa"
                    value={form.direccionEmpresa}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="Mercado Central, Local 12"
                    required
                  />
                </div>
              </div>

              {/* Teléfono Empresa */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono del negocio *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="telefonoEmpresa"
                    value={form.telefonoEmpresa}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="0987654321"
                    required
                  />
                </div>
              </div>

              {/* Descripción Empresa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción del negocio</label>
                <textarea
                  name="descripcionEmpresa"
                  value={form.descripcionEmpresa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                  placeholder="Venta de verduras frescas y productos orgánicos..."
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* Botón de Registro */}
          <button
            onClick={registrar}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none sticky bottom-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Registrando...
              </span>
            ) : (
              "Registrarse"
            )}
          </button>

          {/* Link Login */}
          <p className="text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}