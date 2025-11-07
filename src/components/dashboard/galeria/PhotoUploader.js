'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Upload, X, Loader2, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PhotoUploader - Subida múltiple de fotos a Cloudinary
 * 
 * Funcionalidades:
 * - Drag & drop múltiple
 * - Preview antes de subir
 * - Optimización automática (browser-side)
 * - Upload a Cloudinary en batch
 * - Barra de progreso por foto
 * - Guarda referencias en BD
 */
export default function PhotoUploader({ galleryId, onUploadComplete }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadErrors, setUploadErrors] = useState({});
    const [previewPage, setPreviewPage] = useState(0);
    const PREVIEWS_PER_PAGE = 20;

    // Calcular fotos a mostrar:
    const startIdx = previewPage * PREVIEWS_PER_PAGE;
    const endIdx = startIdx + PREVIEWS_PER_PAGE;
    const previewsToShow = selectedFiles.slice(startIdx, endIdx);
    const totalPages = Math.ceil(selectedFiles.length / PREVIEWS_PER_PAGE);

    /**
     * Optimiza imagen antes de subir
     * 
     * Por qué browser-side:
     * - Reduce tiempo de upload (archivos más chicos)
     * - Ahorra bandwidth
     * - Cloudinary luego optimiza aún más
     */
    const optimizeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = document.createElement('img');

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Dimensiones objetivo
                    const MAX_WIDTH = 1600;
                    const MAX_HEIGHT = 1600;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = (height * MAX_WIDTH) / width;
                        width = MAX_WIDTH;
                    }

                    if (height > MAX_HEIGHT) {
                        width = (width * MAX_HEIGHT) / height;
                        height = MAX_HEIGHT;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // WebP 80% calidad (balance perfecto)
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Error al optimizar'));
                            }
                        },
                        'image/webp',
                        0.80
                    );
                };

                img.onerror = () => reject(new Error('Error al cargar imagen'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsDataURL(file);
        });
    };

    /**
     * Maneja selección de archivos (input o drag & drop)
     */
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

        // Crear previews
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

    /**
     * Drag & drop handlers
     */
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

    /**
     * Elimina foto de la selección
     */
    const removeFile = (fileId) => {
        setSelectedFiles(prev => {
            const updated = prev.filter(f => f.id !== fileId);
            // Liberar URL del preview
            const removed = prev.find(f => f.id === fileId);
            if (removed) {
                URL.revokeObjectURL(removed.preview);
            }
            return updated;
        });
    };

    /**
     * Sube una foto individual a Cloudinary
     */
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
                console.log(`📸 ${name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedBlob.size / 1024 / 1024).toFixed(2)}MB (-${reduction}%)`);
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

            // ✅ NUEVO: Liberar URL del preview para liberar memoria
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

    /**
     * Sube todas las fotos seleccionadas
     * 
     * Por qué batch con límite:
     * - Evita saturar Cloudinary API
     * - Mejor experiencia (se ven subiendo)
     * - Manejo de errores individual
     */
    const handleUploadAll = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);

        const BATCH_SIZE = 5;
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

        setUploading(false);

        // ✅ Limpiar TODOS los archivos exitosos inmediatamente
        const completedIds = Object.entries(uploadProgress)
            .filter(([_, status]) => status.status === 'completed')
            .map(([id]) => id);

        // Liberar URLs de previews
        selectedFiles
            .filter(f => completedIds.includes(f.id))
            .forEach(f => URL.revokeObjectURL(f.preview));

        // Remover de la lista
        setSelectedFiles(prev => prev.filter(f => !completedIds.includes(f.id)));

        // Notificar al padre para refrescar
        if (onUploadComplete) {
            onUploadComplete();
        }

        //Limpiar TODOS los archivos seleccionados
        selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        setSelectedFiles([]);

        //Resetear página de preview
        setPreviewPage(0);

        //Limpiar estados de progreso después de 2 segundos
        // (para que el usuario vea el checkmark verde)
        setTimeout(() => {
            setUploadProgress({});
            setUploadErrors({});
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Zona de drag & drop */}
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${uploading
                    ? 'border-golden/50 bg-golden/5 cursor-not-allowed'
                    : 'border-black/20 hover:border-golden cursor-pointer bg-beige/10'
                    }`}
            >
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={uploading}
                    className="hidden"
                    id="photo-upload"
                />

                <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload size={48} className="text-black/30 mx-auto mb-4" strokeWidth={1} />
                    <p className="font-fira text-sm text-black/60 mb-2">
                        Arrastra fotos aquí o haz click para seleccionar
                    </p>
                    <p className="font-fira text-xs text-black/40">
                        JPG, PNG o WebP • Máx 15MB cada una • Hasta 100 fotos
                    </p>
                </label>
            </div>

            {/* Preview de archivos seleccionados */}
            {/* Preview de archivos seleccionados */}
            {selectedFiles.length > 0 && (() => {
                // Calcular paginación
                const startIdx = previewPage * PREVIEWS_PER_PAGE;
                const endIdx = startIdx + PREVIEWS_PER_PAGE;
                const previewsToShow = selectedFiles.slice(startIdx, endIdx);
                const totalPages = Math.ceil(selectedFiles.length / PREVIEWS_PER_PAGE);

                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <p className="font-fira text-sm text-black/70">
                                    {selectedFiles.length} {selectedFiles.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}
                                </p>

                                {/* ✅ Navegación de páginas */}
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                                            disabled={previewPage === 0}
                                            className="p-1.5 border border-black/20 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            type="button"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="font-fira text-xs text-black/60">
                                            {previewPage + 1} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPreviewPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={previewPage === totalPages - 1}
                                            className="p-1.5 border border-black/20 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            type="button"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!uploading && (
                                <button
                                    onClick={handleUploadAll}
                                    className="px-6 py-2.5 bg-brown hover:bg-brown/90 text-white rounded-lg transition-colors font-fira text-sm font-medium flex items-center gap-2"
                                    type="button"
                                >
                                    <Upload size={16} />
                                    Subir {selectedFiles.length} {selectedFiles.length === 1 ? 'foto' : 'fotos'}
                                </button>
                            )}
                        </div>

                        {/* Grid de previews */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previewsToShow.map((fileData) => {
                                const progress = uploadProgress[fileData.id];
                                const error = uploadErrors[fileData.id];

                                // Ocultar completados
                                if (progress?.status === 'completed') {
                                    return null;
                                }

                                return (
                                    <div
                                        key={fileData.id}
                                        className="relative group aspect-square bg-beige/20 rounded-lg overflow-hidden"
                                    >
                                        {/* Preview de imagen */}
                                        <Image
                                            src={fileData.preview}
                                            alt={fileData.name}
                                            fill
                                            className="object-cover"
                                        />

                                        {/* Overlay con estado */}
                                        {progress && (
                                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                                                {progress.status === 'optimizing' && (
                                                    <>
                                                        <Loader2 className="text-white animate-spin mb-2" size={32} />
                                                        <p className="font-fira text-xs text-white">Optimizando...</p>
                                                    </>
                                                )}
                                                {progress.status === 'uploading' && (
                                                    <>
                                                        <Loader2 className="text-white animate-spin mb-2" size={32} />
                                                        <p className="font-fira text-xs text-white">Subiendo...</p>
                                                    </>
                                                )}
                                                {progress.status === 'saving' && (
                                                    <>
                                                        <Loader2 className="text-white animate-spin mb-2" size={32} />
                                                        <p className="font-fira text-xs text-white">Guardando...</p>
                                                    </>
                                                )}
                                                {progress.status === 'error' && (
                                                    <>
                                                        <AlertCircle className="text-red-400 mb-2" size={32} />
                                                        <p className="font-fira text-xs text-white px-2">Error</p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Botón eliminar */}
                                        {!progress && !uploading && (
                                            <button
                                                onClick={() => removeFile(fileData.id)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                type="button"
                                            >
                                                <X size={16} className="text-black" />
                                            </button>
                                        )}

                                        {/* Info de archivo */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                            <p className="font-fira text-xs text-white truncate">
                                                {fileData.name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ✅ Barra de progreso GLOBAL */}
                        {uploading && (
                            <div className="mt-6 p-4 bg-beige/20 rounded-lg border border-black/10">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-fira text-black/70 font-medium">
                                        Subiendo fotos...
                                    </span>
                                    <span className="font-fira text-black/70">
                                        {Object.keys(uploadProgress).filter(id => uploadProgress[id]?.status === 'completed').length} / {selectedFiles.length}
                                    </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-brown h-3 transition-all duration-300"
                                        style={{
                                            width: `${(Object.keys(uploadProgress).filter(id => uploadProgress[id]?.status === 'completed').length / selectedFiles.length) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
}