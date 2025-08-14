import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useLoading } from '@/contexts/LoadingContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [location] = useLocation();
  const { setGlobalLoading, setLoadingMessage } = useLoading();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    setGlobalLoading(true);
    setLoadingMessage('Loading page...');

    // Simulate page transition loading
    const timer = setTimeout(() => {
      setGlobalLoading(false);
      setIsTransitioning(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [location, setGlobalLoading, setLoadingMessage]);

  return (
    <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {children}
    </div>
  );
};

// Hook for programmatic navigation with loading
export const useNavigationLoading = () => {
  const { setGlobalLoading, setLoadingMessage } = useLoading();

  const navigateWithLoading = (href: string, message: string = 'Loading page...') => {
    setGlobalLoading(true);
    setLoadingMessage(message);
    
    // Navigate after a brief delay to show loading
    setTimeout(() => {
      window.location.href = href;
    }, 100);
  };

  return { navigateWithLoading };
};