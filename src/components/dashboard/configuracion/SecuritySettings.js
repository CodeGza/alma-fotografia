'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function SecuritySettings() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Validaciones de contraseña en tiempo real
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'newPassword') {
      setPasswordValidation({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }
  };

  async function handleChangePassword(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    // Validar contraseña segura
    if (!Object.values(passwordValidation).every(v => v)) {
      setMessage({ type: 'error', text: 'La contraseña no cumple con todos los requisitos de seguridad' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setMessage({ type: 'error', text: result.error || 'Error al cambiar la contraseña' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordValidation({ length: false, uppercase: false, lowercase: false, number: false });
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
      setLoading(false);
    }
  }

  const isPasswordValid = Object.values(passwordValidation).every(v => v);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Mensaje de feedback */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            )}
            <p className={`font-fira text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        </motion.div>
      )}

      {/* Cambiar contraseña */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
            <Lock size={20} className="text-[#8B5E3C]" />
          </div>
          <div>
            <h2 className="font-fira text-lg font-bold text-gray-900">
              Cambiar Contraseña
            </h2>
            <p className="font-fira text-sm text-gray-600">
              Actualiza tu contraseña periódicamente para mayor seguridad
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Contraseña actual */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Contraseña actual
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              required
            />
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              required
            />

            {/* Validaciones */}
            {formData.newPassword && (
              <div className="mt-3 space-y-1.5 bg-gray-50 rounded-lg p-3">
                <ValidationItem valid={passwordValidation.length} text="Al menos 8 caracteres" />
                <ValidationItem valid={passwordValidation.uppercase} text="Una mayúscula" />
                <ValidationItem valid={passwordValidation.lowercase} text="Una minúscula" />
                <ValidationItem valid={passwordValidation.number} text="Un número" />
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full px-6 py-2.5 bg-[#8B5E3C] text-white rounded-lg font-fira text-sm font-semibold hover:bg-[#6d4a2f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Cambiando contraseña...</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Cambiar contraseña</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Información de seguridad */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
            <Shield size={20} className="text-[#8B5E3C]" />
          </div>
          <div>
            <h2 className="font-fira text-lg font-bold text-gray-900">
              Configuración de Seguridad
            </h2>
            <p className="font-fira text-sm text-gray-600">
              Tu cuenta está protegida con las siguientes medidas
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <SecurityFeature
            icon={Clock}
            title="Cierre automático de sesión"
            description="Tu sesión se cerrará automáticamente después de 30 minutos de inactividad"
            enabled={true}
          />
          <SecurityFeature
            icon={Shield}
            title="Verificación en tiempo real"
            description="Si tu cuenta es deshabilitada, serás deslogueado inmediatamente"
            enabled={true}
          />
        </div>
      </motion.div>
    </div>
  );
}

function ValidationItem({ valid, text }) {
  return (
    <div className="flex items-center gap-2">
      {valid ? (
        <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
      )}
      <span className={`text-xs font-medium font-fira ${valid ? 'text-green-700' : 'text-gray-600'}`}>
        {text}
      </span>
    </div>
  );
}

function SecurityFeature({ icon: Icon, title, description, enabled }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        <Icon size={18} className={enabled ? 'text-green-600' : 'text-gray-400'} />
      </div>
      <div className="flex-1">
        <h3 className="font-fira text-sm font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="font-fira text-xs text-gray-600">
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">
        {enabled ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium font-fira">
            <CheckCircle size={12} />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium font-fira">
            Inactivo
          </span>
        )}
      </div>
    </div>
  );
}
