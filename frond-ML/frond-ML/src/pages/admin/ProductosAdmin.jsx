import { Package, Trash2, Eye, Pencil, RefreshCcw, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProductosAdmin() {
  const API_URL = "http://localhost:8080";

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoriaSel, setCategoriaSel] = useState("");
  const [subcategoriaSel, setSubcategoriaSel] = useState("");
  const [vendedorSel, setVendedorSel] = useState("");

  const [modalData, setModalData] = useState(null);
  const token = localStorage.getItem("token");
  

  // =================== Cargar Categorías ===================
  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    try {
      const res = await fetch(`${API_URL}/categorias`);
      const data = await res.json();
      console.log("Categorías:", data);
      setCategorias(data);
    } catch (e) {
      console.error("Error cargando categorías:", e);
    }
  }

  // =================== Cargar Subcategorías ===================
  useEffect(() => {
    if (categoriaSel) {
      cargarSubcategorias(categoriaSel);
    } else {
      setSubcategorias([]);
    }
  }, [categoriaSel]);

  async function cargarSubcategorias(idCategoria) {
    try {
      const res = await fetch(`${API_URL}/subcategorias/categoria/${idCategoria}`);
      const data = await res.json();
      console.log("Subcategorías:", data);
      setSubcategorias(data);
    } catch (e) {
      console.error("Error cargando subcategorías:", e);
    }
  }

  // =================== Cargar Vendedores ===================
  useEffect(() => {
    cargarVendedores();
  }, []);

  async function cargarVendedores() {
    try {
      const res = await fetch(`${API_URL}/vendedor/listar`);
      const data = await res.json();
      console.log("Vendedores:", data);
      setVendedores(data);
    } catch (e) {
      console.error("Error cargando vendedores:", e);
    }
  }

  // =================== Cargar Productos ===================
  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos/listar`);
      const raw = await res.text();

      console.log("STATUS:", res.status);
      console.log("RAW PRODUCTOS:", raw);

      if (!raw || raw.trim() === "") {
        console.error("⚠️ El backend devolvió una respuesta vacía.");
        setProductos([]);
        return;
      }

      const data = JSON.parse(raw);
      console.log("Productos parseados:", data);
      setProductos(data);

    } catch (e) {
      console.error("❌ Error cargando productos:", e);
    }

    setLoading(false);
  }

  // =================== FILTROS ===================
  const productosFiltrados = productos.filter(p => {
    const f1 = categoriaSel ? p.idCategoria === Number(categoriaSel) : true;
    const f2 = subcategoriaSel ? p.idSubcategoria === Number(subcategoriaSel) : true;
    const f3 = vendedorSel ? p.idVendedor === Number(vendedorSel) : true;
    return f1 && f2 && f3;
  });

  // =================== ELIMINAR ===================
  const eliminarProducto = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;

    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProductos(prev => prev.filter(p => p.idProducto !== id));
        alert("Producto eliminado");
      } else {
        alert("Error eliminando producto");
      }
    } catch (e) {
      console.error("Error eliminando:", e);
    }
  };

  // =================== LIMPIAR FILTROS ===================
  function limpiarFiltros() {
    setCategoriaSel("");
    setSubcategoriaSel("");
    setVendedorSel("");
  }

  if (loading) {
    return (
      <div style={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            display: "inline-block",
            width: "50px",
            height: "50px",
            border: "5px solid #ECF2E3",
            borderTop: "5px solid #5A8F48",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }}></div>
          <p style={{ 
            color: "#6B7F69",
            fontSize: "18px",
            fontWeight: "600",
            margin: 0
          }}>
            Cargando productos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)",
      fontFamily: "inherit"
    }}>
      {/* Contenedor Principal */}
      <div style={{ 
        maxWidth: "1600px", 
        margin: "0 auto", 
        padding: "40px 20px",
        paddingBottom: "80px"
      }}>
        
        {/* Header Section */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decoración de fondo */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
            borderRadius: "50%",
            opacity: "0.5",
            zIndex: "0"
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
            borderRadius: "50%",
            opacity: "0.1",
            zIndex: "0"
          }}></div>

          <div style={{ 
            position: "relative", 
            zIndex: "1",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ textAlign: "center" }}>
              {/* Icono decorativo */}
              <div style={{
                fontSize: "56px",
                marginBottom: "16px",
                filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
              }}>
                📦
              </div>

              {/* Título principal */}
              <h1 style={{ 
                fontSize: "42px", 
                fontWeight: "800", 
                color: "#2D3E2B",
                marginBottom: "12px",
                letterSpacing: "-0.5px",
                lineHeight: "1.2"
              }}>
                Administrar Productos
              </h1>

              {/* Subtítulo */}
              <p style={{ 
                color: "#6B7F69", 
                fontSize: "16px",
                margin: "0 0 32px 0",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: "1.6"
              }}>
                Gestiona el catálogo completo de productos orgánicos del sistema
              </p>

              {/* Botón Recargar */}
              <button
                onClick={cargarProductos}
                style={{
                  background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                  color: "white",
                  padding: "16px 40px",
                  fontWeight: "700",
                  borderRadius: "14px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 6px 20px rgba(90, 143, 72, 0.35)",
                  transition: "all 0.3s ease",
                  marginTop: "8px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 8px 24px rgba(90, 143, 72, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.35)";
                }}
              >
                <RefreshCcw style={{ width: "20px", height: "20px" }} />
                Recargar Productos
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "32px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "24px"
          }}>
            <h2 style={{ 
              fontSize: "22px",
              fontWeight: "700",
              color: "#2D3E2B",
              margin: 0
            }}>
              🔍 Filtros de Búsqueda
            </h2>
            <button
              onClick={limpiarFiltros}
              style={{
                background: "#FFF9E6",
                color: "#F5C744",
                border: "2px solid #F5C744",
                padding: "10px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#F5C744";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#FFF9E6";
                e.target.style.color = "#F5C744";
              }}
            >
              Limpiar filtros
            </button>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "20px"
          }}>
            {/* Categoría */}
            <div>
              <label style={{ 
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2D3E2B",
                marginBottom: "8px"
              }}>
                Categoría
              </label>
              <select
                value={categoriaSel}
                onChange={e => {
                  setCategoriaSel(e.target.value);
                  setSubcategoriaSel("");
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #ECF2E3",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2D3E2B",
                  fontWeight: "500",
                  outline: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => (
                  <option key={c.idCategoria} value={c.idCategoria}>
                    {c.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            <div>
              <label style={{ 
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2D3E2B",
                marginBottom: "8px"
              }}>
                Subcategoría
              </label>
              <select
                value={subcategoriaSel}
                onChange={e => setSubcategoriaSel(e.target.value)}
                disabled={!categoriaSel}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #ECF2E3",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2D3E2B",
                  fontWeight: "500",
                  outline: "none",
                  cursor: categoriaSel ? "pointer" : "not-allowed",
                  background: categoriaSel ? "white" : "#F0F4ED",
                  opacity: categoriaSel ? 1 : 0.6,
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => categoriaSel && (e.target.style.borderColor = "#5A8F48")}
                onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
              >
                <option value="">Todas las subcategorías</option>
                {subcategorias.map(sc => (
                  <option key={sc.idSubcategoria} value={sc.idSubcategoria}>
                    {sc.nombreSubcategoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendedor */}
            <div>
              <label style={{ 
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2D3E2B",
                marginBottom: "8px"
              }}>
                Vendedor
              </label>
              <select
                value={vendedorSel}
                onChange={e => setVendedorSel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #ECF2E3",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2D3E2B",
                  fontWeight: "500",
                  outline: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#5A8F48"}
                onBlur={(e) => e.target.style.borderColor = "#ECF2E3"}
              >
                <option value="">Todos los vendedores</option>
                {vendedores.map(v => (
                  <option key={v.idVendedor} value={v.idVendedor}>
                    {v.nombreEmpresa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador */}
          <div style={{
            padding: "16px 20px",
            background: "#FAFCF8",
            borderRadius: "12px",
            border: "2px solid #ECF2E3",
            fontSize: "14px",
            color: "#6B7F69",
            fontWeight: "500"
          }}>
            Mostrando <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{productosFiltrados.length}</strong> de <strong style={{ color: "#5A8F48", fontSize: "15px" }}>{productos.length}</strong> productos
          </div>
        </div>

        {/* Lista de Productos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {productosFiltrados.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "80px 20px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
              <p style={{ 
                color: "#2D3E2B", 
                fontSize: "18px",
                fontWeight: "600",
                margin: 0
              }}>
                No hay productos que coincidan con los filtros
              </p>
              <p style={{ 
                color: "#9AAA98", 
                fontSize: "15px",
                marginTop: "8px"
              }}>
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            productosFiltrados.map(p => (
              <div
                key={p.idProducto}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 2px 12px rgba(90, 143, 72, 0.08)",
                  border: "2px solid #F0F4ED",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.15)";
                  e.currentTarget.style.borderColor = "#5A8F48";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(90, 143, 72, 0.08)";
                  e.currentTarget.style.borderColor = "#F0F4ED";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  {/* Icono del producto */}
                  <div style={{
                    width: "60px",
                    height: "60px",
                    background: "linear-gradient(135deg, #ECF2E3 0%, #DDE8D0 100%)",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Package style={{ width: "30px", height: "30px", color: "#5A8F48" }} />
                  </div>

                  {/* Información del producto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#2D3E2B",
                      margin: "0 0 8px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {p.nombreProducto}
                    </h3>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "16px",
                      fontSize: "14px",
                      flexWrap: "wrap"
                    }}>
                      <span style={{
                        fontWeight: "700",
                        color: "#5A8F48",
                        fontSize: "18px"
                      }}>
                        ${Number(p.precioProducto).toFixed(2)}
                      </span>
                      <span style={{
                        background: p.stockProducto > 10 ? "#E8F5E3" : "#FFF3E0",
                        color: p.stockProducto > 10 ? "#5A8F48" : "#F5C744",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "13px",
                        fontWeight: "700"
                      }}>
                        Stock: {p.stockProducto}
                      </span>
                      {p.nombreCategoria && (
                        <span style={{ color: "#6B7F69", fontWeight: "500" }}>
                          • {p.nombreCategoria}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => setModalData(p)}
                      style={{
                        background: "#E8F5E3",
                        color: "#5A8F48",
                        border: "2px solid #5A8F48",
                        padding: "10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#5A8F48";
                        e.target.style.color = "white";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#E8F5E3";
                        e.target.style.color = "#5A8F48";
                        e.target.style.transform = "translateY(0)";
                      }}
                      title="Ver detalles"
                    >
                      <Eye style={{ width: "18px", height: "18px" }} />
                    </button>

                    <button
                      onClick={() => alert(`Editar producto ID: ${p.idProducto}`)}
                      style={{
                        background: "#FFF9E6",
                        color: "#F5C744",
                        border: "2px solid #F5C744",
                        padding: "10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#F5C744";
                        e.target.style.color = "white";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#FFF9E6";
                        e.target.style.color = "#F5C744";
                        e.target.style.transform = "translateY(0)";
                      }}
                      title="Editar"
                    >
                      <Pencil style={{ width: "18px", height: "18px" }} />
                    </button>

                    <button
                      onClick={() => eliminarProducto(p.idProducto)}
                      style={{
                        background: "#FFF0F2",
                        color: "#DA3E52",
                        border: "2px solid #DA3E52",
                        padding: "10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#DA3E52";
                        e.target.style.color = "white";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#FFF0F2";
                        e.target.style.color = "#DA3E52";
                        e.target.style.transform = "translateY(0)";
                      }}
                      title="Eliminar"
                    >
                      <Trash2 style={{ width: "18px", height: "18px" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Detalles */}
        {modalData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setModalData(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {modalData.nombreProducto}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Precio:</span>
                  <span className="text-green-600 font-bold">
                    ${Number(modalData.precioProducto).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Stock:</span>
                  <span className="text-gray-900 font-semibold">{modalData.stockProducto}</span>
                </div>
                
                {modalData.nombreCategoria && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Categoría:</span>
                    <span className="text-gray-900">{modalData.nombreCategoria}</span>
                  </div>
                )}
                
                {modalData.nombreSubcategoria && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Subcategoría:</span>
                    <span className="text-gray-900">{modalData.nombreSubcategoria}</span>
                  </div>
                )}
                
                {modalData.nombreEmpresa && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Vendedor:</span>
                    <span className="text-gray-900">{modalData.nombreEmpresa}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setModalData(null)}
                className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}