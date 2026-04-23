import { useState } from 'react';

export const useLogicaPerfil = (usuarioInicial, setSeccionActual) => {
  const [usuario, setUsuario] = useState(usuarioInicial);
  const [pestanaActiva, setPestanaActiva] = useState('publicaciones');
  const [estaEditando, setEstaEditando] = useState(false);

  // Función para alternar entre ver videos o pedidos
  const cambiarPestana = (pestana) => {
    setPestanaActiva(pestana);
  };

  // Función para guardar cambios en el perfil
  const guardarPerfil = (nuevosDatos) => {
    setUsuario({ ...usuario, ...nuevosDatos });
    setEstaEditando(false);
  };

  // Función para ir a una sección específica
  const navegarA = (ruta) => {
    setSeccionActual(ruta);
  };

  const cerrarSesion = () => {
    console.log("Cerrando sesión del usuario...");
    // Aquí iría la lógica de borrar tokens y redirigir al Login
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