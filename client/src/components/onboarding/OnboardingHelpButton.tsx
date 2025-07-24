import React from 'react';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';

export function OnboardingHelpButton() {
  const { resetOnboarding, hasCompletedOnboarding } = useOnboardingWizard();

  if (!hasCompletedOnboarding) {
    return null; // Don't show help button during initial onboarding
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetOnboarding}
            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-3 w-3" />
            <span>Restart Tour</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}