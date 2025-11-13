import { NextResponse } from 'next/server';
import { notifyGalleryView } from '@/lib/notifications/notification-helpers';

/**
 * POST /api/galleries/view
 *
 * Registra que un cliente vio una galería y envía notificación al fotógrafo
 *
 * Body:
 * {
 *   galleryId: string
 * }
 */
export async function POST(request) {
  try {
    const { galleryId } = await request.json();

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      );
    }

    // Crear notificación (solo si está habilitado en preferencias)
    const result = await notifyGalleryView(galleryId);

    if (!result.success && !result.skipped) {
      console.error('Error notifying gallery view:', result.error);
      // No fallar la request, solo loguear
    }

    return NextResponse.json({
      success: true,
      notified: result.success && !result.skipped
    });

  } catch (error) {
    console.error('Error in gallery view API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
