/**
 * AUTENTICACIÓN
 * Este archivo actúa como un filtro de seguridad (middleware).
 * Su función es verificar que el usuario tenga los permisos necesarios
 * antes de permitirle acceder a una ruta privada.
 */

const verificarIdentidad = (req, res, next) => {
  // 1. Buscamos el token de acceso en la cabecera de la petición
  // Normalmente se envía como "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  // 2. Si no hay nada en la cabecera, denegamos el acceso
  if (!authHeader) {
    return res.status(401).json({
      error: "No autorizado",
      mensaje: "No se encontró un token de seguridad. Por favor, inicia sesión."
    });
  }

  try {
    /**
     * 3. Lógica de Validación:
     * Por ahora usamos un token de prueba. 
     * En el futuro, aquí usaremos JWT (JSON Web Tokens) para validar la firma.
     */
    const token = authHeader.split(' ')[1]; // Extraemos el código después de "Bearer"

    if (token === "mi-llave-secreta-123") {
      // Si el código es correcto, añadimos la info del usuario al objeto 'req'
      // para que el controlador sepa quién está operando.
      req.usuario = {
        id: "usr_99",
        rol: "cliente"
      };

      // 'next()' es la señal para que el servidor continúe hacia el controlador
      next();
    } else {
      throw new Error("Token no válido");
    }
  } catch (error) {
    // Si el token es falso o ha expirado, devolvemos un error 403 (Prohibido)
    res.status(403).json({
      error: "Acceso Prohibido",
      mensaje: "Tu sesión ha expirado o el token de seguridad es inválido."
    });
  }
};

module.exports = {
  verificarIdentidad
};