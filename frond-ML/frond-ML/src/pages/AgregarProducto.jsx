import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AgregarProducto() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    nombreProducto: "",
    descripcionProducto: "",
    precioProducto: "",
    stockProducto: "",
    unidad: "kg",
    estadoProducto: "Disponible",
    idCategoria: "",
    idSubcategoria: "",
    imagenProducto: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!user || user.rol !== "VENDEDOR") {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/categorias/listar`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        console.log("Categorías cargadas:", data);
        setCategorias(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error cargando categorías:", err);
        setCategorias([]);
      }
    };
    cargarCategorias();
  }, [API_URL]);

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
        console.log("Subcategorías cargadas:", data);
        setSubcategorias(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error cargando subcategorías:", err);
        setSubcategorias([]);
      }
    };
    cargarSubcategorias();
  }, [form.idCategoria, API_URL]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm({ ...form, imagenProducto: reader.result });
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

    setLoading(true);

    const body = {
      nombreProducto: form.nombreProducto,
      descripcionProducto: form.descripcionProducto,
      precioProducto: parseFloat(form.precioProducto),
      stockProducto: parseInt(form.stockProducto),
      idSubcategoria: parseInt(form.idSubcategoria),
      imagenProducto: form.imagenProducto,
      idUsuario: user.id_usuario

    };

    try {
      const response = await fetch(`${API_URL}/productos/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert("✅ Producto creado correctamente");
        navigate("/vendedor/productos");
      } else {
        const error = await response.text();
        alert(`❌ Error: ${error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

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
          padding: 50px 20px;
          font-family: "Comfortaa", sans-serif;
        }

        .page-title {
          font-family: "Playfair Display", serif;
          font-size: 42px;
          font-weight: 700;
          color: #2d3e32;
          text-align: center;
          margin-bottom: 50px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .form-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 28px;
          padding: 50px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(107, 142, 110, 0.05);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 50px;
          margin-bottom: 40px;
        }

        /* IMAGEN SECTION */
        .image-upload-section {
          display: flex;
          flex-direction: column;
          gap: 25px;
          position: sticky;
          top: 100px;
        }

        .image-preview-box {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #f0f5f3 0%, #e8f0ed 100%);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border: 3px dashed #6b8e6e;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .image-preview-box:hover:not(.has-image) {
          border-color: #5a7d5d;
          background: linear-gradient(135deg, #e8f0ed 0%, #e0e8e5 100%);
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
        }

        .upload-icon {
          font-size: 60px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .preview-text {
          font-size: 15px;
          font-weight: 600;
          text-align: center;
        }

        .preview-text-small {
          font-size: 13px;
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
          padding: 16px 32px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
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

        /* FORM FIELDS */
        .form-right {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #2d3e32;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #4a6050;
        }

        .form-input,
        .form-textarea,
        .form-select {
          padding: 14px 16px;
          border: 2px solid #e5e0d5;
          border-radius: 12px;
          font-family: "Comfortaa", sans-serif;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #fafaf8;
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
          background: white;
          box-shadow: 0 0 0 4px rgba(107, 142, 110, 0.1);
        }

        .form-textarea {
          min-height: 110px;
          resize: vertical;
          font-family: "Comfortaa", sans-serif;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        .price-input-wrapper {
          position: relative;
        }

        .currency-symbol {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 700;
          color: #6b8e6e;
          font-size: 16px;
        }

        .price-input-wrapper .form-input {
          padding-left: 36px;
        }

        /* BOTONES */
        .form-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 40px;
          padding-top: 40px;
          border-top: 2px solid #f0f0f0;
        }

        .save-btn {
          background: linear-gradient(135deg, #6b8e6e 0%, #5a7d5d 100%);
          color: white;
          border: none;
          padding: 16px 50px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Comfortaa", sans-serif;
          box-shadow: 0 6px 20px rgba(107, 142, 110, 0.3);
          min-width: 200px;
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
          padding: 16px 40px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Comfortaa", sans-serif;
          min-width: 150px;
        }

        .cancel-btn:hover {
          background: #6b8e6e;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .agregar-producto-page {
            padding: 30px 16px;
          }

          .page-title {
            font-size: 32px;
            margin-bottom: 40px;
          }

          .form-container {
            padding: 30px 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .image-upload-section {
            position: static;
          }

          .form-row,
          .form-row-3 {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
            gap: 15px;
          }

          .save-btn,
          .cancel-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="agregar-producto-page">
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
              {/* Descripción */}
              <div className="form-section">
                <h3 className="form-section-title">Descripción del Producto</h3>
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    name="descripcionProducto"
                    placeholder="Describe las características, origen, ingredientes, etc. de tu producto..."
                    value={form.descripcionProducto}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Información Básica */}
              <div className="form-section">
                <h3 className="form-section-title">Información Básica</h3>
                
                <div className="form-group">
                  <label className="form-label">Nombre del Producto *</label>
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select
                      className="form-select"
                      name="idCategoria"
                      value={form.idCategoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {categorias.length === 0 ? "Cargando categorías..." : "Seleccione Categoría"}
                      </option>
                      {categorias.map(c => (
                        <option key={c.idCategoria || c.id} value={c.idCategoria || c.id}>
                          {c.nombreCategoria || c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sub Categoría *</label>
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
                          ? "Seleccione primero una categoría" 
                          : subcategorias.length === 0 
                          ? "Cargando subcategorías..." 
                          : "Seleccione Subcategoría"}
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
                <h3 className="form-section-title">Precio y Disponibilidad</h3>
                
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
                    <label className="form-label">Unidad de Medida</label>
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

                  <div className="form-group">
                    <label className="form-label">Stock Disponible *</label>
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
                </div>

                <div className="form-group">
                  <label className="form-label">Estado del Producto</label>
                  <select
                    className="form-select"
                    name="estadoProducto"
                    value={form.estadoProducto}
                    onChange={handleChange}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Agotado">Agotado</option>
                    <option value="Próximamente">Próximamente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/vendedor')}
            >
              Cancelar
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
    </>
  );
}