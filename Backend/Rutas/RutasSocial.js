/**
 * RUTAS SOCIAL
 * Define las direcciones para el feed de videos e interacciones.
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

const controladorSocial = require('../controladores/ControladorSocial');

// Obtener el feed de videos -> GET /api/social/feed
router.get('/feed', controladorSocial.obtenerFeed);

// Dar o quitar like -> POST /api/social/like
router.post('/like', controladorSocial.gestionarLike);

// Dar o quitar dislike -> POST /api/social/dislike
router.post('/dislike', controladorSocial.gestionarDislike);

// Subir nuevo contenido -> POST /api/social/subir
router.post('/subir', upload.single('archivo'), controladorSocial.subirPublicacion);

// Eliminar publicación -> DELETE /api/social/:id
router.delete('/:id', controladorSocial.eliminarPublicacion);

// Agregar comentario -> POST /api/social/:id/comentarios
router.post('/:id/comentarios', controladorSocial.agregarComentario);

module.exports = router;