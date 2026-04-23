import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

/**
 * LOGICA DEL COMPONENTE (Inline Hook)
 * Normalmente iría en LogicaPaginaAgradecimiento.js, 
 * pero se integra aquí para permitir la compilación.
 */
const useLogicaAgradecimiento = (setSeccionActual) => {
  const [numeroOrden, setNumeroOrden] = useState('');

  useEffect(() => {
    // Generamos un número de orden aleatorio al cargar la página
    const randomOrder = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setNumeroOrden(randomOrder);
  }, []);

  // Función para volver a la tienda y seguir comprando
  const volverALaTienda = () => {
    if (typeof setSeccionActual === 'function') {
      setSeccionActual('tienda');
    } else {
      console.log("Navegando a: tienda");
    }
  };

  // Función para ver el estado del pedido (simulado)
  const verMisPedidos = () => {
    if (typeof setSeccionActual === 'function') {
      setSeccionActual('perfil');
    } else {
      console.log("Navegando a: perfil");
    }
  };

  return {
    numeroOrden,
    volverALaTienda,
    verMisPedidos
  };
};

/**
 * VISTA DEL COMPONENTE
 */
const PaginaAgradecimiento = ({ setSeccionActual }) => {
  // Conectamos la lógica definida arriba
  const { numeroOrden, volverALaTienda, verMisPedidos } = useLogicaAgradecimiento(setSeccionActual);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 animate-in zoom-in-95 duration-700 text-center">
      {/* Icono de Éxito Animado */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-100 rounded-full scale-150 opacity-20 animate-ping"></div>
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
          <CheckCircle size={48} className="text-white" />
        </div>
      </div>

      {/* Mensaje Principal */}
      <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">¡Pedido Confirmado!</h1>
      <p className="text-gray-500 font-medium leading-relaxed mb-8">
        Gracias por tu compra. Hemos enviado los detalles de tu recibo a tu correo electrónico.
      </p>

      {/* Tarjeta de Información de Orden */}
      <div className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4 text-left">
          <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            <Package size={14} />
            ID de Orden
          </div>
          <span className="font-mono font-bold text-sm text-blue-600">{numeroOrden}</span>
        </div>
        <p className="text-[11px] text-gray-400 font-medium text-left">
          Tu paquete llegará en un estimado de <span className="text-gray-900 font-bold">2 a 4 días hábiles</span>.
        </p>
      </div>

      {/* Acciones Finales */}
      <div className="w-full space-y-4">
        <button 
          onClick={volverALaTienda}
          className="w-full bg-black text-white py-5 rounded-[28px] font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-gray-800"
        >
          <Home size={20} />
          Volver al Inicio
        </button>
        
        <button 
          onClick={verMisPedidos}
          className="w-full bg-white text-gray-900 py-5 rounded-[28px] font-black text-lg flex items-center justify-center gap-2 border border-gray-100 active:scale-95 transition-all hover:bg-gray-50"
        >
          Rastrear Pedido
          <ArrowRight size={20} className="text-gray-300" />
        </button>
      </div>

      <p className="mt-12 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
        Gracias por confiar en nosotros
      </p>
    </div>
  );
};

export default PaginaAgradecimiento;