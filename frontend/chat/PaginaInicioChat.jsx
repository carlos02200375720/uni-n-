import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * LÓGICA DEL COMPONENTE (Inline Hook)
 * En un entorno de producción, esto iría en LogicaPaginaInicioChat.js
 */
const useLogicaInicioChat = (chatsIniciales, setChatSeleccionado, usernameActual, apiBaseUrl) => {
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  // Filtramos la lista de chats según el nombre que el usuario escriba
  const chatsFiltrados = (chatsIniciales || []).filter((chat) => {
    const termino = busqueda.toLowerCase();
    return chat.nombre.toLowerCase().includes(termino) || String(chat.username || '').toLowerCase().includes(termino);
  });

  useEffect(() => {
    const termino = busqueda.trim();

    if (!termino || !usernameActual || !apiBaseUrl) {
      setResultadosBusqueda([]);
      setBuscandoUsuarios(false);
      return;
    }

    let activo = true;
    const temporizador = window.setTimeout(async () => {
      try {
        setBuscandoUsuarios(true);
        const respuesta = await fetch(`${apiBaseUrl}/api/chat/buscar?username=${encodeURIComponent(usernameActual)}&q=${encodeURIComponent(termino)}`);

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} al buscar usuarios`);
        }

        const datos = await respuesta.json();

        if (activo && Array.isArray(datos)) {
          setResultadosBusqueda(datos);
        }
      } catch (error) {
        console.error('No se pudieron buscar usuarios para iniciar chats.', error);
        if (activo) {
          setResultadosBusqueda([]);
        }
      } finally {
        if (activo) {
          setBuscandoUsuarios(false);
        }
      }
    }, 260);

    return () => {
      activo = false;
      window.clearTimeout(temporizador);
    };
  }, [apiBaseUrl, busqueda, usernameActual]);

  const listaVisible = useMemo(() => {
    if (!busqueda.trim()) {
      return chatsFiltrados;
    }

    const mapaResultados = new Map();

    chatsFiltrados.forEach((chat) => {
      mapaResultados.set(String(chat.id), chat);
    });

    resultadosBusqueda.forEach((chat) => {
      mapaResultados.set(String(chat.id), {
        ...mapaResultados.get(String(chat.id)),
        ...chat
      });
    });

    return Array.from(mapaResultados.values());
  }, [busqueda, chatsFiltrados, resultadosBusqueda]);

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
    resultadosBusqueda,
    buscandoUsuarios,
    listaVisible,
    abrirConversacion,
    nuevoMensaje
  };
};

/**
 * VISTA DEL COMPONENTE
 */
export const PaginaInicioChat = ({ chats = [], setChatSeleccionado, usernameActual, apiBaseUrl }) => {
  // Conectamos la lógica integrada
  const { 
    busqueda, 
    setBusqueda, 
    buscandoUsuarios,
    listaVisible,
    abrirConversacion, 
    nuevoMensaje 
  } = useLogicaInicioChat(chats, setChatSeleccionado, usernameActual, apiBaseUrl);

  return (
    <div className="min-h-screen bg-white pt-20 pb-28 px-6 text-left">
      {/* Encabezado */}
      <header className="fixed top-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center gap-2.5 rounded-t-[24px] bg-white px-4 pt-3 pb-2.5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Buscar por nombre o usuario..."
            className="w-full bg-gray-50 py-3 pl-10 pr-4 rounded-[18px] outline-none text-[13px] font-medium focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button 
          onClick={nuevoMensaje}
          className="shrink-0 p-2.5 bg-blue-600 text-white rounded-[18px] shadow-lg shadow-blue-100 active:scale-90 transition-all"
        >
          <Plus size={20} />
        </button>
      </header>

      {busqueda.trim() && (
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
          {buscandoUsuarios ? 'Buscando usuarios registrados...' : 'Resultados de usuarios registrados'}
        </p>
      )}

      {/* Lista de Chats */}
      <div className="space-y-2">
        {listaVisible.length > 0 ? (
          listaVisible.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => abrirConversacion(chat)}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-[32px] transition-all cursor-pointer active:scale-[0.98] group"
            >
              {/* Avatar con Indicador de Online */}
              <div className="relative">
                  {chat.foto && chat.foto.trim() !== '' ? (
                    <img
                      src={chat.foto}
                      className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-blue-100 transition-all"
                      alt={chat.nombre}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentNode;
                        if (parent && parent.querySelector('.icono-fallback') == null) {
                          const icon = document.createElement('span');
                          icon.className = 'icono-fallback';
                          parent.appendChild(icon);
                        }
                      }}
                    />
                  ) : (
                    <User size={64} color="#cbd5e1" />
                  )}
                  {/* Fallback SVG si la imagen falla */}
                  <span className="icono-fallback hidden absolute inset-0 flex items-center justify-center"><User size={64} color="#cbd5e1" /></span>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
                )}
              </div>

              {/* Información del Chat */}
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{chat.nombre}</h3>
                  <span className="text-[10px] text-gray-400 font-bold">@{chat.username || 'usuario'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 truncate font-medium max-w-[180px]">
                    {chat.ultimoMsg}
                  </p>
                  <div className={`h-2 w-2 rounded-full ${chat.esNuevoContacto ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
                </div>
              </div>

              <ChevronRight size={16} className="text-gray-200 group-hover:text-gray-400 transition-colors" />
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-medium text-sm">{busqueda.trim() ? 'No se encontraron usuarios o conversaciones con ese dato.' : 'No se encontraron conversaciones.'}</p>
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