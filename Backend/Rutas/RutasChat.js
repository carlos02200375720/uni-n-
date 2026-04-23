/**
 * RUTAS DE CHAT
 * Define las direcciones para mensajes y conversaciones.
 */
const express = require('express');
const router = express.Router();

const controladorChat = require('../controladores/ControladorChat');

// Obtener lista de conversaciones -> GET /api/chat/lista
router.get('/lista', controladorChat.obtenerListaChats);

// Obtener mensajes de un chat -> GET /api/chat/mensajes/:id
router.get('/mensajes/:id', controladorChat.obtenerMensajesDeChat);

// Enviar un mensaje -> POST /api/chat/enviar
router.post('/enviar', controladorChat.enviarMensaje);

module.exports = router;