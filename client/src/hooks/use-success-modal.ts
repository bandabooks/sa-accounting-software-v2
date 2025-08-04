import { useState } from "react";

interface SuccessModalOptions {
  title: string;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export function useSuccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<SuccessModalOptions>({
    title: "",
    description: "",
    confirmText: "OK",
    onConfirm: undefined,
  });

  const showSuccess = (
    title: string,
    description: string,
    confirmText: string = "OK",
    onConfirm?: () => void
  ) => {
    setModalOptions({
      title,
      description,
      confirmText,
      onConfirm,
    });
    setIsOpen(true);
  };

  const hideSuccess = () => {
    setIsOpen(false);
    setModalOptions({
      title: "",
      description: "",
      confirmText: "OK",
      onConfirm: undefined,
    });
  };

  return {
    isOpen,
    modalOptions,
    showSuccess,
    hideSuccess,
  };
}