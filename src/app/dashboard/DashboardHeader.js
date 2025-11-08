'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardHeader({ title, subtitle, backButton, backHref }) {
  const router = useRouter();

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="p-4 sm:p-6 lg:p-8">
        {backButton && (
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => backHref ? router.push(backHref) : router.back()}
            className="flex items-center gap-2 text-black/60 hover:text-black transition-colors mb-4 font-fira text-sm"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </motion.button>
        )}
        <h1 className="font-voga text-2xl sm:text-3xl lg:text-4xl text-black mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="font-fira text-sm sm:text-base text-black/60 max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}