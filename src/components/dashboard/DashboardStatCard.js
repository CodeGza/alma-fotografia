'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

/**
 * REDISEÑO UI - DashboardStatCard
 *
 * Cambios visuales aplicados:
 * - Fondo #2D2D2D (gris oscuro elegante)
 * - Borde #79502A con opacidad
 * - Textos en #FFF8E2 y #C6A97D
 * - Hover con escala y sombra
 * - Icono con animación de escala
 * - Bordes redondeados rounded-lg
 * - Transiciones suaves 200ms
 *
 * Funcionalidad preservada:
 * - Link a href
 * - Props: stat (id, title, value, iconName, href)
 * - Animaciones framer-motion
 * - Iconos dinámicos lucide-react
 */
export default function DashboardStatCard({ stat }) {
  const Icon = LucideIcons[stat.iconName];

  return (
    <Link href={stat.href} className="block">
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="group relative bg-[#2D2D2D] border border-[#79502A]/30 hover:border-[#C6A97D] rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-200"
      >
        {/* Contenedor de icono */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center bg-[#79502A]/20 rounded-lg group-hover:bg-[#C6A97D]/20 transition-all duration-200">
            {Icon && (
              <Icon
                size={32}
                className="text-[#C6A97D] group-hover:text-[#FFF8E2] group-hover:scale-110 transition-all duration-200"
                strokeWidth={2}
              />
            )}
          </div>
        </div>

        {/* Sección de datos */}
        <div className="text-center">
          <p className="text-5xl text-[#FFF8E2] mb-2 font-light">
            {stat.value}
          </p>
          <p className="text-sm tracking-wider uppercase text-[#C6A97D] font-medium">
            {stat.title}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}