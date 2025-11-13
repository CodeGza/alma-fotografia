-- ========================================
-- ACTUALIZACIÓN DE SERVICIOS - ALMA FOTOGRAFÍA
-- ========================================
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. ELIMINAR servicios antiguos (mantiene galerías existentes)
DELETE FROM service_types WHERE is_default = true;

-- 2. INSERTAR los 3 servicios de Fernanda
INSERT INTO service_types (slug, name, icon_name, is_default, description) VALUES
  ('quinceaneras', 'Quinceañeras / Sweet 15', 'Sparkles', true, 'Fotografía y Video para tu día más especial'),
  ('bodas', 'Bodas', 'Heart', true, 'Capturamos la historia de tu amor'),
  ('empresariales', 'Empresariales', 'Briefcase', true, 'Imagen profesional para tu marca o evento');

-- 3. VERIFICAR inserción
SELECT * FROM service_types ORDER BY is_default DESC, name;

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- - Los servicios personalizados del usuario NO se eliminan
-- - Solo se reemplazan los servicios predeterminados (is_default = true)
-- - Las galerías existentes mantienen su service_type aunque se elimine el servicio
-- - Para ver servicios en uso: SELECT service_type, COUNT(*) FROM galleries GROUP BY service_type;
