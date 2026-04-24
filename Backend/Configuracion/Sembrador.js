/**
 * SEMBRADOR DE DATOS (SEEDER)
 * Propósito: Inyectar datos de prueba para que la App no esté vacía.
 * Tablas afectadas: Usuarios, Productos, Publicaciones.
 */

const { Usuario, Producto, Publicacion, Mensaje, Pedido } = require('./ArquitecturaBaseDeDatos');
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
        await Mensaje.deleteMany({});
        await Pedido.deleteMany({});

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

        usuarios[0].siguiendo = [usuarios[1]._id];
        usuarios[1].seguidores = [usuarios[0]._id];
        await Promise.all([usuarios[0].save(), usuarios[1].save()]);

        // 3. CREANDO PRODUCTOS DE PRUEBA
        const productosCreados = await Producto.create(
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
                imagenes: producto.imagenes || [producto.imagen],
                tallas: producto.tallas || [],
                colores: producto.colores || []
            }))
        );

        // 4. CREANDO PUBLICACIONES (Videos/Fotos)
        await Publicacion.create([
            {
                autor: usuarios[0]._id,
                tipo: 'video',
                urlContenido: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                descripcion: "¡Unboxing del nuevo iPad Pro! 😍 #apple #tech",
                hashtags: ["unboxing", "apple", "m4"],
                likes: [usuarios[1]._id],
                comentariosCount: 3
            },
            {
                autor: usuarios[1]._id,
                tipo: 'imagen',
                urlContenido: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900",
                descripcion: "Probando cámara, batería y rendimiento en uso real.",
                hashtags: ["review", "movil", "bateria"]
            }
        ]);

        await Pedido.create({
            username: usuarios[0].username,
            items: [
                {
                    productoId: productosCreados[0]._id.toString(),
                    nombre: productosCreados[0].nombre,
                    precio: productosCreados[0].precio,
                    cantidad: 1
                },
                {
                    productoId: productosCreados[productosCreados.length - 1]._id.toString(),
                    nombre: productosCreados[productosCreados.length - 1].nombre,
                    precio: productosCreados[productosCreados.length - 1].precio,
                    talla: '40',
                    color: 'Negro',
                    cantidad: 1
                }
            ],
            cliente: {
                nombre: 'Cristian Rodríguez',
                pais: 'República Dominicana',
                correo: 'cristian@tienda.com',
                celular: '8095551234',
                direccion: 'Av. Central 123',
                ciudad: 'Santo Domingo',
                zip: '10101',
                comentarioPedido: 'Entregar en horario de la tarde.'
            },
            total: Number(productosCreados[0].precio || 0) + Number(productosCreados[productosCreados.length - 1].precio || 0),
            estado: 'pagado'
        });

        await Mensaje.create([
            {
                emisor: usuarios[1]._id,
                receptor: usuarios[0]._id,
                contenido: '¡El iPhone que compré llegó súper rápido!',
                tipo: 'texto'
            },
            {
                emisor: usuarios[0]._id,
                receptor: usuarios[1]._id,
                contenido: '¡Qué bueno! Si necesitas ayuda con algo más, aquí estoy.',
                tipo: 'texto'
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