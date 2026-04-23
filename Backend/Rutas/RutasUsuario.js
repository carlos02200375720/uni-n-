/**
 * RUTAS DE USUARIO
 * Define las direcciones para perfiles y autenticación.
 */
const express = require('express');
const router = express.Router();

const controladorUsuario = require('../controladores/ControladorUsuario');

// Obtener perfil -> GET /api/usuario/perfil/:username
router.get('/perfil/:username', controladorUsuario.obtenerPerfil);

// Iniciar sesión -> POST /api/usuario/login
router.post('/login', controladorUsuario.iniciarSesion);

// Actualizar perfil -> PUT /api/usuario/actualizar/:id
router.put('/actualizar/:id', controladorUsuario.actualizarPerfil);

module.exports = router;