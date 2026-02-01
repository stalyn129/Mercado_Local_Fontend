// src/components/FacturaPDF.jsx
import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { useParams, useNavigate } from 'react-router-dom';

const FacturaPDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarFactura();
  }, [id]);

  const cargarFactura = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/facturas/${id}/datos-pdf`);
      
      if (!response.ok) {
        throw new Error('Error al cargar la factura');
      }
      
      const data = await response.json();
      setFactura(data);
    } catch (err) {
      console.error('Error al cargar factura:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = () => {
    if (!factura) return;
    
    const element = document.getElementById('factura-container');
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `factura_${factura.numeroFactura}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };

    html2pdf().set(opt).from(element).save();
  };

  const imprimirFactura = () => {
    const printContent = document.getElementById('factura-container').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-700 font-semibold">Error</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-700 font-semibold">Factura no encontrada</h3>
          <p className="text-yellow-600 mt-1">No se pudo cargar la información de la factura.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado con botones */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Factura #{factura.numeroFactura}</h1>
              <p className="text-gray-600">
                Pedido #{factura.idPedido} • {formatearFecha(factura.fechaEmision)}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                ← Volver
              </button>
              
              <button
                onClick={generarPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>
              
              <button
                onClick={imprimirFactura}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
            </div>
          </div>
          
          {/* Estado de la factura */}
          <div className="mt-4 inline-block">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              factura.estado === 'Emitida' ? 'bg-green-100 text-green-800' :
              factura.estado === 'Pagada' ? 'bg-blue-100 text-blue-800' :
              factura.estado === 'Anulada' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {factura.estado}
            </span>
          </div>
        </div>

        {/* CONTENEDOR DE LA FACTURA - Este es el que se convierte a PDF */}
        <div 
          id="factura-container" 
          className="bg-white p-8 shadow-lg rounded-lg"
          style={{ 
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            lineHeight: '1.5'
          }}
        >
          {/* Encabezado de la factura */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">MY HARVEST</h1>
            <h2 className="text-xl font-semibold text-gray-600 mt-1">MERCADO LOCAL</h2>
            <div className="border-t-2 border-gray-300 my-6 mx-auto w-32"></div>
          </div>

          {/* Información de la factura */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">N° FACTURA</p>
                <p className="text-2xl font-bold text-gray-800">{factura.numeroFactura}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pedido</p>
                <p className="text-xl font-bold text-gray-800">#{factura.idPedido}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Detalles del Pedido</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-600">Fecha de emisión</p>
                    <p className="text-gray-800">{formatearFecha(factura.fechaEmision)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Método de pago</p>
                    <p className="text-gray-800">{factura.metodoPago || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-600">Cliente</p>
                    <p className="text-gray-800">{factura.nombreCliente} {factura.apellidoCliente}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Cédula/RUC</p>
                    <p className="text-gray-800">{factura.cedulaCliente || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <p className="font-semibold text-gray-600">Email</p>
                  <p className="text-gray-800">{factura.correoCliente || 'N/A'}</p>
                </div>
                
                {factura.telefonoCliente && (
                  <div>
                    <p className="font-semibold text-gray-600">Teléfono</p>
                    <p className="text-gray-800">{factura.telefonoCliente}</p>
                  </div>
                )}
                
                {factura.direccionCliente && (
                  <div>
                    <p className="font-semibold text-gray-600">Dirección</p>
                    <p className="text-gray-800">{factura.direccionCliente}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estado Actual */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Estado Actual</h3>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">ESTADO ACTUAL</p>
              <p className={`text-xl font-bold ${
                factura.estado === 'Emitida' ? 'text-green-600' :
                factura.estado === 'Pagada' ? 'text-blue-600' :
                factura.estado === 'Anulada' ? 'text-red-600' :
                'text-gray-700'
              }`}>
                {factura.estado}
              </p>
            </div>
          </div>

          {/* Productos del Pedido */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Productos del Pedido</h3>
            
            {factura.detallesPorVendedor && factura.detallesPorVendedor.length > 0 ? (
              factura.detallesPorVendedor.map((vendedor, vIndex) => (
                <div key={vIndex} className="mb-6 last:mb-0">
                  {vendedor.razonSocial && (
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-700 text-base">Vendedor: {vendedor.razonSocial}</h4>
                      {vendedor.ruc && (
                        <p className="text-sm text-gray-500">RUC: {vendedor.ruc}</p>
                      )}
                    </div>
                  )}
                  
                  {vendedor.productos && vendedor.productos.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 text-sm">PRODUCTO</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 text-sm">VENDEDOR</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 text-sm">CANT.</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 text-sm">PRECIO UNIT.</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 text-sm">SUBTOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendedor.productos.map((producto, pIndex) => (
                            <tr key={pIndex} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-gray-800">{producto.nombre}</td>
                              <td className="border border-gray-300 px-4 py-3 text-gray-800">{vendedor.razonSocial || 'N/A'}</td>
                              <td className="border border-gray-300 px-4 py-3 text-center text-gray-800">{producto.cantidad}</td>
                              <td className="border border-gray-300 px-4 py-3 text-right text-gray-800">${producto.precioUnitario?.toFixed(2)}</td>
                              <td className="border border-gray-300 px-4 py-3 text-right text-gray-800 font-medium">${producto.subtotal?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-gray-200 rounded bg-gray-50">
                <p className="text-gray-500">No hay productos registrados en esta factura</p>
              </div>
            )}

            {/* Resumen de Totales */}
            <div className="mt-8">
              <div className="max-w-md ml-auto">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${factura.subtotal?.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">IVA (12%)</span>
                    <span className="font-medium">${factura.iva?.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">TOTAL A PAGAR</span>
                      <span className="text-xl font-bold text-gray-800">${factura.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 italic text-center">
                Factura registrada en sistema
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-8 text-center">
            <h4 className="font-bold text-gray-800 text-lg mb-2">My Harvest</h4>
            <p className="text-gray-600 text-sm mb-1">
              Gracias por confiar en nuestra plataforma de productos frescos y locales
            </p>
            <p className="text-gray-500 text-xs italic">
              Documento válido para efectos tributarios
            </p>
          </div>
        </div>

        {/* Nota para el usuario */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Para una mejor calidad del PDF, asegúrate de que la página esté completamente cargada antes de descargar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacturaPDF;