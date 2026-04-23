/**
 * CONTROLADOR DE TIENDA
 * Maneja toda la lógica de los productos, desde el listado hasta la validación de pagos.
 */

// Datos simulados (Base de datos temporal)
let inventario = [
  { 
    id: 1, 
    nombre: 'iPhone 15 Pro', 
    precio: 1199, 
    stock: 10, 
    categoria: 'Móviles', 
    imagen: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500' 
  },
  { 
    id: 2, 
    nombre: 'AirPods Max', 
    precio: 549, 
    stock: 15, 
    categoria: 'Audio', 
    imagen: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=500' 
  },
  { 
    id: 3, 
    nombre: 'MacBook Air M3', 
    precio: 1299, 
    stock: 5, 
    categoria: 'Laptops', 
    imagen: 'https://images.unsplash.com/photo-1517336712461-1286c9527964?w=500' 
  }
];

// --- FUNCIONES DEL CONTROLADOR ---

// Obtener la lista de productos
const obtenerProductos = (req, res) => {
  try {
    const { categoria } = req.query;
    if (categoria) {
      const filtrados = inventario.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
      return res.status(200).json(filtrados);
    }
    res.status(200).json(inventario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cargar productos", error: error.message });
  }
};

// Obtener un producto por ID
const obtenerProductoPorId = (req, res) => {
  const { id } = req.params;
  const producto = inventario.find(p => p.id === parseInt(id));

  if (!producto) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  res.status(200).json(producto);
};

// Validar y procesar la compra
const procesarPago = (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ mensaje: "El carrito está vacío" });
  }

  // Recalcular total en el servidor por seguridad
  let totalCalculado = 0;
  items.forEach(item => {
    const p = inventario.find(prod => prod.id === item.id);
    if (p) totalCalculado += p.precio;
  });

  res.status(200).json({
    mensaje: "Pago procesado con éxito",
    idOrden: "ORD-" + Math.random().toString(36).substr(2, 7).toUpperCase(),
    total: totalCalculado
  });
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  procesarPago
};