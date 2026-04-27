/**
 * Devuelve todos los archivos públicos de productos (imágenes y videos)
 */
const obtenerArchivosProductosPublicos = async (req, res) => {
  try {
    const productos = await Producto.find({}, { nombre: 1, imagenes: 1, video: 1, descripcion: 1 }).lean();
    // Unir todas las imágenes y videos con referencia al producto e incluir el _id
    const archivos = productos.flatMap(p => {
      const arr = [];
      if (Array.isArray(p.imagenes)) {
        arr.push(...p.imagenes.filter(Boolean).map(url => ({ url, tipo: 'imagen', producto: p.nombre, descripcion: p.descripcion, id: p._id?.toString() })));
      }
      if (typeof p.video === 'string' && p.video.trim()) {
        arr.push({ url: p.video, tipo: 'video', producto: p.nombre, descripcion: p.descripcion, id: p._id?.toString() });
      }
      return arr;
    });
    res.status(200).json({ archivos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener archivos de productos', error: error.message });
  }
};
// Eliminar un producto
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndDelete(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el producto', error: error.message });
  }
};
/**
 * CONTROLADOR DE TIENDA
 * Maneja toda la lógica de los productos, desde el listado hasta la validación de pagos.
 */

// Eliminado productosMockTienda: ahora solo datos reales
const { Pedido, Producto } = require('../configuracion/ArquitecturaBaseDeDatos');
const mongoose = require('mongoose');
const { subirImagenACloudinary, subirVideoACloudinary } = require('../servicios/ServicioCloudinary');

// Datos simulados (Base de datos temporal)
// Eliminado inventario simulado: solo base de datos

const imagenPorDefecto = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
const categoriasPermitidas = ['Móviles', 'Audio', 'Laptops', 'Relojes', 'Accesorios', 'Calzado', 'Ropa', 'Hogar'];

const normalizarCategoriaProducto = (categoria = '') => {
  const categoriaLimpia = String(categoria)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const mapaCategorias = {
    moviles: 'Móviles',
    movilesytablets: 'Móviles',
    audio: 'Audio',
    laptops: 'Laptops',
    laptop: 'Laptops',
    relojes: 'Relojes',
    reloj: 'Relojes',
    accesorios: 'Accesorios',
    accesorio: 'Accesorios',
    calzado: 'Calzado',
    tenis: 'Calzado',
    zapato: 'Calzado',
    zapatos: 'Calzado',
    ropa: 'Ropa',
    hogar: 'Hogar'
  };

  return mapaCategorias[categoriaLimpia] || String(categoria || '').trim();
};

const normalizarImagenesProducto = (producto) => {
  const imagenes = Array.isArray(producto.imagenes)
    ? producto.imagenes.filter((imagen) => typeof imagen === 'string' && imagen.trim())
    : [];

  if (imagenes.length > 0) {
    return imagenes;
  }

  if (typeof producto.imagen === 'string' && producto.imagen.trim()) {
    return [producto.imagen];
  }

  return [imagenPorDefecto];
};

const serializarProducto = (producto, username = '') => {
  const usuariosQueDieronMeGusta = producto.usuariosQueDieronMeGusta || [];
  const comentarios = producto.comentarios || [];
  const imagenes = normalizarImagenesProducto(producto);
  const precio = Number(producto.precio ?? 0);
  const precioOriginal = Number(producto.precioOriginal ?? precio) || precio;
  const descuentoCalculado = Number(producto.descuento ?? 0) || (precioOriginal > precio && precioOriginal > 0
    ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
    : 0);

  return {
    id: producto._id ? producto._id.toString() : String(producto.id),
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    desc: producto.descripcion,
    precio,
    precioOriginal,
    descuento: descuentoCalculado,
    oferta: Boolean(producto.oferta || descuentoCalculado > 0 || precioOriginal > precio),
    likesCount: producto.likesCount ?? usuariosQueDieronMeGusta.length,
    comentariosCount: producto.comentariosCount ?? comentarios.length,
    usuarioLeDioLike: username ? usuariosQueDieronMeGusta.includes(username) : false,
    categoria: producto.categoria,
    stock: producto.stock,
    imagen: imagenes[0],
    imagenes,
    tallas: Array.isArray(producto.tallas) ? producto.tallas : [],
    colores: Array.isArray(producto.colores) ? producto.colores : [],
    comentarios: comentarios.map((comentario) => ({
      usuario: comentario.usuario,
      texto: comentario.texto,
      fecha: comentario.fecha
    }))
  };
};

const obtenerProductosDesdeBaseDeDatos = async (categoria) => {
  const filtro = categoria ? { categoria } : {};
  const productos = await Producto.find(filtro).lean();

  if (productos.length === 0) {
    return categoria
      ? inventario.filter((producto) => producto.categoria.toLowerCase() === categoria.toLowerCase())
      : inventario;
  }

  return productos;
};

const buscarProductoPorId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const producto = await Producto.findById(id);
    if (producto) {
      return producto;
    }
  }

  return inventario.find((producto) => String(producto.id) === String(id)) || null;
};

const construirPayloadProducto = (datosProducto = {}) => {
  const imagenes = normalizarImagenesProducto(datosProducto);
  const precio = Number(datosProducto.precio ?? 0);
  const precioOriginal = Number(datosProducto.precioOriginal ?? precio) || precio;
  const descuento = Number(datosProducto.descuento ?? 0) || (precioOriginal > precio && precioOriginal > 0
    ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
    : 0);

  return {
    nombre: String(datosProducto.nombre || '').trim(),
    descripcion: String(datosProducto.descripcion || '').trim(),
    precio,
    precioOriginal,
    descuento,
    oferta: Boolean(datosProducto.oferta || descuento > 0 || precioOriginal > precio),
    categoria: normalizarCategoriaProducto(datosProducto.categoria),
    stock: Number(datosProducto.stock ?? 0),
    etiquetas: Array.isArray(datosProducto.etiquetas)
      ? datosProducto.etiquetas.filter((etiqueta) => typeof etiqueta === 'string' && etiqueta.trim())
      : [],
    imagenes,
    tallas: Array.isArray(datosProducto.tallas)
      ? datosProducto.tallas.filter((talla) => typeof talla === 'string' && talla.trim())
      : [],
    colores: Array.isArray(datosProducto.colores)
      ? datosProducto.colores.filter((color) => typeof color === 'string' && color.trim())
      : [],
    likesCount: Number(datosProducto.likesCount ?? 0),
    comentariosCount: Number(datosProducto.comentariosCount ?? 0),
    usuariosQueDieronMeGusta: Array.isArray(datosProducto.usuariosQueDieronMeGusta)
      ? datosProducto.usuariosQueDieronMeGusta.filter((username) => typeof username === 'string' && username.trim())
      : [],
    comentarios: Array.isArray(datosProducto.comentarios)
      ? datosProducto.comentarios
          .filter((comentario) => comentario && typeof comentario.texto === 'string' && comentario.texto.trim())
          .map((comentario) => ({
            usuario: String(comentario.usuario || 'anonimo').trim(),
            texto: comentario.texto.trim(),
            fecha: comentario.fecha || new Date()
          }))
      : []
  };
};

// --- FUNCIONES DEL CONTROLADOR ---

const crearProducto = async (req, res) => {

  try {
    // Si hay archivos subidos, agregarlos al array de imágenes
    let imagenes = [];
    if (req.files && req.files.length > 0) {
      imagenes = req.files.map(file => '/uploads/' + file.filename);
    }
    // Mezclar imágenes subidas con las que vengan por body (por si acaso)
    let payload = construirPayloadProducto(req.body);
    if (imagenes.length > 0) {
      payload.imagenes = imagenes;
    }

    console.log('[CREAR PRODUCTO] Payload a guardar:', payload);

    if (!payload.nombre || !payload.descripcion || !payload.categoria || payload.precio <= 0) {
      return res.status(400).json({
        mensaje: 'nombre, descripcion, categoria y precio mayor que 0 son obligatorios'
      });
    }

    if (!categoriasPermitidas.includes(payload.categoria)) {
      return res.status(400).json({
        mensaje: `categoria invalida. Usa una de estas: ${categoriasPermitidas.join(', ')}`
      });
    }

    const productoCreado = await Producto.create(payload);

    console.log('[CREAR PRODUCTO] Producto guardado:', productoCreado);

    res.status(201).json({
      mensaje: 'Producto creado con éxito',
      producto: serializarProducto(productoCreado)
    });
  } catch (error) {
    console.error('[CREAR PRODUCTO] Error:', error);
    res.status(500).json({ mensaje: 'Error al crear el producto', error: error.message });
  }
};

// Obtener la lista de productos
const obtenerProductos = async (req, res) => {
  try {
    console.log('[OBTENER PRODUCTOS] Query:', req.query);
    const { categoria, nombre, username } = req.query;
    // Filtro dinámico solo para GET productos
    let filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (nombre) filtro.nombre = { $regex: nombre, $options: 'i' };
    // Buscar productos en la base de datos
    const productos = await Producto.find(filtro).lean();
    // Serializar productos (si hay username, marcar likes; si no, igual mostrar)
    const serializados = productos.map((producto) => serializarProducto(producto, username || ''));
    console.log('[OBTENER PRODUCTOS] Productos serializados:', serializados.map(p => ({ id: p.id, imagenes: p.imagenes })));
    res.status(200).json(serializados);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cargar productos", error: error.message });
  }
};

// Obtener un producto por ID
const obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;
  const { username } = req.query;
  const producto = await buscarProductoPorId(id);

  if (!producto) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  res.status(200).json(serializarProducto(producto, username));
};

const obtenerProductosConMeGustaDeUsuario = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username es obligatorio' });
    }

    const productos = await Producto.find({ usuariosQueDieronMeGusta: username }).lean();
    res.status(200).json(productos.map((producto) => serializarProducto(producto, username)));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar me gusta del usuario', error: error.message });
  }
};

const gestionarLikeProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username es obligatorio para registrar el me gusta' });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const indice = producto.usuariosQueDieronMeGusta.indexOf(username);
    let usuarioLeDioLike = false;

    if (indice >= 0) {
      producto.usuariosQueDieronMeGusta.splice(indice, 1);
    } else {
      producto.usuariosQueDieronMeGusta.push(username);
      usuarioLeDioLike = true;
    }

    producto.likesCount = producto.usuariosQueDieronMeGusta.length;
    await producto.save();

    res.status(200).json({
      mensaje: 'Estado de me gusta actualizado',
      usuarioLeDioLike,
      producto: serializarProducto(producto, username)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el me gusta', error: error.message });
  }
};

const agregarComentarioProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, texto } = req.body;

    if (!username || !texto || !texto.trim()) {
      return res.status(400).json({ mensaje: 'El username y el comentario son obligatorios' });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const comentario = {
      usuario: username,
      texto: texto.trim(),
      fecha: new Date()
    };

    producto.comentarios.push(comentario);
    producto.comentariosCount = producto.comentarios.length;
    await producto.save();

    res.status(201).json({
      mensaje: 'Comentario agregado con éxito',
      comentario,
      producto: serializarProducto(producto, username)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el comentario', error: error.message });
  }
};

// Validar y procesar la compra
const procesarPago = async (req, res) => {
  const { items, cliente = {}, username = '' } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ mensaje: "El carrito está vacío" });
  }

  const camposClienteObligatorios = ['nombre', 'pais', 'correo', 'celular', 'direccion', 'ciudad', 'zip'];
  const faltaCampoCliente = camposClienteObligatorios.find((campo) => !String(cliente[campo] || '').trim());

  if (faltaCampoCliente) {
    return res.status(400).json({ mensaje: `El campo ${faltaCampoCliente} es obligatorio` });
  }

  try {
    const ids = items.map((item) => item.id).filter(Boolean);
    const idsValidos = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    let totalCalculado = 0;
    let itemsNormalizados = [];

    if (idsValidos.length > 0) {
      const productos = await Producto.find({ _id: { $in: idsValidos } }).lean();
      const mapaProductos = new Map(productos.map((producto) => [producto._id.toString(), producto]));

      itemsNormalizados = items.map((item) => {
        const producto = mapaProductos.get(String(item.id));
        if (!producto) {
          return null;
        }

        const cantidad = Number(item.cantidad ?? 1) || 1;
        const subtotalItem = producto.precio * cantidad;
        totalCalculado += subtotalItem;

        return {
          productoId: producto._id.toString(),
          nombre: producto.nombre,
          precio: producto.precio,
          talla: String(item.tallaSeleccionada || item.talla || '').trim(),
          color: String(item.colorSeleccionado || item.color || '').trim(),
          cantidad
        };
      }).filter(Boolean);
    } else {
      await Promise.all(items.map(async (item) => {
        const producto = inventario.find((prod) => String(prod.id) === String(item.id));
        try {
          // Procesar variantes con imagen de color
          let coloresConImagen = [];
          if (req.body.variantes) {
            let variantes = req.body.variantes;
            if (typeof variantes === 'string') {
              try { variantes = JSON.parse(variantes); } catch { variantes = []; }
            }
            // Buscar archivos de imagen de color en req.files
            if (Array.isArray(variantes) && req.files && req.files.length > 0) {
              // Mapear variantes con su archivo correspondiente
              for (let i = 0; i < variantes.length; i++) {
                const variante = variantes[i];
                if (variante && variante.color && variante.imagen) {
                  // Buscar el archivo por nombre
                  const file = req.files.find(f => f.originalname === variante.imagen || f.fieldname === `variante_imagen_${i}`);
                  if (file) {
                    // Subir a Cloudinary
                    const resultado = await subirImagenACloudinary(file.path, 'productos/colores');
                    coloresConImagen.push({ color: variante.color, imagen: resultado.secure_url });
                  }
                }
              }
            }
          }

          // Procesar imágenes y videos generales
          let imagenes = [];
          let videos = [];
          if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
              req.files.map(async (file) => {
                const ext = (file.originalname || '').split('.').pop().toLowerCase();
                try {
                  if (["mp4","mov","avi","wmv","flv","mkv","webm"].includes(ext)) {
                    const resultado = await subirVideoACloudinary(file.path, 'productos/videos');
                    return { tipo: 'video', url: resultado.secure_url };
                  } else {
                    const resultado = await subirImagenACloudinary(file.path, 'productos/imagenes');
                    return { tipo: 'imagen', url: resultado.secure_url };
                  }
                } catch (err) {
                  console.error('Error subiendo a Cloudinary:', err);
                  return null;
                }
              })
            );
            imagenes = uploads.filter(f => f && f.tipo === 'imagen').map(f => f.url);
            videos = uploads.filter(f => f && f.tipo === 'video').map(f => f.url);
          }

          // Mezclar imágenes subidas con las que vengan por body (por si acaso)
          let payload = construirPayloadProducto(req.body);
          if (imagenes.length > 0) {
            payload.imagenes = imagenes;
          }
          if (videos.length > 0) {
            payload.videos = videos;
          }
          if (coloresConImagen.length > 0) {
            payload.coloresConImagen = coloresConImagen;
          }

          console.log('[CREAR PRODUCTO] Payload a guardar:', payload);

          if (!payload.nombre || !payload.descripcion || !payload.categoria || payload.precio <= 0) {
            return res.status(400).json({
              mensaje: 'nombre, descripcion, categoria y precio mayor que 0 son obligatorios'
            });
          }
          if (!categoriasPermitidas.includes(payload.categoria)) {
            return res.status(400).json({
              mensaje: `categoria invalida. Usa una de estas: ${categoriasPermitidas.join(', ')}`
            });
          }

          const productoCreado = await Producto.create(payload);

          console.log('[CREAR PRODUCTO] Producto guardado:', productoCreado);

          res.status(201).json({
            mensaje: 'Producto creado con éxito',
            producto: serializarProducto(productoCreado)
          });
        } catch (error) {
          console.error('[CREAR PRODUCTO] Error:', error);
          res.status(500).json({ mensaje: 'Error al crear el producto', error: error.message });
        }

      }));
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar el pago', error: error.message });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  obtenerProductosConMeGustaDeUsuario,
  gestionarLikeProducto,
  agregarComentarioProducto,
  procesarPago,
  eliminarProducto,
  obtenerArchivosProductosPublicos
};