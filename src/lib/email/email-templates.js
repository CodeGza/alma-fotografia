/**
 * Templates de email para notificaciones
 *
 * Cada template genera HTML responsive y profesional
 */

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f5f5f5;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .header {
    background-color: #2d2d2d;
    padding: 40px 30px;
    text-align: center;
    border-bottom: 3px solid #79502A;
  }
  .header h1 {
    color: #ffffff;
    margin: 0;
    font-size: 32px;
    font-weight: 400;
    font-family: 'Cormorant Garamond', serif;
    letter-spacing: 1px;
  }
  .content {
    padding: 40px 30px;
    color: #2d2d2d;
  }
  .content p {
    color: #2d2d2d;
    line-height: 1.7;
    margin: 0 0 16px 0;
    font-size: 16px;
  }
  .content strong {
    color: #79502A;
  }
  .button {
    display: inline-block;
    padding: 14px 32px;
    background-color: #79502A;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
    transition: all 0.3s;
  }
  .button:hover {
    background-color: #8B5A2F;
    transform: translateY(-2px);
  }
  .footer {
    padding: 20px 30px;
    text-align: center;
    background-color: #2d2d2d;
    border-top: 1px solid #79502A;
  }
  .footer p {
    color: #999999;
    font-size: 14px;
    margin: 8px 0;
  }
  .highlight {
    background-color: #FFF4E6;
    padding: 20px;
    border-left: 4px solid #79502A;
    border-radius: 4px;
    margin: 20px 0;
  }
  .highlight p {
    margin: 0;
  }
  ul, ol {
    color: #2d2d2d;
    line-height: 1.8;
  }
`;

function wrapTemplate(content, title) {
  // Usar URL de Cloudinary para el logo (funciona en desarrollo y producción)
  // Si no está configurado, fallback a la URL del sitio
  const logoUrl = process.env.EMAIL_LOGO_URL
    || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/img/logos/logo_BN_SF.png`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Alma Fotografía" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" onerror="this.style.display='none'" />
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p style="color: #999999;">Este es un email automático de notificación</p>
          <p style="color: #79502A;">© ${new Date().getFullYear()} Alma Fotografía. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Notificación de galería creada
 */
export function galleryCreatedEmail({ galleryTitle, galleryUrl, clientEmail }) {
  const content = `
    <p>Tu galería <strong>"${galleryTitle}"</strong> ha sido creada exitosamente.</p>

    ${clientEmail ? `
      <div class="highlight">
        <p style="margin: 0; color: #2d2d2d;"><strong>Cliente:</strong> ${clientEmail}</p>
      </div>
    ` : ''}

    <p>Ahora puedes:</p>
    <ul style="color: #2d2d2d; line-height: 1.8;">
      <li>Subir fotos a la galería</li>
      <li>Generar un enlace para compartir</li>
      <li>Configurar opciones de privacidad</li>
    </ul>

    <center>
      <a href="${galleryUrl}" class="button">Ver galería →</a>
    </center>

    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      ¿Necesitas ayuda? Revisa la documentación en tu dashboard.
    </p>
  `;

  return {
    subject: `Galería "${galleryTitle}" creada`,
    html: wrapTemplate(content, 'Galería Creada'),
  };
}

/**
 * Notificación de vista de galería
 */
export function galleryViewEmail({ galleryTitle, galleryUrl, clientName }) {
  const content = `
    <p><strong>${clientName}</strong> acaba de ver tu galería <strong>"${galleryTitle}"</strong>.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Nueva vista registrada</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        ${new Date().toLocaleString('es-ES', {
          dateStyle: 'full',
          timeStyle: 'short'
        })}
      </p>
    </div>

    <p>Puedes ver las estadísticas completas de tu galería y revisar los favoritos seleccionados.</p>

    <center>
      <a href="${galleryUrl}" class="button">Ver detalles →</a>
    </center>
  `;

  return {
    subject: `${clientName} vio tu galería "${galleryTitle}"`,
    html: wrapTemplate(content, 'Galería Vista'),
  };
}

/**
 * Notificación de favoritos seleccionados (primera vez)
 */
export function favoritesSelectedEmail({ galleryTitle, galleryUrl, clientName, totalCount }) {
  const content = `
    <p><strong>${clientName}</strong> seleccionó <strong>${totalCount}</strong> foto${totalCount > 1 ? 's' : ''} favorita${totalCount > 1 ? 's' : ''} en <strong>"${galleryTitle}"</strong>.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">${totalCount} foto${totalCount > 1 ? 's' : ''} seleccionada${totalCount > 1 ? 's' : ''}</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        Ya puedes revisar la selección de tu cliente
      </p>
    </div>

    <p>Accede a la galería para ver qué fotos eligió y continuar con el proceso de entrega.</p>

    <center>
      <a href="${galleryUrl}" class="button">Ver favoritos →</a>
    </center>
  `;

  return {
    subject: `${clientName} eligió ${totalCount} favorito${totalCount > 1 ? 's' : ''} en "${galleryTitle}"`,
    html: wrapTemplate(content, 'Favoritos Seleccionados'),
  };
}

/**
 * Notificación de favoritos editados
 */
export function favoritesEditedEmail({ galleryTitle, galleryUrl, clientName, totalCount, addedCount, removedCount }) {
  let changesText = '';
  if (addedCount > 0 && removedCount > 0) {
    changesText = `eliminó <strong style="color: #ef4444;">${removedCount}</strong> y agregó <strong style="color: #10b981;">${addedCount}</strong>`;
  } else if (addedCount > 0) {
    changesText = `agregó <strong style="color: #10b981;">${addedCount}</strong> foto${addedCount > 1 ? 's' : ''}`;
  } else if (removedCount > 0) {
    changesText = `eliminó <strong style="color: #ef4444;">${removedCount}</strong> foto${removedCount > 1 ? 's' : ''}`;
  }

  const content = `
    <p><strong>${clientName}</strong> modificó su selección de favoritos en <strong>"${galleryTitle}"</strong>.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Cambios realizados:</p>
      <p style="margin: 8px 0 0 0; color: #2d2d2d; font-size: 16px;">
        ${changesText.charAt(0).toUpperCase() + changesText.slice(1)}
      </p>
      <p style="margin: 12px 0 0 0; color: #79502A; font-weight: 600;">
        Total actual: ${totalCount} foto${totalCount > 1 ? 's' : ''}
      </p>
    </div>

    <p>Revisa la selección actualizada de tu cliente y continúa con el proceso de entrega.</p>

    <center>
      <a href="${galleryUrl}" class="button">Ver favoritos →</a>
    </center>
  `;

  return {
    subject: `${clientName} modificó sus favoritos en "${galleryTitle}"`,
    html: wrapTemplate(content, 'Favoritos Modificados'),
  };
}

/**
 * Notificación de enlace por vencer
 */
export function linkExpiringEmail({ galleryTitle, galleryUrl, daysRemaining }) {
  const content = `
    <p style="color: #79502A; font-weight: 600;">Atención importante</p>
    <p>El enlace compartido de tu galería <strong>"${galleryTitle}"</strong> expirará en <strong>${daysRemaining} día${daysRemaining > 1 ? 's' : ''}</strong>.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Enlace próximo a vencer</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        Después de esta fecha, el enlace dejará de funcionar automáticamente
      </p>
    </div>

    <p>Puedes:</p>
    <ul style="color: #2d2d2d; line-height: 1.8;">
      <li>Extender la fecha de vencimiento</li>
      <li>Crear un nuevo enlace</li>
      <li>Desactivar el enlace manualmente</li>
    </ul>

    <center>
      <a href="${galleryUrl}" class="button">Gestionar enlace →</a>
    </center>
  `;

  return {
    subject: `El enlace de "${galleryTitle}" vence en ${daysRemaining} días`,
    html: wrapTemplate(content, 'Enlace por Vencer'),
  };
}

/**
 * Notificación de enlace expirado
 */
export function linkExpiredEmail({ galleryTitle, galleryUrl }) {
  const content = `
    <p style="color: #79502A; font-weight: 600;">Enlace expirado</p>
    <p>El enlace compartido de tu galería <strong>"${galleryTitle}"</strong> ha expirado y fue desactivado automáticamente.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Enlace desactivado</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        Los clientes ya no pueden acceder con el enlace anterior
      </p>
    </div>

    <p>Si necesitas compartir nuevamente esta galería:</p>
    <ol style="color: #2d2d2d; line-height: 1.8;">
      <li>Accede a tu galería</li>
      <li>Genera un nuevo enlace</li>
      <li>Configura una nueva fecha de vencimiento</li>
      <li>Comparte el nuevo enlace con tu cliente</li>
    </ol>

    <center>
      <a href="${galleryUrl}" class="button">Generar nuevo enlace →</a>
    </center>
  `;

  return {
    subject: `El enlace de "${galleryTitle}" ha expirado`,
    html: wrapTemplate(content, 'Enlace Expirado'),
  };
}

/**
 * Notificación de enlace desactivado manualmente
 */
export function linkDeactivatedEmail({ galleryTitle, galleryUrl }) {
  const content = `
    <p style="color: #79502A; font-weight: 600;">Enlace desactivado</p>
    <p>Desactivaste el enlace compartido de tu galería <strong>"${galleryTitle}"</strong>.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Enlace desactivado correctamente</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        Los clientes ya no pueden acceder con el enlace anterior
      </p>
    </div>

    <p>Puedes generar un nuevo enlace en cualquier momento desde la galería.</p>

    <center>
      <a href="${galleryUrl}" class="button">Ver galería →</a>
    </center>
  `;

  return {
    subject: `Enlace de "${galleryTitle}" desactivado`,
    html: wrapTemplate(content, 'Enlace Desactivado'),
  };
}

/**
 * Notificación de galería archivada
 */
export function galleryArchivedEmail({ galleryTitle }) {
  const content = `
    <p style="color: #79502A; font-weight: 600;">Galería archivada</p>
    <p>La galería <strong>"${galleryTitle}"</strong> ha sido archivada correctamente.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Enlaces desactivados</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        Los enlaces compartidos de esta galería se desactivaron automáticamente
      </p>
    </div>

    <p>La galería y sus fotos se conservan pero no están visibles en el listado activo. Puedes restaurarla en cualquier momento desde la sección de archivadas.</p>
  `;

  return {
    subject: `Galería "${galleryTitle}" archivada`,
    html: wrapTemplate(content, 'Galería Archivada'),
  };
}

/**
 * Notificación de galería restaurada
 */
export function galleryRestoredEmail({ galleryTitle, galleryUrl }) {
  const content = `
    <p style="color: #10b981; font-weight: 600;">Galería restaurada</p>
    <p>La galería <strong>"${galleryTitle}"</strong> ha sido restaurada correctamente.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Galería activa nuevamente</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        La galería vuelve a estar visible en tu listado principal
      </p>
    </div>

    <p>Ahora puedes:</p>
    <ul style="color: #2d2d2d; line-height: 1.8;">
      <li>Ver y editar la galería</li>
      <li>Generar nuevos enlaces para compartir</li>
      <li>Subir más fotos si lo necesitas</li>
    </ul>

    <center>
      <a href="${galleryUrl}" class="button">Ver galería →</a>
    </center>
  `;

  return {
    subject: `Galería "${galleryTitle}" restaurada`,
    html: wrapTemplate(content, 'Galería Restaurada'),
  };
}

/**
 * Notificación de galería eliminada
 */
export function galleryDeletedEmail({ galleryTitle }) {
  const content = `
    <p style="color: #79502A; font-weight: 600;">Galería eliminada</p>
    <p>La galería <strong>"${galleryTitle}"</strong> ha sido eliminada permanentemente.</p>

    <div class="highlight">
      <p style="margin: 0; color: #79502A; font-weight: 600;">Eliminación permanente</p>
      <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
        Todas las fotos y datos de esta galería se eliminaron de forma irreversible
      </p>
    </div>

    <p>Esta acción no se puede deshacer. Los enlaces compartidos ya no funcionan y todos los archivos fueron eliminados de nuestros servidores.</p>
  `;

  return {
    subject: `Galería "${galleryTitle}" eliminada`,
    html: wrapTemplate(content, 'Galería Eliminada'),
  };
}

// ============================================
// TEMPLATES DE AGENDA
// ============================================

/**
 * Template: Nueva reserva pendiente
 */
function bookingPendingEmail({ bookingType, clientName, clientEmail, bookingDate, startTime, endTime, agendaUrl }) {
  const content = `
    <div class="highlight">
      <p style="font-size: 18px; font-weight: 600; color: #79502A; margin-bottom: 12px;">
        📅 Nueva reserva pendiente de aprobación
      </p>
      <p><strong>Tipo de reunión:</strong> ${bookingType}</p>
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Email:</strong> ${clientEmail}</p>
      <p><strong>Fecha:</strong> ${bookingDate}</p>
      <p><strong>Horario:</strong> ${startTime} - ${endTime}</p>
    </div>

    <p>Un cliente ha solicitado una reunión. Revisa los detalles y apruébala o recházala desde tu agenda.</p>

    <div style="text-align: center;">
      <a href="${agendaUrl}" class="button">Ver en Agenda</a>
    </div>
  `;

  return {
    subject: `Nueva reserva de ${bookingType} - ${clientName}`,
    html: wrapTemplate(content, 'Nueva Reserva Pendiente'),
  };
}

/**
 * Template: Reserva confirmada
 */
function bookingConfirmedEmail({ bookingType, clientName, clientEmail, bookingDate, startTime, endTime, agendaUrl }) {
  const content = `
    <div class="highlight">
      <p style="font-size: 18px; font-weight: 600; color: #79502A; margin-bottom: 12px;">
        ✅ Reserva confirmada
      </p>
      <p><strong>Tipo de reunión:</strong> ${bookingType}</p>
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Email:</strong> ${clientEmail}</p>
      <p><strong>Fecha:</strong> ${bookingDate}</p>
      <p><strong>Horario:</strong> ${startTime} - ${endTime}</p>
    </div>

    <p>Has confirmado esta reunión. El cliente ha sido notificado y la cita está agregada a tu agenda.</p>

    <div style="text-align: center;">
      <a href="${agendaUrl}" class="button">Ver Agenda Completa</a>
    </div>
  `;

  return {
    subject: `Reserva confirmada: ${bookingType} con ${clientName}`,
    html: wrapTemplate(content, 'Reserva Confirmada'),
  };
}

/**
 * Template: Recordatorio de reserva próxima
 */
function bookingReminderEmail({ bookingType, clientName, clientEmail, bookingDate, startTime, endTime, agendaUrl }) {
  const content = `
    <div class="highlight">
      <p style="font-size: 18px; font-weight: 600; color: #79502A; margin-bottom: 12px;">
        ⏰ Recordatorio: Reunión mañana
      </p>
      <p><strong>Tipo de reunión:</strong> ${bookingType}</p>
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Email:</strong> ${clientEmail}</p>
      <p><strong>Fecha:</strong> ${bookingDate}</p>
      <p><strong>Horario:</strong> ${startTime} - ${endTime}</p>
    </div>

    <p>Este es un recordatorio de que mañana tienes una reunión confirmada. No olvides prepararte con anticipación.</p>

    <div style="text-align: center;">
      <a href="${agendaUrl}" class="button">Ver Detalles</a>
    </div>
  `;

  return {
    subject: `Recordatorio: ${bookingType} mañana a las ${startTime}`,
    html: wrapTemplate(content, 'Recordatorio de Reunión'),
  };
}

// ============================================
// TEMPLATES PARA CLIENTES (AGENDA PÚBLICA)
// ============================================

/**
 * Template: Solicitud de reserva recibida (para el cliente)
 */
function clientBookingRequestedEmail({ bookingType, clientName, bookingDate, startTime, endTime }) {
  const content = `
    <p>Hola <strong>${clientName}</strong>,</p>

    <p>¡Gracias por tu solicitud! Hemos recibido tu pedido de reserva y te confirmamos los siguientes datos:</p>

    <div class="highlight">
      <p style="font-size: 18px; font-weight: 600; color: #79502A; margin-bottom: 12px;">
        📋 Solicitud recibida
      </p>
      <p><strong>Tipo de reunión:</strong> ${bookingType}</p>
      <p><strong>Fecha solicitada:</strong> ${bookingDate}</p>
      <p><strong>Horario solicitado:</strong> ${startTime} - ${endTime}</p>
    </div>

    <p><strong>¿Qué sigue?</strong></p>
    <p>Tu solicitud está pendiente de confirmación. Revisaremos tu pedido y te enviaremos un email confirmando si podemos atenderte en el horario solicitado.</p>

    <p>Si tienes alguna consulta mientras tanto, no dudes en contactarnos.</p>

    <p style="margin-top: 24px;">
      Saludos,<br>
      <strong style="color: #79502A;">Alma Fotografía</strong>
    </p>
  `;

  return {
    subject: `Solicitud recibida - ${bookingType} el ${bookingDate}`,
    html: wrapTemplate(content, 'Solicitud de Reserva Recibida'),
  };
}

/**
 * Template: Reserva confirmada (para el cliente)
 */
function clientBookingConfirmedEmail({ bookingType, clientName, bookingDate, startTime, endTime }) {
  const content = `
    <p>Hola <strong>${clientName}</strong>,</p>

    <p>¡Excelente noticia! Tu reserva ha sido confirmada.</p>

    <div class="highlight">
      <p style="font-size: 18px; font-weight: 600; color: #79502A; margin-bottom: 12px;">
        ✅ Reserva confirmada
      </p>
      <p><strong>Tipo de reunión:</strong> ${bookingType}</p>
      <p><strong>Fecha:</strong> ${bookingDate}</p>
      <p><strong>Horario:</strong> ${startTime} - ${endTime}</p>
    </div>

    <p>Te esperamos en el horario acordado. Si necesitas hacer algún cambio o tienes alguna consulta, no dudes en contactarnos.</p>

    <p style="margin-top: 24px;">
      Saludos,<br>
      <strong style="color: #79502A;">Alma Fotografía</strong>
    </p>
  `;

  return {
    subject: `Reserva confirmada - ${bookingType} el ${bookingDate}`,
    html: wrapTemplate(content, 'Reserva Confirmada'),
  };
}

/**
 * Template: Reserva rechazada (para el cliente)
 */
function clientBookingRejectedEmail({ bookingType, clientName, bookingDate, startTime, reason }) {
  const content = `
    <p>Hola <strong>${clientName}</strong>,</p>

    <p>Lamentamos informarte que no pudimos confirmar tu solicitud de reserva para la siguiente fecha:</p>

    <div class="highlight">
      <p style="font-size: 18px; font-weight: 600; color: #79502A; margin-bottom: 12px;">
        Reserva no disponible
      </p>
      <p><strong>Tipo de reunión:</strong> ${bookingType}</p>
      <p><strong>Fecha solicitada:</strong> ${bookingDate}</p>
      <p><strong>Horario solicitado:</strong> ${startTime}</p>
      ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
    </div>

    <p>Te invitamos a elegir otra fecha y horario disponible. Puedes hacer una nueva reserva en cualquier momento.</p>

    <p>Si tienes alguna consulta o necesitas ayuda para encontrar un horario alternativo, no dudes en contactarnos.</p>

    <p style="margin-top: 24px;">
      Saludos,<br>
      <strong style="color: #79502A;">Alma Fotografía</strong>
    </p>
  `;

  return {
    subject: `Reserva no disponible - ${bookingType} el ${bookingDate}`,
    html: wrapTemplate(content, 'Reserva No Disponible'),
  };
}

/**
 * Obtiene el template correcto según el tipo de notificación
 */
export function getEmailTemplate(type, data) {
  switch (type) {
    case 'gallery_created':
      return galleryCreatedEmail(data);
    case 'gallery_view':
      return galleryViewEmail(data);
    case 'favorites_selected':
      return favoritesSelectedEmail(data);
    case 'favorites_edited':
      return favoritesEditedEmail(data);
    case 'link_expiring_soon':
      return linkExpiringEmail(data);
    case 'link_expired':
      return linkExpiredEmail(data);
    case 'link_deactivated':
      return linkDeactivatedEmail(data);
    case 'gallery_archived':
      return galleryArchivedEmail(data);
    case 'gallery_restored':
      return galleryRestoredEmail(data);
    case 'gallery_deleted':
      return galleryDeletedEmail(data);
    case 'booking_pending':
      return bookingPendingEmail(data);
    case 'booking_confirmed':
      return bookingConfirmedEmail(data);
    case 'booking_reminder':
      return bookingReminderEmail(data);
    case 'client_booking_requested':
      return clientBookingRequestedEmail(data);
    case 'client_booking_confirmed':
      return clientBookingConfirmedEmail(data);
    case 'client_booking_rejected':
      return clientBookingRejectedEmail(data);
    default:
      return null;
  }
}
