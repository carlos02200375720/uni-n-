/**
 * RUTAS DE CHAT
 * Define las direcciones para mensajes y conversaciones.
 */
const express = require('express');
const router = express.Router();

const controladorChat = require('../controladores/ControladorChat');

// Obtener lista de conversaciones -> GET /api/chat/lista
router.get('/lista', controladorChat.obtenerListaChats);

// Buscar usuarios registrados para iniciar conversación -> GET /api/chat/buscar
router.get('/buscar', controladorChat.buscarUsuariosChat);

// Consultar llamada entrante pendiente -> GET /api/chat/llamadas/pendiente
router.get('/llamadas/pendiente', controladorChat.obtenerLlamadaPendiente);

// Consultar el estado de una llamada -> GET /api/chat/llamadas/:id
router.get('/llamadas/:id', controladorChat.obtenerEstadoLlamada);

// Iniciar una llamada -> POST /api/chat/llamadas/iniciar
router.post('/llamadas/iniciar', controladorChat.iniciarLlamada);

// Responder o rechazar una llamada -> POST /api/chat/llamadas/:id/responder
router.post('/llamadas/:id/responder', controladorChat.responderLlamada);

// Agregar candidato ICE -> POST /api/chat/llamadas/:id/candidato
router.post('/llamadas/:id/candidato', controladorChat.agregarIceCandidateLlamada);

// Finalizar una llamada -> POST /api/chat/llamadas/:id/finalizar
router.post('/llamadas/:id/finalizar', controladorChat.finalizarLlamada);

// Obtener mensajes de un chat -> GET /api/chat/mensajes/:id
router.get('/mensajes/:id', controladorChat.obtenerMensajesDeChat);

// Enviar un mensaje -> POST /api/chat/enviar
router.post('/enviar', controladorChat.enviarMensaje);

module.exports = router;