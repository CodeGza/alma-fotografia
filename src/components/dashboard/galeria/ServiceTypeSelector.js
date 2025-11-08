'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { iconMap, defaultServiceTypes, generateSlug } from '@/lib/validations/gallery';

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

export default function ServiceTypeSelector({ value, onChange, isPublic, error }) {
  const [services, setServices] = useState(defaultServiceTypes);
  const [loading, setLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Camera');
  const [creating, setCreating] = useState(false);

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

      if (data && data.length > 0) {
        setServices(data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    if (!newServiceName.trim()) return;

    setCreating(true);
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const slug = generateSlug(newServiceName);

      const { data, error } = await supabase
        .from('service_types')
        .insert({
          name: newServiceName.trim(),
          slug,
          icon_name: selectedIcon,
          is_default: false,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('Ya existe un servicio con ese nombre');
        } else {
          throw error;
        }
        return;
      }

      setServices(prev => [...prev, data]);
      onChange(data.slug);
      setNewServiceName('');
      setSelectedIcon('Camera');
      setShowAddNew(false);
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error al crear el servicio');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#79502A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Grid de servicios */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {services.map((service) => {
          const IconComponent = iconMap[service.icon_name] || iconMap['Camera'];
          const isSelected = value === service.slug;

          return (
            <motion.label
              key={service.slug}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${isSelected
                  ? 'border-[#79502A] bg-white shadow-sm'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
                }`}
            >
              <input
                type="radio"
                value={service.slug}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              <IconComponent
                size={24}
                className={isSelected ? 'text-[#79502A]' : 'text-black/60'}
                strokeWidth={1.5}
              />
              <span className={`font-fira text-xs sm:text-sm font-medium text-center transition-colors leading-tight
                    ${isSelected ? 'text-[#79502A]' : 'text-black'}`}>
                {service.name}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-[#79502A] rounded-full flex items-center justify-center"
                >
                  <Check size={12} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.label>
          );
        })}

        {/* Botón agregar nuevo */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddNew(true)}
          className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 border-2 border-dashed border-gray-300
            rounded-lg cursor-pointer transition-all hover:border-[#79502A] hover:bg-gray-50"
        >
          <Plus size={24} className="text-black/40" strokeWidth={1.5} />
          <span className="font-fira text-xs sm:text-sm font-medium text-black/60 text-center leading-tight">
            Agregar
          </span>
        </motion.button>
      </div>

      {/* Form para crear servicio nuevo */}
      <AnimatePresence>
        {showAddNew && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-300 space-y-4">
              {/* Nombre del servicio */}
              <div>
                <label className="block font-fira text-sm font-medium text-black mb-2">
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateService();
                    }
                    if (e.key === 'Escape') {
                      setShowAddNew(false);
                      setNewServiceName('');
                    }
                  }}
                  placeholder="Ej: Sesión de Mascotas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-fira text-sm
                                        focus:outline-none focus:ring-2 focus:ring-[#C6A97D]/40 text-black"
                  disabled={creating}
                  autoFocus
                />
              </div>

              {/* Selector de icono */}
              <div>
                <label className="block font-fira text-sm font-medium text-black mb-2">
                  Selecciona un icono
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = iconMap[icon.name];
                    const isSelected = selectedIcon === icon.name;

                    return (
                      <motion.button
                        key={icon.name}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedIcon(icon.name)}
                        className={`flex flex-col items-center gap-1 p-3 border-2 rounded-lg transition-all
                                                    ${isSelected
                            ? 'border-[#79502A] bg-white'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                      >
                        <IconComponent
                          size={24}
                          className={isSelected ? 'text-[#79502A]' : 'text-black/60'}
                          strokeWidth={1.5}
                        />
                        <span className="font-fira text-xs text-black/60">
                          {icon.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateService}
                  disabled={creating || !newServiceName.trim()}
                  className="flex-1 px-4 py-2 bg-[#79502A] !text-white rounded-lg font-fira text-sm font-medium
                                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Crear servicio</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddNew(false);
                    setNewServiceName('');
                    setSelectedIcon('Camera');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-[#79502A]  transition-colors
                                        font-fira text-sm flex items-center justify-center gap-2 "
                >
                  <X size={16} />
                  <span>Cancelar</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ayuda contextual */}
      {isPublic && (
        <p className="font-fira text-xs text-[#79502A] flex items-center gap-1">
          <Check size={12} />
          Solo puede haber una galería pública por tipo de servicio
        </p>
      )}

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-fira text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}