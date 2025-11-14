import { createClient } from '@/lib/server';
import { createNotification } from './create-notification';
import { sendEmail } from '@/lib/email/resend-client';
import { getEmailTemplate } from '@/lib/email/email-templates';

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
          created_by
        )
      `)
      .eq('id', shareId)
      .single();

    if (error || !share) {
      console.error('[notifyLinkExpired] Share not found:', shareId);
      return { success: false, error: 'Share not found' };
    }

    const gallery = share.galleries;

    const result = await createNotification({
      userId: gallery.created_by,
      type: 'link_expired',
      message: `El enlace de "${gallery.title}" ha expirado. Genera uno nuevo para compartir.`,
      galleryId: gallery.id,
      shareId: share.id,
      actionUrl: `/dashboard/galerias/${gallery.id}`,
    });

    // Enviar email si está habilitado
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('notification_email, email_on_link_expired')
      .eq('user_id', gallery.created_by)
      .maybeSingle();

    if (prefs && prefs.email_on_link_expired && prefs.notification_email) {
      console.log('📧 [notifyLinkExpired] Enviando email a:', prefs.notification_email);

      const emailTemplate = getEmailTemplate('link_expired', {
        galleryTitle: gallery.title,
        galleryUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/galerias/${gallery.id}`,
      });

      if (emailTemplate) {
        const emailResult = await sendEmail({
          to: prefs.notification_email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log('📧 [notifyLinkExpired] Email resultado:', emailResult);
      }
    }

    return result;
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

    const result = await createNotification({
      userId,
      type: 'link_deactivated',
      message: `Desactivaste el enlace de "${gallery.title}". Los clientes ya no podrán acceder.`,
      galleryId: gallery.id,
      shareId: share.id,
      actionUrl: `/dashboard/galerias/${gallery.id}`,
    });

    // Enviar email si está habilitado
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('notification_email, email_on_link_deactivated')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefs && prefs.email_on_link_deactivated && prefs.notification_email) {
      console.log('📧 [notifyLinkDeactivated] Enviando email a:', prefs.notification_email);

      const emailTemplate = getEmailTemplate('link_deactivated', {
        galleryTitle: gallery.title,
        galleryUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/galerias/${gallery.id}`,
      });

      if (emailTemplate) {
        const emailResult = await sendEmail({
          to: prefs.notification_email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log('📧 [notifyLinkDeactivated] Email resultado:', emailResult);
      }
    }

    return result;
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

    const result = await createNotification({
      userId,
      type: 'gallery_archived',
      message: `La galería "${gallery.title}" ha sido archivada. Los enlaces compartidos se desactivaron automáticamente.`,
      galleryId: gallery.id,
      actionUrl: '/dashboard/galerias?archive=true',
    });

    // Enviar email si está habilitado
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('notification_email, email_on_gallery_archived')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefs && prefs.email_on_gallery_archived && prefs.notification_email) {
      console.log('📧 [notifyGalleryArchived] Enviando email a:', prefs.notification_email);

      const emailTemplate = getEmailTemplate('gallery_archived', {
        galleryTitle: gallery.title,
      });

      if (emailTemplate) {
        const emailResult = await sendEmail({
          to: prefs.notification_email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log('📧 [notifyGalleryArchived] Email resultado:', emailResult);
      }
    }

    return result;
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
    const supabase = await createClient();

    const result = await createNotification({
      userId,
      type: 'gallery_deleted',
      message: `La galería "${galleryTitle}" ha sido eliminada permanentemente junto con todas sus fotos.`,
      actionUrl: '/dashboard/galerias',
    });

    // Enviar email si está habilitado
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('notification_email, email_on_gallery_deleted')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefs && prefs.email_on_gallery_deleted && prefs.notification_email) {
      console.log('📧 [notifyGalleryDeleted] Enviando email a:', prefs.notification_email);

      const emailTemplate = getEmailTemplate('gallery_deleted', {
        galleryTitle,
      });

      if (emailTemplate) {
        const emailResult = await sendEmail({
          to: prefs.notification_email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log('📧 [notifyGalleryDeleted] Email resultado:', emailResult);
      }
    }

    return result;
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

/**
 * Notificar cuando un cliente ve una galería
 *
 * @param {string} galleryId - ID de la galería vista
 * @param {string} clientInfo - Info del cliente (IP, navegador, etc.) - opcional
 */
export async function notifyGalleryView(galleryId, clientInfo = null) {
  try {
    console.log('🔍 [notifyGalleryView] Buscando galería:', galleryId);
    const supabase = await createClient();

    const { data: gallery, error } = await supabase
      .from('galleries')
      .select('id, title, created_by, client_email')
      .eq('id', galleryId)
      .single();

    if (error || !gallery) {
      console.error('❌ [notifyGalleryView] Gallery not found:', galleryId, error);
      return { success: false, error: 'Gallery not found' };
    }

    console.log('✅ [notifyGalleryView] Galería encontrada:', gallery.title, 'User:', gallery.created_by);

    // Verificar si el usuario tiene habilitadas las notificaciones de vistas
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('inapp_enabled, email_on_gallery_view, notification_email')
      .eq('user_id', gallery.created_by)
      .maybeSingle();

    console.log('⚙️ [notifyGalleryView] Preferencias:', prefs, 'Error:', prefsError);

    // Si no tiene preferencias, crear con defaults
    if (!prefs) {
      console.log('📝 [notifyGalleryView] No hay preferencias, creando defaults...');
      const { error: insertError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: gallery.created_by,
          inapp_enabled: true,
          email_on_gallery_view: false,
          email_on_favorites: false,
          email_on_link_expiring: true,
          email_on_link_expired: true,
          email_on_new_gallery: false,
        });

      if (insertError) {
        console.error('❌ [notifyGalleryView] Error creando preferencias:', insertError);
      }
    }

    // Si tiene deshabilitadas las notificaciones in-app, no crear
    if (prefs && !prefs.inapp_enabled) {
      console.log('⏭️ [notifyGalleryView] Notificaciones in-app deshabilitadas');
      return { success: true, skipped: 'Notifications disabled' };
    }

    const clientName = gallery.client_email ? gallery.client_email.split('@')[0] : 'Un cliente';
    const message = `${clientName} acaba de ver la galería "${gallery.title}"`;

    console.log('💬 [notifyGalleryView] Creando notificación:', message);

    const result = await createNotification({
      userId: gallery.created_by,
      type: 'gallery_view',
      message,
      galleryId: gallery.id,
      actionUrl: `/dashboard/galerias/${gallery.id}`,
    });

    console.log('🎉 [notifyGalleryView] Notificación creada:', result);

    // Enviar email si está habilitado
    console.log('📧 [notifyGalleryView] Verificando envío de email...');
    console.log('  - Preferencias:', prefs);
    console.log('  - email_on_gallery_view:', prefs?.email_on_gallery_view);
    console.log('  - notification_email:', prefs?.notification_email);

    if (prefs && prefs.email_on_gallery_view && prefs.notification_email) {
      console.log('📧 [notifyGalleryView] ✅ Enviando email a:', prefs.notification_email);

      const emailTemplate = getEmailTemplate('gallery_view', {
        galleryTitle: gallery.title,
        galleryUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/galerias/${gallery.id}`,
        clientName,
      });

      if (emailTemplate) {
        const emailResult = await sendEmail({
          to: prefs.notification_email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log('📧 [notifyGalleryView] Email resultado:', emailResult);
      } else {
        console.log('❌ [notifyGalleryView] No se pudo generar el template de email');
      }
    } else {
      console.log('⏭️ [notifyGalleryView] Email no enviado porque:');
      if (!prefs) console.log('  - No hay preferencias');
      if (prefs && !prefs.email_on_gallery_view) console.log('  - email_on_gallery_view está desactivado');
      if (prefs && !prefs.notification_email) console.log('  - notification_email no está configurado');
    }

    return result;
  } catch (error) {
    console.error('💥 [notifyGalleryView] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notificar cuando un cliente selecciona favoritos
 *
 * @param {string} galleryId - ID de la galería
 * @param {number} favoritesCount - Cantidad de favoritos seleccionados
 */
export async function notifyFavoritesSelected(galleryId, favoritesCount) {
  try {
    const supabase = await createClient();

    const { data: gallery, error } = await supabase
      .from('galleries')
      .select('id, title, created_by, client_email')
      .eq('id', galleryId)
      .single();

    if (error || !gallery) {
      console.error('[notifyFavoritesSelected] Gallery not found:', galleryId);
      return { success: false, error: 'Gallery not found' };
    }

    // Verificar preferencias
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('inapp_enabled, email_on_favorites, notification_email')
      .eq('user_id', gallery.created_by)
      .maybeSingle();

    if (!prefs || !prefs.inapp_enabled) {
      return { success: true, skipped: 'Notifications disabled' };
    }

    const clientName = gallery.client_email ? gallery.client_email.split('@')[0] : 'El cliente';
    const message = `${clientName} seleccionó ${favoritesCount} foto${favoritesCount > 1 ? 's' : ''} favorita${favoritesCount > 1 ? 's' : ''} en "${gallery.title}"`;

    const result = await createNotification({
      userId: gallery.created_by,
      type: 'favorites_selected',
      message,
      galleryId: gallery.id,
      actionUrl: `/dashboard/galerias/${gallery.id}`,
    });

    // Enviar email si está habilitado
    console.log('📧 [notifyFavoritesSelected] Verificando envío de email...');
    console.log('  - email_on_favorites:', prefs?.email_on_favorites);
    console.log('  - notification_email:', prefs?.notification_email);

    if (prefs && prefs.email_on_favorites && prefs.notification_email) {
      console.log('📧 [notifyFavoritesSelected] ✅ Enviando email a:', prefs.notification_email);

      const emailTemplate = getEmailTemplate('favorites_selected', {
        galleryTitle: gallery.title,
        galleryUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/galerias/${gallery.id}`,
        clientName,
        favoritesCount,
      });

      if (emailTemplate) {
        const emailResult = await sendEmail({
          to: prefs.notification_email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log('📧 [notifyFavoritesSelected] Email resultado:', emailResult);
      }
    } else {
      console.log('⏭️ [notifyFavoritesSelected] Email no enviado');
    }

    return result;
  } catch (error) {
    console.error('[notifyFavoritesSelected] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notificar cuando se crea una nueva galería
 *
 * @param {string} galleryId - ID de la galería creada
 */
export async function notifyGalleryCreated(galleryId) {
  try {
    console.log('🔍 [notifyGalleryCreated] Buscando galería:', galleryId);
    const supabase = await createClient();

    const { data: gallery, error } = await supabase
      .from('galleries')
      .select('id, title, created_by, client_email')
      .eq('id', galleryId)
      .single();

    if (error || !gallery) {
      console.error('❌ [notifyGalleryCreated] Gallery not found:', galleryId, error);
      return { success: false, error: 'Gallery not found' };
    }

    console.log('✅ [notifyGalleryCreated] Galería encontrada:', gallery.title, 'User:', gallery.created_by);

    // Verificar si el usuario tiene habilitadas las notificaciones de nuevas galerías
    const { data: prefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('inapp_enabled, email_on_new_gallery, notification_email')
      .eq('user_id', gallery.created_by)
      .maybeSingle();

    console.log('⚙️ [notifyGalleryCreated] Preferencias:', prefs, 'Error:', prefsError);

    // Si no tiene preferencias, crear con defaults
    if (!prefs) {
      console.log('📝 [notifyGalleryCreated] No hay preferencias, creando defaults...');
      const { error: insertError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: gallery.created_by,
          inapp_enabled: true,
          email_on_gallery_view: false,
          email_on_favorites: false,
          email_on_link_expiring: true,
          email_on_link_expired: true,
          email_on_new_gallery: false,
        });

      if (insertError) {
        console.error('❌ [notifyGalleryCreated] Error creando preferencias:', insertError);
      }
    }

    // Si tiene deshabilitadas las notificaciones in-app, no crear
    if (prefs && !prefs.inapp_enabled) {
      console.log('⏭️ [notifyGalleryCreated] Notificaciones in-app deshabilitadas');
      return { success: true, skipped: 'Notifications disabled' };
    }

    const clientName = gallery.client_email ? `para ${gallery.client_email.split('@')[0]}` : '';
    const message = `Creaste la galería "${gallery.title}" ${clientName}`.trim();

    console.log('💬 [notifyGalleryCreated] Creando notificación:', message);

    const result = await createNotification({
      userId: gallery.created_by,
      type: 'gallery_created',
      message,
      galleryId: gallery.id,
      actionUrl: `/dashboard/galerias/${gallery.id}`,
    });

    console.log('🎉 [notifyGalleryCreated] Notificación creada:', result);

    // Enviar email si está habilitado
    console.log('📧 [notifyGalleryCreated] Verificando envío de email...');
    console.log('  - email_on_new_gallery:', prefs?.email_on_new_gallery);
    console.log('  - notification_email:', prefs?.notification_email);

    if (prefs && prefs.email_on_new_gallery && prefs.notification_email) {
      console.log('📧 [notifyGalleryCreated] ✅ Enviando email a:', prefs.notification_email);

      const emailTemplate = getEmailTemplate('gallery_created', {
        galleryTitle: gallery.title,
        galleryUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/galerias/${gallery.id}`,
        clientEmail: gallery.client_email,
      });

      if (emailTemplate) {
        const emailResult = await sendEmail({
          to: prefs.notification_email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        console.log('📧 [notifyGalleryCreated] Email resultado:', emailResult);
      }
    } else {
      console.log('⏭️ [notifyGalleryCreated] Email no enviado');
    }

    return result;
  } catch (error) {
    console.error('💥 [notifyGalleryCreated] Error:', error);
    return { success: false, error: error.message };
  }
}