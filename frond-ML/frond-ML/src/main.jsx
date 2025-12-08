import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// 🌐 Layout global
import Navbar from "./components/Navbar.jsx";

// 🏠 Home
import App from "./App.jsx";

// 🔐 Auth
import Register from "./pages/Register.jsx";
import LoginModal from "./pages/LoginModal.jsx";

// 🛡️ ADMIN (nuevo)
import DashboardAdmin from "./pages/admin/DashboardAdmin.jsx";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin.jsx";
import ProductosAdmin from "./pages/admin/ProductosAdmin.jsx";
import ConfiguracionAdmin from "./pages/admin/ConfiguracionAdmin.jsx";

// 🧑‍🌾 VENDEDOR
import DashboardVendedor from "./pages/DashboardVendedor.jsx";
import AgregarProducto from "./pages/AgregarProducto.jsx";
import GestionarProductos from "./pages/GestionarProductos.jsx";
import EditarProducto from "./pages/EditarProducto.jsx";
import GestionarPedidos from "./pages/GestionarPedidos.jsx";
import AnalisisVentas from "./pages/AnalisisVentas.jsx";
import ResenasVendedor from "./pages/ResenasVendedor.jsx";

// 🛒 CONSUMIDOR
import ExplorarProductos from "./pages/ExplorarProductos.jsx";
import ProductoDetalles from "./pages/ProductoDetalles.jsx";
import PedidoDetalle from "./pages/PedidoDetalle.jsx";
import Carrito from "./pages/Carrito.jsx";
import Favoritos from "./pages/Favoritos.jsx";

// 🛍️ Contexto global
import { CarritoProvider } from "./context/CarritoContext.jsx";

// ❌ 404
import NotFound from "./pages/NotFound.jsx";

// 🎨 Estilos globales
import "./styles/global.css";
import "./styles/colors.css";
import "./styles/fonts.css";


// =============== 👇 OCULTAR NAVBAR EN ADMIN ================
function LayoutRouter() {
  const location = useLocation();

  // Si la ruta empieza con /admin => no mostrar Navbar
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <CarritoProvider>
      {!hideNavbar && <Navbar />}

      <Routes>

        {/* 🌍 PUBLICO */}
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/loginmodal" element={<LoginModal />} />

        {/* 🛒 CONSUMIDOR */}
        <Route path="/explorar" element={<ExplorarProductos />} />
        <Route path="/producto/:id" element={<ProductoDetalles />} />
        <Route path="/pedido/:idPedido" element={<PedidoDetalle />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/favoritos" element={<Favoritos />} />

        {/* 🧑‍🌾 VENDEDOR */}
        <Route path="/vendedor" element={<DashboardVendedor />} />
        <Route path="/vendedor/agregar-producto" element={<AgregarProducto />} />
        <Route path="/vendedor/gestionar-productos" element={<GestionarProductos />} />
        <Route path="/vendedor/editar-producto/:id" element={<EditarProducto />} />
        <Route path="/vendedor/pedidos" element={<GestionarPedidos />} />
        <Route path="/vendedor/analisis" element={<AnalisisVentas />} />
        <Route path="/vendedor/resenas" element={<ResenasVendedor />} />

        {/* 🛡️ ADMIN (nuevo sistema completo) */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
        <Route path="/admin/productos" element={<ProductosAdmin />} />
        <Route path="/admin/configuracion" element={<ConfiguracionAdmin />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </CarritoProvider>
  );
}


// =============== RENDER PRINCIPAL ===============
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LayoutRouter />
  </BrowserRouter>
);
