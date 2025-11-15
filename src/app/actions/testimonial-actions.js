'use server';

import { createClient } from '@/lib/server';

/**
 * ============================================
 * SERVER ACTIONS - TESTIMONIOS DE GALERÍA
 * ============================================
 *
 * Acciones para que los clientes dejen testimonios/comentarios
 * sobre las galerías compartidas.
 */

/**
 * Crear un nuevo testimonio
 *
 * @param {Object} params
 * @param {string} params.galleryId - ID de la galería
 * @param {string} params.clientName - Nombre del cliente
 * @param {string} params.message - Mensaje/testimonio
 * @param {number} [params.rating] - Calificación 1-5 (opcional)
 * @returns {Promise<{success: boolean, testimonial?: object, error?: string}>}
 */
export async function createTestimonial({ galleryId, clientName, message, rating = null }) {
  try {
    // Validaciones
    if (!galleryId || !clientName || !message) {
      return {
        success: false,
        error: 'Todos los campos son requeridos',
      };
    }

    if (clientName.trim().length < 2) {
      return {
        success: false,
        error: 'El nombre debe tener al menos 2 caracteres',
      };
    }

    if (message.trim().length < 10) {
      return {
        success: false,
        error: 'El mensaje debe tener al menos 10 caracteres',
      };
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      return {
        success: false,
        error: 'La calificación debe ser entre 1 y 5',
      };
    }

    const supabase = await createClient();

    // Verificar que la galería existe y permite comentarios
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, allow_comments')
      .eq('id', galleryId)
      .single();

    if (galleryError || !gallery) {
      return {
        success: false,
        error: 'Galería no encontrada',
      };
    }

    if (!gallery.allow_comments) {
      return {
        success: false,
        error: 'Esta galería no permite comentarios',
      };
    }

    // Crear testimonio
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        gallery_id: galleryId,
        client_name: clientName.trim(),
        message: message.trim(),
        rating: rating,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      testimonial: data,
    };
  } catch (error) {
    console.error('[createTestimonial] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener testimonios de una galería
 *
 * @param {string} galleryId - ID de la galería
 * @returns {Promise<{success: boolean, testimonials?: array, error?: string}>}
 */
export async function getGalleryTestimonials(galleryId) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('testimonials')
      .select('id, client_name, message, rating, created_at')
      .eq('gallery_id', galleryId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      testimonials: data || [],
    };
  } catch (error) {
    console.error('[getGalleryTestimonials] Error:', error);
    return { success: false, error: error.message };
  }
}
