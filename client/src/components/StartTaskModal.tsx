import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StartTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskStarted: (taskData: any) => void;
}

export function StartTaskModal({ open, onOpenChange, onTaskStarted }: StartTaskModalProps) {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");

  const handleStart = () => {
    if (taskName.trim()) {
      onTaskStarted({
        taskName: taskName.trim(),
        description: description.trim(),
        startedAt: new Date().toISOString()
      });
      setTaskName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Work Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              data-testid="input-task-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              data-testid="input-task-description"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={!taskName.trim()}>
            Start Work
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}