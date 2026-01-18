// src/pages/admin/ConfiguracionAdmin.jsx
import { Settings } from "lucide-react";

export default function ConfiguracionAdmin() {
  return (
    <div className="admin-page">
      <h1 className="admin-title">⚙ Configuración del Sistema</h1>

      {/* Seguridad */}
      <div className="admin-block">
        <h2><Settings size={22}/> Seguridad & Roles</h2>
        <ul>
          <li>Configurar expiración del token JWT</li>
          <li>Gestionar roles y permisos</li>
          <li>Activar / desactivar usuarios</li>
          <li>Ver sesiones activas</li>
        </ul>
      </div>

      {/* Parámetros */}
      <div className="admin-block">
        <h2>⚙ Parámetros Generales</h2>
        <ul>
          <li>Actualizar nombre y branding del sistema</li>
          <li>Configurar comisiones de venta</li>
          <li>Definir límites de productos por vendedor</li>
        </ul>
      </div>

      {/* Auditoría */}
      <div className="admin-block">
        <h2>🗄 Auditoría & Respaldos</h2>
        <ul>
          <li>Exportar logs del sistema</li>
          <li>Generar respaldo de base de datos</li>
          <li>Restaurar datos del sistema</li>
        </ul>
      </div>

      {/* UI */}
      <div className="admin-block">
        <h2>🎨 Personalización</h2>
        <ul>
          <li>Cambiar colores del tema</li>
          <li>Modo claro/oscuro</li>
          <li>Actualizar logos del sistema</li>
        </ul>
      </div>
    </div>
  );
}

