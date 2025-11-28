'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  User,
  Bell,
  Palette,
  Shield,
  Database,
  ChevronRight,
  Video
} from 'lucide-react';

export default function ConfigMenu() {
  const router = useRouter();

  const menuItems = [
    {
      icon: Briefcase,
      title: 'Tipos de Servicio',
      description: 'Gestiona y edita los servicios que ofreces (bodas, sesiones, eventos, etc.)',
      href: '/dashboard/configuracion/servicios',
      color: 'text-[#79502A]',
      bg: 'bg-[#79502A]/10',
      disabled: false
    },
    {
      icon: Video,
      title: 'Videos Landing',
      description: 'Sube y gestiona los videos que se muestran en la página principal',
      href: '/dashboard/configuracion/landing',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      disabled: false
    },
    {
      icon: User,
      title: 'Perfil',
      description: 'Actualiza tu información personal, datos de contacto y preferencias de cuenta',
      href: '/dashboard/configuracion/perfil',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      disabled: true
    },
    {
      icon: Bell,
      title: 'Notificaciones',
      description: 'Configura cómo y cuándo recibir notificaciones por email sobre tu actividad',
      href: '/dashboard/configuracion/notificaciones',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      disabled: true
    },
    {
      icon: Palette,
      title: 'Apariencia',
      description: 'Personaliza colores, logos, fuentes y el estilo visual de tu marca',
      href: '/dashboard/configuracion/apariencia',
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      disabled: true
    },
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Cambia tu contraseña, gestiona sesiones activas y configura autenticación',
      href: '/dashboard/configuracion/seguridad',
      color: 'text-red-600',
      bg: 'bg-red-50',
      disabled: true
    },
    {
      icon: Database,
      title: 'Almacenamiento',
      description: 'Revisa el uso de tu espacio en Cloudinary y gestiona archivos almacenados',
      href: '/dashboard/configuracion/almacenamiento',
      color: 'text-green-600',
      bg: 'bg-green-50',
      disabled: true
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: item.disabled ? 1 : 1.02, y: item.disabled ? 0 : -4 }}
              whileTap={{ scale: item.disabled ? 1 : 0.98 }}
              onClick={() => !item.disabled && router.push(item.href)}
              disabled={item.disabled}
              className={`relative flex items-start gap-4 lg:gap-5 p-5 sm:p-6 lg:p-8 bg-white border-2 rounded-xl transition-all text-left group ${item.disabled ? 'border-gray-200 opacity-60 cursor-not-allowed' : 'border-gray-200 hover:border-[#79502A] hover:shadow-xl cursor-pointer'}`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-xl ${item.bg} flex items-center justify-center transition-all duration-300 ${!item.disabled && 'group-hover:scale-110 group-hover:shadow-md'}`}>
                <IconComponent 
                  size={24} 
                  className={`${item.color} lg:w-8 lg:h-8`} 
                  strokeWidth={2} 
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-fira text-base lg:text-lg font-semibold text-black mb-2 group-hover:text-[#79502A] transition-colors">
                  {item.title}
                </h3>
                <p className="font-fira text-sm lg:text-base text-black/60 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Arrow */}
              {!item.disabled && (
                <div className="absolute top-1/2 right-6 -translate-y-1/2 hidden sm:block">
                  <ChevronRight
                    size={24}
                    className="text-black/20 group-hover:text-[#79502A] group-hover:translate-x-1 transition-all duration-300"
                    strokeWidth={2}
                  />
                </div>
              )}

              {/* Badge */}
              {item.disabled && (
                <div className="absolute top-4 lg:top-6 right-4 lg:right-6">
                  <span className="px-2.5 py-1 bg-gray-100 text-black/40 rounded-md text-xs lg:text-sm font-fira font-medium">
                    Próximamente
                  </span>
                </div>
              )}

              {/* Gradient overlay */}
              {!item.disabled && (
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#79502A]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}