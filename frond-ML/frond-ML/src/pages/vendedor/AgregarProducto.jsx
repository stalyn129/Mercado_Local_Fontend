import { useState, useEffect, useRef } from "react";
import Footer from "../../components/Footer.jsx";

export default function AgregarProducto() {
  const fileInputRef = useRef(null);
  const API_URL = "http://localhost:8080";

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [screenSize, setScreenSize] = useState("desktop");
  const [precioIA, setPrecioIA] = useState(null);
  const [analizando, setAnalizando] = useState(false);


  const [form, setForm] = useState({
    nombreProducto: "",
    descripcionProducto: "",
    precioProducto: "",
    stockProducto: "",
    unidad: "kg",
    estadoProducto: "Disponible",
    idCategoria: "",
    idSubcategoria: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setScreenSize("mobile");
      else if (window.innerWidth < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user || user.rol !== "VENDEDOR") {
      alert("❌ Debes iniciar sesión como vendedor");
      window.location.href = "/login";
      return;
    }

    const cargarCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/categorias/listar`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        console.log("✅ Categorías cargadas:", data);
        setCategorias(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("❌ Error cargando categorías:", err);
        setCategorias([]);
      }
    };
    cargarCategorias();
  }, []); // ✅ Sin dependencias adicionales

  useEffect(() => {
    if (!form.idCategoria) {
      setSubcategorias([]);
      return;
    }

    const cargarSubcategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/subcategorias/categoria/${form.idCategoria}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setSubcategorias(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error cargando subcategorías:", err);
        setSubcategorias([]);
      }
    };
    cargarSubcategorias();
  }, [form.idCategoria]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!form.nombreProducto || !form.precioProducto || !form.stockProducto || !form.idSubcategoria) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    if (!selectedImageFile) {
      alert("Por favor seleccione una imagen del producto");
      return;
    }

    if (!user || (!user.id && !user.idUsuario && !user.idVendedor)) {
      alert("❌ Error: No se pudo identificar el usuario. Por favor, inicie sesión nuevamente.");
      return;
    }

    setLoading(true);

    try {
      // PASO 1: Subir la imagen y obtener la URL
      console.log("📤 Subiendo imagen...");
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      const uploadResponse = await fetch(`${API_URL}/uploads/producto`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Error al subir imagen: ${errorText}`);
      }

      const imageUrl = await uploadResponse.text();
      console.log("✅ Imagen subida:", imageUrl);

      // PASO 2: Crear el producto con JSON (incluyendo URL de imagen)
      console.log("📦 Creando producto...");
      const body = {
        idUsuario: user.idUsuario || user.idVendedor || user.id,
        idVendedor: user.idVendedor || user.idUsuario || user.id,
        idSubcategoria: parseInt(form.idSubcategoria),
        nombreProducto: form.nombreProducto,
        descripcionProducto: form.descripcionProducto,
        precioProducto: parseFloat(form.precioProducto),
        stockProducto: parseInt(form.stockProducto),
        unidad: form.unidad,
        imagenProducto: imageUrl // ✅ URL de la imagen
      };

      console.log("📦 Payload enviado:", body);

      const response = await fetch(`${API_URL}/productos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Producto creado:", result);
        alert("✅ Producto creado correctamente");

        setForm({
          nombreProducto: "",
          descripcionProducto: "",
          precioProducto: "",
          stockProducto: "",
          unidad: "kg",
          estadoProducto: "Disponible",
          idCategoria: "",
          idSubcategoria: ""
        });
        setImagePreview(null);
        setSelectedImageFile(null);
      } else {
        const error = await response.text();
        console.error("❌ Error del servidor:", error);
        alert(`❌ Error al crear producto: ${error}`);
      }
    } catch (error) {
      console.error("❌ Error en la petición:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const gridLayout = screenSize === "desktop" ? "0.9fr 1.3fr" : "1fr";

  const analizarPrecio = async () => {
    if (!form.nombreProducto || !form.precioProducto) return;

    setAnalizando(true);

    try {
      const res = await fetch(`${API_URL}/api/ia/precio/recomendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: form.nombreProducto,
          precio: form.precioProducto
        })
      });

      const data = await res.json();
      setPrecioIA(data);
    } catch (err) {
      console.error("❌ Error recomendador IA:", err);
    } finally {
      setAnalizando(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "nombreProducto" || e.target.name === "precioProducto") {
      setTimeout(() => {
        analizarPrecio();
      }, 400);
    }
  };

  {
    precioIA && (
      <div style={{
        background: "#f7f7f0",
        padding: "12px",
        marginTop: "10px",
        borderRadius: "8px",
        borderLeft: "4px solid #6b8e6e"
      }}>
        {analizando ? (
          <p>🔍 Analizando precio...</p>
        ) : precioIA.similar_found ? (
          <>
            <p><strong>Precio promedio del mercado:</strong> ${precioIA.precio_promedio}</p>
            <p><strong>Tu precio:</strong> ${precioIA.precio_ingresado}</p>
            <p><strong>Estado:</strong> {
              precioIA.estado === "bajo" ? "⬇️ Muy bajo" :
                precioIA.estado === "alto" ? "⬆️ Muy alto" :
                  "✔️ Adecuado"
            }</p>
            <p><strong>Precio recomendado:</strong> ${precioIA.recomendado}</p>

            <details style={{ marginTop: "10px" }}>
              <summary>Ver productos similares</summary>
              <ul>
                {precioIA.productos_similares.map((p, i) => (
                  <li key={i}>{p.nombre} — ${p.precio}</li>
                ))}
              </ul>
            </details>
          </>
        ) : (
          <p>⚠️ No se encontraron productos similares.</p>
        )}
      </div>
    )
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

        .agregar-producto-page {
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
          grid-template-columns: ${gridLayout};
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

        .preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          color: #6b8e6e;
          width: 100%;
          height: 100%;
          justify-content: center;
          padding: 20px;
        }

        .upload-icon {
          font-size: clamp(40px, 8vw, 60px);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .preview-text {
          font-size: clamp(13px, 3vw, 15px);
          font-weight: 600;
          text-align: center;
        }

        .preview-text-small {
          font-size: clamp(11px, 2vw, 13px);
          color: #999;
          font-weight: 500;
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

        .form-row-3 {
          display: grid;
          grid-template-columns: 1.2fr 1fr 0.9fr;
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

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          gap: 20px;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: white;
          font-size: clamp(14px, 3vw, 18px);
          font-weight: 600;
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
          .agregar-producto-page {
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

          .form-row,
          .form-row-3 {
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

        @media (min-width: 641px) and (max-width: 900px) {
          .form-row-3 {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="agregar-producto-page">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Guardando producto...</div>
          </div>
        )}

        <h1 className="page-title">📦 Agregar Producto</h1>

        <div className="form-container">
          <div className="form-grid">
            {/* IZQUIERDA - IMAGEN */}
            <div className="image-upload-section">
              <div
                className={`image-preview-box ${imagePreview ? 'has-image' : ''}`}
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                ) : (
                  <div className="preview-placeholder">
                    <div className="upload-icon">📸</div>
                    <div>
                      <p className="preview-text">Sube una imagen</p>
                      <p className="preview-text-small">Haz clic o arrastra</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="file-input"
              />
              <button
                type="button"
                className="upload-btn"
                onClick={triggerFileInput}
              >
                {imagePreview ? "📸 Cambiar Imagen" : "📤 Seleccionar Imagen"}
              </button>
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
                    name="nombreProducto"
                    placeholder="Ej: Queso fresco artesanal"
                    value={form.nombreProducto}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-textarea"
                    name="descripcionProducto"
                    placeholder="Describe las características, origen, ingredientes, etc..."
                    value={form.descripcionProducto}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Categoría <span className="required-mark">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="idCategoria"
                      value={form.idCategoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {categorias.length === 0 ? "Cargando..." : "Seleccione"}
                      </option>
                      {categorias.map(c => (
                        <option key={c.idCategoria || c.id} value={c.idCategoria || c.id}>
                          {c.nombreCategoria || c.nombre}
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
                      name="idSubcategoria"
                      value={form.idSubcategoria}
                      onChange={handleChange}
                      disabled={!form.idCategoria}
                      required
                    >
                      <option value="">
                        {!form.idCategoria
                          ? "Seleccione categoría"
                          : subcategorias.length === 0
                            ? "Cargando..."
                            : "Seleccione"}
                      </option>
                      {subcategorias.map(s => (
                        <option key={s.idSubcategoria || s.id} value={s.idSubcategoria || s.id}>
                          {s.nombreSubcategoria || s.nombre}
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

                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Precio *</label>
                    <div className="price-input-wrapper">
                      <span className="currency-symbol">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        name="precioProducto"
                        placeholder="0.00"
                        value={form.precioProducto}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input
                      type="number"
                      className="form-input"
                      name="stockProducto"
                      placeholder="100"
                      value={form.stockProducto}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unidad</label>
                    <select
                      className="form-select"
                      name="unidad"
                      value={form.unidad}
                      onChange={handleChange}
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                      <option value="unidad">unidad</option>
                      <option value="litro">litro</option>
                    </select>
                  </div>
                </div>

                {/* 🔥 BLOQUE DE IA AQUÍ */}
                {precioIA && (
                  <div style={{
                    background: "#f7f7f0",
                    padding: "12px",
                    marginTop: "14px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #6b8e6e",
                    fontSize: "14px"
                  }}>
                    {analizando ? (
                      <p>🔍 Analizando precio...</p>
                    ) : precioIA.similar_found ? (
                      <>
                        <p><strong>Precio promedio del mercado:</strong> ${precioIA.precio_promedio}</p>
                        <p><strong>Tu precio:</strong> ${precioIA.precio_ingresado}</p>
                        <p><strong>Estado:</strong> {
                          precioIA.estado === "bajo" ? "⬇️ Muy bajo" :
                            precioIA.estado === "alto" ? "⬆️ Muy alto" :
                              "✔️ Adecuado"
                        }</p>

                        <p><strong>💡 Precio recomendado:</strong> ${precioIA.recomendado}</p>

                        <details style={{ marginTop: "10px" }}>
                          <summary style={{ cursor: "pointer" }}>Ver productos similares</summary>
                          <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            {precioIA.productos_similares.map((p, i) => (
                              <li key={i}>{p.nombre} — ${p.precio}</li>
                            ))}
                          </ul>
                        </details>
                      </>
                    ) : (
                      <p>⚠️ No se encontraron productos similares.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => window.history.back()}
            >
              ← Cancelar
            </button>
            <button
              type="button"
              className="save-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "⏳ Guardando..." : "💾 Guardar Producto"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}