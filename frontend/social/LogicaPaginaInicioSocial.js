import { useEffect, useState } from 'react';

export const useLogicaSocial = (publicacionesIniciales, manejarLikeExterno) => {
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    setPublicaciones(Array.isArray(publicacionesIniciales) ? publicacionesIniciales : []);
  }, [publicacionesIniciales]);

  // Función para dar o quitar Like a una publicación específica
  const darLike = async (id) => {
    const publicacionActual = publicaciones.find((pub) => pub.id === id);

    setPublicaciones((prev) => prev.map((pub) => {
      if (pub.id !== id) {
        return pub;
      }

      const yaTieneLike = pub.usuarioDioLike;
      return {
        ...pub,
        likes: yaTieneLike ? pub.likes - 1 : pub.likes + 1,
        usuarioDioLike: !yaTieneLike
      };
    }));

    if (typeof manejarLikeExterno === 'function') {
      const publicacionActualizada = await manejarLikeExterno(id);

      if (publicacionActualizada) {
        setPublicaciones((prev) => prev.map((pub) => pub.id === publicacionActualizada.id ? publicacionActualizada : pub));
      } else if (publicacionActual) {
        setPublicaciones((prev) => prev.map((pub) => pub.id === publicacionActual.id ? publicacionActual : pub));
      }
    }
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