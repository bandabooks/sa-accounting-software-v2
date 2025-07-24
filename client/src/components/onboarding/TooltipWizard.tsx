import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TooltipStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the target element
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface TooltipWizardProps {
  steps: TooltipStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function TooltipWizard({ steps, isVisible, onComplete, onSkip }: TooltipWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Highlight the target element
        targetElement.classList.add('tooltip-wizard-highlight');
        
        // Scroll target into view
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center' 
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      // Remove highlight from all elements
      document.querySelectorAll('.tooltip-wizard-highlight').forEach(el => {
        el.classList.remove('tooltip-wizard-highlight');
      });
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isVisible, steps]);

  if (!isVisible || !steps[currentStep]) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const getTooltipPosition = () => {
    const tooltipOffset = 20;
    let top = targetPosition.top;
    let left = targetPosition.left;

    switch (currentStepData.position) {
      case 'top':
        top = targetPosition.top - tooltipOffset;
        left = targetPosition.left + targetPosition.width / 2;
        break;
      case 'bottom':
        top = targetPosition.top + targetPosition.height + tooltipOffset;
        left = targetPosition.left + targetPosition.width / 2;
        break;
      case 'left':
        top = targetPosition.top + targetPosition.height / 2;
        left = targetPosition.left - tooltipOffset;
        break;
      case 'right':
        top = targetPosition.top + targetPosition.height / 2;
        left = targetPosition.left + targetPosition.width + tooltipOffset;
        break;
    }

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();

  const handleNext = () => {
    if (currentStepData.action) {
      currentStepData.action.onClick();
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40 pointer-events-none" />
      
      {/* Target highlight */}
      <div
        className="fixed border-2 border-blue-500 rounded-lg pointer-events-none z-50 transition-all duration-300"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 w-80 transform transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: currentStepData.position === 'top' || currentStepData.position === 'bottom'
            ? 'translateX(-50%)'
            : currentStepData.position === 'left'
            ? 'translateX(-100%)'
            : 'translateX(0)',
        }}
      >
        <Card className="border-2 border-blue-500 shadow-xl bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1} of {steps.length}
                </Badge>
                <h3 className="font-semibold text-sm">{currentStepData.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground mb-4">
              {currentStepData.content}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="flex items-center gap-1"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Finish
                    </>
                  ) : (
                    <>
                      {currentStepData.action?.label || 'Next'}
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .tooltip-wizard-highlight {
          position: relative;
          z-index: 45 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}