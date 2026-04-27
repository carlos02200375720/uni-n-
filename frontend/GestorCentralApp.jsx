import React, { useEffect, useRef, useState } from 'react';

// --- IMPORTACIÓN DE MÓDULOS DE LA TIENDA ---
import { PaginaInicio } from './tienda/PaginaInicio';
import { PaginaDetalleProducto } from './tienda/PaginaDetalleProducto';
import { PaginaCarrito } from './tienda/PaginaCarrito';
import PaginaCheckout from './tienda/PaginaCheckout';
import PaginaAgradecimiento from './tienda/PaginaAgradecimiento';

// --- IMPORTACIÓN DE MÓDULOS DE MENSAJERÍA ---
import { PaginaInicioChat } from './chat/PaginaInicioChat';
import { VentanaChat } from './chat/VentanaChat';

// --- IMPORTACIÓN DE MÓDULOS SOCIALES Y USUARIO ---
import PaginaInicioSocial from './social/PaginaInicioSocial';
import PaginaPerfil from './perfil/PaginaPerfil';
import { resolveApiBaseUrl } from './utils/api';
import { obtenerSocketChat } from './utils/socket';

// --- COMPONENTES GLOBALES ---

import BarraNavegacion from './components/BarraNavegacion';
import PanelAdmin from './admin/PanelAdmin';

/**
 * GESTOR CENTRAL APP
 * Este es el cerebro del Frontend. Se encarga de:
 * 1. Controlar la navegación (enrutamiento manual).
 * 2. Gestionar el estado global (carrito, usuario actual, selección).
 * 3. Servir como puente entre todas las páginas.
 */
const GestorCentralApp = () => {
  const apiBaseUrl = resolveApiBaseUrl();

  // Función para recargar productos desde el backend
  const recargarProductosDesdeBackend = async () => {
    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/tienda/productos?username=${usuario.username}`);
      if (!respuesta.ok) throw new Error('No se pudo obtener productos');
      const datos = await respuesta.json();
      const productosApi = Array.isArray(datos) ? datos.map(normalizarProducto) : [];
      setProductos(productosApi);
    } catch (error) {
      console.error('No se pudieron recargar los productos desde el backend.', error);
    }
  };

  // Mostrar panel admin si la URL contiene '/admin'
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return <PanelAdmin recargarProductos={recargarProductosDesdeBackend} />;
  }
  const imagenPorDefecto = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  const claveSesionUsuario = 'union-usuario-sesion';
  const combinarProductosSinDuplicados = (productosBase, productosExtra = []) => {
    const mapaProductos = new Map();

    [...productosBase, ...productosExtra].forEach((producto) => {
      mapaProductos.set(producto.id, producto);
    });

    return Array.from(mapaProductos.values());
  };

  const normalizarProducto = (producto, indice = 0) => {
    const imagenes = Array.isArray(producto.imagenes)
      ? producto.imagenes.filter((imagen) => typeof imagen === 'string' && imagen.trim())
      : [];
    const imagenPrincipal = imagenes[0] || producto.imagen || imagenPorDefecto;
    const precio = Number(producto.precio ?? 0);
    const precioOriginal = Number(producto.precioOriginal ?? precio) || precio;
    const descuentoCalculado = Number(producto.descuento ?? 0) || (precioOriginal > precio && precioOriginal > 0
      ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
      : 0);
    const comentarios = Array.isArray(producto.comentarios) ? producto.comentarios : [];
    const tallas = Array.isArray(producto.tallas)
      ? producto.tallas.filter((talla) => typeof talla === 'string' && talla.trim())
      : [];
    const colores = Array.isArray(producto.colores)
      ? producto.colores.filter((color) => typeof color === 'string' && color.trim())
      : [];

    return {
      ...producto,
      descripcion: producto.descripcion ?? producto.desc ?? '',
      desc: producto.desc ?? producto.descripcion ?? '',
      precio,
      precioOriginal,
      descuento: descuentoCalculado,
      oferta: Boolean(producto.oferta || descuentoCalculado > 0 || precioOriginal > precio),
      imagen: imagenPrincipal,
      imagenes: imagenes.length > 0 ? imagenes : [imagenPrincipal],
      likesCount: Number(producto.likesCount ?? producto.likes ?? [128, 94, 76, 51, 37, 22, 18][indice % 7] ?? 0),
      comentarios,
      tallas,
      colores,
      comentariosCount: Number(producto.comentariosCount ?? comentarios.length ?? [18, 12, 9, 7, 5, 4, 3][indice % 7] ?? 0),
      usuarioLeDioLike: Boolean(producto.usuarioLeDioLike)
    };
  };

  const normalizarPublicacion = (publicacion, indice = 0) => {
    const mediaUrl = publicacion.mediaUrl || publicacion.urlContenido || publicacion.portada || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900';

    return {
      ...publicacion,
      id: String(publicacion.id ?? indice),
      usuario: String(publicacion.usuario || 'usuario').replace(/^@/, ''),
      descripcion: publicacion.descripcion ?? publicacion.desc ?? '',
      desc: publicacion.desc ?? publicacion.descripcion ?? '',
      mediaUrl,
      portada: publicacion.portada || mediaUrl,
      tipoContenido: publicacion.tipoContenido || publicacion.tipo || 'imagen',
      likes: Number(publicacion.likes ?? 0),
      comentarios: Number(publicacion.comentarios ?? publicacion.comentariosCount ?? 0),
      listaComentarios: Array.isArray(publicacion.listaComentarios) ? publicacion.listaComentarios : [],
      usuarioDioLike: Boolean(publicacion.usuarioDioLike),
      usuarioDioDislike: Boolean(publicacion.usuarioDioDislike)
    };
  };

  // Estado de navegación principal
  const [seccionActual, setSeccionActual] = useState('tienda'); 
  
  // Estados de selección (para pantallas que se superponen)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const contenedorPrincipalRef = useRef(null);
  
  // Estado de datos compartidos (El Carrito)
  const [carrito, setCarrito] = useState([]);

  // Eliminados datos de prueba (productosMock y productoDemoVariantes).
  const [productos, setProductos] = useState([]);
  const [usuario, setUsuario] = useState(() => ({ username: 'visitante', nombre: 'Visitante' }));
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return Boolean(window.localStorage.getItem(claveSesionUsuario));
  });

  const [productosConMeGusta, setProductosConMeGusta] = useState([]);
  const [publicacionesSociales, setPublicacionesSociales] = useState([]);
  const [chats, setChats] = useState([]);
  const [llamadaEntranteGlobal, setLlamadaEntranteGlobal] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (usuarioRegistrado) {
      window.localStorage.setItem(claveSesionUsuario, JSON.stringify(usuario));
    } else {
      window.localStorage.removeItem(claveSesionUsuario);
    }
  }, [claveSesionUsuario, usuario, usuarioRegistrado]);

  const activarSesionUsuario = (nuevoUsuario) => {
    setUsuario((prevUsuario) => ({ ...prevUsuario, ...nuevoUsuario }));
    setUsuarioRegistrado(true);
  };

  const cerrarSesionUsuario = () => {
    setUsuario({ username: 'visitante', nombre: 'Visitante' });
    setUsuarioRegistrado(false);
    setSeccionActual('tienda');
    setChatSeleccionado(null);
    setProductoSeleccionado(null);
  };

  const sincronizarProducto = (productoActualizado) => {
    setProductos((prevProductos) => prevProductos.map((producto) => producto.id === productoActualizado.id ? normalizarProducto(productoActualizado) : producto));

    setProductoSeleccionado((prevProductoSeleccionado) => {
      if (!prevProductoSeleccionado || prevProductoSeleccionado.id !== productoActualizado.id) {
        return prevProductoSeleccionado;
      }

      return normalizarProducto(productoActualizado);
    });
  };

  const alternarMeGustaProducto = async (productoId) => {
    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/tienda/productos/${productoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: usuario.username })
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al actualizar el me gusta`);
      }

      const datos = await respuesta.json();
      const productoActualizado = normalizarProducto(datos.producto);

      sincronizarProducto(productoActualizado);

      setProductosConMeGusta((prevProductosConMeGusta) => {
        if (datos.usuarioLeDioLike) {
          const sinDuplicados = prevProductosConMeGusta.filter((producto) => producto.id !== productoActualizado.id);
          return [...sinDuplicados, productoActualizado];
        }

        return prevProductosConMeGusta.filter((producto) => producto.id !== productoActualizado.id);
      });
    } catch (error) {
      console.error('No se pudo actualizar el me gusta en la API.', error);
    }
  };

  const agregarComentarioProducto = async (productoId, texto) => {
    if (!texto || !texto.trim()) {
      return;
    }

    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/tienda/productos/${productoId}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usuario.username,
          texto: texto.trim()
        })
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al guardar el comentario`);
      }

      const datos = await respuesta.json();
      const productoActualizado = normalizarProducto(datos.producto);
      sincronizarProducto(productoActualizado);
      return productoActualizado;
    } catch (error) {
      console.error('No se pudo guardar el comentario en la API.', error);
      return null;
    }
  };

  const alternarLikePublicacion = async (publicacionId) => {
    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/social/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idPublicacion: publicacionId,
          username: usuario.username
        })
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al actualizar el like social`);
      }

      const datos = await respuesta.json();
      const publicacionActualizada = normalizarPublicacion(datos.publicacion);

      setPublicacionesSociales((prev) => prev.map((publicacion) => publicacion.id === publicacionActualizada.id ? publicacionActualizada : publicacion));
      return publicacionActualizada;
    } catch (error) {
      console.error('No se pudo actualizar el like de la publicación en la API.', error);
      return null;
    }
  };

  const alternarDislikePublicacion = async (publicacionId) => {
    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/social/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idPublicacion: publicacionId,
          username: usuario.username
        })
      });

      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

      const datos = await respuesta.json();
      const publicacionActualizada = normalizarPublicacion(datos.publicacion);

      setPublicacionesSociales((prev) => prev.map((p) => p.id === publicacionActualizada.id ? publicacionActualizada : p));
      return publicacionActualizada;
    } catch (error) {
      console.error('No se pudo actualizar el dislike de la publicación en la API.', error);
      return null;
    }
  };

  const agregarComentarioSocial = async (publicacionId, texto) => {
    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/social/${publicacionId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usuario.username,
          texto: texto.trim()
        })
      });

      if (!respuesta.ok) throw new Error('Error al enviar comentario');

      const datos = await respuesta.json();
      const publicacionActualizada = normalizarPublicacion(datos.publicacion);

      setPublicacionesSociales((prev) => prev.map((p) => p.id === publicacionActualizada.id ? publicacionActualizada : p));
      return publicacionActualizada;
    } catch (error) {
      console.error('No se pudo guardar el comentario social.', error);
      return null;
    }
  };

  useEffect(() => {
    let activo = true;

    const cargarProductos = async () => {
      try {
        const [respuestaProductos, respuestaMeGusta] = await Promise.all([
          fetch(`${apiBaseUrl}/api/tienda/productos?username=${usuario.username}`),
          fetch(`${apiBaseUrl}/api/tienda/usuarios/${usuario.username}/me-gusta`)
        ]);

        if (!respuestaProductos.ok) {
          throw new Error(`Error ${respuestaProductos.status} al cargar productos`);
        }

        const datos = await respuestaProductos.json();
        const datosMeGusta = respuestaMeGusta.ok ? await respuestaMeGusta.json() : [];

        if (activo && Array.isArray(datos) && datos.length > 0) {
          const productosApi = datos.map(normalizarProducto);
          setProductos(productosApi);
          setProductosConMeGusta(Array.isArray(datosMeGusta) ? datosMeGusta.map(normalizarProducto) : []);
        }
      } catch (error) {
        console.error('No se pudieron cargar los productos desde la API. Se usarán datos locales.', error);
      }
    };

    cargarProductos();

    return () => {
      activo = false;
    };
  }, [apiBaseUrl, usuario.username]);

  useEffect(() => {
    let activo = true;

    const cargarChats = async () => {
      try {
        const respuesta = await fetch(`${apiBaseUrl}/api/chat/lista?username=${encodeURIComponent(usuario.username)}`);

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} al cargar chats`);
        }

        const datos = await respuesta.json();

        if (activo && Array.isArray(datos)) {
          setChats(datos);
        }
      } catch (error) {
        console.error('No se pudieron cargar los chats desde la API.', error);
      }
    };

    cargarChats();

    return () => {
      activo = false;
    };
  }, [apiBaseUrl, usuario.username]);

  useEffect(() => {
    if (!usuario.username) {
      return undefined;
    }

    const socket = obtenerSocketChat(apiBaseUrl);

    if (!socket) {
      return undefined;
    }

    const registrarUsuario = () => {
      socket.emit('chat:registrar-usuario', { username: usuario.username });
    };

    const manejarLlamadaEntrante = (datos) => {
      if (!datos?.id || !datos?.callerId) {
        return;
      }

      const chatDeLlamada = chats.find((chat) => String(chat.id) === String(datos.callerId)) || {
        id: String(datos.callerId),
        nombre: datos.callerName || datos.callerUsername,
        username: datos.callerUsername,
        foto: imagenPorDefecto,
        online: false,
        ultimoMsg: 'Llamada entrante'
      };

      setLlamadaEntranteGlobal(datos);
      setSeccionActual('mensajes');
      setChatSeleccionado(chatDeLlamada);
    };

    if (socket.connected) {
      registrarUsuario();
    }

    socket.on('connect', registrarUsuario);
    socket.on('llamada:entrante', manejarLlamadaEntrante);

    return () => {
      socket.off('connect', registrarUsuario);
      socket.off('llamada:entrante', manejarLlamadaEntrante);
    };
  }, [apiBaseUrl, chats, imagenPorDefecto, usuario.username]);

  useEffect(() => {
    let activo = true;

    const cargarFeedSocial = async () => {
      try {
        const respuesta = await fetch(`${apiBaseUrl}/api/social/feed?username=${usuario.username}`);

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} al cargar el feed social`);
        }

        const datos = await respuesta.json();

        if (activo && Array.isArray(datos)) {
          setPublicacionesSociales(datos.map(normalizarPublicacion));
        }
      } catch (error) {
        console.error('No se pudo cargar el feed social desde la API.', error);
      }
    };

    cargarFeedSocial();

    return () => {
      activo = false;
    };
  }, [apiBaseUrl, usuario.username]);

  useEffect(() => {
    if (!productoSeleccionado || !contenedorPrincipalRef.current) {
      return;
    }

    const idAnimacion = window.requestAnimationFrame(() => {
      contenedorPrincipalRef.current.scrollTo({ top: 0, behavior: 'auto' });
    });

    return () => {
      window.cancelAnimationFrame(idAnimacion);
    };
  }, [productoSeleccionado]);

  // --- MOTOR DE RENDERIZADO CONDICIONAL ---
  const renderizadorDePantallas = () => {
    // NIVEL 1: Pantallas de máxima prioridad (Modales de pantalla completa)
    if (productoSeleccionado) {
      return (
        <PaginaDetalleProducto 
          producto={productoSeleccionado} 
          setProductoSeleccionado={setProductoSeleccionado} 
          carrito={carrito} 
          setCarrito={setCarrito}
          setSeccionActual={setSeccionActual}
          agregarComentarioProducto={agregarComentarioProducto}
        />
      );
    }

    if (chatSeleccionado) {
      return (
        <VentanaChat 
          chatSeleccionado={chatSeleccionado} 
          setChatSeleccionado={setChatSeleccionado} 
          usernameActual={usuario.username}
          apiBaseUrl={apiBaseUrl}
          llamadaEntranteInicial={llamadaEntranteGlobal}
          onConsumirLlamadaEntrante={() => setLlamadaEntranteGlobal(null)}
        />
      );
    }

    // NIVEL 2: Flujo de navegación por secciones
    switch (seccionActual) {
      // Flujo de Tienda
      case 'tienda':
        return <PaginaInicio productos={productos} productosConMeGusta={productosConMeGusta} alternarMeGustaProducto={alternarMeGustaProducto} agregarComentarioProducto={agregarComentarioProducto} setProductoSeleccionado={setProductoSeleccionado} setSeccionActual={setSeccionActual} carrito={carrito} />;
      case 'carrito':
        return <PaginaCarrito carrito={carrito} setCarrito={setCarrito} setSeccionActual={setSeccionActual} />;
      case 'checkout':
        return <PaginaCheckout carrito={carrito} setCarrito={setCarrito} setSeccionActual={setSeccionActual} usernameActual={usuario.username} />;
      case 'agradecimiento':
        return <PaginaAgradecimiento setSeccionActual={setSeccionActual} />;
      
      // Secciones Principales
      case 'social':
        return <PaginaInicioSocial publicaciones={publicacionesSociales} usuario={usuario || { username: 'visitante', nombre: 'Visitante' }} darLikePublicacion={alternarLikePublicacion} darDislikePublicacion={alternarDislikePublicacion} agregarComentarioPublicacion={agregarComentarioSocial} setSeccionActual={setSeccionActual} />;
      case 'mensajes':
        return <PaginaInicioChat chats={chats} setChatSeleccionado={setChatSeleccionado} usernameActual={usuario.username} apiBaseUrl={apiBaseUrl} />;
      case 'perfil':
        return <PaginaPerfil usuarioInicial={usuario} productosConMeGusta={productosConMeGusta} setProductoSeleccionado={setProductoSeleccionado} setSeccionActual={setSeccionActual} apiBaseUrl={apiBaseUrl} requiereRegistroInicial={!usuarioRegistrado} onRegistroExitoso={activarSesionUsuario} onInicioSesionExitoso={activarSesionUsuario} onCerrarSesion={cerrarSesionUsuario} />;
        
      default:
        return <PaginaInicio productos={productos} productosConMeGusta={productosConMeGusta} alternarMeGustaProducto={alternarMeGustaProducto} agregarComentarioProducto={agregarComentarioProducto} setProductoSeleccionado={setProductoSeleccionado} setSeccionActual={setSeccionActual} carrito={carrito} />;
    }
  };

  return (
    <div className="flex justify-center bg-[#0f172a] min-h-screen">
      {/* Marco del dispositivo móvil */}
      <div className="w-full max-w-md bg-white min-h-screen relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col">
        
        {/* Espacio principal donde se "inyectan" las páginas */}
        <main ref={contenedorPrincipalRef} className="flex-1 overflow-y-auto scrollbar-hide">
          {renderizadorDePantallas()}
        </main>

        {/* La barra de navegación se oculta en flujos críticos */}
        {!productoSeleccionado && !chatSeleccionado && seccionActual !== 'checkout' && seccionActual !== 'carrito' && (
          <BarraNavegacion seccionActual={seccionActual} setSeccionActual={setSeccionActual} />
        )}
      </div>
    </div>
  );
};

export default GestorCentralApp;