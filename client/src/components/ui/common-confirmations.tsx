import { ConfirmationModal } from "./confirmation-modal";

// Example usage components for common confirmation scenarios

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isLoading = false,
}: DeleteConfirmationProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone and all associated data will be permanently removed.`}
      confirmText="Delete Permanently"
      cancelText="Keep Item"
      variant="destructive"
      icon="trash"
      isLoading={isLoading}
    />
  );
}

interface SaveChangesConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasUnsavedChanges: boolean;
  isLoading?: boolean;
}

export function SaveChangesConfirmation({
  isOpen,
  onClose,
  onConfirm,
  hasUnsavedChanges,
  isLoading = false,
}: SaveChangesConfirmationProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Save Changes"
      description={
        hasUnsavedChanges
          ? "You have unsaved changes. Would you like to save them before continuing?"
          : "Save all changes to this form?"
      }
      confirmText="Save Changes"
      cancelText="Discard Changes"
      variant="info"
      icon="info"
      isLoading={isLoading}
    />
  );
}

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmationProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sign Out"
      description="Are you sure you want to sign out? You will need to log in again to access your account."
      confirmText="Sign Out"
      cancelText="Stay Logged In"
      variant="warning"
      icon="login"
      isLoading={isLoading}
    />
  );
}

interface StatusChangeConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  currentStatus: string;
  newStatus: string;
  isLoading?: boolean;
}

export function StatusChangeConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  currentStatus,
  newStatus,
  isLoading = false,
}: StatusChangeConfirmationProps) {
  const isDeactivating = newStatus.toLowerCase().includes('inactive') || newStatus.toLowerCase().includes('disabled');
  
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Change Status`}
      description={`Change the status of "${itemName}" from ${currentStatus} to ${newStatus}?`}
      confirmText={`Change to ${newStatus}`}
      cancelText="Keep Current Status"
      variant={isDeactivating ? "warning" : "info"}
      icon="info"
      isLoading={isLoading}
    />
  );
}

interface BulkActionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: string;
  selectedCount: number;
  itemType: string;
  isLoading?: boolean;
}

export function BulkActionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  selectedCount,
  itemType,
  isLoading = false,
}: BulkActionConfirmationProps) {
  const isDestructive = actionType.toLowerCase().includes('delete') || actionType.toLowerCase().includes('remove');
  
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Bulk ${actionType}`}
      description={`${actionType} ${selectedCount} selected ${itemType}${selectedCount !== 1 ? 's' : ''}? ${isDestructive ? 'This action cannot be undone.' : ''}`}
      confirmText={`${actionType} ${selectedCount} ${itemType}${selectedCount !== 1 ? 's' : ''}`}
      cancelText="Cancel"
      variant={isDestructive ? "destructive" : "warning"}
      icon={isDestructive ? "trash" : "info"}
      isLoading={isLoading}
    />
  );
}