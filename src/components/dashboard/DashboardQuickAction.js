'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

/**
 * REDISEÑO UI - DashboardQuickAction
 *
 * Cambios visuales aplicados:
 * - Primary: fondo #79502A, texto blanco, hover más oscuro
 * - Secondary: fondo blanco, borde #79502A, texto #2D2D2D, hover con fondo #79502A/10
 * - Bordes redondeados rounded-lg
 * - Sombras suaves para elevación
 * - Animaciones de escala y elevación
 * - Textos más concisos
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
          flex items-center gap-4 p-6 rounded-lg border transition-all duration-200 shadow-md hover:shadow-lg
          ${isPrimary
            ? 'bg-[#79502A] border-[#79502A] text-white hover:bg-[#5a3c1f]'
            : 'bg-white border-[#79502A]/30 text-[#2D2D2D] hover:bg-[#79502A]/10 hover:border-[#79502A]'
          }
        `}
      >
        {/* Icono */}
        {Icon && (
          <div className="flex-shrink-0">
            <Icon size={28} strokeWidth={2} className={isPrimary ? 'text-white' : 'text-[#79502A]'} />
          </div>
        )}

        {/* Contenedor de textos */}
        <div>
          <div className="font-medium text-base mb-1">
            {title}
          </div>
          <div className={`text-xs ${
            isPrimary ? 'text-white/80' : 'text-[#79502A]/70'
          }`}>
            {description}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}