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

      const { error, data } = await supabase
        .from('service_types')
        .delete()
        .eq('id', service.id)
        .select();

      if (error) {
        throw error;
      }

      // ✅ Actualizar estado local
      setServices(prev => prev.filter(s => s.id !== service.id));

      showModal({
        title: 'Servicio eliminado',
        message: 'El servicio se eliminó correctamente',
        type: 'success'
      });
    } catch (error) {
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
        <Loader2 className="w-10 h-10 text-[#8B5E3C] animate-spin" />
      </div>
    );
  }

  const isEditing = editingService || showCreateForm;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Action button */}
      {!isEditing && (
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2.5 bg-[#8B5E3C] text-white rounded-lg font-fira text-sm font-semibold
              inline-flex items-center gap-2 hover:bg-[#6d4a2f] shadow-sm transition-colors"
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
            className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <h3 className="font-fira text-lg font-bold text-gray-900 flex items-center gap-2">
                {editingService ? (
                  <>
                    <Pencil size={18} className="text-[#8B5E3C]" />
                    Editar servicio
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-[#8B5E3C]" />
                    Nuevo servicio
                  </>
                )}
              </h3>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="block font-fira text-sm font-semibold text-gray-900 mb-2">
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Sesión de Mascotas"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-fira text-sm
                    focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                    transition-all text-gray-900"
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block font-fira text-sm font-semibold text-gray-900 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Fotografía y video para tu día más especial"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-fira text-sm
                    focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10
                    transition-all text-gray-900"
                  disabled={saving}
                  maxLength={150}
                />
                <p className="font-fira text-xs text-gray-500 mt-1.5">
                  Breve descripción que aparecerá en las cards
                </p>
              </div>

              {/* Selector de icono */}
              <div>
                <label className="block font-fira text-sm font-semibold text-gray-900 mb-3">
                  Icono del servicio *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
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
                        className={`relative p-3 border rounded-lg transition-all
                          ${isSelected
                            ? 'border-[#8B5E3C] bg-[#8B5E3C]/5'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        title={icon.label}
                      >
                        <IconComponent
                          size={22}
                          className={isSelected ? 'text-[#8B5E3C]' : 'text-gray-600'}
                          strokeWidth={1.5}
                        />
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#8B5E3C] rounded-full
                              flex items-center justify-center shadow-sm"
                          >
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-[#8B5E3C] text-white rounded-lg font-fira text-sm font-semibold
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                    hover:bg-[#6d4a2f] shadow-sm transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      <span>{editingService ? 'Guardar cambios' : 'Crear servicio'}</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-fira text-sm font-semibold
                    hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} strokeWidth={2.5} />
                  <span>Cancelar</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de servicios */}
      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon_name] || iconMap['Camera'];
              const isDeleting = deleting === service.id;

              return (
                <motion.div
                  key={service.id || service.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white rounded-2xl border border-gray-100 shadow-sm
                    hover:shadow-md hover:border-gray-200 transition-all duration-200
                    flex flex-col p-5"
                >
                  {/* Badge para predeterminados */}
                  {service.is_default && (
                    <div className="absolute top-4 right-4">
                      <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-[10px] font-fira font-bold text-amber-700 tracking-wide">
                          PREDETERMINADO
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-[#8B5E3C]/10
                    flex items-center justify-center mb-4">
                    <IconComponent
                      size={24}
                      className="text-[#8B5E3C]"
                      strokeWidth={2}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 mb-4">
                    <h4 className="font-fira text-lg font-bold text-gray-900 mb-2 leading-tight">
                      {service.name}
                    </h4>
                    {service.description ? (
                      <p className="font-fira text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                    ) : (
                      <p className="font-fira text-sm text-gray-400 italic">
                        {service.is_default ? 'Servicio predeterminado' : 'Sin descripción'}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200
                        rounded-lg font-fira text-sm font-semibold
                        hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Pencil size={14} strokeWidth={2.5} />
                      <span>Editar</span>
                    </button>
                    {!service.is_default && (
                      <button
                        onClick={() => handleDelete(service)}
                        disabled={isDeleting}
                        className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600
                          rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        {isDeleting ? (
                          <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
                        ) : (
                          <Trash2 size={16} strokeWidth={2.5} />
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Estado vacío */}
      {services.length === 0 && !isEditing && (
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="font-fira text-base text-gray-500 mb-6">
            No hay servicios creados todavía
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-[#8B5E3C] text-white rounded-lg font-fira text-sm font-semibold
              inline-flex items-center gap-2 hover:bg-[#6d4a2f] shadow-sm transition-colors"
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
