/**
 * SERVER.JS - INTEGRACIÓN TOTAL
 * Este es el punto de entrada que une controladores, rutas,
 * modelos, seguridad y configuración.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// 1. IMPORTAR CONFIGURACIÓN DE BASE DE DATOS
const conectarDB = require('./configuracion/ConexionDB');
const Arquitectura = require('./configuracion/ArquitecturaBaseDeDatos');

// 2. IMPORTAR EL SEMBRADOR DE DATOS de pruevas
const ejecutarSembrador = require('./configuracion/Sembrador');

// 2. IMPORTAR LAS RUTAS
const rutasTienda = require('./rutas/RutasTienda');
const rutasChat = require('./rutas/RutasChat');
const rutasSocial = require('./rutas/RutasSocial');
const rutasUsuario = require('./rutas/RutasUsuario');

const app = express();

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

// 7. INICIAR EL SERVIDOR SOLO CUANDO LA BASE ESTÉ DISPONIBLE
const PORT = process.env.PORT || 5000;

const debeSembrarDatos = (usaMongoEnMemoria) => {
    if (process.env.SEMBRAR_DATOS_PRUEBA === 'true') {
        return true;
    }

    if (process.env.SEMBRAR_DATOS_PRUEBA === 'false') {
        return false;
    }

    return usaMongoEnMemoria;
};

const iniciarServidor = async () => {
    try {
        const { usaMongoEnMemoria } = await conectarDB();
        console.log("🛢️ Conexión establecida...");

        if (debeSembrarDatos(usaMongoEnMemoria)) {
            await ejecutarSembrador();
        } else {
            console.log('🗃️ Sembrador omitido. Se conservan los productos existentes en la base conectada.');
        }

        app.listen(PORT, () => {
            console.log(`================================================`);
            console.log(`✅ SISTEMA INTEGRADO Y LISTO`);
            console.log(`📡 Puerto: ${PORT}`);
            console.log(`🔒 Seguridad activa en carpeta: seguridad_y_filtros`);
            console.log(`================================================`);
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor por un fallo de base de datos.');
        console.error(error.message);
        process.exit(1);
    }
};

iniciarServidor();