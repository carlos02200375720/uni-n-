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

// Obtener todos los productos -> GET /api/tienda/productos
router.get('/productos', controladorTienda.obtenerProductos);

// Obtener un solo producto -> GET /api/tienda/productos/:id
router.get('/productos/:id', controladorTienda.obtenerProductoPorId);

// Procesar un pago -> POST /api/tienda/pago
router.post('/pago', controladorTienda.procesarPago);

module.exports = router;