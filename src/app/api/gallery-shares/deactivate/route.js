import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { notifyLinkDeactivated } from '@/lib/notifications/notification-helpers';

/**
 * API Route: Desactivar enlace compartido
 *
 * POST /api/gallery-shares/deactivate
 * Body: { shareId: string }
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shareId } = body;

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: 'shareId requerido' },
        { status: 400 }
      );
    }

    // Desactivar el enlace
    const { error: updateError } = await supabase
      .from('gallery_shares')
      .update({ is_active: false })
      .eq('id', shareId)
      .eq('created_by', user.id); // Seguridad: solo el dueño puede desactivar

    if (updateError) {
      console.error('[deactivate] Error updating share:', updateError);
      return NextResponse.json(
        { success: false, error: 'Error al desactivar el enlace' },
        { status: 500 }
      );
    }

    // Enviar notificación
    const notificationResult = await notifyLinkDeactivated(shareId, user.id);

    if (!notificationResult.success) {
      console.error('[deactivate] Error sending notification:', notificationResult.error);
      // No fallar la request si la notificación falla
    }

    return NextResponse.json({
      success: true,
      message: 'Enlace desactivado correctamente',
    });

  } catch (error) {
    console.error('[deactivate] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
