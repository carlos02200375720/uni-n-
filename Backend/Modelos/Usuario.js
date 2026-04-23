/**
 * MODELO DE USUARIO
 * Estructura de datos para los perfiles de la plataforma.
 */

const UsuarioSchema = {
  username: {
    type: String,
    required: true,
    unique: true, // No pueden existir dos usuarios con el mismo nombre
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true // En el futuro, aquí se guardará el hash encriptado
  },
  nombreCompleto: {
    type: String,
    required: true
  },
  biografia: {
    type: String,
    default: ""
  },
  fotoPerfil: {
    type: String,
    default: "https://via.placeholder.com/150"
  },
  estadisticas: {
    seguidores: { type: Number, default: 0 },
    siguiendo: { type: Number, default: 0 },
    likesRecibidos: { type: Number, default: 0 }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
};

module.exports = UsuarioSchema;