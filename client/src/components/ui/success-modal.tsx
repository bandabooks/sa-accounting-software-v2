import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  confirmText = 'Continue' 
}: SuccessModalProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onClose}
      title={title}  
      description={description}
      confirmText={confirmText}
      variant="success"
      icon="success"
      isLoading={false}
    />
  );
}