'use client';

import { useState, useEffect } from 'react';
import { Heart, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitFavoritesSelection } from '@/app/actions/favorites-actions';

/**
 * FavoritesSelector - Floating button y modal para gestionar favoritos
 *
 * Muestra:
 * - Floating button con contador de favoritas
 * - Modal con lista de fotos seleccionadas
 * - Botón para enviar selección
 */
export default function FavoritesSelector({
  favoritesCount,
  maxFavorites,
  selectedPhotoIds,
  photos,
  galleryId,
  clientEmail,
  onRemoveFavorite,
}) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const selectedPhotos = photos.filter(p => selectedPhotoIds.includes(p.id));
  const hasSelection = favoritesCount > 0;

  const handleSubmit = async () => {
    if (favoritesCount === 0) return;

    setIsSubmitting(true);

    try {
      const result = await submitFavoritesSelection(galleryId, clientEmail);

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        alert(result.error || 'Error al enviar la selección');
      }
    } catch (error) {
      console.error('Error submitting favorites:', error);
      alert('Error al enviar la selección. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasSelection) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-2xl p-4 flex items-center gap-3 group"
      >
        <Heart size={24} className="fill-white" />
        <div className="flex flex-col items-start pr-2">
          <span className="font-fira text-xs font-semibold">
            {favoritesCount} / {maxFavorites}
          </span>
          <span className="font-fira text-[10px] opacity-90">
            Favoritas
          </span>
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="font-voga text-2xl text-black">
                    Mis Fotos Favoritas
                  </h2>
                  <p className="font-fira text-sm text-gray-600 mt-1">
                    {favoritesCount} de {maxFavorites} seleccionadas
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Photos Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <CheckCircle size={64} className="text-green-500 mb-4" />
                    <h3 className="font-voga text-2xl text-black mb-2">
                      ¡Selección enviada!
                    </h3>
                    <p className="font-fira text-sm text-gray-600 text-center">
                      El fotógrafo recibirá tu selección de {favoritesCount} fotos favoritas.
                    </p>
                  </motion.div>
                ) : selectedPhotos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Heart size={48} className="text-gray-300 mb-3" />
                    <p className="font-fira text-sm text-gray-500">
                      No has seleccionado ninguna foto favorita
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.file_path}
                          alt={photo.file_name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => onRemoveFavorite(photo.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-[10px] font-fira">
                          Foto {photos.findIndex(p => p.id === photo.id) + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!submitSuccess && (
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || favoritesCount === 0}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg font-fira font-semibold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Enviar Selección</span>
                      </>
                    )}
                  </button>
                  <p className="font-fira text-xs text-gray-500 text-center mt-3">
                    Al enviar, el fotógrafo recibirá tu selección de fotos favoritas
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
