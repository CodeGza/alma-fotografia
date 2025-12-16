'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Eye, Trash2, MoreVertical, X } from 'lucide-react';

export default function PhotoCard({ photo, index, onDelete, onView }) {
  const [showMenu, setShowMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [imageError, setImageError] = useState(false);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowMenu(true);
    }, 500); // 500ms para activar el menu
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <>
      <div
        className="group relative aspect-square bg-[#FFF8E2]/20 rounded-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-xs text-red-600 font-fira text-center px-2">
              Error al cargar imagen
            </p>
          </div>
        ) : (
          <Image
            src={photo.file_path}
            alt={photo.file_name || `Foto ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            unoptimized
            onError={() => {
              console.error('Error loading image:', photo.file_path);
              setImageError(true);
            }}
          />
        )}
        
        {/* Overlay hover (solo desktop) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors hidden sm:block" />
        
        {/* Botones desktop (hover) */}
        <div className="absolute top-2 right-2 hidden sm:flex sm:opacity-0 sm:group-hover:opacity-100 gap-2 transition-opacity">
          <button
            onClick={() => onView(photo)}
            className="p-2 bg-white/95 backdrop-blur-sm hover:bg-white rounded-lg shadow-lg transition-all"
            title="Ver en grande"
          >
            <Eye size={16} className="text-black" />
          </button>
          
          <button
            onClick={() => onDelete(photo)}
            className="p-2 bg-red-600/95 backdrop-blur-sm hover:bg-red-700 rounded-lg shadow-lg transition-all"
            title="Eliminar foto"
          >
            <Trash2 size={16} className="text-white" />
          </button>
        </div>

        {/* Botón menu mobile (siempre visible) */}
        <button
          onClick={() => setShowMenu(true)}
          className="absolute top-2 right-2 sm:hidden p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg"
        >
          <MoreVertical size={16} className="text-black" />
        </button>

        {/* Número de foto */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white font-fira text-xs">
          #{index + 1}
        </div>
      </div>

      {/* Menu contextual mobile */}
      <AnimatePresence>
        {showMenu && (
          <div className="fixed inset-0 z-[100] sm:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 space-y-2"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="font-fira text-sm font-medium text-black">
                  Foto #{index + 1}
                </p>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Opciones */}
              <button
                onClick={() => {
                  onView(photo);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Eye size={20} className="text-black" />
                <span className="font-fira text-sm text-black">Ver en grande</span>
              </button>

              <button
                onClick={() => {
                  onDelete(photo);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <Trash2 size={20} className="text-red-600" />
                <span className="font-fira text-sm text-red-600">Eliminar foto</span>
              </button>

              {/* Botón cancelar */}
              <button
                onClick={() => setShowMenu(false)}
                className="w-full mt-2 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-fira text-sm font-medium text-black"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}