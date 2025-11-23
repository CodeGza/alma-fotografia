'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/actions/auth-actions';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Estados del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para las animaciones de luz recorriendo el borde
  const [usernameGlow, setUsernameGlow] = useState(false);
  const [passwordGlow, setPasswordGlow] = useState(false);

  // Estados para mantener el estado de focus
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Función para activar la animación de luz del username
  const handleUsernameFocus = () => {
    setUsernameFocused(true);
    setUsernameGlow(true);
    // Remover la animación después de que termine (1 segundo)
    setTimeout(() => setUsernameGlow(false), 1000);
  };

  // Función para activar la animación de luz del password
  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    setPasswordGlow(true);
    // Remover la animación después de que termine (1 segundo)
    setTimeout(() => setPasswordGlow(false), 1000);
  };

  // Función para manejar el inicio de sesión
  async function handleLogin(e) {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setLoading(true); // Activar estado de carga
    setErrorMsg(''); // Limpiar mensajes de error previos

    // Intentar iniciar sesión usando la función server action
    const result = await loginUser({
      usernameOrEmail: username,
      password: password,
    });

    setLoading(false); // Desactivar estado de carga

    if (!result.success) {
      // Si hay error, mostrar mensaje con animación
      setErrorMsg(result.error || 'Credenciales incorrectas.');
    } else {
      // Si todo está bien, redirigir al dashboard
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#79502A]/20 flex items-center justify-center p-4">
      {/* Formulario de login con animación de entrada */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-[#FFF8E2] p-8 rounded-3xl border-2 border-[#C6A97D]/30 shadow-2xl animate-in fade-in duration-500"
      >
        {/* Título del formulario */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#000000] mb-2">
            Bienvenida
          </h1>
          <p className="text-[#79502A] text-sm">Ingresá a tu panel de administración</p>
        </div>

        <div className="space-y-5">
          {/* Campo de usuario con animación de luz recorriendo el borde */}
          <div className="relative">
            <label className="text-sm text-[#79502A] font-medium block mb-2">
              Usuario
            </label>
            <div className="relative">
              {/* Ícono de usuario - SIEMPRE VISIBLE */}
              <Mail
                size={20}
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-20 ${
                  usernameFocused ? 'text-[#79502A]' : 'text-[#C6A97D]'
                }`}
              />

              {/* Contenedor del input con efecto de luz */}
              <div className="relative">
                {/* Input principal */}
                <input
                  type="text"
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-[#000000] placeholder:text-[#C6A97D]/50 focus:outline-none transition-all duration-300 ease-in-out relative z-10 ${usernameFocused ? 'border-[#79502A]' : 'border-[#C6A97D]/30 hover:border-[#C6A97D]/50'}`}
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={handleUsernameFocus}
                  onBlur={() => setUsernameFocused(false)}
                  required
                />


                {/* Brillo suave constante mientras está en focus */}
                {usernameFocused && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none -z-10">
                    <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(121,80,42,0.4)]"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Campo de contraseña con animación de luz recorriendo el borde */}
          <div className="relative">
            <label className="text-sm text-[#79502A] font-medium block mb-2">
              Contraseña
            </label>
            <div className="relative">
              {/* Ícono de candado - SIEMPRE VISIBLE */}
              <Lock 
                size={20} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-20 ${
                  passwordFocused ? 'text-[#79502A]' : 'text-[#C6A97D]'
                }`}
              />
              
              {/* Contenedor del input con efecto de luz */}
              <div className="relative">
                {/* Input principal */}
                <input
                  type="password"
                  className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl text-[#000000] placeholder:text-[#C6A97D]/50 focus:outline-none transition-all duration-300 ease-in-out relative z-10
                    ${passwordFocused 
                      ? 'border-[#79502A]' 
                      : 'border-[#C6A97D]/30 hover:border-[#C6A97D]/50'
                    }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={() => setPasswordFocused(false)}
                  required
                />
                
                
                {/* Brillo suave constante mientras está en focus */}
                {passwordFocused && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none -z-10">
                    <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(121,80,42,0.4)]"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mensaje de error con animación */}
          {errorMsg && (
            <div className="animate-in slide-in-from-top duration-300">
              <p className="text-red-600 text-sm text-center bg-red-50 py-3 px-4 rounded-lg border border-red-200">
                {errorMsg}
              </p>
            </div>
          )}
          
          {/* Botón de submit SIMPLIFICADO - sin efectos especiales */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#79502A] hover:bg-[#5a3c1f] text-white rounded-xl py-3.5 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </div>
      </form>

    </main>
  );
}