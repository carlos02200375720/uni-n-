# Plantilla de producto para la tienda

Usa esta estructura cuando empieces a crear productos reales en MongoDB.

## Campos recomendados

```json
{
  "nombre": "Samsung Galaxy S25 Ultra",
  "descripcion": "Smartphone premium con pantalla AMOLED, gran batería y cámara avanzada.",
  "precio": 1349,
  "precioOriginal": 1499,
  "descuento": 10,
  "oferta": true,
  "categoria": "Móviles",
  "stock": 18,
  "etiquetas": ["samsung", "android", "premium"],
  "imagenes": [
    "https://tu-servidor.com/productos/galaxy-s25-ultra-frontal.jpg",
    "https://tu-servidor.com/productos/galaxy-s25-ultra-trasera.jpg",
    "https://tu-servidor.com/productos/galaxy-s25-ultra-lateral.jpg"
  ],
  "likesCount": 0,
  "comentariosCount": 0,
  "usuariosQueDieronMeGusta": [],
  "comentarios": []
}
```

## Reglas importantes

- `nombre`, `descripcion`, `precio` y `categoria` son los campos base que no deberían faltar.
- `categoria` debe ser una de estas opciones: `Móviles`, `Audio`, `Laptops`, `Relojes`, `Accesorios`.
- `imagenes` debe ser un arreglo de URLs. Si agregas varias imágenes, el carrusel de la página de inicio las mostrará automáticamente.
- Si solo tienes una imagen, también puedes guardar una sola URL dentro de `imagenes`.
- Si quieres que el producto aparezca como oferta, basta con cumplir una de estas condiciones:
  - `oferta: true`
  - `descuento` mayor que `0`
  - `precioOriginal` mayor que `precio`
- `likesCount`, `comentariosCount`, `usuariosQueDieronMeGusta` y `comentarios` pueden iniciar vacíos o en `0`.

## Ejemplo mínimo

```json
{
  "nombre": "Cargador USB-C 65W",
  "descripcion": "Cargador rápido compacto para laptop, tablet y móvil.",
  "precio": 49,
  "categoria": "Accesorios",
  "stock": 30,
  "imagenes": [
    "https://tu-servidor.com/productos/cargador-usbc-65w.jpg"
  ]
}
```

## Qué hace la app con estos campos

- La tarjeta de la tienda usa `imagenes` para el carrusel.
- El precio visual usa `precio`, `precioOriginal` y `descuento`.
- El carrusel de ofertas usa `oferta`, `descuento` y la comparación entre `precioOriginal` y `precio`.
- El detalle del producto usa `descripcion`, `comentarios` y `comentariosCount`.