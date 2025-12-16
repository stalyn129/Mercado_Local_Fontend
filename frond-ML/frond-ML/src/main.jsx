import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// 🌐 Layout
import Navbar from "./components/Navbar.jsx";

// 🏠 Público
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import LoginModal from "./pages/LoginModal.jsx";
import NotFound from "./pages/NotFound.jsx";
import Perfil from "./pages/Perfil.jsx";


// 🛍️ Contexto
import { CarritoProvider } from "./context/CarritoContext.jsx";
import { FavoritosProvider } from "./context/FavoritosContext.jsx";

// =====================
// 🛡️ ADMIN
// =====================
import DashboardAdmin from "./pages/admin/DashboardAdmin.jsx";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin.jsx";
import ProductosAdmin from "./pages/admin/ProductosAdmin.jsx";
import GestionarCategorias from "./pages/admin/GestionarCategorias.jsx";
import ConfiguracionAdmin from "./pages/admin/ConfiguracionAdmin.jsx";
import LogsAdmin from "./pages/admin/LogsAdmin.jsx";
import ReportesAdmin from "./pages/admin/ReportesAdmin.jsx";

// =====================
// 🧑‍🌾 VENDEDOR
// =====================
import DashboardVendedor from "./pages/vendedor/DashboardVendedor.jsx";
import AgregarProducto from "./pages/vendedor/AgregarProducto.jsx";
import GestionarProductos from "./pages/vendedor/GestionarProductos.jsx";
import EditarProducto from "./pages/vendedor/EditarProducto.jsx";
import GestionarPedidos from "./pages/vendedor/GestionarPedidos.jsx";
import AnalisisVentas from "./pages/vendedor/AnalisisVentas.jsx";
import ResenasVendedor from "./pages/vendedor/ResenasVendedor.jsx";

// =====================
// 🛒 CONSUMIDOR
// =====================
import ExplorarProductos from "./pages/consumidor/ExplorarProductos.jsx";
import ProductoDetalles from "./pages/consumidor/ProductoDetalles.jsx";
import Carrito from "./pages/consumidor/Carrito.jsx";
import Favoritos from "./pages/consumidor/Favoritos.jsx";
import Pedido from "./pages/consumidor/Pedido.jsx";
import PedidoDetalle from "./pages/consumidor/PedidoDetalle.jsx";
//import Factura from "./pages/consumidor/Factura.jsx";

// 🎨 estilos
import "./styles/global.css";
import "./styles/colors.css";
import "./styles/fonts.css";

// =====================================
// Layout con control de Navbar
// =====================================
function LayoutRouter() {
  const location = useLocation();

  // ❌ Ocultar navbar en admin
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <FavoritosProvider>
    <CarritoProvider>
      {!hideNavbar && <Navbar />}

      <Routes>

        {/* 🌍 PUBLICO */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/LoginModal" element={<LoginModal />} />
        <Route path="/perfil" element={<Perfil />} />


        {/* 🛒 CONSUMIDOR */}
        <Route path="/explorar" element={<ExplorarProductos />} />
        <Route path="/producto/:id" element={<ProductoDetalles />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/pedido" element={<Pedido />} />
        <Route path="/pedido/:idPedido" element={<PedidoDetalle />} />
        

        {/* 🧑‍🌾 VENDEDOR */}
        <Route path="/vendedor" element={<DashboardVendedor />} />
        <Route path="/vendedor/agregar-producto" element={<AgregarProducto />} />
        <Route path="/vendedor/gestionar-productos" element={<GestionarProductos />} />
        <Route path="/vendedor/editar-producto/:id" element={<EditarProducto />} />
        <Route path="/vendedor/pedidos" element={<GestionarPedidos />} />
        <Route path="/vendedor/analisis" element={<AnalisisVentas />} />
        <Route path="/vendedor/resenas" element={<ResenasVendedor />} />

        {/* 🛡️ ADMIN */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
        <Route path="/admin/productos" element={<ProductosAdmin />} />
        <Route path="/admin/categorias" element={<GestionarCategorias />} />
        <Route path="/admin/configuracion" element={<ConfiguracionAdmin />} />
        <Route path="/admin/logs" element={<LogsAdmin />} />
        <Route path="/admin/reportes" element={<ReportesAdmin />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </CarritoProvider>
    </FavoritosProvider>
  );
}

// =====================================
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LayoutRouter />
  </BrowserRouter>
);
