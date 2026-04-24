/**
 * CONTROLADOR DE CHAT
 * Gestiona el envío de mensajes, el historial de conversaciones 
 * y el estado de los contactos.
 */

const mongoose = require('mongoose');
const { Mensaje, Usuario } = require('../configuracion/ArquitecturaBaseDeDatos');

const formatearHora = (fecha) => new Date(fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const serializarMensaje = (mensaje, usuarioActualId) => ({
  id: mensaje._id ? mensaje._id.toString() : String(mensaje.id),
  texto: mensaje.contenido,
  remitente: String(mensaje.emisor) === String(usuarioActualId) ? 'yo' : 'otro',
  hora: formatearHora(mensaje.createdAt || Date.now())
});

const construirListaChats = async (usuarioActual) => {
  const mensajes = await Mensaje.find({
    $or: [
      { emisor: usuarioActual._id },
      { receptor: usuarioActual._id }
    ]
  })
    .sort({ createdAt: -1 })
    .populate('emisor', 'username nombreCompleto fotoPerfil')
    .populate('receptor', 'username nombreCompleto fotoPerfil')
    .lean();

  const mapaChats = new Map();

  mensajes.forEach((mensaje) => {
    const esEmisor = String(mensaje.emisor._id) === String(usuarioActual._id);
    const otroUsuario = esEmisor ? mensaje.receptor : mensaje.emisor;

    if (!otroUsuario || mapaChats.has(String(otroUsuario._id))) {
      return;
    }

    mapaChats.set(String(otroUsuario._id), {
      id: String(otroUsuario._id),
      nombre: otroUsuario.nombreCompleto || otroUsuario.username,
      foto: otroUsuario.fotoPerfil || 'https://via.placeholder.com/150',
      online: false,
      ultimoMsg: mensaje.contenido
    });
  });

  return Array.from(mapaChats.values());
};

// --- FUNCIONES DEL CONTROLADOR ---

/**
 * Obtiene todos los chats activos del usuario para la lista inicial
 */
const obtenerListaChats = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username es obligatorio' });
    }

    const usuarioActual = await Usuario.findOne({ username });

    if (!usuarioActual) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const listaSimplificada = await construirListaChats(usuarioActual);
    
    res.status(200).json(listaSimplificada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cargar la lista de chats", error: error.message });
  }
};

/**
 * Obtiene todos los mensajes de una conversación específica por su ID
 */
const obtenerMensajesDeChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username es obligatorio' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'Conversación no válida' });
    }

    const usuarioActual = await Usuario.findOne({ username });

    if (!usuarioActual) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const mensajes = await Mensaje.find({
      $or: [
        { emisor: usuarioActual._id, receptor: id },
        { emisor: id, receptor: usuarioActual._id }
      ]
    }).sort({ createdAt: 1 }).lean();

    res.status(200).json(mensajes.map((mensaje) => serializarMensaje(mensaje, usuarioActual._id)));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar la conversación', error: error.message });
  }
};

/**
 * Recibe un nuevo mensaje del frontend y lo añade al historial
 */
const enviarMensaje = async (req, res) => {
  try {
    const { receptorId, texto, username } = req.body;

    if (!texto || !receptorId || !username) {
      return res.status(400).json({ mensaje: 'Datos incompletos para enviar el mensaje' });
    }

    if (!mongoose.Types.ObjectId.isValid(receptorId)) {
      return res.status(400).json({ mensaje: 'No se encontró el chat destino' });
    }

    const [emisor, receptor] = await Promise.all([
      Usuario.findOne({ username }),
      Usuario.findById(receptorId)
    ]);

    if (!emisor || !receptor) {
      return res.status(404).json({ mensaje: 'No se encontró el chat destino' });
    }

    const nuevoMsg = await Mensaje.create({
      emisor: emisor._id,
      receptor: receptor._id,
      contenido: String(texto).trim(),
      tipo: 'texto'
    });

    res.status(201).json({
      mensaje: 'Mensaje enviado y guardado',
      data: serializarMensaje(nuevoMsg.toObject(), emisor._id)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar el mensaje', error: error.message });
  }
};

module.exports = {
  obtenerListaChats,
  obtenerMensajesDeChat,
  enviarMensaje
};