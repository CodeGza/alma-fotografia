import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

/**
 * Página de enlace inválido o inactivo
 * 
 * Se muestra cuando:
 * - El token no existe
 * - El token está inactivo
 * - El token expiró
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {/* Ícono */}
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-beige/30 border-2 border-black/10">
            <AlertCircle size={64} className="text-black/40" strokeWidth={1} />
          </div>
        </div>

        {/* Título */}
        <h1 className="font-voga text-4xl text-black mb-4">
          Enlace no disponible
        </h1>

        {/* Descripción */}
        <p className="font-fira text-black/60 mb-8 leading-relaxed">
          Este enlace ha sido desactivado, ha expirado o no es válido.
          <br />
          <br />
          Si crees que esto es un error, contacta con la persona que te compartió el enlace.
        </p>

        {/* Información adicional */}
        <div className="bg-beige/20 rounded-lg p-4 border border-black/10 mb-8">
          <p className="font-fira text-sm text-black/70">
            Los enlaces compartidos pueden ser desactivados en cualquier momento por motivos de seguridad o privacidad.
          </p>
        </div>

        {/* Botón volver */}
        <Link href="/">
          <button className="px-6 py-3 bg-brown hover:bg-brown/90 text-white rounded-lg transition-colors font-fira text-sm font-medium">
            Volver al inicio
          </button>
        </Link>
      </div>
    </div>
  );
}