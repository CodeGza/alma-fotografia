/**
 * Configuración centralizada de datos de contacto
 * Usar estas constantes en lugar de hardcodear valores
 */

export const CONTACT = {
  // Email principal
  email: 'contacto@almafotografia.com',

  // WhatsApp (solo números, sin +)
  whatsapp: '59892021392',

  // Teléfono formateado para mostrar
  phone: '+598 92 021 392',

  // Redes sociales
  instagram: '@almafotografiauy',
  instagramUrl: 'https://instagram.com/almafotografiauy',

  facebook: 'Alma Fotografía',
  facebookUrl: 'https://facebook.com/almafotografiauy',

  tiktok: '@almafotografiauy',
  tiktokUrl: 'https://tiktok.com/@almafotografiauy',

  // Ubicación
  location: 'Montevideo, Uruguay',

  // Nombre del negocio
  businessName: 'Alma Fotografía',
  ownerName: 'Fernanda',
};

/**
 * Genera URL de WhatsApp con mensaje opcional
 */
export function getWhatsAppUrl(message = '') {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${CONTACT.whatsapp}${message ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Genera URL de mailto
 */
export function getMailtoUrl(subject = '', body = '') {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${CONTACT.email}${params.length ? '?' + params.join('&') : ''}`;
}
