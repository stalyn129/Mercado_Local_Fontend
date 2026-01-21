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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    padding: "40px 20px 50px", // REDUCIDO: antes era 60px 20px 80px
    position: "relative",
    minHeight: "50vh", // REDUCIDO: antes era 65vh
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
    gap: "0.6rem", // REDUCIDO
    padding: "1rem", // REDUCIDO
    opacity: "0.15", // REDUCIDO
    transform: `translateY(${scrollY * 0.15}px) scale(1.03)`, // REDUCIDO
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
    gap: "1rem", // REDUCIDO: antes era 1.5rem
    maxWidth: "750px", // REDUCIDO: antes era 800px
    width: "100%",
    animation: "fadeInUp 0.8s ease-out 0.2s both",
  };

  // Título con mejor jerarquía - REDUCIDO
  const titleContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem", // REDUCIDO
    marginBottom: "0.3rem", // REDUCIDO
  };

  const mainTitleStyle = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: "2.8rem", // REDUCIDO: antes era 3.2rem
    fontWeight: "900",
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 25%, #2ECC71 50%, #3498DB 75%, #9B59B6 100%)",
    backgroundSize: "300% 300%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: "0",
    letterSpacing: "-0.8px", // REDUCIDO
    lineHeight: "1",
    animation: "gradientShift 8s ease infinite",
  };

  const subtitleStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.2rem", // REDUCIDO: antes era 1.4rem
    color: "#64748B",
    fontWeight: "400",
    marginBottom: "0.3rem", // REDUCIDO
    maxWidth: "550px", // REDUCIDO
    lineHeight: "1.4", // REDUCIDO
  };

  const marketLocalStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem", // REDUCIDO
    color: "#FF6B35",
    fontWeight: "700",
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    padding: "5px 14px", // REDUCIDO
    borderRadius: "18px", // REDUCIDO
    display: "inline-block",
    marginBottom: "0.3rem", // REDUCIDO
    letterSpacing: "0.4px", // REDUCIDO
  };

  // Contenedor de texto balanceado - REDUCIDO
  const textContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem", // REDUCIDO
    maxWidth: "600px", // REDUCIDO
    marginBottom: "1rem", // REDUCIDO
  };

  // Badges en una línea con mejor diseño - REDUCIDOS
  const badgesStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "1rem", // REDUCIDO: antes era 1.5rem
    marginBottom: "1.5rem", // REDUCIDO
    flexWrap: "wrap",
  };

  const badgeStyle = (index) => ({
    background: index === activeBadge 
      ? "linear-gradient(135deg, #FF6B35, #FF8E53)" 
      : "rgba(255, 255, 255, 0.95)",
    color: index === activeBadge ? "white" : "#1E293B",
    padding: "8px 16px", // REDUCIDO
    borderRadius: "10px", // REDUCIDO
    fontSize: "0.85rem", // REDUCIDO
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px", // REDUCIDO
    boxShadow: index === activeBadge 
      ? "0 4px 15px rgba(255, 107, 53, 0.3)" 
      : "0 3px 10px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    animation: index === activeBadge ? "pulse 2s infinite" : "none",
    border: index === activeBadge ? "none" : "1px solid rgba(255, 107, 53, 0.1)",
    cursor: "pointer",
  });

  // BOTÓN PRINCIPAL - MÁS COMPACTO
  const mainButtonStyle = {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
    color: "white",
    border: "none",
    padding: "14px 32px", // REDUCIDO
    borderRadius: "14px", // REDUCIDO
    fontWeight: "700",
    fontSize: "1.1rem", // REDUCIDO
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px", // REDUCIDO
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)", // REDUCIDO
    animation: "pulse 2s infinite",
    marginTop: "0.8rem", // REDUCIDO
  };

  const gridContainerStyle = {
    padding: "3rem 2rem 2.5rem", // REDUCIDO: antes era 4rem 2rem 3rem
    maxWidth: "1400px",
    margin: "0 auto",
    flex: "1",
    position: "relative",
    zIndex: 1,
  };

  const gridTitleStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "2rem", // REDUCIDO: antes era 2.2rem
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    margin: "0 0 0.4rem 0", // REDUCIDO
    background: "linear-gradient(90deg, #FF6B35, #2ECC71)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const gridSubtitleStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.95rem", // REDUCIDO
    color: "#64748B",
    textAlign: "center",
    marginBottom: "2.5rem", // REDUCIDO: antes era 3rem
    fontWeight: "400",
    maxWidth: "550px", // REDUCIDO
    marginLeft: "auto",
    marginRight: "auto",
  };

  const productGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gridAutoRows: "auto",
    gap: "1.8rem", // REDUCIDO: antes era 2rem
    position: "relative",
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
  });

  const gridItemHoverStyle = {
    transform: "translateY(-10px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(255, 107, 53, 0.2)",
    borderColor: "#FF6B35",
  };

  const imageWrapperStyle = {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
    height: "200px",
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
  };

  const LoadingSkeleton = () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "1.8rem",
      padding: "1.5rem 0", // REDUCIDO
    }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#F1F5F9",
          height: "300px",
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
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
            transform: translateY(-6px); // REDUCIDO
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
            transform: scale(1.03); // REDUCIDO
            opacity: 0.95;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px); // REDUCIDO
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

        /* Efectos interactivos */
        .main-button:hover {
          transform: translateY(-2px) scale(1.03); // REDUCIDO
          box-shadow: 0 10px 25px rgba(255, 107, 53, 0.5) !important; // REDUCIDO
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
          box-shadow: 0 6px 15px rgba(255, 107, 53, 0.4) !important; // REDUCIDO
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

        /* Responsive Styles - ACTUALIZADO */
        @media (max-width: 1200px) {
          .hero-section {
            padding: 35px 20px 45px !important; // REDUCIDO
            min-height: 45vh !important; // REDUCIDO
          }

          .main-title {
            font-size: 2.4rem !important; // REDUCIDO
          }

          .subtitle {
            font-size: 1.1rem !important; // REDUCIDO
          }

          .grid-container {
            padding: 2.5rem 2rem 2rem !important; // REDUCIDO
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 30px 16px 40px !important; // REDUCIDO
            min-height: 40vh !important; // REDUCIDO
          }

          .main-title {
            font-size: 2rem !important; // REDUCIDO
          }

          .subtitle {
            font-size: 1rem !important; // REDUCIDO
          }

          .market-local {
            font-size: 0.9rem !important; // REDUCIDO
          }

          .hero-background {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 0.5rem !important; // REDUCIDO
            padding: 0.8rem !important; // REDUCIDO
            opacity: 0.12 !important; // REDUCIDO
          }

          .badges-container {
            gap: 0.8rem !important; // REDUCIDO
          }

          .badge {
            padding: 6px 12px !important; // REDUCIDO
            font-size: 0.8rem !important; // REDUCIDO
          }

          .main-button {
            padding: 12px 24px !important; // REDUCIDO
            font-size: 1rem !important; // REDUCIDO
          }

          .grid-container {
            padding: 2rem 1.5rem 1.5rem !important; // REDUCIDO
          }

          .grid-title {
            font-size: 1.6rem !important; // REDUCIDO
          }

          .grid-subtitle {
            font-size: 0.85rem !important; // REDUCIDO
            margin-bottom: 2rem !important; // REDUCIDO
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 25px 12px 35px !important; // REDUCIDO
            min-height: 35vh !important; // REDUCIDO
          }

          .main-title {
            font-size: 1.7rem !important; // REDUCIDO
          }

          .subtitle {
            font-size: 0.9rem !important; // REDUCIDO
          }

          .market-local {
            font-size: 0.8rem !important; // REDUCIDO
          }

          .hero-background {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.3rem !important; // REDUCIDO
            opacity: 0.1 !important; // REDUCIDO
          }

          .badges-container {
            flex-direction: column;
            align-items: center;
            gap: 0.6rem !important; // REDUCIDO
          }

          .badge {
            width: 100%;
            max-width: 200px;
            justify-content: center;
            padding: 8px 16px !important;
          }

          .main-button {
            padding: 10px 20px !important; // REDUCIDO
            font-size: 0.95rem !important; // REDUCIDO
          }

          .grid-container {
            padding: 1.5rem 1rem 1.5rem !important; // REDUCIDO
          }

          .grid-title {
            font-size: 1.4rem !important; // REDUCIDO
          }

          .grid-subtitle {
            font-size: 0.8rem !important; // REDUCIDO
            margin-bottom: 1.5rem !important; // REDUCIDO
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
                    borderRadius: "8px", // REDUCIDO
                    overflow: "hidden",
                    height: "90px", // REDUCIDO: antes era 120px
                    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)", // REDUCIDO
                    position: "relative",
                    animation: `float ${3 + (i % 3)}s ease-in-out infinite`, // REDUCIDO
                    animationDelay: `${i * 0.12}s`, // REDUCIDO
                  }}
                >
                  <img
                    src={imgSrc}
                    alt="fondo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "saturate(0.7) brightness(0.9)", // REDUCIDO
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
                fontSize: "0.95rem", // REDUCIDO
                color: "#64748B",
                lineHeight: "1.5", // REDUCIDO
                marginBottom: "0.3rem", // REDUCIDO
                maxWidth: "550px", // REDUCIDO
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

        {/* PRODUCT GRID */}
        <div style={gridContainerStyle} className="grid-container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={gridTitleStyle} className="grid-title">
              Productos Destacados
            </h2>
            <div style={{
              width: "50px", // REDUCIDO
              height: "2.5px", // REDUCIDO
              background: "linear-gradient(90deg, #FF6B35, #2ECC71)",
              margin: "0.6rem auto 0.8rem", // REDUCIDO
              borderRadius: "1.5px", // REDUCIDO
            }}></div>
            <p style={gridSubtitleStyle} className="grid-subtitle">
              Selección premium de productos frescos directamente de nuestros agricultores locales
            </p>
            
            {/* BOTÓN PARA VER TODOS LOS PRODUCTOS */}
            <button
              onClick={irAExplorar}
              style={{
                background: "linear-gradient(135deg, #2ECC71 0%, #3498DB 100%)",
                color: "white",
                border: "none",
                padding: "10px 28px", // REDUCIDO
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "0.95rem", // REDUCIDO
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px", // REDUCIDO
                transition: "all 0.3s ease",
                boxShadow: "0 5px 15px rgba(46, 204, 113, 0.3)", // REDUCIDO
                marginTop: "12px", // REDUCIDO
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 20px rgba(46, 204, 113, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 5px 15px rgba(46, 204, 113, 0.3)";
              }}
            >
              <span>Ver todos los productos</span>
              <span style={{ fontSize: "1.1rem" }}>📋</span>
            </button>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div style={productGridStyle} className="product-grid">
              {/* Si no hay productos del backend, mostrar demo */}
              {productos.length === 0 && demoImages.slice(0, 8).map((img, i) => (
                <div
                  key={i}
                  style={
                    hoveredIndex === i
                      ? { ...gridItemStyle(i), ...gridItemHoverStyle }
                      : gridItemStyle(i)
                  }
                  className="grid-item"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedProduct({
                    idProducto: i,
                    imagenProducto: img,
                    nombreProducto: `Producto Premium ${i + 1}`,
                    precioProducto: (15.99).toFixed(2),
                    stockProducto: Math.floor(Math.random() * 100),
                    descripcionProducto: "Producto de la más alta calidad, cultivado con técnicas sostenibles.",
                    nombreVendedor: "Granja Orgánica Local",
                    nombreCategoria: "Premium",
                    unidadMedida: "kg"
                  })}
                >
                  <div style={imageWrapperStyle}>
                    <img src={img} style={imageStyle} className="grid-image" alt="demo" />
                    <div style={imageBadgeStyle} className="image-badge">
                      🌟 Premium
                    </div>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      color: "#1E293B",
                      marginBottom: "8px",
                      lineHeight: "1.3",
                    }}>
                      Producto Premium {i + 1}
                    </h3>
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      color: "#64748B",
                      marginBottom: "12px",
                      lineHeight: "1.4",
                      height: "40px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      Cultivado con técnicas sostenibles y respetuosas con el medio ambiente.
                    </p>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{
                        fontSize: "1.2rem",
                        fontWeight: "800",
                        color: "#FF6B35",
                        transition: "all 0.3s ease",
                      }} className="product-price">
                        $15.99
                      </span>
                      <span style={{
                        fontSize: "0.8rem",
                        color: "#94A3B8",
                        fontWeight: "500",
                        backgroundColor: "#F1F5F9",
                        padding: "4px 10px",
                        borderRadius: "10px",
                      }}>
                        por kg
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mostrar productos reales del backend */}
              {productos.length > 0 && productos.map((p, i) => (
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
                  <div style={imageWrapperStyle}>
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
                  <div style={{ padding: "20px" }}>
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      color: "#1E293B",
                      marginBottom: "8px",
                      lineHeight: "1.3",
                    }}>
                      {p.nombreProducto}
                    </h3>
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.9rem",
                      color: "#64748B",
                      marginBottom: "12px",
                      lineHeight: "1.4",
                      height: "40px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {p.descripcionProducto || "Producto fresco de calidad local"}
                    </p>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                        fontSize: "0.8rem",
                        color: p.stockProducto > 0 ? "#10B981" : "#EF4444",
                        fontWeight: "600",
                        backgroundColor: p.stockProducto > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        padding: "4px 10px",
                        borderRadius: "10px",
                      }}>
                        {p.stockProducto > 0 ? `${p.stockProducto} uds` : "Agotado"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE PRODUCTO (igual que antes) */}
      {selectedProduct && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          animation: "fadeIn 0.3s ease",
        }} onClick={() => setSelectedProduct(null)}>
          {/* Modal content remains the same */}
          <div
            style={{
              position: "relative",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "85vh",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
              animation: "modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              background: "white",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                fontSize: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                zIndex: 2001,
                fontWeight: "bold",
                color: "#1E293B",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FF6B35";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                e.currentTarget.style.color = "#1E293B";
                e.currentTarget.style.transform = "scale(1)";
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
              {/* Sección de imagen */}
              <div style={{
                flex: "1",
                background: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px",
                minHeight: "300px",
              }}>
                <img
                  src={selectedProduct.imagenProducto}
                  alt={selectedProduct.nombreProducto}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/500x400/F8FAFC/64748B?text=Imagen+No+Disponible";
                  }}
                />
              </div>
              
              {/* Sección de información */}
              <div style={{
                flex: "1",
                padding: "30px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                maxHeight: "85vh",
              }}>
                <div>
                  <h2 style={{
                    fontSize: "1.8rem",
                    fontWeight: "800",
                    color: "#1E293B",
                    marginBottom: "10px",
                    lineHeight: "1.2",
                  }}>
                    {selectedProduct.nombreProducto}
                  </h2>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "15px",
                    flexWrap: "wrap",
                  }}>
                    <div style={{
                      fontSize: "2rem",
                      fontWeight: "900",
                      color: "#FF6B35",
                    }}>
                      ${parseFloat(selectedProduct.precioProducto).toFixed(2)}
                    </div>
                    <div style={{
                      padding: "4px 10px",
                      backgroundColor: selectedProduct.stockProducto > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      borderRadius: "8px",
                      color: selectedProduct.stockProducto > 0 ? "#10B981" : "#EF4444",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                    }}>
                      {selectedProduct.stockProducto > 0 ? `${selectedProduct.stockProducto} disponibles` : "Agotado"}
                    </div>
                  </div>
                  
                  <div style={{
                    marginBottom: "20px",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #E2E8F0",
                  }}>
                    <h3 style={{
                      fontSize: "1rem",
                      fontWeight: "700",
                      color: "#1E293B",
                      marginBottom: "8px",
                    }}>
                      Descripción
                    </h3>
                    <p style={{
                      fontSize: "0.95rem",
                      color: "#64748B",
                      lineHeight: "1.6",
                    }}>
                      {selectedProduct.descripcionProducto || "Producto fresco de calidad local."}
                    </p>
                  </div>
                  
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                    marginBottom: "25px",
                  }}>
                    {selectedProduct.nombreVendedor && (
                      <div style={{
                        background: "rgba(241, 245, 249, 0.5)",
                        padding: "12px",
                        borderRadius: "10px",
                      }}>
                        <div style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: "4px" }}>Vendedor</div>
                        <div style={{ fontWeight: "600", color: "#1E293B" }}>{selectedProduct.nombreVendedor}</div>
                      </div>
                    )}
                    {selectedProduct.nombreCategoria && (
                      <div style={{
                        background: "rgba(241, 245, 249, 0.5)",
                        padding: "12px",
                        borderRadius: "10px",
                      }}>
                        <div style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: "4px" }}>Categoría</div>
                        <div style={{ fontWeight: "600", color: "#1E293B" }}>{selectedProduct.nombreCategoria}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* BOTÓN NARANJA "VER DETALLES COMPLETOS" */}
                <button
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)",
                    color: "white",
                    padding: "14px 24px",
                    fontWeight: "700",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)",
                    transition: "all 0.3s ease",
                    marginTop: "auto",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 24px rgba(255, 107, 53, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 20px rgba(255, 107, 53, 0.3)";
                  }}
                  onClick={() => {
                    window.location.href = `/producto/${selectedProduct.idProducto}`;
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>📋</span>
                  <span>Ver Detalles Completos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}