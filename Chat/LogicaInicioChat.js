import { useState } from 'react';

export const useLogicaInicioChat = (chatsIniciales, setChatSeleccionado) => {
  const [busqueda, setBusqueda] = useState('');

  // Filtramos la lista de chats según el nombre que el usuario escriba
  const chatsFiltrados = chatsIniciales.filter(chat =>
    chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para abrir la conversación con un usuario
  const abrirConversacion = (chat) => {
    setChatSeleccionado(chat);
  };

  // Función para crear un nuevo mensaje (abriría una lista de contactos)
  const nuevoMensaje = () => {
    console.log("Abriendo lista de contactos para nuevo chat...");
  };

  return {
    busqueda,
    setBusqueda,
    chatsFiltrados,
    abrirConversacion,
    nuevoMensaje
  };
};