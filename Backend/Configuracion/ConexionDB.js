const mongoose = require('mongoose');

let servidorMongoEnMemoria = null;

const conectarMongoEnMemoria = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');

  servidorMongoEnMemoria = await MongoMemoryServer.create({
    instance: { ip: '127.0.0.1' }
  });

  const uriEnMemoria = servidorMongoEnMemoria.getUri();
  const conn = await mongoose.connect(uriEnMemoria, {
    family: 4
  });

  console.warn('⚠️ Atlas no estuvo disponible. Se inició MongoDB en memoria para desarrollo.');

  return {
    conn,
    usaMongoEnMemoria: true
  };
};

const conectarBaseDeDatos = async () => {
  try {
    console.log("⏳ Intentando conectar con la base de datos real...");

    if (!process.env.MONGODB_URI) {
      throw new Error('La variable MONGODB_URI no está definida en el archivo .env');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    console.log("==================================================");
    console.log(`✅ BASE DE DATOS CONECTADA: ${conn.connection.host}`);
    console.log("==================================================");

    return {
      conn,
      usaMongoEnMemoria: false
    };
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN REAL:");
    console.error(error.message);

    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    return conectarMongoEnMemoria();
  }
};

process.on('exit', async () => {
  if (servidorMongoEnMemoria) {
    await servidorMongoEnMemoria.stop();
  }
});

module.exports = conectarBaseDeDatos;