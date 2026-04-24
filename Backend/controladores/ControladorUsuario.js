/**
 * CONTROLADOR DE USUARIO
 * Gestiona la autenticación, los datos del perfil personal
 * y la configuración de la cuenta.
 */

const mongoose = require('mongoose');
const { Pedido, Producto, Publicacion, Usuario } = require('../configuracion/ArquitecturaBaseDeDatos');

const fotoPerfilPorDefecto = 'https://via.placeholder.com/150';

const serializarPublicacionPerfil = (publicacion) => ({
  id: publicacion._id.toString(),
  tipoContenido: publicacion.tipo || 'imagen',
  mediaUrl: publicacion.urlContenido,
  portada: publicacion.urlContenido,
  descripcion: publicacion.descripcion || '',
  likes: Array.isArray(publicacion.likes) ? publicacion.likes.length : 0,
  comentarios: Number(publicacion.comentariosCount || 0)
});

const serializarPedidoPerfil = (pedido) => ({
  id: pedido._id.toString(),
  fecha: pedido.createdAt,
  estado: pedido.estado,
  total: Number(pedido.total || 0),
  itemsCount: Array.isArray(pedido.items) ? pedido.items.length : 0,
  primerProducto: pedido.items?.[0]?.nombre || 'Pedido',
  resumenItems: Array.isArray(pedido.items) ? pedido.items.slice(0, 2).map((item) => item.nombre) : []
});

// --- FUNCIONES DEL CONTROLADOR ---

/**
 * Obtiene la información del perfil de un usuario por su ID o nombre de usuario
 */
const obtenerPerfil = async (req, res) => {
  try {
    const { username } = req.params;
    const usuario = await Usuario.findOne({ username }).lean();

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const filtroPedidos = {
      $or: [
        { username },
        { 'cliente.correo': usuario.email }
      ]
    };

    const [publicacionesRecientes, publicacionesCount, pedidosRecientes, totalCompras, totalGuardados] = await Promise.all([
      Publicacion.find({ autor: usuario._id }).sort({ createdAt: -1 }).limit(9).lean(),
      Publicacion.countDocuments({ autor: usuario._id }),
      Pedido.find(filtroPedidos).sort({ createdAt: -1 }).limit(5).lean(),
      Pedido.countDocuments(filtroPedidos),
      Producto.countDocuments({ usuariosQueDieronMeGusta: username })
    ]);

    const likesTotales = publicacionesRecientes.reduce((acumulado, publicacion) => {
      return acumulado + (Array.isArray(publicacion.likes) ? publicacion.likes.length : 0);
    }, 0);

    res.status(200).json({
      id: usuario._id.toString(),
      username: usuario.username,
      nombre: usuario.nombreCompleto,
      bio: usuario.biografia,
      foto: usuario.fotoPerfil || fotoPerfilPorDefecto,
      seguidores: Array.isArray(usuario.seguidores) ? usuario.seguidores.length : 0,
      siguiendo: Array.isArray(usuario.siguiendo) ? usuario.siguiendo.length : 0,
      likesTotales,
      publicacionesCount,
      totalCompras,
      totalGuardados,
      publicacionesRecientes: publicacionesRecientes.map(serializarPublicacionPerfil),
      pedidosRecientes: pedidosRecientes.map(serializarPedidoPerfil)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar el perfil', error: error.message });
  }
};

/**
 * Procesa el inicio de sesión (Login)
 */
const iniciarSesion = async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });

    if (!usuario || usuario.password !== password) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario._id.toString(),
        username: usuario.username,
        nombre: usuario.nombreCompleto
      },
      token: 'token-simulado-xyz-123'
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

/**
 * Actualiza la información del perfil del usuario
 */
const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, bio, foto } = req.body;

    const filtro = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { username: id };
    const usuario = await Usuario.findOne(filtro);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado para actualizar' });
    }

    usuario.nombreCompleto = String(nombre || usuario.nombreCompleto).trim();
    usuario.biografia = String(bio || usuario.biografia).trim();
    usuario.fotoPerfil = String(foto || usuario.fotoPerfil).trim();

    await usuario.save();

    res.status(200).json({
      mensaje: 'Perfil actualizado con éxito',
      usuario: {
        id: usuario._id.toString(),
        username: usuario.username,
        nombre: usuario.nombreCompleto,
        bio: usuario.biografia,
        foto: usuario.fotoPerfil
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el perfil', error: error.message });
  }
};

module.exports = {
  obtenerPerfil,
  iniciarSesion,
  actualizarPerfil
};