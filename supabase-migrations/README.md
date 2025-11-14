# Migraciones de Base de Datos - Supabase

## Cómo ejecutar las migraciones

### Opción 1: SQL Editor de Supabase (Recomendado)

1. Andá a tu proyecto de Supabase: https://supabase.com/dashboard
2. Seleccioná tu proyecto
3. En el menú lateral, andá a **SQL Editor**
4. Click en **New query**
5. Copiá y pegá el contenido del archivo `add-notification-fields.sql`
6. Click en **Run** para ejecutar el script

### Opción 2: Desde la terminal (si tenés Supabase CLI)

```bash
supabase db push
```

## Migraciones disponibles

### `add-notification-fields.sql`
**Fecha**: 2025-11-14
**Descripción**: Agrega nuevas columnas de notificaciones a la tabla `notification_preferences`

**Columnas agregadas:**
- `email_on_link_deactivated` (BOOLEAN, default: false)
- `email_on_gallery_archived` (BOOLEAN, default: false)
- `email_on_gallery_deleted` (BOOLEAN, default: true)

**Usar cuando:**
- Aparece el error: "Error saving preferences"
- Después de actualizar el código de notificaciones
- Cuando agregues nuevas opciones de notificación en la configuración

## Verificar que se ejecutó correctamente

Después de ejecutar la migración, podés verificar ejecutando este query en el SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'notification_preferences'
ORDER BY ordinal_position;
```

Deberías ver las 3 nuevas columnas en el resultado.
