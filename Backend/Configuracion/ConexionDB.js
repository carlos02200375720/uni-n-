/**
 * CONFIGURACIÓN DE CONEXIÓN A LA BASE DE DATOS
 * Este archivo establece el puente entre el servidor Node.js 
 * y el motor de la base de datos (como MongoDB o PostgreSQL).
 */

// En un entorno real usaríamos: const mongoose = require('mongoose');

const conectarBaseDeDatos = async () => {
  try {
    console.log("⏳ Intentando conectar con la base de datos...");

    /**
     * LÓGICA DE CONEXIÓN:
     * Aquí es donde se coloca la URL secreta de tu base de datos.
     * Ejemplo: mongodb+srv://usuario:password@cluster.mongodb.net/mi_app
     */
    
    // Simulamos una conexión exitosa con una promesa
    const conexionExitosa = true;

    if (conexionExitosa) {
      console.log("==================================================");
      console.log("✅ BASE DE DATOS CONECTADA: Almacenamiento listo.");
      console.log("==================================================");
    } else {
      throw new Error("La base de datos rechazó la conexión.");
    }

  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN:");
    console.error(error.message);
    
    // Si la base de datos no conecta, el servidor debe detenerse
    process.exit(1); 
  }
};

module.exports = conectarBaseDeDatos;