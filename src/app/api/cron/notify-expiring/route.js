import { NextResponse } from 'next/server';
import { notifyExpiringLinks } from '@/lib/notifications/notification-helpers';

/**
 * API Route: Notificar enlaces que expiran pronto
 * 
 * Path: /api/cron/notify-expiring
 * Method: GET
 * 
 * Ejecutar diariamente a las 8 AM (cron: "0 8 * * *")
 * 
 * Vercel Cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/notify-expiring",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 */
export async function GET(request) {
  try {
    // Verificar autorización (token secreto)
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[notify-expiring] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ejecutar notificaciones
    const result = await notifyExpiringLinks();

    if (!result.success) {
      console.error('[notify-expiring] Error:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`[notify-expiring] Success: ${result.notified} enlaces notificados`);

    return NextResponse.json({
      success: true,
      notified: result.notified,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[notify-expiring] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}