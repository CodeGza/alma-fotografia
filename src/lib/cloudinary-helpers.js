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
 * Transforma una URL de Cloudinary para optimización
 * Agrega transformaciones para reducir tamaño y mejorar carga
 *
 * @param {string} url - URL original de Cloudinary
 * @param {object} options - Opciones de transformación
 * @param {number} options.width - Ancho máximo (default: 400 para thumbnails)
 * @param {string} options.quality - Calidad (default: 'auto:good')
 * @param {string} options.format - Formato (default: 'auto' para webp/avif)
 * @returns {string} URL transformada
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 400,
    quality = 'auto:good',
    format = 'auto'
  } = options;

  // Construir transformación
  const transformation = `w_${width},q_${quality},f_${format},c_limit`;

  // Insertar transformación después de /upload/
  const transformedUrl = url.replace(
    '/upload/',
    `/upload/${transformation}/`
  );

  return transformedUrl;
}

/**
 * Obtiene URL optimizada para thumbnail de galería (muy pequeño, carga rápida)
 */
export function getThumbnailUrl(url) {
  return getOptimizedImageUrl(url, {
    width: 400,
    quality: 'auto:low',
    format: 'auto'
  });
}

/**
 * Obtiene URL optimizada para preview mediano
 */
export function getPreviewUrl(url) {
  return getOptimizedImageUrl(url, {
    width: 800,
    quality: 'auto:good',
    format: 'auto'
  });
}

/**
 * Obtiene URL optimizada para vista completa (alta calidad)
 */
export function getFullUrl(url) {
  return getOptimizedImageUrl(url, {
    width: 1920,
    quality: 'auto:best',
    format: 'auto'
  });
}

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