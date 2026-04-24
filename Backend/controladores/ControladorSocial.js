/**
 * CONTROLADOR SOCIAL
 * Gestiona las publicaciones de video, el sistema de likes 
 * y la interacción entre usuarios en el feed.
 */

const mongoose = require('mongoose');
const { Publicacion, Usuario } = require('../configuracion/ArquitecturaBaseDeDatos');

const fotoPerfilPorDefecto = 'https://via.placeholder.com/150';

const serializarPublicacion = (publicacion, usuarioActualId = null) => {
  const likes = Array.isArray(publicacion.likes) ? publicacion.likes : [];
  const autor = publicacion.autor || {};
  const usuarioLeDioLike = usuarioActualId
    ? likes.some((likeId) => String(likeId) === String(usuarioActualId))
    : false;

  return {
    id: publicacion._id ? publicacion._id.toString() : String(publicacion.id),
    usuario: autor.username || publicacion.usuario || 'usuario',
    nombreAutor: autor.nombreCompleto || publicacion.nombreAutor || 'Usuario',
    fotoPerfil: autor.fotoPerfil || publicacion.fotoPerfil || fotoPerfilPorDefecto,
    descripcion: publicacion.descripcion || publicacion.desc || '',
    desc: publicacion.descripcion || publicacion.desc || '',
    mediaUrl: publicacion.urlContenido || publicacion.portada || publicacion.video || '',
    portada: publicacion.urlContenido || publicacion.portada || publicacion.video || '',
    tipoContenido: publicacion.tipo || 'video',
    likes: likes.length,
    comentarios: Number(publicacion.comentariosCount || 0),
    usuarioDioLike: usuarioLeDioLike
  };
};

// --- FUNCIONES DEL CONTROLADOR ---

/**
 * Obtiene todas las publicaciones para el feed principal
 */
const obtenerFeed = async (req, res) => {
  try {
    const { username } = req.query;
    const usuarioActual = username ? await Usuario.findOne({ username }).lean() : null;
    const publicaciones = await Publicacion.find()
      .sort({ createdAt: -1 })
      .populate('autor', 'username nombreCompleto fotoPerfil')
      .lean();

    res.status(200).json(publicaciones.map((publicacion) => serializarPublicacion(publicacion, usuarioActual?._id)));
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cargar el feed social", error: error.message });
  }
};

/**
 * Maneja la lógica de dar o quitar Like a una publicación
 */
const gestionarLike = async (req, res) => {
  try {
    const { idPublicacion, username } = req.body;

    if (!idPublicacion || !username) {
      return res.status(400).json({ mensaje: 'idPublicacion y username son obligatorios' });
    }

    if (!mongoose.Types.ObjectId.isValid(idPublicacion)) {
      return res.status(400).json({ mensaje: 'El id de la publicación no es válido' });
    }

    const [usuario, publicacion] = await Promise.all([
      Usuario.findOne({ username }),
      Publicacion.findById(idPublicacion)
    ]);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada' });
    }

    const usuarioId = usuario._id.toString();
    const indiceLike = publicacion.likes.findIndex((likeId) => String(likeId) === usuarioId);
    let usuarioLeDioLike = false;

    if (indiceLike >= 0) {
      publicacion.likes.splice(indiceLike, 1);
    } else {
      publicacion.likes.push(usuario._id);
      usuarioLeDioLike = true;
    }

    await publicacion.save();

    const publicacionActualizada = await Publicacion.findById(publicacion._id)
      .populate('autor', 'username nombreCompleto fotoPerfil')
      .lean();

    res.status(200).json({
      mensaje: 'Estado de like actualizado',
      usuarioLeDioLike,
      publicacion: serializarPublicacion(publicacionActualizada, usuario._id)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el like', error: error.message });
  }
};

/**
 * Permite subir una nueva publicación (Simulación)
 */
const subirPublicacion = async (req, res) => {
  try {
    const { username, urlContenido, video, desc, descripcion, tipo } = req.body;

    if (!username || !(urlContenido || video)) {
      return res.status(400).json({ mensaje: 'username y urlContenido son obligatorios' });
    }

    const usuario = await Usuario.findOne({ username });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const nuevaPublicacion = await Publicacion.create({
      autor: usuario._id,
      tipo: tipo || 'video',
      urlContenido: urlContenido || video,
      descripcion: descripcion || desc || '',
      hashtags: []
    });

    const publicacionCreada = await Publicacion.findById(nuevaPublicacion._id)
      .populate('autor', 'username nombreCompleto fotoPerfil')
      .lean();

    res.status(201).json({
      mensaje: 'Publicación creada con éxito',
      data: serializarPublicacion(publicacionCreada, usuario._id)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la publicación', error: error.message });
  }
};

module.exports = {
  obtenerFeed,
  gestionarLike,
  subirPublicacion
};