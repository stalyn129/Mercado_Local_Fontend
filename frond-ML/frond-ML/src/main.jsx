import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Navbar from "./components/Navbar";

import Register from "./pages/Register";
import Login from "./pages/LoginModal";

import DashboardVendedor from "./pages/DashboardVendedor";
import DashboardAdmin from "./pages/DashboardAdmin";
import NotFound from "./pages/NotFound";

import "./styles/global.css";
import "./styles/colors.css";
import "./styles/fonts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>

    {/* Navbar siempre arriba */}
    <Navbar />

    {/* Páginas */}
    <Routes>
      <Route path="/" element={<App />} />

      <Route path="/register" element={<Register />} />
      <Route path="/loginmodal" element={<Login />} />

      <Route path="/vendedor" element={<DashboardVendedor />} />
      <Route path="/admin" element={<DashboardAdmin />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
