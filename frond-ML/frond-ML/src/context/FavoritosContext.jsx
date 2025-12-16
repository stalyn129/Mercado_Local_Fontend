import { createContext, useContext, useEffect, useState } from "react";

const FavoritosContext = createContext();

export function FavoritosProvider({ children }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [favoritos, setFavoritos] = useState([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(true);

  const cargarFavoritos = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    if (!user?.idConsumidor || !token) {
      setFavoritos([]);
      setLoadingFavoritos(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/favoritos/listar/${user.idConsumidor}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setFavoritos(data);
      } else {
        setFavoritos([]);
      }
    } catch {
      setFavoritos([]);
    } finally {
      setLoadingFavoritos(false);
    }
  };

  const esFavorito = (idProducto) =>
    favoritos.some((f) => f.idProducto === idProducto);

  useEffect(() => {
    cargarFavoritos();
  }, []);

  return (
    <FavoritosContext.Provider
      value={{
        favoritos,
        setFavoritos,
        cargarFavoritos,
        esFavorito,
        loadingFavoritos,
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export const useFavoritos = () => useContext(FavoritosContext);
