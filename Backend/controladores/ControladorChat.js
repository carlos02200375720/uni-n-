/**
 * CONTROLADOR DE CHAT
 * Gestiona el envío de mensajes, el historial de conversaciones 
 * y el estado de los contactos.
 */

const mongoose = require('mongoose');
const { Mensaje, Usuario } = require('../configuracion/ArquitecturaBaseDeDatos');
const servicioLlamadas = require('../servicios/ServicioLlamadas');
const servicioSocketChat = require('../servicios/ServicioSocketChat');

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
      username: otroUsuario.username,
      foto: otroUsuario.fotoPerfil || 'https://via.placeholder.com/150',
      online: false,
      ultimoMsg: mensaje.contenido
    });
  });

  const usuariosDisponibles = await Usuario.find({
    _id: { $ne: usuarioActual._id }
  })
    .select('username nombreCompleto fotoPerfil')
    .sort({ nombreCompleto: 1, username: 1 })
    .lean();

  usuariosDisponibles.forEach((usuario) => {
    const claveUsuario = String(usuario._id);

    if (mapaChats.has(claveUsuario)) {
      return;
    }

    mapaChats.set(claveUsuario, {
      id: claveUsuario,
      nombre: usuario.nombreCompleto || usuario.username,
      username: usuario.username,
      foto: usuario.fotoPerfil || 'https://via.placeholder.com/150',
      online: false,
      ultimoMsg: 'Empieza una conversación',
      esNuevoContacto: true
    });
  });

  return Array.from(mapaChats.values());
};

const buscarUsuariosChat = async (req, res) => {
  try {
    const { username, q = '' } = req.query;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username actual es obligatorio' });
    }

    const usuarioActual = await Usuario.findOne({ username });

    if (!usuarioActual) {
      return res.status(404).json({ mensaje: 'Usuario actual no encontrado' });
    }

    const termino = String(q).trim();

    if (termino.length < 1) {
      return res.status(200).json([]);
    }

    const expresion = new RegExp(termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const usuarios = await Usuario.find({
      _id: { $ne: usuarioActual._id },
      $or: [
        { username: expresion },
        { nombreCompleto: expresion }
      ]
    })
      .select('username nombreCompleto fotoPerfil')
      .sort({ nombreCompleto: 1, username: 1 })
      .limit(12)
      .lean();

    const listaChats = await construirListaChats(usuarioActual);
    const mapaChats = new Map(listaChats.map((chat) => [String(chat.id), chat]));

    const resultados = usuarios.map((usuario) => {
      const chatExistente = mapaChats.get(String(usuario._id));

      return {
        id: String(usuario._id),
        nombre: usuario.nombreCompleto || usuario.username,
        username: usuario.username,
        foto: usuario.fotoPerfil || 'https://via.placeholder.com/150',
        online: false,
        ultimoMsg: chatExistente?.ultimoMsg || 'Empieza una conversación',
        esNuevoContacto: !chatExistente
      };
    });

    return res.status(200).json(resultados);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al buscar usuarios para chatear', error: error.message });
  }
};

// --- FUNCIONES DEL CONTROLADOR ---

/**
 * Obtiene todos los chats activos del usuario para la lista inicial
 */
const obtenerListaChats = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username === 'visitante') {
      // Si es visitante o no hay username, devolver lista vacía
      return res.status(200).json([]);
    }

    const usuarioActual = await Usuario.findOne({ username });

    if (!usuarioActual) {
      // Si el usuario no existe, devolver lista vacía (no error)
      return res.status(200).json([]);
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

const iniciarLlamada = async (req, res) => {
  try {
    const { username, receptorId, tipo = 'audio', offer } = req.body;

    if (!username || !receptorId || !offer) {
      return res.status(400).json({ mensaje: 'Faltan datos para iniciar la llamada' });
    }

    if (!mongoose.Types.ObjectId.isValid(receptorId)) {
      return res.status(400).json({ mensaje: 'No se encontró el usuario destino para la llamada' });
    }

    const [emisor, receptor] = await Promise.all([
      Usuario.findOne({ username }),
      Usuario.findById(receptorId)
    ]);

    if (!emisor || !receptor) {
      return res.status(404).json({ mensaje: 'No se pudo preparar la llamada entre usuarios' });
    }

    const sesion = servicioLlamadas.crearSesion({
      caller: {
        id: emisor._id,
        username: emisor.username,
        name: emisor.nombreCompleto || emisor.username
      },
      callee: {
        id: receptor._id,
        username: receptor.username,
        name: receptor.nombreCompleto || receptor.username
      },
      type: tipo === 'video' ? 'video' : 'audio',
      offer
    });

    servicioSocketChat.emitirAUsuario(sesion.calleeUsername, 'llamada:entrante', {
      id: sesion.id,
      status: sesion.status,
      type: sesion.type,
      callerId: sesion.callerId,
      callerUsername: sesion.callerUsername,
      callerName: sesion.callerName,
      offer: sesion.offer
    });

    return res.status(201).json({
      id: sesion.id,
      status: sesion.status,
      type: sesion.type,
      callee: {
        id: sesion.calleeId,
        username: sesion.calleeUsername,
        nombre: sesion.calleeName
      }
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al iniciar la llamada', error: error.message });
  }
};

const obtenerLlamadaPendiente = async (req, res) => {
  try {
    const { username, chatId } = req.query;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username es obligatorio' });
    }

    const sesion = servicioLlamadas.obtenerLlamadaPendiente({ username, peerId: chatId });

    if (!sesion) {
      return res.status(200).json(null);
    }

    return res.status(200).json({
      id: sesion.id,
      status: sesion.status,
      type: sesion.type,
      callerId: sesion.callerId,
      callerUsername: sesion.callerUsername,
      callerName: sesion.callerName,
      offer: sesion.offer
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al consultar la llamada pendiente', error: error.message });
  }
};

const obtenerEstadoLlamada = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, candidateOffset = 0 } = req.query;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username es obligatorio' });
    }

    const sesion = servicioLlamadas.obtenerSesion(id);

    if (!sesion) {
      return res.status(404).json({ mensaje: 'La llamada no existe o ya expiró' });
    }

    const esCaller = sesion.callerUsername === username;
    const esCallee = sesion.calleeUsername === username;

    if (!esCaller && !esCallee) {
      return res.status(403).json({ mensaje: 'No perteneces a esta llamada' });
    }

    const offset = Number(candidateOffset) || 0;
    const candidatosRemotos = esCaller ? sesion.calleeCandidates : sesion.callerCandidates;

    return res.status(200).json({
      id: sesion.id,
      status: sesion.status,
      type: sesion.type,
      answer: esCaller ? sesion.answer : null,
      offer: esCallee ? sesion.offer : null,
      remoteCandidates: candidatosRemotos.slice(offset),
      remoteCandidateCount: candidatosRemotos.length
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al consultar el estado de la llamada', error: error.message });
  }
};

const responderLlamada = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, answer, status = 'active' } = req.body;

    const sesion = servicioLlamadas.obtenerSesion(id);

    if (!sesion) {
      return res.status(404).json({ mensaje: 'La llamada no existe o ya expiró' });
    }

    if (sesion.calleeUsername !== username) {
      return res.status(403).json({ mensaje: 'Solo el receptor puede responder esta llamada' });
    }

    const siguienteEstado = status === 'rejected' ? 'rejected' : 'active';
    const sesionActualizada = servicioLlamadas.actualizarSesion(id, {
      answer: siguienteEstado === 'active' ? answer : null,
      status: siguienteEstado
    });

    servicioSocketChat.emitirALlamada(sesionActualizada.callerUsername, sesionActualizada.calleeUsername, 'llamada:actualizada', {
      id: sesionActualizada.id,
      status: sesionActualizada.status,
      type: sesionActualizada.type,
      answer: sesionActualizada.answer,
      actorUsername: username
    });

    return res.status(200).json({
      id: sesionActualizada.id,
      status: sesionActualizada.status,
      type: sesionActualizada.type
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al responder la llamada', error: error.message });
  }
};

const agregarIceCandidateLlamada = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, candidate } = req.body;

    if (!username || !candidate) {
      return res.status(400).json({ mensaje: 'Faltan datos del candidato ICE' });
    }

    const sesion = servicioLlamadas.obtenerSesion(id);

    if (!sesion) {
      return res.status(404).json({ mensaje: 'La llamada no existe o ya expiró' });
    }

    const role = sesion.callerUsername === username ? 'caller' : sesion.calleeUsername === username ? 'callee' : null;

    if (!role) {
      return res.status(403).json({ mensaje: 'No perteneces a esta llamada' });
    }

    servicioLlamadas.agregarCandidate(id, role, candidate);
    const sesionActual = servicioLlamadas.obtenerSesion(id);

    servicioSocketChat.emitirAUsuario(role === 'caller' ? sesionActual.calleeUsername : sesionActual.callerUsername, 'llamada:candidato-ice', {
      id: sesionActual.id,
      candidate,
      from: username
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al agregar candidato ICE', error: error.message });
  }
};

const finalizarLlamada = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, status = 'ended' } = req.body;

    const sesion = servicioLlamadas.obtenerSesion(id);

    if (!sesion) {
      return res.status(404).json({ mensaje: 'La llamada no existe o ya expiró' });
    }

    if (sesion.callerUsername !== username && sesion.calleeUsername !== username) {
      return res.status(403).json({ mensaje: 'No perteneces a esta llamada' });
    }

    const sesionActualizada = servicioLlamadas.actualizarSesion(id, {
      status: ['rejected', 'missed'].includes(status) ? status : 'ended'
    });

    servicioSocketChat.emitirALlamada(sesionActualizada.callerUsername, sesionActualizada.calleeUsername, 'llamada:finalizada', {
      id: sesionActualizada.id,
      status: sesionActualizada.status,
      actorUsername: username
    });

    return res.status(200).json({ id: sesionActualizada.id, status: sesionActualizada.status });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al finalizar la llamada', error: error.message });
  }
};

module.exports = {
  obtenerListaChats,
  obtenerMensajesDeChat,
  enviarMensaje,
  buscarUsuariosChat,
  iniciarLlamada,
  obtenerLlamadaPendiente,
  obtenerEstadoLlamada,
  responderLlamada,
  agregarIceCandidateLlamada,
  finalizarLlamada
};