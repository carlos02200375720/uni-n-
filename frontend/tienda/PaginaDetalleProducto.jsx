import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, ShieldCheck, ShoppingCart, Star, Zap } from 'lucide-react';

/**
 * LÓGICA DE PÁGINA DE DETALLE DEL PRODUCTO
 * Esta función (Hook) maneja el comportamiento y estado de la vista.
 */
const useLogicaDetalle = (producto, carrito, setCarrito, setSeccionActual, setProductoSeleccionado, agregarComentarioProducto) => {
  const [agregando, setAgregando] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState('');

  React.useEffect(() => {
    const tallasDisponibles = Array.isArray(producto?.tallas) ? producto.tallas : [];
    const coloresDisponibles = Array.isArray(producto?.colores) ? producto.colores : [];

    setTallaSeleccionada(tallasDisponibles[0] || '');
    setColorSeleccionado(coloresDisponibles[0] || '');
  }, [producto?.id]);

  // Función para volver atrás al catálogo
  const volverAtras = () => {
    setProductoSeleccionado(null);
  };

  const irAlCarrito = () => {
    if (typeof setProductoSeleccionado === 'function') {
      setProductoSeleccionado(null);
    }
    if (typeof setSeccionActual === 'function') {
      setSeccionActual('carrito');
    }
  };

  // Función para añadir el producto actual al carrito
  const añadirAlCarrito = () => {
    setAgregando(true);
    
    // Creamos una copia única del producto para el carrito
    const nuevoItem = { 
      ...producto, 
      tallaSeleccionada,
      colorSeleccionado,
      tempId: Date.now() // ID temporal para manejar duplicados en el carrito
    };

    // Actualizamos el estado global del carrito
    // Nota: Asegúrate de que setCarrito esté definido en tu componente principal
    if (typeof setCarrito === 'function') {
      setCarrito([...carrito, nuevoItem]);
    }

    // Simulamos una pequeña carga y redirigimos al carrito
    setTimeout(() => {
      setAgregando(false);
      if (typeof setProductoSeleccionado === 'function') {
        setProductoSeleccionado(null); // Cerramos el detalle
      }
      if (typeof setSeccionActual === 'function') {
        setSeccionActual('carrito');   // Vamos a la bolsa
      }
    }, 600);
  };

  const comprarAhora = () => {
    setComprando(true);

    const itemCompraDirecta = {
      ...producto,
      tallaSeleccionada,
      colorSeleccionado,
      tempId: Date.now()
    };

    if (typeof setCarrito === 'function') {
      setCarrito([itemCompraDirecta]);
    }

    setTimeout(() => {
      setComprando(false);
      if (typeof setProductoSeleccionado === 'function') {
        setProductoSeleccionado(null);
      }
      if (typeof setSeccionActual === 'function') {
        setSeccionActual('checkout');
      }
    }, 400);
  };

  const enviarComentario = async (e) => {
    e.preventDefault();

    if (!comentarioTexto.trim() || typeof agregarComentarioProducto !== 'function') {
      return;
    }

    setEnviandoComentario(true);

    const productoActualizado = await agregarComentarioProducto(producto.id, comentarioTexto.trim());

    if (productoActualizado) {
      setComentarioTexto('');
    }

    setEnviandoComentario(false);
  };

  return {
    agregando,
    comprando,
    comentarioTexto,
    enviandoComentario,
    tallaSeleccionada,
    colorSeleccionado,
    setComentarioTexto,
    setTallaSeleccionada,
    setColorSeleccionado,
    volverAtras,
    irAlCarrito,
    añadirAlCarrito,
    comprarAhora,
    enviarComentario
  };
};

/**
 * PÁGINA DE DETALLE DE PRODUCTO
 * Componente visual que representa la interfaz de usuario.
 */
export const PaginaDetalleProducto = ({ producto, carrito, setCarrito, setSeccionActual, setProductoSeleccionado, agregarComentarioProducto }) => {
  // Conectamos la lógica interna definida arriba
  const { agregando, comprando, comentarioTexto, enviandoComentario, tallaSeleccionada, colorSeleccionado, setComentarioTexto, setTallaSeleccionada, setColorSeleccionado, volverAtras, irAlCarrito, añadirAlCarrito, comprarAhora, enviarComentario } = useLogicaDetalle(
    producto, 
    carrito, 
    setCarrito, 
    setSeccionActual, 
    setProductoSeleccionado,
    agregarComentarioProducto
  );

  const [indiceImagenActiva, setIndiceImagenActiva] = useState(0);

  if (!producto) return null;

  const alturaGaleria = 'aspect-square';
  // Ordenar primero videos y luego imágenes
  const videosProducto = Array.isArray(producto.videos) ? producto.videos : [];
  const imagenesProducto = Array.isArray(producto.imagenes) && producto.imagenes.length > 0 ? producto.imagenes : [producto.imagen];
  const galeriaArchivos = [...videosProducto, ...imagenesProducto];

  React.useEffect(() => {
    setIndiceImagenActiva(0);
  }, [producto.id]);

  const manejarScrollGaleria = (evento) => {
    const { scrollLeft, clientWidth } = evento.currentTarget;

    if (!clientWidth) {
      return;
    }

    const nuevoIndice = Math.round(scrollLeft / clientWidth);

    if (nuevoIndice !== indiceImagenActiva) {
      setIndiceImagenActiva(nuevoIndice);
    }
  };

  return (
    <div className="min-h-screen bg-transparent animate-in slide-in-from-bottom-10 duration-500 pb-32">
      {/* Cabecera con galería de videos e imágenes */}
      <div className={`fixed top-0 left-1/2 z-0 w-full max-w-md -translate-x-1/2 overflow-hidden ${alturaGaleria}`}>
        <div
          className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          onScroll={manejarScrollGaleria}
        >
          {galeriaArchivos.map((archivo, indice) => {
            const ext = (archivo.split ? archivo.split('.') : []).pop()?.toLowerCase() || '';
            const isVideo = ["mp4","mov","avi","wmv","flv","mkv","webm"].includes(ext);
            return (
              <div key={`${producto.id || producto.nombre}-detalle-archivo-${indice}`} className="h-full w-full shrink-0 snap-center">
                {isVideo ? (
                  <video src={archivo} className="w-full h-full object-cover" controls />
                ) : (
                  <img 
                    src={archivo}
                    className="w-full h-full object-cover" 
                    alt={`${producto.nombre} ${indice + 1}`}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'; }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/50" />

        {galeriaArchivos.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 flex items-center justify-center px-4">
              <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm shadow-lg">
                {galeriaArchivos.map((_, indice) => (
                  <span key={`${producto.id || producto.nombre}-detalle-indicador-${indice}`} className={`block rounded-full transition-all ${indice === indiceImagenActiva ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`} />
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      <div className="fixed top-3 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-start justify-between px-6 pointer-events-none">
        <button 
          onClick={volverAtras} 
          className="pointer-events-auto bg-white/20 backdrop-blur-xl p-2 rounded-full text-black border border-white/30 shadow-lg active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          onClick={irAlCarrito}
          className="pointer-events-auto relative bg-white/20 backdrop-blur-xl p-2 rounded-full text-black border border-white/30 shadow-lg active:scale-90 transition-all"
        >
          <ShoppingCart size={20} />
          {Array.isArray(carrito) && carrito.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-blue-600 rounded-full text-[9px] leading-none text-white flex items-center justify-center font-black border-2 border-white shadow-md shadow-blue-200/80">
              {carrito.length}
            </span>
          )}
        </button>
      </div>

      <div className={`w-full ${alturaGaleria}`} />

      {/* Contenido de Información */}
      <div className="px-8 pt-4 pb-10 -mt-8 bg-white shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.15)] relative z-10 text-left">
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="flex-1 pr-1">
            <h1 className="text-[1.65rem] font-black text-gray-900 leading-tight mb-1">
              {producto.nombre}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /></div>
              <span className="text-xs font-bold text-gray-400">4.9 (120 reseñas)</span>
            </div>
          </div>
          <div className="text-right pt-0.5">
            <span className="text-[1.65rem] font-black text-blue-600 leading-none">${producto.precio}</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {producto.tiempoEnvio && (
                <span>Envío: {producto.tiempoEnvio}</span>
              )}
              {producto.precioEnvio !== undefined && producto.precioEnvio !== '' && (
                <span> | Costo: ${producto.precioEnvio}</span>
              )}
            </p>
          </div>
        </div>

        {/* Características Rápidas */}
        <div className="flex gap-3 mb-10">
          <div className="flex-1 bg-blue-50/50 p-4 rounded-3xl flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={20} />
            <span className="text-[10px] font-bold text-blue-800 leading-none">Garantía <br/>Oficial</span>
          </div>
          <div className="flex-1 bg-green-50/50 p-4 rounded-3xl flex items-center gap-3">
            <Zap className="text-green-600" size={20} />
            <span className="text-[10px] font-bold text-green-800 leading-none">Entrega <br/>Inmediata</span>
          </div>
        </div>

        {(Array.isArray(producto.tallas) && producto.tallas.length > 0) || (Array.isArray(producto.colores) && producto.colores.length > 0) ? (
          <section className="mb-12 space-y-6">
            {Array.isArray(producto.tallas) && producto.tallas.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Talla</h3>
                  {tallaSeleccionada && <span className="text-xs font-bold text-gray-400">Seleccionada: {tallaSeleccionada}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {producto.tallas.map((talla) => (
                    <button
                      key={`${producto.id}-talla-${talla}`}
                      type="button"
                      onClick={() => setTallaSeleccionada(talla)}
                      className={`min-w-12 rounded-2xl border px-4 py-3 text-sm font-black transition-all active:scale-95 ${tallaSeleccionada === talla ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100' : 'border-gray-200 bg-white text-gray-700'}`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(producto.coloresConImagen) && producto.coloresConImagen.length > 0 ? (
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Color</h3>
                  {colorSeleccionado && <span className="text-xs font-bold text-gray-400">Seleccionado: {colorSeleccionado}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {producto.coloresConImagen.map((colVar) => (
                    <button
                      key={`${producto.id}-colorimg-${colVar.color}`}
                      type="button"
                      onClick={() => setColorSeleccionado(colVar.color)}
                      className={`rounded-2xl border p-1 text-sm font-black transition-all active:scale-95 flex flex-col items-center ${colorSeleccionado === colVar.color ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100' : 'border-gray-200 bg-white'}`}
                    >
                      <img src={colVar.imagen} alt={colVar.color} className="w-12 h-12 object-cover rounded mb-1 border" />
                      <span className="text-xs font-bold text-gray-700">{colVar.color}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : Array.isArray(producto.colores) && producto.colores.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Color</h3>
                  {colorSeleccionado && <span className="text-xs font-bold text-gray-400">Seleccionado: {colorSeleccionado}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {producto.colores.map((color) => (
                    <button
                      key={`${producto.id}-color-${color}`}
                      type="button"
                      onClick={() => setColorSeleccionado(color)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition-all active:scale-95 ${colorSeleccionado === color ? 'border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-200' : 'border-gray-200 bg-white text-gray-700'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : null}

        <div className="mb-12">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Descripción</h3>
          <p className="text-gray-500 leading-relaxed text-sm font-medium">
            {producto.desc || "Experimenta la excelencia tecnológica con este dispositivo de última generación. Diseñado para ofrecer rendimiento, durabilidad y un estilo inigualable."}
          </p>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-blue-600" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Comentarios</h3>
          </div>

          <form onSubmit={enviarComentario} className="mb-5">
            <textarea
              value={comentarioTexto}
              onChange={(e) => setComentarioTexto(e.target.value)}
              placeholder="Escribe tu comentario sobre este producto"
              className="w-full min-h-28 resize-none rounded-[28px] border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-700 outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              disabled={enviandoComentario || !comentarioTexto.trim()}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-xs font-black uppercase tracking-wider text-white active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400"
            >
              {enviandoComentario ? 'Guardando...' : 'Publicar comentario'}
            </button>
          </form>

          <div className="space-y-3">
            {Array.isArray(producto.comentarios) && producto.comentarios.length > 0 ? (
              producto.comentarios.slice().reverse().map((comentario, indice) => (
                <article key={`${comentario.usuario}-${comentario.fecha || indice}`} className="rounded-[24px] bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-black text-gray-900">@{comentario.usuario}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {comentario.fecha ? new Date(comentario.fecha).toLocaleDateString() : 'Ahora'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{comentario.texto}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] bg-gray-50 px-4 py-5 text-center text-sm font-medium text-gray-400">
                Todavia no hay comentarios para este producto.
              </div>
            )}
          </div>
        </section>

      </div>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-white via-white to-white/0 px-4 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <button 
            onClick={añadirAlCarrito}
            disabled={agregando || comprando}
            className="flex-1 bg-blue-600 text-white py-3 rounded-[18px] font-black text-[12px] shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:bg-blue-300"
          >
            {agregando ? "Agregando..." : "Añadir"}
          </button>
          <button 
            onClick={comprarAhora}
            disabled={comprando || agregando}
            className="flex-1 bg-gray-900 text-white py-3 rounded-[18px] font-black text-[12px] shadow-lg shadow-gray-200 active:scale-95 transition-all disabled:bg-gray-300"
          >
            {comprando ? "Abriendo..." : "Comprar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Exportación por defecto para compatibilidad
export default PaginaDetalleProducto;