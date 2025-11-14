-- Agregar nuevas columnas de notificaciones a notification_preferences
-- Ejecutar este script en Supabase SQL Editor

-- Agregar columna para notificación de enlace desactivado
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_on_link_deactivated BOOLEAN DEFAULT false;

-- Agregar columna para notificación de galería archivada
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_on_gallery_archived BOOLEAN DEFAULT false;

-- Agregar columna para notificación de galería eliminada
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_on_gallery_deleted BOOLEAN DEFAULT true;

-- Comentarios para documentación
COMMENT ON COLUMN notification_preferences.email_on_link_deactivated IS 'Enviar email cuando se desactive un enlace manualmente';
COMMENT ON COLUMN notification_preferences.email_on_gallery_archived IS 'Enviar email cuando se archive una galería';
COMMENT ON COLUMN notification_preferences.email_on_gallery_deleted IS 'Enviar email cuando se elimine una galería';
