'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/auth-actions';
import { User, Lock, Mail, UserCircle, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();

  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Validaciones de contraseña en tiempo real
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validar contraseña en tiempo real
    if (field === 'password') {
      setPasswordValidation({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }
  };

  // Función para manejar el registro
  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar contraseña segura
    if (!passwordValidation.length || !passwordValidation.uppercase ||
        !passwordValidation.lowercase || !passwordValidation.number) {
      setErrorMsg('La contraseña no cumple con todos los requisitos de seguridad');
      setLoading(false);
      return;
    }

    // Intentar registrar
    const result = await registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name || 'Fernanda',
    });

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Error al registrar usuario');
    } else {
      setSuccessMsg('Usuario registrado correctamente. Redirigiendo...');
      setTimeout(() => {
        router.push('/dashboard/configuracion/perfil');
        router.refresh();
      }, 2000);
    }
  }

  const isPasswordValid = Object.values(passwordValidation).every(v => v);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#2D2D2D] border-b border-white/10 shadow-md">
        <div className="p-6 sm:p-8 lg:p-10">
          <Link
            href="/dashboard/configuracion/perfil"
            className="inline-flex items-center gap-2 text-[#B89968] hover:text-white transition-colors duration-200 mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            <span>Volver a Perfil</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 font-light tracking-tight">
            Crear Nuevo Usuario
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            Registra un nuevo usuario para acceder al dashboard (máximo 5 usuarios)
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="p-6 lg:p-12 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Nombre completo */}
            <div>
              <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <UserCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
                  placeholder="Fernanda"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
                  placeholder="fernanda"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
                  placeholder="fernanda@almafotografia.uy"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block font-fira text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              {/* Validaciones de contraseña */}
              {formData.password && (
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
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 font-fira text-sm text-gray-900 transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mensaje de error */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <p className="font-fira text-sm text-red-800">
                    {errorMsg}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Mensaje de éxito */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <p className="font-fira text-sm text-green-800">
                    {successMsg}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="flex-1 px-6 py-2.5 bg-[#8B5E3C] text-white rounded-lg font-fira text-sm font-semibold hover:bg-[#6d4a2f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creando usuario...</span>
                  </>
                ) : (
                  <>
                    <UserCircle size={18} />
                    <span>Crear usuario</span>
                  </>
                )}
              </button>

              <Link
                href="/dashboard/configuracion/perfil"
                className="px-6 py-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-fira text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// Componente para mostrar validaciones
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
