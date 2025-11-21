'use client';

import BookingForm from '@/components/public/BookingForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AgendaProvisoria() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-voga text-3xl text-gray-900 mb-1">Alma Fotografía</h1>
              <p className="font-fira text-sm text-gray-600">Agenda tu reunión con nosotros</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-fira text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Información */}
        <div className="mb-8 text-center">
          <h2 className="font-voga text-2xl md:text-3xl text-gray-900 mb-3">
            ¿Querés conocernos?
          </h2>
          <p className="font-fira text-gray-900 max-w-2xl mx-auto">
            Seleccioná el tipo de reunión que preferís, elegí tu fecha y horario favorito,
            y dejanos tus datos. Te confirmaremos tu reunión a la brevedad.
          </p>
        </div>

        {/* Formulario de reserva */}
        <BookingForm />

        {/* Información adicional */}
        <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-fira font-semibold text-gray-900 mb-3">Información importante:</h3>
          <ul className="space-y-2 font-fira text-sm text-gray-900">
            <li className="flex items-start gap-2">
              <span className="text-[#79502A] font-bold">•</span>
              <span>Tu reunión quedará como <strong>pendiente de confirmación</strong> hasta que la confirmemos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#79502A] font-bold">•</span>
              <span>Recibirás un correo electrónico con la confirmación o cambio de horario si fuera necesario.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#79502A] font-bold">•</span>
              <span>Si tenés alguna consulta, no dudes en contactarnos por WhatsApp o email.</span>
            </li>
          </ul>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="font-fira text-sm text-gray-900">
            Página provisoria de agenda • Pronto estará integrada en la landing
          </p>
        </div>
      </div>
    </div>
  );
}
