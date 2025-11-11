'use client';

import { Globe, Lock, ImageIcon, Eye, Briefcase, Archive, Heart, Download, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { iconMap } from '@/lib/validations/gallery';

/**
 * GalleriesSidebar COMPLETO v2
 * 
 * Features:
 * - Stats resumidas
 * - Filtros básicos (servicio, estado, enlace)
 * - Filtros avanzados (vistas, fotos, favoritos, vencimiento)
 * - Filtros inteligentes (pendientes, sin actividad, etc)
 * - Ordenamiento
 */
export default function GalleriesSidebar({
  serviceTypes,
  selectedService,
  setSelectedService,
  selectedStatus,
  setSelectedStatus,
  selectedLinkStatus,
  setSelectedLinkStatus,
  selectedArchiveStatus,
  setSelectedArchiveStatus,
  selectedFavorites,
  setSelectedFavorites,
  selectedDownloads,
  setSelectedDownloads,
  selectedYear,
  setSelectedYear,
  availableYears,
  sortBy,
  setSortBy,
  stats,
  // NUEVOS filtros
  selectedViews,
  setSelectedViews,
  selectedPhotos,
  setSelectedPhotos,
  selectedExpiration,
  setSelectedExpiration,
  selectedSmartFilter,
  setSelectedSmartFilter,
}) {
  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* ESTADÍSTICAS */}
      {/* ============================================ */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Resumen
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-fira text-sm text-gray-600">Total activas</span>
            <span className="font-fira text-base font-bold text-black">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-fira text-sm text-gray-600 flex items-center gap-1.5">
              <Globe size={12} className="text-green-600" />
              Públicas
            </span>
            <span className="font-fira text-base font-bold text-green-600">{stats.public}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-fira text-sm text-gray-600 flex items-center gap-1.5">
              <Lock size={12} className="text-gray-400" />
              Privadas
            </span>
            <span className="font-fira text-base font-bold text-gray-600">{stats.private}</span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-fira text-sm text-gray-600 flex items-center gap-1.5">
                <ImageIcon size={12} className="text-[#79502A]" />
                Fotos
              </span>
              <span className="font-fira text-base font-bold text-[#79502A]">{stats.totalPhotos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-fira text-sm text-gray-600 flex items-center gap-1.5">
                <Eye size={12} className="text-blue-600" />
                Vistas
              </span>
              <span className="font-fira text-base font-bold text-blue-600">{stats.totalViews}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="font-fira text-sm text-gray-600 flex items-center gap-1.5">
              <Archive size={12} className="text-gray-400" />
              Archivadas
            </span>
            <span className="font-fira text-base font-bold text-gray-600">{stats.archived}</span>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTROS INTELIGENTES */}
      {/* ============================================ */}
      {setSelectedSmartFilter && (
        <div className="bg-gradient-to-br from-[#79502A]/10 to-[#79502A]/5 rounded-xl border border-[#79502A]/20 p-4">
          <h3 className="font-fira text-xs font-semibold text-[#79502A] uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertCircle size={14} />
            Vistas rápidas
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedSmartFilter('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedSmartFilter === 'all'
                  ? 'bg-[#79502A] text-white font-semibold'
                  : 'hover:bg-white/50 text-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedSmartFilter('pending-share')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
                selectedSmartFilter === 'pending-share'
                  ? 'bg-amber-100 text-amber-800 font-semibold border border-amber-300'
                  : 'hover:bg-white/50 text-gray-700'
              }`}
            >
              <Clock size={14} />
              Pendientes de compartir
            </button>
            <button
              onClick={() => setSelectedSmartFilter('no-activity')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
                selectedSmartFilter === 'no-activity'
                  ? 'bg-red-100 text-red-800 font-semibold border border-red-300'
                  : 'hover:bg-white/50 text-gray-700'
              }`}
            >
              <AlertCircle size={14} />
              Sin actividad
            </button>
            <button
              onClick={() => setSelectedSmartFilter('needs-attention')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
                selectedSmartFilter === 'needs-attention'
                  ? 'bg-orange-100 text-orange-800 font-semibold border border-orange-300'
                  : 'hover:bg-white/50 text-gray-700'
              }`}
            >
              <AlertCircle size={14} />
              Requieren atención
            </button>
            <button
              onClick={() => setSelectedSmartFilter('complete')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
                selectedSmartFilter === 'complete'
                  ? 'bg-green-100 text-green-800 font-semibold border border-green-300'
                  : 'hover:bg-white/50 text-gray-700'
              }`}
            >
              <CheckCircle size={14} />
              Completas
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTRO POR ARCHIVO */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Archivo
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedArchiveStatus('active')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedArchiveStatus === 'active'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setSelectedArchiveStatus('archived')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
              selectedArchiveStatus === 'archived'
                ? 'bg-gray-100 text-gray-700 font-semibold border border-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Archive size={14} />
            Archivadas ({stats.archived})
          </button>
          <button
            onClick={() => setSelectedArchiveStatus('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedArchiveStatus === 'all'
                ? 'bg-gray-50 text-gray-700 font-semibold border border-gray-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTRO POR VISTAS */}
      {/* ============================================ */}
      {setSelectedViews && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Eye size={14} />
            Vistas
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedViews('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedViews === 'all'
                  ? 'bg-[#79502A] text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedViews('none')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedViews === 'none'
                  ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Sin vistas (0)
            </button>
            <button
              onClick={() => setSelectedViews('low')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedViews === 'low'
                  ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Pocas vistas (1-9)
            </button>
            <button
              onClick={() => setSelectedViews('medium')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedViews === 'medium'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Con actividad (10-49)
            </button>
            <button
              onClick={() => setSelectedViews('high')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedViews === 'high'
                  ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Populares (≥50)
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTRO POR CANTIDAD DE FOTOS */}
      {/* ============================================ */}
      {setSelectedPhotos && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ImageIcon size={14} />
            Cantidad de fotos
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedPhotos('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedPhotos === 'all'
                  ? 'bg-[#79502A] text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedPhotos('empty')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedPhotos === 'empty'
                  ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Vacías (0)
            </button>
            <button
              onClick={() => setSelectedPhotos('small')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedPhotos === 'small'
                  ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Pequeñas (1-20)
            </button>
            <button
              onClick={() => setSelectedPhotos('medium')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedPhotos === 'medium'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Medianas (21-100)
            </button>
            <button
              onClick={() => setSelectedPhotos('large')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedPhotos === 'large'
                  ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Grandes (&gt;100)
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTRO POR VENCIMIENTO */}
      {/* ============================================ */}
      {setSelectedExpiration && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={14} />
            Vencimiento
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedExpiration('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedExpiration === 'all'
                  ? 'bg-[#79502A] text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedExpiration('never')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedExpiration === 'never'
                  ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Sin vencimiento
            </button>
            <button
              onClick={() => setSelectedExpiration('soon')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedExpiration === 'soon'
                  ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Vence pronto (&lt;7 días)
            </button>
            <button
              onClick={() => setSelectedExpiration('expired')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedExpiration === 'expired'
                  ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Ya vencidas
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FILTRO POR SERVICIO */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Tipo de servicio
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedService('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedService === 'all'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Todos
          </button>
          {serviceTypes.map((service) => {
            const Icon = iconMap[service.icon_name] || Briefcase;
            return (
              <button
                key={service.slug}
                onClick={() => setSelectedService(service.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
                  selectedService === service.slug
                    ? 'bg-[#FFF8E2] text-[#79502A] font-semibold border border-[#C6A97D]'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon size={14} />
                {service.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTRO POR ESTADO */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Estado
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedStatus === 'all'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedStatus('public')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
              selectedStatus === 'public'
                ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Globe size={14} />
            Públicas
          </button>
          <button
            onClick={() => setSelectedStatus('private')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm flex items-center gap-2 ${
              selectedStatus === 'private'
                ? 'bg-gray-100 text-gray-700 font-semibold border border-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Lock size={14} />
            Privadas
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTRO POR ESTADO DEL ENLACE */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Estado del enlace
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedLinkStatus('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedLinkStatus === 'all'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedLinkStatus('active')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedLinkStatus === 'active'
                ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Con enlace activo
          </button>
          <button
            onClick={() => setSelectedLinkStatus('expired')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedLinkStatus === 'expired'
                ? 'bg-red-50 text-red-700 font-semibold border border-red-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Enlace expirado
          </button>
          <button
            onClick={() => setSelectedLinkStatus('none')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedLinkStatus === 'none'
                ? 'bg-gray-100 text-gray-700 font-semibold border border-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Sin enlace
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTRO POR FAVORITOS */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Heart size={14} />
          Favoritos
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedFavorites('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedFavorites === 'all'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedFavorites('with')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedFavorites === 'with'
                ? 'bg-pink-50 text-pink-700 font-semibold border border-pink-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Con favoritos
          </button>
          <button
            onClick={() => setSelectedFavorites('without')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedFavorites === 'without'
                ? 'bg-gray-100 text-gray-700 font-semibold border border-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Sin favoritos
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTRO POR DESCARGAS */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Download size={14} />
          Descargas
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedDownloads('all')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedDownloads === 'all'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedDownloads('enabled')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedDownloads === 'enabled'
                ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Descargas permitidas
          </button>
          <button
            onClick={() => setSelectedDownloads('disabled')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              selectedDownloads === 'disabled'
                ? 'bg-gray-100 text-gray-700 font-semibold border border-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Descargas deshabilitadas
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTRO POR AÑO */}
      {/* ============================================ */}
      {availableYears.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Año
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedYear('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                selectedYear === 'all'
                  ? 'bg-[#79502A] text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Todos los años
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year.toString())}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
                  selectedYear === year.toString()
                    ? 'bg-[#FFF8E2] text-[#79502A] font-semibold border border-[#C6A97D]'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ORDENAMIENTO */}
      {/* ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-fira text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Ordenar por
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSortBy('newest')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              sortBy === 'newest'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Más recientes
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              sortBy === 'oldest'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Más antiguas
          </button>
          <button
            onClick={() => setSortBy('most-viewed')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              sortBy === 'most-viewed'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Más vistas
          </button>
          <button
            onClick={() => setSortBy('most-photos')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              sortBy === 'most-photos'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            Más fotos
          </button>
          <button
            onClick={() => setSortBy('alphabetical')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-fira text-sm ${
              sortBy === 'alphabetical'
                ? 'bg-[#79502A] text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            A → Z
          </button>
        </div>
      </div>
    </div>
  );
}