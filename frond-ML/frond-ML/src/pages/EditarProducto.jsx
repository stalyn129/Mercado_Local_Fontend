import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [producto, setProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cargando, setCargando] = useState(true);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const vendedor = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token || vendedor?.rol !== "VENDEDOR") {
      navigate("/login");
      return;
    }
    cargarProducto();
    cargarCategorias();
  }, []);

  const cargarProducto = async () => {
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      console.log("🟡 Producto recibido:", data);
      
      const productoNormalizado = {
        ...data,
        subcategoria: typeof data.subcategoria === 'object' && data.subcategoria !== null
          ? data.subcategoria
          : { idSubcategoria: data.idSubcategoria },
        idCategoria: data.subcategoria?.idCategoria || data.idCategoria
      };
      
      setProducto(productoNormalizado);
      
      if (productoNormalizado.idCategoria) {
        cargarSubcategoriasPorCategoria(productoNormalizado.idCategoria);
      }
      
      setCargando(false);
    } catch (error) {
      console.error("❌ Error al cargar producto:", error);
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias/listar`);
      const data = await res.json();
      setCategorias(data);
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
    }
  };

  const cargarSubcategoriasPorCategoria = async (idCategoria) => {
    try {
      const res = await fetch(`${API_URL}/subcategorias/categoria/${idCategoria}`);
      const data = await res.json();
      setSubcategorias(data);
    } catch (error) {
      console.error("❌ No se pudo cargar subcategorías por categoría", error);
      setSubcategorias([]);
    }
  };

  const actualizarProducto = async () => {
    const formData = new FormData();
    formData.append("nombreProducto", producto.nombreProducto);
    formData.append("descripcionProducto", producto.descripcionProducto);
    formData.append("precioProducto", producto.precioProducto);
    formData.append("stockProducto", producto.stockProducto);
    formData.append("idSubcategoria", producto.subcategoria.idSubcategoria);
    formData.append("idUsuario", vendedor.idUsuario);

    if (selectedImage) {
      formData.append("imagen", selectedImage);
    }

    try {
      const res = await fetch(`${API_URL}/productos/editar/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert("✔ Producto actualizado correctamente");
        navigate("/vendedor/gestionar-productos");
      } else {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        alert("❌ Error al actualizar producto");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (cargando || !producto) {
    return (
      <>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ 
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          gap: "20px"
        }}>
          <div style={{ 
            width: "60px",
            height: "60px",
            border: "5px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <div style={{ 
            color: "white",
            fontSize: "18px",
            fontWeight: "600"
          }}>
            Cargando producto...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Comfortaa:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .editar-producto-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #faf8f3 0%, #f5f0e8 100%);
          padding: clamp(16px, 3vw, 30px);
          font-family: "Comfortaa", sans-serif;
        }

        .page-title {
          font-family: "Playfair Display", serif;
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 700;
          color: #2d3e32;
          text-align: center;
          margin-bottom: clamp(20px, 3vw, 30px);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .form-container {
          max-width: 1400px;
          margin: 0 auto;
          background: white;
          border-radius: clamp(16px, 3vw, 24px);
          padding: clamp(20px, 3vw, 40px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(107, 142, 110, 0.05);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.3fr;
          gap: clamp(25px, 4vw, 45px);
          margin-bottom: 25px;
        }

        .image-upload-section {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 2vw, 18px);
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        .image-preview-box {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #f0f5f3 0%, #e8f0ed 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border: 3px dashed #6b8e6e;
          transition: all 0.3s ease;
          cursor: pointer;
          max-height: 400px;
        }

        .image-preview-box:hover:not(.has-image) {
          border-color: #5a7d5d;
          background: linear-gradient(135deg, #e8f0ed 0%, #e0e8e5 100%);
          transform: scale(1.02);
        }

        .image-preview-box.has-image {
          border: none;
          box-shadow: 0 10px 30px rgba(107, 142, 110, 0.15);
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-btn {
          background: linear-gradient(135deg, #6b8e6e 0%, #5a7d5d 100%);
          color: white;
          border: none;
          padding: clamp(12px, 2vw, 16px) clamp(20px, 4vw, 32px);
          border-radius: 14px;
          font-weight: 600;
          font-size: clamp(13px, 2.5vw, 15px);
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Comfortaa", sans-serif;
          box-shadow: 0 6px 20px rgba(107, 142, 110, 0.25);
          width: 100%;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(107, 142, 110, 0.35);
        }

        .upload-btn:active {
          transform: translateY(0px);
        }

        .file-input {
          display: none;
        }

        .image-selected-text {
          margin-top: 8px;
          font-size: 13px;
          color: #6b8e6e;
          font-weight: 600;
          text-align: center;
        }

        .form-right {
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 3.5vw, 32px);
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 3vw, 24px);
          padding: clamp(20px, 3.5vw, 28px);
          background: #fafaf8;
          border-radius: 12px;
          border-left: 3px solid #6b8e6e;
          transition: all 0.3s ease;
        }

        .form-section:hover {
          box-shadow: 0 4px 12px rgba(107, 142, 110, 0.08);
        }

        .form-section-title {
          font-size: clamp(14px, 2.8vw, 17px);
          font-weight: 700;
          color: #2d3e32;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .section-icon {
          font-size: 1.2em;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: clamp(12px, 2.5vw, 14px);
          font-weight: 600;
          color: #4a6050;
          margin-bottom: 2px;
        }

        .required-mark {
          color: #e74c3c;
        }

        .form-input,
        .form-textarea,
        .form-select {
          padding: clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px);
          border: 2px solid #e5e0d5;
          border-radius: 10px;
          font-family: "Comfortaa", sans-serif;
          font-size: clamp(12px, 2.5vw, 14px);
          transition: all 0.3s ease;
          background: white;
          color: #333;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #aaa;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #6b8e6e;
          background: #fafaf8;
          box-shadow: 0 0 0 4px rgba(107, 142, 110, 0.1);
        }

        .form-textarea {
          min-height: clamp(75px, 16vh, 95px);
          resize: vertical;
          font-family: "Comfortaa", sans-serif;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: clamp(18px, 3vw, 28px);
        }

        .price-input-wrapper {
          position: relative;
        }

        .currency-symbol {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 700;
          color: #6b8e6e;
          font-size: clamp(14px, 2.5vw, 16px);
        }

        .price-input-wrapper .form-input {
          padding-left: clamp(28px, 6vw, 36px);
        }

        .form-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(12px, 3vw, 16px);
          margin-top: clamp(20px, 3vw, 30px);
          padding-top: clamp(20px, 3vw, 30px);
          border-top: 2px solid #f0f0f0;
        }

        .save-btn {
          background: linear-gradient(135deg, #6b8e6e 0%, #5a7d5d 100%);
          color: white;
          border: none;
          padding: clamp(12px, 2vw, 16px) clamp(30px, 5vw, 50px);
          border-radius: 14px;
          font-weight: 700;
          font-size: clamp(13px, 2.5vw, 16px);
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Comfortaa", sans-serif;
          box-shadow: 0 6px 20px rgba(107, 142, 110, 0.3);
          min-width: 150px;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(107, 142, 110, 0.4);
        }

        .cancel-btn {
          background: white;
          color: #6b8e6e;
          border: 2px solid #6b8e6e;
          padding: clamp(12px, 2vw, 16px) clamp(25px, 4vw, 40px);
          border-radius: 14px;
          font-weight: 600;
          font-size: clamp(13px, 2.5vw, 16px);
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Comfortaa", sans-serif;
          min-width: 130px;
        }

        .cancel-btn:hover {
          background: #6b8e6e;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 1023px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .image-upload-section {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .editar-producto-page {
            padding: 16px;
          }

          .page-title {
            margin-bottom: 24px;
          }

          .form-container {
            padding: 16px;
            border-radius: 16px;
          }

          .image-preview-box {
            max-height: 300px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .save-btn,
          .cancel-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="editar-producto-page">
        {/* Header Section con efecto decorativo */}
        <div style={{ 
          background: "white",
          borderRadius: "20px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          maxWidth: "1400px",
          margin: "0 auto 40px auto"
        }}>
          {/* Decoración de fondo - círculos */}
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

          <div style={{ position: "relative", zIndex: "1" }}>
            {/* Icono decorativo grande */}
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
            }}>
              ✏️
            </div>

            {/* Título principal */}
            <h1 style={{ 
              fontSize: "42px", 
              fontWeight: "800", 
              color: "#2D3E2B",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
              lineHeight: "1.2",
              fontFamily: "'Playfair Display', serif"
            }}>
              Editar Producto
            </h1>

            {/* Subtítulo */}
            <p style={{ 
              color: "#6B7F69", 
              fontSize: "16px",
              margin: "0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6",
              fontFamily: "'Comfortaa', sans-serif"
            }}>
              Actualiza la información de tu producto orgánico
            </p>
          </div>
        </div>

        <div className="form-container">
          <div className="form-grid">
            {/* IZQUIERDA - IMAGEN */}
            <div className="image-upload-section">
              <div 
                className={`image-preview-box ${selectedImage || producto.imagenProducto ? 'has-image' : ''}`}
                onClick={triggerFileInput}
              >
                <img 
                  src={selectedImage ? URL.createObjectURL(selectedImage) : producto.imagenProducto}
                  alt={producto.nombreProducto}
                  className="preview-image"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="file-input"
              />

              <button
                type="button"
                className="upload-btn"
                onClick={triggerFileInput}
              >
                📸 Cambiar Imagen
              </button>

              {selectedImage && (
                <p className="image-selected-text">
                  ✓ Nueva imagen seleccionada
                </p>
              )}
            </div>

            {/* DERECHA - FORMULARIO */}
            <div className="form-right">
              {/* Información Básica */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span className="section-icon">ℹ️</span>
                  Información del Producto
                </h3>
                
                <div className="form-group">
                  <label className="form-label">
                    Nombre del Producto <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Queso fresco artesanal"
                    value={producto.nombreProducto || ""} 
                    onChange={(e) => setProducto({...producto, nombreProducto: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe las características, origen, ingredientes, etc..."
                    value={producto.descripcionProducto || ""} 
                    onChange={(e) => setProducto({...producto, descripcionProducto: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Categoría <span className="required-mark">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={producto.idCategoria || ""}
                      onChange={(e) => {
                        const idCategoria = parseInt(e.target.value);
                        
                        setProducto({
                          ...producto,
                          idCategoria: idCategoria,
                          subcategoria: { idSubcategoria: "" }
                        });

                        if (idCategoria) {
                          cargarSubcategoriasPorCategoria(idCategoria);
                        } else {
                          setSubcategorias([]);
                        }
                      }}
                    >
                      <option value="">Seleccione</option>
                      {categorias.map(c => (
                        <option key={c.idCategoria} value={c.idCategoria}>
                          {c.nombreCategoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Sub Categoría <span className="required-mark">*</span>
                    </label>
                    <select 
                      className="form-select"
                      value={producto.subcategoria?.idSubcategoria || ""}
                      onChange={(e) => setProducto({
                        ...producto, 
                        subcategoria: { idSubcategoria: parseInt(e.target.value) }
                      })}
                      disabled={!producto.idCategoria}
                    >
                      <option value="">
                        {producto.idCategoria 
                          ? "Seleccione categoría" 
                          : "Seleccione categoría"}
                      </option>
                      {subcategorias.map(s => (
                        <option key={s.idSubcategoria} value={s.idSubcategoria}>
                          {s.nombreSubcategoria}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Precio y Stock */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <span className="section-icon">💰</span>
                  Precio y Disponibilidad
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Precio <span className="required-mark">*</span>
                    </label>
                    <div className="price-input-wrapper">
                      <span className="currency-symbol">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        placeholder="0.00"
                        value={producto.precioProducto || ""} 
                        onChange={(e) => setProducto({...producto, precioProducto: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Stock <span className="required-mark">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="100"
                      value={producto.stockProducto || ""} 
                      onChange={(e) => setProducto({...producto, stockProducto: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/vendedor/gestionar-productos")}
            >
              ← Cancelar
            </button>
            <button
              type="button"
              className="save-btn"
              onClick={actualizarProducto}
            >
              💾 Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}