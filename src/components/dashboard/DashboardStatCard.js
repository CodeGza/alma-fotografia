'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

/**
 * DashboardStatCard - Tarjeta de estadística minimalista
 * 
 * Diseño:
 * - Fondo blanco, borde negro fino (1px)
 * - Sin sombras ni degradados (estilo editorial)
 * - Hover sutil: solo borde se oscurece + icono cambia a dorado
 * - Layout vertical: icono arriba, número centro, label abajo
 * 
 * Animación:
 * - Scale 1.02 en hover (muy sutil)
 * - Duración 200ms para suavidad
 * 
 * Props:
 * @param {Object} stat - { id, title, value, iconName, href }
 * @param {string} stat.title - Label descriptivo (ej: "Galerías")
 * @param {string} stat.value - Número a mostrar (ej: "12")
 * @param {string} stat.iconName - Nombre del icono de lucide-react
 * @param {string} stat.href - URL de navegación
 */
export default function DashboardStatCard({ stat }) {
  // Resolver icono dinámicamente desde lucide-react
  // Esto evita error de serialización Server → Client Component
  const Icon = LucideIcons[stat.iconName];

  return (
    <Link href={stat.href} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="group relative bg-white border border-black/20 hover:border-black rounded-none p-8 transition-all duration-300"
      >
        {/* 
          Contenedor de icono
          - Cuadrado perfecto (64x64px)
          - Borde que cambia a dorado en hover
        */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center border border-black/20 group-hover:border-[#C6A97D] transition-colors duration-300">
            {Icon && (
              <Icon 
                size={32} 
                className="text-black group-hover:text-[#C6A97D] transition-colors duration-300" 
                strokeWidth={1.5}
              />
            )}
          </div>
        </div>

        {/* 
          Sección de datos
          - Número grande con Voga (elegante)
          - Label pequeño uppercase con Fira Sans
        */}
        <div className="text-center">
          <p className="font-voga text-5xl text-black mb-2">
            {stat.value}
          </p>
          <p className="font-fira text-sm tracking-wider uppercase text-black/60">
            {stat.title}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}