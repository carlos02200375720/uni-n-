// Ejemplo de uso de Cloudinary para subir una imagen
const cloudinary = require('../configuracion/cloudinary');
const path = require('path');

/**
 * Sube una imagen a Cloudinary
 * @param {string} filePath Ruta local de la imagen
 * @param {string} carpeta Carpeta en Cloudinary (opcional)
 * @returns {Promise<object>} Información de la imagen subida
 */
async function subirImagenACloudinary(filePath, carpeta = 'imagenes_app') {
  try {
    const resultado = await cloudinary.uploader.upload(filePath, {
      folder: carpeta,
      resource_type: 'auto', // Permite imágenes y videos
    });
    return resultado;
  } catch (error) {
    throw error;
  }
}

/**
 * Sube un video a Cloudinary
 * @param {string} filePath Ruta local del video
 * @param {string} carpeta Carpeta en Cloudinary (opcional)
 * @returns {Promise<object>} Información del video subido
 */
async function subirVideoACloudinary(filePath, carpeta = 'videos_app') {
  try {
    const resultado = await cloudinary.uploader.upload(filePath, {
      folder: carpeta,
      resource_type: 'video',
    });
    return resultado;
  } catch (error) {
    throw error;
  }
}

module.exports = { subirImagenACloudinary, subirVideoACloudinary };
