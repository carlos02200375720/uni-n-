import React from 'react';
import { Heart, MessageCircle, Search, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { useLogicaTienda } from './LogicaPaginaInicio';

const CarruselImagenesProducto = ({ productoId, nombre, imagenesProducto }) => {
  const [indiceActivo, setIndiceActivo] = React.useState(0);

  const manejarScroll = (evento) => {
    const { scrollLeft, clientWidth } = evento.currentTarget;

    if (!clientWidth) {
      return;
    }

    const nuevoIndice = Math.round(scrollLeft / clientWidth);

    if (nuevoIndice !== indiceActivo) {
      setIndiceActivo(nuevoIndice);
    }
  };

  return (
    <div className="relative w-full bg-gray-100 aspect-square">
      <div
        className="overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory scrollbar-hide scroll-smooth w-full h-full"
        onScroll={manejarScroll}
      >
        {imagenesProducto.map((imagen, indice) => (
          <div key={`${productoId}-imagen-${indice}`} className="w-full h-full shrink-0 snap-center overflow-hidden">
            <img
              src={imagen && imagen.startsWith('/uploads/') ? `${window.location.origin}${imagen}` : imagen}
              className="block w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              alt={`${nombre} ${indice + 1}`}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'; }}
            />
          </div>
        ))}
      </div>

      {imagenesProducto.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center px-4">
          <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm">
            {imagenesProducto.map((_, indice) => (
              <span key={`${productoId}-indicador-${indice}`} className={`block rounded-full transition-all ${indice === indiceActivo ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const CarruselArchivosProducto = ({ productoId, nombre, imagenesProducto = [], videosProducto = [] }) => {
  const [indiceActivo, setIndiceActivo] = React.useState(0);
  const archivos = [
    ...(imagenesProducto || []),
    ...(videosProducto || [])
  ];
  const manejarScroll = (evento) => {
    const { scrollLeft, clientWidth } = evento.currentTarget;
    if (!clientWidth) return;
    const nuevoIndice = Math.round(scrollLeft / clientWidth);
    if (nuevoIndice !== indiceActivo) setIndiceActivo(nuevoIndice);
  };
  return (
    <div className="relative w-full bg-gray-100 aspect-square">
      <div
        className="overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory scrollbar-hide scroll-smooth w-full h-full"
        onScroll={manejarScroll}
      >
        {archivos.map((archivo, indice) => {
          const ext = (archivo.split ? archivo.split('.') : []).pop()?.toLowerCase() || '';
          const isVideo = ["mp4","mov","avi","wmv","flv","mkv","webm"].includes(ext);
          return (
            <div key={`${productoId}-archivo-${indice}`} className="w-full h-full shrink-0 snap-center overflow-hidden">
              {isVideo ? (
                <video src={archivo} className="block w-full h-full object-cover object-center" controls />
              ) : (
                <img
                  src={archivo && archivo.startsWith('/uploads/') ? `${window.location.origin}${archivo}` : archivo}
                  className="block w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                  alt={`${nombre} ${indice + 1}`}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'; }}
                />
              )}
            </div>
          );
        })}
      </div>
      {archivos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center px-4">
          <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm">
            {archivos.map((_, indice) => (
              <span key={`${productoId}-indicador-${indice}`} className={`block rounded-full transition-all ${indice === indiceActivo ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- VISTA DE LA PÁGINA DE INICIO ---
export const PaginaInicio = ({ productos = [], productosConMeGusta = [], alternarMeGustaProducto, agregarComentarioProducto, setProductoSeleccionado, setSeccionActual, carrito = [] }) => {
  const carruselOfertasRef = React.useRef(null);
  const [indiceOfertaActivo, setIndiceOfertaActivo] = React.useState(0);

  // Conectamos la lógica interna
  const { 
    busqueda, 
    setBusqueda, 
    categoriaActual,
    setCategoriaActual,
    productosFiltrados, 
    productosEnOferta,
    manejarClickProducto, 
    irAlCarrito 
  } = useLogicaTienda(productos, setProductoSeleccionado, setSeccionActual);


  // Mostrar solo categorías que tengan productos en la tienda (en todos los productos, pero solo si hay productos en esa categoría)
  const categoriasDisponibles = React.useMemo(() => {
    // Contar productos por categoría
    const conteoCategorias = {};
    (Array.isArray(productos) ? productos : []).forEach((producto) => {
      if (typeof producto?.categoria === 'string' && producto.categoria.trim()) {
        const cat = producto.categoria.trim();
        conteoCategorias[cat] = (conteoCategorias[cat] || 0) + 1;
      }
    });
    // Solo mostrar categorías con al menos 1 producto
    const categoriasConProductos = Object.keys(conteoCategorias).filter(cat => conteoCategorias[cat] > 0);
    return ['Todos', ...categoriasConProductos];
  }, [productos]);

  React.useEffect(() => {
    setIndiceOfertaActivo(0);
  }, [productosEnOferta.length]);

  React.useEffect(() => {
    if (!carruselOfertasRef.current || productosEnOferta.length <= 1) {
      return;
    }

    const intervalo = window.setInterval(() => {
      setIndiceOfertaActivo((indiceActual) => {
        const siguienteIndice = (indiceActual + 1) % productosEnOferta.length;
        const anchoCarrusel = carruselOfertasRef.current?.clientWidth || 0;

        carruselOfertasRef.current?.scrollTo({
          left: anchoCarrusel * siguienteIndice,
          behavior: 'smooth'
        });

        return siguienteIndice;
      });
    }, 4200);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [productosEnOferta.length]);

  const manejarScrollOfertas = (evento) => {
    const { scrollLeft, clientWidth } = evento.currentTarget;

    if (!clientWidth) {
      return;
    }

    const nuevoIndice = Math.round(scrollLeft / clientWidth);

    if (nuevoIndice !== indiceOfertaActivo) {
      setIndiceOfertaActivo(nuevoIndice);
    }
  };

  return (
    <div className={`px-5 pb-28 bg-[#FAFAFA] min-h-screen ${productosEnOferta.length > 0 ? 'pt-0' : 'pt-16'}`}>
      {/* Encabezado */}
      <header className="fixed top-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center gap-2.5 bg-transparent px-5 pt-2 pb-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Buscar productos..."
            className="w-full bg-white py-1.5 pl-11 pr-12 rounded-[20px] shadow-sm outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-50 rounded-lg text-gray-400">
            <SlidersHorizontal size={16} />
          </button>
        </div>
        <button 
          onClick={irAlCarrito} 
          className="relative shrink-0 p-1.5 bg-white shadow-sm rounded-[20px] text-gray-800 active:scale-90 transition-all"
        >
          <ShoppingCart size={20}/>
          {carrito.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-blue-600 rounded-full text-[10px] leading-none text-white flex items-center justify-center font-black border-2 border-white shadow-md shadow-blue-200/80">
              {carrito.length}
            </span>
          )}
        </button>
      </header>

      {productosEnOferta.length > 0 && (
        <section className="-mx-5 mb-6">
          <div ref={carruselOfertasRef} onScroll={manejarScrollOfertas} className="flex gap-3 overflow-x-auto px-0 pb-2 snap-x snap-mandatory scrollbar-hide scroll-smooth">
            {productosEnOferta.map((producto) => {
              const imagenFondo = Array.isArray(producto.imagenes) && producto.imagenes.length > 0 ? producto.imagenes[0] : producto.imagen;
              const urlFondo = imagenFondo && imagenFondo.startsWith('/uploads/') ? `${window.location.origin}${imagenFondo}` : imagenFondo;
              return (
                <article
                  key={`oferta-${producto.id}`}
                  onClick={() => manejarClickProducto(producto)}
                  className="relative min-w-full min-h-[48vh] snap-start overflow-hidden rounded-none bg-slate-950 px-4 pb-5 pt-20 text-white shadow-xl cursor-pointer active:scale-[0.98] transition-transform flex flex-col justify-between"
                  style={{
                    backgroundImage: `url('${urlFondo || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-950/88 via-slate-900/68 to-blue-900/60" />

                  <div className="relative mb-3 flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] shadow-[0_1px_6px_rgba(0,0,0,0.25)]">
                        -{producto.descuento}%
                      </span>
                      <h3 className="mt-2.5 text-base font-black leading-tight text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.65),0_0_8px_rgba(0,0,0,0.35)]">{producto.nombre}</h3>
                      <p className="mt-1 text-[11px] text-white/75 [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]">{producto.categoria}</p>
                    </div>
                  </div>

                  <div className="relative flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-white/60 line-through [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]">${producto.precioOriginal}</p>
                      <p className="text-[1.35rem] font-black [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">${producto.precio}</p>
                    </div>
                    <span className="rounded-full bg-white text-slate-900 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                      Ver oferta
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {categoriasDisponibles.length > 0 && (
            <div className="mt-2 overflow-x-auto px-4 scrollbar-hide">
              <div className="flex min-w-max items-center gap-2">
                {categoriasDisponibles.map((categoria) => (
                  <button
                    key={`categoria-${categoria}`}
                    type="button"
                    onClick={() => setCategoriaActual(categoria)}
                    className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${categoriaActual === categoria ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.24)]' : 'bg-white text-slate-700 shadow-sm'}`}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Grid de Productos o destacados si no hay resultados */}
      <div className="grid grid-cols-1 gap-4 -mx-5">
        {((productosFiltrados.length > 0 ? productosFiltrados : productosEnOferta).length === 0) ? (
          <div className="text-center text-gray-400 py-16">No hay productos disponibles.</div>
        ) : (
          (productosFiltrados.length > 0 ? productosFiltrados : productosEnOferta).map(p => (
            (() => {
              const productoConMeGusta = productosConMeGusta.some((producto) => producto.id === p.id);
              const imagenesProducto = Array.isArray(p.imagenes) && p.imagenes.length > 0 ? p.imagenes : [p.imagen];

              return (
            <div 
              key={p.id} 
              onClick={() => manejarClickProducto(p)}
              className="bg-white overflow-hidden border border-transparent hover:border-blue-100 shadow-sm active:scale-95 transition-all cursor-pointer group"
            >
              <div className="text-left px-4 pt-4 pb-3">
                <h3 className="font-bold text-sm text-gray-800 truncate text-left">{p.nombre}</h3>
              </div>
              <CarruselArchivosProducto 
                productoId={p.id} 
                nombre={p.nombre} 
                imagenesProducto={Array.isArray(p.imagenes) && p.imagenes.length > 0 ? p.imagenes : [p.imagen]} 
                videosProducto={Array.isArray(p.videos) ? p.videos : []}
              />
              <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-4">
                <div className="min-w-0 flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-3 py-2 ring-1 ring-sky-100 shadow-[0_6px_16px_rgba(14,165,233,0.10)]">
                  <p className="text-slate-900 font-black text-[0.9rem] leading-none text-left">${p.precio}</p>
                  {p.precioOriginal > p.precio && (
                    <p className="text-[9px] font-bold leading-none text-slate-400 line-through">${p.precioOriginal}</p>
                  )}
                  {p.descuento > 0 && (
                    <div className="inline-flex items-center rounded-full bg-sky-600 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] leading-none text-white shadow-sm">
                      -{p.descuento}%
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof alternarMeGustaProducto === 'function') {
                        alternarMeGustaProducto(p.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 justify-center min-w-9 h-9 px-2 rounded-full active:scale-95 transition-all ${productoConMeGusta ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}
                    aria-label={`Me gusta ${p.nombre}`}
                  >
                    <Heart size={16} fill={productoConMeGusta ? 'currentColor' : 'none'} />
                    <span className="text-[11px] font-black">{p.likesCount || 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      manejarClickProducto(p);
                    }}
                    className="flex items-center gap-1.5 justify-center min-w-9 h-9 px-2 rounded-full bg-gray-100 text-gray-500 active:scale-95 transition-all"
                    aria-label={`Comentar ${p.nombre}`}
                  >
                    <MessageCircle size={16} />
                    <span className="text-[11px] font-black">{p.comentariosCount || 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      manejarClickProducto(p);
                    }}
                    className="flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-white text-xs font-black uppercase tracking-wide active:scale-95 transition-all"
                  >
                    <ShoppingCart size={14} />
                    Comprar
                  </button>
                </div>
              </div>
            </div>
              );
            })()
          ))
        )}
      </div>
    </div>
  );
};

export default PaginaInicio;