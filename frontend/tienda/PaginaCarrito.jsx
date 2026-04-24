import React from 'react';
import { ArrowLeft, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';

/**
 * LÓGICA INTEGRADA
 * Hook personalizado con protección contra valores indefinidos.
 */
const useLogicaCarrito = (carrito = [], setCarrito, setSeccionActual) => {
  
  // Nos aseguramos de que carrito siempre sea un array antes de usar reduce
  const listaSegura = Array.isArray(carrito) ? carrito : [];

  // Calcular el subtotal sumando los precios de todos los productos
  const subtotal = listaSegura.reduce((acc, producto) => {
    const precio = producto.price || producto.precio || 0;
    return acc + precio;
  }, 0);
  
  // Configuración de costos adicionales
  const costoEnvio = subtotal > 1000 || subtotal === 0 ? 0 : 15;
  const impuestos = subtotal * 0.18;
  const total = subtotal + costoEnvio + impuestos;

  // Función para eliminar un producto
  const eliminarProducto = (tempId) => {
    if (setCarrito) {
      const nuevoCarrito = listaSegura.filter(item => item.tempId !== tempId);
      setCarrito(nuevoCarrito);
    }
  };

  // Navegación
  const procederAlEnvio = () => {
    if (listaSegura.length > 0 && setSeccionActual) {
      setSeccionActual('envio');
    }
  };

  const seguirComprando = () => {
    if (setSeccionActual) setSeccionActual('tienda');
  };

  return {
    listaSegura,
    subtotal,
    costoEnvio,
    impuestos,
    total,
    eliminarProducto,
    procederAlEnvio,
    seguirComprando
  };
};

/**
 * VISTA DEL CARRITO
 */
export const PaginaCarrito = ({ carrito = [], setCarrito, setSeccionActual }) => {
  // Conectamos la lógica protegida
  const { 
    listaSegura,
    subtotal, 
    costoEnvio, 
    impuestos, 
    total, 
    eliminarProducto, 
    procederAlEnvio, 
    seguirComprando 
  } = useLogicaCarrito(carrito, setCarrito, setSeccionActual);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-14 pb-10 px-6 animate-in fade-in duration-500">
      {/* Cabecera */}
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={seguirComprando} 
          className="p-2.5 bg-white shadow-sm rounded-full text-gray-800 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900">Mi Bolsa</h1>
        <div className="w-10"></div>
      </header>

      {listaSegura.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-8 rounded-full mb-6">
            <ShoppingBag size={48} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Tu bolsa está vacía</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-[200px]">Parece que aún no has añadido nada a tu bolsa.</p>
          <button 
            onClick={seguirComprando}
            className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm active:scale-95 transition-all"
          >
            Explorar Tienda
          </button>
        </div>
      ) : (
        <>
          {/* Lista de Productos */}
          <div className="space-y-4 mb-10">
            {listaSegura.map((item) => (
              <div key={item.tempId || Math.random()} className="bg-white p-4 rounded-[28px] shadow-sm flex items-center gap-4 animate-in slide-in-from-left duration-300">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={item.imagen} 
                    className="w-full h-full object-cover" 
                    alt={item.nombre} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Producto'; }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">{item.nombre}</h3>
                  <p className="text-blue-600 font-black text-sm">${(item.price || item.precio || 0).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => eliminarProducto(item.tempId)}
                  className="p-3 text-red-400 hover:text-red-600 active:scale-125 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Resumen de Factura */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm text-left mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Resumen de orden</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                <span className="text-sm font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Envío</span>
                <span className="text-sm font-bold text-green-600">
                  {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Impuestos (18%)</span>
                <span className="text-sm font-bold text-gray-900">${impuestos.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-lg font-black text-gray-900">Total</span>
              <span className="text-2xl font-black text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Botón Final */}
          <button 
            onClick={procederAlEnvio}
            className="w-full bg-black text-white py-5 rounded-[28px] font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
          >
            Pagar ahora
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default PaginaCarrito;