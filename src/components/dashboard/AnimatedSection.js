'use client';

import { motion } from 'framer-motion';

/**
 * AnimatedSection - Componente para animar secciones individuales dentro de una página
 * 
 * Útil para animar cards, estadísticas, o bloques de contenido de forma escalonada.
 * Los elementos aparecen uno tras otro con un pequeño delay.
 * 
 * Props:
 * - delay: número opcional para agregar delay adicional (default: 0)
 * - children: contenido a animar
 * 
 * Uso:
 * <AnimatedSection delay={0.1}>
 *   <tu-card />
 * </AnimatedSection>
 */
export default function AnimatedSection({ children, delay = 0 }) {
  const variants = {
    hidden: {
      opacity: 0,
      y: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}