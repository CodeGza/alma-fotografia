# Sistema de Auto-Refresh

## Descripción General

El sistema de auto-refresh mantiene el contenido del dashboard actualizado automáticamente sin necesidad de recargar la página completa. Los datos se actualizan cada 10 minutos de forma transparente para el usuario.

## Características

✅ **Sin recargas completas**: Usa `router.refresh()` de Next.js para actualizar solo los datos dinámicos
✅ **Invisible para el usuario**: No hay parpadeos ni saltos visuales
✅ **Configurable**: Intervalos ajustables por sección
✅ **Inteligente**: Refresca al recuperar el foco de la ventana o la conexión
✅ **Optimizado**: Previene múltiples refreshes simultáneos

## Archivos Principales

### 1. Hook: `src/hooks/useAutoRefresh.js`

Hook personalizado que maneja toda la lógica del auto-refresh.

**Funciones principales:**
- `useAutoRefresh()`: Hook completo con todas las opciones
- `useSimpleAutoRefresh()`: Versión simplificada para uso común

**Características:**
- Intervalo configurable (por defecto 10 minutos)
- Refresh al recuperar foco de ventana (si estuvo más de 1 minuto inactiva)
- Refresh al recuperar conexión a internet
- Prevención de refreshes simultáneos
- Callbacks personalizados opcionales

### 2. Configuración: `src/lib/auto-refresh-config.js`

Archivo centralizado para ajustar los intervalos de actualización.

```javascript
export const AUTO_REFRESH_CONFIG = {
  DEFAULT_INTERVAL: 10 * 60 * 1000,  // 10 minutos
  DASHBOARD: 10 * 60 * 1000,
  BOOKINGS: 10 * 60 * 1000,
  NOTIFICATIONS: 10 * 60 * 1000,
  GALLERIES: 10 * 60 * 1000,
  TESTIMONIALS: 10 * 60 * 1000,
};
```

## Componentes con Auto-Refresh

El sistema está implementado en los siguientes componentes:

### Dashboard Layout
📁 `src/components/dashboard/DashboardLayoutClient.js`
- Auto-refresh global para todo el dashboard

### Widgets del Dashboard Principal
📁 `src/components/dashboard/PendingBookingsWidget.js`
- Reservas pendientes de aprobación

📁 `src/components/dashboard/UpcomingEventsWidget.js`
- Próximos eventos confirmados

📁 `src/components/dashboard/RecentNotificationsWidget.js`
- Notificaciones recientes del sistema

### Páginas
📁 `src/app/dashboard/agenda/page.js`
- Página completa de agenda/calendario

## Uso Básico

### Opción 1: Uso Simplificado (Recomendado)

```javascript
import { useSimpleAutoRefresh } from '@/hooks/useAutoRefresh';

export default function MiComponente() {
  // Auto-refresh cada 10 minutos
  useSimpleAutoRefresh(10);

  return (
    // Tu componente...
  );
}
```

### Opción 2: Uso Avanzado

```javascript
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

export default function MiComponente() {
  const { refresh, resetTimer } = useAutoRefresh({
    interval: 600000,              // 10 minutos en ms
    enabled: true,                 // Habilitar/deshabilitar
    refreshOnFocus: true,          // Refresh al volver a la ventana
    refreshOnReconnect: true,      // Refresh al recuperar conexión
    onRefresh: async () => {       // Callback opcional antes del refresh
      console.log('Refrescando datos...');
      // Lógica personalizada aquí
    }
  });

  // Puedes forzar un refresh manualmente
  const handleManualRefresh = () => {
    refresh();
  };

  return (
    // Tu componente...
  );
}
```

## Cómo Ajustar los Intervalos

### Para cambiar el intervalo globalmente:

Edita `src/lib/auto-refresh-config.js`:

```javascript
export const AUTO_REFRESH_CONFIG = {
  // Cambiar a 5 minutos
  DEFAULT_INTERVAL: 5 * 60 * 1000,

  // O por sección específica
  DASHBOARD: 5 * 60 * 1000,
  BOOKINGS: 3 * 60 * 1000,  // 3 minutos para reservas
};
```

### Para cambiar en un componente específico:

```javascript
// En lugar de 10, usa el número de minutos que desees
useSimpleAutoRefresh(5);  // Refresh cada 5 minutos
```

## Comportamiento Inteligente

### 1. Refresh al Volver a la Ventana
Si el usuario cambia de pestaña y vuelve después de más de 1 minuto, el sistema refresca automáticamente los datos.

### 2. Refresh al Recuperar Conexión
Si se pierde la conexión a internet y se recupera, el sistema refresca los datos automáticamente.

### 3. Prevención de Refreshes Múltiples
El sistema evita que múltiples refreshes se ejecuten simultáneamente, protegiendo el rendimiento.

## Funcionamiento Interno

1. **useAutoRefresh** configura un `setInterval` que llama a `router.refresh()`
2. **router.refresh()** es una función de Next.js que:
   - Refetch los datos de Server Components
   - Actualiza el DOM con los nuevos datos
   - NO recarga la página completa
   - Mantiene el estado de Client Components
3. Los listeners de eventos (`visibilitychange`, `online`) detectan cambios de contexto
4. Un sistema de refs previene refreshes simultáneos

## Ventajas

✅ **Mejor UX**: El usuario siempre ve información actualizada
✅ **Sin interrupciones**: No hay reloads molestos
✅ **Eficiente**: Solo actualiza cuando es necesario
✅ **Flexible**: Fácil de configurar y extender
✅ **Mantenible**: Código centralizado y reutilizable

## Consideraciones

- El auto-refresh funciona mejor con Server Components que fetch datos
- Los Client Components mantienen su estado durante el refresh
- El intervalo de 10 minutos es un balance entre actualidad y carga del servidor
- Para datos más críticos (como notificaciones), considera usar Supabase Realtime

## Testing

Para verificar que el auto-refresh funciona:

1. Abre el dashboard
2. Abre las DevTools de Chrome
3. Ve a Console
4. Verás que cada 10 minutos (o el intervalo configurado) se ejecuta el refresh
5. También puedes probar cambiando de pestaña y volviendo después de 1 minuto

## Troubleshooting

### El refresh no funciona
- Verifica que el componente sea 'use client'
- Asegúrate de que router.refresh() tenga datos para actualizar
- Revisa la consola del navegador por errores

### Demasiados refreshes
- Reduce el intervalo en la configuración
- Desactiva refreshOnFocus o refreshOnReconnect si es necesario

### Refresh causa parpadeos
- Verifica que estés usando Server Components para los datos
- Asegúrate de que los Client Components no se re-montan innecesariamente

## Próximas Mejoras Posibles

- [ ] Agregar indicador visual cuando se está refrescando
- [ ] Implementar Supabase Realtime para actualizaciones en tiempo real
- [ ] Agregar opción de deshabilitar auto-refresh desde configuración de usuario
- [ ] Métricas y analytics sobre el uso del auto-refresh
