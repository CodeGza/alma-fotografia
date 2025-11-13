import { createClient } from '@/lib/server';

/**
 * create-notification.js
 * 
 * Helper para crear notificaciones desde server actions.
 * Separado de la lógica de UI para mantener arquitectura limpia.
 */

/**
 * Crear notificación genérica
 * 
 * @param {Object} params
 * @param {string} params.userId - UUID del usuario
 * @param {string} params.type - Tipo de notificación
 * @param {string} params.message - Mensaje a mostrar
 * @param {string} [params.galleryId] - ID de galería (opcional)
 * @param {string} [params.shareId] - ID de share (opcional)
 * @param {string} [params.actionUrl] - URL de acción (opcional)
 * 
 * @returns {Promise<{success: boolean, notification?: object, error?: string}>}
 */
export async function createNotification({
  userId,
  type,
  message,
  galleryId = null,
  shareId = null,
  actionUrl = null,
}) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        message,
        gallery_id: galleryId,
        share_id: shareId,
        action_url: actionUrl,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, notification: data };
  } catch (error) {
    console.error('[createNotification] Error:', error);
    return { success: false, error: error.message };
  }
}