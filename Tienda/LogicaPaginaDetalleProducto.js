import { useState } from 'react';

export const useLogicaDetalle = (producto, carrito, setCarrito, setSeccionActual, setProductoSeleccionado) => {
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
    setCarrito([...carrito, nuevoItem]);

    // Simulamos una pequeña carga y redirigimos al carrito
    setTimeout(() => {
      setAgregando(false);
      setProductoSeleccionado(null); // Cerramos el detalle
      setSeccionActual('carrito');   // Vamos a la bolsa
    }, 600);
  };

  return {
    agregando,
    volverAtras,
    añadirAlCarrito
  };
};