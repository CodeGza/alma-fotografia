'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Upload, Loader2, Check, X } from 'lucide-react';
import Image from 'next/image';

/**
 * CreateGalleryForm - Formulario optimizado de creación de galería
 * 
 * Optimizaciones de imágenes:
 * - Compresión automática antes de subir
 * - Resize a máximo 1920px de ancho
 * - Conversión a WebP (mejor compresión)
 * - Validación de peso y tipo
 */
export default function CreateGalleryForm() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        eventDate: '',
        clientEmail: '',
        isPublic: false,
    });

    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    /**
     * Optimiza imagen antes de subirla
     * 
     * Por qué necesario:
     * - Reduce costos de storage
     * - Mejora velocidad de carga para clientes
     * - Ahorra bandwidth
     * 
     * Optimizaciones:
     * 1. Resize a máximo 1920px ancho (mantiene aspecto)
     * 2. Compresión con calidad 85% (buen balance calidad/peso)
     * 3. Conversión a WebP (30-50% menos peso que JPG)
     * 
     * @param {File} file - Imagen original
     * @returns {Promise<Blob>} - Imagen optimizada
     */
    const optimizeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = document.createElement('img');

                img.onload = () => {
                    // Crear canvas para redimensionar
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calcular dimensiones manteniendo aspecto
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1920;
                    let width = img.width;
                    let height = img.height;

                    // Solo redimensionar si es más grande que MAX_WIDTH
                    if (width > MAX_WIDTH) {
                        height = (height * MAX_WIDTH) / width;
                        width = MAX_WIDTH;
                    }

                    if (height > MAX_HEIGHT) {
                        width = (width * MAX_HEIGHT) / height;
                        height = MAX_HEIGHT;
                    }

                    // Configurar canvas
                    canvas.width = width;
                    canvas.height = height;

                    // Dibujar imagen redimensionada
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir a Blob (WebP, 85% calidad)
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Error al optimizar imagen'));
                            }
                        },
                        'image/webp', // Formato WebP para mejor compresión
                        0.85 // 85% de calidad (buen balance)
                    );
                };

                img.onerror = () => reject(new Error('Error al cargar imagen'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsDataURL(file);
        });
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
            ...(name === 'title' && { slug: generateSlug(value) })
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    /**
     * Maneja selección de imagen con optimización
     * 
     * Flujo:
     * 1. Validar tipo y tamaño original
     * 2. Optimizar imagen (resize + compress + webp)
     * 3. Mostrar preview
     * 4. Guardar blob optimizado para upload
     */
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({
                ...prev,
                coverImage: 'Solo se permiten imágenes JPG, PNG o WebP'
            }));
            return;
        }

        // Validar tamaño original (máx 10MB antes de optimizar)
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                coverImage: 'La imagen no debe superar los 10MB'
            }));
            return;
        }

        try {
            // Mostrar loading mientras optimiza
            setIsUploading(true);

            // Optimizar imagen
            const optimizedBlob = await optimizeImage(file);

            // Crear File desde Blob optimizado
            const optimizedFile = new File(
                [optimizedBlob],
                `${file.name.split('.')[0]}.webp`,
                { type: 'image/webp' }
            );

            setCoverImage(optimizedFile);
            setErrors(prev => ({ ...prev, coverImage: null }));

            // Generar preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result);
            };
            reader.readAsDataURL(optimizedFile);

            // Log de optimización (solo dev)
            if (process.env.NODE_ENV === 'development') {
                const reduction = ((1 - optimizedBlob.size / file.size) * 100).toFixed(1);
                console.log(`📸 Imagen optimizada: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedBlob.size / 1024 / 1024).toFixed(2)}MB (${reduction}% reducción)`);
            }
        } catch (error) {
            console.error('Error optimizing image:', error);
            setErrors(prev => ({
                ...prev,
                coverImage: 'Error al procesar la imagen. Intenta con otra.'
            }));
        } finally {
            setIsUploading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'El slug es obligatorio';
        }

        if (formData.clientEmail && !formData.clientEmail.includes('@')) {
            newErrors.clientEmail = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    /**
     * Sube imagen de portada a Cloudinary
     * 
     * Por qué Cloudinary en lugar de Supabase:
     * - 25GB gratis (vs 1GB)
     * - Optimización automática mejor
     * - CDN global
     */
    const uploadCoverImage = async () => {
        if (!coverImage) return null;

        try {
            // ✅ Crear FormData para enviar a API Route
            const formData = new FormData();
            formData.append('file', coverImage);
            formData.append('folder', 'gallery-covers');
            formData.append('resourceType', 'image');

            // ✅ Subir a Cloudinary via API Route
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error uploading image');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            console.log('✅ Imagen subida a Cloudinary:', result.url);

            // ✅ Retornar URL de Cloudinary
            return result.url;
        } catch (error) {
            console.error('❌ Error uploading cover image:', error);
            setErrors(prev => ({
                ...prev,
                coverImage: 'Error al subir la imagen. Intenta nuevamente.'
            }));
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // ✅ USAR supabase directamente (ya importado arriba)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const coverImageUrl = await uploadCoverImage();

            if (coverImage && !coverImageUrl) {
                setIsSubmitting(false);
                return;
            }

            const { data: gallery, error } = await supabase
                .from('galleries')
                .insert({
                    title: formData.title.trim(),
                    slug: formData.slug.trim(),
                    description: formData.description.trim() || null,
                    event_date: formData.eventDate || null,
                    client_email: formData.clientEmail.trim() || null,
                    cover_image: coverImageUrl,
                    is_public: formData.isPublic,
                    created_by: user.id,
                    views_count: 0,
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    setErrors({ slug: 'Este slug ya existe. Elige otro.' });
                    setIsSubmitting(false);
                    return;
                }
                throw error;
            }

            router.push('/dashboard/galerias');
        } catch (error) {
            console.error('Error creating gallery:', error);
            setErrors({
                submit: 'Error al crear la galería. Intenta nuevamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 lg:p-12 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="font-fira text-sm text-red-800">{errors.submit}</p>
                    </div>
                )}

                <div>
                    <label className="block font-fira text-sm font-medium text-black mb-2">
                        Título de la galería *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Ej: Sesión María y Juan - Casamiento"
                        className={`w-full px-4 py-3 border rounded-lg font-fira text-sm text-black focus:outline-none focus:ring-2 transition-colors ${errors.title
                            ? 'border-red-300 focus:ring-red-200'
                            : 'border-black/10 focus:ring-golden/30'
                            }`}
                    />
                    {errors.title && (
                        <p className="mt-2 font-fira text-sm text-red-600">{errors.title}</p>
                    )}
                </div>

                <div>
                    <label className="block font-fira text-sm font-medium text-black mb-2">
                        URL de la galería *
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-fira text-sm text-black/60">
                            {typeof window !== 'undefined' && window.location.origin}/galeria/
                        </span>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="sesion-maria-juan"
                            className={`flex-1 px-4 py-3 border rounded-lg font-fira text-sm text-black focus:outline-none focus:ring-2 transition-colors ${errors.slug
                                ? 'border-red-300 focus:ring-red-200'
                                : 'border-black/10 focus:ring-golden/30'
                                }`}
                        />
                    </div>
                    <p className="font-fira text-xs text-black/50">
                        Se genera automáticamente, pero puedes editarlo
                    </p>
                    {errors.slug && (
                        <p className="mt-2 font-fira text-sm text-red-600">{errors.slug}</p>
                    )}
                </div>

                <div>
                    <label className="block font-fira text-sm font-medium text-black mb-2">
                        Descripción (opcional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Breve descripción de la sesión..."
                        rows={4}
                        className="w-full px-4 py-3 border border-black/10 rounded-lg font-fira text-sm text-black focus:outline-none focus:ring-2 focus:ring-golden/30 transition-colors resize-none"
                    />
                </div>

                <div>
                    <label className="block font-fira text-sm font-medium text-black mb-2">
                        Fecha del evento (opcional)
                    </label>
                    <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-black/10 rounded-lg font-fira text-sm text-black focus:outline-none focus:ring-2 focus:ring-golden/30 transition-colors"
                    />
                </div>

                <div>
                    <label className="block font-fira text-sm font-medium text-black mb-2">
                        Email del cliente (opcional)
                    </label>
                    <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                        placeholder="cliente@ejemplo.com"
                        className={`w-full px-4 py-3 border rounded-lg font-fira text-sm text-black focus:outline-none focus:ring-2 transition-colors ${errors.clientEmail
                            ? 'border-red-300 focus:ring-red-200'
                            : 'border-black/10 focus:ring-golden/30'
                            }`}
                    />
                    {errors.clientEmail && (
                        <p className="mt-2 font-fira text-sm text-red-600">{errors.clientEmail}</p>
                    )}
                </div>

                <div>
                    <label className="block font-fira text-sm font-medium text-black mb-2">
                        Imagen de portada (opcional)
                    </label>

                    {coverImagePreview ? (
                        <div className="relative w-full aspect-video bg-beige/20 rounded-lg overflow-hidden mb-4">
                            <Image
                                src={coverImagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setCoverImage(null);
                                    setCoverImagePreview(null);
                                }}
                                disabled={isUploading}
                                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors disabled:opacity-50"
                            >
                                <X size={20} className="text-black" />
                            </button>
                        </div>
                    ) : (
                        <label className={`block w-full aspect-video border-2 border-dashed rounded-lg transition-colors ${isUploading
                            ? 'border-golden bg-golden/5'
                            : 'border-black/20 hover:border-golden cursor-pointer'
                            }`}>
                            <div className="flex flex-col items-center justify-center h-full">
                                {isUploading ? (
                                    <>
                                        <Loader2 size={48} className="text-golden animate-spin mb-4" strokeWidth={1.5} />
                                        <p className="font-fira text-sm text-black/60">
                                            Optimizando imagen...
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={48} className="text-black/30 mb-4" strokeWidth={1} />
                                        <p className="font-fira text-sm text-black/60">
                                            Click para subir imagen
                                        </p>
                                        <p className="font-fira text-xs text-black/40 mt-1">
                                            JPG, PNG o WebP (máx. 10MB)
                                        </p>
                                        <p className="font-fira text-xs text-golden mt-2">
                                            Se optimizará automáticamente
                                        </p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleImageSelect}
                                disabled={isUploading}
                                className="hidden"
                            />
                        </label>
                    )}

                    {errors.coverImage && (
                        <p className="mt-2 font-fira text-sm text-red-600">{errors.coverImage}</p>
                    )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-beige/20 rounded-lg border border-black/10">
                    <input
                        type="checkbox"
                        id="isPublic"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleInputChange}
                        className="w-5 h-5 accent-golden"
                    />
                    <label htmlFor="isPublic" className="flex-1 cursor-pointer">
                        <p className="font-fira text-sm font-medium text-black">
                            Galería pública
                        </p>
                        <p className="font-fira text-xs text-black/60 mt-1">
                            Si está activado, la galería aparecerá en la página principal
                        </p>
                    </label>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-black/10">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting || isUploading}
                        className="px-6 py-3 border-2 border-black/20 text-black hover:bg-black/5 rounded-lg transition-colors font-fira text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="flex-1 px-6 py-3 bg-brown hover:bg-brown/90 disabled:bg-black/20 text-white rounded-lg transition-colors font-fira text-sm font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Creando galería...</span>
                            </>
                        ) : isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Procesando imagen...</span>
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                <span>Crear galería</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
