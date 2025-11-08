'use client';

import { useState } from 'react';

/**
 * Hook para manejar modales de forma sencilla
 */
export function useModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Aceptar',
    cancelText: '',
    onConfirm: null,
    onCancel: null,
  });

  const showModal = ({
    title,
    message,
    type = 'info',
    confirmText = 'Aceptar',
    cancelText = '',
    onConfirm,
    onCancel,
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    modalState,
    showModal,
    closeModal,
  };
}