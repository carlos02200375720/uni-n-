
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');




// Importamos el controlador correspondiente desde la carpeta de controladores
const controladorTienda = require('../controladores/ControladorTienda');

// Obtener todos los archivos públicos de productos (imágenes y videos)
router.get('/archivos-productos-publicos', controladorTienda.obtenerArchivosProductosPublicos);
/**
 * RUTAS DE TIENDA
 * Define las "puertas" de acceso para los productos y pagos.
 */

// Configuración de multer para guardar imágenes en /uploads
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



// --- DEFINICIÓN DE PUNTOS DE ACCESO (ENDPOINTS) ---

// Crear un producto -> POST /api/tienda/productos
// Soporta subida de múltiples imágenes (campo 'imagenes')
router.post('/productos', upload.array('imagenes', 20), controladorTienda.crearProducto);

// Obtener todos los productos -> GET /api/tienda/productos
router.get('/productos', controladorTienda.obtenerProductos);

// Obtener un solo producto -> GET /api/tienda/productos/:id
router.get('/productos/:id', controladorTienda.obtenerProductoPorId);

// Eliminar un producto -> DELETE /api/tienda/productos/:id
router.delete('/productos/:id', controladorTienda.eliminarProducto);

// Obtener productos con me gusta de un usuario -> GET /api/tienda/usuarios/:username/me-gusta
router.get('/usuarios/:username/me-gusta', controladorTienda.obtenerProductosConMeGustaDeUsuario);

// Dar o quitar me gusta a un producto -> POST /api/tienda/productos/:id/like
router.post('/productos/:id/like', controladorTienda.gestionarLikeProducto);

// Agregar comentario a un producto -> POST /api/tienda/productos/:id/comentarios
router.post('/productos/:id/comentarios', controladorTienda.agregarComentarioProducto);

// Procesar un pago -> POST /api/tienda/pago
router.post('/pago', controladorTienda.procesarPago);

module.exports = router;