import React, { useState } from 'react';
import { ArrowLeft, Star, ShieldCheck, Zap } from 'lucide-react';

/**
 * LÓGICA DE PÁGINA DE DETALLE DEL PRODUCTO
 * Esta función (Hook) maneja el comportamiento y estado de la vista.
 */
const useLogicaDetalle = (producto, carrito, setCarrito, setSeccionActual, setProductoSeleccionado) => {
  const [agregando, setAgregando] = useState(false);

  // Función para volver atrás al catálogo
  const volverAtras = () => {
    setProductoSeleccionado(null);
  };

  // Función para añadir el producto actual al carrito
  const añadirAlCarrito = () => {
    setAgregando(true);
    
    // Creamos una copia única del producto para el carrito
    const nuevoItem = { 
      ...producto, 
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

  return {
    agregando,
    volverAtras,
    añadirAlCarrito
  };
};

/**
 * PÁGINA DE DETALLE DE PRODUCTO
 * Componente visual que representa la interfaz de usuario.
 */
export const PaginaDetalleProducto = ({ producto, carrito, setCarrito, setSeccionActual, setProductoSeleccionado }) => {
  // Conectamos la lógica interna definida arriba
  const { agregando, volverAtras, añadirAlCarrito } = useLogicaDetalle(
    producto, 
    carrito, 
    setCarrito, 
    setSeccionActual, 
    setProductoSeleccionado
  );

  if (!producto) return null;

  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-bottom-10 duration-500 pb-12">
      {/* Cabecera con Imagen */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img 
          src={producto.imagen} 
          className="w-full h-full object-cover" 
          alt={producto.nombre} 
        />
        
        {/* Botón Volver */}
        <button 
          onClick={volverAtras} 
          className="absolute top-12 left-6 bg-white/20 backdrop-blur-xl p-3 rounded-full text-white border border-white/30 shadow-lg active:scale-90 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Contenido de Información */}
      <div className="px-8 py-10 -mt-12 bg-white rounded-t-[48px] shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.15)] relative z-10 text-left">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />

        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
              {producto.nombre}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /></div>
              <span className="text-xs font-bold text-gray-400">4.9 (120 reseñas)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-600">${producto.precio}</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Envío Gratis</p>
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

        <div className="mb-12">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Descripción</h3>
          <p className="text-gray-500 leading-relaxed text-sm font-medium">
            {producto.desc || "Experimenta la excelencia tecnológica con este dispositivo de última generación. Diseñado para ofrecer rendimiento, durabilidad y un estilo inigualable."}
          </p>
        </div>

        {/* Botón de Acción */}
        <button 
          onClick={añadirAlCarrito}
          disabled={agregando}
          className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-lg shadow-2xl shadow-blue-200 active:scale-95 transition-all disabled:bg-blue-300"
        >
          {agregando ? "Agregando..." : "Añadir a la bolsa"}
        </button>
      </div>
    </div>
  );
};

// Exportación por defecto para compatibilidad
export default PaginaDetalleProducto;