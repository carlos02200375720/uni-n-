/**
 * RUTAS SOCIAL
 * Define las direcciones para el feed de videos e interacciones.
 */
const express = require('express');
const router = express.Router();

const controladorSocial = require('../controladores/ControladorSocial');

// Obtener el feed de videos -> GET /api/social/feed
router.get('/feed', controladorSocial.obtenerFeed);

// Dar o quitar like -> POST /api/social/like
router.post('/like', controladorSocial.gestionarLike);

// Subir nuevo contenido -> POST /api/social/subir
router.post('/subir', controladorSocial.subirPublicacion);

module.exports = router;