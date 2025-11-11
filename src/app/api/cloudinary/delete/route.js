import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * API Route: Eliminar fotos de Cloudinary
 * 
 * POST /api/cloudinary/delete
 * Body: { publicIds: string[] }
 */
export async function POST(request) {
  try {
    const { publicIds } = await request.json();

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { error: 'publicIds array is required' },
        { status: 400 }
      );
    }

    // Eliminar en batch (máximo 100 a la vez según docs de Cloudinary)
    const results = [];
    const chunks = [];
    
    // Dividir en chunks de 100
    for (let i = 0; i < publicIds.length; i += 100) {
      chunks.push(publicIds.slice(i, i + 100));
    }

    // Eliminar cada chunk
    for (const chunk of chunks) {
      try {
        const result = await cloudinary.api.delete_resources(chunk, {
          type: 'upload',
          resource_type: 'image',
        });
        results.push(result);
      } catch (error) {
        console.error('Error deleting chunk from Cloudinary:', error);
        // Continuar con el siguiente chunk aunque falle uno
      }
    }

    return NextResponse.json({ 
      success: true, 
      deleted: publicIds.length,
      results 
    });

  } catch (error) {
    console.error('Error in Cloudinary delete API:', error);
    return NextResponse.json(
      { error: 'Failed to delete from Cloudinary', details: error.message },
      { status: 500 }
    );
  }
}