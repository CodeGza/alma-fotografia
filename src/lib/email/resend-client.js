import { Resend } from 'resend';

/**
 * Cliente de Resend para envío de emails
 *
 * Configuración:
 * 1. Crear cuenta en https://resend.com
 * 2. Agregar RESEND_API_KEY en .env.local
 * 3. Verificar dominio en Resend (o usar onboarding@resend.dev para testing)
 */

let resendClient = null;

export function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY no configurado. Los emails no se enviarán.');
      return null;
    }

    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

/**
 * Envía un email usando Resend
 *
 * @param {Object} options
 * @param {string} options.to - Email destinatario
 * @param {string} options.subject - Asunto del email
 * @param {string} options.html - Contenido HTML
 * @param {string} options.from - Email remitente (debe estar verificado en Resend)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, html, from }) {
  try {
    const resend = getResendClient();

    if (!resend) {
      console.log('📧 [EMAIL SIMULADO] To:', to, 'Subject:', subject);
      return {
        success: true,
        messageId: 'simulated-' + Date.now(),
        simulated: true
      };
    }

    // En desarrollo/sandbox, usar el email onboarding de Resend
    // Este puede enviar a cualquier email verificado en tu cuenta de Resend
    const fromEmail = from || 'Alma Fotografía <onboarding@resend.dev>';

    console.log('📧 Enviando email a:', to);
    console.log('📧 Desde:', fromEmail);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      console.error('❌ Detalles del error:', error);
      return { success: false, error: error.message || JSON.stringify(error) };
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('✅ ID del email:', data.id);

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('💥 Error crítico enviando email:', error);
    return { success: false, error: error.message };
  }
}
