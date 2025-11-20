import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
  ];

  const homeStyle = {
    background: "#faf7ef",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  const heroStyle = {
    background: "linear-gradient(135deg, #faf7ef 0%, #f5f2e8 100%)",
    padding: "2rem 4rem",
    textAlign: "center",
    borderBottom: "2px solid #e8e4d9",
  };

  const titleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.8rem",
    fontWeight: "700",
    color: "#3a5a40",
    margin: "0 0 2rem 0",
    letterSpacing: "-0.5px",
  };

  const searchContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    maxWidth: "900px",
    margin: "0 auto",
    background: "#fff",
    padding: "1rem 1.8rem",
    borderRadius: "30px",
    boxShadow: "0 8px 24px rgba(107, 142, 78, 0.15)",
  };

  const searchInputStyle = {
    border: "none",
    outline: "none",
    fontSize: "1.05rem",
    fontFamily: "'Comfortaa', sans-serif",
    flex: "1",
    background: "transparent",
    color: "#333",
  };

  const searchButtonStyle = {
    background: "#6b8e4e",
    border: "none",
    color: "#fff",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.7rem 1.3rem",
    borderRadius: "20px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const gridContainerStyle = {
    padding: "3.5rem 4rem",
    maxWidth: "100%",
    flex: "1",
  };

  const gridTitleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#3a5a40",
    textAlign: "center",
    marginBottom: "2.5rem",
    letterSpacing: "-0.5px",
  };

  const productGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gridAutoRows: "auto",
    gap: "1.5rem",
    animation: "fadeIn 0.8s ease-in",
  };

  const gridItemStyle = {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    cursor: "pointer",
    position: "relative",
    backgroundColor: "#fff",
    animation: "slideIn 0.6s ease-out forwards",
  };

  const gridItemHoverStyle = {
    transform: "translateY(-12px)",
    boxShadow: "0 16px 32px rgba(107, 142, 78, 0.25)",
  };

  const imageStyle = {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.4s ease",
    animation: "slideFromRight 1.2s ease-out infinite alternate",
  };

  const getImageHeight = (index) => {
    const heights = [180, 240, 200, 220, 190, 210];
    return heights[index % heights.length];
  };

  const getAnimationDelay = (index) => {
    return `${index * 0.1}s`;
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
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideFromRight {
          0% {
            transform: translateX(0px) scale(1);
          }
          100% {
            transform: translateX(-6px) scale(1.02);
          }
        }

        @keyframes bounceScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }

        .hero-section {
          animation: slideInUp 0.6s ease-out;
        }

        .grid-item {
          animation: slideIn 0.6s ease-out forwards !important;
        }

        .grid-item:nth-child(1) { animation-delay: 0s !important; }
        .grid-item:nth-child(2) { animation-delay: 0.1s !important; }
        .grid-item:nth-child(3) { animation-delay: 0.2s !important; }
        .grid-item:nth-child(4) { animation-delay: 0.3s !important; }
        .grid-item:nth-child(5) { animation-delay: 0.4s !important; }
        .grid-item:nth-child(6) { animation-delay: 0.5s !important; }
        .grid-item:nth-child(7) { animation-delay: 0.6s !important; }
        .grid-item:nth-child(8) { animation-delay: 0.7s !important; }
        .grid-item:nth-child(9) { animation-delay: 0.8s !important; }
        .grid-item:nth-child(10) { animation-delay: 0.9s !important; }
        .grid-item:nth-child(11) { animation-delay: 1s !important; }
        .grid-item:nth-child(12) { animation-delay: 1.1s !important; }

        .grid-item:hover {
          animation: bounceScale 0.4s ease-in-out !important;
        }

        .grid-image {
          animation: slideFromRight 1.5s ease-in-out infinite alternate !important;
        }

        input::placeholder {
          color: #999;
        }

        input:focus {
          outline: none;
        }

        @media (max-width: 1200px) {
          .hero-section {
            padding: 1.8rem 3rem !important;
          }

          .title {
            font-size: 2.4rem !important;
            margin-bottom: 1.5rem !important;
          }

          .search-container {
            max-width: 800px !important;
            padding: 0.9rem 1.5rem !important;
          }

          .grid-container {
            padding: 3rem 3rem !important;
          }

          .grid-title {
            font-size: 2rem !important;
            margin-bottom: 2rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 1.3rem !important;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 1.5rem 1.5rem !important;
          }

          .title {
            font-size: 1.9rem !important;
            margin-bottom: 1.2rem !important;
          }

          .search-container {
            max-width: 100% !important;
            padding: 0.8rem 1.2rem !important;
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
            padding: 2rem 1.5rem !important;
          }

          .grid-title {
            font-size: 1.6rem !important;
            margin-bottom: 1.5rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 1.2rem 1rem !important;
          }

          .title {
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
          }

          .search-container {
            padding: 0.7rem 1rem !important;
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
            padding: 1.5rem 1rem !important;
          }

          .grid-title {
            font-size: 1.3rem !important;
            margin-bottom: 1.2rem !important;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
            gap: 0.8rem !important;
          }
        }
      `}</style>

      <Navbar />

      <div style={homeStyle}>
        {/* HERO SECTION */}
        <div style={heroStyle} className="hero-section">
          <h1 style={titleStyle} className="title">
            Mercado Local – IA
          </h1>

          <div style={searchContainerStyle} className="search-container">
            <span style={{ fontSize: "1.4rem" }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={searchInputStyle}
              className="search-input"
            />
            <button
              style={searchButtonStyle}
              className="search-button"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#5a7a3d";
                e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#6b8e4e";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ✓
            </button>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div style={gridContainerStyle} className="grid-container">
          <h2 style={gridTitleStyle} className="grid-title">
            Productos Disponibles
          </h2>

          <div style={productGridStyle} className="product-grid">
            {demoImages.map((img, i) => (
              <div
                key={i}
                style={
                  hoveredIndex === i
                    ? { ...gridItemStyle, ...gridItemHoverStyle }
                    : gridItemStyle
                }
                className="grid-item"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={img}
                  alt="producto"
                  style={{
                    ...imageStyle,
                    height: `${getImageHeight(i)}px`,
                  }}
                  className="grid-image"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}