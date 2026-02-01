import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
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
  // CARGAR CARRITO (MEJORADO CON CALLBACK)
  // ============================
  const cargarCarrito = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = getHeaders();

      console.log("🔄 Intentando cargar carrito...");
      console.log("👤 Usuario:", user);
      console.log("🔑 Headers disponibles:", !!headers);

      if (!user?.idConsumidor || !headers) {
        console.log("⚠️ No hay usuario o token, carrito vacío");
        setCarrito([]);
        return;
      }

      setLoading(true);
      const res = await fetch(
        `${API_URL}/carrito/${user.idConsumidor}`,
        { 
          headers,
          cache: 'no-cache' // Evitar caché
        }
      );

      console.log("📡 Respuesta del servidor:", res.status);

      if (!res.ok) {
        console.log("❌ Error al cargar carrito, estado:", res.status);
        setCarrito([]);
        return;
      }

      const data = await res.json();
      console.log("✅ Carrito cargado:", data.items?.length || 0, "productos");
      setCarrito(data.items || []);
    } catch (error) {
      console.error("❌ Error al cargar carrito:", error);
      setCarrito([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // ============================
  // AGREGAR PRODUCTO (MEJORADO)
  // ============================
  const agregarCarrito = async (idProducto, cantidad = 1) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
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
  // VACIAR CARRITO
  // ============================
  const limpiarCarrito = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
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
  // SISTEMA DE ESCUCHA DE AUTENTICACIÓN
  // ============================
  useEffect(() => {
    // Cargar carrito cuando el componente se monta
    cargarCarrito();

    // Escuchar cambios en localStorage para detectar login/logout
    const handleStorageChange = (event) => {
      if (event.key === "authToken" || event.key === "user") {
        console.log("🔔 Cambio detectado en autenticación, recargando carrito...");
        setTimeout(() => {
          cargarCarrito();
        }, 500); // Pequeño delay para asegurar que el token esté guardado
      }
    };

    // Escuchar eventos de localStorage
    window.addEventListener("storage", handleStorageChange);

    // También escuchar eventos personalizados (para cambios en la misma pestaña)
    const handleAuthChange = () => {
      console.log("🎯 Evento de autenticación detectado, recargando carrito...");
      setTimeout(() => {
        cargarCarrito();
      }, 500);
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [cargarCarrito]);

  // ============================
  // SISTEMA DE POLLING DE RESPALDO
  // (Para cuando los eventos no funcionen)
  // ============================
  useEffect(() => {
    let lastToken = localStorage.getItem("authToken");
    let lastUserId = null;
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.idConsumidor) {
      lastUserId = user.idConsumidor;
    }

    // Verificar cambios cada 2 segundos
    const checkAuthInterval = setInterval(() => {
      const currentToken = localStorage.getItem("authToken");
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserId = currentUser?.idConsumidor;

      // Si el token cambió o el usuario cambió
      if (currentToken !== lastToken || currentUserId !== lastUserId) {
        console.log("🔄 Cambio de autenticación detectado via polling");
        lastToken = currentToken;
        lastUserId = currentUserId;
        cargarCarrito();
      }
    }, 2000); // Revisar cada 2 segundos

    return () => clearInterval(checkAuthInterval);
  }, [cargarCarrito]);

  // ============================
  // FUNCIÓN PARA FORZAR RECARGA
  // ============================
  const recargarCarrito = () => {
    console.log("🔄 Forzando recarga de carrito...");
    cargarCarrito();
  };

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        loading,
        cargarCarrito,
        recargarCarrito,
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