import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  // Obtener usuario logueado
  const user = JSON.parse(localStorage.getItem("user"));
  const carritoKey = user?.idConsumidor ? `carrito_${user.idConsumidor}` : null;

  const [carrito, setCarrito] = useState([]);

  // ============================
  // CARGAR CARRITO DEL USUARIO
  // ============================
  useEffect(() => {
    if (carritoKey) {
      const carritoGuardado = localStorage.getItem(carritoKey);
      setCarrito(carritoGuardado ? JSON.parse(carritoGuardado) : []);
    } else {
      setCarrito([]); // Sin usuario = carrito vacío
    }
  }, [carritoKey]);

  // ============================
  // GUARDAR CARRITO AUTOMÁTICAMENTE
  // ============================
  useEffect(() => {
    if (carritoKey && carrito.length >= 0) {
      localStorage.setItem(carritoKey, JSON.stringify(carrito));
    }
  }, [carrito, carritoKey]);

  // ============================
  // AGREGAR PRODUCTO AL CARRITO
  // ============================
  const agregarCarrito = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      const existente = prev.find((p) => p.idProducto === producto.idProducto);

      if (existente) {
        return prev.map((p) =>
          p.idProducto === producto.idProducto
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        );
      }

      return [...prev, { ...producto, cantidad }];
    });
  };

  // ============================
  // ACTUALIZAR CANTIDAD
  // ============================
  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      return eliminarProducto(id);
    }
    
    setCarrito((prev) =>
      prev.map((item) =>
        item.idProducto === id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
  };

  // ============================
  // ELIMINAR PRODUCTO
  // ============================
  const eliminarProducto = (id) => {
    setCarrito((prev) => prev.filter((item) => item.idProducto !== id));
  };

  // ============================
  // LIMPIAR CARRITO
  // ============================
  const limpiarCarrito = () => {
    setCarrito([]);
    if (carritoKey) {
      localStorage.removeItem(carritoKey);
    }
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        setCarrito,
        agregarCarrito,
        actualizarCantidad,
        eliminarProducto,
        limpiarCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);