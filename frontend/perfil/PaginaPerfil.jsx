import React, { useEffect, useState } from 'react';
import { Settings, Grid, Bookmark, ShoppingBag, Edit3, LogOut, ChevronRight } from 'lucide-react';

/**
 * LÓGICA INTEGRADA (Anteriormente LogicaPaginaPerfil.js)
 * Maneja el estado y las acciones del perfil de usuario
 */
const useLogicaPerfil = (usuarioInicial, setSeccionActual) => {
  const [usuario, setUsuario] = useState(usuarioInicial);
  const [pestanaActiva, setPestanaActiva] = useState('publicaciones');
  const [estaEditando, setEstaEditando] = useState(false);

  useEffect(() => {
    setUsuario(usuarioInicial);
  }, [usuarioInicial]);

  // Función para alternar entre ver publicaciones o guardados
  const cambiarPestana = (pestana) => {
    setPestanaActiva(pestana);
  };

  // Función para guardar cambios en el perfil
  const guardarPerfil = (nuevosDatos) => {
    setUsuario({ ...usuario, ...nuevosDatos });
    setEstaEditando(false);
  };

  // Función para navegar a otras secciones
  const navegarA = (ruta) => {
    if (setSeccionActual) {
      setSeccionActual(ruta);
    } else {
      console.log(`Navegando a la sección: ${ruta}`);
    }
  };

  const cerrarSesion = () => {
    console.log("Cerrando sesión del usuario...");
    // Aquí iría la lógica de borrar tokens y redirigir
  };

  return {
    usuario,
    pestanaActiva,
    estaEditando,
    setEstaEditando,
    cambiarPestana,
    guardarPerfil,
    navegarA,
    cerrarSesion
  };
};

/**
 * COMPONENTE VISTA
 */
export const PaginaPerfil = ({ usuarioInicial, productosConMeGusta = [], setProductoSeleccionado, setSeccionActual }) => {
  const apiBaseUrl = arguments[0]?.apiBaseUrl || 'http://localhost:5000';
  const usuarioMock = usuarioInicial || {
    username: 'cristian_dev',
    nombre: 'Cristian García',
    bio: 'Desarrollador FullStack & Entusiasta del diseño UI/UX. 🚀',
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
  };

  const cambiarSeccion = typeof setSeccionActual === 'function'
    ? setSeccionActual
    : (ruta) => console.log("Cambiando a:", ruta);

  const [resumenPerfil, setResumenPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async () => {
      try {
        const respuesta = await fetch(`${apiBaseUrl}/api/usuario/perfil/${encodeURIComponent(usuarioMock.username)}`);

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} al cargar perfil`);
        }

        const datos = await respuesta.json();

        if (activo) {
          setResumenPerfil(datos);
        }
      } catch (error) {
        console.error('No se pudo cargar el perfil desde la API.', error);
      } finally {
        if (activo) {
          setCargandoPerfil(false);
        }
      }
    };

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [apiBaseUrl, usuarioMock.username]);

  const formatearCantidad = (valor) => {
    if (valor >= 1000000) {
      return `${(valor / 1000000).toFixed(1)}M`;
    }

    if (valor >= 1000) {
      return `${(valor / 1000).toFixed(1)}k`;
    }

    return String(valor || 0);
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short'
  });

  const usuarioVista = resumenPerfil || usuarioMock;
  const guardadosCount = Number(resumenPerfil?.totalGuardados ?? productosConMeGusta.length ?? 0);
  const publicacionesRecientes = Array.isArray(resumenPerfil?.publicacionesRecientes) ? resumenPerfil.publicacionesRecientes : [];
  const pedidosRecientes = Array.isArray(resumenPerfil?.pedidosRecientes) ? resumenPerfil.pedidosRecientes : [];

  const {
    usuario,
    pestanaActiva,
    estaEditando,
    setEstaEditando,
    cambiarPestana,
    navegarA,
    cerrarSesion
  } = useLogicaPerfil(usuarioVista, cambiarSeccion);

  return (
    <div className="min-h-screen bg-white pt-16 pb-28 animate-in fade-in duration-500 text-left">
      {/* Barra Superior */}
      <header className="px-6 flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          {usuario?.username || 'mi_perfil'}
        </h2>
        <div className="flex gap-4">
          <button className="p-2 bg-gray-50 rounded-full text-gray-600 active:scale-90 transition-all">
            <Settings size={20} />
          </button>
          <button onClick={cerrarSesion} className="p-2 bg-red-50 rounded-full text-red-500 active:scale-90 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Info de Perfil */}
      <div className="px-8 flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-[40px] overflow-hidden border-4 border-gray-50 shadow-xl">
            <img 
              src={usuario?.foto} 
              className="w-full h-full object-cover" 
              alt="Perfil" 
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
            <Edit3 size={16} />
          </button>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900">{usuario?.nombre}</h1>
        <p className="text-gray-400 text-sm font-medium mt-1 mb-6 text-center max-w-[250px]">
          {usuario?.bio}
        </p>

        {/* Estadísticas */}
        <div className="flex justify-between w-full max-w-[300px] mb-8">
          <div className="text-center">
            <p className="text-lg font-black text-gray-900">{formatearCantidad(Number(resumenPerfil?.siguiendo ?? 0))}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Siguiendo</p>
          </div>
          <div className="text-center border-x border-gray-100 px-8">
            <p className="text-lg font-black text-gray-900">{formatearCantidad(Number(resumenPerfil?.seguidores ?? 0))}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-gray-900">{formatearCantidad(Number(resumenPerfil?.totalCompras ?? 0))}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compras</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-600">
            Publicaciones {formatearCantidad(Number(resumenPerfil?.publicacionesCount ?? 0))}
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600">
            Guardados {formatearCantidad(guardadosCount)}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600">
            Likes recibidos {formatearCantidad(Number(resumenPerfil?.likesTotales ?? 0))}
          </span>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex gap-3 w-full px-4">
          <button 
            onClick={() => navegarA('tienda')}
            className="flex-1 bg-gray-900 text-white py-4 rounded-[24px] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-gray-200"
          >
            <ShoppingBag size={18} /> Seguir comprando
          </button>
        </div>
      </div>

      <section className="px-5 mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.18em]">Actividad reciente</h3>
          {cargandoPerfil && <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Cargando</span>}
        </div>

        {pedidosRecientes.length > 0 ? (
          <div className="space-y-3">
            {pedidosRecientes.map((pedido) => (
              <article key={pedido.id} className="rounded-[28px] border border-gray-100 bg-gray-50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Pedido {pedido.id.slice(-6)}</p>
                    <h4 className="mt-1 text-sm font-black text-gray-900">{pedido.primerProducto}</h4>
                    <p className="mt-1 text-xs font-medium text-gray-500">{pedido.resumenItems.join(' • ') || 'Compra realizada'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">${Number(pedido.total || 0).toFixed(2)}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-green-600">{pedido.estado}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-gray-400">
                  <span>{formatearFecha(pedido.fecha)}</span>
                  <span>{pedido.itemsCount} artículo{pedido.itemsCount === 1 ? '' : 's'}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-gray-200 px-5 py-8 text-center text-sm font-medium text-gray-400">
            Tus compras aparecerán aquí cuando el backend tenga pedidos asociados a tu cuenta.
          </div>
        )}
      </section>

      {/* Selector de Pestañas */}
      <div className="flex border-t border-gray-50">
        <button 
          onClick={() => cambiarPestana('publicaciones')}
          className={`flex-1 py-4 flex justify-center transition-all ${pestanaActiva === 'publicaciones' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-300'}`}
        >
          <Grid size={24} />
        </button>
        <button 
          onClick={() => cambiarPestana('guardados')}
          className={`flex-1 py-4 flex justify-center transition-all ${pestanaActiva === 'guardados' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-300'}`}
        >
          <Bookmark size={24} />
        </button>
      </div>

      {pestanaActiva === 'guardados' ? (
        productosConMeGusta.length > 0 ? (
          <div className="px-5 pt-4 space-y-3">
            {productosConMeGusta.map((producto) => (
              <button
                key={producto.id}
                onClick={() => {
                  if (typeof setProductoSeleccionado === 'function') {
                    setProductoSeleccionado(producto);
                  }
                }}
                className="w-full flex items-center gap-4 rounded-[28px] bg-gray-50 p-3 text-left active:scale-[0.98] transition-all"
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-20 h-20 rounded-[20px] object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 truncate">{producto.nombre}</h3>
                  <p className="text-sm text-gray-400 mt-1">{producto.categoria}</p>
                  <p className="text-blue-600 font-black text-base mt-2">${producto.precio}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-8 py-16 text-center text-gray-400">
            <p className="font-bold">Todavía no has dado me gusta a ningún producto.</p>
          </div>
        )
      ) : (
        publicacionesRecientes.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5 mt-0.5">
            {publicacionesRecientes.map((publicacion) => (
              <div key={publicacion.id} className="aspect-square bg-gray-100 relative group overflow-hidden">
                {publicacion.tipoContenido === 'video' ? (
                  <video src={publicacion.mediaUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img 
                    src={publicacion.mediaUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={publicacion.descripcion || usuario?.nombre || 'Publicación'} 
                  />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-100 transition-opacity flex items-end justify-start p-2">
                  <span className="text-white text-[10px] font-bold">{publicacion.likes} likes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-8 py-16 text-center text-gray-400">
            <p className="font-bold">Todavía no hay publicaciones guardadas para este perfil.</p>
          </div>
        )
      )}
    </div>
  );
};

export default PaginaPerfil;