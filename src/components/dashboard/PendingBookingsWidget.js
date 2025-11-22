'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { confirmPublicBooking, rejectPublicBooking } from '@/app/actions/public-booking-actions';
import { useToast } from '@/components/ui/Toast';

export default function PendingBookingsWidget({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { showToast } = useToast();

  const handleConfirm = async (booking) => {
    setProcessingId(booking.id);
    const result = await confirmPublicBooking(booking.id);

    if (result.success) {
      showToast({ message: 'Reserva confirmada exitosamente', type: 'success' });
      setBookings(bookings.filter(b => b.id !== booking.id));
    } else {
      showToast({ message: result.error, type: 'error' });
    }
    setProcessingId(null);
  };

  const handleRejectClick = (booking) => {
    setRejectingBooking(booking);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingBooking || !rejectReason.trim()) {
      showToast({ message: 'Por favor ingresa un motivo de rechazo', type: 'error' });
      return;
    }

    setProcessingId(rejectingBooking.id);
    const result = await rejectPublicBooking(rejectingBooking.id, rejectReason);

    if (result.success) {
      showToast({ message: 'Reserva rechazada', type: 'success' });
      setBookings(bookings.filter(b => b.id !== rejectingBooking.id));
      setShowRejectModal(false);
      setRejectingBooking(null);
      setRejectReason('');
    } else {
      showToast({ message: result.error, type: 'error' });
    }
    setProcessingId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-UY', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="font-voga text-lg text-gray-900">Reservas Pendientes</h3>
            <p className="font-fira text-sm text-gray-500">Sin reservas por aprobar</p>
          </div>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="font-fira text-sm text-gray-500">
            No hay reservas pendientes de aprobación
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="text-[#8B5E3C]" size={24} />
            </div>
            <div>
              <h3 className="font-voga text-lg text-gray-900">Reservas Pendientes</h3>
              <p className="font-fira text-sm text-gray-500">
                {bookings.length} {bookings.length === 1 ? 'reserva' : 'reservas'} por aprobar
              </p>
            </div>
          </div>
          {bookings.length > 0 && (
            <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full font-fira text-sm font-bold">
              {bookings.length}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {bookings.slice(0, 5).map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#8B5E3C]/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-gray-400 flex-shrink-0" />
                    <p className="font-fira text-sm font-semibold text-gray-900 truncate">
                      {booking.client_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="font-fira">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-400" />
                      <span className="font-fira">{booking.start_time.substring(0, 5)}</span>
                    </div>
                  </div>
                  <p className="font-fira text-xs text-gray-500 mt-1">
                    {booking.booking_type?.name || 'Reunión'}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleConfirm(booking)}
                    disabled={processingId === booking.id}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-fira text-xs font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {processingId === booking.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <CheckCircle size={12} />
                    )}
                  </button>
                  <button
                    onClick={() => handleRejectClick(booking)}
                    disabled={processingId === booking.id}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-fira text-xs font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <XCircle size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {bookings.length > 5 && (
          <div className="mt-4 text-center">
            <a
              href="/dashboard/agenda"
              className="font-fira text-sm text-[#8B5E3C] hover:text-[#6d4a2f] font-semibold transition-colors duration-200"
            >
              Ver todas las reservas →
            </a>
          </div>
        )}
      </motion.div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-voga text-lg text-gray-900">Rechazar Reserva</h3>
                <p className="font-fira text-sm text-gray-600">
                  {rejectingBooking?.client_name}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-fira text-sm font-medium text-gray-900 mb-2">
                Motivo del rechazo *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: No hay disponibilidad en esa fecha"
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg font-fira text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingBooking(null);
                  setRejectReason('');
                }}
                disabled={processingId}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-fira text-sm font-semibold transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={processingId || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-fira text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  'Rechazar Reserva'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
