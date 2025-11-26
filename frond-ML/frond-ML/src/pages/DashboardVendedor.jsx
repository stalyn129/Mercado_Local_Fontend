import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function DashboardVendedor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    ingresosTotales: 0,
    pedidos: 0,
    productosDisponibles: 0
  });
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    // Verificar autenticación
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!userData || !token || userData.rol !== "VENDEDOR") {
      navigate("/login");
      return;
    }

    setUser(userData);
    cargarDatos(token, userData.id);
  }, [navigate]);

  const cargarDatos = async (token, vendedorId) => {
    setLoading(true);
    setError(null);

    try {
      // Cargar estadísticas del vendedor
      const statsResponse = await fetch(`${API_BASE_URL}/vendedor/${vendedorId}/estadisticas`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          ingresosTotales: statsData.ingresosTotales || 0,
          pedidos: statsData.totalPedidos || 0,
          productosDisponibles: statsData.productosDisponibles || 0
        });
      } else {
        console.warn("No se pudieron cargar las estadísticas");
      }

      // Cargar pedidos recientes del vendedor
      const pedidosResponse = await fetch(`${API_BASE_URL}/vendedor/${vendedorId}/pedidos/recientes`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (pedidosResponse.ok) {
        const pedidosData = await pedidosResponse.json();
        // Transformar datos al formato esperado
        const pedidosFormateados = pedidosData.map(pedido => ({
          id: pedido.id,
          numero: pedido.numero || pedido.id,
          cliente: pedido.clienteNombre || `${pedido.cliente?.nombre} ${pedido.cliente?.apellido}` || "Cliente",
          estado: pedido.estado || "Pendiente",
          total: pedido.total || 0,
          fecha: pedido.fecha
        }));
        setPedidosRecientes(pedidosFormateados);
      } else {
        console.warn("No se pudieron cargar los pedidos recientes");
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del dashboard");
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

        .dashboard-vendedor-container {
          min-height: 100vh;
          background: #faf8f3;
          font-family: "Comfortaa", sans-serif;
          padding: 40px 60px;
        }

        .dashboard-title {
          font-family: "Playfair Display", serif;
          font-size: 42px;
          font-weight: 700;
          color: #4a6050;
          text-align: center;
          margin-bottom: 40px;
        }

        /* ESTADÍSTICAS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .stat-card {
          padding: 35px;
          border-radius: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card.ingresos {
          background: linear-gradient(135deg, #f9d94a 0%, #f5c542 100%);
        }

        .stat-card.pedidos {
          background: linear-gradient(135deg, #6b8e6e 0%, #5a7d5d 100%);
          color: white;
        }

        .stat-card.productos {
          background: linear-gradient(135deg, #5f8a7d 0%, #4f7a6d 100%);
          color: white;
        }

        .stat-label {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
          opacity: 0.95;
        }

        .stat-value {
          font-size: 52px;
          font-weight: 700;
          font-family: "Poppins", sans-serif;
          line-height: 1;
        }

        /* BOTONES DE ACCIÓN */
        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .action-btn {
          padding: 20px 30px;
          border-radius: 16px;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: "Comfortaa", sans-serif;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .btn-agregar {
          background: linear-gradient(135deg, #8fac96 0%, #7a9c86 100%);
        }

        .btn-gestionar-productos {
          background: linear-gradient(135deg, #7a9c86 0%, #6a8c76 100%);
        }

        .btn-gestionar {
          background: linear-gradient(135deg, #6b8e6e 0%, #5a7d5d 100%);
        }

        .btn-analisis {
          background: linear-gradient(135deg, #90aa99 0%, #7f9a89 100%);
        }

        .btn-resenas {
          background: linear-gradient(135deg, #a0b8a8 0%, #90a898 100%);
        }

        /* CONTENIDO */
        .content-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        .section-box {
          background: white;
          border-radius: 24px;
          padding: 35px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }

        .section-title {
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 700;
          color: #4a6050;
          margin-bottom: 25px;
        }

        /* PEDIDOS RECIENTES */
        .pedido-item {
          background: #f9f7f2;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }

        .pedido-item:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          border-left-color: #6b8e6e;
        }

        .pedido-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .pedido-numero {
          font-weight: 700;
          color: #2d3e32;
          font-size: 17px;
        }

        .pedido-cliente {
          color: #666;
          font-size: 14px;
        }

        .pedido-middle {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .pedido-status {
          padding: 8px 18px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
        }

        .status-enviado {
          background: #c2dbc2;
          color: #2d5a2d;
        }

        .status-pendiente {
          background: #f9d94a;
          color: #8a6f0f;
        }

        .pedido-precio {
          font-weight: 700;
          font-size: 19px;
          color: #2d3e32;
        }

        /* ANALÍTICA PLACEHOLDER */
        .chart-placeholder {
          background: linear-gradient(135deg, #e8f5ea 0%, #d2e8d5 100%);
          height: 350px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #4a6050;
          font-weight: 600;
          gap: 15px;
        }

        .chart-icon {
          font-size: 72px;
          opacity: 0.7;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        @media (max-width: 1024px) {
          .content-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-vendedor-container {
            padding: 30px 20px;
          }

          .dashboard-title {
            font-size: 32px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-vendedor-container">
        <h1 className="dashboard-title">Tablero Analítico</h1>

        {/* MOSTRAR ERROR SI EXISTE */}
        {error && (
          <div className="error-container">
            ⚠️ {error}
          </div>
        )}

        {/* MOSTRAR LOADING O CONTENIDO */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* ESTADÍSTICAS */}
            <div className="stats-grid">
              <div className="stat-card ingresos">
                <div className="stat-label">Ingresos Totales</div>
                <div className="stat-value">${stats.ingresosTotales.toFixed(2)}</div>
              </div>
              <div className="stat-card pedidos">
                <div className="stat-label">Pedidos</div>
                <div className="stat-value">{stats.pedidos}</div>
              </div>
              <div className="stat-card productos">
                <div className="stat-label">Productos Disponibles</div>
                <div className="stat-value">{stats.productosDisponibles}</div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="action-buttons">
              <button className="action-btn btn-agregar" onClick={() => navigate('/vendedor/agregar-producto')}>
                ➕ Agregar Producto
              </button>
              <button className="action-btn btn-gestionar-productos" onClick={() => navigate('/vendedor/gestionar-productos')}>
                📦 Gestionar Productos
              </button>
              <button className="action-btn btn-gestionar" onClick={() => navigate('/vendedor/pedidos')}>
                📋 Gestionar Pedidos
              </button>
              <button className="action-btn btn-analisis" onClick={() => navigate('/vendedor/analisis')}>
                📊 Análisis de Ventas
              </button>
              <button className="action-btn btn-resenas" onClick={() => navigate('/vendedor/resenas')}>
                ⭐ Reseñas
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="content-section">
              {/* PEDIDOS RECIENTES */}
              <div className="section-box">
                <h2 className="section-title">Pedidos Recientes</h2>
                {pedidosRecientes.length > 0 ? (
                  pedidosRecientes.map((pedido) => (
                    <div key={pedido.id} className="pedido-item">
                      <div className="pedido-info">
                        <span className="pedido-numero"># {pedido.numero}</span>
                        <span className="pedido-cliente">{pedido.cliente}</span>
                      </div>
                      <div className="pedido-middle">
                        <span className={`pedido-status status-${pedido.estado.toLowerCase()}`}>
                          {pedido.estado}
                        </span>
                      </div>
                      <span className="pedido-precio">${pedido.total.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <p>No hay pedidos recientes</p>
                  </div>
                )}
              </div>

              {/* ANALÍTICA */}
              <div className="section-box">
                <h2 className="section-title">Analítica</h2>
                <div className="chart-placeholder">
                  <div className="chart-icon">📊</div>
                  <span>Gráficos de ventas y estadísticas</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}