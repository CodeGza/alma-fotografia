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
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NotificationSettings() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    email_on_gallery_view: false,
    email_on_favorites: false,
    email_on_link_expiring: true,
    email_on_link_expired: true,
    email_on_new_gallery: false,
    inapp_enabled: true,
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
          email_on_gallery_view: data.email_on_gallery_view,
          email_on_favorites: data.email_on_favorites,
          email_on_link_expiring: data.email_on_link_expiring,
          email_on_link_expired: data.email_on_link_expired,
          email_on_new_gallery: data.email_on_new_gallery,
          inapp_enabled: data.inapp_enabled,
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

      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', user.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Preferencias guardadas correctamente',
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setMessage({
        type: 'error',
        text: 'Error al guardar las preferencias',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#79502A]" />
      </div>
    );
  }

  const emailNotifications = [
    {
      key: 'email_on_gallery_view',
      icon: Eye,
      title: 'Cuando un cliente vea una galería',
      description: 'Recibirás un email cada vez que alguien abra un enlace compartido',
    },
    {
      key: 'email_on_favorites',
      icon: Heart,
      title: 'Cuando un cliente seleccione favoritos',
      description: 'Te avisaremos cuando un cliente finalice su selección de fotos favoritas',
    },
    {
      key: 'email_on_link_expiring',
      icon: Calendar,
      title: 'Cuando un enlace esté por vencer',
      description: 'Te recordaremos 7 días antes de que expire un enlace compartido',
    },
    {
      key: 'email_on_link_expired',
      icon: LinkIcon,
      title: 'Cuando un enlace expire',
      description: 'Te avisaremos cuando un enlace compartido haya vencido y se desactive',
    },
    {
      key: 'email_on_new_gallery',
      icon: ImagePlus,
      title: 'Cuando crees una nueva galería',
      description: 'Confirmación cada vez que subas una nueva galería',
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

      {/* Notificaciones por Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#79502A]/10 rounded-lg">
            <Mail size={20} className="text-[#79502A]" />
          </div>
          <div>
            <h3 className="font-voga text-lg sm:text-xl text-black mb-1">
              Notificaciones por Email
            </h3>
            <p className="font-fira text-sm text-gray-600">
              Recibe actualizaciones importantes directamente en tu correo electrónico
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {emailNotifications.map((item) => {
            const IconComponent = item.icon;
            return (
              <label
                key={item.key}
                className="flex items-start gap-3 sm:gap-4 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  onChange={() => handleChange(item.key)}
                  className="mt-1 w-5 h-5 text-[#79502A] border-gray-300 rounded focus:ring-[#79502A] cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent
                      size={16}
                      className="text-[#79502A] flex-shrink-0"
                    />
                    <span className="font-fira text-sm sm:text-base font-medium text-black">
                      {item.title}
                    </span>
                  </div>
                  <p className="font-fira text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </motion.div>

      {/* Notificaciones en la Plataforma */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg">
            <Bell size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-voga text-lg sm:text-xl text-black mb-1">
              Notificaciones en la Plataforma
            </h3>
            <p className="font-fira text-sm text-gray-600">
              Recibe notificaciones directamente en el dashboard cuando estés conectado
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={preferences.inapp_enabled}
            onChange={() => handleChange('inapp_enabled')}
            className="mt-1 w-5 h-5 text-[#79502A] border-gray-300 rounded focus:ring-[#79502A] cursor-pointer"
          />
          <div>
            <span className="font-fira text-sm sm:text-base font-medium text-black block mb-1">
              Habilitar notificaciones en la plataforma
            </span>
            <p className="font-fira text-xs sm:text-sm text-gray-600 leading-relaxed">
              Verás todas las actualizaciones en tiempo real en el ícono de campana
            </p>
          </div>
        </label>
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
          className="px-6 py-3 bg-[#79502A] hover:bg-[#8B5A2F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-fira text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Guardar cambios</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
