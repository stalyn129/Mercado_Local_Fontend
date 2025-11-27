import { createContext, useContext, useState, useEffect } from "react";

export const CarritoContext = createContext();

export function CarritoProvider({ children }) {

  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const agregarCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.idProducto === producto.idProducto);
      if (existe) {
        return prev.map(p => 
          p.idProducto === producto.idProducto 
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } 
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  return (
    <CarritoContext.Provider value={{ carrito, agregarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}

// 🔥 Este es el hook que te estaba faltando
export function useCarrito() {
  return useContext(CarritoContext);
}
