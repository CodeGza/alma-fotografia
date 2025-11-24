'use client';

/**
 * Servicios - Component
 *
 * Grid de servicios con lightbox interactivo
 * Muestra galerías públicas con animaciones
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Servicios({ services }) {
  const [lightboxData, setLightboxData] = useState(null);

  const openLightbox = (gallery, photoIndex = 0) => {
    setLightboxData({ gallery, photoIndex });
  };

  const closeLightbox = () => {
    setLightboxData(null);
  };

  // Si no hay servicios
  if (!services || services.length === 0) {
    return (
      <section id="servicios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-voga text-4xl sm:text-5xl text-gray-900 mb-4">
            Nuestros Servicios
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#8B5E3C] to-[#B89968] mx-auto rounded-full mb-6" />
          <p className="font-fira text-gray-600">
            Próximamente publicaremos nuestras galerías
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="servicios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-voga text-4xl sm:text-5xl text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#8B5E3C] to-[#B89968] mx-auto rounded-full mb-6" />
            <p className="font-fira text-gray-600 max-w-2xl mx-auto">
              Cada sesión es única y personalizada para capturar la esencia de tus momentos especiales
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onOpenLightbox={openLightbox}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxData && (
          <Lightbox
            gallery={lightboxData.gallery}
            initialIndex={lightboxData.photoIndex}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Service Card Component
function ServiceCard({ service, index, onOpenLightbox }) {
  const gallery = service.gallery;
  const photos = gallery?.photos || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
      onClick={() => photos.length > 0 && onOpenLightbox(gallery, 0)}
    >
      {/* Cover Image */}
      <div className="relative h-64 overflow-hidden">
        {gallery?.cover_image ? (
          <Image
            src={gallery.cover_image}
            alt={gallery.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#8B5E3C]/20 to-[#B89968]/20 flex items-center justify-center">
            <span className="font-voga text-4xl text-[#8B5E3C]/30">
              {service.name}
            </span>
          </div>
        )}

        {/* Overlay en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <p className="font-fira text-white text-sm">
            Ver galería completa →
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-voga text-2xl text-gray-900 mb-2">
          {service.name}
        </h3>

        {gallery?.description && (
          <p className="font-fira text-sm text-gray-600 mb-4 line-clamp-2">
            {gallery.description}
          </p>
        )}

        {photos.length > 0 && (
          <p className="font-fira text-xs text-gray-500">
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Lightbox Component con keyboard navigation
function Lightbox({ gallery, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const photos = gallery.photos || [];

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  };

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label="Galería de fotos"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
        aria-label="Cerrar galería"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Gallery Title */}
      <div className="absolute top-4 left-4 z-50">
        <h3 className="font-voga text-2xl text-white">{gallery.title}</h3>
      </div>

      {/* Photo */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-6xl aspect-[4/3]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[currentIndex]?.cloudinary_url}
          alt={photos[currentIndex]?.file_name || 'Foto'}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </motion.div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Siguiente foto"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
        <span className="font-fira text-sm text-white">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>
    </motion.div>
  );
}
