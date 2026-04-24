const productosMockTienda = [
  {
    id: 1,
    nombre: 'iPhone 15 Pro',
    descripcion: 'Smartphone premium con cámara avanzada y rendimiento de nivel profesional.',
    precio: 1199,
    precioOriginal: 1399,
    descuento: 14,
    oferta: true,
    likesCount: 128,
    comentariosCount: 18,
    stock: 10,
    categoria: 'Móviles',
    etiquetas: ['apple', 'movil', 'pro'],
    imagenes: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=900',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900'
    ],
    imagen: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500'
  },
  {
    id: 2,
    nombre: 'AirPods Max',
    descripcion: 'Audio inmersivo con cancelación activa de ruido y diseño premium.',
    precio: 549,
    precioOriginal: 699,
    descuento: 21,
    oferta: true,
    likesCount: 94,
    comentariosCount: 12,
    stock: 15,
    categoria: 'Audio',
    etiquetas: ['audio', 'apple', 'premium'],
    imagenes: [
      'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=900',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900'
    ],
    imagen: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=500'
  },
  {
    id: 3,
    nombre: 'Galaxy Watch Ultra',
    descripcion: 'Reloj inteligente resistente con métricas avanzadas y gran autonomía.',
    precio: 399,
    precioOriginal: 499,
    descuento: 20,
    oferta: true,
    likesCount: 76,
    comentariosCount: 9,
    stock: 12,
    categoria: 'Relojes',
    etiquetas: ['wearable', 'salud', 'smartwatch'],
    imagenes: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=900'
    ],
    imagen: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'
  },
  {
    id: 4,
    nombre: 'Sony WH-1000XM5',
    descripcion: 'Auriculares de alta fidelidad con cancelación de ruido líder en su clase.',
    precio: 329,
    precioOriginal: 429,
    descuento: 23,
    oferta: true,
    likesCount: 51,
    comentariosCount: 7,
    stock: 18,
    categoria: 'Audio',
    etiquetas: ['sony', 'audio', 'oferta'],
    imagenes: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=900',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900'
    ],
    imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
  },
  {
    id: 5,
    nombre: 'iPad Pro M4',
    descripcion: 'Tablet potente con pantalla OLED ideal para trabajo creativo y multimedia.',
    precio: 1100,
    precioOriginal: 1299,
    descuento: 15,
    oferta: true,
    likesCount: 37,
    comentariosCount: 5,
    stock: 8,
    categoria: 'Laptops',
    etiquetas: ['apple', 'tablet', 'm4'],
    imagenes: [
      'https://picsum.photos/seed/ipad/900/600',
      'https://picsum.photos/seed/ipad-side/900/1200',
      'https://picsum.photos/seed/ipad-back/1200/900'
    ],
    imagen: 'https://picsum.photos/seed/ipad/600/400'
  },
  {
    id: 6,
    nombre: 'MacBook Air M3',
    descripcion: 'Portátil ligero con excelente batería para productividad diaria.',
    precio: 1299,
    precioOriginal: 1299,
    descuento: 0,
    oferta: false,
    likesCount: 22,
    comentariosCount: 4,
    stock: 5,
    categoria: 'Laptops',
    etiquetas: ['apple', 'laptop', 'm3'],
    imagenes: [
      'https://images.unsplash.com/photo-1517336712461-1286c9527964?w=900',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900',
      'https://images.unsplash.com/photo-1496180727794-817822f65950?w=900'
    ],
    imagen: 'https://images.unsplash.com/photo-1517336712461-1286c9527964?w=500'
  },
  {
    id: 7,
    nombre: 'Cargador MagSafe Duo',
    descripcion: 'Accesorio compacto para carga rápida y ordenada de tus dispositivos.',
    precio: 129,
    precioOriginal: 129,
    descuento: 0,
    oferta: false,
    likesCount: 18,
    comentariosCount: 3,
    stock: 22,
    categoria: 'Accesorios',
    etiquetas: ['carga', 'magsafe', 'accesorios'],
    imagenes: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=900',
      'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=900'
    ],
    imagen: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500'
  },
  {
    id: 8,
    nombre: 'Tenis Urban Flex',
    descripcion: 'Producto de prueba para visualizar un flujo de compra con selección de talla y color antes de añadir al carrito o comprar.',
    precio: 89,
    precioOriginal: 119,
    descuento: 25,
    oferta: true,
    likesCount: 51,
    comentariosCount: 7,
    stock: 14,
    categoria: 'Calzado',
    etiquetas: ['calzado', 'urbano', 'variantes'],
    tallas: ['38', '39', '40', '41', '42'],
    colores: ['Negro', 'Blanco', 'Rojo'],
    imagenes: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900'
    ],
    imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
  }
];

module.exports = productosMockTienda;