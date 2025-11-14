import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend-client';

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

    const result = await sendEmail({
      to,
      subject: '✅ Email de prueba - Alma Fotografía',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #79502A 0%, #8B5A2F 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #79502A;
              margin-top: 0;
            }
            .content p {
              color: #333;
              line-height: 1.6;
            }
            .success-badge {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              padding: 20px 30px;
              background-color: #f9f9f9;
              text-align: center;
              color: #999;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📸 Alma Fotografía</h1>
            </div>
            <div class="content">
              <h2>¡Prueba exitosa! ✅</h2>
              <p>Este es un email de prueba del sistema de notificaciones de Alma Fotografía.</p>

              <div class="success-badge">
                ✓ El sistema de emails está funcionando correctamente
              </div>

              <p>Si recibiste este email, significa que:</p>
              <ul>
                <li>✅ Resend está correctamente configurado</li>
                <li>✅ La API key es válida</li>
                <li>✅ Los emails se están enviando exitosamente</li>
              </ul>

              <p><strong>Próximos pasos:</strong></p>
              <ol>
                <li>Ve a <strong>Dashboard → Configuración → Notificaciones</strong></li>
                <li>Ingresa tu email en el campo "Email para recibir notificaciones"</li>
                <li>Activa las notificaciones que quieras recibir</li>
                <li>Guarda los cambios</li>
              </ol>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
            <div class="footer">
              <p>Email de prueba generado automáticamente</p>
              <p>© ${new Date().getFullYear()} Alma Fotografía</p>
            </div>
          </div>
        </body>
        </html>
      `,
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
