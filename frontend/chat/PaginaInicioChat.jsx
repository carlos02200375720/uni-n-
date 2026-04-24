import React, { useState } from 'react';
import { Search, Plus, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * LÓGICA DEL COMPONENTE (Inline Hook)
 * En un entorno de producción, esto iría en LogicaPaginaInicioChat.js
 */
const useLogicaInicioChat = (chatsIniciales, setChatSeleccionado) => {
  const [busqueda, setBusqueda] = useState('');

  // Filtramos la lista de chats según el nombre que el usuario escriba
  const chatsFiltrados = (chatsIniciales || []).filter(chat =>
    chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para abrir la conversación con un usuario
  const abrirConversacion = (chat) => {
    if (setChatSeleccionado) {
      setChatSeleccionado(chat);
    }
  };

  // Función para crear un nuevo mensaje
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

/**
 * VISTA DEL COMPONENTE
 */
export const PaginaInicioChat = ({ chats = [], setChatSeleccionado }) => {
  // Conectamos la lógica integrada
  const { 
    busqueda, 
    setBusqueda, 
    chatsFiltrados, 
    abrirConversacion, 
    nuevoMensaje 
  } = useLogicaInicioChat(chats, setChatSeleccionado);

  return (
    <div className="min-h-screen bg-white pt-14 pb-28 px-6 text-left">
      {/* Encabezado */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mensajes</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            {chats.filter(c => c.online).length} En línea ahora
          </p>
        </div>
        <button 
          onClick={nuevoMensaje}
          className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Buscador de Chats */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar conversaciones..."
          className="w-full bg-gray-50 p-4 pl-12 rounded-[20px] outline-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Chats */}
      <div className="space-y-2">
        {chatsFiltrados.length > 0 ? (
          chatsFiltrados.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => abrirConversacion(chat)}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-[32px] transition-all cursor-pointer active:scale-[0.98] group"
            >
              {/* Avatar con Indicador de Online */}
              <div className="relative">
                <img 
                  src={chat.foto || 'https://via.placeholder.com/150'} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-blue-100 transition-all" 
                  alt={chat.nombre} 
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
                )}
              </div>

              {/* Información del Chat */}
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{chat.nombre}</h3>
                  <span className="text-[10px] text-gray-400 font-bold">12:45 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 truncate font-medium max-w-[180px]">
                    {chat.ultimoMsg}
                  </p>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>

              <ChevronRight size={16} className="text-gray-200 group-hover:text-gray-400 transition-colors" />
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium text-sm">No se encontraron conversaciones.</p>
          </div>
        )}
      </div>

      {/* Botón flotante para opciones rápidas */}
      <button className="fixed bottom-32 right-8 p-4 bg-white shadow-2xl rounded-full text-gray-800 border border-gray-50 active:scale-90">
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
};

// Exportación por defecto para compatibilidad
export default PaginaInicioChat;