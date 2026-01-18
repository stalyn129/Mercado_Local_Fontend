import { createContext, useContext, useEffect, useState } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // ============================
  // HEADERS CON TOKEN
  // ============================
  const getHeaders = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ============================
  // CARGAR CARRITO (REAL)
  // ============================
  const cargarCarrito = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const headers = getHeaders();

      if (!user?.idConsumidor || !headers) {
        setCarrito([]);
        return;
      }

      const res = await fetch(
        `${API_URL}/carrito/${user.idConsumidor}`,
        { headers }
      );

      if (!res.ok) {
        setCarrito([]);
        return;
      }

      const data = await res.json();
      setCarrito(data.items || []);
    } catch (error) {
      console.error("❌ Error al cargar carrito:", error);
      setCarrito([]);
    }
  };

  // ============================
  // AGREGAR PRODUCTO (MEJORADO)
  // ============================
  const agregarCarrito = async (idProducto, cantidad = 1) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = getHeaders();

    if (!user?.idConsumidor || !headers) {
      throw new Error("Usuario no autenticado");
    }

    try {
      // 🔍 PASO 1: Verificar si el producto ya está en el carrito
      const itemExistente = carrito.find(
        item => item.producto?.idProducto === idProducto
      );

      if (itemExistente) {
        // ✅ Si existe, actualizar la cantidad (sumar la nueva cantidad)
        console.log(`📦 Producto ya en carrito. Incrementando cantidad...`);
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        
        const res = await fetch(
          `${API_URL}/carrito/item/${itemExistente.idItem}/cantidad?cantidad=${nuevaCantidad}`,
          {
            method: "PUT",
            headers,
          }
        );

        if (!res.ok) {
          throw new Error("Error al actualizar cantidad");
        }

        console.log(`✅ Cantidad actualizada a ${nuevaCantidad}`);
      } else {
        // ➕ Si NO existe, agregar como nuevo item
        console.log(`➕ Agregando nuevo producto al carrito...`);
        
        const res = await fetch(`${API_URL}/carrito/agregar`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            idConsumidor: user.idConsumidor,
            idProducto,
            cantidad,
          }),
        });

        if (!res.ok) {
          throw new Error("Error al agregar al carrito");
        }

        console.log(`✅ Producto agregado al carrito`);
      }

      // 🔄 Recargar el carrito para reflejar los cambios
      await cargarCarrito();
      
    } catch (error) {
      console.error("❌ Error en agregarCarrito:", error);
      throw error;
    }
  };

  // ============================
  // ACTUALIZAR CANTIDAD
  // (si llega a 0 → backend elimina)
  // ============================
  const actualizarCantidad = async (idItem, cantidad) => {
    const headers = getHeaders();
    if (!headers) return;

    try {
      const res = await fetch(
        `${API_URL}/carrito/item/${idItem}/cantidad?cantidad=${cantidad}`,
        {
          method: "PUT",
          headers,
        }
      );

      if (!res.ok) {
        throw new Error("Error al actualizar cantidad");
      }

      await cargarCarrito();
    } catch (error) {
      console.error("❌ Error al actualizar cantidad:", error);
      throw error;
    }
  };

  // ============================
  // ELIMINAR PRODUCTO
  // ============================
  const eliminarProducto = async (idItem) => {
    const headers = getHeaders();
    if (!headers) return;

    try {
      const res = await fetch(
        `${API_URL}/carrito/item/${idItem}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        throw new Error("Error al eliminar producto");
      }

      await cargarCarrito();
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error);
      throw error;
    }
  };

  // ============================
  // VACIAR CARRITO (REAL)
  // ============================
  const limpiarCarrito = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = getHeaders();

    if (!user?.idConsumidor || !headers) return;

    try {
      const res = await fetch(
        `${API_URL}/carrito/vaciar/${user.idConsumidor}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        throw new Error("Error al vaciar carrito");
      }

      setCarrito([]);
    } catch (error) {
      console.error("❌ Error al vaciar carrito:", error);
      throw error;
    }
  };

  // ============================
  // CARGAR AL INICIAR
  // ============================
  useEffect(() => {
    cargarCarrito();
  }, []);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        cargarCarrito,
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