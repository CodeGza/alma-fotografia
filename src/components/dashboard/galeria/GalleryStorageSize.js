'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * GalleryStorageSize - Muestra el tamaño real de la galería desde Cloudinary
 * Carga de forma asíncrona sin bloquear el resto de la página
 */
export default function GalleryStorageSize({ galleryId }) {
  const [size, setSize] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!galleryId) return;

    const fetchSize = async () => {
      try {
        const response = await fetch(`/api/galleries/storage?galleryId=${galleryId}`);
        const data = await response.json();

        if (data.success) {
          setSize(data.storage.sizeMB);
        }
      } catch (error) {
        console.error('Error fetching gallery size:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSize();
  }, [galleryId]);

  if (loading) {
    return (
      <span className="flex items-center gap-1.5">
        <Loader2 size={14} className="animate-spin" />
        <span>...</span>
      </span>
    );
  }

  if (!size) {
    return <span>--</span>;
  }

  return <span>{size} MB</span>;
}
