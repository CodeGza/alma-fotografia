'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendTest = async () => {
    if (!email) {
      setResult({ success: false, message: 'Por favor ingresa un email' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: email }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.simulated
            ? 'Email simulado (RESEND_API_KEY no configurado)'
            : 'Email enviado exitosamente! Revisa tu bandeja de entrada',
          messageId: data.messageId,
        });
      } else {
        setResult({
          success: false,
          message: `Error: ${data.error}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error al enviar: ${error.message}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg">
            <Mail size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="font-voga text-2xl text-black mb-1">
              Probar envío de emails
            </h1>
            <p className="font-fira text-sm text-gray-600">
              Verifica que el sistema de emails esté funcionando correctamente
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="block font-fira text-sm font-medium text-black mb-2">
              Email de destino
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg font-fira text-sm text-black
                focus:outline-none focus:ring-2 focus:ring-[#C6A97D]/40 focus:border-[#79502A] transition-all
                hover:border-gray-300"
              disabled={isSending}
            />
            <p className="font-fira text-xs text-gray-500 mt-1">
              Ingresa el email donde quieres recibir el email de prueba
            </p>
          </div>

          <button
            onClick={handleSendTest}
            disabled={isSending || !email}
            className="w-full px-6 py-3 bg-[#79502A] hover:bg-[#8B5A2F] disabled:bg-gray-300
              disabled:cursor-not-allowed text-white rounded-lg font-fira text-sm font-semibold
              flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {isSending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Enviar email de prueba</span>
              </>
            )}
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
              result.success
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            {result.success ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-fira text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.message}
              </p>
              {result.messageId && (
                <p className="font-fira text-xs text-green-700 mt-1">
                  ID: {result.messageId}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Instrucciones */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <h3 className="font-fira text-sm font-semibold text-black">
            ℹ️ Qué esperar:
          </h3>
          <ul className="font-fira text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>
              <strong>Si funciona:</strong> Recibirás un email de confirmación en
              unos segundos (revisa spam si no lo ves)
            </li>
            <li>
              <strong>Si está simulado:</strong> La API key no está configurada,
              pero el sistema funciona
            </li>
            <li>
              <strong>Si falla:</strong> Revisa la consola del navegador y la
              terminal del servidor para ver los errores
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
