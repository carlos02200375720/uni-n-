/**
 * MODELO DE USUARIO
 * Estructura de datos para los perfiles de la plataforma.
 */

const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  nombreCompleto: { type: String, required: true },
  biografia: { type: String, default: '' },
  fotoPerfil: { type: String, default: 'https://via.placeholder.com/150' },
  archivosPerfil: {
    type: [
      {
        url: { type: String, required: true },
        tipo: { type: String, enum: ['imagen', 'video'], required: true }
      }
    ],
    default: []
  },
  estadisticas: {
    seguidores: { type: Number, default: 0 },
    siguiendo: { type: Number, default: 0 },
    likesRecibidos: { type: Number, default: 0 }
  },
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = UsuarioSchema;