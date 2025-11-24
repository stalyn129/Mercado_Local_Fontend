import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

   const demoImages = [
    "https://i.imgur.com/2XzQmK5.jpeg",
    "https://i.imgur.com/81nqHKl.jpeg",
    "https://i.imgur.com/8pQ9o5Z.jpeg",
    "https://i.imgur.com/kWq2b4U.jpeg",
    "https://i.imgur.com/YeRXJ7P.jpeg",
    "https://i.imgur.com/WYo05oG.jpeg",
    "https://i.imgur.com/2XzQmK5.jpeg",
    "https://i.imgur.com/81nqHKl.jpeg",
    "https://i.imgur.com/8pQ9o5Z.jpeg",
    "https://i.imgur.com/kWq2b4U.jpeg",
    "https://i.imgur.com/YeRXJ7P.jpeg",
    "https://i.imgur.com/WYo05oG.jpeg",
    "https://i.imgur.com/2XzQmK5.jpeg",
    "https://i.imgur.com/81nqHKl.jpeg",
    "https://i.imgur.com/8pQ9o5Z.jpeg",
    "https://i.imgur.com/kWq2b4U.jpeg",
    "https://i.imgur.com/YeRXJ7P.jpeg",
    "https://i.imgur.com/WYo05oG.jpeg",
  ];

  const homeStyle = {
    background: "#faf7ef",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  const heroStyle = {
    background: "#faf7ef",
    padding: "0",
    position: "relative",
    minHeight: "600px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const heroBackgroundStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    padding: "2rem",
    opacity: "0.3",
    transform: `translateY(${scrollY * 0.5}px)`,
    transition: "transform 0.1s ease-out",
    zIndex: "1",
  };

  const heroContentStyle = {
    position: "relative",
    zIndex: "10",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
  };

  const titleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "3.5rem",
    fontWeight: "700",
    color: "#3a5a40",
    margin: "0",
    letterSpacing: "-1.5px",
    textShadow: "0 4px 12px rgba(58, 90, 64, 0.15)",
  };

  const searchContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    maxWidth: "950px",
    background: "rgba(255, 255, 255, 0.98)",
    padding: "1.2rem 2rem",
    borderRadius: "35px",
    boxShadow: "0 16px 40px rgba(107, 142, 78, 0.25)",
    border: "2px solid rgba(244, 232, 193, 0.6)",
    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    backdropFilter: "blur(10px)",
  };

  const gridContainerStyle = {
    padding: "4rem 4rem 3rem",
    maxWidth: "100%",
    flex: "1",
  };

  const gridTitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#3a5a40",
    textAlign: "center",
    margin: "0 0 0.8rem 0",
    letterSpacing: "-1px",
  };

  const gridSubtitleStyle = {
    fontFamily: "'Comfortaa', sans-serif",
    fontSize: "0.95rem",
    color: "#6b8e4e",
    textAlign: "center",
    marginBottom: "2.5rem",
    fontWeight: "500",
  };

  const decorLineStyle = {
    width: "70px",
    height: "3px",
    background: "linear-gradient(90deg, #6b8e4e 0%, #f4e8c1 50%, #3a5a40 100%)",
    margin: "0 auto 1.5rem",
    borderRadius: "2px",
    boxShadow: "0 2px 8px rgba(107, 142, 78, 0.15)",
  };

  const productGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gridAutoRows: "auto",
    gap: "1.8rem",
    animation: "fadeIn 0.8s ease-in",
  };

  const gridItemStyle = (index) => ({
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    cursor: "pointer",
    position: "relative",
    backgroundColor: "#fff",
    animation: `slideIn 0.6s ease-out ${index * 0.08}s forwards`,
    opacity: 0,
    transformOrigin: "center",
  });

  const gridItemHoverStyle = {
    transform: "translateY(-16px) scale(1.02)",
    boxShadow: "0 20px 48px rgba(107, 142, 78, 0.28)",
    filter: "brightness(1.08)",
  };

  const imageWrapperStyle = {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f5f2e8 0%, #faf7ef 100%)",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  const imageBadgeStyle = {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(107, 142, 78, 0.9)",
    color: "#fff",
    padding: "0.4rem 0.8rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "700",
    opacity: 0,
    transition: "opacity 0.3s ease",
    backdropFilter: "blur(8px)",
  };

  const imageOverlayStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background: "linear-gradient(135deg, rgba(107, 142, 78, 0.05) 0%, rgba(58, 90, 64, 0.1) 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  };

  const getImageHeight = (index) => {
    const heights = [240, 280, 220, 260, 230, 250, 210, 270, 240, 250, 225, 265, 235, 255];
    return heights[index % heights.length];
  };

  const modalStyle = {
    display: selectedImage !== null ? "flex" : "none",
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background: "rgba(0, 0, 0, 0.85)",
    zIndex: "2000",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(6px)",
    animation: "fadeIn 0.3s ease",
  };

  const modalContentStyle = {
    position: "relative",
    maxWidth: "90vh",
    maxHeight: "90vh",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
    animation: "scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(255, 255, 255, 0.95)",
    border: "none",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    fontSize: "1.8rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
    zIndex: "2001",
    fontWeight: "bold",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50px) rotateY(20deg);
          }
          to {
            opacity: 1;
            transform: translateX(0) rotateY(0deg);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.85) rotate(3deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .hero-section {
          animation: slideInUp 0.6s ease-out;
        }

        .grid-item {
          animation: slideIn 0.6s ease-out forwards !important;
        }

        .grid-item:nth-child(1) { animation-delay: 0s !important; }
        .grid-item:nth-child(2) { animation-delay: 0.12s !important; }
        .grid-item:nth-child(3) { animation-delay: 0.24s !important; }
        .grid-item:nth-child(4) { animation-delay: 0.36s !important; }
        .grid-item:nth-child(5) { animation-delay: 0.48s !important; }
        .grid-item:nth-child(6) { animation-delay: 0.6s !important; }
        .grid-item:nth-child(7) { animation-delay: 0.72s !important; }
        .grid-item:nth-child(8) { animation-delay: 0.84s !important; }
        .grid-item:nth-child(9) { animation-delay: 0.96s !important; }
        .grid-item:nth-child(10) { animation-delay: 1.08s !important; }
        .grid-item:nth-child(11) { animation-delay: 1.2s !important; }
        .grid-item:nth-child(12) { animation-delay: 1.32s !important; }
        .grid-item:nth-child(13) { animation-delay: 1.44s !important; }
        .grid-item:nth-child(14) { animation-delay: 1.56s !important; }

        .grid-item:hover .grid-image {
          transform: scale(1.12) !important;
        }

        .grid-item:hover .image-badge {
          opacity: 1 !important;
        }

        .grid-item:hover .image-overlay {
          opacity: 1 !important;
        }

        input::placeholder {
          color: #bbb;
        }

        input:focus {
          outline: none;
        }

        @media (max-width: 1200px) {
          .hero-section {
            min-height: 550px !important;
            padding: 2rem !important;
          }

          .title {
            font-size: 2.8rem !important;
            margin-bottom: 1.5rem !important;
          }

          .hero-background {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.8rem !important;
            padding: 1.5rem !important;
          }

          .search-container {
            max-width: 90% !important;
            padding: 1rem 1.5rem !important;
          }

          .search-input {
            font-size: 1rem !important;
          }

          .search-button {
            padding: 0.7rem 1.3rem !important;
            font-size: 1.4rem !important;
          }

          .grid-container {
            padding: 3.5rem 2.5rem 2.5rem !important;
          }

          .grid-title {
            font-size: 2.1rem !important;
            margin-bottom: 0.6rem !important;
          }

          .grid-subtitle {
            margin-bottom: 2rem !important;
            font-size: 0.9rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)) !important;
            gap: 1.5rem !important;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: 480px !important;
            padding: 1.5rem !important;
          }

          .title {
            font-size: 2.2rem !important;
            margin-bottom: 1.2rem !important;
          }

          .hero-background {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.6rem !important;
            padding: 1rem !important;
            opacity: 0.2 !important;
          }

          .search-container {
            max-width: 100% !important;
            padding: 0.9rem 1.2rem !important;
            gap: 0.6rem !important;
          }

          .search-input {
            font-size: 0.95rem !important;
          }

          .search-button {
            font-size: 1.3rem !important;
            padding: 0.6rem 1rem !important;
          }

          .grid-container {
            padding: 2.5rem 1.5rem 2rem !important;
          }

          .grid-title {
            font-size: 1.7rem !important;
            margin-bottom: 0.4rem !important;
          }

          .grid-subtitle {
            font-size: 0.85rem !important;
            margin-bottom: 1.5rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 1.2rem !important;
          }

          .modal-content {
            max-width: 95vw !important;
            max-height: 95vh !important;
          }

          .decor-line {
            width: 60px !important;
            margin-bottom: 1.2rem !important;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            min-height: 420px !important;
            padding: 1rem !important;
          }

          .title {
            font-size: 1.8rem !important;
            margin-bottom: 1rem !important;
          }

          .hero-background {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
            padding: 0.8rem !important;
            opacity: 0.15 !important;
          }

          .search-container {
            padding: 0.8rem 1rem !important;
            gap: 0.5rem !important;
          }

          .search-input {
            font-size: 0.85rem !important;
          }

          .search-button {
            font-size: 1.1rem !important;
            padding: 0.5rem 0.8rem !important;
          }

          .grid-container {
            padding: 1.8rem 1rem 1.5rem !important;
          }

          .grid-title {
            font-size: 1.4rem !important;
            margin-bottom: 0.3rem !important;
          }

          .grid-subtitle {
            font-size: 0.8rem !important;
            margin-bottom: 1rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
            gap: 1rem !important;
          }

          .image-badge {
            font-size: 0.7rem !important;
            padding: 0.3rem 0.6rem !important;
            top: 8px !important;
            right: 8px !important;
          }

          .decor-line {
            width: 50px !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>

      <div style={homeStyle}>
        {/* HERO SECTION CON PARALLAX */}
        <div style={heroStyle} className="hero-section">
          {/* FONDO CON IMÁGENES MOVIBLES */}
          <div style={heroBackgroundStyle} className="hero-background">
            {demoImages.slice(0, 12).map((img, i) => (
              <div
                key={`bg-${i}`}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  height: "150px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  position: "relative",
                }}
              >
                <img
                  src={img}
                  alt="fondo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "saturate(0.8) brightness(0.9)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* CONTENIDO CENTRAL */}
          <div style={heroContentStyle}>
            <h1 style={titleStyle} className="title">
              Mercado Local – IA
            </h1>

            <div style={searchContainerStyle} className="search-container">
              <span style={{ fontSize: "1.4rem" }}>🔍</span>
              <input
                type="text"
                placeholder="Buscar productos frescos..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "1.1rem",
                  fontFamily: "'Comfortaa', sans-serif",
                  flex: "1",
                  background: "transparent",
                  color: "#333",
                  fontWeight: "500",
                }}
                className="search-input"
              />
              <button
                style={{
                  background: "linear-gradient(135deg, #6b8e4e 0%, #5a7a3d 100%)",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.6rem",
                  cursor: "pointer",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "25px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(107, 142, 78, 0.2)",
                  fontWeight: "600",
                }}
                className="search-button"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(107, 142, 78, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(107, 142, 78, 0.2)";
                }}
              >
                ✓
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div style={gridContainerStyle} className="grid-container">
          <h2 style={gridTitleStyle} className="grid-title">
            Productos Disponibles
          </h2>
          <div style={decorLineStyle} className="decor-line"></div>
          <p style={gridSubtitleStyle} className="grid-subtitle">
            Selecciona un producto para ver más detalles
          </p>

          <div style={productGridStyle} className="product-grid">
            {demoImages.map((img, i) => (
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
                onClick={() => setSelectedImage(i)}
              >
                <div
                  style={{
                    ...imageWrapperStyle,
                    height: `${getImageHeight(i)}px`,
                  }}
                >
                  <img
                    src={img}
                    alt="producto"
                    style={imageStyle}
                    className="grid-image"
                  />
                  <div style={imageOverlayStyle} className="image-overlay"></div>
                  <div
                    style={imageBadgeStyle}
                    className="image-badge"
                  >
                    Ver más
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL VISUALIZADOR */}
      <div
        style={modalStyle}
        onClick={() => setSelectedImage(null)}
      >
        <div
          style={modalContentStyle}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedImage !== null && (
            <>
              <img
                src={demoImages[selectedImage]}
                alt="producto grande"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <button
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#6b8e4e";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.transform = "scale(1.15) rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                  e.currentTarget.style.color = "#333";
                  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                }}
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}