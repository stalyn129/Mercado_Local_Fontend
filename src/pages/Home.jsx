import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeBadge, setActiveBadge] = useState(0);
  
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animación para los badges
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBadge(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/productos/top") 
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("❌ Error cargando productos:", err);
        setLoading(false);
      });
  }, []);

  // FUNCIÓN PARA REDIRIGIR A EXPLORAR
  const irAExplorar = () => {
    window.location.href = `/explorar`;
  };

  // FUNCIÓN PARA BUSCAR POR CATEGORÍA/ETIQUETA
  const buscarPorCategoria = (categoria) => {
    window.location.href = `/explorar?q=${encodeURIComponent(categoria)}`;
  };

  const demoImages = [
    "https://i.imgur.com/2XzQmK5.jpeg",
    "https://i.imgur.com/81nqHKl.jpeg",
    "https://i.imgur.com/8pQ9o5Z.jpeg",
    "https://i.imgur.com/kWq2b4U.jpeg",
    "https://i.imgur.com/YeRXJ7P.jpeg",
    "https://i.imgur.com/WYo05oG.jpeg",
  ];

  // ==================== ESTILOS ====================

  const homeStyle = {
    background: "linear-gradient(180deg, #F9FBF7 0%, #F0F7F0 100%)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflowX: "hidden",
  };

  // HERO SECTION MÁS COMPACTO
  const heroStyle = {
    padding: "40px 20px 50px",
    position: "relative",
    minHeight: "50vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  // Fondo animado - REDUCIDO
  const heroBackgroundStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "0.6rem",
    padding: "1rem",
    opacity: "0.15",
    transform: `translateY(${scrollY * 0.15}px) scale(1.03)`,
    transition: "transform 0.1s ease-out",
    zIndex: "1",
  };

  const heroContentStyle = {
    position: "relative",
    zIndex: "20",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    maxWidth: "750px",
    width: "100%",
    animation: "fadeInUp 0.8s ease-out 0.2s both",
  };

  // Título con mejor jerarquía - REDUCIDO
  const titleContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
    marginBottom: "0.3rem",
  };

  const mainTitleStyle = {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: "2.8rem",
    fontWeight: "900",
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 25%, #2ECC71 50%, #3498DB 75%, #9B59B6 100%)",
    backgroundSize: "300% 300%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: "0",
    letterSpacing: "-0.8px",
    lineHeight: "1",
    animation: "gradientShift 8s ease infinite",
  };

  const subtitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.2rem",
    color: "#64748B",
    fontWeight: "400",
    marginBottom: "0.3rem",
    maxWidth: "550px",
    lineHeight: "1.4",
  };

  const marketLocalStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1rem",
    color: "#FF6B35",
    fontWeight: "700",
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    padding: "5px 14px",
    borderRadius: "18px",
    display: "inline-block",
    marginBottom: "0.3rem",
    letterSpacing: "0.4px",
  };

  // Contenedor de texto balanceado - REDUCIDO
  const textContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    maxWidth: "600px",
    marginBottom: "1rem",
  };

  // Badges en una línea con mejor diseño - REDUCIDOS
  const badgesStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  };

  const badgeStyle = (index) => ({
    background: index === activeBadge 
      ? "linear-gradient(135deg, #FF6B35, #FF8E53)" 
      : "rgba(255, 255, 255, 0.95)",
    color: index === activeBadge ? "white" : "#1E293B",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: index === activeBadge 
      ? "0 4px 15px rgba(255, 107, 53, 0.3)" 
      : "0 3px 10px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    animation: index === activeBadge ? "pulse 2s infinite" : "none",
    border: index === activeBadge ? "none" : "1px solid rgba(255, 107, 53, 0.1)",
    cursor: "pointer",
    fontFamily: "'Playfair Display', serif",
  });

  // BOTÓN PRINCIPAL - MÁS COMPACTO
  const mainButtonStyle = {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
    color: "white",
    border: "none",
    padding: "14px 32px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "1.1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)",
    animation: "pulse 2s infinite",
    marginTop: "0.8rem",
    fontFamily: "'Playfair Display', serif",
  };

  const gridContainerStyle = {
    padding: "3rem 2rem 2.5rem",
    maxWidth: "1400px",
    margin: "0 auto",
    flex: "1",
    position: "relative",
    zIndex: 1,
    width: "100%",
  };

  const gridTitleStyle = {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: "2rem",
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    margin: "0 0 0.4rem 0",
    background: "linear-gradient(90deg, #FF6B35, #2ECC71)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const gridSubtitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "0.95rem",
    color: "#64748B",
    textAlign: "center",
    marginBottom: "2.5rem",
    fontWeight: "400",
    maxWidth: "550px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  // CORRECCIÓN PRINCIPAL: Cambiado el grid para mostrar 4 columnas fijas en desktop
  const productGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)", // 4 columnas fijas en desktop
    gap: "1.8rem",
    position: "relative",
    width: "100%",
    justifyContent: "center",
    alignItems: "stretch",
  };

  const gridItemStyle = (index) => ({
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    cursor: "pointer",
    position: "relative",
    backgroundColor: "#fff",
    border: "1px solid #F1F5F9",
    animation: `cardReveal 0.6s ease-out ${index * 0.08}s forwards`,
    opacity: 0,
    transform: "scale(0.95)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: "350px",
  });

  const gridItemHoverStyle = {
    transform: "translateY(-10px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(255, 107, 53, 0.2)",
    border: "1px solid #FF6B35",
  };

  const imageWrapperStyle = {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
    height: "200px",
    flexShrink: 0,
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  const imageBadgeStyle = {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "0.8rem",
    fontWeight: "700",
    opacity: 0,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(255, 107, 53, 0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transform: "translateY(-10px)",
    fontFamily: "'Playfair Display', serif",
  };

  const LoadingSkeleton = () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: windowWidth > 1200 ? "repeat(4, 1fr)" : 
                          windowWidth > 768 ? "repeat(3, 1fr)" : 
                          windowWidth > 480 ? "repeat(2, 1fr)" : "1fr",
      gap: "1.8rem",
      padding: "1.5rem 0",
      width: "100%",
    }}>
      {[...Array(windowWidth > 1200 ? 8 : windowWidth > 768 ? 6 : windowWidth > 480 ? 4 : 2)].map((_, i) => (
        <div key={i} style={{
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#F1F5F9",
          height: "350px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(90deg, #F1F5F9 25%, #F8FAFC 50%, #F1F5F9 75%)",
            backgroundSize: "200% 100%",
            animation: `shimmer 1.5s infinite`,
          }}></div>
        </div>
      ))}
    </div>
  );

  // Función para obtener el grid responsive
  const getResponsiveGridStyle = () => {
    if (windowWidth > 1200) {
      return {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)", // 4 columnas en desktop grande
        gap: "1.8rem",
        width: "100%",
      };
    } else if (windowWidth > 768) {
      return {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", // 3 columnas en tablet
        gap: "1.5rem",
        width: "100%",
      };
    } else if (windowWidth > 480) {
      return {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)", // 2 columnas en mobile grande
        gap: "1.2rem",
        width: "100%",
      };
    } else {
      return {
        display: "grid",
        gridTemplateColumns: "1fr", // 1 columna en mobile pequeño
        gap: "1rem",
        width: "100%",
      };
    }
  };

  // Obtener productos para mostrar (reales o demo)
  const productosAMostrar = productos.length > 0 ? productos : 
    Array(8).fill(null).map((_, i) => ({
      idProducto: i,
      imagenProducto: demoImages[i % demoImages.length],
      nombreProducto: `Producto Premium ${i + 1}`,
      precioProducto: (15.99 + i).toFixed(2),
      stockProducto: Math.floor(Math.random() * 100),
      descripcionProducto: "Producto de la más alta calidad, cultivado con técnicas sostenibles.",
      nombreVendedor: "Granja Orgánica Local",
      nombreCategoria: ["Premium", "Orgánico", "Local", "Fresco"][i % 4],
      unidadMedida: ["kg", "lb", "unidad", "caja"][i % 4]
    }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(180deg, #F9FBF7 0%, #F0F7F0 100%);
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        /* Aplicar Playfair Display a elementos principales */
        .main-title,
        .market-local,
        .subtitle,
        .grid-title,
        .grid-subtitle,
        .main-button,
        .badge,
        .image-badge,
        .modal-title,
        .modal-section-title {
          font-family: 'Playfair Display', Georgia, serif !important;
        }

        /* Animaciones principales */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.95) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.95;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Animaciones para el modal */
        @keyframes pulsePrice {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes modalShimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        /* Animaciones para los círculos decorativos */
        @keyframes floatCircle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.03);
          }
        }

        /* Efectos interactivos */
        .main-button:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 25px rgba(255, 107, 53, 0.5) !important;
        }

        .grid-item:hover .grid-image {
          transform: scale(1.1);
        }

        .grid-item:hover .image-badge {
          opacity: 1;
          transform: translateY(0);
        }

        .grid-item:hover .product-price {
          color: #FF6B35;
        }

        .badge:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 15px rgba(255, 107, 53, 0.4) !important;
        }

        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #FF6B35, #FF8E53);
          border-radius: 4px;
        }

        /* Responsive Styles - MEJORADO */
        @media (min-width: 1400px) {
          .product-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        @media (max-width: 1200px) {
          .hero-section {
            padding: 35px 20px 45px !important;
            min-height: 45vh !important;
          }

          .main-title {
            font-size: 2.4rem !important;
          }

          .subtitle {
            font-size: 1.1rem !important;
          }

          .grid-container {
            padding: 2.5rem 2rem 2rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 30px 16px 40px !important;
            min-height: 40vh !important;
          }

          .main-title {
            font-size: 2rem !important;
          }

          .subtitle {
            font-size: 1rem !important;
          }

          .market-local {
            font-size: 0.9rem !important;
          }

          .hero-background {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 0.5rem !important;
            padding: 0.8rem !important;
            opacity: 0.12 !important;
          }

          .badges-container {
            gap: 0.8rem !important;
          }

          .badge {
            padding: 6px 12px !important;
            font-size: 0.8rem !important;
          }

          .main-button {
            padding: 12px 24px !important;
            font-size: 1rem !important;
          }

          .grid-container {
            padding: 2rem 1.5rem 1.5rem !important;
          }

          .grid-title {
            font-size: 1.6rem !important;
          }

          .grid-subtitle {
            font-size: 0.85rem !important;
            margin-bottom: 2rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.2rem !important;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 25px 12px 35px !important;
            min-height: 35vh !important;
          }

          .main-title {
            font-size: 1.7rem !important;
          }

          .subtitle {
            fontSize: 0.9rem !important;
          }

          .market-local {
            font-size: 0.8rem !important;
          }

          .hero-background {
            grid-templateColumns: repeat(3, 1fr) !important;
            gap: 0.3rem !important;
            opacity: 0.1 !important;
          }

          .badges-container {
            flex-direction: column;
            align-items: center;
            gap: 0.6rem !important;
          }

          .badge {
            width: 100%;
            max-width: 200px;
            justify-content: center;
            padding: 8px 16px !important;
          }

          .main-button {
            padding: 10px 20px !important;
            fontSize: 0.95rem !important;
          }

          .grid-container {
            padding: 1.5rem 1rem 1.5rem !important;
          }

          .grid-title {
            font-size: 1.4rem !important;
          }

          .grid-subtitle {
            fontSize: 0.8rem !important;
            margin-bottom: 1.5rem !important;
          }

          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .grid-item {
            min-height: 320px !important;
          }

          .image-wrapper {
            height: 180px !important;
          }
        }
      `}</style>

      <div style={homeStyle}>
        {/* HERO SECTION MÁS COMPACTO */}
        <div style={heroStyle} className="hero-section">
          {/* Fondo con imágenes animadas - REDUCIDO */}
          <div style={heroBackgroundStyle} className="hero-background">
            {(productos.length > 0 ? productos.slice(0, 18) : demoImages.concat(demoImages).slice(0, 18)).map((item, i) => {
              const imgSrc = productos.length > 0 ? item.imagenProducto : item;
              return (
                <div
                  key={`bg-${i}`}
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    height: "90px",
                    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                >
                  <img
                    src={imgSrc}
                    alt="fondo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "saturate(0.7) brightness(0.9)",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* CONTENIDO PRINCIPAL - MÁS COMPACTO */}
          <div style={heroContentStyle}>
            {/* TÍTULO PRINCIPAL - REDUCIDO */}
            <div style={titleContainerStyle}>
              <h1 style={mainTitleStyle} className="main-title">
                My Harvest
              </h1>
              <div style={marketLocalStyle} className="market-local">
                mercado local IA
              </div>
              <p style={subtitleStyle} className="subtitle">
                Cultivando conexiones, cosechando comunidad
              </p>
            </div>
            
            {/* TEXTO DESCRIPTIVO - REDUCIDO */}
            <div style={textContainerStyle}>
              <p style={{
                fontSize: "0.95rem",
                color: "#64748B",
                lineHeight: "1.5",
                marginBottom: "0.3rem",
                maxWidth: "550px",
                fontFamily: "'Inter', sans-serif",
              }}>
                Descubre productos cultivados con pasión por agricultores locales. 
                Frescura garantizada, calidad excepcional.
              </p>
            </div>

            {/* BADGES ANIMADOS - REDUCIDOS */}
            <div style={badgesStyle} className="badges-container">
              <div 
                style={badgeStyle(0)} 
                className="badge"
                onClick={() => buscarPorCategoria("entrega rápida")}
              >
                <span style={{ fontSize: "1.1rem", animation: "bounce 2s infinite" }}>🚚</span>
                Entrega Rápida
              </div>
              <div 
                style={badgeStyle(1)} 
                className="badge"
                onClick={() => buscarPorCategoria("calidad premium")}
              >
                <span style={{ fontSize: "1.1rem", animation: "bounce 2s infinite 0.5s" }}>🌟</span>
                Calidad Premium
              </div>
              <div 
                style={badgeStyle(2)} 
                className="badge"
                onClick={() => buscarPorCategoria("fresco local")}
              >
                <span style={{ fontSize: "1.1rem", animation: "bounce 2s infinite 1s" }}>🌱</span>
                Local & Fresco
              </div>
            </div>

            {/* BOTÓN PRINCIPAL - SIN CATEGORÍAS */}
            <button
              style={mainButtonStyle}
              className="main-button"
              onClick={irAExplorar}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px) scale(1.03)";
                e.target.style.boxShadow = "0 10px 25px rgba(255, 107, 53, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.4)";
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>✨</span>
              <span>¡Explora Nuestros Productos!</span>
              <span style={{ fontSize: "1.1rem" }}>→</span>
            </button>
          </div>
        </div>

        {/* PRODUCT GRID - CORREGIDO */}
        <div style={gridContainerStyle} className="grid-container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={gridTitleStyle} className="grid-title">
              Productos Destacados
            </h2>
            <div style={{
              width: "50px",
              height: "2.5px",
              background: "linear-gradient(90deg, #FF6B35, #2ECC71)",
              margin: "0.6rem auto 0.8rem",
              borderRadius: "1.5px",
            }}></div>
            <p style={gridSubtitleStyle} className="grid-subtitle">
              Selección premium de productos frescos directamente de nuestros agricultores locales
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div style={getResponsiveGridStyle()} className="product-grid">
              {/* Mostrar productos reales o demo */}
              {productosAMostrar.map((p, i) => (
                <div
                  key={p.idProducto}
                  style={
                    hoveredIndex === i
                      ? { ...gridItemStyle(i), ...gridItemHoverStyle }
                      : gridItemStyle(i)
                  }
                  className="grid-item"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedProduct(p)}
                >
                  <div style={imageWrapperStyle} className="image-wrapper">
                    <img
                      src={p.imagenProducto}
                      alt={p.nombreProducto}
                      style={imageStyle}
                      className="grid-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x300/F8FAFC/64748B?text=Producto+Fresco";
                      }}
                    />
                    <div style={imageBadgeStyle} className="image-badge">
                      {p.stockProducto > 0 ? "🟢 Disponible" : "🔴 Agotado"}
                    </div>
                  </div>
                  <div style={{ 
                    padding: "20px", 
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      color: "#1E293B",
                      marginBottom: "8px",
                      lineHeight: "1.3",
                      minHeight: "2.6rem",
                    }}>
                      {p.nombreProducto}
                    </h3>
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      color: "#64748B",
                      marginBottom: "12px",
                      lineHeight: "1.4",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {p.descripcionProducto || "Producto fresco de calidad local, cultivado con técnicas sostenibles."}
                    </p>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                    }}>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                      }}>
                        <span style={{
                          fontSize: "1.2rem",
                          fontWeight: "800",
                          color: "#FF6B35",
                          transition: "all 0.3s ease",
                        }} className="product-price">
                          ${parseFloat(p.precioProducto).toFixed(2)}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          color: "#94A3B8",
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          por {p.unidadMedida || "unidad"}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.8rem",
                        color: p.stockProducto > 0 ? "#10B981" : "#EF4444",
                        fontWeight: "600",
                        backgroundColor: p.stockProducto > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontFamily: "'Inter', sans-serif",
                        whiteSpace: "nowrap",
                      }}>
                        {p.stockProducto > 0 ? `${p.stockProducto} uds` : "Agotado"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón para cargar más productos si es necesario */}
          {productos.length > 0 && productos.length % 8 === 0 && (
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <button
                style={{
                  background: "transparent",
                  color: "#FF6B35",
                  border: "2px solid #FF6B35",
                  padding: "12px 28px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Playfair Display', serif",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#FF6B35";
                  e.target.style.color = "white";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#FF6B35";
                  e.target.style.transform = "translateY(0)";
                }}
                onClick={irAExplorar}
              >
                Ver más productos →
              </button>
            </div>
          )}
        </div>

        {/* MODAL DE PRODUCTO (mantenido igual) */}
        {selectedProduct && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.92)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.3s ease",
            overflow: "hidden",
          }} onClick={() => setSelectedProduct(null)}>
            
            {/* Efectos de fondo sutiles */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.12) 0%, transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(46, 204, 113, 0.12) 0%, transparent 40%)
              `,
              zIndex: -1,
            }}></div>
            
            {/* Círculos decorativos sutiles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: `${Math.random() * 30 + 15}px`,
                  height: `${Math.random() * 30 + 15}px`,
                  background: `radial-gradient(circle, 
                    rgba(${Math.random() > 0.5 ? '255, 107, 53' : '46, 204, 113'}, ${Math.random() * 0.08 + 0.05}), 
                    transparent 70%)`,
                  borderRadius: "50%",
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  filter: "blur(4px)",
                  animation: `floatCircle ${Math.random() * 8 + 8}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  zIndex: -1,
                }}
              />
            ))}

            <div
              style={{
                position: "relative",
                maxWidth: "850px",
                width: "100%",
                maxHeight: "85vh",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: `
                  0 20px 40px -12px rgba(0, 0, 0, 0.5),
                  0 0 0 1px rgba(255, 255, 255, 0.05),
                  0 0 40px rgba(255, 107, 53, 0.2)
                `,
                animation: "modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                background: "linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >

              {/* Botón cerrar */}
              <button
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "linear-gradient(135deg, rgba(255, 107, 53, 0.95), rgba(255, 142, 83, 0.95))",
                  border: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 16px rgba(255, 107, 53, 0.4)",
                  zIndex: 2001,
                  fontWeight: "bold",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.12) rotate(90deg)";
                  e.currentTarget.style.boxShadow = "0 8px 22px rgba(255, 107, 53, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 107, 53, 0.4)";
                }}
                onClick={() => setSelectedProduct(null)}
              >
                ✕
              </button>

              {/* Contenido del modal */}
              <div style={{
                display: "flex",
                width: "100%",
                height: "100%",
                flexDirection: window.innerWidth <= 768 ? "column" : "row",
              }}>
                
                {/* Sección de imagen - más compacta pero elegante */}
                <div style={{
                  flex: "1",
                  background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "35px 30px",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "350px",
                }}>
                  {/* Fondo sutil */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 10% 20%, rgba(255, 107, 53, 0.05) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(46, 204, 113, 0.05) 0%, transparent 40%)
                    `,
                    zIndex: 0,
                  }}></div>
                  
                  {/* Contenedor de imagen */}
                  <div style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.9)",
                    boxShadow: `
                      inset 0 0 20px rgba(255, 255, 255, 0.8),
                      0 6px 24px rgba(0, 0, 0, 0.1)
                    `,
                    padding: "15px",
                  }}>
                    {/* Imagen principal */}
                    <img
                      src={selectedProduct.imagenProducto}
                      alt={selectedProduct.nombreProducto}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: "10px",
                        boxShadow: `
                          0 10px 30px rgba(0, 0, 0, 0.15),
                          0 4px 16px rgba(255, 107, 53, 0.12),
                          inset 0 0 0 1px rgba(255, 255, 255, 0.5)
                        `,
                        transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        transform: "scale(0.96)",
                      }}
                      onLoad={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/500x400/F8FAFC/64748B?text=Producto+Fresco";
                        e.target.style.transform = "scale(1)";
                      }}
                    />
                  </div>
                  
                  {/* Badge de stock - más compacto */}
                  <div style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    background: selectedProduct.stockProducto > 0 
                      ? "linear-gradient(135deg, #10B981, #2ECC71)" 
                      : "linear-gradient(135deg, #FF4444, #FF6B35)",
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    boxShadow: selectedProduct.stockProducto > 0 
                      ? "0 4px 16px rgba(16, 185, 129, 0.25)" 
                      : "0 4px 16px rgba(255, 68, 68, 0.25)",
                    zIndex: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "85px",
                    height: "36px",
                    animation: "pulse 2s infinite",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                    fontFamily: "'Playfair Display', serif",
                  }}>
                    {selectedProduct.stockProducto > 0 ? (
                      `${selectedProduct.stockProducto} disponibles`
                    ) : (
                      "Agotado"
                    )}
                  </div>
                </div>
                
                {/* Sección de información */}
                <div style={{
                  flex: "1",
                  padding: "35px 30px",
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                  maxHeight: "85vh",
                  background: "rgba(255, 255, 255, 0.97)",
                  ...(window.innerWidth > 768 
                    ? { borderLeft: "1px solid rgba(226, 232, 240, 0.3)" }
                    : { borderTop: "1px solid rgba(226, 232, 240, 0.3)" }
                  ),
                }}>
                  <div>
                    {/* Nombre del producto */}
                    <h2 style={{
                      fontSize: "1.8rem",
                      fontWeight: "900",
                      color: "#1E293B",
                      marginBottom: "6px",
                      lineHeight: "1.2",
                      letterSpacing: "-0.3px",
                      background: "linear-gradient(90deg, #FF6B35, #2ECC71)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontFamily: "'Playfair Display', serif",
                    }} className="modal-title">
                      {selectedProduct.nombreProducto}
                    </h2>
                    
                    {/* Precio */}
                    <div style={{
                      fontSize: "2.2rem",
                      fontWeight: "900",
                      color: "#FF6B35",
                      textShadow: "0 2px 8px rgba(255, 107, 53, 0.2)",
                      animation: "pulsePrice 3s infinite",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "'Playfair Display', serif",
                    }}>
                      <span style={{ fontSize: "1.6rem", opacity: 0.8 }}>$</span>
                      {parseFloat(selectedProduct.precioProducto).toFixed(2)}
                    </div>
                    
                    {/* Unidades disponibles */}
                    <div style={{
                      fontSize: "0.95rem",
                      color: selectedProduct.stockProducto > 0 ? "#10B981" : "#EF4444",
                      fontWeight: "600",
                      marginBottom: "22px",
                      backgroundColor: selectedProduct.stockProducto > 0 
                        ? "rgba(16, 185, 129, 0.1)" 
                        : "rgba(239, 68, 68, 0.1)",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      border: selectedProduct.stockProducto > 0 
                        ? "1px solid rgba(16, 185, 129, 0.2)" 
                        : "1px solid rgba(239, 68, 68, 0.2)",
                      fontFamily: "'Playfair Display', serif",
                    }}>
                      <span style={{ fontSize: "1.1rem" }}>
                        {selectedProduct.stockProducto > 0 ? "📦" : "❌"}
                      </span>
                      <span>
                        {selectedProduct.stockProducto > 0 
                          ? `${selectedProduct.stockProducto} unidades disponibles`
                          : "Producto agotado"}
                      </span>
                    </div>
                    
                    {/* Descripción del producto */}
                    <div style={{
                      marginBottom: "25px",
                      paddingBottom: "20px",
                      borderBottom: "1px solid rgba(226, 232, 240, 0.4)",
                    }}>
                      <h3 style={{
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        color: "#1E293B",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "'Playfair Display', serif",
                      }} className="modal-section-title">
                        <span style={{
                          background: "linear-gradient(135deg, #3498DB, #9B59B6)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: "1.2rem",
                        }}>📋</span>
                        Descripción del Producto
                      </h3>
                      <p style={{
                        fontSize: "0.95rem",
                        color: "#64748B",
                        lineHeight: "1.6",
                        paddingLeft: "30px",
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {selectedProduct.descripcionProducto || "Producto fresco de calidad local, cultivado con técnicas sostenibles y respetuosas con el medio ambiente."}
                      </p>
                    </div>
                    
                    {/* Información adicional */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "15px",
                      marginBottom: "25px",
                    }}>
                      {selectedProduct.nombreVendedor && (
                        <div style={{
                          background: "rgba(248, 250, 252, 0.8)",
                          padding: "16px",
                          borderRadius: "14px",
                          border: "1px solid rgba(226, 232, 240, 0.4)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                          transition: "all 0.3s ease",
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                        }}>
                          <div style={{ 
                            color: "#64748B", 
                            fontSize: "0.85rem", 
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontFamily: "'Playfair Display', serif",
                          }}>
                            <span style={{ fontSize: "1rem" }}>👨‍🌾</span>
                            Agricultor
                          </div>
                          <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "1rem", fontFamily: "'Playfair Display', serif" }}>
                            {selectedProduct.nombreVendedor}
                          </div>
                        </div>
                      )}
                      
                      {selectedProduct.nombreCategoria && (
                        <div style={{
                          background: "rgba(248, 250, 252, 0.8)",
                          padding: "16px",
                          borderRadius: "14px",
                          border: "1px solid rgba(226, 232, 240, 0.4)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                          transition: "all 0.3s ease",
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                        }}>
                          <div style={{ 
                            color: "#64748B", 
                            fontSize: "0.85rem", 
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontFamily: "'Playfair Display', serif",
                          }}>
                            <span style={{ fontSize: "1rem" }}>🏷️</span>
                            Categoría
                          </div>
                          <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "1rem", fontFamily: "'Playfair Display', serif" }}>
                            {selectedProduct.nombreCategoria}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* BOTÓN "VER DETALLES COMPLETOS" */}
                  <button
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                      color: "white",
                      padding: "16px 28px",
                      fontWeight: "700",
                      borderRadius: "14px",
                      border: "none",
                      cursor: selectedProduct.stockProducto > 0 ? "pointer" : "not-allowed",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)",
                      transition: "all 0.3s ease",
                      marginTop: "auto",
                      opacity: selectedProduct.stockProducto > 0 ? 1 : 0.6,
                      position: "relative",
                      overflow: "hidden",
                      fontFamily: "'Playfair Display', serif",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProduct.stockProducto > 0) {
                        e.target.style.transform = "translateY(-3px)";
                        e.target.style.boxShadow = "0 12px 28px rgba(255, 107, 53, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProduct.stockProducto > 0) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.3)";
                      }
                    }}
                    onClick={() => {
                      if (selectedProduct.stockProducto > 0) {
                        window.location.href = `/producto/${selectedProduct.idProducto}`;
                      }
                    }}
                  >
                    {/* Efecto de brillo sutil */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                      animation: "modalShimmer 3s infinite",
                    }}></div>
                    
                    <span style={{ zIndex: 1 }}>
                      {selectedProduct.stockProducto > 0 ? "Ver Detalles Completos" : "Producto Agotado"}
                    </span>
                    <span style={{ fontSize: "1.2rem", zIndex: 1, opacity: 0.9 }}>→</span>
                  </button>
                  
                  {/* Nota adicional */}
                  <p style={{
                    fontSize: "0.75rem",
                    color: "#94A3B8",
                    textAlign: "center",
                    marginTop: "15px",
                    fontStyle: "italic",
                    lineHeight: "1.4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    <span style={{ 
                      color: "#10B981", 
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      <span>🚚</span> Envío en 24-48h
                    </span>
                    <span style={{ color: "#64748B" }}>•</span>
                    <span style={{ 
                      color: "#3B82F6", 
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      <span>💯</span> Calidad garantizada
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}