import { useState } from 'react';

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false,
  });

  const showAlert = ({ 
    title, 
    message, 
    type = 'info',
    onConfirm,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    showCancel = false
  }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      showCancel,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  return { alertConfig, showAlert, hideAlert };
};