'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  Archive,
  LinkIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  Filter,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NotificationsView() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Error al cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
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

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
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

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  // Obtener ícono y color según tipo
  const getIconAndColor = useCallback((type) => {
    const iconProps = { size: 20, strokeWidth: 2 };

    switch (type) {
      case 'link_expired':
      case 'link_expiring_soon':
        return {
          icon: <Calendar {...iconProps} />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-300',
        };
      case 'gallery_archived':
        return {
          icon: <Archive {...iconProps} />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
        };
      case 'gallery_deleted':
        return {
          icon: <Trash2 {...iconProps} />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-300',
        };
      case 'link_deactivated':
        return {
          icon: <LinkIcon {...iconProps} />,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-300',
        };
      case 'gallery_view':
        return {
          icon: <Info {...iconProps} />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300',
        };
      case 'favorites_selected':
        return {
          icon: <CheckCircle {...iconProps} />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
        };
      case 'warning':
        return {
          icon: <AlertTriangle {...iconProps} />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-300',
        };
      default:
        return {
          icon: <Bell {...iconProps} />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
        };
    }
  }, []);

  // Formatear fecha
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    }
    if (diffInMinutes < 2880) return 'Ayer';

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header con filtros y acciones */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Filtros */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-fira text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-[#79502A] text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-fira text-sm font-medium transition-all flex items-center gap-2 ${
              filter === 'unread'
                ? 'bg-[#79502A] text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            No leídas
            {unreadCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                filter === 'unread' ? 'bg-white text-[#79502A]' : 'bg-[#79502A] text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Marcar todas como leídas */}
        {unreadCount > 0 && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white border border-[#79502A] text-[#79502A] hover:bg-[#79502A] hover:text-white rounded-lg font-fira text-sm font-semibold transition-all flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Marcar todas como leídas
          </motion.button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="font-fira text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de notificaciones */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#79502A]" />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell size={32} className="text-gray-400" />
          </div>
          <h3 className="font-voga text-xl text-gray-900 mb-2">
            {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
          </h3>
          <p className="font-fira text-sm text-gray-600 text-center max-w-md">
            {filter === 'unread'
              ? 'Todas tus notificaciones están al día'
              : 'Cuando haya novedades con tus galerías, te avisaremos aquí'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => {
              const { icon, bgColor, textColor, borderColor } = getIconAndColor(notification.type);

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white border-2 rounded-xl p-4 sm:p-5 transition-all hover:shadow-lg ${
                    notification.is_read ? 'border-gray-200' : `${borderColor} bg-blue-50/30`
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Ícono */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 ${textColor}`}
                    >
                      {icon}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-fira text-sm sm:text-base leading-relaxed mb-2 ${
                          notification.is_read ? 'text-gray-700' : 'text-gray-900 font-medium'
                        }`}
                      >
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
                            if (!notification.is_read) {
                              markAsRead(notification.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 mt-3 text-sm font-fira font-semibold text-[#79502A] hover:text-[#8B5A2F] transition-colors"
                        >
                          Ver detalles
                          <span>→</span>
                        </a>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Marcar como leída"
                          aria-label="Marcar como leída"
                        >
                          <Check size={18} className="text-gray-600 group-hover:text-[#79502A]" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Eliminar"
                        aria-label="Eliminar notificación"
                      >
                        <Trash2 size={18} className="text-gray-600 group-hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
