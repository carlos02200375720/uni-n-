/**
 * CONTROLADOR SOCIAL
 * Gestiona las publicaciones de video, el sistema de likes 
 * y la interacción entre usuarios en el feed.
 */

const mongoose = require('mongoose');
const { Publicacion, Usuario } = require('../configuracion/ArquitecturaBaseDeDatos');
const { subirImagenACloudinary, subirVideoACloudinary } = require('../servicios/ServicioCloudinary');

const fotoPerfilPorDefecto = 'https://via.placeholder.com/150';

const serializarPublicacion = (publicacion, usuarioActualId = null) => {
  const likes = Array.isArray(publicacion.likes) ? publicacion.likes : [];
  const dislikes = Array.isArray(publicacion.dislikes) ? publicacion.dislikes : [];
  const comentarios = Array.isArray(publicacion.comentarios) ? publicacion.comentarios : [];
  const autor = publicacion.autor || {};
  const usuarioLeDioLike = usuarioActualId
    ? likes.some((likeId) => String(likeId) === String(usuarioActualId))
    : false;
  const usuarioLeDioDislike = usuarioActualId
    ? dislikes.some((dislikeId) => String(dislikeId) === String(usuarioActualId))
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
    comentarios: comentarios.length,
    listaComentarios: comentarios,
    usuarioDioLike: usuarioLeDioLike,
    usuarioDioDislike: usuarioLeDioDislike,
    fecha: publicacion.createdAt
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

    // Like -> agregar a ambos lados; Unlike -> quitar de ambos lados
    if (indiceLike >= 0) {
      // Quitar like
      publicacion.likes.splice(indiceLike, 1);
      // Quitar de publicacionesQueDieronMeGusta si existe
      const idx = usuario.publicacionesQueDieronMeGusta.findIndex((pubId) => String(pubId) === String(publicacion._id));
      if (idx >= 0) {
        usuario.publicacionesQueDieronMeGusta.splice(idx, 1);
      }
    } else {
      // Dar like
      publicacion.likes.push(usuario._id);
      usuarioLeDioLike = true;

      // Si da Like, quitamos el Dislike automáticamente
      publicacion.dislikes = (publicacion.dislikes || []).filter(id => String(id) !== usuarioId);
      usuario.publicacionesQueNoLeGustaron = (usuario.publicacionesQueNoLeGustaron || []).filter(id => String(id) !== String(publicacion._id));

      // Agregar a publicacionesQueDieronMeGusta si no existe
      if (!usuario.publicacionesQueDieronMeGusta.some((pubId) => String(pubId) === String(publicacion._id))) {
        usuario.publicacionesQueDieronMeGusta.push(publicacion._id);
      }
    }

    await Promise.all([
      publicacion.save(),
      usuario.save()
    ]);

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
 * Permite subir una nueva publicación real procesando archivos
 */
const subirPublicacion = async (req, res) => {
  try {
    const { username, desc, descripcion, tipo } = req.body;

    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se recibió ningún archivo de imagen o video.' });
    }

    if (!username) {
      return res.status(400).json({ mensaje: 'El nombre de usuario es obligatorio.' });
    }

    const usuario = await Usuario.findOne({ username });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Determinar tipo de archivo y subir a Cloudinary
    const mimetype = req.file.mimetype || '';
    let resultado;
    
    if (mimetype.startsWith('image')) {
      resultado = await subirImagenACloudinary(req.file.path, 'social/publicaciones');
    } else if (mimetype.startsWith('video')) {
      resultado = await subirVideoACloudinary(req.file.path, 'social/videos');
    } else {
      return res.status(400).json({ mensaje: 'Formato de archivo no soportado. Usa imágenes o videos.' });
    }

    const nuevaPublicacion = await Publicacion.create({
      autor: usuario._id,
      tipo: tipo || (mimetype.startsWith('video') ? 'video' : 'imagen'),
      urlContenido: resultado.secure_url,
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

/**
 * Elimina una publicación específica
 */
const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ mensaje: 'El username es obligatorio' });
    }

    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada' });
    }

    const usuario = await Usuario.findOne({ username });
    if (!usuario || String(publicacion.autor) !== String(usuario._id)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta publicación' });
    }

    await Publicacion.findByIdAndDelete(id);
    res.status(200).json({ mensaje: 'Publicación eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la publicación', error: error.message });
  }
};

/**
 * Maneja la lógica de dar o quitar Dislike a una publicación
 */
const gestionarDislike = async (req, res) => {
  try {
    const { idPublicacion, username } = req.body;

    if (!idPublicacion || !username) {
      return res.status(400).json({ mensaje: 'idPublicacion y username son obligatorios' });
    }

    const [usuario, publicacion] = await Promise.all([
      Usuario.findOne({ username }),
      Publicacion.findById(idPublicacion)
    ]);

    if (!usuario || !publicacion) {
      return res.status(404).json({ mensaje: 'Usuario o Publicación no encontrada' });
    }

    const usuarioId = usuario._id.toString();
    const dislikes = Array.isArray(publicacion.dislikes) ? publicacion.dislikes : [];
    const indiceDislike = dislikes.findIndex((id) => String(id) === usuarioId);
    let usuarioLeDioDislike = false;

    if (indiceDislike >= 0) {
      // Quitar dislike
      publicacion.dislikes.splice(indiceDislike, 1);
      usuario.publicacionesQueNoLeGustaron = (usuario.publicacionesQueNoLeGustaron || []).filter(id => String(id) !== String(publicacion._id));
    } else {
      // Dar dislike
      publicacion.dislikes.push(usuario._id);
      usuarioLeDioDislike = true;

      // Si da Dislike, quitamos el Like automáticamente
      publicacion.likes = (publicacion.likes || []).filter(id => String(id) !== usuarioId);
      usuario.publicacionesQueDieronMeGusta = (usuario.publicacionesQueDieronMeGusta || []).filter(id => String(id) !== String(publicacion._id));

      // Guardar en el historial negativo para el algoritmo
      if (!usuario.publicacionesQueNoLeGustaron.some(id => String(id) === String(publicacion._id))) {
        usuario.publicacionesQueNoLeGustaron.push(publicacion._id);
      }
    }

    await Promise.all([publicacion.save(), usuario.save()]);

    const publicacionActualizada = await Publicacion.findById(publicacion._id)
      .populate('autor', 'username nombreCompleto fotoPerfil')
      .lean();

    res.status(200).json({
      mensaje: 'Estado de dislike actualizado',
      usuarioLeDioDislike,
      publicacion: serializarPublicacion(publicacionActualizada, usuario._id)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el dislike', error: error.message });
  }
};

/**
 * Agrega un comentario a una publicación
 */
const agregarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, texto } = req.body;

    if (!username || !texto || !texto.trim()) {
      return res.status(400).json({ mensaje: 'El username y el texto son obligatorios' });
    }

    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada' });
    }

    const nuevoComentario = {
      usuario: username,
      texto: texto.trim(),
      fecha: new Date()
    };

    publicacion.comentarios.push(nuevoComentario);
    publicacion.comentariosCount = publicacion.comentarios.length;
    await publicacion.save();

    const publicacionActualizada = await Publicacion.findById(id)
      .populate('autor', 'username nombreCompleto fotoPerfil')
      .lean();

    res.status(201).json({
      mensaje: 'Comentario agregado con éxito',
      publicacion: serializarPublicacion(publicacionActualizada, null)
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar el comentario', error: error.message });
  }
};

module.exports = {
  obtenerFeed,
  gestionarLike,
  gestionarDislike,
  subirPublicacion,
  eliminarPublicacion,
  agregarComentario
};