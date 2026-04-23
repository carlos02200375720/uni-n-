import React from 'react';
import { ShoppingBag, PlayCircle, MessageCircle, User } from 'lucide-react';

/**
 * Lógica interna de navegación integrada para evitar errores de importación local.
 */
const useLogicaNavegacion = (seccionActual, setSeccionActual) => {
  const opciones = [
    { id: 'tienda', etiqueta: 'Tienda' },
    { id: 'social', etiqueta: 'Social' },
    { id: 'mensajes', etiqueta: 'Chats' },
    { id: 'perfil', etiqueta: 'Perfil' }
  ];

  const manejarCambio = (id) => {
    if (id !== seccionActual) {
      setSeccionActual(id);
    }
  };

  return {
    opciones,
    manejarCambio
  };
};

/**
 * Componente principal de la Barra de Navegación Inferior.
 * Todas las funciones y estilos están contenidos en este archivo para garantizar la compilación.
 */
export default function App({ seccionActual = 'tienda', setSeccionActual = () => {} }) {
  const { opciones, manejarCambio } = useLogicaNavegacion(seccionActual, setSeccionActual);

  // Genera el icono correspondiente según el estado activo
  const obtenerIcono = (id, activo) => {
    const color = activo ? '#2563eb' : '#9ca3af'; 
    const size = 24;

    switch (id) {
      case 'tienda': return <ShoppingBag size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      case 'social': return <PlayCircle size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      case 'mensajes': return <MessageCircle size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      case 'perfil': return <User size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      default: return null;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pb-6 px-6 pointer-events-none">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-[32px] flex justify-around items-center py-3 pointer-events-auto">
        {opciones.map((opcion) => {
          const activo = seccionActual === opcion.id;
          
          return (
            <button
              key={opcion.id}
              onClick={() => manejarCambio(opcion.id)}
              className="flex flex-col items-center gap-1 relative py-2 px-4 transition-all duration-300 active:scale-75 outline-none"
            >
              {/* Punto indicador superior animado */}
              {activo && (
                <div className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full animate-bounce" />
              )}
              
              {/* Icono con transición de posición */}
              <div className={`transition-transform duration-300 ${activo ? '-translate-y-1' : ''}`}>
                {obtenerIcono(opcion.id, activo)}
              </div>

              {/* Etiqueta de la sección */}
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${activo ? 'text-blue-600' : 'text-gray-400'}`}>
                {opcion.etiqueta}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}