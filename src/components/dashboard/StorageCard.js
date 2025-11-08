'use client';

import { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle, RefreshCw } from 'lucide-react';

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
        color: 'bg-red-500',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        message: 'Crítico',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      };
    } else if (percentage >= 75) {
      return {
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        message: 'Alto',
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" />
      };
    } else if (percentage >= 50) {
      return {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        message: 'Moderado',
        icon: <HardDrive className="w-5 h-5 text-yellow-600" />
      };
    } else {
      return {
        color: 'bg-brown',
        textColor: 'text-brown',
        bgColor: 'bg-brown/5',
        message: 'Disponible',
        icon: <HardDrive className="w-5 h-5 text-brown" />
      };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-black/20 animate-pulse" />
          <h3 className="font-fira font-semibold text-black/40">
            Almacenamiento
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-black/5 rounded animate-pulse" />
          <div className="h-2 bg-black/5 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !usage) {
    return (
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-black/40" />
            <h3 className="font-fira font-semibold text-black">
              Almacenamiento
            </h3>
          </div>
          <button
            onClick={fetchUsage}
            className="text-black/40 hover:text-black transition-colors"
            title="Reintentar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="font-fira text-sm text-black/60">
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
    <div className="bg-white border border-black/10 rounded-lg p-6">
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {statusConfig.icon}
          <h3 className="font-fira font-semibold text-black">
            Almacenamiento
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-fira text-xs font-medium px-2 py-1 rounded ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            {statusConfig.message}
          </span>
          <button
            onClick={fetchUsage}
            className="text-black/40 hover:text-black transition-colors disabled:opacity-50"
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
          <span className="font-voga text-3xl text-black">
            {displayValue}
          </span>
          <span className="font-fira text-sm text-black/60 pb-1">
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
          <p className="font-fira text-xs text-black/50">
            {percentage < 0.1 ? '< 0.1' : percentage}% usado
          </p>
          {usage.filesCount !== undefined && (
            <p className="font-fira text-xs text-black/40">
              {usage.filesCount} {usage.filesCount === 1 ? 'archivo' : 'archivos'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}