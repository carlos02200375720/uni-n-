import { useState } from 'react';

export const useLogicaCarrito = (carrito, setCarrito, setSeccionActual) => {
  
  // Calcular el subtotal sumando los precios de todos los productos
  const subtotal = carrito.reduce((acc, producto) => acc + producto.precio, 0);
  
  // Configuración de costos adicionales
  const costoEnvio = subtotal > 1000 ? 0 : 15; // Envío gratis si supera los 1000
  const impuestos = subtotal * 0.18; // Ejemplo con ITBIS/IVA del 18%
  const total = subtotal + costoEnvio + impuestos;

  // Función para eliminar un producto específico usando su tempId único
  const eliminarProducto = (tempId) => {
    const nuevoCarrito = carrito.filter(item => item.tempId !== tempId);
    setCarrito(nuevoCarrito);
  };

  // Función para avanzar al proceso de envío
  const procederAlEnvio = () => {
    if (carrito.length > 0) {
      setSeccionActual('envio');
    }
  };

  // Función para seguir explorando la tienda
  const seguirComprando = () => {
    setSeccionActual('tienda');
  };

  return {
    subtotal,
    costoEnvio,
    impuestos,
    total,
    eliminarProducto,
    procederAlEnvio,
    seguirComprando
  };
};