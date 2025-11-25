'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfToday,
} from 'date-fns';
import { es } from 'date-fns/locale';

import {
  getPublicBookingTypes,
  getAvailableSlots,
  createPublicBooking,
} from '@/app/actions/public-booking-actions';

/**
 * BookingForm - Formulario público para agendar reuniones
 *
 * Este componente se usará en la landing page para que los clientes
 * puedan agendar reuniones/sesiones con horarios independientes por tipo.
 *
 * Uso:
 * <BookingForm />
 */
export default function BookingForm() {
  const [step, setStep] = useState(1); // 1: tipo, 2: fecha, 3: hora, 4: datos, 5: confirmación
  const [bookingTypes, setBookingTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });

  // Cargar tipos de reserva al montar
  useEffect(() => {
    loadBookingTypes();
  }, []);

  const loadBookingTypes = async () => {
    setLoading(true);
    const result = await getPublicBookingTypes();
    if (result.success) {
      setBookingTypes(result.bookingTypes);
    }
    setLoading(false);
  };

  // Cargar slots cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate && selectedType) {
      loadSlots();
    }
  }, [selectedDate, selectedType]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const result = await getAvailableSlots(selectedType.id, dateStr);

    if (result.success) {
      setAvailableSlots(result.slots);
    } else {
      setError(result.error);
    }

    setLoadingSlots(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    // No permitir seleccionar fechas pasadas
    if (isBefore(date, startOfToday())) {
      return;
    }

    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(3);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleFormComplete = () => {
    // Validar que los campos estén completos
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      setError('Por favor completá todos los campos requeridos');
      return;
    }
    setError(null);
    setStep(5);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createPublicBooking({
      bookingTypeId: selectedType.id,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      bookingDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedSlot.start,
      notes: formData.notes,
    });

    if (result.success) {
      setSuccess(true);
      // Reset after 5 seconds
      setTimeout(() => {
        resetForm();
      }, 5000);
    } else {
      setError(result.error);
    }

    setSubmitting(false);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      notes: '',
    });
    setSuccess(false);
    setError(null);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener el día de la semana del primer día (0=Domingo, 6=Sábado)
  const startDayOfWeek = monthStart.getDay();

  // Crear array con celdas vacías al inicio
  const calendarDays = [
    ...Array(startDayOfWeek).fill(null), // Celdas vacías
    ...daysInMonth, // Días del mes
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={40} className="animate-spin text-[#79502A]" />
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="font-voga text-2xl text-gray-900 mb-2">¡Solicitud Enviada!</h2>
        <p className="font-fira text-gray-600 mb-6">
          Tu solicitud de {selectedType.name} para el{' '}
          {format(selectedDate, "d 'de' MMMM", { locale: es })} a las {selectedSlot.start} ha sido
          enviada.
        </p>
        <p className="font-fira text-sm text-gray-500 mb-6">
          Recibirás un correo de confirmación pronto. Te contactaremos para confirmar tu reserva.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-2 bg-[#79502A] hover:bg-[#8B5A2F] !text-white rounded-lg font-fira text-sm font-medium transition-colors"
        >
          Agendar Otra Reunión
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
      {/* Header con progreso */}
      <div className="mb-8">
        <h2 className="font-voga text-2xl md:text-3xl text-gray-900 mb-4">Agenda tu Reunión</h2>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-fira">
          <button
            onClick={() => setStep(1)}
            className={`${
              step === 1 ? 'text-[#79502A] font-semibold' : 'text-gray-900 hover:text-[#79502A]'
            }`}
          >
            Tipo
          </button>
          <span className="text-gray-900">→</span>
          <button
            onClick={() => selectedType && setStep(2)}
            disabled={!selectedType}
            className={`${
              step === 2 ? 'text-[#79502A] font-semibold' : 'text-gray-900 hover:text-[#79502A]'
            } disabled:opacity-40`}
          >
            Fecha
          </button>
          <span className="text-gray-900">→</span>
          <button
            onClick={() => selectedDate && setStep(3)}
            disabled={!selectedDate}
            className={`${
              step === 3 ? 'text-[#79502A] font-semibold' : 'text-gray-900 hover:text-[#79502A]'
            } disabled:opacity-40`}
          >
            Horario
          </button>
          <span className="text-gray-900">→</span>
          <button
            onClick={() => selectedSlot && setStep(4)}
            disabled={!selectedSlot}
            className={`${
              step === 4 ? 'text-[#79502A] font-semibold' : 'text-gray-900 hover:text-[#79502A]'
            } disabled:opacity-40`}
          >
            Datos
          </button>
          <span className="text-gray-900">→</span>
          <button
            onClick={() => formData.clientName && formData.clientEmail && formData.clientPhone && setStep(5)}
            disabled={!formData.clientName || !formData.clientEmail || !formData.clientPhone}
            className={`${
              step === 5 ? 'text-[#79502A] font-semibold' : 'text-gray-900 hover:text-[#79502A]'
            } disabled:opacity-40`}
          >
            Confirmar
          </button>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
        >
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="font-fira text-sm text-red-800">{error}</p>
        </motion.div>
      )}

      {/* PASO 1: Seleccionar tipo */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="font-fira font-semibold text-lg text-gray-900 mb-4">
            ¿Qué tipo de servicio necesitás?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookingTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#79502A] hover:bg-[#79502A]/5 transition-all text-left group"
              >
                <h4 className="font-voga text-xl text-gray-900 mb-2 group-hover:text-[#79502A] transition-colors">
                  {type.name}
                </h4>
                <p className="font-fira text-sm text-gray-900 mb-2">{type.description}</p>
                <div className="flex items-center gap-2 text-sm font-fira text-gray-900">
                  <Clock size={16} />
                  <span>{type.duration_minutes} minutos</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* PASO 2: Seleccionar fecha */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="font-fira font-semibold text-lg text-gray-900 mb-4">
            Seleccioná una fecha
          </h3>

          {/* Calendario */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-fira font-medium text-gray-900">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div
                  key={i}
                  className="text-center font-fira text-xs font-semibold text-gray-900 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                // Si es celda vacía, renderizar un div vacío
                if (!day) {
                  return <div key={`empty-${index}`} />;
                }

                const isPast = isBefore(day, startOfToday());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateSelect(day)}
                    disabled={isPast}
                    className={`
                      p-3 rounded-lg border-2 transition-all font-fira text-sm
                      ${
                        isSelected
                          ? 'border-[#79502A] bg-[#79502A] text-white'
                          : 'border-gray-200 hover:border-[#79502A] hover:bg-[#79502A]/5 text-gray-900'
                      }
                      ${isCurrentDay && !isSelected ? 'bg-blue-50 border-blue-200' : ''}
                      ${isPast ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* PASO 3: Seleccionar horario */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="font-fira font-semibold text-lg text-gray-900 mb-2">
            Seleccioná un horario
          </h3>
          <p className="font-fira text-sm text-gray-900 mb-4">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </p>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#79502A]" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="font-fira text-gray-900">
                No hay horarios disponibles para esta fecha.
              </p>
              <button
                onClick={() => setStep(2)}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-fira text-sm font-medium transition-colors"
              >
                Elegir Otra Fecha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => handleSlotSelect(slot)}
                  className={`
                    p-3 rounded-lg border-2 transition-all font-fira text-sm
                    ${
                      selectedSlot?.start === slot.start
                        ? 'border-[#79502A] bg-[#79502A] text-white'
                        : 'border-gray-200 hover:border-[#79502A] hover:bg-[#79502A]/5 text-gray-900'
                    }
                  `}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* PASO 4: Formulario de datos */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="font-fira font-semibold text-lg text-gray-900 mb-4">
            Completá tus datos
          </h3>

          <form onSubmit={(e) => { e.preventDefault(); handleFormComplete(); }} className="space-y-4">
            <div>
              <label className="block font-fira text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg font-fira text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#79502A]/20 focus:border-[#79502A]"
                  placeholder="Ej: María González"
                />
              </div>
            </div>

            <div>
              <label className="block font-fira text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg font-fira text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#79502A]/20 focus:border-[#79502A]"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-fira text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg font-fira text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#79502A]/20 focus:border-[#79502A]"
                  placeholder="+598 99 123 456"
                />
              </div>
            </div>

            <div>
              <label className="block font-fira text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg font-fira text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#79502A]/20 focus:border-[#79502A]"
                  placeholder="Cualquier detalle adicional que quieras compartir..."
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-[#79502A]/5 border border-[#79502A]/20 rounded-lg p-4 mt-6">
              <h4 className="font-fira font-semibold text-sm text-gray-900 mb-2">
                Resumen de tu reserva
              </h4>
              <div className="space-y-1 font-fira text-sm text-gray-700">
                <p>
                  <strong>Servicio:</strong> {selectedType.name}
                </p>
                <p>
                  <strong>Fecha:</strong>{' '}
                  {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                <p>
                  <strong>Horario:</strong> {selectedSlot.start} - {selectedSlot.end}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-fira text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#79502A] hover:bg-[#8B5A2F] !text-white rounded-lg font-fira text-sm font-medium transition-colors"
              >
                Continuar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* PASO 5: Confirmación */}
      {step === 5 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="font-fira font-semibold text-lg text-gray-900 mb-2">
            Confirmá tu reserva
          </h3>
          <p className="font-fira text-sm text-gray-600 mb-6">
            Por favor verificá que todos los datos sean correctos antes de enviar tu solicitud.
          </p>

          {/* Resumen completo */}
          <div className="bg-gradient-to-br from-[#79502A]/5 to-[#79502A]/10 border border-[#79502A]/30 rounded-xl p-6 mb-6">
            <h4 className="font-voga text-xl text-gray-900 mb-4">Resumen de tu reserva</h4>

            <div className="space-y-4">
              {/* Servicio */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-[#79502A]" />
                </div>
                <div className="flex-1">
                  <p className="font-fira text-xs text-gray-600 uppercase tracking-wide mb-1">
                    Servicio
                  </p>
                  <p className="font-fira font-semibold text-gray-900">{selectedType.name}</p>
                  <p className="font-fira text-sm text-gray-600">{selectedType.description}</p>
                </div>
              </div>

              {/* Fecha y horario */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-[#79502A]" />
                </div>
                <div className="flex-1">
                  <p className="font-fira text-xs text-gray-600 uppercase tracking-wide mb-1">
                    Fecha y horario
                  </p>
                  <p className="font-fira font-semibold text-gray-900">
                    {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  <p className="font-fira text-sm text-gray-600">
                    {selectedSlot.start} - {selectedSlot.end} ({selectedType.duration_minutes} minutos)
                  </p>
                </div>
              </div>

              {/* Tus datos */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-[#79502A]" />
                </div>
                <div className="flex-1">
                  <p className="font-fira text-xs text-gray-600 uppercase tracking-wide mb-1">
                    Tus datos
                  </p>
                  <p className="font-fira font-semibold text-gray-900">{formData.clientName}</p>
                  <p className="font-fira text-sm text-gray-600">{formData.clientEmail}</p>
                  <p className="font-fira text-sm text-gray-600">{formData.clientPhone}</p>
                </div>
              </div>

              {/* Notas si existen */}
              {formData.notes && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={20} className="text-[#79502A]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-fira text-xs text-gray-600 uppercase tracking-wide mb-1">
                      Notas adicionales
                    </p>
                    <p className="font-fira text-sm text-gray-900">{formData.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-fira text-sm text-blue-900">
              <strong>¿Qué sigue?</strong> Al confirmar, tu solicitud será enviada y recibirás un email
              de confirmación. Nos pondremos en contacto contigo pronto para confirmar tu reserva.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-fira text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Editar Datos
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-[#79502A] hover:bg-[#8B5A2F] disabled:bg-gray-400 !text-white rounded-lg font-fira text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirmar Reserva
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
