import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Navbar from "./components/Navbar.jsx";

import Register from "./pages/Register.jsx";
import Login from "./pages/LoginModal.jsx";

import DashboardVendedor from "./pages/DashboardVendedor.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import AgregarProducto from "./pages/AgregarProducto.jsx";  // ← ✔ IMPORT CORRECTO
import GestionarProductos from "./pages/GestionarProductos.jsx";


import NotFound from "./pages/NotFound.jsx";

import "./styles/global.css";
import "./styles/colors.css";
import "./styles/fonts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* Navbar en todas las páginas */}
    <Navbar />

    <Routes>
      <Route path="/" element={<App />} />

      {/* AUTENTICACIÓN */}
      <Route path="/register" element={<Register />} />
      <Route path="/loginmodal" element={<Login />} />

      {/* DASHBOARDS */}
      <Route path="/vendedor" element={<DashboardVendedor />} />
      <Route path="/admin" element={<DashboardAdmin />} />

      {/* ✔ NUEVA RUTA DEL VENDEDOR */}
      <Route path="/vendedor/agregar-producto" element={<AgregarProducto />} />
      <Route path="/vendedor/gestionar-productos" element={<GestionarProductos />} />


      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
