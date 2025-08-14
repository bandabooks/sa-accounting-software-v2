import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export const GlobalLoader: React.FC = () => {
  const { isGlobalLoading, loadingMessage, loadingProgress } = useLoading();

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Loader */}
          <div className="relative">
            <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800"></div>
          </div>

          {/* Loading Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {loadingMessage}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we process your request...
            </p>
          </div>

          {/* Progress Bar */}
          {loadingProgress > 0 && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(loadingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Animated Dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageLoader: React.FC<{ message?: string }> = ({ message = "Loading page..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="relative mb-6">
          <Loader2 className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800 mx-auto" style={{ width: '64px', height: '64px' }}></div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {message}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Setting up your workspace...
        </p>

        {/* Skeleton Content */}
        <div className="max-w-md mx-auto space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InlineLoader: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  message = "Loading...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center space-x-3 py-8">
      <Loader2 className={`${sizeClasses[size]} text-blue-600 dark:text-blue-400 animate-spin`} />
      <span className="text-gray-600 dark:text-gray-400 font-medium">
        {message}
      </span>
    </div>
  );
};