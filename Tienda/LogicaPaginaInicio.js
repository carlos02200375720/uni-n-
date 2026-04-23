import { useState } from 'react';

export const useLogicaTienda = (productosIniciales, setProductoSeleccionado, setSeccionActual) => {
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
    setProductoSeleccionado(producto); // Guarda cuál elegiste
    // Aquí no cambiamos de sección todavía porque primero va al detalle
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