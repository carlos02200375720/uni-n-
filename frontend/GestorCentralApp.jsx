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

// --- COMPONENTES GLOBALES ---
import BarraNavegacion from './components/BarraNavegacion';

/**
 * GESTOR CENTRAL APP
 * Este es el cerebro del Frontend. Se encarga de:
 * 1. Controlar la navegación (enrutamiento manual).
 * 2. Gestionar el estado global (carrito, usuario actual, selección).
 * 3. Servir como puente entre todas las páginas.
 */
const GestorCentralApp = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const imagenPorDefecto = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
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
      usuarioDioLike: Boolean(publicacion.usuarioDioLike)
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

  // --- DATOS DE PRUEBA (MOCK DATA) ---
  const productosMock = [
    { id: 1, nombre: 'iPhone 15 Pro', precio: 1199, precioOriginal: 1399, descuento: 14, oferta: true, likesCount: 128, comentariosCount: 18, imagenes: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=900', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900'], imagen: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500', categoria: 'Móviles' },
    { id: 2, nombre: 'AirPods Max', precio: 549, precioOriginal: 699, descuento: 21, oferta: true, likesCount: 94, comentariosCount: 12, imagenes: ['https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=900', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900'], imagen: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=500', categoria: 'Audio' },
    { id: 3, nombre: 'MacBook Air M3', precio: 1299, likesCount: 76, comentariosCount: 9, imagenes: ['https://images.unsplash.com/photo-1517336712461-1286c9527964?w=900', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900', 'https://images.unsplash.com/photo-1496180727794-817822f65950?w=900'], imagen: 'https://images.unsplash.com/photo-1517336712461-1286c9527964?w=500', categoria: 'Laptops' },
    { id: 8, nombre: 'Tenis Urban Flex', precio: 89, precioOriginal: 119, descuento: 25, oferta: true, likesCount: 51, comentariosCount: 7, imagenes: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900'], imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', categoria: 'Calzado', tallas: ['38', '39', '40', '41', '42'], colores: ['Negro', 'Blanco', 'Rojo'], descripcion: 'Producto de prueba para visualizar un flujo de compra con selección de talla y color antes de añadir al carrito o comprar.' }
  ].map(normalizarProducto);
  const productoDemoVariantes = productosMock.find((producto) => producto.id === 8);
  const [productos, setProductos] = useState(productosMock);
  const [usuario] = useState({
    username: 'cristian_dev',
    nombre: 'Cristian Rodríguez',
    bio: 'Desarrollador Fullstack & Emprendedor.',
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
  });

  const [productosConMeGusta, setProductosConMeGusta] = useState([]);
  const [publicacionesSociales, setPublicacionesSociales] = useState([]);
  const [chats, setChats] = useState([]);

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
          const productosCombinados = productoDemoVariantes
            ? combinarProductosSinDuplicados(productosApi, [productoDemoVariantes])
            : productosApi;

          setProductos(productosCombinados);
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
        return <PaginaInicioSocial publicaciones={publicacionesSociales} darLikePublicacion={alternarLikePublicacion} setSeccionActual={setSeccionActual} />;
      case 'mensajes':
        return <PaginaInicioChat chats={chats} setChatSeleccionado={setChatSeleccionado} />;
      case 'perfil':
        return <PaginaPerfil usuarioInicial={usuario} productosConMeGusta={productosConMeGusta} setProductoSeleccionado={setProductoSeleccionado} setSeccionActual={setSeccionActual} apiBaseUrl={apiBaseUrl} />;
        
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