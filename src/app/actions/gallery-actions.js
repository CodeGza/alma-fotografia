'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

/**
 * ============================================
 * SERVER ACTIONS - GESTIÓN DE GALERÍAS EN BATCH
 * ============================================
 * 
 * Acciones del servidor para manipular múltiples galerías a la vez.
 * Incluye: archivar, eliminar (con Cloudinary) y restaurar.
 * 
 * IMPORTANTE:
 * - Todas las acciones revalidan /dashboard/galerias
 * - deleteGalleries elimina carpetas completas de Cloudinary (más eficiente)
 * - archiveGalleries desactiva automáticamente enlaces compartidos
 */

// ============================================
// ARCHIVAR GALERÍAS
// ============================================

/**
 * Archivar múltiples galerías
 * 
 * - Marca archived_at con timestamp actual
 * - Desactiva todos los enlaces compartidos asociados
 * - No elimina datos de Supabase ni Cloudinary
 * 
 * @param {string[]} galleryIds - IDs de galerías a archivar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function archiveGalleries(galleryIds) {
  try {
    const supabase = await createClient();

    // Archivar galerías
    const { error: archiveError } = await supabase
      .from('galleries')
      .update({ archived_at: new Date().toISOString() })
      .in('id', galleryIds);

    if (archiveError) throw archiveError;

    // Desactivar enlaces compartidos (no crítico si falla)
    const { error: linksError } = await supabase
      .from('gallery_shares')
      .update({ is_active: false })
      .in('gallery_id', galleryIds);

    if (linksError) {
      console.error('⚠️ Error desactivando enlaces:', linksError);
      // No throw - la galería se archivó correctamente
    }

    revalidatePath('/dashboard/galerias');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error archiving galleries:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ELIMINAR GALERÍAS
// ============================================

/**
 * Eliminar permanentemente múltiples galerías
 * 
 * ORDEN DE OPERACIONES:
 * 1. Eliminar carpetas completas de Cloudinary (galleries/{id}/)
 * 2. Eliminar portadas individuales (gallery-covers/)
 * 3. Eliminar registros de Supabase (CASCADE elimina fotos y shares)
 * 
 * NOTA: Si falla Cloudinary, igual elimina de BD (evita orphan records)
 * 
 * @param {string[]} galleryIds - IDs de galerías a eliminar
 * @returns {Promise<{success: boolean, deletedFolders?: number, totalGalleries?: number, error?: string}>}
 */
export async function deleteGalleries(galleryIds) {
  try {
    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    // ==========================================
    // PASO 1: Eliminar carpetas de Cloudinary
    // ==========================================
    
    const deleteFolderPromises = galleryIds.map(async (galleryId) => {
      const folderPath = `galleries/${galleryId}`;
      
      try {
        const response = await fetch(`${baseUrl}/api/cloudinary/delete-folder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: folderPath }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`⚠️ No se pudo eliminar carpeta ${folderPath}:`, errorText);
          return { galleryId, success: false };
        }
        
        console.log(`✅ Carpeta eliminada: ${folderPath}`);
        return { galleryId, success: true };
      } catch (error) {
        console.error(`❌ Error eliminando carpeta ${folderPath}:`, error);
        return { galleryId, success: false };
      }
    });

    const deleteResults = await Promise.all(deleteFolderPromises);
    const successCount = deleteResults.filter(r => r.success).length;

    console.log(`📊 Cloudinary: ${successCount}/${galleryIds.length} carpetas eliminadas`);

    // ==========================================
    // PASO 2: Eliminar portadas (gallery-covers)
    // ==========================================
    
    const { data: galleries } = await supabase
      .from('galleries')
      .select('cover_image')
      .in('id', galleryIds);

    if (galleries && galleries.length > 0) {
      // Extraer public_ids de portadas
      const coverPublicIds = galleries
        .filter(g => g.cover_image && g.cover_image.includes('gallery-covers'))
        .map(g => {
          // Regex: https://res.cloudinary.com/.../v1234/PUBLIC_ID.format
          const match = g.cover_image.match(/\/v\d+\/(.+)\.\w+$/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      if (coverPublicIds.length > 0) {
        try {
          await fetch(`${baseUrl}/api/cloudinary/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicIds: coverPublicIds }),
          });
          console.log(`🖼️ ${coverPublicIds.length} portadas eliminadas`);
        } catch (error) {
          console.error('⚠️ Error eliminando portadas:', error);
          // No throw - continuar con la eliminación de BD
        }
      }
    }

    // ==========================================
    // PASO 3: Eliminar de Supabase
    // ==========================================
    
    // ON DELETE CASCADE elimina automáticamente:
    // - photos
    // - gallery_shares
    const { error: deleteError } = await supabase
      .from('galleries')
      .delete()
      .in('id', galleryIds);

    if (deleteError) throw deleteError;

    // Revalidar caché
    revalidatePath('/dashboard/galerias');
    
    return { 
      success: true, 
      deletedFolders: successCount,
      totalGalleries: galleryIds.length 
    };
  } catch (error) {
    console.error('❌ Error deleting galleries:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// RESTAURAR GALERÍAS
// ============================================

/**
 * Restaurar múltiples galerías archivadas
 * 
 * - Marca archived_at como null
 * - Las galerías vuelven a aparecer en la lista principal
 * - NO reactiva enlaces compartidos (deben reactivarse manualmente)
 * 
 * @param {string[]} galleryIds - IDs de galerías a restaurar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function restoreGalleries(galleryIds) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('galleries')
      .update({ archived_at: null })
      .in('id', galleryIds);

    if (error) throw error;

    revalidatePath('/dashboard/galerias');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error restoring galleries:', error);
    return { success: false, error: error.message };
  }
}