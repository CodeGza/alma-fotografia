'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Link as LinkIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ShareGalleryModal({ isOpen, onClose, galleryId, gallerySlug }) {
  const [shareLink, setShareLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingShare, setExistingShare] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expirationDays, setExpirationDays] = useState(30);

  // ✅ Debug: Ver qué llega en props
  useEffect(() => {
    console.log('📋 ShareGalleryModal Props:', { galleryId, gallerySlug, isOpen });
  }, [galleryId, gallerySlug, isOpen]);

  useEffect(() => {
    if (isOpen && galleryId) {
      setErrorMessage('');
      checkExistingShare();
    }
  }, [isOpen, galleryId]);

  const checkExistingShare = async () => {
    try {
      console.log('🔍 Checking existing share for gallery:', galleryId);

      const { data, error } = await supabase
        .from('gallery_shares')
        .select('*')
        .eq('gallery_id', galleryId) // ✅ Usar galleryId de props
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking existing share:', error);
        return;
      }

      if (data) {
        console.log('✅ Found existing share:', data);
        setExistingShare(data);
        const slugToUse = gallerySlug || galleryId;
        const link = `${window.location.origin}/galeria/${slugToUse}?token=${data.share_token}`;
        setShareLink(link);
      } else {
        console.log('ℹ️ No existing share found');
      }
    } catch (err) {
      console.error('❌ Error in checkExistingShare:', err);
    }
  };

  const generateShareLink = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // ✅ Debug paso 1: Usuario
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ User error:', userError);
        throw new Error('No se pudo obtener el usuario autenticado');
      }

      console.log('👤 User ID:', user.id);
      console.log('🖼️ Gallery ID:', galleryId);
      console.log('🔗 Gallery Slug:', gallerySlug);

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

      console.log('📤 Inserting share data:', shareData);

      const { data, error } = await supabase
        .from('gallery_shares')
        .insert(shareData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(error.message || 'Error al crear el enlace');
      }

      if (!data) {
        console.error('❌ No data received');
        throw new Error('No se recibió respuesta del servidor');
      }

      console.log('✅ Share created successfully:', data);

      const slugToUse = gallerySlug || galleryId;
      const link = `${window.location.origin}/galeria/${slugToUse}?token=${token}`;
      console.log('🔗 Generated link:', link);
      
      setShareLink(link);
      setExistingShare(data);

    } catch (error) {
      console.error('❌ Error generating share link:', error);
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
      console.error('Error copying to clipboard:', err);
      setErrorMessage('No se pudo copiar al portapapeles');
    }
  };

  const deactivateShare = async () => {
    if (!existingShare) return;

    try {
      const { error } = await supabase
        .from('gallery_shares')
        .update({ is_active: false })
        .eq('id', existingShare.id);

      if (error) throw error;

      setShareLink('');
      setExistingShare(null);
      setErrorMessage('');
    } catch (error) {
      console.error('Error deactivating share:', error);
      setErrorMessage('Error al desactivar el enlace');
    }
  };

  const handleClose = () => {
    setShareLink('');
    setIsCopied(false);
    setExistingShare(null);
    setErrorMessage('');
    onClose();
  };

  // ✅ Validar que tengamos galleryId
  if (!galleryId) {
    console.error('❌ ShareGalleryModal: No galleryId provided');
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <div>
                <h2 className="font-voga text-2xl text-black">
                  Compartir galería
                </h2>
                <p className="font-fira text-sm text-black/60 mt-1">
                  ID: {galleryId}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-fira text-sm text-red-800">
                    {errorMessage}
                  </p>
                </div>
              )}

              {shareLink ? (
                <div className="space-y-4">
                  <div>
                    <label className="font-fira text-sm font-medium text-black block mb-2">
                      Enlace compartible
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 px-4 py-3 bg-beige/30 border border-black/10 rounded-lg font-fira text-sm text-black"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-3 bg-brown hover:bg-brown/90 text-white rounded-lg transition-colors flex items-center gap-2 font-fira text-sm font-medium"
                      >
                        {isCopied ? (
                          <>
                            <Check size={16} />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {existingShare && (
                    <div className="bg-beige/30 rounded-lg p-4 border border-black/10">
                      <p className="font-fira text-sm text-black/80">
                        <span className="font-medium text-black">{existingShare.views_count || 0}</span> vistas
                      </p>
                      {existingShare.last_viewed_at && (
                        <p className="font-fira text-xs text-black/60 mt-1">
                          Última vista: {new Date(existingShare.last_viewed_at).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="bg-beige/20 rounded-lg p-4 border border-black/10">
                    <p className="font-fira text-sm text-black/80">
                      Este enlace permite a tus clientes ver y descargar las fotos de esta galería sin necesidad de crear una cuenta.
                    </p>
                  </div>

                  <button
                    onClick={deactivateShare}
                    className="w-full px-4 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-lg transition-colors font-fira text-sm font-medium"
                  >
                    Desactivar enlace
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-beige/20 rounded-lg p-4 border border-black/10">
                    <p className="font-fira text-sm text-black/80">
                      Genera un enlace único que podrás compartir con tus clientes para que vean y descarguen sus fotos.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block font-fira text-sm font-medium text-black mb-2">
                      El enlace expirará en:
                    </label>
                    <select
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-black/10 rounded-lg font-fira text-sm"
                    >
                      <option value={7}>7 días</option>
                      <option value={15}>15 días</option>
                      <option value={30}>30 días (recomendado)</option>
                      <option value={60}>60 días</option>
                      <option value={90}>90 días</option>
                      <option value={180}>6 meses</option>
                      <option value={365}>1 año</option>
                    </select>
                  </div>

                  <button
                    onClick={generateShareLink}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-brown hover:bg-brown/90 disabled:bg-black/20 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-fira text-sm font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon size={16} />
                        <span>Generar enlace</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}