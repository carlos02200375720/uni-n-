import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MoreVertical, Smile, Paperclip, Phone, Video } from 'lucide-react';
import { obtenerSocketChat } from '../utils/socket';

const configuracionRtc = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const detenerStream = (stream) => {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
};

const obtenerErrorLlamada = (error, esVideo = false) => {
  if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'Las llamadas solo funcionan en localhost o en un sitio HTTPS. Abre la app en un origen seguro para usar micrófono y cámara.';
  }

  const mensaje = String(error?.message || '').toLowerCase();

  if (!navigator.mediaDevices?.getUserMedia) {
    return esVideo
      ? 'Tu navegador o este origen no permiten acceder a la cámara y al micrófono.'
      : 'Tu navegador o este origen no permiten acceder al micrófono.';
  }

  if (mensaje.includes('permission') || mensaje.includes('denied') || mensaje.includes('notallowed')) {
    return esVideo
      ? 'La llamada fue bloqueada. Debes permitir acceso a la cámara y al micrófono.'
      : 'La llamada fue bloqueada. Debes permitir acceso al micrófono.';
  }

  if (mensaje.includes('notfound') || mensaje.includes('devices not found')) {
    return esVideo
      ? 'No se encontró una cámara o micrófono disponibles en este dispositivo.'
      : 'No se encontró un micrófono disponible en este dispositivo.';
  }

  return esVideo
    ? 'No se pudo iniciar la videollamada. Verifica permisos de micrófono y cámara.'
    : 'No se pudo iniciar la llamada. Verifica permisos de micrófono.';
};

const notificarErrorVisible = (mensaje) => {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(mensaje);
  }
};

/**
 * Lógica interna del componente de Chat Individual
 * Maneja el estado de los mensajes, el envío y el scroll automático.
 */
const useLogicaVentanaChat = (chatSeleccionado, setChatSeleccionado, usernameActual, apiBaseUrl, llamadaEntranteInicial, onConsumirLlamadaEntrante) => {
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [llamadaActual, setLlamadaActual] = useState(null);
  const [llamadaEntrante, setLlamadaEntrante] = useState(llamadaEntranteInicial || null);
  const [errorLlamada, setErrorLlamada] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const scrollRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callSessionIdRef = useRef(null);
  const candidateOffsetRef = useRef(0);
  const soyEmisorLlamadaRef = useRef(false);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

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

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    remoteStreamRef.current = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (!llamadaEntranteInicial?.id || !chatSeleccionado?.id) {
      return;
    }

    if (String(llamadaEntranteInicial.callerId) !== String(chatSeleccionado.id)) {
      return;
    }

    callSessionIdRef.current = llamadaEntranteInicial.id;
    setLlamadaEntrante(llamadaEntranteInicial);
    onConsumirLlamadaEntrante?.();
  }, [chatSeleccionado?.id, llamadaEntranteInicial, onConsumirLlamadaEntrante]);

  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      detenerStream(localStreamRef.current);
      detenerStream(remoteStreamRef.current);
    };
  }, []);

  const cerrarChat = async () => {
    try {
      if (callSessionIdRef.current) {
        await fetch(`${apiBaseUrl}/api/chat/llamadas/${callSessionIdRef.current}/finalizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: usernameActual, status: 'ended' })
        });
      } else if (llamadaEntrante?.id) {
        await fetch(`${apiBaseUrl}/api/chat/llamadas/${llamadaEntrante.id}/finalizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: usernameActual, status: 'missed' })
        });
      }
    } catch (error) {
      console.error('No se pudo cerrar correctamente el estado de la llamada al salir del chat.', error);
    } finally {
      onConsumirLlamadaEntrante?.();
      limpiarEstadoLlamada();
      setChatSeleccionado(null);
    }
  };

  const limpiarEstadoLlamada = (mantenerEntrante = false) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    detenerStream(localStreamRef.current);
    detenerStream(remoteStreamRef.current);
    setLocalStream(null);
    setRemoteStream(null);
    setLlamadaActual(null);
    setErrorLlamada('');
    candidateOffsetRef.current = 0;
    callSessionIdRef.current = null;
    soyEmisorLlamadaRef.current = false;

    if (!mantenerEntrante) {
      setLlamadaEntrante(null);
      onConsumirLlamadaEntrante?.();
    }
  };

  const enviarCandidateLlamada = async (candidate) => {
    if (!callSessionIdRef.current || !candidate) {
      return;
    }

    await fetch(`${apiBaseUrl}/api/chat/llamadas/${callSessionIdRef.current}/candidato`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: usernameActual,
        candidate
      })
    });
  };

  const crearPeerConnection = (stream) => {
    const connection = new RTCPeerConnection(configuracionRtc);

    stream.getTracks().forEach((track) => {
      connection.addTrack(track, stream);
    });

    connection.onicecandidate = (evento) => {
      if (evento.candidate) {
        enviarCandidateLlamada(evento.candidate.toJSON()).catch((error) => {
          console.error('No se pudo enviar el candidato ICE.', error);
        });
      }
    };

    connection.ontrack = (evento) => {
      const streamRemoto = evento.streams?.[0];
      if (streamRemoto) {
        setRemoteStream(streamRemoto);
      }
    };

    peerConnectionRef.current = connection;
    return connection;
  };

  const finalizarLlamada = async (status = 'ended') => {
    try {
      if (callSessionIdRef.current) {
        await fetch(`${apiBaseUrl}/api/chat/llamadas/${callSessionIdRef.current}/finalizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: usernameActual, status })
        });
      }
    } catch (error) {
      console.error('No se pudo finalizar la llamada.', error);
    } finally {
      limpiarEstadoLlamada();
    }
  };

  const iniciarLlamada = async (tipo) => {
    if (!chatSeleccionado?.id || !usernameActual || llamadaActual || llamadaEntrante) {
      return;
    }

    try {
      setErrorLlamada('');
      setLlamadaActual({ id: null, tipo, estado: 'preparing' });

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia no disponible');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: tipo === 'video'
      });

      setLocalStream(stream);
      const connection = crearPeerConnection(stream);
      const offer = await connection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: tipo === 'video'
      });

      await connection.setLocalDescription(offer);

      const respuesta = await fetch(`${apiBaseUrl}/api/chat/llamadas/iniciar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameActual,
          receptorId: chatSeleccionado.id,
          tipo,
          offer: connection.localDescription
        })
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al iniciar la llamada`);
      }

      const datos = await respuesta.json();
      callSessionIdRef.current = datos.id;
      soyEmisorLlamadaRef.current = true;
      setLlamadaActual({ id: datos.id, tipo, estado: 'calling' });
    } catch (error) {
      console.error('No se pudo iniciar la llamada.', error);
      const mensajeError = obtenerErrorLlamada(error, tipo === 'video');
      setErrorLlamada(mensajeError);
      notificarErrorVisible(mensajeError);
      limpiarEstadoLlamada();
    }
  };

  const responderLlamada = async (aceptar) => {
    if (!llamadaEntrante) {
      return;
    }

    try {
      if (!aceptar) {
        await fetch(`${apiBaseUrl}/api/chat/llamadas/${llamadaEntrante.id}/responder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: usernameActual, status: 'rejected' })
        });
        setLlamadaEntrante(null);
        onConsumirLlamadaEntrante?.();
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia no disponible');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: llamadaEntrante.type === 'video'
      });

      setLocalStream(stream);
      const connection = crearPeerConnection(stream);
      await connection.setRemoteDescription(new RTCSessionDescription(llamadaEntrante.offer));
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      const respuesta = await fetch(`${apiBaseUrl}/api/chat/llamadas/${llamadaEntrante.id}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameActual,
          answer: connection.localDescription,
          status: 'active'
        })
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al responder la llamada`);
      }

      callSessionIdRef.current = llamadaEntrante.id;
      soyEmisorLlamadaRef.current = false;
      setLlamadaActual({ id: llamadaEntrante.id, tipo: llamadaEntrante.type, estado: 'active' });
      setLlamadaEntrante(null);
      onConsumirLlamadaEntrante?.();
    } catch (error) {
      console.error('No se pudo responder la llamada.', error);
      const mensajeError = obtenerErrorLlamada(error, llamadaEntrante?.type === 'video');
      setErrorLlamada(mensajeError);
      notificarErrorVisible(mensajeError);
      limpiarEstadoLlamada();
    }
  };

  useEffect(() => {
    if (!chatSeleccionado?.id || !usernameActual || !apiBaseUrl) {
      return undefined;
    }

    const socket = obtenerSocketChat(apiBaseUrl);

    if (!socket) {
      return undefined;
    }

    const manejarLlamadaEntrante = (datos) => {
      if (!datos?.id || String(datos.callerId) !== String(chatSeleccionado.id)) {
        return;
      }

      callSessionIdRef.current = datos.id;
      setLlamadaEntrante(datos);
      onConsumirLlamadaEntrante?.();
    };

    const manejarActualizacionLlamada = async (datos) => {
      if (!datos?.id || callSessionIdRef.current !== datos.id) {
        return;
      }

      const connection = peerConnectionRef.current;

      try {
        if (datos.answer && soyEmisorLlamadaRef.current && connection && !connection.currentRemoteDescription) {
          await connection.setRemoteDescription(new RTCSessionDescription(datos.answer));
        }

        if (datos.status === 'active') {
          setLlamadaActual((prev) => prev ? { ...prev, estado: 'active' } : prev);
        }

        if (['ended', 'rejected', 'missed'].includes(datos.status)) {
          limpiarEstadoLlamada();
        }
      } catch (error) {
        console.error('No se pudo aplicar la actualización de la llamada.', error);
      }
    };

    const manejarCandidateIce = async (datos) => {
      if (!datos?.id || callSessionIdRef.current !== datos.id || !peerConnectionRef.current) {
        return;
      }

      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(datos.candidate));
      } catch (error) {
        console.error('No se pudo agregar el candidato ICE remoto.', error);
      }
    };

    const manejarFinalizacion = (datos) => {
      if (!datos?.id || callSessionIdRef.current !== datos.id) {
        return;
      }

      limpiarEstadoLlamada();
    };

    socket.on('llamada:entrante', manejarLlamadaEntrante);
    socket.on('llamada:actualizada', manejarActualizacionLlamada);
    socket.on('llamada:candidato-ice', manejarCandidateIce);
    socket.on('llamada:finalizada', manejarFinalizacion);

    return () => {
      socket.off('llamada:entrante', manejarLlamadaEntrante);
      socket.off('llamada:actualizada', manejarActualizacionLlamada);
      socket.off('llamada:candidato-ice', manejarCandidateIce);
      socket.off('llamada:finalizada', manejarFinalizacion);
    };
  }, [apiBaseUrl, chatSeleccionado?.id, onConsumirLlamadaEntrante, usernameActual]);

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
    enviarMensaje,
    iniciarLlamada,
    finalizarLlamada,
    responderLlamada,
    llamadaActual,
    llamadaEntrante,
    errorLlamada,
    localStream,
    remoteStream
  };
};

/**
 * Componente Visual de la Ventana de Chat
 */
export const VentanaChat = ({ chatSeleccionado, setChatSeleccionado, usernameActual, apiBaseUrl, llamadaEntranteInicial, onConsumirLlamadaEntrante }) => {
  const {
    mensajeTexto,
    setMensajeTexto,
    mensajes,
    scrollRef,
    cerrarChat,
    enviarMensaje,
    iniciarLlamada,
    finalizarLlamada,
    responderLlamada,
    llamadaActual,
    llamadaEntrante,
    errorLlamada,
    localStream,
    remoteStream
  } = useLogicaVentanaChat(chatSeleccionado, setChatSeleccionado, usernameActual, apiBaseUrl, llamadaEntranteInicial, onConsumirLlamadaEntrante);
  const videoLocalRef = useRef(null);
  const videoRemotoRef = useRef(null);

  useEffect(() => {
    if (videoLocalRef.current) {
      videoLocalRef.current.srcObject = localStream || null;
    }
  }, [localStream]);

  useEffect(() => {
    if (videoRemotoRef.current) {
      videoRemotoRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  if (!chatSeleccionado) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-center bg-white animate-in slide-in-from-right duration-300">
      <div className="flex min-h-dvh w-full max-w-md flex-col bg-white">
      {/* Cabecera del Chat */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 pb-3 pt-3 shadow-sm">
        <button 
          onClick={cerrarChat} 
          className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="relative">
          <img 
            src={chatSeleccionado.foto} 
            className="h-10 w-10 rounded-full object-cover shadow-sm" 
            alt={chatSeleccionado.nombre} 
          />
          {chatSeleccionado.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        <div className="flex-1 text-left overflow-hidden">
          <h3 className="font-bold text-sm text-gray-900 truncate">{chatSeleccionado.nombre}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.16em]">
            {chatSeleccionado.online ? 'En línea' : 'Disponible'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => iniciarLlamada('audio')} disabled={Boolean(llamadaActual || llamadaEntrante)} className="rounded-full p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"><Phone size={18} /></button>
          <button onClick={() => iniciarLlamada('video')} disabled={Boolean(llamadaActual || llamadaEntrante)} className="rounded-full p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"><Video size={18} /></button>
          <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><MoreVertical size={18} /></button>
        </div>
      </header>

      {errorLlamada && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
          {errorLlamada}
        </div>
      )}

      {llamadaEntrante && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-black text-emerald-700">Llamada entrante {llamadaEntrante.type === 'video' ? 'de video' : 'de audio'}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">{llamadaEntrante.callerName || chatSeleccionado.nombre} te está llamando.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => responderLlamada(false)} className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-black text-gray-600 shadow-sm">Rechazar</button>
            <button onClick={() => responderLlamada(true)} className="flex-1 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm">Responder</button>
          </div>
        </div>
      )}

      {llamadaActual && (
        <section className="border-b border-gray-100 bg-slate-950 px-3 py-3 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">{llamadaActual.tipo === 'video' ? 'Videollamada' : 'Llamada de voz'}</p>
              <p className="mt-1 text-sm font-black">
                {llamadaActual.estado === 'preparing'
                  ? 'Preparando llamada...'
                  : llamadaActual.estado === 'calling'
                    ? 'Llamando...'
                    : 'En llamada'}
              </p>
            </div>
            <button onClick={() => finalizarLlamada('ended')} className="rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">Colgar</button>
          </div>

          {llamadaActual.tipo === 'video' ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="overflow-hidden rounded-[22px] bg-black/40 aspect-[3/4]">
                {remoteStream ? (
                  <video ref={videoRemotoRef} autoPlay playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-white/55">Esperando video remoto...</div>
                )}
              </div>
              <div className="overflow-hidden rounded-[22px] bg-black/30 aspect-[3/4]">
                {localStream ? (
                  <video ref={videoLocalRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-white/55">Preparando cámara...</div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[22px] bg-white/8 px-4 py-4 text-sm font-medium text-white/80">
              {remoteStream
                ? 'Audio conectado. Puedes hablar ahora.'
                : llamadaActual.estado === 'preparing'
                  ? 'Solicitando acceso al micrófono...'
                  : 'Conectando audio con el otro usuario...'}
            </div>
          )}
        </section>
      )}

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto bg-[#F9F9F9] px-4 py-4 space-y-3">
        {mensajes.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.remitente === 'yo' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className={`max-w-[75%] shadow-sm ${
              m.remitente === 'yo' 
              ? 'bg-blue-600 text-white rounded-[22px] rounded-tr-none px-4 py-3' 
              : 'bg-white text-gray-800 rounded-[22px] rounded-tl-none px-4 py-3 border border-gray-100'
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
      <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-3">
        <form 
          onSubmit={enviarMensaje}
          className="flex items-center gap-2 rounded-[22px] border border-gray-100 bg-gray-50 p-2 pl-4 transition-all focus-within:border-blue-200"
        >
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Smile size={20} />
          </button>
          
          <input 
            type="text" 
            placeholder="Escribe un mensaje..." 
            className="flex-1 bg-transparent py-2 text-sm font-medium outline-none"
            value={mensajeTexto}
            onChange={(e) => setMensajeTexto(e.target.value)}
          />

          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Paperclip size={20} />
          </button>

          <button 
            type="submit"
            disabled={!mensajeTexto.trim()}
            className={`rounded-full p-2.5 transition-all ${
              mensajeTexto.trim() 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 active:scale-90' 
              : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default VentanaChat;