import React, { useState } from 'react';
import { ArrowLeft, Lock, Truck, CreditCard, ShieldCheck } from 'lucide-react';

// --- LÓGICA INTEGRADA (Anteriormente en LogicaPaginaCheckout.js) ---
const useLogicaCheckout = (carrito, setCarrito, setSeccionActual) => {
  const [paso, setPaso] = useState('envio');
  const [procesando, setProcesando] = useState(false);

  const [datos, setDatos] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    zip: '',
    titular: '',
    tarjeta: '',
    exp: '',
    cvv: ''
  });

  const subtotal = carrito ? carrito.reduce((acc, p) => acc + (p.precio || 0), 0) : 0;
  const total = subtotal + (subtotal > 1000 ? 0 : 15) + (subtotal * 0.18);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const irAPago = (e) => {
    e.preventDefault();
    setPaso('pago');
  };

  const finalizarCompra = async (e) => {
    e.preventDefault();
    setProcesando(true);

    // Simulación de procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2500));

    setProcesando(false);
    if (setCarrito) setCarrito([]); 
    setSeccionActual('agradecimiento');
  };

  const volverAtras = () => {
    if (paso === 'pago') setPaso('envio');
    else setSeccionActual('carrito');
  };

  return {
    paso,
    datos,
    procesando,
    total,
    manejarCambio,
    irAPago,
    finalizarCompra,
    volverAtras
  };
};

// --- VISTA COMPONENTE ---
export default function App({ carrito = [], setCarrito, setSeccionActual }) {
  const {
    paso,
    datos,
    procesando,
    total,
    manejarCambio,
    irAPago,
    finalizarCompra,
    volverAtras
  } = useLogicaCheckout(carrito, setCarrito, setSeccionActual);

  return (
    <div className="min-h-screen bg-white pt-14 pb-10 px-6 text-left">
      {/* Cabecera dinámica */}
      <header className="flex items-center gap-4 mb-8">
        <button onClick={volverAtras} className="p-2.5 bg-gray-50 rounded-full text-gray-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900">
          {paso === 'envio' ? 'Datos de Entrega' : 'Detalles de Pago'}
        </h1>
        {paso === 'pago' && <Lock size={18} className="ml-auto text-green-600" />}
      </header>

      {/* Indicador de progreso */}
      <div className="flex gap-2 mb-8">
        <div className={`h-1.5 flex-1 rounded-full ${paso === 'envio' || paso === 'pago' ? 'bg-black' : 'bg-gray-100'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${paso === 'pago' ? 'bg-black' : 'bg-gray-100'}`} />
      </div>

      {paso === 'envio' ? (
        <form onSubmit={irAPago} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3 mb-4 text-blue-700">
            <Truck size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Envío Estándar Garantizado</span>
          </div>
          
          <input required name="nombre" value={datos.nombre} onChange={manejarCambio} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-gray-200" placeholder="Nombre completo" />
          <input required name="direccion" value={datos.direccion} onChange={manejarCambio} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-gray-200" placeholder="Dirección de calle" />
          <div className="flex gap-4">
            <input required name="ciudad" value={datos.ciudad} onChange={manejarCambio} className="flex-[2] bg-gray-50 p-4 rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-gray-200" placeholder="Ciudad" />
            <input required name="zip" value={datos.zip} onChange={manejarCambio} className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-gray-200" placeholder="ZIP" />
          </div>

          <button type="submit" className="w-full bg-black text-white py-5 rounded-[28px] font-black text-lg mt-8 shadow-xl active:scale-95 transition-all">
            Continuar al pago
          </button>
        </form>
      ) : (
        <form onSubmit={finalizarCompra} className="space-y-4">
          {/* Tarjeta Visual */}
          <div className="mb-8 bg-gradient-to-br from-gray-900 to-black p-6 rounded-[28px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
            <CreditCard className="mb-10 opacity-50" size={32} />
            <p className="text-xl tracking-[0.25em] mb-10 font-mono">
              {datos.tarjeta ? datos.tarjeta.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between uppercase">
              <div><p className="text-[8px] opacity-50">Titular</p><p className="text-xs font-bold">{datos.titular || 'Nombre'}</p></div>
              <div><p className="text-[8px] opacity-50">Expira</p><p className="text-xs font-bold">{datos.exp || 'MM/AA'}</p></div>
            </div>
          </div>

          <input required name="titular" value={datos.titular} onChange={manejarCambio} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-gray-200" placeholder="Nombre en la tarjeta" />
          <input required name="tarjeta" maxLength="16" value={datos.tarjeta} onChange={manejarCambio} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-mono text-sm border border-transparent focus:border-gray-200" placeholder="Número de tarjeta" />
          <div className="flex gap-4">
            <input required name="exp" maxLength="5" value={datos.exp} onChange={manejarCambio} className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-gray-200" placeholder="MM/AA" />
            <input required name="cvv" maxLength="3" value={datos.cvv} onChange={manejarCambio} className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none font-medium text-sm border border-transparent focus:border-gray-200" placeholder="CVV" />
          </div>

          <div className="pt-6 flex items-center justify-center gap-2 text-gray-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Pago encriptado de 256 bits</span>
          </div>

          <button 
            type="submit" 
            disabled={procesando}
            className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-lg mt-4 shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400"
          >
            {procesando ? "Procesando..." : `Pagar $${total.toFixed(2)}`}
          </button>
        </form>
      )}
    </div>
  );
}