/**
 * Configuración global para el sistema de auto-refresh
 *
 * Aquí puedes ajustar los intervalos de actualización para diferentes secciones
 */

export const AUTO_REFRESH_CONFIG = {
  // Intervalo por defecto: 10 minutos
  DEFAULT_INTERVAL: 10 * 60 * 1000, // 600000 ms

  // Intervalos específicos por sección (en milisegundos)
  DASHBOARD: 10 * 60 * 1000,        // 10 minutos - Dashboard principal
  BOOKINGS: 10 * 60 * 1000,         // 10 minutos - Reservas y agenda
  NOTIFICATIONS: 10 * 60 * 1000,    // 10 minutos - Notificaciones
  GALLERIES: 10 * 60 * 1000,        // 10 minutos - Galerías
  TESTIMONIALS: 10 * 60 * 1000,     // 10 minutos - Testimonios

  // Configuraciones de comportamiento
  REFRESH_ON_FOCUS: true,           // Refrescar al volver a la ventana
  REFRESH_ON_RECONNECT: true,       // Refrescar al recuperar conexión
  MIN_TIME_BETWEEN_REFRESH: 60000,  // Tiempo mínimo entre refresh (1 minuto)
};

/**
 * Obtiene el intervalo configurado para una sección específica
 * @param {string} section - Nombre de la sección
 * @returns {number} - Intervalo en milisegundos
 */
export function getRefreshInterval(section) {
  return AUTO_REFRESH_CONFIG[section?.toUpperCase()] || AUTO_REFRESH_CONFIG.DEFAULT_INTERVAL;
}

/**
 * Convierte milisegundos a minutos para debugging
 * @param {number} ms - Milisegundos
 * @returns {number} - Minutos
 */
export function msToMinutes(ms) {
  return ms / 60000;
}
