import { useState } from "react";
import { 
  CheckSquare, Square, Clock, AlertCircle, 
  Calendar, User, Tag, MoreVertical, Edit,
  Trash2, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface MobileTaskCardProps {
  task: any;
  onToggleComplete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onAssign?: (id: number, userId: number) => void;
}

export function MobileTaskCard({ 
  task, 
  onToggleComplete,
  onEdit, 
  onDelete,
  onAssign
}: MobileTaskCardProps) {
  const [isChecked, setIsChecked] = useState(task.status === "completed");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "priority-high text-red-600 bg-red-50 border-red-200";
      case "medium": return "priority-medium text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "priority-low text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return ArrowUp;
      case "medium": return Minus;
      case "low": return ArrowDown;
      default: return Minus;
    }
  };

  const PriorityIcon = getPriorityIcon(task.priority);

  const handleToggle = () => {
    setIsChecked(!isChecked);
    onToggleComplete?.(task.id);
  };

  const getDueDateColor = () => {
    if (!task.dueDate) return "text-gray-500";
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-600 font-semibold";
    if (diffDays <= 1) return "text-orange-600 font-semibold";
    if (diffDays <= 3) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className={`task-mobile-card ${task.priority ? `priority-${task.priority}` : ''} bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleToggle}
          className="mt-1 h-5 w-5"
        />
        
        <div className="flex-1">
          <h3 className={`font-medium text-gray-900 ${isChecked ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Priority Badge */}
            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {task.priority}
            </Badge>

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${getDueDateColor()}`}>
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>{task.assignee}</span>
              </div>
            )}

            {/* Category/Project */}
            {task.project && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Tag className="h-3 w-3" />
                <span>{task.project}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(task.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(task.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Bar (if applicable) */}
      {task.progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtasks (if applicable) */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-600 mb-1">
            Subtasks: {task.subtasks.filter((st: any) => st.completed).length}/{task.subtasks.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${(task.subtasks.filter((st: any) => st.completed).length / task.subtasks.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}