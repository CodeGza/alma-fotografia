'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

/**
 * ============================================
 * CREATE GALLERY BUTTON
 * ============================================
 * 
 * Botón para crear nueva galería con múltiples variantes.
 * Todos los variantes usan Link de Next.js y son completamente funcionales.
 * 
 * VARIANTES:
 * - header: Botón principal en header (desktop)
 * - compact: Versión pequeña para mobile
 * - inline: Versión inline para lista con descripción
 * - mobile: Card horizontal para lista mobile
 * - default: Botón estándar
 */
export default function CreateGalleryButton({ variant = 'default' }) {
  
  // ==========================================
  // HEADER - Botón principal desktop
  // ==========================================
  if (variant === 'header') {
    return (
      <Link href="/dashboard/galerias/new">
        <button className="px-6 py-3 bg-[#79502A] hover:bg-[#8B5A2F] text-white font-fira font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-lg flex items-center gap-2">
          <Plus size={18} strokeWidth={2} />
          <span>Crear nueva galería</span>
        </button>
      </Link>
    );
  }

  // ==========================================
  // COMPACT - Botón pequeño
  // ==========================================
  if (variant === 'compact') {
    return (
      <Link href="/dashboard/galerias/new">
        <button className="px-4 py-2 bg-[#79502A] hover:bg-[#8B5A2F] text-white font-fira font-semibold text-xs rounded-lg transition-all duration-300 flex items-center gap-1.5">
          <Plus size={14} strokeWidth={2} />
          <span>Crear</span>
        </button>
      </Link>
    );
  }

  // ==========================================
  // INLINE - Card con descripción
  // ==========================================
  if (variant === 'inline') {
    return (
      <Link 
        href="/dashboard/galerias/new" 
        className="block group"
      >
        <div className="flex items-center gap-3 text-white hover:text-[#C6A97D] transition-colors cursor-pointer">
          <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
            <Plus size={20} className="text-[#79502A]" />
          </div>
          <div>
            <p className="font-voga text-lg group-hover:text-[#C6A97D] transition-colors">
              Crear nueva galería
            </p>
            <p className="font-fira text-sm text-white/60">
              Comienza una nueva sesión
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // ==========================================
  // MOBILE - Card horizontal (usado en GalleriesView)
  // ==========================================
  if (variant === 'mobile') {
    return (
      <Link 
        href="/dashboard/galerias/new" 
        className="block"
      >
        <div className="bg-[#2d2d2d] rounded-xl p-4 flex items-center justify-center gap-2 text-white transition-all duration-300 active:scale-[0.98] cursor-pointer min-h-[80px]">
          <div className="p-2 bg-white/5 rounded-full">
            <Plus size={18} className="text-[#79502A]" strokeWidth={2} />
          </div>
          <p className="font-fira text-sm font-semibold">Crear nueva galería</p>
        </div>
      </Link>
    );
  }

  // ==========================================
  // DEFAULT - Botón estándar
  // ==========================================
  return (
    <Link href="/dashboard/galerias/new">
      <button className="px-6 py-3 bg-[#79502A] hover:bg-[#8B5A2F] text-white font-fira font-medium text-sm rounded-lg transition-all duration-300 hover:shadow-lg flex items-center gap-2">
        <Plus size={18} strokeWidth={2} />
        <span>Crear nueva galería</span>
      </button>
    </Link>
  );
}