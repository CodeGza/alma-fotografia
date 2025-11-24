'use server';

import { createClient } from '@/lib/server';

/**
 * Obtener testimonios destacados para landing
 */
export async function getFeaturedTestimonials() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        id,
        client_name,
        rating,
        comment,
        created_at,
        service_type:service_types(name, icon)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    return { success: true, testimonials: data || [] };
  } catch (error) {
    return { success: false, testimonials: [], error: error.message };
  }
}

/**
 * Obtener servicios con galerías públicas para mostrar en landing
 */
export async function getPublicGalleriesPreview() {
  try {
    const supabase = await createClient();

    // Obtener todos los servicios
    const { data: services, error: servicesError } = await supabase
      .from('service_types')
      .select('*')
      .order('name', { ascending: true });

    if (servicesError) {
      console.error('Error obteniendo servicios:', servicesError);
      throw servicesError;
    }

    console.log('Servicios encontrados:', services?.length || 0);

    // Para cada servicio, obtener una galería pública con fotos
    const servicesWithGalleries = await Promise.all(
      (services || []).map(async (service) => {
        const { data: gallery, error: galleryError } = await supabase
          .from('galleries')
          .select(`
            id,
            title,
            slug,
            description,
            cover_image,
            photos(
              id,
              file_path,
              file_name,
              display_order,
              is_cover
            )
          `)
          .eq('service_type', service.slug)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (galleryError) {
          console.error(`Error obteniendo galería para servicio ${service.name}:`, galleryError);
        }

        console.log(`Servicio: ${service.name}, Galería encontrada:`, !!gallery, 'Fotos:', gallery?.photos?.length || 0);

        // Si no hay cover_image pero hay fotos, usar la foto marcada como cover o la primera
        if (gallery && !gallery.cover_image && gallery.photos && gallery.photos.length > 0) {
          const coverPhoto = gallery.photos.find(p => p.is_cover) || gallery.photos[0];
          gallery.cover_image = coverPhoto.file_path;
        }

        // Por ahora solo retornamos la galería, el enlace se maneja al hacer click
        // en "Ver Galería"

        return {
          ...service,
          gallery: gallery || null
        };
      })
    );

    // Filtrar solo servicios que tienen al menos una galería pública
    const servicesWithPublicGalleries = servicesWithGalleries.filter(
      s => s.gallery !== null && s.gallery.photos && s.gallery.photos.length > 0
    );

    console.log('Servicios con galerías públicas:', servicesWithPublicGalleries.length);
    console.log('Datos finales:', JSON.stringify(servicesWithPublicGalleries, null, 2));

    return {
      success: true,
      services: servicesWithPublicGalleries
    };
  } catch (error) {
    console.error('Error en getPublicGalleriesPreview:', error);
    return { success: false, services: [], error: error.message };
  }
}

/**
 * Obtener información del perfil para "Sobre Alma"
 */
export async function getProfileInfo() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('full_name, instagram, facebook, tiktok')
      .eq('username', 'admin') // Perfil principal
      .single();

    if (error) throw error;

    return { success: true, profile: data };
  } catch (error) {
    return {
      success: false,
      profile: {
        full_name: 'Fernanda',
        instagram: '@almafotografiauy',
        facebook: 'Alma Fotografía',
        tiktok: '@almafotografiauy'
      }
    };
  }
}

/**
 * Obtener o crear un enlace compartido permanente para una galería de landing
 * Si ya existe un enlace activo y permanente, lo devuelve
 * Si no existe, crea uno nuevo con duración de 1 año
 */
export async function getOrCreateLandingGalleryLink(galleryId, gallerySlug) {
  try {
    const supabase = await createClient();

    // Buscar enlace existente activo para esta galería
    // Buscamos enlaces con expiración mayor a 300 días (considerados "permanentes" para landing)
    const { data: existingShare } = await supabase
      .from('gallery_shares')
      .select('share_token, expires_at')
      .eq('gallery_id', galleryId)
      .eq('is_active', true)
      .gte('expires_at', new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString()) // Más de 300 días
      .maybeSingle();

    if (existingShare) {
      // Ya existe un enlace válido, devolverlo con parámetro preview
      const url = `/galeria/${gallerySlug}?token=${existingShare.share_token}&preview=true`;
      return { success: true, url, token: existingShare.share_token, isNew: false };
    }

    // No existe, crear uno nuevo con duración de 1 año (360 días)
    const token = `${crypto.randomUUID()}-${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 360); // 1 año

    // Obtener la galería para acceder al created_by del owner
    const { data: galleryData } = await supabase
      .from('galleries')
      .select('created_by')
      .eq('id', galleryId)
      .single();

    if (!galleryData?.created_by) {
      throw new Error('No se pudo obtener el creador de la galería');
    }

    const { error: insertError } = await supabase
      .from('gallery_shares')
      .insert({
        gallery_id: galleryId,
        share_token: token,
        created_by: galleryData.created_by,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        views_count: 0
      });

    if (insertError) throw insertError;

    const url = `/galeria/${gallerySlug}?token=${token}&preview=true`;
    return { success: true, url, token, isNew: true };

  } catch (error) {
    console.error('Error en getOrCreateLandingGalleryLink:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crear una nueva reserva desde landing (público)
 */
export async function createPublicBooking({
  serviceTypeId,
  clientName,
  clientEmail,
  clientPhone,
  eventDate,
  eventTime,
  message
}) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        service_type_id: serviceTypeId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        event_date: eventDate,
        event_time: eventTime,
        notes: message,
        status: 'pending',
        is_private: false
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Enviar notificación al fotógrafo
    // TODO: Enviar email de confirmación al cliente

    return { success: true, booking: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
