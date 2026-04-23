import React, { useState } from 'react';
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';

// --- LÓGICA DE LA PÁGINA DE INICIO (Custom Hook) ---
// Se define aquí para evitar errores de importación en el entorno de previsualización
const useLogicaTienda = (productosIniciales, setProductoSeleccionado, setSeccionActual) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActual, setCategoriaActual] = useState('Todos');

  // Función para filtrar productos por nombre y categoría
  const productosFiltrados = productosIniciales.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActual === 'Todos' || producto.categoria === categoriaActual;
    return coincideBusqueda && coincideCategoria;
  });

  // Función que se ejecuta al tocar un producto
  const manejarClickProducto = (producto) => {
    setProductoSeleccionado(producto);
  };

  // Función para ir al carrito
  const irAlCarrito = () => {
    setSeccionActual('carrito');
  };

  return {
    busqueda,
    setBusqueda,
    categoriaActual,
    setCategoriaActual,
    productosFiltrados,
    manejarClickProducto,
    irAlCarrito
  };
};

// --- VISTA DE LA PÁGINA DE INICIO ---
export const PaginaInicio = ({ productos = [], setProductoSeleccionado, setSeccionActual, carrito = [] }) => {
  // Conectamos la lógica interna
  const { 
    busqueda, 
    setBusqueda, 
    productosFiltrados, 
    manejarClickProducto, 
    irAlCarrito 
  } = useLogicaTienda(productos, setProductoSeleccionado, setSeccionActual);

  return (
    <div className="px-5 pt-14 pb-28 bg-[#FAFAFA] min-h-screen">
      {/* Encabezado */}
      <header className="flex justify-between items-center mb-6">
        <div className="text-left">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-left">Premium Store</p>
          <h1 className="text-3xl font-black text-gray-900 text-left">Catálogo</h1>
        </div>
        <button 
          onClick={irAlCarrito} 
          className="relative p-3 bg-white shadow-sm rounded-2xl text-gray-800 active:scale-90 transition-all"
        >
          <ShoppingCart size={22}/>
          {carrito.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 w-5 h-5 rounded-full text-[10px] text-white flex items-center justify-center font-black border-2 border-[#FAFAFA]">
              {carrito.length}
            </span>
          )}
        </button>
      </header>

      {/* Barra de Búsqueda */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar productos..."
          className="w-full bg-white p-4 pl-12 rounded-2xl shadow-sm outline-none text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-50 rounded-xl text-gray-400">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-2 gap-4">
        {productosFiltrados.map(p => (
          <div 
            key={p.id} 
            onClick={() => manejarClickProducto(p)}
            className="bg-white p-3 rounded-[32px] border border-transparent hover:border-blue-100 shadow-sm active:scale-95 transition-all cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-[24px] mb-3 aspect-square">
              <img 
                src={p.imagen} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={p.nombre} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'; }}
              />
            </div>
            <div className="text-left px-1">
              <h3 className="font-bold text-sm text-gray-800 truncate text-left">{p.nombre}</h3>
              <p className="text-blue-600 font-black text-base mt-1 text-left">${p.precio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {productosFiltrados.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400 font-medium">No encontramos lo que buscas.</p>
        </div>
      )}
    </div>
  );
};

export default PaginaInicio;