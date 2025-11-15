-- Agregar columna email_enabled a notification_preferences
-- Esta columna actúa como checkbox maestro para habilitar/deshabilitar TODOS los emails
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT true;

-- Actualizar comentario de la tabla
COMMENT ON COLUMN notification_preferences.email_enabled IS 'Habilitar/deshabilitar TODOS los emails (checkbox maestro)';
