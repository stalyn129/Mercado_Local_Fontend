import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext.jsx";

export default function ProductoDetalle() {

  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const { agregarCarrito } = useCarrito();

  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [imgSeleccionada, setImgSeleccionada] = useState(null);

  const [favorito, setFavorito] = useState(false);

  // 🔥 Valoraciones
  const [nuevaValoracion, setNuevaValoracion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState("");

  // MODALES
  const [showEnvio, setShowEnvio] = useState(false);
  const [showReembolso, setShowReembolso] = useState(false);

  // MENU DE VENDEDOR
  const [menuOpen, setMenuOpen] = useState(false);

  // ================= Cargar Información Completa =======================
  useEffect(() => {
    const getProducto = async () => {
      try {
        const res = await fetch(`${API_URL}/productos/detalle/${id}`);
        const data = await res.json();

        setProducto(data);
        setImgSeleccionada(data.imagenProducto);
      } catch (err) {
        console.log("❌ Error obteniendo detalle:", err);
      }
    };
    getProducto();
  }, [id]);

  if (!producto) return <div style={{padding:50,fontSize:24}}>Cargando...</div>;


  // =================== AÑADIR AL CARRITO =====================
  const handleAddCarrito = () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    agregarCarrito({ ...producto, cantidad });
  };

  const handleComprarAhora = () => {
    handleAddCarrito();
    navigate("/carrito");
  };


  // =================== FAVORITO =====================
  const handleFavorito = () => {
    setFavorito(!favorito);
    // Si deseas guardarlo en BD luego te genero el endpoint
  };


  // =================== RESEÑA BACKEND =====================
  const enviarReseña = async () => {

    const token = localStorage.getItem("token");
    if (!token) return alert("Debes iniciar sesión para valorar");

    const body = {
      idProducto: producto.idProducto,
      calificacion: nuevaValoracion,
      comentario: nuevoComentario
    };

    const res = await fetch(`${API_URL}/valoraciones/crear`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
      body: JSON.stringify(body)
    });

    if(res.ok){
      alert("Reseña registrada ✔");
      setNuevoComentario("");
      setNuevaValoracion(5);
      window.location.reload();
    }
  };


  return (
    <div style={{padding:"50px 80px",background:"#FFF8EA",display:"grid",gridTemplateColumns:"50% 50%"}}>

      {/* ================= IMAGENES ================= */}
      <div>
        <img src={imgSeleccionada} style={{width:"100%",borderRadius:"18px"}} />

        {/* Miniaturas */}
        <div style={{display:"flex",gap:10,marginTop:12}}>
          <img src={producto.imagenProducto}
               onClick={()=>setImgSeleccionada(producto.imagenProducto)}
               style={{width:70,height:70,borderRadius:10,objectFit:"cover",
               border: imgSeleccionada===producto.imagenProducto?"3px solid #5A8F48":"2px solid #bbb",
               cursor:"pointer"}} />
        </div>

        {/* ================= TITULO ================= */}
        <h1 style={{fontSize:40,fontWeight:"900",marginTop:20,color:"#2E462F"}}>
          {producto.nombreEmpresa}
        </h1>

        {/* Vendedor + Menu */}
        <div style={{display:"flex",alignItems:"center",gap:10,fontSize:19,marginTop:3}}>
          👨‍🌾 {producto.nombreVendedor}
          <button onClick={()=>setMenuOpen(!menuOpen)} style={menuBtn}>⋯</button>
        </div>

        {menuOpen && (
          <div style={menuBox}>
            <p onClick={()=>navigate(`/vendedor/${producto.idVendedor}`)}>👤 Ver Perfil</p>
            <p onClick={()=>navigate(`/productos/vendedor/${producto.idVendedor}`)}>🛒 Más productos</p>
            <p>💬 Contactar vendedor</p>
            <p onClick={handleFavorito}>⭐ Guardar vendedor</p>
          </div>
        )}


        {/* Precio + Unidad + Cantidad */}
        <h2 style={{marginTop:15,fontSize:32,color:"#3A6D38"}}>${producto.precioProducto}</h2>

        <div style={{display:"flex",gap:35,alignItems:"center",marginTop:15}}>
          <span style={{fontWeight:"bold"}}>{producto.unidad}</span>

          <div style={{display:"flex",gap:10,background:"#EEE",padding:"6px 15px",borderRadius:10}}>
            <button onClick={()=>cantidad>1&&setCantidad(cantidad-1)}>-</button>
            {cantidad}
            <button onClick={()=>setCantidad(cantidad+1)}>+</button>
          </div>
        </div>

        {/* BOTONES PRINCIPALES */}
        <button style={btnCarrito} onClick={handleAddCarrito}>🛒 Añadir al carrito</button>
        <button style={btnComprar} onClick={handleComprarAhora}>⚡ Comprar Ahora</button>

        {/* FAVORITO */}
        <button onClick={handleFavorito} style={btnFav}>
          {favorito?"❤️ Guardado":"🤍 Favorito"}
        </button>

        <button style={btnEnvio} onClick={()=>setShowEnvio(true)}>🚚 Política Envío</button>
        <button style={btnRembolso} onClick={()=>setShowReembolso(true)}>💵 Reembolso</button>
      </div>




      {/* ============================ COLUMNA DERECHA ============================== */}
      <div>

        <h1>Descripción</h1>
        <p style={box}>{producto.descripcionProducto}</p>

        {/* CALIFICACIONES */}
        <h2 style={{marginTop:30}}>Calificaciones ⭐</h2>
        <h1 style={{fontSize:50,fontWeight:"900",color:"#F4B419"}}>
          {producto.promedioValoracion?.toFixed(1)||0}
        </h1>
        <p>{producto.totalValoraciones} reseñas</p>

        {/* LISTA DE RESEÑAS */}
        <div style={{marginTop:25}}>
          {producto.valoraciones?.length>0 ?
            producto.valoraciones.map((v,i)=>(
              <div key={i} style={{marginBottom:10}}>
                <strong>{v.nombreConsumidor}</strong> ⭐ {v.calificacion}
                <p>{v.comentario}</p>
              </div>
            ))
          : <p>Aún no hay reseñas.</p>}
        </div>


        {/* AGREGAR RESEÑA */}
        <h3 style={{marginTop:35}}>Escribir reseña:</h3>
        <select value={nuevaValoracion} onChange={e=>setNuevaValoracion(e.target.value)} style={input}>
          <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
        </select>

        <textarea placeholder="Escribe tu comentario..."
                  value={nuevoComentario}
                  onChange={e=>setNuevoComentario(e.target.value)}
                  style={{width:"90%",height:90,marginTop:10,padding:12}}>
        </textarea>

        <button onClick={enviarReseña} style={btnSend}>Enviar Reseña</button>

      </div>


      {/* ================= MODALES FRONEND ================= */}
      {showEnvio && <Modal close={()=>setShowEnvio(false)} title="Política de Envío">
        📦 Envío dentro de 24-48 horas<br/>🚚 Entregas dentro de la ciudad<br/>🌱 Producto fresco garantizado
      </Modal>}

      {showReembolso && <Modal close={()=>setShowReembolso(false)} title="Política de Reembolso">
        💵 Reembolso hasta 48h tras entrega<br/>📸 Requiere evidencia<br/>❗ No cubre daño por mal uso
      </Modal>}

    </div>
  );
}


// ================= MODAL COMPONENT =================
function Modal({title,children,close}){
  return(
    <div style={modalOver}>
      <div style={modalCard}>
        <h2>{title}</h2>
        <p style={{marginTop:10}}>{children}</p>
        <button onClick={close} style={btnCerrar}>Cerrar ✖</button>
      </div>
    </div>
  );
}



// ==================== ESTILOS ====================

const box = {background:"#E4F3DC",padding:22,borderRadius:16};

const btnCarrito={marginTop:28,width:"60%",padding:"14px",borderRadius:12,border:"none",background:"#62B257",color:"#fff",fontSize:18,fontWeight:800,cursor:"pointer"};
const btnComprar={marginTop:15,width:"60%",padding:"14px",borderRadius:12,border:"none",background:"#111",color:"#fff",fontWeight:800,fontSize:18};
const btnFav={marginTop:15,width:"40%",padding:"10px",background:"#FF7B9C",border:"none",borderRadius:12,fontWeight:800,cursor:"pointer"};

const btnEnvio={marginTop:10,width:"40%",padding:10,background:"#FFD56F",borderRadius:10,border:"none",cursor:"pointer"};
const btnRembolso={marginTop:10,width:"40%",padding:10,background:"#FFF0C2",borderRadius:10,border:"none",cursor:"pointer"};

const menuBtn={border:"none",fontSize:24,background:"none",cursor:"pointer"};
const menuBox={background:"#fff",position:"absolute",padding:12,borderRadius:10,marginTop:5,boxShadow:"0 4px 10px rgba(0,0,0,.15)"};

const input={padding:10,width:"120px",marginTop:10};
const btnSend={padding:"10px 20px",marginTop:10,background:"#46A246",border:"none",borderRadius:8,fontWeight:"bold",cursor:"pointer"};

const modalOver={position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center"};
const modalCard={background:"#fff",padding:35,borderRadius:18,width:"430px",textAlign:"center"};
const btnCerrar={marginTop:18,padding:"10px 18px",background:"red",color:"#fff",border:"none",borderRadius:8,fontWeight:"600",cursor:"pointer"};
