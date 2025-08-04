import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "OK",
  onConfirm,
}: SuccessModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            {description}
          </DialogDescription>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}