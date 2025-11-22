'use client';

import { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * REDISEÑO UI - StorageCard
 *
 * PALETA BLANCO PREDOMINANTE:
 * - Fondo: #FFFFFF (blanco)
 * - Bordes: #E5E7EB (gris sutil)
 * - Texto: #2D2D2D (oscuro)
 * - Iconos: #8B5E3C (marrón)
 * - Barra: Verde/Marrón/Rojo según uso
 * - Badges: Colores funcionales
 *
 * Funcionalidad preservada:
 * - Fetch de datos de Cloudinary
 * - Estados: loading, error, success
 * - Botón de actualización
 * - Cálculo de porcentaje y estados
 * - Conversión MB/GB
 */
export default function StorageCard() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUsage = async () => {
    setLoading(true);
    setError(false);
    
    try {
      // Evitar cache del navegador con timestamp
      const timestamp = Date.now();
      const response = await fetch(`/api/cloudinary-usage?t=${timestamp}`, {
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsage(data.usage);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Error fetching storage:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  /**
   * Determina el color y mensaje según el porcentaje de uso
   */
  const getStatusConfig = (percentage) => {
    if (percentage >= 90) {
      return {
        color: 'bg-red-600',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        message: 'Crítico',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      };
    } else if (percentage >= 75) {
      return {
        color: 'bg-red-600',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        message: 'Alto',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      };
    } else if (percentage >= 50) {
      return {
        color: 'bg-[#8B5E3C]',
        textColor: 'text-[#8B5E3C]',
        bgColor: 'bg-[#8B5E3C]/10',
        message: 'Moderado',
        icon: <HardDrive className="w-5 h-5 text-[#8B5E3C]" />
      };
    } else {
      return {
        color: 'bg-green-600',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        message: 'Disponible',
        icon: <HardDrive className="w-5 h-5 text-green-600" />
      };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-gray-400 animate-pulse" />
          <h3 className="font-semibold text-gray-400">
            Almacenamiento
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !usage) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-[#8B5E3C]" />
            <h3 className="font-semibold text-[#2D2D2D]">
              Almacenamiento
            </h3>
          </div>
          <button
            onClick={fetchUsage}
            className="text-[#8B5E3C] hover:text-[#6d4a2f] transition-colors duration-200 p-2 hover:bg-gray-50 rounded-lg"
            title="Reintentar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          No disponible
        </p>
      </div>
    );
  }

  const percentage = parseFloat(usage.percentage) || 0;
  const statusConfig = getStatusConfig(percentage);

  // Mostrar MB si es menos de 1 GB, sino GB
  const displayValue = parseFloat(usage.storageGB) >= 1
    ? usage.storageGB
    : usage.storageMB;
  const displayUnit = parseFloat(usage.storageGB) >= 1 ? 'GB' : 'MB';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {statusConfig.icon}
          <h3 className="font-semibold text-[#2D2D2D]">
            Almacenamiento
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1 rounded-lg ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            {statusConfig.message}
          </span>
          <button
            onClick={fetchUsage}
            className="text-[#8B5E3C] hover:text-[#6d4a2f] transition-all duration-200 disabled:opacity-50 p-2 hover:bg-gray-50 rounded-lg"
            disabled={loading}
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Uso actual */}
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="text-3xl text-[#2D2D2D] font-light">
            {displayValue}
          </span>
          <span className="text-sm text-gray-600 pb-1">
            {displayUnit} / {usage.limitGB} GB
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`${statusConfig.color} h-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Info adicional */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {percentage < 0.1 ? '< 0.1' : percentage}% usado
          </p>
          {usage.filesCount !== undefined && (
            <p className="text-xs text-gray-500">
              {usage.filesCount} {usage.filesCount === 1 ? 'archivo' : 'archivos'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}