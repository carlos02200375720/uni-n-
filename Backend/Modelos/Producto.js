/**
 * MODELO DE PRODUCTO
 * Define el esquema estructural para los artículos de la tienda.
 */

const ProductoSchema = {
  // El nombre es obligatorio y limpia espacios al inicio/final
  nombre: {
    type: String,
    required: [true, "El nombre del producto es obligatorio"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder los 100 caracteres"]
  },

  // Descripción detallada del producto
  descripcion: {
    type: String,
    required: [true, "La descripción es necesaria para el cliente"]
  },

  // Precio con validación de valor positivo
  precio: {
    type: Number,
    required: [true, "El precio es obligatorio"],
    min: [0, "El precio no puede ser un valor negativo"]
  },

  // Organización por categorías predefinidas
  categoria: {
    type: String,
    required: true,
    enum: {
      values: ['Móviles', 'Audio', 'Laptops', 'Relojes', 'Accesorios'],
      message: '{VALUE} no es una categoría válida'
    }
  },

  // Lista de URLs de imágenes (para tener galería)
  imagenes: [
    {
      type: String,
      required: true
    }
  ],

  // Control de inventario
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, "El stock no puede ser inferior a cero"]
  },

  // Puntuación media de los clientes
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },

  // Fecha en la que se añadió al catálogo
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
};

module.exports = ProductoSchema;