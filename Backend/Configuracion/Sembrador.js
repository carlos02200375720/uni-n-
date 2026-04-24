/**
 * SEMBRADOR DE DATOS (SEEDER)
 * Propósito: Inyectar datos de prueba para que la App no esté vacía.
 * Tablas afectadas: Usuarios, Productos, Publicaciones.
 */

const { Usuario, Producto, Publicacion } = require('./ArquitecturaBaseDeDatos');
const mongoose = require('mongoose');
const productosMockTienda = require('./ProductosMockTienda');



const ejecutarSembrador = async () => {
    try {


        // --- AQUÍ VA EL BLOQUE DE ESPERA ---
        while (mongoose.connection.readyState !== 1) { 
            console.log("⏳ Esperando que la base de datos esté lista...");
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }


        // 1. LIMPIEZA TOTAL
        // Esto garantiza que cada vez que pruebes, la base de datos esté limpia.
        await Usuario.deleteMany({});
        await Producto.deleteMany({});
        await Publicacion.deleteMany({});

        console.log("🧹 Limpiando estantes... (Base de datos vaciada)");

        // 2. CREANDO USUARIOS DE PRUEBA
        const usuarios = await Usuario.create([
            {
                username: "cristian_dev",
                email: "cristian@tienda.com",
                password: "123",
                nombreCompleto: "Cristian Rodríguez",
                intereses: ["tecnologia", "móviles"],
                biografia: "Desarrollador Fullstack & Emprendedor. Siempre aprendiendo."
            },
            {
                username: "ana_tech",
                email: "ana@tienda.com",
                password: "123",
                nombreCompleto: "Ana García",
                intereses: ["audio", "gadgets"],
                biografia: "Entusiasta de la tecnología y el sonido."
            }
        ]);

        // 3. CREANDO PRODUCTOS DE PRUEBA
        await Producto.create(
            productosMockTienda.map((producto) => ({
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                precioOriginal: producto.precioOriginal,
                descuento: producto.descuento,
                oferta: producto.oferta,
                likesCount: producto.likesCount,
                comentariosCount: producto.comentariosCount,
                usuariosQueDieronMeGusta: [],
                comentarios: [],
                categoria: producto.categoria,
                stock: producto.stock,
                etiquetas: producto.etiquetas,
                imagenes: producto.imagenes || [producto.imagen]
            }))
        );

        // 4. CREANDO PUBLICACIONES (Videos/Fotos)
        await Publicacion.create([
            {
                autor: usuarios[0]._id, // Asignado a Cristian
                urlContenido: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                descripcion: "¡Unboxing del nuevo iPad Pro! 😍 #apple #tech",
                hashtags: ["unboxing", "apple", "m4"]
            }
        ]);

        console.log("=========================================");
        console.log("✅ ÉXITO: Estantes llenos con datos de prueba");
        console.log("=========================================");

    } catch (error) {
        console.error("❌ ERROR EN EL SEMBRADOR:", error);
    }
};

module.exports = ejecutarSembrador;