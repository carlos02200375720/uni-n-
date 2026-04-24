/**
 * ARQUITECTURA DE BASE DE DATOS (Plano Maestro)
 * Este archivo es el corazón estructural de la aplicación.
 * Define cómo se crean, se relacionan y se validan todas las tablas 
 * automáticamente al iniciar el servidor.
 */

const mongoose = require('mongoose');

// ==========================================
// 1. ESQUEMA DE USUARIOS (Identidad y IA)
// ==========================================
const UsuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  nombreCompleto: { type: String, required: true },
  biografia: { type: String, default: '¡Hola! Estoy usando la red social tech.' },
  fotoPerfil: { type: String, default: 'https://via.placeholder.com/150' },
  
  // Datos para el Algoritmo de Recomendación
  intereses: { type: [String], default: [] }, // Ej: ['ia', 'gadgets', 'apple']
  
  // Relaciones Sociales
  seguidores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  siguiendo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  
  fechaRegistro: { type: Date, default: Date.now }
}, { timestamps: true });

// ==========================================
// 2. ESQUEMA DE PRODUCTOS (Tienda Tech)
// ==========================================
const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true, min: 0 },
  precioOriginal: { type: Number, min: 0 },
  descuento: { type: Number, default: 0, min: 0, max: 100 },
  oferta: { type: Boolean, default: false },
  likesCount: { type: Number, default: 0, min: 0 },
  comentariosCount: { type: Number, default: 0, min: 0 },
  usuariosQueDieronMeGusta: { type: [String], default: [] },
  comentarios: {
    type: [
      {
        usuario: { type: String, required: true, trim: true },
        texto: { type: String, required: true, trim: true, maxlength: 500 },
        fecha: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  categoria: { 
    type: String, 
    required: true, 
    enum: ['Móviles', 'Audio', 'Laptops', 'Relojes', 'Accesorios', 'Calzado'] 
  },
  imagenes: [{ type: String }],
  tallas: { type: [String], default: [] },
  colores: { type: [String], default: [] },
  stock: { type: Number, default: 0 },
  etiquetas: [String], // Para vinculación con intereses del usuario
  rating: { type: Number, default: 5 }
}, { timestamps: true });

// ==========================================
// 3. ESQUEMA DE PUBLICACIONES (Feed Social)
// ==========================================
const PublicacionSchema = new mongoose.Schema({
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['video', 'imagen'], default: 'video' },
  urlContenido: { type: String, required: true },
  descripcion: { type: String, maxlength: 500 },
  hashtags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  comentariosCount: { type: Number, default: 0 }
}, { timestamps: true });

// ==========================================
// 4. ESQUEMA DE MENSAJERÍA (Chat Privado)
// ==========================================
const MensajeSchema = new mongoose.Schema({
  emisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  receptor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  contenido: { type: String, required: true },
  leido: { type: Boolean, default: false },
  tipo: { type: String, enum: ['texto', 'producto', 'imagen'], default: 'texto' }
}, { timestamps: true });

const PedidoSchema = new mongoose.Schema({
  username: { type: String, default: '', trim: true, index: true },
  items: {
    type: [
      {
        productoId: { type: String, required: true },
        nombre: { type: String, required: true },
        precio: { type: Number, required: true, min: 0 },
        talla: { type: String, default: '' },
        color: { type: String, default: '' },
        cantidad: { type: Number, default: 1, min: 1 }
      }
    ],
    default: []
  },
  cliente: {
    nombre: { type: String, required: true, trim: true },
    pais: { type: String, required: true, trim: true },
    correo: { type: String, required: true, trim: true, lowercase: true },
    celular: { type: String, required: true, trim: true },
    direccion: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    comentarioPedido: { type: String, default: '', trim: true }
  },
  total: { type: Number, required: true, min: 0 },
  estado: { type: String, default: 'pendiente', enum: ['pendiente', 'pagado', 'cancelado'] }
}, { timestamps: true });

// ==========================================
// EXPORTACIÓN Y REGISTRO AUTOMÁTICO
// ==========================================

// Al exportar estos modelos, Mongoose se asegura de que existan en la DB
const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Producto = mongoose.model('Producto', ProductoSchema);
const Publicacion = mongoose.model('Publicacion', PublicacionSchema);
const Mensaje = mongoose.model('Mensaje', MensajeSchema);
const Pedido = mongoose.model('Pedido', PedidoSchema);

console.log("🛠️  Arquitectura de Base de Datos cargada y lista para sincronizar.");

module.exports = {
  Usuario,
  Producto,
  Publicacion,
  Mensaje,
  Pedido
};