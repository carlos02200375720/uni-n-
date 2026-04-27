import React, { useEffect, useState } from 'react';

// Simulación de fetch de pedidos
const fetchPedidos = async () => {
  // Aquí deberías hacer un fetch real a tu backend
  // Simulación de estructura de pedido
  return [
    {
      id: 'pedido1',
      cliente: 'Juan Pérez',
      fecha: '2026-04-25',
      productos: [
        {
          nombre: 'Camiseta Pro',
          colorSeleccionado: 'Rojo',
          coloresConImagen: [
            { color: 'Rojo', imagen: 'https://res.cloudinary.com/demo/image/upload/v1690000000/rojo.jpg' },
            { color: 'Azul', imagen: 'https://res.cloudinary.com/demo/image/upload/v1690000000/azul.jpg' }
          ],
          tallaSeleccionada: 'M',
          cantidad: 2,
          precio: 25
        },
        {
          nombre: 'Zapatos Urban',
          colorSeleccionado: 'Negro',
          coloresConImagen: [
            { color: 'Negro', imagen: 'https://res.cloudinary.com/demo/image/upload/v1690000000/negro.jpg' }
          ],
          tallaSeleccionada: '42',
          cantidad: 1,
          precio: 60
        }
      ]
    }
  ];
};

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  useEffect(() => {
    fetchPedidos().then(setPedidos);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Pedidos</h2>
      <div className="bg-white p-4 rounded shadow">
        {pedidos.length === 0 ? (
          <div className="text-gray-400">No hay pedidos registrados.</div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Color</th>
                <th className="px-4 py-2">Talla</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Precio</th>
                <th className="px-4 py-2">Imagen</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                pedido.productos.map((prod, idx) => (
                  <tr key={pedido.id + '-' + idx} className="border-b">
                    <td className="px-4 py-2">{pedido.cliente}</td>
                    <td className="px-4 py-2">{pedido.fecha}</td>
                    <td className="px-4 py-2">{prod.nombre}</td>
                    <td className="px-4 py-2">{prod.colorSeleccionado}</td>
                    <td className="px-4 py-2">{prod.tallaSeleccionada}</td>
                    <td className="px-4 py-2">{prod.cantidad}</td>
                    <td className="px-4 py-2">${prod.precio}</td>
                    <td className="px-4 py-2">
                      <img
                        src={
                          prod.coloresConImagen && Array.isArray(prod.coloresConImagen) && prod.colorSeleccionado
                            ? (prod.coloresConImagen.find(c => c.color === prod.colorSeleccionado)?.imagen || '')
                            : ''
                        }
                        alt={prod.colorSeleccionado}
                        className="w-12 h-12 object-cover rounded border"
                        onError={e => { e.target.src = 'https://via.placeholder.com/80?text=Color'; }}
                      />
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GestionPedidos;
