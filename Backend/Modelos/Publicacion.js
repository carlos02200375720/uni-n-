/**
 * MODELO DE PUBLICACIÓN SOCIAL
 * Estructura para los videos y fotos del feed.
 */

const PublicacionSchema = {
  autorId: {
    type: String, // ID del usuario que publica
    required: true
  },
  urlContenido: {
    type: String, // URL del video o imagen
    required: true
  },
  descripcion: {
    type: String,
    maxlength: 280
  },
  interacciones: {
    likes: [{ type: String }], // Array de IDs de usuarios que dieron like
    comentariosCount: { type: Number, default: 0 }
  },
  etiquetas: [{
    type: String
  }],
  fechaPublicacion: {
    type: Date,
    default: Date.now
  }
};

module.exports = PublicacionSchema;