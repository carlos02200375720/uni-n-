import { useState, useEffect, useRef } from 'react';

export const useLogicaVentanaChat = (chatSeleccionado, setChatSeleccionado) => {
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [mensajes, setMensajes] = useState(chatSeleccionado?.mensajes || []);
  const scrollRef = useRef(null);

  // Efecto para hacer scroll al final cada vez que llega un mensaje nuevo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes]);

  // Función para cerrar el chat y volver a la lista
  const cerrarChat = () => {
    setChatSeleccionado(null);
  };

  // Función para enviar un mensaje
  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensajeTexto.trim()) return;

    const nuevoMensaje = {
      id: Date.now(),
      texto: mensajeTexto,
      remitente: 'yo',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes([...mensajes, nuevoMensaje]);
    setMensajeTexto('');

    // Aquí podrías añadir una respuesta automática simulada
    setTimeout(() => {
      const respuesta = {
        id: Date.now() + 1,
        texto: "¡Entendido! Te respondo en un momento. 👍",
        remitente: 'otro',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMensajes(prev => [...prev, respuesta]);
    }, 1500);
  };

  return {
    mensajeTexto,
    setMensajeTexto,
    mensajes,
    scrollRef,
    cerrarChat,
    enviarMensaje
  };
};