/**
 * Devuelve todos los archivos de perfil públicos de todos los usuarios
 */
const obtenerArchivosPerfilPublicos = async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, { username: 1, archivosPerfil: 1, fotoPerfil: 1 }).lean();
    // Unir todos los archivos con referencia al usuario
    const archivos = usuarios.flatMap(u =>
      (u.archivosPerfil || []).map(a => ({ 
        ...a, 
        id: a._id ? a._id.toString() : null,
        usuario: u.username, 
        fotoPerfil: u.fotoPerfil 
      }))
    );
    res.status(200).json({ archivos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener archivos públicos', error: error.message });
  }
};
/**
 * Elimina un archivo de la galería del usuario
 * req.body.url: URL del archivo a eliminar
 * req.params.id: id o username del usuario
 */
const eliminarArchivoPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body;
    if (!url) return res.status(400).json({ mensaje: 'URL requerida' });
    // Buscar usuario por _id si es ObjectId válido, si no por username
    let filtro;
    if (esObjectIdEstricto(id)) {
      filtro = { _id: id };
    } else {
      filtro = { username: String(id).trim() };
    }
    const usuario = await Usuario.findOne(filtro);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    usuario.archivosPerfil = (usuario.archivosPerfil || []).filter(a => a.url !== url);
    await usuario.save();
    // Opcional: eliminar de Cloudinary (requiere public_id)
    res.status(200).json({ mensaje: 'Archivo eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar archivo', error: error.message });
  }
};
/**
 * CONTROLADOR DE USUARIO
 * Gestiona la autenticación, los datos del perfil personal
 * y la configuración de la cuenta.
 */

const mongoose = require('mongoose');
const { Pedido, Producto, Publicacion, Usuario } = require('../configuracion/ArquitecturaBaseDeDatos');

const fotoPerfilPorDefecto = 'https://via.placeholder.com/150';

const esObjectIdEstricto = (valor = '') => mongoose.Types.ObjectId.isValid(valor) && String(new mongoose.Types.ObjectId(valor)) === String(valor);

const serializarPublicacionPerfil = (publicacion) => {
  const tipo = publicacion.tipo || 'imagen';
  // Si es video, generamos una miniatura reemplazando la extensión del video por .jpg (funciona nativamente en Cloudinary)
  const urlMiniatura = (tipo === 'video' && publicacion.urlContenido) 
    ? publicacion.urlContenido.replace(/\.[^/.]+$/, ".jpg") 
    : publicacion.urlContenido;

  return {
    id: publicacion._id.toString(),
    tipoContenido: tipo,
    mediaUrl: publicacion.urlContenido,
    portada: urlMiniatura,
    imagen: urlMiniatura,
    descripcion: publicacion.descripcion || '',
    titulo: publicacion.descripcion || '',
    likes: Array.isArray(publicacion.likes) ? publicacion.likes.length : 0,
    comentarios: Number(publicacion.comentariosCount || 0),
    fecha: publicacion.createdAt
  };
};

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

    const [publicacionesRecientes, publicacionesCount, pedidosRecientes, totalCompras, totalGuardados, publicacionesMeGusta] = await Promise.all([
      Publicacion.find({ autor: usuario._id }).sort({ createdAt: -1 }).limit(9).lean(),
      Publicacion.countDocuments({ autor: usuario._id }),
      Pedido.find(filtroPedidos).sort({ createdAt: -1 }).limit(5).lean(),
      Pedido.countDocuments(filtroPedidos),
      Producto.find({ usuariosQueDieronMeGusta: username }).lean(),
      Publicacion.find({ _id: { $in: usuario.publicacionesQueDieronMeGusta || [] } })
        .populate('autor', 'username fotoPerfil').lean()
    ]);

    const likesTotales = publicacionesRecientes.reduce((acumulado, publicacion) => {
      return acumulado + (Array.isArray(publicacion.likes) ? publicacion.likes.length : 0);
    }, 0);
    const totalGuardados = totalCompras; // O cualquier lógica de conteo

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
      totalGuardados: totalGuardados + publicacionesMeGusta.length,
      publicacionesRecientes: publicacionesRecientes.map(serializarPublicacionPerfil),
      publicacionesMeGusta: publicacionesMeGusta.map(p => serializarPublicacionPerfil(p)),
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

const registrarUsuario = async (req, res) => {
  try {
    const { username, email, password, nombre, bio, foto } = req.body;

    if (!username || !email || !password || !nombre) {
      return res.status(400).json({ mensaje: 'username, email, password y nombre son obligatorios' });
    }

    const usernameLimpio = String(username).trim();
    const emailLimpio = String(email).trim().toLowerCase();

    const usuarioExistente = await Usuario.findOne({
      $or: [
        { username: usernameLimpio },
        { email: emailLimpio }
      ]
    });

    if (usuarioExistente) {
      return res.status(409).json({ mensaje: 'El username o correo ya están registrados' });
    }

    const nuevoUsuario = await Usuario.create({
      username: usernameLimpio,
      email: emailLimpio,
      password: String(password),
      nombreCompleto: String(nombre).trim(),
      biografia: String(bio || '¡Hola! Acabo de crear mi cuenta.').trim(),
      fotoPerfil: String(foto || fotoPerfilPorDefecto).trim()
    });

    res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario: {
        id: nuevoUsuario._id.toString(),
        username: nuevoUsuario.username,
        nombre: nuevoUsuario.nombreCompleto,
        bio: nuevoUsuario.biografia,
        foto: nuevoUsuario.fotoPerfil,
        email: nuevoUsuario.email
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el usuario', error: error.message });
  }
};

/**
 * Actualiza la información del perfil del usuario
 */
const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, bio, foto } = req.body;

    const filtro = esObjectIdEstricto(id) ? { _id: id } : { username: String(id).trim() };
    const usuario = await Usuario.findOne(filtro);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado para actualizar' });
    }

    const viejaFoto = usuario.fotoPerfil;
    usuario.nombreCompleto = String(nombre || usuario.nombreCompleto).trim();
    usuario.biografia = String(bio || usuario.biografia).trim();
    usuario.fotoPerfil = String(foto || usuario.fotoPerfil).trim();

    // Si la foto cambió, registrarla automáticamente en la galería pública
    if (foto && foto !== viejaFoto) {
      usuario.archivosPerfil = usuario.archivosPerfil || [];
      const yaExiste = usuario.archivosPerfil.some(a => a.url === foto);
      if (!yaExiste) {
        usuario.archivosPerfil.push({
          url: foto,
          tipo: 'imagen',
          fecha: new Date(),
          descripcion: `Actualizó su foto de perfil`
        });
      }
    }

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

const { subirImagenACloudinary, subirVideoACloudinary } = require('../servicios/ServicioCloudinary');

/**
 * Sube imagen o video de perfil a Cloudinary
 * req.file: archivo subido (imagen o video)
 * req.params.id: id o username del usuario
 */
const subirArchivoPerfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se recibió ningún archivo.' });
    }
    const { id } = req.params;
    const extension = (req.file.mimetype || '').split('/')[0];
    let resultado;
    if (extension === 'image') {
      resultado = await subirImagenACloudinary(req.file.path, 'fotos_perfil');
    } else if (extension === 'video') {
      resultado = await subirVideoACloudinary(req.file.path, 'videos_perfil');
    } else {
      return res.status(400).json({ mensaje: 'Tipo de archivo no soportado.' });
    }
    // Buscar usuario por _id si es ObjectId válido, si no por username
    let filtro;
    if (esObjectIdEstricto(id)) {
      filtro = { _id: id };
    } else {
      filtro = { username: String(id).trim() };
    }
    const usuario = await Usuario.findOne(filtro);
    if (usuario) {
      usuario.archivosPerfil = usuario.archivosPerfil || [];
      const tipoFinal = extension === 'image' ? 'imagen' : 'video';
      usuario.archivosPerfil.push({ 
        url: resultado.secure_url, 
        tipo: tipoFinal,
        fecha: new Date(),
        descripcion: tipoFinal === 'imagen' ? 'Nueva foto de perfil' : 'Nuevo video de perfil'
      });
      await usuario.save();
    }
    const tipoFinal = extension === 'image' ? 'imagen' : 'video';
    res.status(200).json({ url: resultado.secure_url, tipo: tipoFinal });
  } catch (error) {
    console.error('Error al subir archivo de perfil:', error); // Log detallado para depuración
    res.status(500).json({ mensaje: 'Error al subir archivo', error: error.message });
  }
};

/**
 * Permite a un usuario seguir o dejar de seguir a otro
 */
const gestionarSeguimiento = async (req, res) => {
  try {
    const { usernameASeguir, usernameSeguidor } = req.body;

    if (!usernameASeguir || !usernameSeguidor) {
      return res.status(400).json({ mensaje: 'Ambos usernames son obligatorios' });
    }

    if (usernameASeguir === usernameSeguidor) {
      return res.status(400).json({ mensaje: 'No puedes seguirte a ti mismo' });
    }

    const [usuarioASeguir, usuarioSeguidor] = await Promise.all([
      Usuario.findOne({ username: usernameASeguir }),
      Usuario.findOne({ username: usernameSeguidor })
    ]);

    if (!usuarioASeguir || !usuarioSeguidor) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const yaSigue = usuarioSeguidor.siguiendo.some(id => id.toString() === usuarioASeguir._id.toString());

    if (yaSigue) {
      // Dejar de seguir
      usuarioSeguidor.siguiendo = usuarioSeguidor.siguiendo.filter(id => id.toString() !== usuarioASeguir._id.toString());
      usuarioASeguir.seguidores = usuarioASeguir.seguidores.filter(id => id.toString() !== usuarioSeguidor._id.toString());
    } else {
      // Empezar a seguir
      usuarioSeguidor.siguiendo.push(usuarioASeguir._id);
      usuarioASeguir.seguidores.push(usuarioSeguidor._id);
    }

    await Promise.all([usuarioSeguidor.save(), usuarioASeguir.save()]);

    res.status(200).json({ 
      mensaje: yaSigue ? 'Ya no sigues a este usuario' : 'Ahora sigues a este usuario',
      siguiendo: !yaSigue 
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al gestionar seguimiento', error: error.message });
  }
};

module.exports = {
  obtenerPerfil,
  registrarUsuario,
  iniciarSesion,
  actualizarPerfil,
  subirArchivoPerfil,
  eliminarArchivoPerfil,
  obtenerArchivosPerfilPublicos,
  gestionarSeguimiento
};