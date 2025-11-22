'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

/**
 * REDISEÑO UI - DashboardStatCard
 *
 * PALETA BLANCO PREDOMINANTE:
 * - Fondo: #FFFFFF (blanco puro)
 * - Bordes: #E5E7EB (gris sutil)
 * - Icono: #8B5E3C (marrón)
 * - Texto valor: #2D2D2D (oscuro)
 * - Texto título: #6B7280 (gris)
 * - Hover: Elevación con sombra
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
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="group relative bg-white border border-gray-200 hover:border-[#8B5E3C] rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-200"
      >
        {/* Contenedor de icono */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-50 group-hover:bg-[#8B5E3C]/10 rounded-lg transition-all duration-200">
            {Icon && (
              <Icon
                size={32}
                className="text-[#8B5E3C] group-hover:scale-110 transition-all duration-200"
                strokeWidth={2}
              />
            )}
          </div>
        </div>

        {/* Sección de datos */}
        <div className="text-center">
          <p className="text-5xl text-[#2D2D2D] mb-2 font-light">
            {stat.value}
          </p>
          <p className="text-sm tracking-wider uppercase text-gray-600 font-medium">
            {stat.title}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}