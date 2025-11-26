import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Navbar from "./components/Navbar.jsx";

// Auth
import Register from "./pages/Register.jsx";
import Login from "./pages/LoginModal.jsx";

// Paneles
import DashboardVendedor from "./pages/DashboardVendedor.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";

// Productos
import AgregarProducto from "./pages/AgregarProducto.jsx";
import GestionarProductos from "./pages/GestionarProductos.jsx";
import EditarProducto from "./pages/EditarProducto.jsx";   // ← IMPORTANTE

// Otros
import NotFound from "./pages/NotFound.jsx";

// Estilos
import "./styles/global.css";
import "./styles/colors.css";
import "./styles/fonts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Navbar />

    <Routes>
      <Route path="/" element={<App />} />

      {/* AUTENTICACIÓN */}
      <Route path="/register" element={<Register />} />
      <Route path="/loginmodal" element={<Login />} />

      {/* VENDEDOR */}
      <Route path="/vendedor" element={<DashboardVendedor />} />
      <Route path="/vendedor/agregar-producto" element={<AgregarProducto />} />
      <Route path="/vendedor/gestionar-productos" element={<GestionarProductos />} />
      <Route path="/vendedor/editar-producto/:id" element={<EditarProducto />} /> {/* 👈 YA FUNCIONA */}

      {/* ADMIN */}
      <Route path="/admin" element={<DashboardAdmin />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
