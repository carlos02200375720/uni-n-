import { useState, useRef } from 'react';

export const useLogicaSocial = (publicacionesIniciales) => {
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);
  const [indiceActual, setIndiceActual] = useState(0);

  // Función para dar o quitar Like a una publicación específica
  const darLike = (id) => {
    setPublicaciones(prev => prev.map(pub => {
      if (pub.id === id) {
        const yaTieneLike = pub.usuarioDioLike;
        return {
          ...pub,
          likes: yaTieneLike ? pub.likes - 1 : pub.likes + 1,
          usuarioDioLike: !yaTieneLike
        };
      }
      return pub;
    }));
  };

  // Función para detectar cuál video está en pantalla (Snap Scroll)
  const manejarScroll = (e) => {
    const height = e.target.clientHeight;
    const nuevoIndice = Math.round(e.target.scrollTop / height);
    if (nuevoIndice !== indiceActual) {
      setIndiceActual(nuevoIndice);
    }
  };

  const compartirPublicacion = (pub) => {
    console.log("Compartiendo contenido de:", pub.usuario);
    // Aquí iría la lógica de Web Share API
  };

  return {
    publicaciones,
    indiceActual,
    darLike,
    manejarScroll,
    compartirPublicacion
  };
};