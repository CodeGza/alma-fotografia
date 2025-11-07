import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    console.log('🚀 API Upload iniciada');

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'gallery-covers';
    const resourceType = formData.get('resourceType') || 'image';

    console.log('📁 Folder:', folder);
    console.log('📄 File:', file?.name, file?.type);

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convertir File a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    console.log('📤 Subiendo a Cloudinary...');

    // Subir a Cloudinary
    const result = await uploadToCloudinary(base64, {
      folder,
      resourceType,
    });

    if (!result.success) {
      console.error('❌ Upload failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('✅ Upload exitoso:', result.url);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}