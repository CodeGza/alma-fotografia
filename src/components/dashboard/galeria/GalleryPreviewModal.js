'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Eye, ImageIcon, Heart, Share2, Edit } from 'lucide-react';

/**
 * GalleryPreviewModal - Preview rápido sin salir de la página
 * 
 * Muestra:
 * - Primeras 6-9 fotos en grid
 * - Stats principales
 * - Acciones rápidas
 */
export default function GalleryPreviewModal({ gallery, onClose, onShare, onEdit }) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    id,
    title,
    photoCount,
    views_count,
    favorites_count,
    has_active_link,
    photos = [], // Array de las primeras fotos
  } = gallery;

  const displayViews = has_active_link ? (views_count || 0) : 'Sin enlace';
  const previewPhotos = photos.slice(0, 9); // Máximo 9 fotos

  const handleViewFull = () => {
    router.push(`/dashboard/galerias/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-[#2d2d2d] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <h3 className="font-voga text-xl text-white truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded">
                <ImageIcon size={16} className="text-[#79502A]" />
              </div>
              <div>
                <p className="font-fira text-lg font-bold text-white">{photoCount}</p>
                <p className="font-fira text-xs text-white/60">Fotos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded">
                <Eye size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="font-fira text-lg font-bold text-white">{displayViews}</p>
                <p className="font-fira text-xs text-white/60">Vistas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded">
                <Heart size={16} className={favorites_count > 0 ? 'text-pink-400' : 'text-white/40'} />
              </div>
              <div>
                <p className={`font-fira text-lg font-bold ${favorites_count > 0 ? 'text-white' : 'text-white/40'}`}>
                  {favorites_count}
                </p>
                <p className="font-fira text-xs text-white/60">Favoritos</p>
              </div>
            </div>
          </div>

          {/* Grid de fotos preview */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {previewPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={photo.file_path}
                  alt={`Foto ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 33vw, 200px"
                />
              </div>
            ))}

            {/* Placeholder si hay más fotos */}
            {photoCount > 9 && (
              <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <p className="font-fira text-2xl font-bold text-white">+{photoCount - 9}</p>
                  <p className="font-fira text-xs text-white/60">más fotos</p>
                </div>
              </div>
            )}
          </div>

          {/* Mensaje si no hay fotos cargadas */}
          {previewPhotos.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon size={48} className="text-white/40 mx-auto mb-4" />
              <p className="font-fira text-sm text-white/60">
                No hay fotos para mostrar en el preview
              </p>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex gap-3">
          <button
            onClick={onShare}
            className="flex-1 py-3 bg-[#79502A] hover:bg-[#8B5A2F] !text-white rounded-lg transition-colors font-fira text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            Compartir
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-fira text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Edit size={16} />
            Editar
          </button>
          <button
            onClick={handleViewFull}
            className="flex-1 py-3 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors font-fira text-sm font-semibold"
          >
            Ver galería completa →
          </button>
        </div>
      </div>
    </div>
  );
}