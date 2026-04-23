/**
 * SERVER.JS - INTEGRACIÓN TOTAL
 * Este es el punto de entrada que une controladores, rutas, 
 * modelos, seguridad y configuración.
 */

const express = require('express');
const cors = require('cors');

// 1. IMPORTAR CONFIGURACIÓN DE BASE DE DATOS
const conectarDB = require('./config/ConexionDB');

// 2. IMPORTAR LAS RUTAS
const rutasTienda = require('./rutas/RutasTienda');
const rutasChat = require('./rutas/RutasChat');
const rutasSocial = require('./rutas/RutasSocial');
const rutasUsuario = require('./rutas/RutasUsuario');

const app = express();

// 3. CONECTAR A LA BASE DE DATOS
// Llamamos a la función que creamos en la carpeta 'config'
conectarDB();

// 4. AUTENTICACIÓN GLOBALES
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Permitir que el servidor entienda JSON

// 5. DEFINICIÓN DE RUTAS (ENDPOINTS)
// Conectamos cada prefijo de URL con su archivo de rutas correspondiente
app.use('/api/tienda', rutasTienda);
app.use('/api/chat', rutasChat);
app.use('/api/social', rutasSocial);
app.use('/api/usuario', rutasUsuario);

// 6. RUTA DE PRUEBA INICIAL
app.get('/', (req, res) => {
    res.send('🚀 Servidor de Red Social y Tienda funcionando correctamente');
});

// 7. INICIAR EL SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`✅ SISTEMA INTEGRADO Y LISTO`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🔒 Seguridad activa en carpeta: seguridad_y_filtros`);
    console.log(`================================================`);
});