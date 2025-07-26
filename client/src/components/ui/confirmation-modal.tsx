import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Mail, 
  KeyRound, 
  UserX,
  Trash2,
  LogIn
} from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "info" | "success";
  icon?: "warning" | "info" | "success" | "error" | "mail" | "key" | "user" | "trash" | "login";
  isLoading?: boolean;
}

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: XCircle,
  mail: Mail,
  key: KeyRound,
  user: UserX,
  trash: Trash2,
  login: LogIn,
};

const variantStyles = {
  default: "text-blue-600",
  destructive: "text-red-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
  success: "text-green-600",
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon = "info",
  isLoading = false,
}: ConfirmationModalProps) {
  const IconComponent = iconMap[icon];
  const iconColor = variantStyles[variant];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-3">
            <IconComponent className={`h-6 w-6 ${iconColor}`} />
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelText && (
            <AlertDialogCancel onClick={onClose} disabled={isLoading}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : variant === "warning"
                ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600"
                : variant === "success"
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-600"
                : ""
            }
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Convenience hooks for common confirmation types
export const useConfirmationModal = () => {
  return {
    // Password Reset Confirmation
    passwordReset: (userName: string, userEmail: string, onConfirm: () => void) => ({
      title: "Reset Password Confirmation",
      description: `Are you sure you want to reset the password for ${userName}? This will send a new password to ${userEmail}.`,
      confirmText: "Reset Password",
      cancelText: "Cancel",
      variant: "warning" as const,
      icon: "key" as const,
    }),

    // Email Verification Confirmation
    emailVerification: (userEmail: string, onConfirm: () => void) => ({
      title: "Send Verification Email",
      description: `Send verification email to ${userEmail}? They will receive a 6-digit verification code.`,
      confirmText: "Send Email",
      cancelText: "Cancel",
      variant: "info" as const,
      icon: "mail" as const,
    }),

    // Account Deactivation Confirmation
    accountDeactivation: (userName: string, onConfirm: () => void) => ({
      title: "Deactivate Account",
      description: `Are you sure you want to deactivate ${userName}'s account? This will prevent them from logging in until reactivated.`,
      confirmText: "Deactivate Account",
      cancelText: "Cancel",
      variant: "destructive" as const,
      icon: "user" as const,
    }),

    // Delete Confirmation
    deleteItem: (itemName: string, itemType: string, onConfirm: () => void) => ({
      title: `Delete ${itemType}`,
      description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive" as const,
      icon: "trash" as const,
    }),

    // Login As User Confirmation
    loginAsUser: (userName: string, onConfirm: () => void) => ({
      title: "Log In As User",
      description: `Log in as ${userName}? You will be able to view and access the system as this user for support and troubleshooting purposes.`,
      confirmText: "Log In As User",
      cancelText: "Cancel",
      variant: "warning" as const,
      icon: "login" as const,
    }),
  };
};