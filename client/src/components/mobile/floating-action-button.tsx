import React from 'react';
import { Plus, Edit, Add } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  extended?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label,
  extended = false,
  className = '',
  variant = 'primary'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`
        fab 
        ${extended ? 'extended' : ''} 
        ${getVariantStyles()}
        touch-action-manipulation
        ${className}
      `}
      aria-label={label || 'Add new item'}
    >
      {icon}
      {extended && label && (
        <span className="ml-2 font-medium">{label}</span>
      )}
    </Button>
  );
};

// Pre-configured FAB variants
export const AddFAB = (props: Omit<FloatingActionButtonProps, 'icon'>) => (
  <FloatingActionButton {...props} icon={<Plus className="h-6 w-6" />} />
);

export const EditFAB = (props: Omit<FloatingActionButtonProps, 'icon'>) => (
  <FloatingActionButton {...props} icon={<Edit className="h-6 w-6" />} />
);

export default FloatingActionButton;