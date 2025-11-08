import { NextResponse } from 'next/server';
import { getActualStorageUsage, getStorageLimit } from '@/lib/cloudinary-helpers';

// Desactivar cache de Next.js para siempre obtener datos frescos
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cloudinary-usage
 * 
 * Obtiene el uso REAL de almacenamiento calculado desde los recursos
 * (más preciso que cloudinary.api.usage() que tiene delay)
 */
export async function GET() {
  try {
    // Obtener uso real y límite en paralelo
    const [actualUsage, limitBytes] = await Promise.all([
      getActualStorageUsage(),
      getStorageLimit()
    ]);

    const { bytes: storageUsageBytes, count: filesCount } = actualUsage;

    // Convertir a unidades legibles
    const storageMB = (storageUsageBytes / (1024 * 1024)).toFixed(2);
    const storageGB = (storageUsageBytes / (1024 ** 3)).toFixed(2);
    const limitGB = (limitBytes / (1024 ** 3)).toFixed(0);

    // Calcular porcentaje
    const percentage = limitBytes > 0
      ? ((storageUsageBytes / limitBytes) * 100).toFixed(1)
      : '0.0';

    // Log para debug
    console.log('📊 Storage actualizado:', {
      files: filesCount,
      used: `${storageMB} MB (${storageGB} GB)`,
      limit: `${limitGB} GB`,
      percentage: `${percentage}%`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      usage: {
        storageGB,
        storageMB,
        limitGB,
        percentage,
        filesCount,
        raw: {
          bytes: storageUsageBytes,
          limit: limitBytes
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo uso de Cloudinary:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'No se pudo obtener el uso de almacenamiento'
      },
      { status: 500 }
    );
  }
}