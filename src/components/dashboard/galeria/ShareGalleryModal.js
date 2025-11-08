'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Link as LinkIcon, Loader2, Eye, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Modal from '@/components/ui/Modal';

export default function ShareGalleryModal({ galleryId, gallerySlug, onClose }) {
  const [shareLink, setShareLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingShare, setExistingShare] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expirationDays, setExpirationDays] = useState(30);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    if (galleryId) {
      setErrorMessage('');
      checkExistingShare();
    }
  }, [galleryId]);

  const checkExistingShare = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_shares')
        .select('*')
        .eq('gallery_id', galleryId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing share:', error);
        return;
      }

      if (data) {
        setExistingShare(data);
        const slugToUse = gallerySlug || galleryId;
        const link = `${window.location.origin}/galeria/${slugToUse}?token=${data.share_token}`;
        setShareLink(link);
      }
    } catch (err) {
      console.error('Error in checkExistingShare:', err);
    }
  };

  const generateShareLink = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('No se pudo obtener el usuario autenticado');
      }

      const token = `${crypto.randomUUID()}-${Date.now()}`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      const shareData = {
        gallery_id: galleryId,
        share_token: token,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      };

      const { data, error } = await supabase
        .from('gallery_shares')
        .insert(shareData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Error al crear el enlace');
      }

      if (!data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      const slugToUse = gallerySlug || galleryId;
      const link = `${window.location.origin}/galeria/${slugToUse}?token=${token}`;
      
      setShareLink(link);
      setExistingShare(data);

    } catch (error) {
      console.error('Error generating share link:', error);
      setErrorMessage(error.message || 'Error al generar el enlace.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const deactivateLink = async () => {
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    setShowDeactivateModal(false);
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('gallery_shares')
        .update({ is_active: false })
        .eq('id', existingShare.id);

      if (error) {
        console.error('Error deactivating share:', error);
        throw new Error('Error al desactivar el enlace');
      }

      // Reset state
      setExistingShare(null);
      setShareLink('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error deactivating link:', error);
      setErrorMessage(error.message || 'Error al desactivar el enlace.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
      />

      {/* Modal - 100% Responsive con altura mínima */}
      <div className="fixed inset-2 sm:inset-4 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl w-auto bg-white rounded-lg sm:rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] md:max-h-[90vh] md:min-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="font-voga text-base sm:text-lg md:text-xl lg:text-2xl text-black truncate">
              Compartir galería
            </h2>
            <p className="font-fira text-[10px] sm:text-xs md:text-sm text-gray-500 mt-0.5 sm:mt-1">
              Genera un enlace privado para compartir
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={18} className="sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Con scroll pero sin cortar dropdowns */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
          
          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 md:p-4 flex items-start gap-2 sm:gap-3">
              <AlertCircle size={16} className="sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-fira text-[11px] sm:text-xs md:text-sm text-red-800 leading-snug">{errorMessage}</p>
            </div>
          )}

          {/* Enlace existente */}
          {existingShare && shareLink ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Link box */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 md:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <LinkIcon size={16} className="sm:w-5 sm:h-5 text-[#79502A] flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-fira text-[11px] sm:text-xs font-semibold text-black mb-1.5 sm:mb-2">
                      Enlace privado
                    </p>
                    <div className="bg-white border border-gray-300 rounded-lg p-2 sm:p-2.5 md:p-3 break-all">
                      <p className="font-fira text-[10px] sm:text-xs text-gray-700 leading-snug">
                        {shareLink}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={copyToClipboard}
                className="w-full py-2.5 sm:py-3 bg-[#79502A] hover:bg-[#8B5A2F] text-white rounded-lg transition-colors font-fira text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isCopied ? (
                  <>
                    <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Copiar enlace</span>
                  </>
                )}
              </button>

              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* Vistas */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Eye size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                    <div>
                      <p className="font-fira text-[10px] sm:text-xs text-blue-600 font-medium">
                        Vistas
                      </p>
                      <p className="font-fira text-base sm:text-lg font-bold text-blue-900">
                        {existingShare.views_count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creado */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar size={14} className="sm:w-4 sm:h-4 text-green-600" />
                    <div className="min-w-0">
                      <p className="font-fira text-[10px] sm:text-xs text-green-600 font-medium">
                        Creado
                      </p>
                      <p className="font-fira text-[10px] sm:text-xs font-semibold text-green-900 truncate">
                        {formatDate(existingShare.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expira */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar size={14} className="sm:w-4 sm:h-4 text-amber-600" />
                    <div className="min-w-0">
                      <p className="font-fira text-[10px] sm:text-xs text-amber-600 font-medium">
                        Expira
                      </p>
                      <p className="font-fira text-[10px] sm:text-xs font-semibold text-amber-900 truncate">
                        {formatDate(existingShare.expires_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón desactivar enlace */}
              <button
                onClick={deactivateLink}
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg transition-colors font-fira text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                    <span>Desactivando...</span>
                  </>
                ) : (
                  <>
                    <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Desactivar enlace</span>
                  </>
                )}
              </button>

              {/* Info adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3 md:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-fira text-[10px] sm:text-xs text-blue-900 leading-relaxed">
                      <strong className="font-semibold">Enlace privado:</strong> Solo las personas con este enlace podrán acceder a la galería.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No hay enlace - Generar nuevo */
            <div className="space-y-3 sm:space-y-4 pb-32">
              {/* Duración */}
              <div className="relative z-10">
                <label className="block font-fira text-[11px] sm:text-xs md:text-sm font-semibold text-black mb-1.5 sm:mb-2">
                  Duración del enlace
                </label>
                <select
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(Number(e.target.value))}
                  className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 border border-gray-300 rounded-lg font-fira text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#79502A] focus:border-transparent bg-white"
                >
                  <option value={7}>7 días</option>
                  <option value={14}>14 días</option>
                  <option value={30}>30 días (recomendado)</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
              </div>

              {/* Generar button */}
              <button
                onClick={generateShareLink}
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 bg-[#79502A] hover:bg-[#8B5A2F] disabled:bg-gray-300 text-white rounded-lg transition-colors font-fira text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Generar enlace</span>
                  </>
                )}
              </button>

              {/* Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 sm:p-3 md:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <p className="font-fira text-[10px] sm:text-xs text-gray-700 leading-relaxed">
                    El enlace será válido por el período seleccionado. Podrás compartirlo con tus clientes por WhatsApp, email, etc.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-3 sm:p-4 md:p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 hover:bg-gray-200 rounded-lg transition-colors font-fira text-xs sm:text-sm font-semibold text-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de confirmación para desactivar */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="¿Desactivar enlace?"
        message="Los clientes ya no podrán acceder a la galería con este enlace. Esta acción no se puede deshacer."
        type="warning"
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDeactivate}
      />
    </>
  );
}