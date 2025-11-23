'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook personalizado para implementar auto-refresco de datos
 *
 * @param {Object} options - Opciones de configuración
 * @param {number} options.interval - Intervalo en milisegundos (por defecto 600000 = 10 minutos)
 * @param {Function} options.onRefresh - Callback opcional que se ejecuta antes del refresh
 * @param {boolean} options.enabled - Si el auto-refresh está habilitado (por defecto true)
 * @param {boolean} options.refreshOnFocus - Si debe refrescar cuando la ventana recupera el foco (por defecto true)
 * @param {boolean} options.refreshOnReconnect - Si debe refrescar cuando se recupera la conexión (por defecto true)
 *
 * @returns {Object} - Objeto con funciones de control
 */
export function useAutoRefresh({
  interval = 600000, // 10 minutos por defecto
  onRefresh = null,
  enabled = true,
  refreshOnFocus = true,
  refreshOnReconnect = true,
} = {}) {
  const router = useRouter();
  const intervalRef = useRef(null);
  const lastRefreshRef = useRef(Date.now());
  const isRefreshingRef = useRef(false);

  // Función de refresh que evita múltiples llamadas simultáneas
  const refresh = useCallback(async () => {
    if (isRefreshingRef.current || !enabled) return;

    isRefreshingRef.current = true;
    lastRefreshRef.current = Date.now();

    try {
      // Ejecutar callback personalizado si existe
      if (onRefresh) {
        await onRefresh();
      }

      // Refrescar la ruta actual sin reload completo
      router.refresh();
    } catch (error) {
      console.error('Error durante auto-refresh:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [router, onRefresh, enabled]);

  // Configurar intervalo de auto-refresh
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Limpiar intervalo anterior si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Configurar nuevo intervalo
    intervalRef.current = setInterval(() => {
      refresh();
    }, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled, refresh]);

  // Refresh al recuperar el foco de la ventana
  useEffect(() => {
    if (!refreshOnFocus || !enabled) return;

    const handleVisibilityChange = () => {
      // Solo refrescar si la página está visible y ha pasado al menos 1 minuto desde el último refresh
      if (document.visibilityState === 'visible') {
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
        if (timeSinceLastRefresh > 60000) { // 1 minuto
          refresh();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshOnFocus, enabled, refresh]);

  // Refresh al recuperar la conexión
  useEffect(() => {
    if (!refreshOnReconnect || !enabled) return;

    const handleOnline = () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
      if (timeSinceLastRefresh > 60000) { // 1 minuto
        refresh();
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshOnReconnect, enabled, refresh]);

  // Función para forzar un refresh manual
  const forceRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Función para resetear el timer
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        refresh();
      }, interval);
    }
  }, [interval, refresh]);

  return {
    refresh: forceRefresh,
    resetTimer,
    isRefreshing: isRefreshingRef.current,
    lastRefresh: lastRefreshRef.current,
  };
}

/**
 * Hook simplificado para auto-refresh con configuración por defecto
 * Útil para la mayoría de los casos de uso
 */
export function useSimpleAutoRefresh(intervalMinutes = 10) {
  return useAutoRefresh({
    interval: intervalMinutes * 60 * 1000,
    enabled: true,
    refreshOnFocus: true,
    refreshOnReconnect: true,
  });
}
