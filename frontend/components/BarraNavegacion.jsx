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
const BarraNavegacion = ({ seccionActual = 'tienda', setSeccionActual = () => {} }) => {
  const { opciones, manejarCambio } = useLogicaNavegacion(seccionActual, setSeccionActual);
  const esVistaSocial = seccionActual === 'social';
  const tamanoIcono = 18;
  const clasesContenedor = 'w-full max-w-md flex justify-around items-center pointer-events-auto rounded-none py-1';
  const clasesBoton = 'flex flex-col items-center relative gap-0.5 py-1 px-2.5 transition-all duration-300 active:scale-75 outline-none';
  const clasesEtiqueta = 'font-black uppercase tracking-tight leading-none transition-colors text-[8px]';

  // Genera el icono correspondiente según el estado activo
  const obtenerIcono = (id, activo) => {
    const color = activo ? '#2563eb' : '#9ca3af'; 
    const size = tamanoIcono;

    switch (id) {
      case 'tienda': return <ShoppingBag size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      case 'social': return <PlayCircle size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      case 'mensajes': return <MessageCircle size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      case 'perfil': return <User size={size} color={color} fill={activo ? '#dbeafe' : 'none'} />;
      default: return null;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pb-0 px-0 pointer-events-none">
      <div className={`${clasesContenedor} ${esVistaSocial ? 'bg-black border-t border-white/10 shadow-[0_-12px_30px_-18px_rgba(0,0,0,0.95)]' : 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]'}`}>
        {opciones.map((opcion) => {
          const activo = seccionActual === opcion.id;
          
          return (
            <button
              key={opcion.id}
              onClick={() => manejarCambio(opcion.id)}
              className={clasesBoton}
            >
              {/* Punto indicador superior animado */}
              {activo && (
                <div className={`absolute -top-0.5 w-1 h-1 rounded-full animate-bounce ${esVistaSocial ? 'bg-white' : 'bg-blue-600'}`} />
              )}
              
              {/* Icono con transición de posición */}
              <div className={`transition-transform duration-300 ${activo ? '-translate-y-1' : ''}`}>
                {obtenerIcono(opcion.id, activo)}
              </div>

              {/* Etiqueta de la sección */}
              <span className={`${clasesEtiqueta} ${activo ? (esVistaSocial ? 'text-white' : 'text-blue-600') : (esVistaSocial ? 'text-white/45' : 'text-gray-400')}`}>
                {opcion.etiqueta}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BarraNavegacion;