import { createContext, useContext, useState, ReactNode } from "react";
import SuccessNotification from "@/components/ui/success-notification";

interface NotificationContextType {
  showSuccess: (title: string, description: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useGlobalNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useGlobalNotification must be used within a NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    title: string;
    description: string;
    duration?: number;
  }>({
    isVisible: false,
    title: "",
    description: "",
    duration: 3500,
  });

  const showSuccess = (title: string, description: string, duration: number = 3500) => {
    setNotification({
      isVisible: true,
      title,
      description,
      duration,
    });
  };

  const handleClose = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <NotificationContext.Provider value={{ showSuccess }}>
      {children}
      <SuccessNotification
        isVisible={notification.isVisible}
        title={notification.title}
        description={notification.description}
        onClose={handleClose}
        duration={notification.duration}
      />
    </NotificationContext.Provider>
  );
}