import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/Footer.jsx";

// Helper para formatear dinero de forma segura
const money = (value) =>
  value !== null && value !== undefined
    ? value.toFixed(2)
    : "0.00";

// Helper para mostrar estados en español
const getEstadoLabel = (estado) => {
  const estados = {
    PENDIENTE: "Pendiente de pago",
    PROCESANDO: "En proceso",
    PENDIENTE_VERIFICACION: "Verificando pago",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado"
  };
  return estados[estado] || estado;
};

// Helper para obtener el emoji del estado
const getEstadoEmoji = (estado) => {
  const emojis = {
    PENDIENTE: "⏳",
    PROCESANDO: "📦",
    PENDIENTE_VERIFICACION: "🔍",
    COMPLETADO: "✅",
    CANCELADO: "❌"
  };
  return emojis[estado] || "📋";
};

// Helper para formatear la fecha de forma más amigable
const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  
  const date = new Date(fecha);
  const opciones = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('es-ES', opciones);
};

export default function MisPedidos({ modo: modoProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // 🎯 MODO REAL - Prioridad: prop > state > default
  const modo = modoProp || location.state?.modo || "lista";

  const [pedidosIndividuales, setPedidosIndividuales] = useState([]);
  const [comprasUnificadas, setComprasUnificadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoAbierto, setPedidoAbierto] = useState(null);

  // Estados que permiten ver factura
  const estadosConFactura = ["PENDIENTE_VERIFICACION", "COMPLETADO"];

  // 🆕 Función para cargar pedidos y compras unificadas
  const fetchDatos = async () => {
    const token = localStorage.getItem("authToken");

    try {
      console.log("🔍 Cargando datos del historial...");
      
      // 🔥 LLAMADA AL NUEVO ENDPOINT QUE DEVUELVE AMBOS TIPOS
      const response = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status}: ${txt}`);
      }

      const data = await response.json();
      
      // 🔥 DEBUG DETALLADO - IMPORTANTE PARA DIAGNÓSTICO
      console.log("✅ Respuesta completa del backend:", JSON.stringify(data, null, 2));
      
      // Verificar la estructura de la respuesta
      if (data.comprasUnificadas && Array.isArray(data.comprasUnificadas)) {
        console.log(`📦 El backend devolvió ${data.comprasUnificadas.length} compras unificadas`);
        data.comprasUnificadas.forEach((compra, idx) => {
          console.log(`  Compra ${idx}: ID=${compra.idCompraUnificada}, Pedidos=${compra.pedidos?.length || 0}`);
        });
      }
      
      // Verificar pedidos individuales
      const pedidos = data.pedidosIndividuales || data || [];
      console.log(`📋 Total de pedidos recibidos: ${pedidos.length}`);
      
      // Verificar si los pedidos tienen idCompraUnificada
      const pedidosConIdCompra = pedidos.filter(p => p.idCompraUnificada);
      const pedidosSinIdCompra = pedidos.filter(p => !p.idCompraUnificada);
      
      console.log(`🔄 Pedidos CON idCompraUnificada: ${pedidosConIdCompra.length}`);
      console.log(`📝 Pedidos SIN idCompraUnificada: ${pedidosSinIdCompra.length}`);
      
      // Mostrar detalles de los primeros 10 pedidos para diagnóstico
      pedidos.slice(0, 10).forEach((p, i) => {
        console.log(`  Pedido ${i}: #${p.idPedido}, idCompraUnificada=${p.idCompraUnificada || '(ninguno)'}, Estado=${p.estadoPedido}, Total=$${p.total || p.montoTotal || 0}`);
      });
      
      // 🔥 PROCESAR RESPUESTA SEGÚN FORMATO
      if (data.pedidosIndividuales && data.comprasUnificadas) {
        // Nuevo formato: objeto con ambos arrays
        setPedidosIndividuales(data.pedidosIndividuales || []);
        setComprasUnificadas(data.comprasUnificadas || []);
      } else if (Array.isArray(data)) {
        // Formato antiguo: solo array de pedidos
        setPedidosIndividuales(data);
        setComprasUnificadas([]);
      } else {
        // Formato inesperado
        setPedidosIndividuales([]);
        setComprasUnificadas([]);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error("Error cargando datos:", err);
      console.error("URL llamada:", `${API_URL}/pedidos/mis-pedidos`);
      console.error("Token usado:", token ? "Presente" : "Ausente");
      setLoading(false);
    }
  };

  // 🆕 Función para marcar como entregado
  const handleMarcarEntregado = async (idPedido, metodoPago) => {
    const confirmar = window.confirm(
      metodoPago === 'EFECTIVO'
        ? '¿Confirmar que el pedido fue entregado y el cliente pagó en efectivo?'
        : '¿Confirmar que el pedido fue entregado?'
    );

    if (!confirmar) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/pedidos/${idPedido}/marcar-entregado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pagado: metodoPago === 'EFECTIVO' })
      });

      if (!response.ok) {
        throw new Error('Error al marcar como entregado');
      }

      alert('✅ Pedido marcado como entregado' + (metodoPago === 'EFECTIVO' ? ' y pagado' : ''));

      // Recargar datos
      fetchDatos();

    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al marcar como entregado: ' + error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/loginmodal");
      return;
    }

    fetchDatos();
  }, []);

  // 🔥 LÓGICA CORREGIDA PARA DETECTAR COMPRAS UNIFICADAS
  const [comprasUnificadasReales, setComprasUnificadasReales] = useState([]);
  const [pedidosIndividualesReales, setPedidosIndividualesReales] = useState([]);
  const [totalCompras, setTotalCompras] = useState(0);

  useEffect(() => {
    if (loading) return;

    console.log("🔄 Procesando datos para detectar compras unificadas...");
    
    // 1. Si el backend ya devolvió compras unificadas, usarlas directamente
    if (comprasUnificadas.length > 0) {
      console.log("✅ Usando compras unificadas del backend:", comprasUnificadas.length);
      setComprasUnificadasReales(comprasUnificadas);
      setPedidosIndividualesReales(pedidosIndividuales);
      setTotalCompras(comprasUnificadas.length + pedidosIndividuales.length);
      return;
    }
    
    // 2. Si no, procesar los pedidos individuales para detectar compras unificadas
    console.log("🔍 Analizando", pedidosIndividuales.length, "pedidos para detectar compras unificadas...");
    
    // Agrupar pedidos por idCompraUnificada
    const gruposPorCompra = {};
    
    pedidosIndividuales.forEach(pedido => {
      const idCompra = pedido.idCompraUnificada;
      
      if (idCompra && idCompra !== null && idCompra !== undefined && idCompra !== '') {
        if (!gruposPorCompra[idCompra]) {
          gruposPorCompra[idCompra] = [];
        }
        gruposPorCompra[idCompra].push(pedido);
      }
    });
    
    console.log("📊 Grupos detectados:", Object.keys(gruposPorCompra));
    
    // Crear compras unificadas solo para grupos con más de 1 pedido
    const comprasUnificadasDetectadas = [];
    const pedidosIndividualesDetectados = [];
    
    Object.entries(gruposPorCompra).forEach(([idCompra, pedidosEnGrupo]) => {
      console.log(`  Grupo ${idCompra}: ${pedidosEnGrupo.length} pedidos`);
      
      if (pedidosEnGrupo.length > 1) {
        // Es una compra unificada
        const totalGeneral = pedidosEnGrupo.reduce((sum, p) => sum + (p.total || p.montoTotal || 0), 0);
        const primerPedido = pedidosEnGrupo[0];
        
        // Ordenar pedidos por ID (opcional)
        const pedidosOrdenados = [...pedidosEnGrupo].sort((a, b) => a.idPedido - b.idPedido);
        
        // Determinar estado de la compra
        const estados = pedidosOrdenados.map(p => p.estadoPedido);
        const estadoCompra = estados.every(e => e === "COMPLETADO") ? "COMPLETADA" :
                            estados.some(e => e === "PENDIENTE" || e === "PENDIENTE_VERIFICACION") ? "PENDIENTE" : "PROCESANDO";
        
        comprasUnificadasDetectadas.push({
          idCompraUnificada: idCompra,
          pedidos: pedidosOrdenados,
          totalGeneral,
          fechaCompra: primerPedido.fechaPedido || primerPedido.fechaCreacion,
          metodoPago: primerPedido.metodoPago || 'PENDIENTE',
          estadoCompra,
          cantidadPedidos: pedidosOrdenados.length,
          cantidadVendedores: new Set(pedidosOrdenados.map(p => p.vendedor?.idVendedor || p.idVendedor || 0)).size
        });
        
        console.log(`    -> Creando compra unificada: ${idCompra} con ${pedidosOrdenados.length} pedidos, total: $${totalGeneral}`);
      } else {
        // Es un pedido individual (aunque tenga idCompraUnificada)
        pedidosIndividualesDetectados.push(...pedidosEnGrupo);
      }
    });
    
    // Agregar pedidos que no tienen idCompraUnificada
    const pedidosSinIdCompra = pedidosIndividuales.filter(p => 
      !p.idCompraUnificada || 
      p.idCompraUnificada === null || 
      p.idCompraUnificada === undefined || 
      p.idCompraUnificada === ''
    );
    
    pedidosIndividualesDetectados.push(...pedidosSinIdCompra);
    
    // Ordenar compras unificadas por fecha (más reciente primero)
    const comprasOrdenadas = comprasUnificadasDetectadas.sort((a, b) => 
      new Date(b.fechaCompra) - new Date(a.fechaCompra)
    );
    
    // Ordenar pedidos individuales por fecha (más reciente primero)
    const pedidosOrdenados = pedidosIndividualesDetectados.sort((a, b) => 
      new Date(b.fechaPedido || b.fechaCreacion) - new Date(a.fechaPedido || a.fechaCreacion)
    );
    
    console.log("✅ Resultados del procesamiento:");
    console.log(`   Compras unificadas: ${comprasOrdenadas.length}`);
    console.log(`   Pedidos individuales: ${pedidosOrdenados.length}`);
    console.log(`   Total compras: ${comprasOrdenadas.length + pedidosOrdenados.length}`);
    
    // Verificar si hay pedidos #33 y #34 juntos
    const pedidos33y34 = pedidosIndividuales.filter(p => 
      p.idPedido === 33 || p.idPedido === 34
    );
    
    if (pedidos33y34.length > 0) {
      console.log("🔍 Pedidos #33 y #34 encontrados:", pedidos33y34.map(p => ({
        id: p.idPedido,
        idCompra: p.idCompraUnificada,
        estado: p.estadoPedido
      })));
    }
    
    setComprasUnificadasReales(comprasOrdenadas);
    setPedidosIndividualesReales(pedidosOrdenados);
    setTotalCompras(comprasOrdenadas.length + pedidosOrdenados.length);
    
  }, [loading, pedidosIndividuales, comprasUnificadas]);

  return (
    <div style={{
      minHeight: modo === "lista" ? "100vh" : "auto",
      background: modo === "lista" ? "linear-gradient(135deg, #F9FBF7 0%, #ECF2E3 100%)" : "transparent",
      fontFamily: "inherit"
    }}>
      
      {/* HEADER SECTION - Solo en modo lista */}
      {modo === "lista" && (
        <div style={{
          background: "white",
          borderRadius: "0 0 20px 20px",
          padding: "48px 32px",
          marginBottom: "40px",
          boxShadow: "0 4px 20px rgba(90, 143, 72, 0.12)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: "1" }}>
            {/* Icono decorativo */}
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              filter: "drop-shadow(0 4px 8px rgba(90, 143, 72, 0.2))"
            }}>
              🛍️
            </div>

            {/* Título */}
            <div style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#6B7F69",
              marginBottom: "8px",
              fontWeight: "500"
            }}>
              Historial de Compras
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "48px",
              fontWeight: "700",
              color: "#2D3E2B",
              margin: "0 0 16px 0",
              letterSpacing: "1px",
              lineHeight: "1.2"
            }}>
              Mis Compras
            </h1>

            {/* Subtítulo */}
            <p style={{
              color: "#6B7F69",
              fontSize: "16px",
              margin: "0 auto",
              maxWidth: "600px",
              lineHeight: "1.6"
            }}>
              {totalCompras > 0 
                ? `Tienes ${totalCompras} compra${totalCompras > 1 ? 's' : ''} realizada${totalCompras > 1 ? 's' : ''}`
                : "Aquí aparecerán todas tus compras realizadas"
              }
            </p>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div style={{
        maxWidth: modo === "lista" ? "1200px" : "100%",
        margin: modo === "lista" ? "0 auto" : "0",
        padding: modo === "lista" ? "0 20px" : "0",
        marginBottom: modo === "lista" ? "40px" : "0"
      }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
          }}>
            <div style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "5px solid #ECF2E3",
              borderTop: "5px solid #5A8F48",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{
              marginTop: "20px",
              fontSize: "16px",
              color: "#6B7F69",
              fontWeight: "600"
            }}>
              Cargando tus compras...
            </p>
          </div>
        ) : totalCompras === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
            <p style={{
              color: "#2D3E2B",
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 8px 0"
            }}>
              Aún no tienes compras realizadas
            </p>
            <p style={{
              color: "#9AAA98",
              fontSize: "15px",
              margin: "0 0 24px 0"
            }}>
              Solo se muestran pedidos pagados o en verificación
            </p>
            {modo === "lista" && (
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                  border: "none",
                  color: "white",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "15px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
                }}
              >
                Ir a la tienda
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px"
          }}>
            {/* 🔥 SECCIÓN DE COMPRAS UNIFICADAS */}
            {comprasUnificadasReales.length > 0 && modo === "lista" && (
              <div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "20px",
                  fontFamily: "'Playfair Display', serif"
                }}>
                  🛍️ Compras Unificadas ({comprasUnificadasReales.length})
                  <span style={{
                    fontSize: "14px",
                    color: "#6B7F69",
                    marginLeft: "12px",
                    fontWeight: "normal"
                  }}>
                    (Varios pedidos en una sola compra)
                  </span>
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {comprasUnificadasReales.map((compra) => (
                    <div 
                      key={compra.idCompraUnificada} 
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "28px",
                        boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                        border: "2px solid #E8F5E9",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: "22px", 
                            color: "#2D3E2B",
                            fontWeight: "700",
                            marginBottom: "12px",
                            fontFamily: "'Playfair Display', 'Georgia', serif"
                          }}>
                            🛍️ Compra Unificada #{compra.idCompraUnificada}
                          </h3>
                          
                          {/* Estado de la compra */}
                          <div style={{ 
                            display: "inline-block",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            background: compra.estadoCompra === "COMPLETADA" 
                              ? "#E8F5E9" 
                              : compra.estadoCompra === "PENDIENTE" 
                              ? "#FFF3CD" 
                              : "#FFF8E1",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: compra.estadoCompra === "COMPLETADA" 
                              ? "#2E7D32" 
                              : compra.estadoCompra === "PENDIENTE" 
                              ? "#856404" 
                              : "#F57C00",
                            marginBottom: "12px"
                          }}>
                            {compra.estadoCompra === "COMPLETADA" ? "✅ Completada" : 
                             compra.estadoCompra === "PENDIENTE" ? "⏳ Pendiente" : 
                             "🔄 En proceso"}
                          </div>
                          
                          <p style={{ 
                            margin: "12px 0", 
                            color: "#6B7F69", 
                            fontSize: "15px"
                          }}>
                            <span style={{ fontWeight: "600" }}>{compra.cantidadPedidos || compra.pedidos?.length || 0} pedido(s)</span> • 
                            <span style={{ fontWeight: "600" }}> {compra.cantidadVendedores || new Set(compra.pedidos?.map(p => p.vendedor?.idVendedor || p.idVendedor)).size || 0} vendedor(es)</span>
                          </p>
                          
                          {/* Lista de pedidos incluidos */}
                          <div style={{ 
                            marginTop: "16px",
                            background: "#F9FBF7",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid #ECF2E3"
                          }}>
                            <p style={{ 
                              margin: "0 0 8px 0", 
                              fontSize: "14px", 
                              color: "#5A8F48",
                              fontWeight: "600"
                            }}>
                              📋 Pedidos incluidos:
                            </p>
                            <div style={{ 
                              display: "flex", 
                              flexWrap: "wrap", 
                              gap: "8px"
                            }}>
                              {compra.pedidos?.map(p => (
                                <span key={p.idPedido} style={{
                                  background: "#E8F5E9",
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#2D3E2B",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}>
                                  #{p.idPedido} (${money(p.total || p.montoTotal || 0)})
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            {/* Método de pago */}
                            {compra.metodoPago && (
                              <span style={{ 
                                background: "#ECF2E3", 
                                padding: "8px 16px", 
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#5A8F48",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}>
                                {compra.metodoPago === 'EFECTIVO' ? '💵' : 
                                 compra.metodoPago === 'TRANSFERENCIA' ? '🏦' : 
                                 compra.metodoPago === 'TARJETA' ? '💳' : ''}
                                {compra.metodoPago === 'EFECTIVO' ? 'Efectivo' : 
                                 compra.metodoPago === 'TRANSFERENCIA' ? 'Transferencia' : 
                                 compra.metodoPago === 'TARJETA' ? 'Tarjeta' : compra.metodoPago}
                              </span>
                            )}
                            
                            {/* Fecha */}
                            <span style={{ 
                              background: "#FFF3CD", 
                              padding: "8px 16px", 
                              borderRadius: "12px",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#856404",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              📅 {compra.fechaCompra ? new Date(compra.fechaCompra).toLocaleDateString('es-ES') : "Fecha no disponible"}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: "right", minWidth: "150px" }}>
                          <div style={{ fontSize: "15px", color: "#6B7F69", marginBottom: "4px", fontWeight: "600" }}>
                            Total de la compra
                          </div>
                          <div style={{ 
                            fontSize: "36px", 
                            fontWeight: "900", 
                            color: "#5A8F48",
                            fontFamily: "'Playfair Display', serif",
                            marginBottom: "16px"
                          }}>
                            ${money(compra.totalGeneral || 0)}
                          </div>
                        </div>
                      </div>
                      
                      {/* 🔥 BOTONES DE ACCIÓN PARA COMPRAS UNIFICADAS */}
                      <div style={{
                        display: "flex",
                        gap: "12px",
                        paddingTop: "20px",
                        borderTop: "2px solid #ECF2E3"
                      }}>
                        <button
                          onClick={() => {
                            console.log("Ver detalles de compra unificada:", compra.idCompraUnificada);
                            navigate(`/mi-compra-unificada/${compra.idCompraUnificada}`, {
                              state: {
                                compraData: compra,
                                pedidos: compra.pedidos || [],
                                totalCompra: compra.totalGeneral || 0,
                                metodoPago: compra.metodoPago || 'PENDIENTE'
                              }
                            });
                          }}
                          style={{
                            padding: "12px 24px",
                            borderRadius: "12px",
                            border: "2px solid #5A8F48",
                            cursor: "pointer",
                            background: "white",
                            color: "#5A8F48",
                            fontSize: "15px",
                            fontWeight: "700",
                            transition: "all 0.3s ease",
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#ECF2E3";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "white";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          <span>🔍</span>
                          Ver detalles completos
                        </button>
                        
                        {/* Botón para ver factura (si la compra está completada o en verificación) */}
                        {(compra.estadoCompra === "COMPLETADA" || compra.estadoCompra === "PENDIENTE") && (
                          <button
                            onClick={() => {
                              // Para compras unificadas, mostrar un mensaje especial
                              alert("Esta compra unificada contiene múltiples pedidos. Cada pedido tiene su propia factura. Navega a los detalles para ver todas las facturas.");
                            }}
                            style={{
                              padding: "12px 24px",
                              borderRadius: "12px",
                              border: "none",
                              cursor: "pointer",
                              background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                              color: "white",
                              fontSize: "15px",
                              fontWeight: "700",
                              transition: "all 0.3s ease",
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
                            }}
                          >
                            <span>📄</span>
                            Ver facturas
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🔥 SECCIÓN DE PEDIDOS INDIVIDUALES */}
            {pedidosIndividualesReales.length > 0 && (
              <div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2D3E2B",
                  marginBottom: "20px",
                  fontFamily: "'Playfair Display', serif"
                }}>
                  📋 Pedidos Individuales ({pedidosIndividualesReales.length})
                  <span style={{
                    fontSize: "14px",
                    color: "#6B7F69",
                    marginLeft: "12px",
                    fontWeight: "normal"
                  }}>
                    (Compra de un solo vendedor)
                  </span>
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {pedidosIndividualesReales.map((p) => (
                    <div
                      key={p.idPedido}
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "28px",
                        boxShadow: "0 4px 20px rgba(90, 143, 72, 0.1)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 24,
                        flexWrap: "wrap",
                        marginBottom: "20px"
                      }}>
                        {/* Sección izquierda - Info del pedido */}
                        <div style={{ flex: 1, minWidth: "280px" }}>
                          {/* Título con emoji */}
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12, 
                            marginBottom: 12 
                          }}>
                            <span style={{ fontSize: "32px" }}>
                              {getEstadoEmoji(p.estadoPedido)}
                            </span>
                            <h3 style={{ 
                              margin: 0, 
                              fontSize: "22px", 
                              color: "#2D3E2B",
                              fontFamily: "'Playfair Display', 'Georgia', serif",
                              fontWeight: "700"
                            }}>
                              Pedido #{p.idPedido}
                            </h3>
                          </div>
                          
                          {/* Mostrar si pertenece a una compra unificada (DEBUG) */}
                          {p.idCompraUnificada && modo === "lista" && (
                            <div style={{
                              fontSize: "12px",
                              color: "#FF6B6B",
                              marginBottom: "4px",
                              fontStyle: "italic",
                              background: "#FFF5F5",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              display: "inline-block"
                            }}>
                              ⚠️ Tiene idCompraUnificada: {p.idCompraUnificada}
                            </div>
                          )}
                          
                          {/* Fecha completa */}
                          <p style={{ 
                            margin: "8px 0 12px 0", 
                            color: "#6B7F69", 
                            fontSize: "15px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <span style={{ fontSize: "18px" }}>📅</span>
                            {formatearFecha(p.fechaPedido)}
                          </p>
                          
                          {/* Método de pago */}
                          {p.metodoPago && (
                            <div style={{ 
                              display: "inline-block",
                              padding: "6px 12px",
                              borderRadius: "12px",
                              background: "#ECF2E3",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#5A8F48",
                              marginRight: "8px",
                              marginBottom: "8px"
                            }}>
                              {p.metodoPago === 'EFECTIVO' ? '💵 Efectivo' : 
                               p.metodoPago === 'TRANSFERENCIA' ? '🏦 Transferencia' : 
                               p.metodoPago === 'TARJETA' ? '💳 Tarjeta' : p.metodoPago}
                            </div>
                          )}
                          
                          {/* Badge de estado */}
                          <div style={{
                            display: "inline-block",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            background: p.estadoPedido === "COMPLETADO" 
                              ? "#E8F5E9" 
                              : p.estadoPedido === "PENDIENTE"
                              ? "#FFF3CD"
                              : p.estadoPedido === "CANCELADO"
                              ? "#FFEBEE"
                              : "#FFF8E1",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: p.estadoPedido === "COMPLETADO" 
                              ? "#2E7D32" 
                              : p.estadoPedido === "PENDIENTE"
                              ? "#856404"
                              : p.estadoPedido === "CANCELADO"
                              ? "#C62828"
                              : "#F57C00"
                          }}>
                            {getEstadoLabel(p.estadoPedido)}
                          </div>
                        </div>

                        {/* Sección derecha - Precio y acciones */}
                        <div style={{ 
                          textAlign: "right",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 16
                        }}>
                          {/* Precio destacado */}
                          <div style={{ 
                            fontWeight: "800", 
                            fontSize: "36px", 
                            color: "#5A8F48",
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            lineHeight: 1
                          }}>
                            ${money(p.total || p.montoTotal || 0)}
                          </div>

                          {/* Botones de acción - SOLO EN MODO LISTA */}
                          {modo === "lista" && (
                            <div style={{ display: "flex", gap: 12 }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/pedido/${p.idPedido}`);
                                }}
                                style={{
                                  padding: "12px 24px",
                                  borderRadius: "12px",
                                  border: "2px solid #5A8F48",
                                  cursor: "pointer",
                                  background: "white",
                                  color: "#5A8F48",
                                  fontSize: "15px",
                                  fontWeight: "700",
                                  transition: "all 0.3s ease",
                                  whiteSpace: "nowrap",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px"
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = "#ECF2E3";
                                  e.target.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = "white";
                                  e.target.style.transform = "translateY(0)";
                                }}
                              >
                                <span>🔍</span>
                                Ver detalles
                              </button>

                              {estadosConFactura.includes(p.estadoPedido) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/factura/${p.idPedido}`);
                                  }}
                                  style={{
                                    padding: "12px 24px",
                                    borderRadius: "12px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: "linear-gradient(135deg, #5A8F48 0%, #4A7A3A 100%)",
                                    color: "white",
                                    fontSize: "15px",
                                    fontWeight: "700",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 12px rgba(90, 143, 72, 0.25)",
                                    whiteSpace: "nowrap",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 6px 16px rgba(90, 143, 72, 0.35)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(90, 143, 72, 0.25)";
                                  }}
                                >
                                  <span>📄</span>
                                  Ver factura
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {modo === "lista" && <Footer />}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}