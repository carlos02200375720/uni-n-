import React from 'react';

const DashboardAdmin = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded shadow text-center">
        <div className="text-3xl font-black text-blue-700">--</div>
        <div className="text-gray-500 mt-2">Productos</div>
      </div>
      <div className="bg-white p-6 rounded shadow text-center">
        <div className="text-3xl font-black text-blue-700">--</div>
        <div className="text-gray-500 mt-2">Pedidos</div>
      </div>
      <div className="bg-white p-6 rounded shadow text-center">
        <div className="text-3xl font-black text-blue-700">--</div>
        <div className="text-gray-500 mt-2">Usuarios</div>
      </div>
      <div className="bg-white p-6 rounded shadow text-center">
        <div className="text-3xl font-black text-blue-700">--</div>
        <div className="text-gray-500 mt-2">Ventas</div>
      </div>
    </div>
    <div className="mt-8 text-gray-400">(Aquí irán las gráficas y estadísticas del negocio)</div>
  </div>
);

export default DashboardAdmin;
