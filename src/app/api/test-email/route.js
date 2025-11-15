import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend-client';
import { getEmailTemplate } from '@/lib/email/email-templates';

/**
 * Endpoint de prueba para verificar que el envío de emails funciona
 *
 * POST /api/test-email
 * Body: { "to": "tu-email@ejemplo.com" }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Email destinatario requerido' },
        { status: 400 }
      );
    }

    console.log('📧 Enviando email de prueba a:', to);

    // Usar el template de galería creada como ejemplo
    const emailTemplate = getEmailTemplate('gallery_created', {
      galleryTitle: 'Galería de Prueba',
      galleryUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/galerias`,
      clientEmail: to,
    });

    const result = await sendEmail({
      to,
      subject: emailTemplate.subject + ' - Prueba de Logo',
      html: emailTemplate.html,
    });

    console.log('📧 Resultado:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email enviado exitosamente',
        messageId: result.messageId,
        simulated: result.simulated || false,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error en test-email:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
