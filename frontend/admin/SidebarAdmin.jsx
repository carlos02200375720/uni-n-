import React from 'react';

const SidebarAdmin = ({ seccion, setSeccion }) => (
  <aside className="w-64 bg-white shadow-lg flex flex-col">
    <div className="p-6 font-black text-xl text-blue-700 border-b">Admin Panel</div>
    <nav className="flex-1 flex flex-col gap-2 p-4">
      <button onClick={() => setSeccion('dashboard')} className={`text-left px-4 py-2 rounded ${seccion==='dashboard' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50'}`}>Dashboard</button>
      <button onClick={() => setSeccion('productos')} className={`text-left px-4 py-2 rounded ${seccion==='productos' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50'}`}>Productos</button>
      <button onClick={() => setSeccion('pedidos')} className={`text-left px-4 py-2 rounded ${seccion==='pedidos' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50'}`}>Pedidos</button>
      <button onClick={() => setSeccion('usuarios')} className={`text-left px-4 py-2 rounded ${seccion==='usuarios' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50'}`}>Usuarios</button>
    </nav>
  </aside>
);

export default SidebarAdmin;
