import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessNotificationProps {
  isVisible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  duration?: number; // Duration in milliseconds, default 4000ms
  className?: string;
}

export default function SuccessNotification({
  isVisible,
  title,
  description,
  onClose,
  duration = 4000,
  className
}: SuccessNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to trigger entrance animation
      setTimeout(() => setIsAnimating(true), 10);
      
      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for exit animation to complete before removing from DOM
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300",
        isAnimating ? "opacity-100" : "opacity-0",
        className
      )}
      onClick={handleClose}
    >
      <div 
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl border border-green-200 p-8 max-w-md w-full mx-4 transform transition-all duration-300",
          isAnimating 
            ? "scale-100 translate-y-0" 
            : "scale-95 translate-y-4"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Success content */}
        <div className="text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-green-700 mb-3">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-gray-600 text-lg mb-6">
              {description}
            </p>
          )}

          {/* Auto-dismiss indicator */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all ease-linear"
              style={{
                width: isAnimating ? '0%' : '100%',
                transitionDuration: `${duration}ms`
              }}
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleClose}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}