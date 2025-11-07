'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Images, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState } from 'react';

/**
 * DashboardSidebar - Navegación lateral del dashboard
 * 
 * Componente que muestra la barra lateral de navegación con:
 * - Logo y branding
 * - Enlaces a las diferentes secciones
 * - Indicador visual de ruta activa
 * - Botón de cerrar sesión
 * - Comportamiento responsivo (colapsable en mobile)
 */
const DashboardSidebar = memo(function DashboardSidebar({ onLogout }) {
  // Estado para controlar el sidebar en mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Hook para obtener la ruta actual y marcar el item activo
  const pathname = usePathname();

  // Configuración de los items de navegación
  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Inicio',
      description: 'Vista general',
    },
    {
      href: '/dashboard/galerias',
      icon: Images,
      label: 'Galerías',
      description: 'Gestionar colecciones',
    },
    {
      href: '/dashboard/testimonios',
      icon: MessageSquare,
      label: 'Testimonios',
      description: 'Opiniones de clientes',
    },
    {
      href: '/dashboard/configuracion',
      icon: Settings,
      label: 'Configuración',
      description: 'Ajustes del sistema',
    },
  ];

  // Variantes de animación para Framer Motion
  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <>
      {/* Botón hamburguesa para mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#FFF8E2] rounded-lg shadow-lg border border-[#C6A97D]/20"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X size={24} className="text-[#79502A]" />
        ) : (
          <Menu size={24} className="text-[#79502A]" />
        )}
      </button>

      {/* Overlay para mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar principal */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#FFF8E2] border-r border-[#C6A97D]/20 flex flex-col shadow-xl lg:shadow-none transform transition-transform duration-300 lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header del sidebar - Logo y branding */}
        <div className="p-6 border-b border-[#C6A97D]/20">
          <h1 className="font-voga text-3xl text-[#79502A] mb-1">
            Alma
          </h1>
          <p className="font-fira text-sm text-[#79502A]/60 font-light">
            Panel de administración
          </p>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.href}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out ${isActive ? 'bg-[#79502A] text-white shadow-md' : 'text-[#79502A] hover:bg-[#C6A97D]/10 hover:translate-x-1'}`}
                >
                  {/* Icono del item */}
                  <Icon size={22} className={`mt-0.5 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  
                  {/* Texto del item */}
                  <div className="flex-1">
                    <div className={`font-fira font-medium text-base ${isActive ? 'text-white' : 'text-[#79502A]'}`}>
                      {item.label}
                    </div>
                    <div className={`font-fira text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-[#79502A]/50'}`}>
                      {item.description}
                    </div>
                  </div>

                  {/* Indicador visual de item activo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-1 h-8 bg-white/30 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer del sidebar - Botón de cerrar sesión */}
        <div className="p-4 border-t border-[#C6A97D]/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#79502A] hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
          >
            <LogOut size={22} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-fira font-medium">Cerrar sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
});

export default DashboardSidebar;