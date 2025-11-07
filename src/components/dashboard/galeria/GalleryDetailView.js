'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Mail, Eye, Image as ImageIcon, Share2, Edit, Globe, Lock, ArrowLeft, ChevronLeft, ChevronRight, HardDrive } from 'lucide-react';
import ShareGalleryModal from './ShareGalleryModal';
import PhotoUploader from './PhotoUploader';

export default function GalleryDetailView({ gallery }) {
  const router = useRouter();
  
  // Estados
  const [showShareModal, setShowShareModal] = useState(false);
  const [photosPage, setPhotosPage] = useState(0);
  
  const PHOTOS_PER_PAGE = 20;

  // Desestructurar galería
  const {
    id,
    title,
    slug,
    description,
    event_date,
    client_email,
    cover_image,
    is_public,
    views_count,
    photos,
    created_at,
  } = gallery;

  // Calcular tamaño total
  const totalSize = photos?.reduce((sum, photo) => sum + (photo.file_size || 0), 0) || 0;
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

  // Formatear fecha
  const formattedDate = event_date
    ? new Date(event_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  const handleUploadComplete = () => {
    router.refresh();
  };

  // Calcular páginas
  const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
  const startIdx = photosPage * PHOTOS_PER_PAGE;
  const endIdx = startIdx + PHOTOS_PER_PAGE;
  const photosToShow = photos.slice(startIdx, endIdx);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-black/10 p-8">
        <button
          onClick={() => router.push('/dashboard/galerias')}
          className="flex items-center gap-2 text-black/60 hover:text-black transition-colors mb-6 font-fira text-sm"
        >
          <ArrowLeft size={16} />
          Volver a galerías
        </button>

        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-voga text-3xl text-black">
                {title}
              </h1>
              {is_public ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-fira text-xs font-medium">
                  <Globe size={12} />
                  Pública
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-fira text-xs font-medium">
                  <Lock size={12} />
                  Privada
                </span>
              )}
            </div>

            {description && (
              <p className="font-fira text-sm text-black/60 mb-4 max-w-2xl">
                {description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {formattedDate && (
                <div className="flex items-center gap-2 text-black/60">
                  <Calendar size={16} />
                  <span className="font-fira">{formattedDate}</span>
                </div>
              )}
              {client_email && (
                <div className="flex items-center gap-2 text-black/60">
                  <Mail size={16} />
                  <span className="font-fira">{client_email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 bg-brown hover:bg-brown/90 text-white rounded-lg transition-colors flex items-center gap-2 font-fira text-sm font-medium"
            >
              <Share2 size={16} />
              Compartir
            </button>
            <button
              onClick={() => alert('Editar galería - próximamente')}
              className="px-4 py-2.5 border-2 border-black/20 text-black hover:bg-black/5 rounded-lg transition-colors flex items-center gap-2 font-fira text-sm font-medium"
            >
              <Edit size={16} />
              Editar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-black/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-beige/30 rounded-lg">
              <ImageIcon size={20} className="text-brown" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-voga text-2xl text-black">
                {photos.length}
              </p>
              <p className="font-fira text-xs text-black/60">
                {photos.length === 1 ? 'Foto' : 'Fotos'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-beige/30 rounded-lg">
              <Eye size={20} className="text-brown" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-voga text-2xl text-black">
                {views_count || 0}
              </p>
              <p className="font-fira text-xs text-black/60">
                Vistas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-beige/30 rounded-lg">
              <Share2 size={20} className="text-brown" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-voga text-2xl text-black">
                {is_public ? 'Pública' : 'Privada'}
              </p>
              <p className="font-fira text-xs text-black/60">
                Visibilidad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-beige/30 rounded-lg">
              <HardDrive size={20} className="text-brown" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-voga text-2xl text-black">
                {totalSizeMB} MB
              </p>
              <p className="font-fira text-xs text-black/60">
                Peso total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subida de fotos */}
      <div className="bg-white rounded-xl border border-black/10 p-8">
        <h2 className="font-voga text-xl text-black mb-6">
          Agregar fotos
        </h2>
        <PhotoUploader
          galleryId={id}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Grid de fotos */}
      <div className="bg-white rounded-xl border border-black/10 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-voga text-xl text-black">
            Fotos ({photos.length})
          </h2>

          {photos.length > PHOTOS_PER_PAGE && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPhotosPage(p => Math.max(0, p - 1))}
                disabled={photosPage === 0}
                className="p-2 border border-black/20 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-fira text-sm text-black/60 px-2">
                {photosPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPhotosPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={photosPage === totalPages - 1}
                className="p-2 border border-black/20 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={48} className="text-black/20 mx-auto mb-4" strokeWidth={1} />
            <p className="font-fira text-sm text-black/60">
              Esta galería aún no tiene fotos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photosToShow.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-beige/20 rounded-lg overflow-hidden"
              >
                <Image
                  src={photo.file_path}
                  alt={photo.file_name || `Foto ${startIdx + index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de compartir */}
      {showShareModal && (
        <ShareGalleryModal
          galleryId={id}
          gallerySlug={slug}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}