'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Mail, Eye, Image as ImageIcon, Share2, Globe, Lock } from 'lucide-react';
import ShareGalleryModal from './ShareGalleryModal';

export default function GalleryCard({ gallery, index }) {
  const [showShareModal, setShowShareModal] = useState(false);

  const {
    id,
    title,
    slug,
    event_date,
    client_email,
    cover_image,
    is_public,
    views_count,
    photoCount,
  } = gallery;

  const formattedDate = event_date
    ? new Date(event_date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group relative bg-white rounded-xl border border-black/10 overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Imagen de portada */}
        <Link href={`/dashboard/galerias/${id}`}>
          <div className="relative w-full aspect-video bg-beige/20">
            {cover_image ? (
              <Image
                src={cover_image}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={48} className="text-black/20" strokeWidth={1} />
              </div>
            )}
          </div>
        </Link>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Link href={`/dashboard/galerias/${id}`}>
                <h3 className="font-voga text-xl text-black mb-2 hover:text-brown transition-colors">
                  {title}
                </h3>
              </Link>
              
              <div className="flex flex-wrap gap-3 text-sm text-black/60">
                {formattedDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span className="font-fira text-xs">{formattedDate}</span>
                  </div>
                )}
                {client_email && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    <span className="font-fira text-xs">{client_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badge de estado */}
            {is_public ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
                <Globe size={12} />
                <span className="font-fira text-xs font-medium">Pública</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                <Lock size={12} />
                <span className="font-fira text-xs font-medium">Privada</span>
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-black/10">
            <div className="flex items-center gap-4 text-sm text-black/60">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={16} />
                <span className="font-fira">{photoCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye size={16} />
                <span className="font-fira">{views_count}</span>
              </div>
            </div>

            {/* Botón compartir */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowShareModal(true);
              }}
              className="px-3 py-1.5 bg-brown hover:bg-brown/90 text-white rounded-lg transition-colors flex items-center gap-1.5 font-fira text-xs font-medium"
            >
              <Share2 size={14} />
              Compartir
            </button>
          </div>
        </div>
      </motion.div>

      {/* ✅ Modal con props correctas */}
      {showShareModal && (
        <ShareGalleryModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          galleryId={id}           // ✅ Pasar ID
          gallerySlug={slug}       // ✅ Pasar slug
        />
      )}
    </>
  );
}