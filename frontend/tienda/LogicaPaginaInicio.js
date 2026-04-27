import { useState, useEffect, useRef } from 'react';

export const useLogicaTienda = (productosIniciales, setProductoSeleccionado, setSeccionActual) => {

  const [busqueda, setBusqueda] = useState('');
  const [categoriaActual, setCategoriaActual] = useState('Todos');
  const [productosFiltrados, setProductosFiltrados] = useState(Array.isArray(productosIniciales) ? productosIniciales : []);
  const debounceRef = useRef();

  useEffect(() => {
    // Si el buscador está vacío y la categoría es 'Todos', mostrar los productos originales
    if (!busqueda.trim() && (!categoriaActual || categoriaActual === 'Todos')) {
      setProductosFiltrados(Array.isArray(productosIniciales) ? productosIniciales : []);
      return;
    }

    // Cancelar debounce anterior
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (busqueda.trim()) params.append('nombre', busqueda.trim());
      if (categoriaActual && categoriaActual !== 'Todos') params.append('categoria', categoriaActual);
      fetch(`/api/tienda/productos?${params.toString()}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setProductosFiltrados(Array.isArray(data) ? data : []);
        })
        .catch(() => setProductosFiltrados([]));
    }, 250); // 250ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda, categoriaActual, productosIniciales]);

  const productosEnOferta = productosFiltrados
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