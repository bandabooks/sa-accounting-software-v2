import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessNotificationProps {
  isVisible: boolean;
  title: string;
  description: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessNotification({
  isVisible,
  title,
  description,
  onClose,
  duration = 3500,
}: SuccessNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className={cn(
          "bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-96 max-w-sm pointer-events-auto",
          "transform transition-all duration-300 ease-out",
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-green-500 h-1 rounded-full"
            style={{
              animation: `progress-bar ${duration}ms linear`,
            }}
          />
        </div>
        
        <style>{`
          @keyframes progress-bar {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}