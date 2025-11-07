import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/cloudinary-usage
 * 
 * Obtiene el uso real de Cloudinary
 */
export async function GET() {
  try {
    const usage = await cloudinary.api.usage();

    // Convertir bytes a GB
    const storageUsageBytes = usage.storage?.usage || 0;
    const storageLimitBytes = usage.storage?.limit || 26843545600; // 25GB por defecto

    const storageGB = (storageUsageBytes / 1024 / 1024 / 1024).toFixed(2);
    const limitGB = (storageLimitBytes / 1024 / 1024 / 1024).toFixed(0); // Sin decimales

    const percentage = storageLimitBytes > 0
      ? ((storageUsageBytes / storageLimitBytes) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      usage: {
        storageGB: storageGB,
        limitGB: limitGB,
        percentage: percentage,
        raw: {
          bytes: storageUsageBytes,
          limit: storageLimitBytes
        }
      }
    });
  } catch (error) {
    console.error('Error getting Cloudinary usage:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}