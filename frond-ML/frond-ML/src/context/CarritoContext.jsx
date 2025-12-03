import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const agregarCarrito = (producto, cantidad) => {
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

  const limpiarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{ carrito, agregarCarrito, limpiarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);
