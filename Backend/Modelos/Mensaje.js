/**
 * MODELO DE MENSAJE
 * Estructura para los mensajes del chat entre usuarios o soporte.
 */

const MensajeSchema = {
  emisorId: {
    type: String, // ID del usuario que envía
    required: true
  },
  receptorId: {
    type: String, // ID del usuario que recibe
    required: true
  },
  contenido: {
    type: String,
    required: true
  },
  leido: {
    type: Boolean,
    default: false
  },
  tipoMensaje: {
    type: String,
    enum: ['texto', 'imagen', 'producto'],
    default: 'texto'
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  }
};

module.exports = MensajeSchema;