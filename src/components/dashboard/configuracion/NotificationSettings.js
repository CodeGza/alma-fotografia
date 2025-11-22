'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Bell,
  Eye,
  Heart,
  Calendar,
  LinkIcon,
  ImagePlus,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Archive,
  Trash2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NotificationSettings() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    notification_email: '',
    // Email notifications
    email_on_gallery_view: false,
    email_on_favorites: false,
    email_on_testimonial: true,
    email_on_booking_pending: true,
    email_on_booking_confirmed: true,
    email_on_booking_reminder: true,
    email_on_link_expiring: true,
    email_on_link_expired: true,
    email_on_new_gallery: false,
    email_on_link_deactivated: false,
    email_on_gallery_archived: false,
    email_on_gallery_restored: false,
    email_on_gallery_deleted: true,
    // In-app notifications
    inapp_on_gallery_view: true,
    inapp_on_favorites: true,
    inapp_on_testimonial: true,
    inapp_on_booking_pending: true,
    inapp_on_booking_confirmed: true,
    inapp_on_booking_reminder: true,
    inapp_on_link_expiring: true,
    inapp_on_link_expired: true,
    inapp_on_new_gallery: true,
    inapp_on_link_deactivated: true,
    inapp_on_gallery_archived: true,
    inapp_on_gallery_restored: true,
    inapp_on_gallery_deleted: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Cargar preferencias
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          notification_email: data.notification_email || '',
          // Email notifications
          email_on_gallery_view: data.email_on_gallery_view ?? false,
          email_on_favorites: data.email_on_favorites ?? false,
          email_on_testimonial: data.email_on_testimonial ?? true,
          email_on_booking_pending: data.email_on_booking_pending ?? true,
          email_on_booking_confirmed: data.email_on_booking_confirmed ?? true,
          email_on_booking_reminder: data.email_on_booking_reminder ?? true,
          email_on_link_expiring: data.email_on_link_expiring ?? true,
          email_on_link_expired: data.email_on_link_expired ?? true,
          email_on_new_gallery: data.email_on_new_gallery ?? false,
          email_on_link_deactivated: data.email_on_link_deactivated ?? false,
          email_on_gallery_archived: data.email_on_gallery_archived ?? false,
          email_on_gallery_restored: data.email_on_gallery_restored ?? false,
          email_on_gallery_deleted: data.email_on_gallery_deleted ?? true,
          // In-app notifications
          inapp_on_gallery_view: data.inapp_on_gallery_view ?? true,
          inapp_on_favorites: data.inapp_on_favorites ?? true,
          inapp_on_testimonial: data.inapp_on_testimonial ?? true,
          inapp_on_booking_pending: data.inapp_on_booking_pending ?? true,
          inapp_on_booking_confirmed: data.inapp_on_booking_confirmed ?? true,
          inapp_on_booking_reminder: data.inapp_on_booking_reminder ?? true,
          inapp_on_link_expiring: data.inapp_on_link_expiring ?? true,
          inapp_on_link_expired: data.inapp_on_link_expired ?? true,
          inapp_on_new_gallery: data.inapp_on_new_gallery ?? true,
          inapp_on_link_deactivated: data.inapp_on_link_deactivated ?? true,
          inapp_on_gallery_archived: data.inapp_on_gallery_archived ?? true,
          inapp_on_gallery_restored: data.inapp_on_gallery_restored ?? true,
          inapp_on_gallery_deleted: data.inapp_on_gallery_deleted ?? true,
        });
      } else {
        // Crear preferencias por defecto
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            ...preferences,
          });

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setMessage({
        type: 'error',
        text: 'Error al cargar las preferencias',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Preparar datos para actualizar (solo los campos que existen en la tabla)
      const updateData = {
        notification_email: preferences.notification_email,
        // Email notifications
        email_on_gallery_view: preferences.email_on_gallery_view,
        email_on_favorites: preferences.email_on_favorites,
        email_on_testimonial: preferences.email_on_testimonial,
        email_on_booking_pending: preferences.email_on_booking_pending,
        email_on_booking_confirmed: preferences.email_on_booking_confirmed,
        email_on_booking_reminder: preferences.email_on_booking_reminder,
        email_on_link_expiring: preferences.email_on_link_expiring,
        email_on_link_expired: preferences.email_on_link_expired,
        email_on_new_gallery: preferences.email_on_new_gallery,
        email_on_link_deactivated: preferences.email_on_link_deactivated,
        email_on_gallery_archived: preferences.email_on_gallery_archived,
        email_on_gallery_restored: preferences.email_on_gallery_restored,
        email_on_gallery_deleted: preferences.email_on_gallery_deleted,
        // In-app notifications
        inapp_on_gallery_view: preferences.inapp_on_gallery_view,
        inapp_on_favorites: preferences.inapp_on_favorites,
        inapp_on_testimonial: preferences.inapp_on_testimonial,
        inapp_on_booking_pending: preferences.inapp_on_booking_pending,
        inapp_on_booking_confirmed: preferences.inapp_on_booking_confirmed,
        inapp_on_booking_reminder: preferences.inapp_on_booking_reminder,
        inapp_on_link_expiring: preferences.inapp_on_link_expiring,
        inapp_on_link_expired: preferences.inapp_on_link_expired,
        inapp_on_new_gallery: preferences.inapp_on_new_gallery,
        inapp_on_link_deactivated: preferences.inapp_on_link_deactivated,
        inapp_on_gallery_archived: preferences.inapp_on_gallery_archived,
        inapp_on_gallery_restored: preferences.inapp_on_gallery_restored,
        inapp_on_gallery_deleted: preferences.inapp_on_gallery_deleted,
      };

      const { error } = await supabase
        .from('notification_preferences')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('[NotificationSettings] Error de Supabase:', error);
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Preferencias guardadas correctamente',
      });

      // Volver atrás después de 1 segundo
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err) {
      console.error('❌ Error saving preferences:', err);
      console.error('❌ Error completo:', JSON.stringify(err, null, 2));
      setMessage({
        type: 'error',
        text: `Error al guardar: ${err.message || JSON.stringify(err)}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value !== undefined ? value : !prev[field],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5E3C]" />
      </div>
    );
  }

  const notificationTypes = [
    {
      emailKey: 'email_on_new_gallery',
      inappKey: 'inapp_on_new_gallery',
      icon: ImagePlus,
      title: 'Cuando crees una nueva galería',
      description: 'Confirmación cada vez que subas una nueva galería',
    },
    {
      emailKey: 'email_on_gallery_view',
      inappKey: 'inapp_on_gallery_view',
      icon: Eye,
      title: 'Cuando un cliente vea una galería',
      description: 'Notificación cada vez que alguien abra un enlace compartido',
    },
    {
      emailKey: 'email_on_favorites',
      inappKey: 'inapp_on_favorites',
      icon: Heart,
      title: 'Cuando un cliente seleccione o edite favoritos',
      description: 'Te avisaremos cuando un cliente envíe o modifique su selección de fotos favoritas',
    },
    {
      emailKey: 'email_on_testimonial',
      inappKey: 'inapp_on_testimonial',
      icon: MessageSquare,
      title: 'Cuando un cliente deje un testimonio',
      description: 'Te notificaremos cuando un cliente envíe un testimonio sobre una galería',
    },
    {
      emailKey: 'email_on_booking_pending',
      inappKey: 'inapp_on_booking_pending',
      icon: Calendar,
      title: 'Cuando recibas una nueva reserva pendiente',
      description: 'Te avisaremos cuando un cliente haga una reserva que requiera aprobación',
    },
    {
      emailKey: 'email_on_booking_confirmed',
      inappKey: 'inapp_on_booking_confirmed',
      icon: Calendar,
      title: 'Cuando confirmes una reserva',
      description: 'Confirmación cada vez que apruebes una reserva de un cliente',
    },
    {
      emailKey: 'email_on_booking_reminder',
      inappKey: 'inapp_on_booking_reminder',
      icon: Calendar,
      title: 'Recordatorio de reservas próximas',
      description: 'Te recordaremos 24 horas antes de cada reunión confirmada',
    },
    {
      emailKey: 'email_on_link_expiring',
      inappKey: 'inapp_on_link_expiring',
      icon: Calendar,
      title: 'Cuando un enlace esté por vencer',
      description: 'Te recordaremos 7 días antes de que expire un enlace compartido',
    },
    {
      emailKey: 'email_on_link_expired',
      inappKey: 'inapp_on_link_expired',
      icon: LinkIcon,
      title: 'Cuando un enlace expire',
      description: 'Te avisaremos cuando un enlace compartido haya vencido y se desactive automáticamente',
    },
    {
      emailKey: 'email_on_link_deactivated',
      inappKey: 'inapp_on_link_deactivated',
      icon: XCircle,
      title: 'Cuando desactives un enlace manualmente',
      description: 'Te confirmaremos cuando desactives un enlace compartido',
    },
    {
      emailKey: 'email_on_gallery_archived',
      inappKey: 'inapp_on_gallery_archived',
      icon: Archive,
      title: 'Cuando archives una galería',
      description: 'Te avisaremos cuando una galería sea archivada',
    },
    {
      emailKey: 'email_on_gallery_restored',
      inappKey: 'inapp_on_gallery_restored',
      icon: Archive,
      title: 'Cuando restaures una galería archivada',
      description: 'Te confirmaremos cuando vuelvas a activar una galería archivada',
    },
    {
      emailKey: 'email_on_gallery_deleted',
      inappKey: 'inapp_on_gallery_deleted',
      icon: Trash2,
      title: 'Cuando elimines una galería',
      description: 'Te confirmaremos cuando elimines permanentemente una galería',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Mensaje de éxito/error */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-300 text-green-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <p className="font-fira text-sm font-medium">{message.text}</p>
        </motion.div>
      )}

      {/* Campo de email para notificaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gray-100 rounded-lg">
            <Mail size={20} className="text-[#8B5E3C]" />
          </div>
          <div className="flex-1">
            <h3 className="font-voga text-lg sm:text-xl text-gray-900 mb-1">
              Email para notificaciones
            </h3>
            <p className="font-fira text-sm text-gray-600">
              Configura el email donde recibirás las notificaciones
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <input
            type="email"
            value={preferences.notification_email}
            onChange={(e) => handleChange('notification_email', e.target.value)}
            placeholder="tu-email@ejemplo.com"
            className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg font-fira text-sm text-gray-900
              focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all
              hover:border-gray-300"
          />
          <p className="font-fira text-xs text-gray-600 leading-relaxed">
            Configura qué notificaciones quieres recibir por email y cuáles en la plataforma
          </p>
        </div>
      </motion.div>

      {/* Configuración de notificaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gray-100 rounded-lg">
            <Bell size={20} className="text-[#8B5E3C]" />
          </div>
          <div>
            <h3 className="font-voga text-lg sm:text-xl text-gray-900 mb-1">
              Tipos de notificaciones
            </h3>
            <p className="font-fira text-sm text-gray-600">
              Elige cómo quieres recibir cada tipo de notificación
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {notificationTypes.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.emailKey}
                className="p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  <IconComponent
                    size={18}
                    className="text-[#8B5E3C] flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-fira text-sm font-semibold text-gray-900 mb-1 leading-tight">
                      {item.title}
                    </h4>
                    <p className="font-fira text-xs text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 ml-9">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences[item.emailKey]}
                      onChange={() => handleChange(item.emailKey)}
                      className="w-4 h-4 text-[#8B5E3C] border-gray-300 rounded focus:ring-[#8B5E3C] cursor-pointer"
                    />
                    <span className="font-fira text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors flex items-center gap-1.5">
                      <Mail size={14} className="text-[#8B5E3C]" />
                      Email
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences[item.inappKey]}
                      onChange={() => handleChange(item.inappKey)}
                      className="w-4 h-4 text-[#8B5E3C] border-gray-300 rounded focus:ring-[#8B5E3C] cursor-pointer"
                    />
                    <span className="font-fira text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors flex items-center gap-1.5">
                      <Bell size={14} className="text-[#8B5E3C]" />
                      In-app
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Botón Guardar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end pt-4"
      >
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          whileHover={{ scale: isSaving ? 1 : 1.02 }}
          whileTap={{ scale: isSaving ? 1 : 0.98 }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-fira text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
              <span className="hidden sm:inline">Guardando...</span>
              <span className="sm:hidden">Guardando...</span>
            </>
          ) : (
            <>
              <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Guardar cambios</span>
              <span className="sm:hidden">Guardar</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
