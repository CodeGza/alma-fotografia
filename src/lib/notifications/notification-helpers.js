import { createClient } from '@/lib/supabase/server';
import { createNotification } from './create-notification';

/**
 * notification-helpers.js
 * 
 * Funciones helper para crear notificaciones específicas.
 * Cada función encapsula la lógica de obtener datos y crear la notificación.
 */

/**
 * Notificar enlace expirado
 * 
 * Llamar cuando un enlace se desactiva por vencimiento.
 * 
 * @param {string} shareId - ID del share expirado
 */
export async function notifyLinkExpired(shareId) {
  try {
    const supabase = await createClient();

    const { data: share, error } = await supabase
      .from('gallery_shares')
      .select(`
        id,
        gallery_id,
        galleries (
          id,
          title,
          user_id
        )
      `)
      .eq('id', shareId)
      .single();

    if (error || !share) {
      console.error('[notifyLinkExpired] Share not found:', shareId);
      return { success: false, error: 'Share not found' };
    }

    const gallery = share.galleries;

    return await createNotification({
      userId: gallery.user_id,
      type: 'link_expired',
      message: `El enlace de "${gallery.title}" ha expirado. Genera uno nuevo para compartir.`,
      galleryId: gallery.id,
      shareId: share.id,
      actionUrl: `/dashboard/galerias/${gallery.id}`,
    });
  } catch (error) {
    console.error('[notifyLinkExpired] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notificar enlace desactivado manualmente
 * 
 * @param {string} shareId - ID del share desactivado
 * @param {string} userId - ID del usuario que desactivó
 */
export async function notifyLinkDeactivated(shareId, userId) {
  try {
    const supabase = await createClient();

    const { data: share, error } = await supabase
      .from('gallery_shares')
      .select(`
        id,
        gallery_id,
        galleries (
          id,
          title
        )
      `)
      .eq('id', shareId)
      .single();

    if (error || !share) {
      console.error('[notifyLinkDeactivated] Share not found:', shareId);
      return { success: false, error: 'Share not found' };
    }

    const gallery = share.galleries;

    return await createNotification({
      userId,
      type: 'link_deactivated',
      message: `Desactivaste el enlace de "${gallery.title}". Los clientes ya no podrán acceder.`,
      galleryId: gallery.id,
      shareId: share.id,
      actionUrl: `/dashboard/galerias/${gallery.id}`,
    });
  } catch (error) {
    console.error('[notifyLinkDeactivated] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notificar galería archivada
 * 
 * @param {string} galleryId - ID de la galería archivada
 * @param {string} userId - ID del usuario dueño
 */
export async function notifyGalleryArchived(galleryId, userId) {
  try {
    const supabase = await createClient();

    const { data: gallery, error } = await supabase
      .from('galleries')
      .select('id, title')
      .eq('id', galleryId)
      .single();

    if (error || !gallery) {
      console.error('[notifyGalleryArchived] Gallery not found:', galleryId);
      return { success: false, error: 'Gallery not found' };
    }

    return await createNotification({
      userId,
      type: 'gallery_archived',
      message: `La galería "${gallery.title}" ha sido archivada. Los enlaces compartidos se desactivaron automáticamente.`,
      galleryId: gallery.id,
      actionUrl: '/dashboard/galerias?archive=true',
    });
  } catch (error) {
    console.error('[notifyGalleryArchived] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notificar galería eliminada
 * 
 * @param {string} galleryTitle - Título de la galería eliminada
 * @param {string} userId - ID del usuario dueño
 */
export async function notifyGalleryDeleted(galleryTitle, userId) {
  try {
    return await createNotification({
      userId,
      type: 'gallery_deleted',
      message: `La galería "${galleryTitle}" ha sido eliminada permanentemente junto con todas sus fotos.`,
      actionUrl: '/dashboard/galerias',
    });
  } catch (error) {
    console.error('[notifyGalleryDeleted] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * CRON JOB: Notificar enlaces que expiran pronto
 * 
 * Ejecutar diariamente a las 8 AM.
 * Llama a la función SQL que hace el trabajo pesado.
 */
export async function notifyExpiringLinks() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('notify_expiring_links');

    if (error) throw error;

    console.log(`[notifyExpiringLinks] Notificados ${data} enlaces que expiran pronto`);

    return { success: true, notified: data };
  } catch (error) {
    console.error('[notifyExpiringLinks] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * CRON JOB: Limpiar notificaciones antiguas
 * 
 * Ejecutar semanalmente.
 * Elimina notificaciones leídas mayores a 30 días.
 */
export async function cleanupOldNotifications() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('cleanup_old_notifications');

    if (error) throw error;

    console.log(`[cleanupOldNotifications] Eliminadas ${data} notificaciones antiguas`);

    return { success: true, deleted: data };
  } catch (error) {
    console.error('[cleanupOldNotifications] Error:', error);
    return { success: false, error: error.message };
  }
}