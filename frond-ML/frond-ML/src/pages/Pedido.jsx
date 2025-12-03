useEffect(() => {
  cargarPedido();
}, []);

const cargarPedido = async () => {
  const res = await fetch(`${API}/pedidos/${id}/detalles`, {
    headers: { Authorization: `Bearer ${user.token}` }
  });
  const data = await res.json();
  setPedido(data);
};
