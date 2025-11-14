import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { notifyGalleryDeleted } from '@/lib/notifications/notification-helpers';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * DELETE /api/galleries/delete
 * 
 * Elimina una galería completamente:
 * 1. Elimina todas las fotos de Cloudinary
 * 2. Elimina la cover image de Cloudinary
 * 3. Elimina el ZIP archivado (si existe)
 * 4. Elimina registros de photos en BD
 * 5. Elimina la galería de BD
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('id');

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID requerido' },
        { status: 400 }
      );
    }

    console.log('🗑️ Iniciando eliminación de galería:', galleryId);

    // Inicializar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Obtener galería completa
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('*, photos(*)')
      .eq('id', galleryId)
      .single();

    if (galleryError || !gallery) {
      return NextResponse.json(
        { error: 'Galería no encontrada' },
        { status: 404 }
      );
    }

    console.log('📋 Galería encontrada:', gallery.title);

    let deletedPhotos = 0;
    let deletedCover = false;
    let deletedZip = false;

    // 2. Eliminar fotos de Cloudinary
    if (gallery.photos && gallery.photos.length > 0) {
      console.log(`🗑️ Eliminando ${gallery.photos.length} fotos de Cloudinary...`);

      for (const photo of gallery.photos) {
        try {
          const photoUrl = photo.cloudinary_url || photo.file_path;

          if (photoUrl && photoUrl.includes('cloudinary.com')) {
            const match = photoUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+/i);

            if (match && match[1]) {
              const publicId = match[1];
              await cloudinary.uploader.destroy(publicId, { invalidate: true });
              deletedPhotos++;
              console.log(`✅ Foto eliminada: ${publicId}`);
            }
          }
        } catch (error) {
          console.error(`⚠️ Error eliminando foto:`, error.message);
        }
      }
    }

    // 3. Eliminar cover image de Cloudinary
    if (gallery.cover_image) {
      try {
        console.log('🗑️ Eliminando cover image...');
        const match = gallery.cover_image.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+/i);

        if (match && match[1]) {
          const publicId = match[1];
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
          deletedCover = true;
          console.log(`✅ Cover eliminada: ${publicId}`);
        }
      } catch (error) {
        console.error('⚠️ Error eliminando cover:', error.message);
      }
    }

    // 4. Eliminar ZIP archivado (si existe)
    if (gallery.archive_zip_url) {
      try {
        console.log('🗑️ Eliminando ZIP archivado...');
        const match = gallery.archive_zip_url.match(/\/upload\/(?:v\d+\/)?(.+)\.zip/i);

        if (match && match[1]) {
          const publicId = match[1];
          await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw',
            invalidate: true
          });
          deletedZip = true;
          console.log(`✅ ZIP eliminado: ${publicId}`);
        }
      } catch (error) {
        console.error('⚠️ Error eliminando ZIP:', error.message);
      }
    }

    // 5. Eliminar registros de photos en BD
    console.log('🗑️ Eliminando registros de fotos de la BD...');
    await supabase
      .from('photos')
      .delete()
      .eq('gallery_id', galleryId);

    // 6. Notificar antes de eliminar
    console.log('🔔 Enviando notificación de eliminación...');
    await notifyGalleryDeleted(gallery.title, gallery.created_by);

    // 7. Eliminar galería de BD
    console.log('🗑️ Eliminando galería de la BD...');
    const { error: deleteError } = await supabase
      .from('galleries')
      .delete()
      .eq('id', galleryId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    console.log('✅ Galería eliminada completamente');

    return NextResponse.json({
      success: true,
      message: 'Galería eliminada correctamente',
      stats: {
        photosDeleted: deletedPhotos,
        coverDeleted: deletedCover,
        zipDeleted: deletedZip
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando galería:', error);
    return NextResponse.json(
      { error: error.message || 'Error eliminando galería' },
      { status: 500 }
    );
  }
}