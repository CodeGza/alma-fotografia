'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Music,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  UserPlus,
  Users
} from 'lucide-react';
import { updateProfile, updateEmail } from '@/app/actions/profile-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfileEditor({ initialProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [emailChangeMode, setEmailChangeMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateProfile(profile);

      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al actualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateEmail(newEmail);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setEmailChangeMode(false);
        setNewEmail('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al actualizar email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar email' });
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = profile?.permissions?.manage_users;

  // DEBUG: Mostrar en consola para verificar permisos
  console.log('👤 ProfileEditor - Profile:', profile);
  console.log('🔑 ProfileEditor - Permissions:', profile?.permissions);
  console.log('✅ ProfileEditor - isAdmin:', isAdmin);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Botones de gestión de usuarios - Solo visible para admins */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <Link
            href="/dashboard/configuracion/usuarios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B5E3C] text-white rounded-lg
              font-fira text-sm font-semibold hover:bg-[#6d4a2f] transition-all duration-200
              shadow-sm hover:shadow-md"
          >
            <Users size={18} />
            <span>Administrar usuarios</span>
          </Link>

          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg
              font-fira text-sm font-semibold hover:bg-gray-100 transition-all duration-200"
        >
          <UserPlus size={18} />
          <span>Crear nuevo usuario</span>
        </Link>
        </motion.div>
      )}

      {/* Mensaje de feedback */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            ) : (
              <XCircle size={20} className="text-red-600 flex-shrink-0" />
            )}
            <p className={`font-fira text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        </motion.div>
      )}

      {/* Información Personal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#8B5E3C]/10 rounded-lg">
            <User size={24} className="text-[#8B5E3C]" />
          </div>
          <div>
            <h2 className="font-voga text-xl text-gray-900">Información Personal</h2>
            <p className="font-fira text-sm text-gray-500">
              Actualiza tu información de contacto
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Nombre completo */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Nombre completo
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                  font-fira text-sm text-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+598 99 123 456"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                  font-fira text-sm text-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Biografía */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Biografía
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti y tu trabajo..."
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                  font-fira text-sm text-gray-900 transition-all resize-none"
              />
            </div>
          </div>

          {/* Botón guardar */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#8B5E3C] text-white rounded-lg
                font-fira text-sm font-semibold
                hover:bg-[#6d4a2f] disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
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
            </button>
          </div>
        </form>
      </motion.div>

      {/* Redes Sociales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#8B5E3C]/10 rounded-lg">
            <Instagram size={24} className="text-[#8B5E3C]" />
          </div>
          <div>
            <h2 className="font-voga text-xl text-gray-900">Redes Sociales</h2>
            <p className="font-fira text-sm text-gray-500">
              Enlaces a tus perfiles sociales
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Instagram */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Instagram
            </label>
            <div className="relative">
              <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@almafotografiauy"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                  font-fira text-sm text-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Facebook */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Facebook
            </label>
            <div className="relative">
              <Facebook size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={profile.facebook}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                placeholder="Alma Fotografía"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                  font-fira text-sm text-gray-900 transition-all"
              />
            </div>
          </div>

          {/* TikTok */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              TikTok
            </label>
            <div className="relative">
              <Music size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={profile.tiktok}
                onChange={(e) => handleInputChange('tiktok', e.target.value)}
                placeholder="@almafotografiauy"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                  font-fira text-sm text-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Botón guardar */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#8B5E3C] text-white rounded-lg
                font-fira text-sm font-semibold
                hover:bg-[#6d4a2f] disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
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
            </button>
          </div>
        </form>
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#8B5E3C]/10 rounded-lg">
            <Mail size={24} className="text-[#8B5E3C]" />
          </div>
          <div>
            <h2 className="font-voga text-xl text-gray-900">Email</h2>
            <p className="font-fira text-sm text-gray-500">
              Administra tu correo electrónico
            </p>
          </div>
        </div>

        {!emailChangeMode ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="font-fira text-xs text-gray-500 mb-1">Email actual</p>
              <p className="font-fira text-sm font-semibold text-gray-900">{profile.email}</p>
            </div>

            <button
              onClick={() => setEmailChangeMode(true)}
              className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg
                font-fira text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Cambiar email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-fira text-xs text-amber-800">
                Se enviará un correo de confirmación a la nueva dirección antes de completar el cambio.
              </p>
            </div>

            <div>
              <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
                Nuevo email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nuevo@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                    focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                    font-fira text-sm text-gray-900 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading || !newEmail}
                className="px-6 py-2.5 bg-[#8B5E3C] text-white rounded-lg
                  font-fira text-sm font-semibold
                  hover:bg-[#6d4a2f] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Cambiar email</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailChangeMode(false);
                  setNewEmail('');
                }}
                className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg
                  font-fira text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
