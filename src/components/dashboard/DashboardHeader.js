'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * REDISEÑO UI - DashboardHeader
 *
 * PALETA BLANCO PREDOMINANTE:
 * - Fondo: #2D2D2D (header oscuro como especificado)
 * - Texto título: Blanco
 * - Texto subtitle: Gris claro
 * - Botón volver: #8B5E3C
 * - Bordes: Gris sutil
 *
 * Funcionalidad preservada:
 * - Navegación hacia atrás (router.back o router.push)
 * - Props: title, subtitle, backButton, backHref
 * - Animaciones con framer-motion
 */
export default function DashboardHeader({ title, subtitle, backButton, backHref }) {
  const router = useRouter();

  return (
    <div className="bg-[#2D2D2D] border-b border-white/10 shadow-md">
      <div className="p-6 sm:p-8 lg:p-10">
        {backButton && (
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => backHref ? router.push(backHref) : router.back()}
            className="flex items-center gap-2 text-[#8B5E3C] hover:text-white transition-colors duration-200 mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            <span>Atrás</span>
          </motion.button>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 font-light tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}