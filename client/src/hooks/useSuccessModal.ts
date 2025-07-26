import { useState } from 'react';

interface SuccessModalOptions {
  title: string;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export function useSuccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<SuccessModalOptions>({
    title: '',
    description: '',
    confirmText: 'Continue',
  });

  const showSuccess = (options: SuccessModalOptions) => {
    setModalOptions({
      confirmText: 'Continue',
      ...options,
    });
    setIsOpen(true);
  };

  const hideSuccess = () => {
    setIsOpen(false);
    if (modalOptions.onConfirm) {
      modalOptions.onConfirm();
    }
  };

  return {
    isOpen,
    showSuccess,
    hideSuccess,
    modalOptions,
  };
}