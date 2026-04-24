/**
 * CONTROLADOR DE USUARIO
 * Gestiona la autenticación, los datos del perfil personal
 * y la configuración de la cuenta.
 */

// Simulación de Base de Datos para Usuarios
let baseDatosUsuarios = [
  {
    id: 1,
    username: 'cristian_dev',
    password: 'password123', // En un backend real, esto debe estar encriptado
    nombre: 'Cristian Rodríguez',
    bio: 'Desarrollador Fullstack & Emprendedor. Siempre aprendiendo.',
    foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    seguidores: 45000,
    siguiendo: 124,
    likesTotales: '1.2M'
  }
];

// --- FUNCIONES DEL CONTROLADOR ---

/**
 * Obtiene la información del perfil de un usuario por su ID o nombre de usuario
 */
const obtenerPerfil = (req, res) => {
  const { username } = req.params;
  const usuario = baseDatosUsuarios.find(u => u.username === username);

  if (!usuario) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  // No enviamos la contraseña al frontend por seguridad
  const { password, ...datosPublicos } = usuario;
  res.status(200).json(datosPublicos);
};

/**
 * Procesa el inicio de sesión (Login)
 */
const iniciarSesion = (req, res) => {
  const { username, password } = req.body;

  const usuario = baseDatosUsuarios.find(u => u.username === username);

  if (!usuario || usuario.password !== password) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  // En un sistema real, aquí generaríamos un JWT (Token)
  res.status(200).json({
    mensaje: "Inicio de sesión exitoso",
    usuario: {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre
    },
    token: "token-simulado-xyz-123"
  });
};

/**
 * Actualiza la información del perfil del usuario
 */
const actualizarPerfil = (req, res) => {
  const { id } = req.params;
  const { nombre, bio, foto } = req.body;

  const indice = baseDatosUsuarios.findIndex(u => u.id === parseInt(id));

  if (indice === -1) {
    return res.status(404).json({ mensaje: "Usuario no encontrado para actualizar" });
  }

  // Actualizamos solo los campos permitidos
  baseDatosUsuarios[indice] = {
    ...baseDatosUsuarios[indice],
    nombre: nombre || baseDatosUsuarios[indice].nombre,
    bio: bio || baseDatosUsuarios[indice].bio,
    foto: foto || baseDatosUsuarios[indice].foto
  };

  res.status(200).json({
    mensaje: "Perfil actualizado con éxito",
    usuario: baseDatosUsuarios[indice]
  });
};

module.exports = {
  obtenerPerfil,
  iniciarSesion,
  actualizarPerfil
};