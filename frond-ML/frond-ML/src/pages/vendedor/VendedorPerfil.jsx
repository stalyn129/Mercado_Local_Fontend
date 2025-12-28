import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCarrito } from "../../context/CarritoContext.jsx";
import StarRating from "../../components/StarRating.jsx";
import Footer from "../../components/Footer.jsx";

export default function VendedorPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarCarrito } = useCarrito();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [vendedor, setVendedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===================== CARGAR PERFIL =====================
  useEffect(() => {
    if (!id) {
      setError("ID de vendedor inválido");
      setLoading(false);
      return;
    }

    const cargarPerfil = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/vendedores/${id}`);
        if (!res.ok) throw new Error("Error cargando vendedor");

        const data = await res.json();

        setVendedor({
          idVendedor: data.idVendedor,
          nombreEmpresa: data.nombreEmpresa,
          nombre: data.nombreVendedor,
          apellido: data.apellidoVendedor,
          direccion: data.direccion,
          telefono: data.telefono,
          calificacionPromedio: data.calificacionPromedio
        });

        setProductos(data.productos || []);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el perfil del vendedor");
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [id]);

  // ===================== AGREGAR AL CARRITO =====================
  const handleAgregarCarrito = (producto) => {
    const usuario = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!usuario || !token) {
      alert("⚠️ Debes iniciar sesión para agregar productos");
      navigate("/login");
      return;
    }

    agregarCarrito({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto,
      imagenProducto: producto.imagenProducto,
      cantidad: 1,
      idVendedor: producto.idVendedor,
      nombreEmpresa: vendedor.nombreEmpresa
    });
  };

  // ===================== ESTADOS =====================
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.btnBack} onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  // ===================== CALIFICACIÓN PROMEDIO =====================
  const promedioGeneral =
    productos.length > 0
      ? (
          productos.reduce(
            (acc, p) => acc + (p.promedioValoracion || 0),
            0
          ) / productos.length
        ).toFixed(1)
      : 0;

  return (
    <div style={styles.container}>
      {/* ================= HEADER CON PERFIL VENDEDOR ================= */}
      <div style={styles.header}>
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                {vendedor.nombreEmpresa.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div style={styles.profileInfo}>
              <h1 style={styles.companyName}>{vendedor.nombreEmpresa}</h1>
              
              <div style={styles.ratingContainer}>
                <StarRating rating={Number(promedioGeneral)} />
                <span style={styles.ratingText}>
                  {promedioGeneral} ({productos.length} {productos.length === 1 ? 'producto' : 'productos'})
                </span>
              </div>
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>👤</span>
              <div>
                <p style={styles.detailLabel}>Propietario</p>
                <p style={styles.detailValue}>
                  {vendedor.nombre} {vendedor.apellido}
                </p>
              </div>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>📍</span>
              <div>
                <p style={styles.detailLabel}>Dirección</p>
                <p style={styles.detailValue}>{vendedor.direccion}</p>
              </div>
            </div>

            <div style={styles.detailItem}>
              <span style={styles.detailIcon}>📞</span>
              <div>
                <p style={styles.detailLabel}>Teléfono</p>
                <p style={styles.detailValue}>{vendedor.telefono}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PRODUCTOS ================= */}
      <div style={styles.productsSection}>
        <h2 style={styles.productsTitle}>🥕 Productos Disponibles</h2>

        {productos.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No hay productos disponibles en este momento.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {productos.map((p) => (
              <div key={p.idProducto} style={styles.productCard}>
                <div style={styles.imageContainer}>
                  <img
                    src={p.imagenProducto}
                    alt={p.nombreProducto}
                    style={styles.image}
                    onClick={() => navigate(`/producto/${p.idProducto}`)}
                  />
                </div>

                <div style={styles.productContent}>
                  <h3 style={styles.productName}>{p.nombreProducto}</h3>

                  <div style={styles.productRating}>
                    <StarRating rating={p.promedioValoracion || 0} />
                    <span style={styles.reviewCount}>
                      ({p.totalValoraciones || 0})
                    </span>
                  </div>

                  <p style={styles.price}>${p.precioProducto}</p>

                  <button
                    style={styles.btn}
                    onClick={() => handleAgregarCarrito(p)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(90, 143, 72, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.2)";
                    }}
                  >
                    🛒 Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}

/* ===================== ESTILOS ===================== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #FFF8EA 0%, #FFF3E0 100%)",
    fontFamily: "'Poppins', sans-serif"
  },
  
  // Loading
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#FFF8EA"
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #5A8F48",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  loadingText: {
    marginTop: "20px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16px",
    color: "#6B7F69",
    fontWeight: "500"
  },
  
  // Error
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#FFF8EA",
    padding: "20px"
  },
  errorCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "400px"
  },
  errorText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16px",
    color: "#d32f2f",
    marginBottom: "24px",
    fontWeight: "500"
  },
  btnBack: {
    padding: "12px 24px",
    background: "#5A8F48",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  
  // Header
  header: {
    background: "linear-gradient(135deg, #3A5A40 0%, #2d4532 100%)",
    padding: "60px 40px",
    marginBottom: "40px"
  },
  profileCard: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(58, 90, 64, 0.2)",
    padding: "40px",
    maxWidth: "900px",
    margin: "0 auto"
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "30px"
  },
  avatarContainer: {
    flexShrink: 0
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #5A8F48, #4A7A3A)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
    boxShadow: "0 6px 20px rgba(90, 143, 72, 0.3)"
  },
  profileInfo: {
    flex: 1
  },
  companyName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px",
    fontWeight: "700",
    color: "#3A5A40",
    margin: "0 0 12px 0",
    lineHeight: "1.2"
  },
  ratingContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  ratingText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
    color: "#6B7F69",
    fontWeight: "500"
  },
  divider: {
    height: "2px",
    background: "linear-gradient(90deg, transparent, #E8F5E9, transparent)",
    margin: "30px 0"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px"
  },
  detailItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px"
  },
  detailIcon: {
    fontSize: "24px",
    marginTop: "2px"
  },
  detailLabel: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "12px",
    color: "#6B7F69",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 4px 0"
  },
  detailValue: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "15px",
    color: "#2d3748",
    fontWeight: "500",
    margin: 0
  },
  
  // Products Section
  productsSection: {
    padding: "0 40px 60px"
  },
  productsTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "32px",
    fontWeight: "700",
    color: "#3A5A40",
    marginBottom: "30px",
    textAlign: "center"
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  emptyText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16px",
    color: "#6B7F69",
    fontWeight: "400"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "30px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  productCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    height: "200px"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease"
  },
  productContent: {
    padding: "20px"
  },
  productName: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0 0 12px 0",
    lineHeight: "1.4",
    minHeight: "50px"
  },
  productRating: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px"
  },
  reviewCount: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px",
    color: "#6B7F69",
    fontWeight: "400"
  },
  price: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#5A8F48",
    margin: "0 0 16px 0"
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #5A8F48, #4A7A3A)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(90, 143, 72, 0.2)"
  }
};