import { v2 as cloudinary } from 'cloudinary';

/**
 * Configuración de Cloudinary
 * 
 * Por qué Cloudinary:
 * - 25GB gratis (vs 1GB Supabase)
 * - Optimización automática mejor que manual
 * - CDN global incluido
 * - Soporte de videos
 * 
 * Uso híbrido:
 * - Cloudinary: portadas de galerías + videos
 * - Supabase: fotos múltiples de galerías
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube imagen a Cloudinary con optimización automática
 * 
 * @param {File|Buffer|string} file - Archivo a subir
 * @param {Object} options - Opciones de subida
 * @returns {Promise<Object>} - Resultado con URL pública
 */
/**
 * Sube imagen a Cloudinary con optimización inteligente
 * 
 * Estrategia:
 * - Guarda la imagen ORIGINAL sin transformaciones destructivas
 * - Cloudinary genera versiones optimizadas on-the-fly según necesidad
 * - Para descargas, siempre disponible la versión original
 * 
 * @param {File|Buffer|string} file - Archivo a subir
 * @param {Object} options - Opciones de subida
 * @returns {Promise<Object>} - Resultado con URL pública
 */
/**
 * Sube imagen a Cloudinary SIN transformaciones destructivas
 * 
 * Estrategia:
 * - Guardar ORIGINAL sin compresión
 * - Formato original preservado (JPG sigue siendo JPG)
 * - Solo aplicar transformaciones via URL cuando se necesiten
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'alma-fotografia',
      resource_type: options.resourceType || 'image',

      // SIN transformaciones - guardamos el original
      // Esto asegura máxima calidad

      ...options,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Elimina imagen de Cloudinary
 * 
 * @param {string} publicId - ID público de Cloudinary
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result,
    };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default cloudinary;