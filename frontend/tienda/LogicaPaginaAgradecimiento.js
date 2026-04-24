import { useState, useEffect } from 'react';

export const useLogicaAgradecimiento = (setSeccionActual) => {
  const [numeroOrden, setNumeroOrden] = useState('');

  useEffect(() => {
    // Generamos un número de orden aleatorio al cargar la página
    const randomOrder = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setNumeroOrden(randomOrder);
  }, []);

  // Función para volver a la tienda y seguir comprando
  const volverALaTienda = () => {
    setSeccionActual('tienda');
  };

  // Función para ver el estado del pedido (simulado)
  const verMisPedidos = () => {
    setSeccionActual('perfil');
  };

  return {
    numeroOrden,
    volverALaTienda,
    verMisPedidos
  };
};