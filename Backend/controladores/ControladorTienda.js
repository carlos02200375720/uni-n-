/**
 * CONTROLADOR DE TIENDA
 * Maneja toda la lógica de los productos, desde el listado hasta la validación de pagos.
 */

const productosMockTienda = require('../configuracion/ProductosMockTienda');
const { Pedido, Producto } = require('../configuracion/ArquitecturaBaseDeDatos');
const mongoose = require('mongoose');

// Datos simulados (Base de datos temporal)
let inventario = [...productosMockTienda];

const imagenPorDefecto = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
const categoriasPermitidas = ['Móviles', 'Audio', 'Laptops', 'Relojes', 'Accesorios', 'Calzado'];

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
    zapatos: 'Calzado'
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
    const payload = construirPayloadProducto(req.body);

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

    res.status(201).json({
      mensaje: 'Producto creado con éxito',
      producto: serializarProducto(productoCreado)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el producto', error: error.message });
  }
};

// Obtener la lista de productos
const obtenerProductos = async (req, res) => {
  try {
    const { categoria, username } = req.query;
    const productos = await obtenerProductosDesdeBaseDeDatos(categoria);
    res.status(200).json(productos.map((producto) => serializarProducto(producto, username)));
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
      items.forEach((item) => {
        const producto = inventario.find((prod) => String(prod.id) === String(item.id));
        if (producto) {
          const cantidad = Number(item.cantidad ?? 1) || 1;
          totalCalculado += producto.precio * cantidad;
          itemsNormalizados.push({
            productoId: String(producto.id),
            nombre: producto.nombre,
            precio: producto.precio,
            talla: String(item.tallaSeleccionada || item.talla || '').trim(),
            color: String(item.colorSeleccionado || item.color || '').trim(),
            cantidad
          });
        }
      });
    }

    const pedido = await Pedido.create({
      username: String(username || '').trim(),
      items: itemsNormalizados,
      cliente: {
        nombre: String(cliente.nombre || '').trim(),
        pais: String(cliente.pais || '').trim(),
        correo: String(cliente.correo || '').trim(),
        celular: String(cliente.celular || '').trim(),
        direccion: String(cliente.direccion || '').trim(),
        ciudad: String(cliente.ciudad || '').trim(),
        zip: String(cliente.zip || '').trim(),
        comentarioPedido: String(cliente.comentarioPedido || '').trim()
      },
      total: totalCalculado,
      estado: 'pagado'
    });

    res.status(200).json({
      mensaje: "Pago procesado con éxito",
      idOrden: pedido._id.toString(),
      total: totalCalculado,
      pedido
    });
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
  procesarPago
};