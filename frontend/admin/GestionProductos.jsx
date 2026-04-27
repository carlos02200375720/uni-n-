
import React, { useState, useEffect } from 'react';
import FormularioProducto from './FormularioProducto';


const GestionProductos = ({ recargarProductos }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Obtener productos al montar el componente
  const fetchProductos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/tienda/productos');
      if (!res.ok) throw new Error('No se pudo obtener productos');
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar productos');
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Guardar producto y refrescar lista
  const handleGuardar = async (datos) => {
    const formData = new FormData();
    formData.append('nombre', datos.titulo);
    formData.append('descripcion', datos.descripcion);
    formData.append('precio', datos.precio);
    formData.append('categoria', datos.categoria);
    formData.append('stock', datos.stock);
    formData.append('oferta', datos.oferta);
    formData.append('descuento', datos.descuento);
    formData.append('tiempoEnvio', datos.tiempoEnvio);
    formData.append('precioEnvio', datos.precioEnvio);
    // Variantes (tallas y colores)
    if (Array.isArray(datos.variantes)) {
      const tallas = datos.variantes.map(v => v.talla).filter(Boolean);
      const colores = datos.variantes.map(v => v.color).filter(Boolean);
      tallas.forEach(t => formData.append('tallas', t));
      colores.forEach(c => formData.append('colores', c));
    }
    // Archivos (imágenes y videos)
    if (Array.isArray(datos.archivos)) {
      for (let file of datos.archivos) {
        formData.append('imagenes', file); // el backend ya detecta tipo
      }
    }
    try {
      const res = await fetch('/api/tienda/productos', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert('Producto creado correctamente');
        setMostrarFormulario(false);
        fetchProductos(); // Refrescar lista local
        if (typeof recargarProductos === 'function') {
          recargarProductos(); // Refrescar lista global para la tienda
        }
      } else {
        alert(data.mensaje || 'Error al crear producto');
      }
    } catch (err) {
      alert('Error de red al crear producto');
    }
  };

  // Eliminar producto
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/tienda/productos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProductos();
        if (typeof recargarProductos === 'function') recargarProductos();
      } else {
        alert('No se pudo eliminar el producto');
      }
    } catch (err) {
      alert('Error de red al eliminar producto');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Productos</h2>
      <div className="mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? 'Cancelar' : '+ Crear Producto'}
        </button>
      </div>
      {mostrarFormulario && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <FormularioProducto onGuardar={handleGuardar} />
        </div>
      )}
      <div className="bg-white p-4 rounded shadow">
        {cargando ? (
          <div className="text-gray-400">Cargando productos...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : productos.length === 0 ? (
          <div className="text-gray-400">No hay productos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Categoría</th>
                  <th className="px-4 py-2">Precio</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Oferta</th>
                  <th className="px-4 py-2">Descuento</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto._id || producto.id} className="border-b">
                    <td className="px-4 py-2">{producto.nombre}</td>
                    <td className="px-4 py-2">{producto.categoria}</td>
                    <td className="px-4 py-2">${producto.precio}</td>
                    <td className="px-4 py-2">{producto.stock}</td>
                    <td className="px-4 py-2">{producto.oferta ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2">{producto.descuento || 0}%</td>
                    <td className="px-4 py-2">
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-700"
                        onClick={() => handleEliminar(producto._id || producto.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionProductos;
