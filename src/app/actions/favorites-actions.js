'use server';

import { createClient } from '@/lib/server';
import { notifyFavoritesSelected } from '@/lib/notifications/notification-helpers';

/**
 * ============================================
 * SERVER ACTIONS - FAVORITOS DE GALERÍA
 * ============================================
 *
 * Acciones para que los clientes seleccionen fotos favoritas
 * desde la vista pública de galerías compartidas.
 */

/**
 * Obtener favoritos de un cliente para una galería
 *
 * @param {string} galleryId - ID de la galería
 * @param {string} clientEmail - Email del cliente
 * @returns {Promise<{success: boolean, favorites?: array, count?: number, error?: string}>}
 */
export async function getClientFavorites(galleryId, clientEmail) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('favorites')
      .select('id, photo_id, created_at')
      .eq('gallery_id', galleryId)
      .eq('client_email', clientEmail.toLowerCase().trim());

    if (error) throw error;

    return {
      success: true,
      favorites: data || [],
      count: data?.length || 0,
    };
  } catch (error) {
    console.error('[getClientFavorites] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle favorito (agregar o quitar)
 *
 * @param {string} galleryId - ID de la galería
 * @param {string} photoId - ID de la foto
 * @param {string} clientEmail - Email del cliente
 * @param {number} maxFavorites - Límite de favoritos para esta galería
 * @returns {Promise<{success: boolean, action?: string, error?: string}>}
 */
export async function toggleFavorite(galleryId, photoId, clientEmail, maxFavorites = 150) {
  try {
    const supabase = await createClient();
    const normalizedEmail = clientEmail.toLowerCase().trim();

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('gallery_id', galleryId)
      .eq('photo_id', photoId)
      .eq('client_email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      // Quitar de favoritos
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      return { success: true, action: 'removed' };
    } else {
      // Verificar límite antes de agregar
      const { data: currentFavorites, error: countError } = await supabase
        .from('favorites')
        .select('id', { count: 'exact' })
        .eq('gallery_id', galleryId)
        .eq('client_email', normalizedEmail);

      if (countError) throw countError;

      if (currentFavorites.length >= maxFavorites) {
        return {
          success: false,
          error: `Has alcanzado el límite de ${maxFavorites} fotos favoritas`,
        };
      }

      // Agregar a favoritos
      const { error } = await supabase
        .from('favorites')
        .insert({
          gallery_id: galleryId,
          photo_id: photoId,
          client_email: normalizedEmail,
        });

      if (error) throw error;

      return { success: true, action: 'added' };
    }
  } catch (error) {
    console.error('[toggleFavorite] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar selección completa de favoritos
 * (notifica al fotógrafo)
 *
 * @param {string} galleryId - ID de la galería
 * @param {string} clientEmail - Email del cliente
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function submitFavoritesSelection(galleryId, clientEmail) {
  try {
    const supabase = await createClient();
    const normalizedEmail = clientEmail.toLowerCase().trim();

    // Obtener cantidad de favoritos
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('id', { count: 'exact' })
      .eq('gallery_id', galleryId)
      .eq('client_email', normalizedEmail);

    if (favError) throw favError;

    const favoritesCount = favorites.length;

    if (favoritesCount === 0) {
      return {
        success: false,
        error: 'No has seleccionado ninguna foto favorita',
      };
    }

    // Obtener datos de la galería
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, title, created_by, client_email, notify_on_favorites')
      .eq('id', galleryId)
      .single();

    if (galleryError) throw galleryError;

    // Enviar notificación solo si está habilitada
    if (gallery.notify_on_favorites) {
      await notifyFavoritesSelected(galleryId, favoritesCount);
    }

    return {
      success: true,
      count: favoritesCount,
    };
  } catch (error) {
    console.error('[submitFavoritesSelection] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Limpiar favoritos de un cliente (reiniciar selección)
 *
 * @param {string} galleryId - ID de la galería
 * @param {string} clientEmail - Email del cliente
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function clearClientFavorites(galleryId, clientEmail) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('gallery_id', galleryId)
      .eq('client_email', clientEmail.toLowerCase().trim());

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[clearClientFavorites] Error:', error);
    return { success: false, error: error.message };
  }
}
