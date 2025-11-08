import { v2 as cloudinary } from 'cloudinary';

/**
 * Configuración de Cloudinary
 * Se llama una sola vez al importar el módulo
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Obtiene el uso real de almacenamiento calculado desde los recursos
 * Es más preciso que usage() porque no tiene delay
 * 
 * @returns {Promise<{bytes: number, count: number}>}
 */
export async function getActualStorageUsage() {
  try {
    let totalBytes = 0;
    let totalCount = 0;
    let nextCursor = null;

    // Cloudinary limita a 500 recursos por request, así que paginamos
    do {
      const result = await cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor
      });

      // Sumar bytes de cada recurso
      result.resources.forEach(resource => {
        totalBytes += resource.bytes || 0;
      });

      totalCount += result.resources.length;
      nextCursor = result.next_cursor;

    } while (nextCursor); // Continuar si hay más páginas

    return {
      bytes: totalBytes,
      count: totalCount
    };
  } catch (error) {
    console.error('Error calculando storage real:', error);
    throw error;
  }
}

/**
 * Obtiene el límite del plan (25 GB para Free)
 * 
 * @returns {Promise<number>} Bytes del límite
 */
export async function getStorageLimit() {
  try {
    const usage = await cloudinary.api.usage();
    return usage.storage?.limit || (25 * 1024 * 1024 * 1024); // 25 GB default
  } catch (error) {
    console.error('Error obteniendo límite:', error);
    return 25 * 1024 * 1024 * 1024; // Fallback a 25 GB
  }
}