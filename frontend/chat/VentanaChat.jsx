import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MoreVertical, Smile, Paperclip, Phone, Video } from 'lucide-react';

/**
 * Lógica interna del componente de Chat Individual
 * Maneja el estado de los mensajes, el envío y el scroll automático.
 */
const useLogicaVentanaChat = (chatSeleccionado, setChatSeleccionado, usernameActual, apiBaseUrl) => {
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!chatSeleccionado?.id || !usernameActual) {
      setMensajes([]);
      return;
    }

    let activo = true;

    const cargarMensajes = async () => {
      try {
        const respuesta = await fetch(`${apiBaseUrl}/api/chat/mensajes/${chatSeleccionado.id}?username=${encodeURIComponent(usernameActual)}`);

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} al cargar mensajes`);
        }

        const datos = await respuesta.json();

        if (activo && Array.isArray(datos)) {
          setMensajes(datos);
        }
      } catch (error) {
        console.error('No se pudieron cargar los mensajes desde la API.', error);
      }
    };

    cargarMensajes();

    return () => {
      activo = false;
    };
  }, [apiBaseUrl, chatSeleccionado?.id, usernameActual]);

  // Desplazamiento automático al final cuando hay mensajes nuevos
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes]);

  const cerrarChat = () => {
    setChatSeleccionado(null);
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensajeTexto.trim() || !chatSeleccionado?.id || !usernameActual) return;

    const texto = mensajeTexto.trim();

    const nuevoMensaje = {
      id: `temp-${Date.now()}`,
      texto,
      remitente: 'yo',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);
    setMensajeTexto('');

    try {
      const respuesta = await fetch(`${apiBaseUrl}/api/chat/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receptorId: chatSeleccionado.id,
          texto,
          username: usernameActual
        })
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al enviar el mensaje`);
      }

      const datos = await respuesta.json();
      setMensajes((prev) => prev.map((mensaje) => mensaje.id === nuevoMensaje.id ? datos.data : mensaje));
    } catch (error) {
      console.error('No se pudo enviar el mensaje en la API.', error);
      setMensajes((prev) => prev.filter((mensaje) => mensaje.id !== nuevoMensaje.id));
      setMensajeTexto(texto);
    }
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

/**
 * Componente Visual de la Ventana de Chat
 */
export const VentanaChat = ({ chatSeleccionado, setChatSeleccionado, usernameActual, apiBaseUrl }) => {
  const {
    mensajeTexto,
    setMensajeTexto,
    mensajes,
    scrollRef,
    cerrarChat,
    enviarMensaje
  } = useLogicaVentanaChat(chatSeleccionado, setChatSeleccionado, usernameActual, apiBaseUrl);

  if (!chatSeleccionado) return null;

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Cabecera del Chat */}
      <header className="pt-14 pb-4 px-6 border-b border-gray-50 flex items-center gap-3 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={cerrarChat} 
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
        >
          <ArrowLeft size={22} />
        </button>
        
        <div className="relative">
          <img 
            src={chatSeleccionado.foto} 
            className="w-10 h-10 rounded-full object-cover shadow-sm" 
            alt={chatSeleccionado.nombre} 
          />
          {chatSeleccionado.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        <div className="flex-1 text-left overflow-hidden">
          <h3 className="font-bold text-sm text-gray-900 truncate">{chatSeleccionado.nombre}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {chatSeleccionado.online ? 'En línea' : 'Disponible'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-blue-600"><Phone size={20} /></button>
          <button className="p-2 text-gray-400 hover:text-blue-600"><Video size={20} /></button>
          <button className="p-2 text-gray-400"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9F9F9]">
        {mensajes.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.remitente === 'yo' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className={`max-w-[75%] shadow-sm ${
              m.remitente === 'yo' 
              ? 'bg-blue-600 text-white rounded-[24px] rounded-tr-none p-4' 
              : 'bg-white text-gray-800 rounded-[24px] rounded-tl-none p-4 border border-gray-100'
            }`}>
              <p className="text-sm font-medium leading-relaxed">{m.texto}</p>
              <p className={`text-[9px] mt-1 font-bold uppercase ${m.remitente === 'yo' ? 'text-blue-200' : 'text-gray-400'}`}>
                {m.hora || 'Ahora'}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input de Mensaje */}
      <div className="p-6 bg-white border-t border-gray-50">
        <form 
          onSubmit={enviarMensaje}
          className="flex items-center gap-3 bg-gray-50 p-2 pl-5 rounded-[24px] border border-gray-100 focus-within:border-blue-200 transition-all"
        >
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Smile size={22} />
          </button>
          
          <input 
            type="text" 
            placeholder="Escribe un mensaje..." 
            className="flex-1 bg-transparent outline-none text-sm py-2 font-medium"
            value={mensajeTexto}
            onChange={(e) => setMensajeTexto(e.target.value)}
          />

          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Paperclip size={22} />
          </button>

          <button 
            type="submit"
            disabled={!mensajeTexto.trim()}
            className={`p-3 rounded-full transition-all ${
              mensajeTexto.trim() 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 active:scale-90' 
              : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VentanaChat;