import React, { useState, useCallback } from 'react';

// Global state for managing which dropdown is currently open
let globalDropdownState: string | null = null;
let subscribers: Set<(activeDropdown: string | null) => void> = new Set();

const notifySubscribers = (activeDropdown: string | null) => {
  subscribers.forEach(callback => callback(activeDropdown));
};

/**
 * Custom hook to manage dropdown state with mutual exclusion.
 * Only one dropdown can be open at a time across the entire app.
 */
export const useDropdownManager = (dropdownId: string) => {
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe to global dropdown state changes
  const handleGlobalStateChange = useCallback((activeDropdown: string | null) => {
    if (activeDropdown !== dropdownId && isOpen) {
      setIsOpen(false);
    }
  }, [dropdownId, isOpen]);

  // Register/unregister subscriber
  React.useEffect(() => {
    subscribers.add(handleGlobalStateChange);
    return () => {
      subscribers.delete(handleGlobalStateChange);
    };
  }, [handleGlobalStateChange]);

  // Open this dropdown and close others
  const openDropdown = useCallback(() => {
    if (!isOpen) {
      globalDropdownState = dropdownId;
      setIsOpen(true);
      notifySubscribers(dropdownId);
    }
  }, [dropdownId, isOpen]);

  // Close this dropdown
  const closeDropdown = useCallback(() => {
    if (isOpen) {
      globalDropdownState = null;
      setIsOpen(false);
      notifySubscribers(null);
    }
  }, [isOpen]);

  // Handle open/close change (for use with Radix UI onOpenChange)
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      openDropdown();
    } else {
      closeDropdown();
    }
  }, [openDropdown, closeDropdown]);

  return {
    isOpen,
    openDropdown,
    closeDropdown,
    handleOpenChange
  };
};