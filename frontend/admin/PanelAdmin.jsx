import React from 'react';
import SidebarAdmin from './SidebarAdmin';
import DashboardAdmin from './DashboardAdmin';
import GestionProductos from './GestionProductos';
import GestionPedidos from './GestionPedidos';
import GestionUsuarios from './GestionUsuarios';

const PanelAdmin = ({ recargarProductos }) => {
  const [seccion, setSeccion] = React.useState('dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin seccion={seccion} setSeccion={setSeccion} />
      <main className="flex-1 p-6">
        {seccion === 'dashboard' && <DashboardAdmin />}
        {seccion === 'productos' && <GestionProductos recargarProductos={recargarProductos} />}
        {seccion === 'pedidos' && <GestionPedidos />}
        {seccion === 'usuarios' && <GestionUsuarios />}
      </main>
    </div>
  );
};

export default PanelAdmin;
