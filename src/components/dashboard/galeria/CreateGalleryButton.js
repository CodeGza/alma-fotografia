'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

/**
 * CreateGalleryButton - Botón para crear nueva galería
 * 
 * Diseño coherente con la paleta de Alma Fotografía:
 * - Fondo marrón (#79502A)
 * - Texto blanco
 * - Hover: fondo más oscuro
 */
export default function CreateGalleryButton() {
  return (
    <Link href="/dashboard/galerias/new">
      <button className="group relative px-6 py-3 bg-brown text-white font-fira font-medium text-sm rounded-lg overflow-hidden transition-all duration-300 hover:bg-brown/90 hover:shadow-[0_4px_20px_rgba(121,80,42,0.3)] flex items-center gap-2">
        {/* Contenido del botón */}
        <Plus size={18} strokeWidth={2} />
        <span>Crear nueva galería</span>
      </button>
    </Link>
  );
}