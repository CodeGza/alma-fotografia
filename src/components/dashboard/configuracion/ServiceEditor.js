'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { iconMap, defaultServiceTypes, generateSlug } from '@/lib/validations/gallery';
import Modal from '@/components/ui/Modal';
import { useModal } from '@/hooks/useModal';
import { useRouter } from 'next/navigation';

/**
 * Iconos disponibles para seleccionar
 */
const availableIcons = [
  { name: 'Heart', label: 'Corazón' },
  { name: 'Cake', label: 'Torta' },
  { name: 'Briefcase', label: 'Maletín' },
  { name: 'Users', label: 'Familia' },
  { name: 'User', label: 'Persona' },
  { name: 'Camera', label: 'Cámara' },
  { name: 'Baby', label: 'Bebé' },
  { name: 'Dog', label: 'Mascota' },
  { name: 'Sparkles', label: 'XV Años' },
  { name: 'GraduationCap', label: 'Graduación' },
  { name: 'Gift', label: 'Regalo' },
  { name: 'Palmtree', label: 'Playa' },
  { name: 'Mountain', label: 'Outdoor' },
  { name: 'Building', label: 'Inmueble' },
  { name: 'Utensils', label: 'Food' },
  { name: 'Zap', label: 'Especial' },
];

/**
 * ServiceEditor - Editor visual profesional de servicios
 */
export default function ServiceEditor() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: 'Camera', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { modalState, showModal, closeModal } = useModal();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;

      setServices(data || defaultServiceTypes);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices(defaultServiceTypes);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      icon: service.icon_name,
      description: service.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setShowCreateForm(false);
    setFormData({ name: '', icon: 'Camera', description: '' });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showModal({
        title: 'Nombre requerido',
        message: 'Debes ingresar un nombre para el servicio',
        type: 'warning'
      });
      return;
    }

    setSaving(true);
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      if (editingService) {
        // Editar existente
        const { error } = await supabase
          .from('service_types')
          .update({
            name: formData.name.trim(),
            icon_name: formData.icon,
            description: formData.description.trim() || null,
          })
          .eq('id', editingService.id);

        if (error) throw error;

        setServices(prev =>
          prev.map(s =>
            s.id === editingService.id
              ? {
                  ...s,
                  name: formData.name.trim(),
                  icon_name: formData.icon,
                  description: formData.description.trim() || null
                }
              : s
          )
        );

        showModal({
          title: 'Servicio actualizado',
          message: 'El servicio se actualizó correctamente',
          type: 'success'
        });
      } else {
        // Crear nuevo
        const slug = generateSlug(formData.name);

        const { data, error } = await supabase
          .from('service_types')
          .insert({
            name: formData.name.trim(),
            slug,
            icon_name: formData.icon,
            description: formData.description.trim() || null,
            is_default: false,
            created_by: user.id
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            showModal({
              title: 'Servicio duplicado',
              message: 'Ya existe un servicio con ese nombre',
              type: 'error'
            });
            return;
          }
          throw error;
        }

        setServices(prev => [...prev, data]);

        showModal({
          title: 'Servicio creado',
          message: 'El nuevo servicio se creó correctamente',
          type: 'success'
        });
      }

      setEditingService(null);
      setShowCreateForm(false);
      setFormData({ name: '', icon: 'Camera', description: '' });
    } catch (error) {
      console.error('Error saving service:', error);
      showModal({
        title: 'Error al guardar',
        message: 'Ocurrió un error al guardar el servicio',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    setDeleting(service.id);

    try {
      const supabase = await createClient();

      // ✅ Verificar si tiene galerías asociadas
      const { data: galleries, error: galleriesError } = await supabase
        .from('galleries')
        .select('id, title, slug')
        .eq('service_type', service.slug);

      if (galleriesError) {
        console.error('Error al verificar galerías:', galleriesError);
        throw galleriesError;
      }

      // ✅ Si tiene galerías, mostrar modal con opciones
      if (galleries && galleries.length > 0) {
        showModal({
          title: 'No se puede eliminar',
          message: `Este servicio está siendo usado por ${galleries.length} ${galleries.length === 1 ? 'galería' : 'galerías'}. Debes cambiar el tipo de servicio de ${galleries.length === 1 ? 'esta galería' : 'estas galerías'} antes de eliminarlo.`,
          type: 'warning',
          confirmText: 'Ver galerías',
          cancelText: 'Cancelar',
          onConfirm: () => {
            // Redirigir a la página de galerías
            router.push('/dashboard/galerias');
          }
        });
        setDeleting(null);
        return;
      }

      // ✅ Si no tiene galerías, pedir confirmación
      showModal({
        title: '¿Eliminar servicio?',
        message: `¿Estás seguro de eliminar "${service.name}"? Esta acción no se puede deshacer.`,
        type: 'warning',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: () => confirmDelete(service)
      });

    } catch (error) {
      console.error('Error al verificar servicio:', error);
      showModal({
        title: 'Error',
        message: 'Ocurrió un error al verificar el servicio',
        type: 'error'
      });
      setDeleting(null);
    }
  };

  const confirmDelete = async (service) => {
    setDeleting(service.id);

    try {
      const supabase = await createClient();

      console.log('Eliminando servicio:', service.id);

      const { error, data } = await supabase
        .from('service_types')
        .delete()
        .eq('id', service.id)
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      console.log('Servicio eliminado exitosamente:', data);

      // ✅ Actualizar estado local
      setServices(prev => prev.filter(s => s.id !== service.id));

      showModal({
        title: 'Servicio eliminado',
        message: 'El servicio se eliminó correctamente',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      showModal({
        title: 'Error al eliminar',
        message: `No se pudo eliminar el servicio: ${error.message}`,
        type: 'error'
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#79502A] animate-spin" />
      </div>
    );
  }

  const isEditing = editingService || showCreateForm;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Action button */}
      {!isEditing && (
        <div className="mb-4 sm:mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2.5 bg-[#79502A] !text-white rounded-lg font-fira text-sm font-semibold
              inline-flex items-center gap-2 hover:bg-[#8B5A2F] shadow-sm transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Crear servicio</span>
          </motion.button>
        </div>
      )}

      {/* Form de creación/edición */}
      <AnimatePresence mode="wait">
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 sm:mb-6 p-4 sm:p-5 bg-white border-2 border-[#79502A]/30 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h3 className="font-fira text-sm sm:text-base font-semibold text-[#79502A] flex items-center gap-2">
                {editingService ? (
                  <>
                    <Pencil size={16} />
                    Editar servicio
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Nuevo servicio
                  </>
                )}
              </h3>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-black/40 hover:text-black" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block font-fira text-xs sm:text-sm font-semibold text-black mb-1.5">
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Sesión de Mascotas"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-fira text-sm
                    focus:outline-none focus:border-[#79502A] focus:ring-2 focus:ring-[#79502A]/10
                    transition-all !text-black"
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block font-fira text-xs sm:text-sm font-semibold text-black mb-1.5">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Fotografía y video para tu día más especial"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-fira text-sm
                    focus:outline-none focus:border-[#79502A] focus:ring-2 focus:ring-[#79502A]/10
                    transition-all !text-black"
                  disabled={saving}
                  maxLength={150}
                />
                <p className="font-fira text-[10px] sm:text-xs text-black/50 mt-1">
                  Breve descripción que aparecerá en las cards
                </p>
              </div>

              {/* Selector de icono */}
              <div>
                <label className="block font-fira text-xs sm:text-sm font-semibold text-black mb-2">
                  Icono del servicio *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = iconMap[icon.name];
                    const isSelected = formData.icon === icon.name;

                    return (
                      <motion.button
                        key={icon.name}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData(prev => ({ ...prev, icon: icon.name }))}
                        className={`relative p-2.5 border-2 rounded-lg transition-all
                          ${isSelected
                            ? 'border-[#79502A] bg-[#79502A]/5'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        title={icon.label}
                      >
                        <IconComponent
                          size={20}
                          className={isSelected ? 'text-[#79502A]' : 'text-black/60'}
                          strokeWidth={1.8}
                        />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-[#79502A] rounded-full
                              flex items-center justify-center"
                          >
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-[#79502A] !text-white rounded-lg font-fira text-xs sm:text-sm font-semibold
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                    hover:bg-[#8B5A2F] shadow-sm transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span className="hidden sm:inline">Guardando...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>{editingService ? 'Guardar' : 'Crear'}</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 border-2 border-gray-200 text-black rounded-lg font-fira text-xs sm:text-sm font-semibold
                    hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <X size={14} strokeWidth={2.5} />
                  <span>Cancelar</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de servicios - Diseño mejorado */}
      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence>
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon_name] || iconMap['Camera'];
              const isDeleting = deleting === service.id;

              return (
                <motion.div
                  key={service.id || service.slug}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, y: -30 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  whileHover={{ y: -5 }}
                  className="relative group bg-gradient-to-br from-white to-gray-50
                    border-2 border-gray-200 rounded-2xl overflow-hidden
                    hover:border-[#79502A] hover:shadow-2xl transition-all
                    flex flex-col min-h-[200px]"
                >
                  {/* Patrón decorativo sutil */}
                  <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
                      backgroundSize: '20px 20px'
                    }}
                  />

                  {/* Contenido */}
                  <div className="relative p-5 flex flex-col h-full">
                    {/* Badge para predeterminados */}
                    {service.is_default && (
                      <div className="absolute top-4 right-4">
                        <div className="px-2.5 py-1 bg-gradient-to-r from-[#79502A] to-[#8B5A2F] rounded-lg shadow-md">
                          <span className="text-[10px] font-fira font-bold text-white tracking-wide">
                            PREDETERMINADO
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Icon con efecto */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl
                      bg-gradient-to-br from-[#79502A] to-[#8B5A2F]
                      flex items-center justify-center mb-4 shadow-lg
                      group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <IconComponent
                        size={24}
                        className="text-white"
                        strokeWidth={2}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 mb-4">
                      <h4 className="font-fira text-base sm:text-lg font-bold text-[#79502A] mb-2 leading-tight
                        group-hover:text-[#8B5A2F] transition-colors">
                        {service.name}
                      </h4>
                      {service.description ? (
                        <p className="font-fira text-xs sm:text-sm text-black/70 leading-relaxed line-clamp-2">
                          {service.description}
                        </p>
                      ) : (
                        <p className="font-fira text-xs text-black/40 italic">
                          {service.is_default ? 'Servicio predeterminado del sistema' : 'Servicio personalizado'}
                        </p>
                      )}
                    </div>

                    {/* Actions - Siempre al fondo */}
                    <div className="flex items-center gap-2 mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleEdit(service)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#79502A] to-[#8B5A2F] text-white
                          rounded-lg font-fira text-xs sm:text-sm font-bold
                          hover:shadow-lg transition-all flex items-center justify-center gap-2
                          shadow-md"
                      >
                        <Pencil size={14} strokeWidth={2.5} />
                        <span>Editar</span>
                      </motion.button>
                      {!service.is_default && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(service)}
                          disabled={isDeleting}
                          className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white
                            rounded-lg font-fira text-xs sm:text-sm font-bold
                            hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center shadow-md"
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
                          ) : (
                            <Trash2 size={14} strokeWidth={2.5} />
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Estado vacío */}
      {services.length === 0 && !isEditing && (
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-black/20 mx-auto mb-4" />
          <p className="font-fira text-base text-black/40 mb-6">
            No hay servicios creados todavía
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-[#79502A] !text-white rounded-lg font-fira text-sm font-medium
              inline-flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Crear primer servicio</span>
          </motion.button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />
    </div>
  );
}