'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

/**
 * DashboardHeader - Encabezado superior del dashboard
 * 
 * Muestra:
 * - Título de la página actual
 * - Información del usuario (opcional)
 * - Animación de entrada suave
 */
const DashboardHeader = memo(function DashboardHeader({ title, subtitle, userName }) {
  // Variantes de animación para el header
  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8 pb-6 border-b border-[#C6A97D]/20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Título y subtítulo de la página */}
        <div>
          <h1 className="font-voga text-4xl text-[#000000] mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="font-fira font-light text-[#79502A] text-base">
              {subtitle}
            </p>
          )}
        </div>

        {/* Información del usuario (opcional) */}
        {userName && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-[#C6A97D]/20 shadow-sm"
          >
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6A97D] to-[#79502A] flex items-center justify-center">
              <span className="font-fira font-medium text-white text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Nombre del usuario */}
            <div>
              <p className="font-fira font-medium text-sm text-[#000000]">
                {userName}
              </p>
              <p className="font-fira text-xs text-[#79502A]/60">
                Administrador
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
});

export default DashboardHeader;