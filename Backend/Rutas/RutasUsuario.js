
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');


const controladorUsuario = require('../controladores/ControladorUsuario');

// Obtener todos los archivos públicos de perfil de todos los usuarios
router.get('/archivos-perfil-publicos', controladorUsuario.obtenerArchivosPerfilPublicos);
/**
 * RUTAS DE USUARIO
 * Define las direcciones para perfiles y autenticación.
 */

// Configuración de multer para guardar archivos en /uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../uploads'));
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
	}
});
const upload = multer({ storage });

// Obtener perfil -> GET /api/usuario/perfil/:username
router.get('/perfil/:username', controladorUsuario.obtenerPerfil);

// Registrar usuario -> POST /api/usuario/registro
router.post('/registro', controladorUsuario.registrarUsuario);

// Iniciar sesión -> POST /api/usuario/login
router.post('/login', controladorUsuario.iniciarSesion);

// Actualizar perfil -> PUT /api/usuario/actualizar/:id
router.put('/actualizar/:id', controladorUsuario.actualizarPerfil);


// Subir archivo multimedia de perfil (imagen o video)
router.post('/subir-archivo-perfil/:id', upload.single('archivo'), controladorUsuario.subirArchivoPerfil);

// Eliminar archivo multimedia de perfil
router.delete('/archivo-perfil/:id', controladorUsuario.eliminarArchivoPerfil);

module.exports = router;