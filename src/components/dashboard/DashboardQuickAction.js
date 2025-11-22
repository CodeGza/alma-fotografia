'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

/**
 * REDISEÑO UI - DashboardQuickAction
 *
 * PALETA BLANCO PREDOMINANTE:
 * - Primary: fondo #8B5E3C (marrón), texto blanco
 * - Secondary: fondo blanco, borde gris, texto oscuro
 * - Iconos: #8B5E3C
 * - Hover: Elevación sutil
 *
 * Funcionalidad preservada:
 * - Link a href
 * - Props: href, iconName, title, description, variant
 * - Variantes primary/secondary
 * - Animaciones framer-motion
 * - Iconos dinámicos lucide-react
 */
export default function DashboardQuickAction({
  href,
  iconName,
  title,
  description,
  variant = 'primary'
}) {
  const isPrimary = variant === 'primary';
  const Icon = LucideIcons[iconName];

  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center gap-4 p-6 rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md
          ${isPrimary
            ? 'bg-[#8B5E3C] border-[#8B5E3C] text-white hover:bg-[#6d4a2f]'
            : 'bg-white border-gray-200 text-[#2D2D2D] hover:bg-gray-50 hover:border-[#8B5E3C]'
          }
        `}
      >
        {/* Icono */}
        {Icon && (
          <div className="flex-shrink-0">
            <Icon size={28} strokeWidth={2} className={isPrimary ? 'text-white' : 'text-[#8B5E3C]'} />
          </div>
        )}

        {/* Contenedor de textos */}
        <div>
          <div className="font-medium text-base mb-1">
            {title}
          </div>
          <div className={`text-xs ${
            isPrimary ? 'text-white/80' : 'text-gray-600'
          }`}>
            {description}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}