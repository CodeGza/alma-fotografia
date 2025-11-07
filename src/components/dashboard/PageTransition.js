'use client';

import { motion } from 'framer-motion';

/**
 * PageTransition - Componente wrapper para animar transiciones entre páginas
 * 
 * Aplica animaciones suaves de fade + slide cuando el usuario navega
 * entre diferentes secciones del dashboard.
 * 
 * Uso:
 * <PageTransition>
 *   <tu-contenido-aquí />
 * </PageTransition>
 */
export default function PageTransition({ children }) {
  // Variantes de animación: entrada y salida suaves
  const variants = {
    hidden: {
      opacity: 0,
      y: 20, // Empieza 20px más abajo
      scale: 0.98, // Ligeramente más pequeño
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1], // Curva de easing suave
        staggerChildren: 0.1, // Los hijos se animan secuencialmente
      },
    },
    exit: {
      opacity: 0,
      y: -10, // Sale hacia arriba
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}