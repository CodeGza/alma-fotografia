import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import JSZip from 'jszip';

/**
 * API Route para descargar todas las fotos de una galería como ZIP
 *
 * GET /api/download-gallery?galleryId=xxx&pin=xxxx
 *
 * IMPORTANTE: Usa createAdminClient() para bypassear RLS ya que las descargas
 * son públicas y protegidas por PIN si está configurado
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');
    const pin = searchParams.get('pin');

    if (!galleryId) {
      return NextResponse.json(
        { error: 'galleryId es requerido' },
        { status: 400 }
      );
    }

    // Usar admin client para bypassear RLS (protegido por PIN si está configurado)
    const supabase = createAdminClient();

    // Obtener información de la galería
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, title, slug, download_pin, allow_downloads')
      .eq('id', galleryId)
      .single();

    if (galleryError || !gallery) {
      return NextResponse.json(
        { error: 'Galería no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la galería permite descargas
    if (!gallery.allow_downloads) {
      return NextResponse.json(
        { error: 'Esta galería no permite descargas' },
        { status: 403 }
      );
    }

    // Verificar PIN si está configurado
    if (gallery.download_pin && gallery.download_pin !== pin) {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 403 }
      );
    }

    // Obtener todas las fotos de la galería
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, file_name, file_path')
      .eq('gallery_id', galleryId)
      .order('display_order', { ascending: true });

    if (photosError) {
      throw new Error('Error al obtener fotos: ' + photosError.message);
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'La galería no tiene fotos' },
        { status: 404 }
      );
    }

    // Crear ZIP
    const zip = new JSZip();
    const folder = zip.folder(gallery.slug || gallery.title);

    console.log(`[download-gallery] Iniciando descarga de ${photos.length} fotos`);
    const startTime = Date.now();

    // ==========================================
    // OPTIMIZACIÓN: Descargar fotos en lotes paralelos
    // ==========================================
    const BATCH_SIZE = 20; // Descargar 20 fotos a la vez (aumentado de 10)
    const batches = [];

    for (let i = 0; i < photos.length; i += BATCH_SIZE) {
      batches.push(photos.slice(i, i + BATCH_SIZE));
    }

    console.log(`[download-gallery] Procesando en ${batches.length} lotes de máximo ${BATCH_SIZE} fotos`);

    // Procesar cada lote en paralelo
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartTime = Date.now();

      // Descargar todas las fotos del lote en paralelo
      const downloadPromises = batch.map(async (photo, indexInBatch) => {
        const globalIndex = batchIndex * BATCH_SIZE + indexInBatch;
        const url = photo.file_path;

        // Generar nombre coherente: slug-galeria-001.jpg (siempre JPG)
        const paddedNumber = String(globalIndex + 1).padStart(3, '0');
        const fileName = `${gallery.slug || 'galeria'}-${paddedNumber}.jpg`;

        // Obtener la versión optimizada de Cloudinary en formato JPG
        let downloadUrl = url;
        if (url.includes('cloudinary.com')) {
          // Usar q_85 y ancho máximo 2048px (excelente calidad, archivos más pequeños)
          downloadUrl = url.replace(/\/upload\/.*?\//g, '/upload/f_jpg,q_85,w_2048/');
        }

        try {
          // Descargar la imagen con timeout de 10 segundos
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(downloadUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(`[download-gallery] Error descargando foto ${photo.id}:`, response.statusText);
            return null;
          }

          const arrayBuffer = await response.arrayBuffer();
          return { fileName, arrayBuffer };
        } catch (error) {
          if (error.name === 'AbortError') {
            console.error(`[download-gallery] Timeout descargando foto ${photo.id}`);
          } else {
            console.error(`[download-gallery] Error procesando foto ${photo.id}:`, error);
          }
          return null;
        }
      });

      // Esperar a que termine todo el lote
      const results = await Promise.all(downloadPromises);

      // Agregar las fotos exitosas al ZIP
      let successCount = 0;
      for (const result of results) {
        if (result) {
          folder.file(result.fileName, result.arrayBuffer);
          successCount++;
        }
      }

      const batchTime = Date.now() - batchStartTime;
      console.log(`[download-gallery] Lote ${batchIndex + 1}/${batches.length}: ${successCount}/${batch.length} fotos descargadas en ${batchTime}ms`);
    }

    const downloadTime = Date.now() - startTime;
    console.log(`[download-gallery] Todas las descargas completadas en ${downloadTime}ms`);

    // Generar el ZIP sin compresión (instantáneo, ya que JPG ya está comprimido)
    console.log(`[download-gallery] Generando ZIP...`);
    const zipStartTime = Date.now();

    const zipBlob = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'STORE', // Sin compresión (JPG ya está comprimido)
      compressionOptions: { level: 0 }
    });

    const zipTime = Date.now() - zipStartTime;
    const totalTime = Date.now() - startTime;
    console.log(`[download-gallery] ZIP generado en ${zipTime}ms (${(zipBlob.length / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`[download-gallery] Tiempo total: ${totalTime}ms`);

    // Nombre del archivo ZIP
    const zipFileName = `${gallery.slug || gallery.title.toLowerCase().replace(/\s+/g, '-')}.zip`;

    // Retornar el ZIP
    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Content-Length': zipBlob.length.toString(),
      },
    });

  } catch (error) {
    console.error('[download-gallery] Error:', error);
    return NextResponse.json(
      { error: 'Error al generar el ZIP: ' + error.message },
      { status: 500 }
    );
  }
}
