'use client';

import { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';

export default function StorageCard() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch('/api/cloudinary-usage');
        const data = await response.json();
        
        if (data.success) {
          setUsage(data.usage);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, []);

  // Determinar color y mensaje según porcentaje
  const getStatusConfig = (percentage) => {
    if (percentage >= 90) {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-600',
        message: 'Almacenamiento crítico',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      };
    } else if (percentage >= 75) {
      return {
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        message: 'Almacenamiento alto',
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" />
      };
    } else if (percentage >= 50) {
      return {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        message: 'Espacio moderado',
        icon: <HardDrive className="w-5 h-5 text-yellow-600" />
      };
    } else {
      return {
        color: 'bg-brown',
        textColor: 'text-brown',
        message: 'Espacio disponible',
        icon: <HardDrive className="w-5 h-5 text-brown" />
      };
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-black/20 animate-pulse" />
          <h3 className="font-fira font-semibold text-black/40">
            Almacenamiento
          </h3>
        </div>
        <p className="font-fira text-sm text-black/40">Cargando...</p>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-black/40" />
          <h3 className="font-fira font-semibold text-black">
            Almacenamiento
          </h3>
        </div>
        <p className="font-fira text-sm text-black/60">
          No disponible
        </p>
      </div>
    );
  }

  const percentage = parseFloat(usage.percentage) || 0;
  const statusConfig = getStatusConfig(percentage);

  return (
    <div className="bg-white border border-black/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {statusConfig.icon}
          <h3 className="font-fira font-semibold text-black">
            Almacenamiento
          </h3>
        </div>
        <span className={`font-fira text-xs font-medium ${statusConfig.textColor}`}>
          {statusConfig.message}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="font-voga text-3xl text-black">
            {usage.storageGB}
          </span>
          <span className="font-fira text-sm text-black/60 pb-1">
            / {usage.limitGB} GB
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`${statusConfig.color} h-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <p className="font-fira text-xs text-black/50">
          {percentage.toFixed(1)}% usado
        </p>
      </div>
    </div>
  );
}