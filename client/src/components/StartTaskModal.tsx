import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { User, Calendar, Clock, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StartTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskStarted: (taskData: any) => void;
}

export function StartTaskModal({ open, onOpenChange, onTaskStarted }: StartTaskModalProps) {
  const [taskType, setTaskType] = useState("client");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [estimatedDuration, setEstimatedDuration] = useState("2");
  const [expectedEndTime, setExpectedEndTime] = useState("");

  // Fetch customers for dropdown
  const { data: customers, isLoading: customersLoading } = useQuery<any[]>({
    queryKey: ['/api/customers'],
    enabled: open && taskType === 'client'
  });

  // Get professional affiliation badges for customer
  const getCustomerBadges = (customer: any) => {
    if (!customer) return [];
    const badges = [];
    // Check for SAICA/SAIPA based on category or notes
    if (customer.category === 'premium' || customer.notes?.includes('SAICA')) {
      badges.push({ label: 'SAICA', color: 'bg-blue-100 text-blue-800', icon: '🎓' });
    }
    if (customer.category === 'wholesale' || customer.notes?.includes('SAIPA')) {
      badges.push({ label: 'SAIPA', color: 'bg-green-100 text-green-800', icon: '📚' });
    }
    return badges;
  };

  const handleStart = () => {
    if (taskName.trim()) {
      onTaskStarted({
        taskType,
        clientId: selectedClientId,
        service: selectedService,
        taskName: taskName.trim(),
        description: description.trim(),
        priority,
        estimatedDuration,
        expectedEndTime,
        startedAt: new Date().toISOString()
      });
      // Reset form
      setTaskType("client");
      setSelectedClientId(null);
      setSelectedService("");
      setTaskName("");
      setDescription("");
      setPriority("medium");
      setEstimatedDuration("2");
      setExpectedEndTime("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Start New Task
          </DialogTitle>
          <DialogDescription>
            Please complete your time entry to complete your personal status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Task Type */}
          <div className="space-y-2">
            <Label>Task Type</Label>
            <RadioGroup value={taskType} onValueChange={setTaskType} className="flex gap-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <Label htmlFor="client" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Client Task
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="internal" id="internal" />
                <Label htmlFor="internal" className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  Internal Task
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Select Client (only show for client tasks) */}
          {taskType === 'client' && (
            <div className="space-y-2">
              <Label>Select Client</Label>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientSearchOpen}
                    className="w-full justify-between"
                    data-testid="button-select-task-client"
                  >
                    {selectedClientId && customers ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="truncate">
                          {customers.find((c: any) => c.id === selectedClientId)?.name}
                        </span>
                        {getCustomerBadges(customers.find((c: any) => c.id === selectedClientId)).map((badge, idx) => (
                          <Badge key={idx} variant="outline" className={cn(badge.color, 'ml-auto text-xs')}>
                            <span className="mr-1 text-xs">{badge.icon}</span>
                            {badge.label}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Choose a client...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandEmpty>No clients found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {customersLoading ? (
                        <div className="py-2 px-2 text-sm text-muted-foreground">
                          Loading clients...
                        </div>
                      ) : (
                        customers?.map((customer: any) => {
                          const badges = getCustomerBadges(customer);
                          return (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setSelectedClientId(customer.id);
                                setClientSearchOpen(false);
                              }}
                              className="flex items-center gap-2 py-2"
                              data-testid={`option-task-client-${customer.id}`}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClientId === customer.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{customer.name}</span>
                                  {badges.map((badge, idx) => (
                                    <Badge key={idx} variant="outline" className={cn(badge.color, 'text-xs')}>
                                      <span className="mr-1 text-xs">{badge.icon}</span>
                                      {badge.label}
                                    </Badge>
                                  ))}
                                </div>
                                {customer.email && (
                                  <div className="text-xs text-muted-foreground">
                                    {customer.email}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Select Service/Task */}
          <div className="space-y-2">
            <Label>Select Service/Task</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger data-testid="select-service">
                <SelectValue placeholder="Choose a service or task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookkeeping">Bookkeeping Services</SelectItem>
                <SelectItem value="tax_preparation">Tax Preparation</SelectItem>
                <SelectItem value="tax_compliance">Tax Compliance</SelectItem>
                <SelectItem value="vat_compliance">VAT Compliance</SelectItem>
                <SelectItem value="payroll">Payroll Services</SelectItem>
                <SelectItem value="audit_services">Audit Services</SelectItem>
                <SelectItem value="advisory">Business Advisory</SelectItem>
                <SelectItem value="company_secretarial">Company Secretarial</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="admin">Administrative Tasks</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter a descriptive task name..."
              data-testid="input-task-name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you'll be working on..."
              rows={3}
              data-testid="input-task-description"
            />
          </div>

          {/* Priority and Duration Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Duration */}
            <div className="space-y-2">
              <Label>Estimated Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g., 2"
                  min="0.5"
                  step="0.5"
                  data-testid="input-duration"
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            </div>

            {/* Expected End Time */}
            <div className="space-y-2">
              <Label>Expected End Time</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={expectedEndTime}
                  onChange={(e) => setExpectedEndTime(e.target.value)}
                  data-testid="input-end-time"
                />
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStart} 
            disabled={!taskName.trim() || (taskType === 'client' && !selectedClientId) || !selectedService}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}