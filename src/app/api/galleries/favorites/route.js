import { NextResponse } from 'next/server';
import { notifyFavoritesSelected } from '@/lib/notifications/notification-helpers';

/**
 * POST /api/galleries/favorites
 *
 * Registra que un cliente seleccionó favoritos y envía notificación al fotógrafo
 *
 * Body:
 * {
 *   galleryId: string,
 *   favoritesCount: number
 * }
 */
export async function POST(request) {
  try {
    const { galleryId, favoritesCount } = await request.json();

    if (!galleryId || typeof favoritesCount !== 'number') {
      return NextResponse.json(
        { error: 'Gallery ID and favorites count are required' },
        { status: 400 }
      );
    }

    // Crear notificación (solo si está habilitado en preferencias)
    const result = await notifyFavoritesSelected(galleryId, favoritesCount);

    if (!result.success && !result.skipped) {
      console.error('Error notifying favorites selected:', result.error);
      // No fallar la request, solo loguear
    }

    return NextResponse.json({
      success: true,
      notified: result.success && !result.skipped
    });

  } catch (error) {
    console.error('Error in favorites API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
