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
  // AGREGAR PRODUCTO
  // ============================
  const agregarCarrito = async (idProducto, cantidad = 1) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = getHeaders();

    if (!user?.idConsumidor || !headers) {
      throw new Error("Usuario no autenticado");
    }

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

    await cargarCarrito();
  };

  // ============================
  // ACTUALIZAR CANTIDAD
  // (si llega a 0 → backend elimina)
  // ============================
  const actualizarCantidad = async (idItem, cantidad) => {
    const headers = getHeaders();
    if (!headers) return;

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
  };

  // ============================
  // ELIMINAR PRODUCTO
  // ============================
  const eliminarProducto = async (idItem) => {
    const headers = getHeaders();
    if (!headers) return;

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
  };

  // ============================
  // VACIAR CARRITO (REAL)
  // ============================
  const limpiarCarrito = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const headers = getHeaders();

    if (!user?.idConsumidor || !headers) return;

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
