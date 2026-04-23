import React, { useState } from 'react';

// --- IMPORTACIÓN DE MÓDULOS DE LA TIENDA ---
import { PaginaInicio } from './tienda/PaginaInicio';
import { PaginaDetalleProducto } from './tienda/PaginaDetalleProducto';
import { PaginaCarrito } from './tienda/PaginaCarrito';
import { PaginaCheckout } from './tienda/PaginaCheckout';
import { PaginaAgradecimiento } from './tienda/PaginaAgradecimiento';

// --- IMPORTACIÓN DE MÓDULOS DE MENSAJERÍA ---
import { PaginaInicioChat } from './chat/PaginaInicioChat';
import { VentanaChat } from './chat/VentanaChat';

// --- IMPORTACIÓN DE MÓDULOS SOCIALES Y USUARIO ---
import { PaginaInicioSocial } from './social/PaginaInicioSocial';
import { PaginaPerfil } from './perfil/PaginaPerfil';

// --- COMPONENTES GLOBALES ---
import { BarraNavegacion } from './components/BarraNavegacion';

/**
 * GESTOR CENTRAL APP
 * Este es el cerebro del Frontend. Se encarga de:
 * 1. Controlar la navegación (enrutamiento manual).
 * 2. Gestionar el estado global (carrito, usuario actual, selección).
 * 3. Servir como puente entre todas las páginas.
 */
const GestorCentralApp = () => {
  // Estado de navegación principal
  const [seccionActual, setSeccionActual] = useState('tienda'); 
  
  // Estados de selección (para pantallas que se superponen)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  
  // Estado de datos compartidos (El Carrito)
  const [carrito, setCarrito] = useState([]);

  // --- DATOS DE PRUEBA (MOCK DATA) ---
  const [productos] = useState([
    { id: 1, nombre: 'iPhone 15 Pro', precio: 1199, imagen: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500', categoria: 'Móviles' },
    { id: 2, nombre: 'AirPods Max', precio: 549, imagen: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=500', categoria: 'Audio' },
    { id: 3, nombre: 'MacBook Air M3', precio: 1299, imagen: 'https://images.unsplash.com/photo-1517336712461-1286c9527964?w=500', categoria: 'Laptops' }
  ]);

  const [usuario] = useState({
    username: 'cristian_dev',
    nombre: 'Cristian Rodríguez',
    bio: 'Desarrollador Fullstack & Emprendedor.',
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
  });

  // --- MOTOR DE RENDERIZADO CONDICIONAL ---
  const renderizadorDePantallas = () => {
    // NIVEL 1: Pantallas de máxima prioridad (Modales de pantalla completa)
    if (productoSeleccionado) {
      return (
        <PaginaDetalleProducto 
          producto={productoSeleccionado} 
          setProductoSeleccionado={setProductoSeleccionado} 
          carrito={carrito} 
          setCarrito={setCarrito}
          setSeccionActual={setSeccionActual}
        />
      );
    }

    if (chatSeleccionado) {
      return (
        <VentanaChat 
          chatSeleccionado={chatSeleccionado} 
          setChatSeleccionado={setChatSeleccionado} 
        />
      );
    }

    // NIVEL 2: Flujo de navegación por secciones
    switch (seccionActual) {
      // Flujo de Tienda
      case 'tienda':
        return <PaginaInicio productos={productos} setProductoSeleccionado={setProductoSeleccionado} setSeccionActual={setSeccionActual} carrito={carrito} />;
      case 'carrito':
        return <PaginaCarrito carrito={carrito} setCarrito={setCarrito} setSeccionActual={setSeccionActual} />;
      case 'checkout':
        return <PaginaCheckout carrito={carrito} setCarrito={setCarrito} setSeccionActual={setSeccionActual} />;
      case 'agradecimiento':
        return <PaginaAgradecimiento setSeccionActual={setSeccionActual} />;
      
      // Secciones Principales
      case 'social':
        return <PaginaInicioSocial publicaciones={[]} setSeccionActual={setSeccionActual} />;
      case 'mensajes':
        return <PaginaInicioChat chats={[]} setChatSeleccionado={setChatSeleccionado} />;
      case 'perfil':
        return <PaginaPerfil usuarioInicial={usuario} setSeccionActual={setSeccionActual} />;
        
      default:
        return <PaginaInicio productos={productos} setProductoSeleccionado={setProductoSeleccionado} setSeccionActual={setSeccionActual} carrito={carrito} />;
    }
  };

  return (
    <div className="flex justify-center bg-[#0f172a] min-h-screen">
      {/* Marco del dispositivo móvil */}
      <div className="w-full max-w-md bg-white min-h-screen relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col">
        
        {/* Espacio principal donde se "inyectan" las páginas */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {renderizadorDePantallas()}
        </main>

        {/* La barra de navegación se oculta en flujos críticos (como el checkout) */}
        {!productoSeleccionado && !chatSeleccionado && seccionActual !== 'checkout' && (
          <BarraNavegacion seccionActual={seccionActual} setSeccionActual={setSeccionActual} />
        )}
      </div>
    </div>
  );
};

export default GestorCentralApp;