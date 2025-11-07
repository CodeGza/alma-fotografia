'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestUpload() {
  const [fileUrl, setFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const slug = 'test-gallery'; // Podés cambiarlo por el slug real de una galería

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const path = `${slug}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('gallery-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('❌ Error subiendo archivo:', error);
      alert('Error al subir la imagen.');
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(path);

    setFileUrl(publicUrlData.publicUrl);
    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-xl font-semibold">Prueba de subida de imagen</h1>

      <label className="rounded-lg bg-yellow-500 text-black px-4 py-2 cursor-pointer hover:bg-yellow-400">
        {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>

      {fileUrl && (
        <div className="mt-4 text-center">
          <p>✅ Imagen subida correctamente:</p>
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-yellow-400 underline">
            Ver imagen en Supabase
          </a>
          <div className="mt-4">
            <img src={fileUrl} alt="Preview" className="w-64 rounded-lg border border-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}
