'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Upload, X, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PhotoUploader({ galleryId, onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [previewPage, setPreviewPage] = useState(0);
  const PREVIEWS_PER_PAGE = 20;

  const startIdx = previewPage * PREVIEWS_PER_PAGE;
  const endIdx = startIdx + PREVIEWS_PER_PAGE;
  const previewsToShow = selectedFiles.slice(startIdx, endIdx);
  const totalPages = Math.ceil(selectedFiles.length / PREVIEWS_PER_PAGE);

  const optimizeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = document.createElement('img');

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const MAX_DIMENSION = 1920;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              if (width > MAX_DIMENSION) {
                height = (height * MAX_DIMENSION) / width;
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width = (width * MAX_DIMENSION) / height;
                height = MAX_DIMENSION;
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
            0.85
          );
        };

        img.onerror = () => reject(new Error('Error al cargar imagen'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const isValid = validTypes.includes(file.type) && file.size <= 15 * 1024 * 1024;

      if (!isValid) {
        console.warn(`Archivo rechazado: ${file.name}`);
      }

      return isValid;
    });

    if (validFiles.length === 0) {
      alert('No se seleccionaron archivos válidos. Usa JPG, PNG o WebP menores a 15MB.');
      return;
    }

    const filesWithPreviews = await Promise.all(
      validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        return {
          file,
          preview,
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
        };
      })
    );

    setSelectedFiles(prev => [...prev, ...filesWithPreviews]);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, []);

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const removed = prev.find(f => f.id === fileId);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const uploadSinglePhoto = async (fileData, index) => {
    const { file, id, name } = fileData;

    try {
      setUploadProgress(prev => ({
        ...prev,
        [id]: { status: 'optimizing', progress: 0 }
      }));

      const optimizedBlob = await optimizeImage(file);
      const optimizedFile = new File(
        [optimizedBlob],
        `${name.split('.')[0]}.webp`,
        { type: 'image/webp' }
      );

      if (process.env.NODE_ENV === 'development') {
        const reduction = ((1 - optimizedBlob.size / file.size) * 100).toFixed(1);
        console.log(`📸 ${name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedBlob.size / 1024).toFixed(0)}KB (-${reduction}%)`);
      }

      setUploadProgress(prev => ({
        ...prev,
        [id]: { status: 'uploading', progress: 50 }
      }));

      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('folder', `galleries/${galleryId}`);
      formData.append('resourceType', 'image');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir imagen');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(prev => ({
        ...prev,
        [id]: { status: 'saving', progress: 75 }
      }));

      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          gallery_id: galleryId,
          file_path: result.url,
          file_name: optimizedFile.name,
          file_size: optimizedBlob.size,
          display_order: index,
        });

      if (dbError) throw dbError;

      setUploadProgress(prev => ({
        ...prev,
        [id]: { status: 'completed', progress: 100 }
      }));

      // ✅ Liberar preview inmediatamente
      URL.revokeObjectURL(fileData.preview);

      return { success: true, id };
    } catch (error) {
      console.error(`Error uploading ${name}:`, error);

      setUploadErrors(prev => ({
        ...prev,
        [id]: error.message
      }));

      setUploadProgress(prev => ({
        ...prev,
        [id]: { status: 'error', progress: 0 }
      }));

      return { success: false, id, error };
    }
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    const BATCH_SIZE = 3;
    const batches = [];

    for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
      batches.push(selectedFiles.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map((fileData, index) =>
          uploadSinglePhoto(fileData, index)
        )
      );
    }

    // ✅ FIX: Limpiar TODO después de terminar
    const allFileIds = selectedFiles.map(f => f.id);
    
    // Liberar TODAS las URLs
    selectedFiles.forEach(f => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });

    // Limpiar estados INMEDIATAMENTE
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadErrors({});
    setPreviewPage(0);
    setUploading(false);

    // Notificar al padre para refrescar galería
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* ✅ Placeholder de drag & drop - SOLO si NO hay fotos seleccionadas */}
      {selectedFiles.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-all border-gray-300 hover:border-[#79502A] hover:bg-[#79502A]/5 cursor-pointer"
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="photo-upload"
          />

          <label htmlFor="photo-upload" className="cursor-pointer block">
            <div className="inline-flex p-3 sm:p-4 bg-gray-100 rounded-full mb-3 sm:mb-4">
              <Upload size={24} className="sm:w-8 sm:h-8 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="font-fira text-sm sm:text-base font-semibold text-black mb-2">
              Arrastra fotos aquí o haz click para seleccionar
            </p>
            <p className="font-fira text-xs sm:text-sm text-gray-500">
              JPG, PNG o WebP • Max 15MB • Optimización automática
            </p>
          </label>
        </div>
      )}

      {/* Preview de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <p className="font-fira text-sm font-semibold text-black">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'foto' : 'fotos'}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                    disabled={previewPage === 0}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-fira text-xs text-gray-600">
                    {previewPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPreviewPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={previewPage === totalPages - 1}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {!uploading && (
              <button
                onClick={handleUploadAll}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#79502A] hover:bg-[#8B5A2F] text-white rounded-lg transition-colors font-fira text-sm font-semibold flex items-center gap-2 justify-center"
                type="button"
              >
                <Upload size={16} />
                Subir {selectedFiles.length}
              </button>
            )}
          </div>

          {/* Grid previews */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {previewsToShow.map((fileData) => {
              const progress = uploadProgress[fileData.id];

              return (
                <div
                  key={fileData.id}
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <Image
                    src={fileData.preview}
                    alt={fileData.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />

                  {/* Estados */}
                  {progress && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                      {progress.status === 'optimizing' && (
                        <>
                          <Loader2 className="text-white animate-spin mb-2" size={28} />
                          <p className="font-fira text-xs text-white font-medium">Optimizando...</p>
                        </>
                      )}
                      {progress.status === 'uploading' && (
                        <>
                          <Loader2 className="text-white animate-spin mb-2" size={28} />
                          <p className="font-fira text-xs text-white font-medium">Subiendo...</p>
                        </>
                      )}
                      {progress.status === 'saving' && (
                        <>
                          <Loader2 className="text-white animate-spin mb-2" size={28} />
                          <p className="font-fira text-xs text-white font-medium">Guardando...</p>
                        </>
                      )}
                      {progress.status === 'error' && (
                        <>
                          <AlertCircle className="text-red-400 mb-2" size={28} />
                          <p className="font-fira text-xs text-white px-2">Error</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Botón eliminar */}
                  {!progress && !uploading && (
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="font-fira text-[9px] sm:text-[10px] text-white truncate">
                      {fileData.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progreso global */}
          {uploading && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-fira text-black font-semibold">
                  Optimizando y subiendo...
                </span>
                <span className="font-fira text-gray-600">
                  {Object.keys(uploadProgress).filter(id => uploadProgress[id]?.status === 'completed').length}/{selectedFiles.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#79502A] h-3 transition-all duration-300"
                  style={{
                    width: `${(Object.keys(uploadProgress).filter(id => uploadProgress[id]?.status === 'completed').length / selectedFiles.length) * 100}%`
                  }}
                />
              </div>
              <p className="font-fira text-xs text-gray-500 mt-2">
                Comprimiendo a ~300KB por foto para galerías ligeras y rápidas
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}