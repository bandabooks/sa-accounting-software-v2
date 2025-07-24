import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ONBOARDING_STORAGE_KEY = 'taxnify_onboarding_completed';

export function useOnboardingWizard() {
  const { user, isAuthenticated } = useAuth();
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Define onboarding steps for different user roles
  const getOnboardingSteps = (): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Taxnify!',
        content: 'Let\'s take a quick tour of your new accounting platform. This will help you get started quickly.',
        target: '[data-onboarding="dashboard-header"]',
        position: 'bottom',
      },
      {
        id: 'navigation',
        title: 'Main Navigation',
        content: 'Access all your business modules from this sidebar. Click on any section to expand and see all available features.',
        target: '[data-onboarding="main-nav"]',
        position: 'right',
      },
      {
        id: 'dashboard-stats',
        title: 'Business Overview',
        content: 'Your dashboard shows key business metrics at a glance. Monitor revenue, invoices, customers, and recent activity.',
        target: '[data-onboarding="dashboard-stats"]',
        position: 'bottom',
      },
      {
        id: 'quick-actions',
        title: 'Quick Actions',
        content: 'Create new invoices, add customers, or record expenses quickly using these action buttons.',
        target: '[data-onboarding="quick-actions"]',
        position: 'top',
      },
      {
        id: 'invoices',
        title: 'Invoice Management',
        content: 'Manage all your invoices here. Create professional invoices, track payments, and send reminders to customers.',
        target: '[data-onboarding="nav-invoices"]',
        position: 'right',
        action: {
          label: 'View Invoices',
          onClick: () => window.location.href = '/invoices',
        },
      },
      {
        id: 'customers',
        title: 'Customer Database',
        content: 'Store and manage all your customer information, track payment history, and maintain customer relationships.',
        target: '[data-onboarding="nav-customers"]',
        position: 'right',
        action: {
          label: 'View Customers',
          onClick: () => window.location.href = '/customers',
        },
      },
      {
        id: 'reports',
        title: 'Financial Reports',
        content: 'Generate professional financial reports including P&L statements, balance sheets, and VAT returns for SARS compliance.',
        target: '[data-onboarding="nav-reports"]',
        position: 'right',
      },
      {
        id: 'profile',
        title: 'Your Profile',
        content: 'Access your account settings, company information, and logout options from your profile menu.',
        target: '[data-onboarding="user-profile"]',
        position: 'left',
      },
    ];

    return baseSteps;
  };

  // Check if user has completed onboarding
  const hasCompletedOnboarding = () => {
    if (!user) return true;
    const completed = localStorage.getItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
    return completed === 'true';
  };

  // Mark onboarding as completed
  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`, 'true');
    }
    setIsWizardVisible(false);
  };

  // Skip onboarding
  const skipOnboarding = () => {
    completeOnboarding();
  };

  // Start onboarding for new users
  useEffect(() => {
    if (isAuthenticated && user && !hasCompletedOnboarding()) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsWizardVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  // Reset onboarding (for testing or user request)
  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`);
      setIsWizardVisible(true);
      setCurrentStep(0);
    }
  };

  return {
    isWizardVisible,
    onboardingSteps: getOnboardingSteps(),
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    hasCompletedOnboarding: hasCompletedOnboarding(),
  };
}