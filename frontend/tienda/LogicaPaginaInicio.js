import { useState } from 'react';

export const useLogicaTienda = (productosIniciales, setProductoSeleccionado, setSeccionActual) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActual, setCategoriaActual] = useState('Todos');

  const productosSeguros = Array.isArray(productosIniciales) ? productosIniciales : [];

  // Función para filtrar productos por nombre y categoría
  const productosFiltrados = productosSeguros.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActual === 'Todos' || producto.categoria === categoriaActual;
    return coincideBusqueda && coincideCategoria;
  });

  const productosEnOferta = productosSeguros
    .filter((producto) => {
      const descuentoNumerico = Number(producto.descuento || 0);
      const precioOriginal = Number(producto.precioOriginal || 0);
      const precioActual = Number(producto.precio || 0);

      return Boolean(producto.oferta) || descuentoNumerico > 0 || (precioOriginal > 0 && precioOriginal > precioActual);
    })
    .map((producto) => {
      const precioActual = Number(producto.precio || 0);
      const descuentoBase = Number(producto.descuento || 0);
      const precioOriginalBase = Number(producto.precioOriginal || 0);
      const precioOriginal = precioOriginalBase > precioActual
        ? precioOriginalBase
        : descuentoBase > 0
          ? Math.round(precioActual / (1 - (descuentoBase / 100)))
          : precioActual;
      const descuento = descuentoBase > 0
        ? descuentoBase
        : precioOriginal > precioActual && precioOriginal > 0
          ? Math.round(((precioOriginal - precioActual) / precioOriginal) * 100)
          : 0;

      return {
        ...producto,
        descuento,
        precioOriginal
      };
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
    productosEnOferta,
    manejarClickProducto,
    irAlCarrito
  };
};