'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * REDISEÑO UI - DashboardHeader
 *
 * Cambios visuales aplicados:
 * - Fondo #2D2D2D (gris oscuro elegante)
 * - Bordes con #79502A
 * - Textos en tonos claros (#FFF8E2, #C6A97D)
 * - Botón volver con animación suave
 * - Espaciado premium
 * - Sombra suave para elevación
 *
 * Funcionalidad preservada:
 * - Navegación hacia atrás (router.back o router.push)
 * - Props: title, subtitle, backButton, backHref
 * - Animaciones con framer-motion
 */
export default function DashboardHeader({ title, subtitle, backButton, backHref }) {
  const router = useRouter();

  return (
    <div className="bg-[#2D2D2D] border-b border-[#79502A]/30 shadow-md">
      <div className="p-6 sm:p-8 lg:p-10">
        {backButton && (
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => backHref ? router.push(backHref) : router.back()}
            className="flex items-center gap-2 text-[#C6A97D] hover:text-[#FFF8E2] transition-colors duration-200 mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            <span>Atrás</span>
          </motion.button>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#FFF8E2] mb-3 font-light tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-[#C6A97D] max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}