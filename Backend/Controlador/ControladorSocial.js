/**
 * CONTROLADOR SOCIAL
 * Gestiona las publicaciones de video, el sistema de likes 
 * y la interacción entre usuarios en el feed.
 */

// Simulación de Base de Datos para la Red Social
let publicaciones = [
  {
    id: 1,
    usuario: '@tech_lover',
    fotoPerfil: 'https://i.pravatar.cc/150?u=9',
    video: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500',
    desc: 'Unboxing del nuevo iPhone 15 Pro Max 🚀',
    likes: 12500,
    comentarios: 450,
    usuarioLeDioLike: false
  },
  {
    id: 2,
    usuario: '@gadget_master',
    fotoPerfil: 'https://i.pravatar.cc/150?u=12',
    video: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    desc: 'Tips para mejorar la batería de tu smartphone #tech #tips',
    likes: 8900,
    comentarios: 120,
    usuarioLeDioLike: false
  }
];

// --- FUNCIONES DEL CONTROLADOR ---

/**
 * Obtiene todas las publicaciones para el feed principal
 */
const obtenerFeed = (req, res) => {
  try {
    // En un sistema real, aquí se usaría un algoritmo de recomendación
    res.status(200).json(publicaciones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cargar el feed social", error: error.message });
  }
};

/**
 * Maneja la lógica de dar o quitar Like a una publicación
 */
const gestionarLike = (req, res) => {
  const { idPublicacion } = req.body;
  
  const pub = publicaciones.find(p => p.id === parseInt(idPublicacion));

  if (!pub) {
    return res.status(404).json({ mensaje: "Publicación no encontrada" });
  }

  // Lógica de alternancia (Toggle)
  if (pub.usuarioLeDioLike) {
    pub.likes -= 1;
    pub.usuarioLeDioLike = false;
  } else {
    pub.likes += 1;
    pub.usuarioLeDioLike = true;
  }

  res.status(200).json({
    mensaje: "Estado de like actualizado",
    likesActuales: pub.likes,
    usuarioLeDioLike: pub.usuarioLeDioLike
  });
};

/**
 * Permite subir una nueva publicación (Simulación)
 */
const subirPublicacion = (req, res) => {
  const { usuario, video, desc } = req.body;

  if (!usuario || !video) {
    return res.status(400).json({ mensaje: "Faltan datos para crear la publicación" });
  }

  const nuevaPub = {
    id: publicaciones.length + 1,
    usuario,
    fotoPerfil: 'https://i.pravatar.cc/150?u=new',
    video,
    desc,
    likes: 0,
    comentarios: 0,
    usuarioLeDioLike: false
  };

  publicaciones.unshift(nuevaPub); // Se añade al inicio del feed

  res.status(201).json({
    mensaje: "Publicación creada con éxito",
    data: nuevaPub
  });
};

module.exports = {
  obtenerFeed,
  gestionarLike,
  subirPublicacion
};