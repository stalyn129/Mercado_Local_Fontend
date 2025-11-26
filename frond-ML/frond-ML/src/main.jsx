import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout principal
import Navbar from "./components/Navbar.jsx";

// Página inicial
import App from "./App.jsx";

// Autenticación
import Register from "./pages/Register.jsx";
import Login from "./pages/LoginModal.jsx";

// Panel Vendedor
import DashboardVendedor from "./pages/DashboardVendedor.jsx";
import AgregarProducto from "./pages/AgregarProducto.jsx";
import GestionarProductos from "./pages/GestionarProductos.jsx";
import EditarProducto from "./pages/EditarProducto.jsx";
import GestionarPedidos from "./pages/GestionarPedidos.jsx";  
import AnalisisVentas from "./pages/AnalisisVentas.jsx";
import ResenasVendedor from "./pages/ResenasVendedor.jsx";


// Admin
import DashboardAdmin from "./pages/DashboardAdmin.jsx";

// Error 404
import NotFound from "./pages/NotFound.jsx";

// Estilos globales
import "./styles/global.css";
import "./styles/colors.css";
import "./styles/fonts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Navbar />

    <Routes>
      {/* Public */}
      <Route path="/" element={<App />} />
      <Route path="/register" element={<Register />} />
      <Route path="/loginmodal" element={<Login />} />

      {/* Panel Vendedor */}
      <Route path="/vendedor" element={<DashboardVendedor />} />
      <Route path="/vendedor/agregar-producto" element={<AgregarProducto />} />
      <Route path="/vendedor/gestionar-productos" element={<GestionarProductos />} />
      <Route path="/vendedor/editar-producto/:id" element={<EditarProducto />} />
      <Route path="/vendedor/pedidos" element={<GestionarPedidos />} />  
      <Route path="/vendedor/analisis" element={<AnalisisVentas />} />
      <Route path="/vendedor/resenas" element={<ResenasVendedor />} />


      {/* Panel Admin */}
      <Route path="/admin" element={<DashboardAdmin />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
