export const useLogicaNavegacion = (seccionActual, setSeccionActual) => {
  
  // Lista de opciones de la barra
  const opciones = [
    { id: 'tienda', etiqueta: 'Tienda' },
    { id: 'social', etiqueta: 'Social' },
    { id: 'mensajes', etiqueta: 'Chats' },
    { id: 'perfil', etiqueta: 'Perfil' }
  ];

  // Función para cambiar de sección con una pequeña vibración o efecto
  const manejarCambio = (id) => {
    if (id !== seccionActual) {
      setSeccionActual(id);
      // Aquí se podría agregar una vibración táctil si fuera una App nativa
    }
  };

  return {
    opciones,
    manejarCambio
  };
};