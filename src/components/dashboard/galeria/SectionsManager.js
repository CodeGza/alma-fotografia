'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FolderPlus,
  Edit3,
  Trash2,
  GripVertical,
  Check,
  X,
  Folder,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import {
  getGallerySections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections
} from '@/app/actions/photo-sections-actions';
import { updateShowAllSections } from '@/app/actions/gallery-actions';

/**
 * SectionsManager - Gestor de secciones de fotos
 *
 * Permite crear, editar, eliminar y reordenar secciones
 */
export default function SectionsManager({ galleryId, onSectionsChange, initialShowAll = true }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deletingSection, setDeletingSection] = useState(null);
  const [showAllSections, setShowAllSections] = useState(initialShowAll);
  const [updatingShowAll, setUpdatingShowAll] = useState(false);
  const { showToast } = useToast();

  // Cargar secciones
  useEffect(() => {
    loadSections();
  }, [galleryId]);

  const loadSections = async () => {
    setLoading(true);
    const result = await getGallerySections(galleryId);
    if (result.success) {
      setSections(result.sections);
      onSectionsChange?.(result.sections);
    } else {
      showToast({ message: 'Error al cargar secciones', type: 'error' });
    }
    setLoading(false);
  };

  // Crear sección
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast({ message: 'El nombre es obligatorio', type: 'error' });
      return;
    }

    const result = await createSection(galleryId, formData);
    if (result.success) {
      showToast({ message: 'Sección creada', type: 'success' });
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      loadSections();
    } else {
      showToast({ message: result.error || 'Error al crear sección', type: 'error' });
    }
  };

  // Actualizar sección
  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      showToast({ message: 'El nombre es obligatorio', type: 'error' });
      return;
    }

    const result = await updateSection(editingSection.id, formData);
    if (result.success) {
      showToast({ message: 'Sección actualizada', type: 'success' });
      setEditingSection(null);
      setFormData({ name: '', description: '' });
      loadSections();
    } else {
      showToast({ message: result.error || 'Error al actualizar', type: 'error' });
    }
  };

  // Confirmar eliminación de sección
  const confirmDelete = async () => {
    if (!deletingSection) return;

    const result = await deleteSection(deletingSection.id);
    if (result.success) {
      showToast({ message: 'Sección eliminada', type: 'success' });
      loadSections();
    } else {
      showToast({ message: result.error || 'Error al eliminar', type: 'error' });
    }
    setDeletingSection(null);
  };

  // Reordenar secciones
  const handleReorder = async (newOrder) => {
    setSections(newOrder);
    const sectionOrders = newOrder.map((section, index) => ({
      id: section.id,
      display_order: index
    }));

    const result = await reorderSections(galleryId, sectionOrders);
    if (!result.success) {
      showToast({ message: 'Error al reordenar', type: 'error' });
      loadSections(); // Recargar para revertir
    }
  };

  // Iniciar edición
  const startEdit = (section) => {
    setEditingSection(section);
    setFormData({ name: section.name, description: section.description || '' });
    setShowCreateForm(false);
  };

  // Cancelar formulario
  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingSection(null);
    setFormData({ name: '', description: '' });
  };

  // Actualizar show_all_sections
  const handleToggleShowAll = async (newValue) => {
    setUpdatingShowAll(true);
    const result = await updateShowAllSections(galleryId, newValue);
    if (result.success) {
      setShowAllSections(newValue);
      showToast({
        message: newValue
          ? 'Se mostrará la sección "Todas"'
          : 'Solo se mostrarán las secciones específicas',
        type: 'success'
      });
    } else {
      showToast({ message: result.error || 'Error al actualizar', type: 'error' });
    }
    setUpdatingShowAll(false);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
          <div className="h-8 bg-white/10 rounded"></div>
          <div className="h-8 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder size={20} className="text-[#C6A97D]" />
          <h3 className="font-voga text-lg sm:text-xl text-white">
            Secciones
          </h3>
          {sections.length > 0 && (
            <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/70">
              {sections.length}
            </span>
          )}
        </div>
        {!showCreateForm && !editingSection && (
          <motion.button
            onClick={() => setShowCreateForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#C6A97D] hover:bg-[#B8985F] text-black rounded-lg transition-colors font-fira text-sm font-semibold"
          >
            <FolderPlus size={16} />
            <span className="hidden sm:inline">Nueva</span>
          </motion.button>
        )}
      </div>

      {/* Toggle "Mostrar todas las fotos" */}
      {sections.length > 0 && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showAllSections}
              onChange={(e) => handleToggleShowAll(e.target.checked)}
              disabled={updatingShowAll}
              className="mt-1 w-4 h-4 text-[#C6A97D] bg-white/10 border-white/20 rounded focus:ring-[#C6A97D] focus:ring-offset-0 disabled:opacity-50"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {showAllSections ? (
                  <Eye size={16} className="text-white/70" />
                ) : (
                  <EyeOff size={16} className="text-white/70" />
                )}
                <span className="font-fira text-sm font-medium text-white">
                  Mostrar todas las fotos
                </span>
              </div>
              <p className="font-fira text-xs text-white/50 mt-1">
                {showAllSections
                  ? 'Los clientes verán una sección "TODAS" con todas las fotos'
                  : 'Solo se mostrarán las secciones específicas'}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Info */}
      {sections.length === 0 && !showCreateForm && (
        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
          <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-fira text-sm text-blue-200 mb-1">
              Organiza tus fotos en secciones
            </p>
            <p className="font-fira text-xs text-blue-200/70">
              Ejemplo: "Ceremonia", "Fiesta", "Retratos", etc.
            </p>
          </div>
        </div>
      )}

      {/* Formulario Crear/Editar */}
      <AnimatePresence>
        {(showCreateForm || editingSection) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div>
                <label className="block font-fira text-xs text-white/70 mb-1.5">
                  Nombre de la sección *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Ceremonia, Fiesta, Retratos..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/30 font-fira text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A97D]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-fira text-xs text-white/70 mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/30 font-fira text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A97D] resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={editingSection ? handleUpdate : handleCreate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C6A97D] hover:bg-[#B8985F] text-black rounded-lg transition-colors font-fira text-sm font-semibold"
                >
                  <Check size={16} />
                  {editingSection ? 'Guardar' : 'Crear'}
                </button>
                <button
                  onClick={cancelForm}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-fira text-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de secciones (reordenable) */}
      {sections.length > 0 && (
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {sections.map((section) => (
            <Reorder.Item
              key={section.id}
              value={section}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing text-white/40 group-hover:text-white/60">
                  <GripVertical size={18} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-fira text-sm font-semibold text-white truncate">
                    {section.name}
                  </p>
                  {section.description && (
                    <p className="font-fira text-xs text-white/50 truncate">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(section)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={14} className="text-white/60 hover:text-white" />
                  </button>
                  <button
                    onClick={() => setDeletingSection(section)}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} className="text-red-400 hover:text-red-300" />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deletingSection && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingSection(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white rounded-xl shadow-2xl p-6 m-4">
                {/* Icono de alerta */}
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-red-600" />
                </div>

                {/* Título */}
                <h3 className="font-voga text-xl text-black text-center mb-2">
                  ¿Eliminar sección?
                </h3>

                {/* Descripción */}
                <p className="font-fira text-sm text-gray-600 text-center mb-6">
                  Se eliminará la sección <strong>"{deletingSection.name}"</strong>.
                  Las fotos no se eliminarán, solo quedarán sin sección.
                </p>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingSection(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-colors font-fira text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-fira text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
