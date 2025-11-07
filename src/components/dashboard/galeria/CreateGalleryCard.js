'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus } from 'lucide-react';

/**
 * CreateGalleryCard - Card especial para crear nueva galería
 * 
 * Aparece como primer elemento con animación suave.
 * Efecto de "respiración" sutil en el ícono +
 */
export default function CreateGalleryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href="/dashboard/galerias/new">
        <div className="group relative bg-gradient-to-br from-beige/40 to-beige/20 border-2 border-dashed border-black/20 rounded-2xl overflow-hidden transition-all duration-500 hover:border-golden hover:from-golden/10 hover:to-beige/30 hover:shadow-[0_8px_30px_rgb(198,169,125,0.15)] cursor-pointer aspect-[4/3] flex flex-col items-center justify-center">
          
          {/* Ícono + con animación de pulso sutil */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-4 p-6 rounded-full bg-white border-2 border-black/10 group-hover:border-golden group-hover:bg-golden/10 transition-all duration-500 shadow-sm group-hover:shadow-md"
          >
            <Plus 
              size={48} 
              className="text-black/40 group-hover:text-golden transition-colors duration-500" 
              strokeWidth={1.5} 
            />
          </motion.div>

          {/* Texto con fade-in */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center"
          >
            <h3 className="font-voga text-xl text-black/60 group-hover:text-golden transition-colors duration-500">
              Crear nueva galería
            </h3>
            
            <p className="font-fira text-sm text-black/40 mt-2 group-hover:text-black/60 transition-colors duration-500">
              Click para comenzar
            </p>
          </motion.div>

          {/* Efecto de brillo sutil en hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}