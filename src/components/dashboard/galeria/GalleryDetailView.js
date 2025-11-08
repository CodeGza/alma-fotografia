'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Mail,
  Eye,
  Image as ImageIcon,
  Share2,
  Edit,
  Globe,
  Lock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Upload,
  X,
  CheckSquare,
  Square,
  Download,
  Star,
  Loader2,
  Briefcase
} from 'lucide-react';
import ShareGalleryModal from './ShareGalleryModal';
import PhotoUploader from './PhotoUploader';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/hooks/useModal';
import { createClient } from '@/lib/supabaseClient';

export default function GalleryDetailView({ gallery }) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [photosPage, setPhotosPage] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [deletingPhotos, setDeletingPhotos] = useState(false);
  const [changingCover, setChangingCover] = useState(false);
  const { modalState, showModal, closeModal } = useModal();

  const PHOTOS_PER_PAGE = 48;

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
    service_type, // Agregar servicio si existe en tu DB
  } = gallery;

  const totalSize = photos?.reduce((sum, photo) => sum + (photo.file_size || 0), 0) || 0;
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);

  const formattedEventDate = event_date
    ? new Date(event_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : null;

  const formattedCreatedDate = created_at
    ? new Date(created_at).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : null;

  const handleUploadComplete = () => router.refresh();

  const extractPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;
      const pathParts = parts.slice(uploadIndex + 2);
      const fullPath = pathParts.join('/');
      return fullPath.replace(/\.[^/.]+$/, '');
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPhotos.size === photosToShow.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photosToShow.map(p => p.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPhotos.size === 0) return;

    showModal({
      title: `¿Eliminar ${selectedPhotos.size} fotos?`,
      message: 'Esta acción no se puede deshacer. Las fotos se eliminarán permanentemente.',
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: confirmDeleteSelected
    });
  };

  const confirmDeleteSelected = async () => {
    setDeletingPhotos(true);

    try {
      const photosToDelete = photos.filter(p => selectedPhotos.has(p.id));
      const supabase = await createClient();

      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .in('id', Array.from(selectedPhotos));

      if (dbError) throw dbError;

      photosToDelete.forEach(photo => {
        const publicId = extractPublicIdFromUrl(photo.file_path);
        if (publicId) {
          fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId })
          }).catch(err => console.error('Error eliminando de Cloudinary:', err));
        }
      });

      setSelectedPhotos(new Set());
      setSelectionMode(false);
      router.refresh();

    } catch (error) {
      console.error('Error eliminando fotos:', error);
      showModal({
        title: 'Error',
        message: 'No se pudieron eliminar las fotos.',
        type: 'error'
      });
    } finally {
      setDeletingPhotos(false);
    }
  };

  const handleSetAsCover = async (photoUrl) => {
    setChangingCover(true);

    try {
      const previousCoverUrl = cover_image;
      const supabase = await createClient();

      const { error } = await supabase
        .from('galleries')
        .update({ cover_image: photoUrl })
        .eq('id', id);

      if (error) throw error;

      // ✅ Eliminar portada anterior SOLO si no es una foto de la galería
      if (previousCoverUrl) {
        const isGalleryPhoto = photos.some(p => p.file_path === previousCoverUrl);

        if (!isGalleryPhoto) {
          const publicId = extractPublicIdFromUrl(previousCoverUrl);
          if (publicId) {
            fetch('/api/cloudinary/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId })
            })
              .then(response => {
                if (response.ok) {
                  console.log('✅ Portada anterior eliminada de Cloudinary');
                }
              })
              .catch(err => console.error('Error eliminando portada anterior:', err));
          }
        }
      }

      router.refresh();

    } catch (error) {
      console.error('Error cambiando portada:', error);
      showModal({
        title: 'Error',
        message: 'No se pudo cambiar la portada.',
        type: 'error'
      });
    } finally {
      setChangingCover(false);
    }
  };

  const handleRemoveCover = async () => {
    showModal({
      title: '¿Quitar portada?',
      message: 'La galería quedará sin imagen de portada. La imagen se eliminará permanentemente.',
      type: 'warning',
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
      onConfirm: confirmRemoveCover
    });
  };

  // ✅ Nueva función para confirmar y ejecutar eliminación
  const confirmRemoveCover = async () => {
    setChangingCover(true);

    try {
      const imageToDelete = cover_image;

      // 1. Actualizar Supabase primero
      const supabase = await createClient();
      const { error } = await supabase
        .from('galleries')
        .update({ cover_image: null })
        .eq('id', id);

      if (error) throw error;

      // 2. Eliminar de Cloudinary SOLO si no es una foto de la galería
      if (imageToDelete) {
        // Verificar si la portada es una foto de la galería
        const isGalleryPhoto = photos.some(p => p.file_path === imageToDelete);

        // Solo eliminar de Cloudinary si NO es una foto de la galería
        if (!isGalleryPhoto) {
          const publicId = extractPublicIdFromUrl(imageToDelete);
          if (publicId) {
            fetch('/api/cloudinary/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId })
            })
              .then(response => {
                if (response.ok) {
                  console.log('✅ Portada eliminada de Cloudinary:', publicId);
                } else {
                  console.warn('⚠️ No se pudo eliminar portada de Cloudinary');
                }
              })
              .catch(err => console.error('Error eliminando portada de Cloudinary:', err));
          }
        } else {
          console.log('ℹ️ Portada es foto de galería, no se elimina de Cloudinary');
        }
      }

      router.refresh();

    } catch (error) {
      console.error('Error quitando portada:', error);
      showModal({
        title: 'Error',
        message: 'No se pudo quitar la portada.',
        type: 'error'
      });
    } finally {
      setChangingCover(false);
    }
  };

  // Subir portada desde placeholder
  const handleUploadCoverFromPlaceholder = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showModal({
        title: 'Formato inválido',
        message: 'Solo se permiten imágenes JPG, PNG o WebP',
        type: 'error'
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showModal({
        title: 'Archivo muy pesado',
        message: 'La imagen no debe superar los 15MB',
        type: 'error'
      });
      return;
    }

    setChangingCover(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Configuración de Cloudinary incompleta');
      }

      // Optimizar imagen antes de subir
      const optimizedBlob = await optimizeImageForCover(file);
      const optimizedFile = new File(
        [optimizedBlob],
        `cover-${Date.now()}.webp`,
        { type: 'image/webp' }
      );

      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `gallery-covers/${id}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al subir');
      }

      const data = await response.json();

      // Guardar en Supabase
      const supabase = await createClient();
      const { error } = await supabase
        .from('galleries')
        .update({ cover_image: data.secure_url })
        .eq('id', id);

      if (error) throw error;

      router.refresh();

    } catch (error) {
      console.error('Error subiendo portada:', error);
      showModal({
        title: 'Error al subir',
        message: error.message || 'No se pudo subir la portada.',
        type: 'error'
      });
    } finally {
      setChangingCover(false);
    }
  };

  // Función auxiliar para optimizar imagen de portada
  const optimizeImageForCover = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = document.createElement('img');

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Dimensiones para portada (más grande que fotos normales)
          const MAX_WIDTH = 2000;
          const MAX_HEIGHT = 2000;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              if (width > MAX_WIDTH) {
                height = (height * MAX_WIDTH) / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = (width * MAX_HEIGHT) / height;
                height = MAX_HEIGHT;
              }
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Error al optimizar'));
              }
            },
            'image/webp',
            0.90 // Calidad 90% para portadas
          );
        };

        img.onerror = () => reject(new Error('Error al cargar imagen'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  };

  const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
  const startIdx = photosPage * PHOTOS_PER_PAGE;
  const endIdx = startIdx + PHOTOS_PER_PAGE;
  const photosToShow = photos.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[2000px] mx-auto">

        {/* Header oscuro - PADDING MÍNIMO en mobile */}
        <div className="bg-[#2d2d2d] text-white rounded-xl">
          <div className="px-5 sm:px-6 lg:px-8 py-4 sm:py-6">

            {/* Breadcrumb */}
            <button
              onClick={() => router.push('/dashboard/galerias')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-fira text-sm mb-4"
            >
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>

            {/* Título y acciones */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <h1 className="font-voga text-xl sm:text-2xl lg:text-3xl break-words">
                      {title}
                    </h1>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-fira text-xs font-semibold flex-shrink-0 ${is_public
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-white/10 text-white/70'
                      }`}>
                      {is_public ? <Globe size={12} /> : <Lock size={12} />}
                      {is_public ? 'Pública' : 'Privada'}
                    </span>
                  </div>

                  {/* Descripción */}
                  {description && (
                    <p className="font-fira text-sm text-white/80 leading-relaxed mb-3">
                      {description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-white/60">
                    {service_type && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-white/40 flex-shrink-0" />
                        <span className="font-fira">{service_type}</span>
                      </div>
                    )}
                    {formattedEventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/40 flex-shrink-0" />
                        <span className="font-fira">Evento: {formattedEventDate}</span>
                      </div>
                    )}
                    {client_email && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail size={14} className="text-white/40 flex-shrink-0" />
                        <span className="font-fira truncate">{client_email}</span>
                      </div>
                    )}
                    {formattedCreatedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/40 flex-shrink-0" />
                        <span className="font-fira">Creada: {formattedCreatedDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="!text-white flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-[#79502A] hover:bg-[#8B5A2F] rounded-lg transition-colors font-fira text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} />
                    <span>Compartir</span>
                  </button>
                  <button
                    onClick={() => showModal({
                      title: 'Próximamente',
                      message: 'La función de editar estará disponible pronto.',
                      type: 'info'
                    })}
                    className="!text-white flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-fira text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <ImageIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#79502A]" />
                </div>
                <div>
                  <p className="font-fira text-base sm:text-lg font-semibold">{photos.length}</p>
                  <p className="font-fira text-xs text-white/60">Fotos</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-blue-400" />
                </div>
                <div>
                  <p className="font-fira text-base sm:text-lg font-semibold">{views_count || 0}</p>
                  <p className="font-fira text-xs text-white/60">Vistas</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Download className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-purple-400" />
                </div>
                <div>
                  <p className="font-fira text-base sm:text-lg font-semibold">{totalSizeMB} MB</p>
                  <p className="font-fira text-xs text-white/60">Tamaño</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-1">

          {/* Portada con placeholder */}
          {cover_image ? (
            <div className="bg-white py-4 sm:py-6 px-2 sm:px-6 lg:px-8 border-b border-gray-200">
              <div className="relative w-full max-w-2xl mx-auto aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={cover_image}
                  alt="Portada"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                />
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
                  <span className="font-fira text-xs font-bold text-white flex items-center gap-1.5">
                    <Star size={12} className="fill-[#79502A] text-[#79502A]" />
                    Portada
                  </span>
                </div>
                <button
                  onClick={handleRemoveCover}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-red-600/90 hover:bg-red-700 backdrop-blur-sm rounded-full transition-colors"
                  title="Quitar portada"
                >
                  <X size={14} className="sm:w-4 sm:h-4 text-white" />
                </button>
              </div>
              <p className="text-center mt-2 font-fira text-xs text-gray-500">
                Esta es la imagen de portada de la galería
              </p>
            </div>
          ) : (
            <div className="bg-white py-4 sm:py-6 px-2 sm:px-6 lg:px-8 border-b border-gray-200">
              <div className="max-w-2xl mx-auto border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                <div className="inline-flex p-3 bg-gray-100 rounded-full mb-3">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
                <h3 className="font-fira text-base font-semibold text-black mb-1">
                  Sin portada
                </h3>
                <p className="font-fira text-sm text-gray-500 mb-4">
                  Sube una imagen o selecciona una de la galería
                </p>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {/* Subir desde equipo */}
                  <label className="flex-1 sm:flex-none px-6 py-3 bg-[#79502A] hover:bg-[#8B5A2F] text-white rounded-lg transition-colors font-fira text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={16} />
                    Subir portada
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleUploadCoverFromPlaceholder}
                      className="hidden"
                    />
                  </label>

                  {/* Usar foto existente */}
                  {photos.length > 0 && (
                    <button
                      onClick={() => handleSetAsCover(photos[0].file_path)}
                      className="flex-1 sm:flex-none px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-black rounded-lg transition-colors font-fira text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Star size={16} />
                      Usar primera foto
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Uploader */}
          <div className="bg-white py-4 sm:py-6 px-2 sm:px-6 lg:px-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Upload size={18} className="text-[#79502A]" />
              <h2 className="font-fira text-base sm:text-lg font-semibold text-black">
                Subir fotos
              </h2>
            </div>
            <PhotoUploader galleryId={id} onUploadComplete={handleUploadComplete} />
          </div>

          {/* Grid de fotos */}
          <div className="bg-white">
            {/* Toolbar */}
            <div className="py-4 sm:py-6 px-2 sm:px-6 lg:px-8 border-b border-gray-200">
              <div className="flex flex-col gap-3">
                <h2 className="font-fira text-base sm:text-lg font-semibold text-black flex items-center gap-2">
                  <ImageIcon size={18} className="text-gray-400" />
                  {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  {!selectionMode ? (
                    <button
                      onClick={() => setSelectionMode(true)}
                      className="!text-white px-3 sm:px-4 py-2 bg-[#8b5a2fff] hover:bg-[#9c6b3fff] rounded-lg transition-colors font-fira text-xs sm:text-sm font-medium flex items-center gap-2"
                    >
                      <CheckSquare size={16} />
                      <span>Seleccionar</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={toggleSelectAll}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-fira text-xs sm:text-sm font-medium"
                      >
                        {selectedPhotos.size === photosToShow.length ? 'Deseleccionar' : 'Todo'}
                      </button>
                      <button
                        onClick={handleDeleteSelected}
                        disabled={selectedPhotos.size === 0 || deletingPhotos}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-fira text-xs sm:text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingPhotos ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        <span className="hidden sm:inline">Eliminar</span>
                        {selectedPhotos.size > 0 && ` (${selectedPhotos.size})`}
                      </button>
                      <button
                        onClick={() => {
                          setSelectionMode(false);
                          setSelectedPhotos(new Set());
                        }}
                        className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors font-fira text-xs sm:text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {photos.length > PHOTOS_PER_PAGE && (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => setPhotosPage(p => Math.max(0, p - 1))}
                        disabled={photosPage === 0}
                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="font-fira text-xs sm:text-sm text-gray-600 px-1">
                        {photosPage + 1}/{totalPages}
                      </span>
                      <button
                        onClick={() => setPhotosPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={photosPage === totalPages - 1}
                        className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid */}
            {photos.length === 0 ? (
              <div className="py-12 px-2 text-center">
                <ImageIcon size={40} className="sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-fira text-sm text-gray-500">No hay fotos en esta galería</p>
              </div>
            ) : (
              <div className="px-0 sm:px-2 lg:px-4 py-2 sm:py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-0.5 sm:gap-2">
                  {photosToShow.map((photo, index) => {
                    const photoIndex = startIdx + index;
                    const isSelected = selectedPhotos.has(photo.id);
                    const isCover = cover_image === photo.file_path;

                    return (
                      <div
                        key={photo.id}
                        onClick={() => selectionMode && togglePhotoSelection(photo.id)}
                        className={`group relative aspect-square bg-gray-100 overflow-hidden cursor-pointer transition-all ${selectionMode ? 'hover:opacity-80' : ''
                          } ${isSelected ? 'ring-2 sm:ring-4 ring-[#79502A]' : ''}`}
                      >
                        <Image
                          src={photo.file_path}
                          alt={photo.file_name || `Foto ${photoIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />

                        {selectionMode && (
                          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10">
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                              ? 'bg-[#79502A] border-[#79502A]'
                              : 'bg-white/90 border-gray-300'
                              }`}>
                              {isSelected && <CheckSquare size={14} className="sm:w-4 sm:h-4 text-white" strokeWidth={3} />}
                            </div>
                          </div>
                        )}

                        {isCover && !selectionMode && (
                          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/70 backdrop-blur-sm rounded">
                            <span className="font-fira text-[8px] sm:text-[9px] font-bold text-white flex items-center gap-1">
                              <Star size={8} className="sm:w-[10px] sm:h-[10px] fill-[#79502A] text-[#79502A]" />
                              PORTADA
                            </span>
                          </div>
                        )}

                        {!selectionMode && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200">
                            <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              {!isCover && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetAsCover(photo.file_path);
                                  }}
                                  disabled={changingCover}
                                  className="flex-1 py-1 sm:py-1.5 bg-white/95 hover:bg-white rounded text-[9px] sm:text-[10px] font-fira font-bold text-black flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <Star size={10} />
                                  <span className="hidden sm:inline">PORTADA</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showModal({
                                    title: 'Próximamente',
                                    message: 'El visor de fotos estará disponible pronto.',
                                    type: 'info'
                                  });
                                }}
                                className="flex-1 py-1 sm:py-1.5 bg-white/95 hover:bg-white rounded text-[9px] sm:text-[10px] font-fira font-bold text-black flex items-center justify-center gap-1"
                              >
                                <Eye size={10} />
                                VER
                              </button>
                            </div>
                          </div>
                        )}

                        {!selectionMode && (
                          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-1 sm:px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded">
                            <span className="font-fira text-[8px] sm:text-[9px] font-bold text-white">
                              #{photoIndex + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Loading overlay para cambio de portada */}
      {changingCover && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 size={32} className="text-[#79502A] animate-spin" />
            <p className="font-fira text-sm text-black font-medium">
              Subiendo portada...
            </p>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareGalleryModal
          galleryId={id}
          gallerySlug={slug}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />
    </div>
  );
}