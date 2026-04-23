import React, { useState } from 'react';
import { Settings, Grid, Bookmark, ShoppingBag, Edit3, LogOut, ChevronRight } from 'lucide-react';

/**
 * LÓGICA INTEGRADA (Anteriormente LogicaPaginaPerfil.js)
 * Maneja el estado y las acciones del perfil de usuario
 */
const useLogicaPerfil = (usuarioInicial, setSeccionActual) => {
  const [usuario, setUsuario] = useState(usuarioInicial);
  const [pestanaActiva, setPestanaActiva] = useState('publicaciones');
  const [estaEditando, setEstaEditando] = useState(false);

  // Función para alternar entre ver publicaciones o guardados
  const cambiarPestana = (pestana) => {
    setPestanaActiva(pestana);
  };

  // Función para guardar cambios en el perfil
  const guardarPerfil = (nuevosDatos) => {
    setUsuario({ ...usuario, ...nuevosDatos });
    setEstaEditando(false);
  };

  // Función para navegar a otras secciones
  const navegarA = (ruta) => {
    if (setSeccionActual) {
      setSeccionActual(ruta);
    } else {
      console.log(`Navegando a la sección: ${ruta}`);
    }
  };

  const cerrarSesion = () => {
    console.log("Cerrando sesión del usuario...");
    // Aquí iría la lógica de borrar tokens y redirigir
  };

  return {
    usuario,
    pestanaActiva,
    estaEditando,
    setEstaEditando,
    cambiarPestana,
    guardarPerfil,
    navegarA,
    cerrarSesion
  };
};

/**
 * COMPONENTE VISTA
 */
export default function App() {
  // Datos de ejemplo para que el componente sea visualizable de inmediato
  const usuarioMock = {
    username: 'cristian_dev',
    nombre: 'Cristian García',
    bio: 'Desarrollador FullStack & Entusiasta del diseño UI/UX. 🚀',
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
  };

  // En una app real, estas funciones vendrían por props, aquí las simulamos
  const setSeccionActualSimulada = (ruta) => console.log("Cambiando a:", ruta);

  const {
    usuario,
    pestanaActiva,
    estaEditando,
    setEstaEditando,
    cambiarPestana,
    navegarA,
    cerrarSesion
  } = useLogicaPerfil(usuarioMock, setSeccionActualSimulada);

  return (
    <div className="min-h-screen bg-white pt-16 pb-28 animate-in fade-in duration-500 text-left">
      {/* Barra Superior */}
      <header className="px-6 flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">
          {usuario?.username || 'mi_perfil'}
        </h2>
        <div className="flex gap-4">
          <button className="p-2 bg-gray-50 rounded-full text-gray-600 active:scale-90 transition-all">
            <Settings size={20} />
          </button>
          <button onClick={cerrarSesion} className="p-2 bg-red-50 rounded-full text-red-500 active:scale-90 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Info de Perfil */}
      <div className="px-8 flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-[40px] overflow-hidden border-4 border-gray-50 shadow-xl">
            <img 
              src={usuario?.foto} 
              className="w-full h-full object-cover" 
              alt="Perfil" 
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
            <Edit3 size={16} />
          </button>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900">{usuario?.nombre}</h1>
        <p className="text-gray-400 text-sm font-medium mt-1 mb-6 text-center max-w-[250px]">
          {usuario?.bio}
        </p>

        {/* Estadísticas */}
        <div className="flex justify-between w-full max-w-[300px] mb-8">
          <div className="text-center">
            <p className="text-lg font-black text-gray-900">124</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Siguiendo</p>
          </div>
          <div className="text-center border-x border-gray-100 px-8">
            <p className="text-lg font-black text-gray-900">45k</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-gray-900">1.2M</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Likes</p>
          </div>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex gap-3 w-full px-4">
          <button 
            onClick={() => navegarA('tienda')}
            className="flex-1 bg-gray-900 text-white py-4 rounded-[24px] font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-gray-200"
          >
            <ShoppingBag size={18} /> Mis Compras
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-t border-gray-50">
        <button 
          onClick={() => cambiarPestana('publicaciones')}
          className={`flex-1 py-4 flex justify-center transition-all ${pestanaActiva === 'publicaciones' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-300'}`}
        >
          <Grid size={24} />
        </button>
        <button 
          onClick={() => cambiarPestana('guardados')}
          className={`flex-1 py-4 flex justify-center transition-all ${pestanaActiva === 'guardados' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-300'}`}
        >
          <Bookmark size={24} />
        </button>
      </div>

      {/* Grid de Contenido (Simulado) */}
      <div className="grid grid-cols-3 gap-0.5 mt-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="aspect-square bg-gray-100 relative group overflow-hidden">
            <img 
              src={`https://picsum.photos/400/400?random=${i + 20}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="" 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">1.2k vistas</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}