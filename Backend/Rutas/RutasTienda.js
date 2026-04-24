/**
 * RUTAS DE TIENDA
 * Define las "puertas" de acceso para los productos y pagos.
 */
const express = require('express');
const router = express.Router();

// Importamos el controlador correspondiente desde la carpeta de controladores
// Nota: Subimos un nivel (..) para entrar en la carpeta controladores
const controladorTienda = require('../controladores/ControladorTienda');

// --- DEFINICIÓN DE PUNTOS DE ACCESO (ENDPOINTS) ---

// Crear un producto -> POST /api/tienda/productos
router.post('/productos', controladorTienda.crearProducto);

// Obtener todos los productos -> GET /api/tienda/productos
router.get('/productos', controladorTienda.obtenerProductos);

// Obtener un solo producto -> GET /api/tienda/productos/:id
router.get('/productos/:id', controladorTienda.obtenerProductoPorId);

// Obtener productos con me gusta de un usuario -> GET /api/tienda/usuarios/:username/me-gusta
router.get('/usuarios/:username/me-gusta', controladorTienda.obtenerProductosConMeGustaDeUsuario);

// Dar o quitar me gusta a un producto -> POST /api/tienda/productos/:id/like
router.post('/productos/:id/like', controladorTienda.gestionarLikeProducto);

// Agregar comentario a un producto -> POST /api/tienda/productos/:id/comentarios
router.post('/productos/:id/comentarios', controladorTienda.agregarComentarioProducto);

// Procesar un pago -> POST /api/tienda/pago
router.post('/pago', controladorTienda.procesarPago);

module.exports = router;