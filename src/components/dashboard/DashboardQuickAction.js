'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

/**
 * DashboardQuickAction - Botón de acción rápida del dashboard
 * 
 * Variantes de estilo:
 * - primary: Fondo marrón (#79502A), texto blanco, hover más oscuro
 * - secondary: Fondo blanco, borde negro, hover invierte colores
 * 
 * Animaciones:
 * - Scale 1.02 en hover
 * - Scale 0.98 en click (feedback táctil)
 * 
 * Layout:
 * - Icono a la izquierda (28px)
 * - Textos a la derecha (título + descripción)
 * - Responsive: se adapta al contenedor padre
 * 
 * Props:
 * @param {string} href - URL de navegación
 * @param {string} iconName - Nombre del icono de lucide-react
 * @param {string} title - Título de la acción (bold)
 * @param {string} description - Descripción corta (light)
 * @param {string} variant - 'primary' o 'secondary'
 */
export default function DashboardQuickAction({ 
  href, 
  iconName, 
  title, 
  description, 
  variant = 'primary' 
}) {
  const isPrimary = variant === 'primary';
  
  // Resolver icono dinámicamente
  const Icon = LucideIcons[iconName];

  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center gap-4 p-6 rounded-none border transition-all duration-300
          ${isPrimary 
            ? 'bg-[#79502A] border-[#79502A] text-white hover:bg-[#5a3c1f]' 
            : 'bg-white border-black text-black hover:bg-black hover:text-white'
          }
        `}
      >
        {/* 
          Icono
          - Flex-shrink-0 para evitar que se comprima
          - Color heredado del contenedor padre
        */}
        {Icon && (
          <div className="flex-shrink-0">
            <Icon size={28} strokeWidth={1.5} />
          </div>
        )}

        {/* 
          Contenedor de textos
          - Título en Fira Sans Medium
          - Descripción en Fira Sans Regular (más pequeña)
        */}
        <div>
          <div className="font-fira font-medium text-base mb-1">
            {title}
          </div>
          <div className={`font-fira text-xs ${
            isPrimary ? 'text-white/70' : 'text-black/60 group-hover:text-white/70'
          }`}>
            {description}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}