import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/galleries/storage?galleryId=xxx
 *
 * Obtiene el tamaño real de una galería desde Cloudinary
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');

    if (!galleryId) {
      return NextResponse.json(
        { success: false, error: 'galleryId requerido' },
        { status: 400 }
      );
    }

    // Buscar recursos en la carpeta de la galería
    const folderPath = `galleries/${galleryId}`;
    let totalBytes = 0;
    let totalCount = 0;
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        prefix: folderPath,
        max_results: 500,
        next_cursor: nextCursor
      });

      result.resources.forEach(resource => {
        totalBytes += resource.bytes || 0;
      });

      totalCount += result.resources.length;
      nextCursor = result.next_cursor;
    } while (nextCursor);

    // También buscar la portada (puede estar en gallery-covers/{galleryId})
    try {
      const coverResult = await cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        prefix: `gallery-covers/${galleryId}`,
        max_results: 10
      });

      coverResult.resources.forEach(resource => {
        totalBytes += resource.bytes || 0;
      });
      totalCount += coverResult.resources.length;
    } catch {
      // Ignorar si no hay portada en esa carpeta
    }

    const sizeMB = (totalBytes / (1024 * 1024)).toFixed(1);

    return NextResponse.json({
      success: true,
      storage: {
        bytes: totalBytes,
        sizeMB,
        filesCount: totalCount
      }
    });

  } catch (error) {
    console.error('Error obteniendo storage de galería:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener almacenamiento' },
      { status: 500 }
    );
  }
}
