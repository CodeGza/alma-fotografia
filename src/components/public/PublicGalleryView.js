'use client';

import { useState, useCallback, useEffect, memo, useRef } from 'react';
import Image from 'next/image';
import { Download, X, ChevronLeft, ChevronRight, Grid3x3, Heart, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicDownloadAllButton from '@/components/public/PublicDownloadAllButton';
import FavoritesSelector from '@/components/public/FavoritesSelector';
import TestimonialForm from '@/components/public/TestimonialForm';
import { toggleFavorite, getClientFavorites } from '@/app/actions/favorites-actions';

/**
 * PhotoGrid - Grid memoizado de fotos con indicador de favoritos
 */
const PhotoGrid = memo(({
  photos,
  galleryTitle,
  onPhotoClick,
  onDownload,
  onToggleFavorite,
  favoritePhotoIds,
  allowDownloads,
}) => {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {photos.map((photo, index) => {
        const isFavorite = favoritePhotoIds.includes(photo.id);

        return (
          <div
            key={photo.id}
            className="group relative break-inside-avoid mb-4"
          >
            <div
              className="relative w-full bg-beige/20 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => onPhotoClick(photo, index)}
            >
              <Image
                src={photo.file_path}
                alt={`${galleryTitle} - ${photo.file_name || `Foto ${index + 1}`}`}
                width={800}
                height={800}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                loading="lazy"
                quality={85}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Botones superpuestos */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Botón favorito */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(photo.id);
                  }}
                  className={`p-2.5 rounded-full shadow-lg transition-all ${
                    isFavorite
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                      : 'bg-white/90 hover:bg-white'
                  }`}
                  title={isFavorite ? 'Quitar de favoritas' : 'Agregar a favoritas'}
                >
                  <Heart
                    size={18}
                    className={isFavorite ? 'fill-white text-white' : 'text-pink-500'}
                  />
                </button>

                {/* Botón descargar */}
                {allowDownloads && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(photo);
                    }}
                    className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg"
                    title="Descargar foto"
                  >
                    <Download size={18} className="text-black" />
                  </button>
                )}
              </div>

              {/* Badge de favorita (siempre visible si está seleccionada) */}
              {isFavorite && (
                <div className="absolute top-4 right-4 p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg">
                  <Heart size={16} className="fill-white text-white" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

PhotoGrid.displayName = 'PhotoGrid';

/**
 * Componente principal - Vista pública profesional
 */
export default function PublicGalleryView({ gallery, token }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [clientEmail, setClientEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [favoritePhotoIds, setFavoritePhotoIds] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const hasRegisteredView = useRef(false);

  const {
    id: galleryId,
    title,
    eventDate,
    photos,
    coverImage,
    allowDownloads,
    maxFavorites,
    customMessage,
    allowComments,
  } = gallery;

  // Formatear fecha
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  // Cargar favoritos del cliente - Memoizado para evitar re-renders
  const loadFavorites = useCallback(async (email) => {
    if (!email) return;

    setIsLoadingFavorites(true);
    try {
      const result = await getClientFavorites(galleryId, email);
      if (result.success) {
        setFavoritePhotoIds(result.favorites.map(f => f.photo_id));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [galleryId]);

  // Cargar email del cliente desde localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem(`gallery_${galleryId}_email`);
    if (savedEmail) {
      setClientEmail(savedEmail);
      loadFavorites(savedEmail);
    } else {
      setIsLoadingFavorites(false);
      // Mostrar prompt de email si hay funciones que lo requieren
      if (maxFavorites > 0) {
        setShowEmailPrompt(true);
      }
    }
  }, [galleryId, maxFavorites, loadFavorites]);

  // Guardar email y cargar favoritos
  const handleEmailSubmit = (email) => {
    const trimmedEmail = email.toLowerCase().trim();
    setClientEmail(trimmedEmail);
    localStorage.setItem(`gallery_${galleryId}_email`, trimmedEmail);
    setShowEmailPrompt(false);
    loadFavorites(trimmedEmail);
  };

  // Toggle favorito
  const handleToggleFavorite = async (photoId) => {
    // Si no hay email, pedir primero
    if (!clientEmail) {
      setShowEmailPrompt(true);
      return;
    }

    // Optimistic update
    const wasFavorite = favoritePhotoIds.includes(photoId);
    if (wasFavorite) {
      setFavoritePhotoIds(prev => prev.filter(id => id !== photoId));
    } else {
      // Verificar límite
      if (favoritePhotoIds.length >= maxFavorites) {
        alert(`Has alcanzado el límite de ${maxFavorites} fotos favoritas`);
        return;
      }
      setFavoritePhotoIds(prev => [...prev, photoId]);
    }

    // Llamada al servidor
    try {
      const result = await toggleFavorite(galleryId, photoId, clientEmail, maxFavorites);
      if (!result.success) {
        // Revertir en caso de error
        if (wasFavorite) {
          setFavoritePhotoIds(prev => [...prev, photoId]);
        } else {
          setFavoritePhotoIds(prev => prev.filter(id => id !== photoId));
        }
        alert(result.error || 'Error al actualizar favorita');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revertir
      if (wasFavorite) {
        setFavoritePhotoIds(prev => [...prev, photoId]);
      } else {
        setFavoritePhotoIds(prev => prev.filter(id => id !== photoId));
      }
    }
  };

  // Registrar vista de galería (una sola vez al montar)
  useEffect(() => {
    const registerView = async () => {
      const storageKey = `gallery_view_${gallery.id}`;

      if (hasRegisteredView.current) return;

      const alreadyRegistered = sessionStorage.getItem(storageKey);
      if (alreadyRegistered) {
        hasRegisteredView.current = true;
        return;
      }

      hasRegisteredView.current = true;
      sessionStorage.setItem(storageKey, 'true');

      try {
        await fetch('/api/galleries/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ galleryId: gallery.id }),
        });
      } catch (error) {
        console.error('Error registering gallery view:', error);
        sessionStorage.removeItem(storageKey);
        hasRegisteredView.current = false;
      }
    };

    registerView();
  }, [gallery.id]);

  // Callbacks para lightbox
  const openLightbox = useCallback((photo, index) => {
    setSelectedPhoto({ ...photo, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const goToPrevious = useCallback(() => {
    setSelectedPhoto(current => {
      if (!current || current.index === 0) return current;
      const prevPhoto = photos[current.index - 1];
      return { ...prevPhoto, index: current.index - 1 };
    });
  }, [photos]);

  const goToNext = useCallback(() => {
    setSelectedPhoto(current => {
      if (!current || current.index === photos.length - 1) return current;
      const nextPhoto = photos[current.index + 1];
      return { ...nextPhoto, index: current.index + 1 };
    });
  }, [photos]);

  // Función de descarga individual
  const handleDownload = useCallback(async (photo) => {
    try {
      let downloadUrl = photo.file_path;

      if (downloadUrl.includes('res.cloudinary.com')) {
        const urlParts = downloadUrl.split('/upload/');
        if (urlParts.length === 2) {
          const isPNG = urlParts[1].toLowerCase().includes('.png') ||
            photo.file_name?.toLowerCase().endsWith('.png');
          const format = isPNG ? 'png' : 'jpg';
          downloadUrl = `${urlParts[0]}/upload/fl_attachment,q_100,f_${format}/${urlParts[1]}`;
        }
      }

      let fileName = photo.file_name;
      if (!fileName) {
        const urlPath = photo.file_path.split('/').pop().split('?')[0];
        fileName = urlPath || `foto-${Date.now()}.jpg`;
      }

      const isPNG = fileName.toLowerCase().includes('.png') ||
        photo.file_path.toLowerCase().includes('.png');

      fileName = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
      fileName = fileName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/ Foto /, ' - Foto ');
      fileName += isPNG ? '.png' : '.jpg';

      const response = await fetch(downloadUrl, {
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) throw new Error('Error al obtener la imagen');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 150);

    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Error al descargar la foto. Por favor intenta de nuevo.');
    }
  }, []);

  // Navegación por teclado
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, goToPrevious, goToNext, closeLightbox]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero adaptativo */}
      {coverImage ? (
        <section className="relative w-full bg-black">
          <div className="relative w-full" style={{ maxHeight: '90vh' }}>
            <Image
              src={coverImage}
              alt={title}
              width={1920}
              height={1080}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '90vh' }}
              priority
              quality={95}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                  <div className="flex items-center gap-2 text-white/90 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Grid3x3 size={16} />
                    <span className="font-fira text-sm">
                      {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>

                  {allowDownloads && (
                    <PublicDownloadAllButton
                      photos={photos}
                      galleryTitle={title}
                      favoritePhotoIds={favoritePhotoIds}
                      showFavoritesOption={favoritePhotoIds.length > 0}
                    />
                  )}
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="max-w-7xl mx-auto">
                  <h1 className="font-voga text-4xl md:text-6xl text-white mb-3 drop-shadow-2xl">
                    {title}
                  </h1>
                  {formattedDate && (
                    <p className="font-fira text-lg md:text-xl text-white/90 drop-shadow-lg">
                      {formattedDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <header className="border-b border-black/10 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
            <h1 className="font-voga text-3xl md:text-4xl text-black mb-2">
              {title}
            </h1>
            {formattedDate && (
              <p className="font-fira text-sm text-black/60">{formattedDate}</p>
            )}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-black/60">
                <Grid3x3 size={16} />
                <span className="font-fira text-sm">
                  {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
                </span>
              </div>
              {allowDownloads && (
                <PublicDownloadAllButton
                  photos={photos}
                  galleryTitle={title}
                  favoritePhotoIds={favoritePhotoIds}
                  showFavoritesOption={favoritePhotoIds.length > 0}
                />
              )}
            </div>
          </div>
        </header>
      )}

      {/* Mensaje personalizado */}
      {customMessage && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Info size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-voga text-xl text-black mb-2">
                  Mensaje del Fotógrafo
                </h3>
                <p className="font-fira text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {customMessage}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-fira text-black/60">
              Esta galería aún no tiene fotos.
            </p>
          </div>
        ) : (
          <PhotoGrid
            photos={photos}
            galleryTitle={title}
            onPhotoClick={openLightbox}
            onDownload={handleDownload}
            onToggleFavorite={handleToggleFavorite}
            favoritePhotoIds={favoritePhotoIds}
            allowDownloads={allowDownloads}
          />
        )}
      </main>

      {/* Sección de Testimonios */}
      {allowComments && clientEmail && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <TestimonialForm galleryId={galleryId} galleryTitle={title} />
        </div>
      )}

      {/* Floating Favorites Selector */}
      {maxFavorites > 0 && clientEmail && (
        <FavoritesSelector
          favoritesCount={favoritePhotoIds.length}
          maxFavorites={maxFavorites}
          selectedPhotoIds={favoritePhotoIds}
          photos={photos}
          galleryId={galleryId}
          clientEmail={clientEmail}
          onRemoveFavorite={handleToggleFavorite}
        />
      )}

      {/* Email Prompt Modal */}
      <AnimatePresence>
        {showEmailPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowEmailPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl z-50 p-8"
            >
              <h2 className="font-voga text-2xl text-black mb-3">
                Ingresa tu Email
              </h2>
              <p className="font-fira text-sm text-gray-600 mb-6">
                Para seleccionar tus fotos favoritas, necesitamos tu email
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = e.target.email.value;
                  if (email) handleEmailSubmit(email);
                }}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-fira text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-fira font-semibold transition-all"
                >
                  Continuar
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            >
              <X size={24} className="text-white" />
            </button>

            <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 rounded-lg z-50">
              <span className="font-fira text-sm text-white">
                {selectedPhoto.index + 1} / {photos.length}
              </span>
            </div>

            {selectedPhoto.index > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
              >
                <ChevronLeft size={32} className="text-white" />
              </button>
            )}

            {selectedPhoto.index < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
              >
                <ChevronRight size={32} className="text-white" />
              </button>
            )}

            <motion.div
              key={selectedPhoto.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full mx-auto px-20"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedPhoto.file_path}
                alt={`${title} - ${selectedPhoto.file_name || `Foto ${selectedPhoto.index + 1}`}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                quality={95}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
