'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, AlertTriangle, Info, LinkIcon, Archive, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

/**
 * NotificationBell - Campana de notificaciones en tiempo real
 * 
 * Features:
 * - Suscripción en tiempo real (Supabase Realtime)
 * - Panel responsive (mobile bottom sheet / desktop dropdown)
 * - Contador de no leídas
 * - Marcar como leída / Eliminar
 * - Íconos por tipo de notificación
 * 
 * Props:
 * @param {string} className - Clases adicionales
 * @param {boolean} isMobile - Si es versión mobile (cambia posición del panel)
 */
export default function NotificationBell({ className = '', isMobile = false }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Suscripción en tiempo real + polling
  useEffect(() => {
    loadNotifications();

    // Polling cada 10 segundos como backup
    const pollingInterval = setInterval(() => {
      loadNotifications();
    }, 10000);

    // Realtime subscription
    const channel = supabase
      .channel('notifications-realtime-bell')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('📬 Notificación recibida en tiempo real:', payload);
          loadNotifications();
        }
      )
      .subscribe((status) => {
        console.log('🔔 Estado de suscripción:', status);
      });

    return () => {
      clearInterval(pollingInterval);
      supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Decrementar contador si era no leída
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Obtener ícono según tipo
  const getIcon = useCallback((type) => {
    const iconProps = { size: 16 };
    
    switch (type) {
      case 'link_expired':
      case 'link_expiring_soon':
        return <Calendar {...iconProps} className="text-amber-600" />;
      case 'gallery_archived':
        return <Archive {...iconProps} className="text-gray-600" />;
      case 'gallery_deleted':
        return <Trash2 {...iconProps} className="text-red-600" />;
      case 'link_deactivated':
        return <LinkIcon {...iconProps} className="text-orange-600" />;
      case 'info':
        return <Info {...iconProps} className="text-blue-600" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-amber-600" />;
      default:
        return <Bell {...iconProps} className="text-gray-600" />;
    }
  }, []);

  // Formatear fecha relativa
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 2880) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Botón campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={isMobile ? 22 : 20} className={isMobile ? "text-white" : "text-white/80"} />
        
        {/* Badge contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
          />

          {/* Modal centrado - IGUAL en Desktop y Mobile */}
          <div
            className="fixed z-[9999] flex flex-col bg-white shadow-2xl border border-gray-200 rounded-2xl
              inset-4 sm:inset-6 md:inset-x-auto md:inset-y-6
              md:left-1/2 md:-translate-x-1/2
              md:w-full md:max-w-lg md:h-[90vh]
              animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="font-fira text-sm font-semibold text-black">
                Notificaciones
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-2 py-1 text-xs font-fira font-semibold text-[#79502A] hover:bg-[#79502A]/10 rounded-lg transition-colors"
                  >
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#79502A]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell size={32} className="text-gray-300 mb-3" />
                  <p className="font-fira text-sm text-gray-500 text-center">
                    No tienes notificaciones
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícono */}
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.type)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <p className="font-fira text-sm text-gray-900 leading-snug mb-1">
                            {notification.message}
                          </p>
                          <p className="font-fira text-xs text-gray-500">
                            {formatDate(notification.created_at)}
                          </p>
                          
                          {/* Link de acción */}
                          {notification.action_url && (
                            <a
                              href={notification.action_url}
                              onClick={() => {
                                markAsRead(notification.id);
                                setIsOpen(false);
                              }}
                              className="inline-block mt-2 text-xs font-fira font-semibold text-[#79502A] hover:text-[#8B5A2F] transition-colors"
                            >
                              Ver detalles →
                            </a>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Marcar como leída"
                              aria-label="Marcar como leída"
                            >
                              <Check size={14} className="text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Eliminar"
                            aria-label="Eliminar notificación"
                          >
                            <X size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}