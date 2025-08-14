import { useEffect, useRef } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

interface UseLoadingStatesOptions {
  loadingStates: {
    isLoading: boolean;
    message?: string;
  }[];
  progressSteps?: string[];
}

export const useLoadingStates = ({ loadingStates, progressSteps }: UseLoadingStatesOptions) => {
  const { setGlobalLoading, setLoadingMessage, setLoadingProgress } = useLoading();
  const previousLoadingState = useRef<boolean>(false);

  useEffect(() => {
    const isAnyLoading = loadingStates.some(state => state.isLoading);
    const currentMessage = loadingStates.find(state => state.isLoading && state.message)?.message || 'Loading...';

    // Calculate progress based on completed states
    let progress = 0;
    if (progressSteps && progressSteps.length > 0) {
      const completedSteps = loadingStates.filter(state => !state.isLoading).length;
      progress = Math.min((completedSteps / loadingStates.length) * 100, 100);
    }

    // Show loading if any state is loading
    if (isAnyLoading && !previousLoadingState.current) {
      setGlobalLoading(true);
      setLoadingMessage(currentMessage);
      setLoadingProgress(progress);
    } else if (isAnyLoading) {
      // Update message and progress if still loading
      setLoadingMessage(currentMessage);
      setLoadingProgress(progress);
    } else if (!isAnyLoading && previousLoadingState.current) {
      // Hide loading when all states are complete
      setTimeout(() => {
        setGlobalLoading(false);
        setLoadingProgress(0);
      }, 300); // Small delay for smooth transition
    }

    previousLoadingState.current = isAnyLoading;
  }, [loadingStates, progressSteps, setGlobalLoading, setLoadingMessage, setLoadingProgress]);
};

// Hook for page-level loading with navigation
export const usePageLoading = () => {
  const { setGlobalLoading, setLoadingMessage } = useLoading();

  const startPageLoading = (message: string = 'Loading page...') => {
    setGlobalLoading(true);
    setLoadingMessage(message);
  };

  const stopPageLoading = () => {
    setTimeout(() => {
      setGlobalLoading(false);
    }, 200);
  };

  return { startPageLoading, stopPageLoading };
};