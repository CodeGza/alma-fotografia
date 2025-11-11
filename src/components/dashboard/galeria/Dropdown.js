'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dropdown - Componente reutilizable para filtros inline
 * 
 * Props:
 * - label: Texto del botón
 * - value: Valor actual seleccionado
 * - options: Array de {value, label, icon (opcional)}
 * - onChange: Callback cuando cambia
 */
export default function Dropdown({ label, value, options, onChange, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener label actual
  const currentOption = options.find(opt => opt.value === value);
  const displayLabel = currentOption?.label || label;
  const hasSelection = value !== 'all';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-lg transition-all font-fira text-sm font-medium flex items-center gap-2 ${
          hasSelection
            ? 'bg-[#79502A] text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {Icon && <Icon size={14} />}
        <span>{displayLabel}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
          {options.map((option) => {
            const isSelected = value === option.value;
            const OptionIcon = option.icon;

            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 transition-colors font-fira text-sm flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#FFF8E2] text-[#79502A] font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  {OptionIcon && <OptionIcon size={14} />}
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-[#79502A]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}