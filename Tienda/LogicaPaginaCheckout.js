import { useState } from 'react';

export const useLogicaCheckout = (carrito, setCarrito, setSeccionActual) => {
  // Estado para controlar en qué paso del checkout estamos (envio o pago)
  const [paso, setPaso] = useState('envio');
  const [procesando, setProcesando] = useState(false);

  // Estado de los datos del cliente
  const [datos, setDatos] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    zip: '',
    titular: '',
    tarjeta: '',
    exp: '',
    cvv: ''
  });

  // Cálculo del total final
  const subtotal = carrito.reduce((acc, p) => acc + p.precio, 0);
  const total = subtotal + (subtotal > 1000 ? 0 : 15) + (subtotal * 0.18);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const irAPago = (e) => {
    e.preventDefault();
    setPaso('pago');
  };

  const finalizarCompra = async (e) => {
    e.preventDefault();
    setProcesando(true);

    // Simulamos una llamada a una pasarela de pago (Stripe, PayPal, etc.)
    await new Promise(resolve => setTimeout(resolve, 2500));

    setProcesando(false);
    setCarrito([]); // Vaciamos el carrito tras el éxito
    setSeccionActual('agradecimiento');
  };

  const volverAtras = () => {
    if (paso === 'pago') setPaso('envio');
    else setSeccionActual('carrito');
  };

  return {
    paso,
    datos,
    procesando,
    total,
    manejarCambio,
    irAPago,
    finalizarCompra,
    volverAtras
  };
};