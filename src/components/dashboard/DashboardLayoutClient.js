'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Archive
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

/**
 * DashboardLayoutClient - Layout interactivo del dashboard
 * 
 * Client Component que maneja toda la interactividad del layout:
 * - Estado del sidebar mobile (open/close)
 * - Detección de ruta activa para highlighting
 * - Animaciones de hover y transiciones
 * - Logout del usuario
 * 
 * Diseño minimalista editorial:
 * - Fondo sidebar: beige (#FFF8E2)
 * - Fondo contenido: blanco (#FFFFFF)
 * - Bordes: negro fino (#000000)
 * - Acentos: dorado (#C6A97D) y marrón (#79502A)
 * 
 * Responsive:
 * - Desktop: Sidebar fijo 280px, contenido con offset
 * - Mobile: Sidebar overlay con animación suave, header sticky con hamburguesa
 * 
 * Performance:
 * - useState solo para sidebar (mínimo estado)
 * - usePathname para detección de ruta activa (built-in de Next)
 * - AnimatePresence para animaciones de entrada/salida
 * - Sin re-renders innecesarios
 * 
 * Props:
 * @param {React.ReactNode} children - Contenido de las páginas hijas
 * @param {string} userName - Nombre del usuario autenticado (desde layout.jsx)
 */
export default function DashboardLayoutClient({ children, userName }) {
  /**
   * Estado del sidebar mobile
   * 
   * Solo se usa en mobile para controlar si el sidebar
   * está visible (overlay) o oculto.
   * 
   * En desktop, el sidebar siempre está visible (fijo).
   */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Hook de Next.js para obtener la ruta actual
   * 
   * Usado para determinar qué item del menú está activo
   * y aplicar estilos de highlight correspondientes.
   */
  const pathname = usePathname();

  /**
   * Configuración de items de navegación
   * 
   * Array de objetos con la información de cada sección:
   * - label: Texto visible en el menú
   * - href: Ruta de navegación
   * - icon: Componente de icono de lucide-react
   * 
   * Orden: Define el orden visual en el sidebar
   */
  const navItems = [
    {
      label: 'Inicio',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Galerías',
      href: '/dashboard/galerias',
      icon: ImageIcon,
    },
    {
      label: 'Testimonios',
      href: '/dashboard/testimonios',
      icon: MessageSquare,
    },
    {
      label: 'Configuración',
      href: '/dashboard/configuracion',
      icon: Settings,
    },
  ];

  /**
   * Maneja el cierre de sesión del usuario
   * 
   * Flujo:
   * 1. Llama a supabase.auth.signOut() para invalidar la sesión
   * 2. Redirige a /auth/login con window.location
   * 3. Next.js limpia las cookies automáticamente
   * 
   * Usamos window.location (no router.push) porque:
   * - Garantiza limpieza completa del estado
   * - Evita problemas con cache del router
   * - Es más seguro para logout
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* 
        ========================================
        SIDEBAR DESKTOP
        ======================================== 
        Solo visible en desktop (lg:flex, hidden en mobile)
        
        Características:
        - Ancho fijo: 280px
        - Posición: fixed (no scrollea con el contenido)
        - Fondo: beige (#FFF8E2) para diferenciarlo del contenido
        - Borde derecho: negro fino para separación visual
        
        Estructura:
        1. Logo + texto branding
        2. Navegación principal
        3. Footer con usuario y logout
      */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:fixed lg:inset-y-0 border-r border-black/20 bg-[#FFF8E2]">
        {/* 
          Logo + Texto Branding
          
          Layout:
          - Flex column para apilar logo y texto
          - Centrado horizontal y vertical
          - Gap de 8px entre logo y texto
          
          Imagen:
          - PNG transparente (sin fondo)
          - Altura: 64px (h-16)
          - Width: auto (mantiene aspect ratio)
          
          Texto:
          - Fuente: Voga (elegante, serif)
          - Tamaño: xl (20px)
          - Color: negro
          - Tracking: wide (espaciado entre letras)
        */}
        <div className="p-8 border-b border-black/10 flex flex-col items-center justify-center gap-3">
          <Link href="/dashboard" className="flex flex-col items-center gap-2">
            <img
              src="/img/logos/Logo_SF.png"
              alt="Alma Fotografía Logo"
              className="w-auto h-22 object-contain"
            />
          </Link>
        </div>

        {/* 
          Navegación principal
          
          Diseño de items:
          - Hover animado con línea lateral que crece desde arriba
          - Fondo que se expande desde la izquierda
          - Icono que escala levemente (110%)
          - Transiciones suaves (300ms)
          
          Item activo:
          - Línea dorada izquierda (#C6A97D)
          - Fondo blanco semi-transparente
          - Texto marrón (#79502A)
          - Icono dorado (#C6A97D)
          
          Item normal:
          - Sin línea ni fondo
          - Texto gris (#000000 70%)
          - Icono gris (#000000 60%)
          
          Lógica de detección de activo:
          - Coincidencia exacta: pathname === href
          - Coincidencia de subruta: pathname.startsWith(href)
          - Excepto para /dashboard (exacto)
        */}
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            /**
             * Determina si el item está activo
             * 
             * Casos:
             * 1. /dashboard → Solo activo si es exactamente /dashboard
             * 2. /dashboard/galerias → Activo en /dashboard/galerias/*
             * 3. /dashboard/testimonios → Activo en /dashboard/testimonios/*
             */
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative flex items-center gap-3 px-4 py-3
                  overflow-hidden transition-all duration-300
                  ${isActive
                    ? 'text-[#79502A]'
                    : 'text-black/70 hover:text-black'
                  }
                `}
              >
                {/* 
                  Línea lateral animada
                  
                  Animación:
                  - Crece desde arriba (transformOrigin: top)
                  - Usa scale-y para crecer verticalmente
                  - Transición de 300ms
                  
                  Estados:
                  - Activo: scale-y-100 (visible completo)
                  - Hover: scale-y-0 → scale-y-100 (crece en hover)
                  - Normal: scale-y-0 (invisible)
                */}
                <div
                  className={`
                    absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300
                    ${isActive
                      ? 'bg-[#C6A97D] scale-y-100'
                      : 'bg-[#C6A97D] scale-y-0 group-hover:scale-y-100'
                    }
                  `}
                  style={{ transformOrigin: 'top' }}
                />

                {/* 
                  Fondo animado
                  
                  Animación:
                  - Se expande desde la izquierda (transformOrigin: left)
                  - Usa scale-x para expandir horizontalmente
                  - Blanco semi-transparente para suavidad
                  
                  Estados:
                  - Activo: 60% opacidad, escala completa
                  - Hover: 40% opacidad, escala de 0 a 100%
                  - Normal: invisible (scale-x-0)
                */}
                <div
                  className={`
                    absolute inset-0 transition-all duration-300
                    ${isActive
                      ? 'bg-white/60 scale-x-100'
                      : 'bg-white/40 scale-x-0 group-hover:scale-x-100'
                    }
                  `}
                  style={{ transformOrigin: 'left' }}
                />

                {/* 
                  Contenido del item (icono + texto)
                  
                  z-10: Asegura que esté sobre los fondos animados
                  
                  Icono:
                  - Cambia color según estado (dorado si activo, marrón en hover)
                  - Escala a 110% en hover para énfasis
                  
                  Texto:
                  - Fira Sans Medium para legibilidad
                  - Tamaño pequeño (14px)
                  - Color heredado del contenedor padre
                */}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon
                    size={20}
                    className={`
                      transition-all duration-300
                      ${isActive
                        ? 'text-[#C6A97D]'
                        : 'text-black/60 group-hover:text-[#79502A] group-hover:scale-110'
                      }
                    `}
                    strokeWidth={1.5}
                  />
                  <span className="font-fira font-medium text-sm">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 
          Footer del sidebar
          
          Contiene:
          1. Información del usuario (nombre)
          2. Botón de cerrar sesión
          
          Borde superior para separación visual del contenido.
        */}
        <div className="p-6 border-t border-black/10 space-y-3">
          {/* 
            Info del usuario
            
            Layout:
            - Label "Usuario" en uppercase con tracking amplio
            - Nombre del usuario en texto normal
            - Color gris claro para el label (40% negro)
            - Color negro para el nombre
          */}
          <div className="px-4 py-2">
            <p className="font-fira text-xs uppercase tracking-wider text-black/40 mb-1">
              Usuario
            </p>
            <p className="font-fira font-medium text-sm text-black">
              {userName}
            </p>
          </div>

          {/* 
            Botón de cerrar sesión
            
            Diseño:
            - Fondo marrón (#79502A)
            - Texto SIEMPRE blanco (!important para forzar)
            - Hover: fondo más oscuro (#5a3c1f)
            - Transición suave de colores (200ms)
            
            IMPORTANTE: Usamos !text-white para evitar que
            otros estilos (como hover de grupo) cambien el color.
            El ! en Tailwind es equivalente a !important en CSS.
          */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-none bg-[#79502A] hover:bg-[#5a3c1f] transition-colors duration-200"
          >
            <LogOut size={20} strokeWidth={1.5} className="!text-white" />
            <span className="font-fira font-medium text-sm !text-white">
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      {/* 
        ========================================
        SIDEBAR MOBILE (Overlay con animación)
        ======================================== 
        AnimatePresence permite animaciones de entrada/salida
        
        Solo visible cuando sidebarOpen = true
        
        Estructura:
        1. Backdrop oscuro con blur (fade in/out)
        2. Panel lateral que desliza desde la izquierda
        
        Comportamiento:
        - Click en backdrop → cierra el sidebar
        - Click en item de navegación → cierra el sidebar
        - Click en botón X → cierra el sidebar
        
        Animaciones:
        - Backdrop: fade (opacity 0 → 1)
        - Panel: slide desde la izquierda (translateX -100% → 0)
        - Duración: 300ms con ease-out suave
      */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* 
              Backdrop animado
              
              Características:
              - Cubre toda la pantalla (fixed inset-0)
              - Fondo negro semi-transparente (20%)
              - Blur del contenido detrás (backdrop-blur-sm)
              - z-index 40 (debajo del panel lateral)
              - Click cierra el sidebar
              
              Animación Framer Motion:
              - initial: { opacity: 0 } → Invisible al inicio
              - animate: { opacity: 1 } → Fade in
              - exit: { opacity: 0 } → Fade out al cerrar
              - transition: { duration: 0.2 } → 200ms suave
            */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* 
              Panel lateral mobile animado
              
              Misma estructura que el sidebar desktop
              pero con algunas diferencias:
              - Botón X en el header para cerrar
              - Logo más pequeño
              - Click en items cierra el sidebar automáticamente
              
              Animación Framer Motion:
              - initial: { x: '-100%' } → Fuera de la pantalla (izquierda)
              - animate: { x: 0 } → Desliza hacia adentro
              - exit: { x: '-100%' } → Desliza hacia afuera al cerrar
              - transition: { duration: 0.3, ease: 'easeOut' }
              
              El ease-out hace que la animación sea rápida al inicio
              y se desacelere suavemente al final, dando sensación
              de calidad premium.
            */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1] // Ease personalizado (easeOutExpo)
              }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#FFF8E2] border-r border-black/20 z-50 lg:hidden flex flex-col"
            >
              {/* 
                Header con logo y botón cerrar
                
                Layout flex para distribuir logo (izquierda) y botón X (derecha)
              */}
              <div className="p-6 border-b border-black/10 flex items-center justify-between">
                <div className="flex flex-col items-center gap-1">
                  <img
                    src="/img/logos/Logo_SF.png"
                    alt="Alma Fotografía Logo"
                    className="w-auto h-16 object-contain"
                  />
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-none transition-colors"
                >
                  <X size={20} className="text-black" strokeWidth={1.5} />
                </button>
              </div>

              {/* Navegación (misma lógica que desktop) */}
              <nav className="flex-1 p-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group relative flex items-center gap-3 px-4 py-3
                        overflow-hidden transition-all duration-300
                        ${isActive
                          ? 'text-[#79502A]'
                          : 'text-black/70 hover:text-black'
                        }
                      `}
                    >
                      <div
                        className={`
                          absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300
                          ${isActive
                            ? 'bg-[#C6A97D] scale-y-100'
                            : 'bg-[#C6A97D] scale-y-0 group-hover:scale-y-100'
                          }
                        `}
                        style={{ transformOrigin: 'top' }}
                      />

                      <div
                        className={`
                          absolute inset-0 transition-all duration-300
                          ${isActive
                            ? 'bg-white/60 scale-x-100'
                            : 'bg-white/40 scale-x-0 group-hover:scale-x-100'
                          }
                        `}
                        style={{ transformOrigin: 'left' }}
                      />

                      <div className="relative z-10 flex items-center gap-3">
                        <Icon
                          size={20}
                          className={`
                            transition-all duration-300
                            ${isActive
                              ? 'text-[#C6A97D]'
                              : 'text-black/60 group-hover:text-[#79502A] group-hover:scale-110'
                            }
                          `}
                          strokeWidth={1.5}
                        />
                        <span className="font-fira font-medium text-sm">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer mobile */}
              <div className="p-6 border-t border-black/10 space-y-3">
                <div className="px-4 py-2">
                  <p className="font-fira text-xs uppercase tracking-wider text-black/40 mb-1">
                    Usuario
                  </p>
                  <p className="font-fira font-medium text-sm text-black">
                    {userName}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none bg-[#79502A] hover:bg-[#5a3c1f] transition-colors duration-200"
                >
                  <LogOut size={20} strokeWidth={1.5} className="!text-white" />
                  <span className="font-fira font-medium text-sm !text-white">
                    Cerrar sesión
                  </span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 
        ========================================
        ÁREA DE CONTENIDO PRINCIPAL
        ======================================== 
        Contiene el contenido de todas las páginas hijas
        
        Desktop:
        - Offset izquierdo de 280px (ml-[280px])
        - Compensa el espacio del sidebar fijo
        
        Mobile:
        - Sin offset (sidebar es overlay)
        - Header sticky con logo y hamburguesa
      */}
      <main className="flex-1 lg:ml-[280px] bg-white">
        {/* 
          Header superior (solo mobile)
          
          Características:
          - Solo visible en mobile (lg:hidden)
          - Sticky para mantenerse visible al scrollear
          - z-index 30 (sobre el contenido, bajo el sidebar)
          - Fondo beige para coherencia visual
          
          Contiene:
          - Logo pequeño + texto branding
          - Botón hamburguesa para abrir sidebar
        */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#FFF8E2] border-b border-black/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/img/logos/Logo_SF.png"
                alt="Alma Fotografía Logo"
                className="w-auto h-12 object-contain"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/50 rounded-none transition-colors"
            >
              <Menu size={24} className="text-black" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* 
          Contenedor del contenido
          
          Padding responsivo:
          - Mobile: 24px (p-6)
          - Desktop: 48px (p-12)
          
          Max-width: 1400px para legibilidad óptima
          - Previene líneas de texto demasiado largas
          - Centrado horizontalmente (mx-auto)
          
          {children} renderiza el contenido de cada página
        */}
        <div className="p-6 lg:p-12 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}