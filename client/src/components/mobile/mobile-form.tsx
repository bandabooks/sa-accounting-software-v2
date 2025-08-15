import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MobileFormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  helper?: string;
}

export const MobileFormField: React.FC<MobileFormFieldProps> = ({
  label,
  children,
  error,
  required = false,
  helper
}) => {
  return (
    <div className="mobile-form-section">
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="space-y-1">
        {children}
        {helper && (
          <p className="text-xs text-gray-500">{helper}</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

interface MobileFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  isLoading = false,
  className = ''
}) => {
  return (
    <form onSubmit={onSubmit} className={`bg-white ${className}`}>
      <div className="divide-y divide-gray-200">
        {children}
      </div>
      
      {/* Action buttons */}
      <div className="p-4 bg-gray-50 flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto mobile-tap-area"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto mobile-tap-area"
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  );
};

// Pre-configured mobile-friendly input components
export const MobileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <Input 
    {...props} 
    className={`mobile-tap-area ${props.className || ''}`}
  />
);

export const MobileTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <Textarea 
    {...props} 
    className={`mobile-tap-area min-h-[100px] ${props.className || ''}`}
  />
);

interface MobileSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const MobileSelect: React.FC<MobileSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  children,
  disabled = false
}) => (
  <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger className="mobile-tap-area">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {children}
    </SelectContent>
  </Select>
);

export default MobileForm;