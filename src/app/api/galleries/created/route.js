import { NextResponse } from 'next/server';
import { notifyGalleryCreated } from '@/lib/notifications/notification-helpers';

/**
 * POST /api/galleries/created
 *
 * Registra que se creó una galería y envía notificación al fotógrafo
 *
 * Body:
 * {
 *   galleryId: string
 * }
 */
export async function POST(request) {
  try {
    const { galleryId } = await request.json();

    console.log('📊 [API Created] Recibiendo solicitud para galería:', galleryId);

    if (!galleryId) {
      console.error('❌ [API Created] Gallery ID no proporcionado');
      return NextResponse.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      );
    }

    // Crear notificación (solo si está habilitado en preferencias)
    console.log('🔔 [API Created] Intentando crear notificación...');
    const result = await notifyGalleryCreated(galleryId);

    console.log('✅ [API Created] Resultado:', result);

    if (!result.success && !result.skipped) {
      console.error('❌ [API Created] Error al notificar:', result.error);
      // No fallar la request, solo loguear
    }

    if (result.skipped) {
      console.log('⏭️ [API Created] Notificación saltada:', result.skipped);
    }

    return NextResponse.json({
      success: true,
      notified: result.success && !result.skipped,
      debug: result
    });

  } catch (error) {
    console.error('💥 [API Created] Error crítico:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
