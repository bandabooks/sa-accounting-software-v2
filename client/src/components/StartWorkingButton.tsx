import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Play, Square, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StartTaskModal } from "./StartTaskModal";

interface StartWorkingButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onWorkStarted?: () => void;
  item?: any;
  type?: string;
}

export default function StartWorkingButton({ 
  variant = 'default', 
  size = 'sm',
  className = '',
  onWorkStarted,
  item,
  type = 'task'
}: StartWorkingButtonProps) {
  const [showStartModal, setShowStartModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTaskStarted = (taskData: any) => {
    toast({
      title: "Work Session Started",
      description: `Started working on: ${taskData.taskName}`,
    });
    onWorkStarted?.();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowStartModal(true)}
        data-testid="button-start-work"
      >
        <Play className="h-3 w-3 mr-1" />
        Start Work
      </Button>

      {showStartModal && (
        <StartTaskModal
          open={showStartModal}
          onOpenChange={setShowStartModal}
          onTaskStarted={handleTaskStarted}
        />
      )}
    </>
  );
}