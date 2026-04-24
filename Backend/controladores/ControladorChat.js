/**
 * CONTROLADOR DE CHAT
 * Gestiona el envío de mensajes, el historial de conversaciones 
 * y el estado de los contactos.
 */

// Simulación de Base de Datos para Chats
let historialMensajes = [
  { 
    idChat: 1, 
    nombre: 'Soporte Técnico', 
    foto: 'https://i.pravatar.cc/150?u=1',
    online: true,
    mensajes: [
      { id: 101, texto: 'Hola, ¿en qué podemos ayudarte hoy?', remitente: 'otro', hora: '10:00 AM' }
    ]
  },
  { 
    idChat: 2, 
    nombre: 'María García', 
    foto: 'https://i.pravatar.cc/150?u=2',
    online: false,
    mensajes: [
      { id: 201, texto: '¡El iPhone que compré llegó súper rápido!', remitente: 'otro', hora: '09:30 AM' },
      { id: 202, texto: '¡Qué bueno María! Disfrútalo.', remitente: 'yo', hora: '09:35 AM' }
    ]
  }
];

// --- FUNCIONES DEL CONTROLADOR ---

/**
 * Obtiene todos los chats activos del usuario para la lista inicial
 */
const obtenerListaChats = (req, res) => {
  try {
    const listaSimplificada = historialMensajes.map(chat => ({
      id: chat.idChat,
      nombre: chat.nombre,
      foto: chat.foto,
      online: chat.online,
      ultimoMsg: chat.mensajes[chat.mensajes.length - 1]?.texto || ''
    }));
    
    res.status(200).json(listaSimplificada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cargar la lista de chats", error: error.message });
  }
};

/**
 * Obtiene todos los mensajes de una conversación específica por su ID
 */
const obtenerMensajesDeChat = (req, res) => {
  const { id } = req.params;
  const chat = historialMensajes.find(c => c.idChat === parseInt(id));

  if (!chat) {
    return res.status(404).json({ mensaje: "Conversación no encontrada" });
  }

  res.status(200).json(chat.mensajes);
};

/**
 * Recibe un nuevo mensaje del frontend y lo añade al historial
 */
const enviarMensaje = (req, res) => {
  const { idChat, texto, remitente } = req.body;

  if (!texto || !idChat) {
    return res.status(400).json({ mensaje: "Datos incompletos para enviar el mensaje" });
  }

  const chat = historialMensajes.find(c => c.idChat === parseInt(idChat));
  
  if (!chat) {
    return res.status(404).json({ mensaje: "No se encontró el chat destino" });
  }

  const nuevoMsg = {
    id: Date.now(),
    texto: texto,
    remitente: remitente || 'yo',
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  chat.mensajes.push(nuevoMsg);

  res.status(201).json({
    mensaje: "Mensaje enviado y guardado",
    data: nuevoMsg
  });
};

module.exports = {
  obtenerListaChats,
  obtenerMensajesDeChat,
  enviarMensaje
};