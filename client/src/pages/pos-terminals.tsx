import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { 
  Terminal, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Monitor,
  Wifi,
  WifiOff,
  Home,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface PosTerminal {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  ipAddress?: string;
  macAddress?: string;
  currentShiftId?: number;
  lastActivity?: string;
  printerName?: string;
  cashDrawerPort?: string;
  barcodeScanner?: boolean;
  customerDisplay?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface TerminalFormData {
  name: string;
  location: string;
  status: 'active' | 'inactive';
  ipAddress: string;
  macAddress: string;
  printerName: string;
  cashDrawerPort: string;
  barcodeScanner: boolean;
  customerDisplay: boolean;
  notes: string;
}

export default function POSTerminals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<PosTerminal | null>(null);
  const [formData, setFormData] = useState<TerminalFormData>({
    name: '',
    location: '',
    status: 'active',
    ipAddress: '',
    macAddress: '',
    printerName: '',
    cashDrawerPort: '',
    barcodeScanner: false,
    customerDisplay: false,
    notes: ''
  });

  // Data Queries
  const { data: terminals = [], isLoading, error: terminalsError } = useQuery<PosTerminal[]>({
    queryKey: ['/api/pos/terminals'],
    retry: 1,
  });

  // Error state
  if (terminalsError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">POS Terminals Error</h2>
            <p className="text-gray-600">
              There was an issue loading the POS terminals. Please refresh the page or contact support.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/pos-dashboard'} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to POS Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading POS Terminals</h2>
            <p className="text-gray-600">
              Loading terminal configurations and hardware settings...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mutations
  const createTerminalMutation = useMutation({
    mutationFn: async (terminalData: TerminalFormData) => {
      return apiRequest('/api/pos/terminals', 'POST', terminalData);
    },
    onSuccess: () => {
      toast({
        title: "Terminal Created",
        description: "POS terminal has been successfully created",
      });
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/terminals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Terminal",
        description: error.message || "Could not create terminal",
        variant: "destructive",
      });
    }
  });

  const updateTerminalMutation = useMutation({
    mutationFn: async (data: { id: number; terminalData: Partial<TerminalFormData> }) => {
      return apiRequest(`/api/pos/terminals/${data.id}`, 'PUT', data.terminalData);
    },
    onSuccess: () => {
      toast({
        title: "Terminal Updated",
        description: "POS terminal has been successfully updated",
      });
      setShowEditDialog(false);
      setSelectedTerminal(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/pos/terminals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Terminal",
        description: error.message || "Could not update terminal",
        variant: "destructive",
      });
    }
  });

  const deleteTerminalMutation = useMutation({
    mutationFn: async (terminalId: number) => {
      return apiRequest(`/api/pos/terminals/${terminalId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Terminal Deleted",
        description: "POS terminal has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/terminals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Terminal",
        description: error.message || "Could not delete terminal",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      status: 'active',
      ipAddress: '',
      macAddress: '',
      printerName: '',
      cashDrawerPort: '',
      barcodeScanner: false,
      customerDisplay: false,
      notes: ''
    });
  };

  const handleEdit = (terminal: PosTerminal) => {
    setSelectedTerminal(terminal);
    setFormData({
      name: terminal.name,
      location: terminal.location,
      status: terminal.status,
      ipAddress: terminal.ipAddress || '',
      macAddress: terminal.macAddress || '',
      printerName: terminal.printerName || '',
      cashDrawerPort: terminal.cashDrawerPort || '',
      barcodeScanner: terminal.barcodeScanner || false,
      customerDisplay: terminal.customerDisplay || false,
      notes: terminal.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleCreate = () => {
    createTerminalMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedTerminal) {
      updateTerminalMutation.mutate({
        id: selectedTerminal.id,
        terminalData: formData
      });
    }
  };

  const handleDelete = (terminal: PosTerminal) => {
    if (terminal.currentShiftId) {
      toast({
        title: "Cannot Delete Terminal",
        description: "Terminal has an active shift. Please close the shift first.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${terminal.name}"? This action cannot be undone.`)) {
      deleteTerminalMutation.mutate(terminal.id);
    }
  };

  const getStatusIcon = (terminal: PosTerminal) => {
    if (terminal.currentShiftId) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (terminal.status === 'active') {
      return <Monitor className="h-4 w-4 text-blue-600" />;
    }
    return <XCircle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (terminal: PosTerminal) => {
    if (terminal.currentShiftId) return 'In Use';
    if (terminal.status === 'active') return 'Ready';
    return 'Inactive';
  };

  const getStatusColor = (terminal: PosTerminal) => {
    if (terminal.currentShiftId) return 'bg-green-100 text-green-800';
    if (terminal.status === 'active') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">POS Terminals</h1>
          <p className="text-muted-foreground">Manage your point-of-sale terminals and hardware</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Terminal
          </Button>
        </div>
      </div>

      {/* Terminal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{terminals.length}</div>
                <div className="text-sm text-muted-foreground">Total Terminals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {terminals.filter((t: PosTerminal) => t.currentShiftId).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Shifts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {terminals.filter((t: PosTerminal) => t.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-gray-600" />
              <div>
                <div className="text-2xl font-bold">
                  {terminals.filter((t: PosTerminal) => t.status === 'inactive').length}
                </div>
                <div className="text-sm text-muted-foreground">Inactive</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terminals Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Terminal List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading terminals...</div>
          ) : terminals.length === 0 ? (
            <div className="text-center py-8">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No terminals configured</p>
              <p className="text-sm text-muted-foreground">Add your first POS terminal to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {terminals.map((terminal: PosTerminal) => (
                <Card key={terminal.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(terminal)}
                        <span className="font-semibold">{terminal.name}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(terminal)}>
                        {getStatusText(terminal)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{terminal.location}</span>
                      </div>
                      
                      {terminal.ipAddress && (
                        <div className="flex items-center space-x-2">
                          <Wifi className="h-3 w-3 text-muted-foreground" />
                          <span>{terminal.ipAddress}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {terminal.barcodeScanner && (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Scanner</span>
                          </span>
                        )}
                        {terminal.customerDisplay && (
                          <span className="flex items-center space-x-1">
                            <Monitor className="h-3 w-3" />
                            <span>Display</span>
                          </span>
                        )}
                        {terminal.printerName && (
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Printer</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      {terminal.currentShiftId ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.location.href = `/pos/terminal?terminalId=${terminal.id}`}
                        >
                          <Terminal className="h-3 w-3 mr-1" />
                          Use POS
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.location.href = `/pos/shifts?terminalId=${terminal.id}`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Start Shift
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(terminal)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(terminal)}
                        disabled={!!terminal.currentShiftId}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Terminal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New POS Terminal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Terminal Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Counter, Till 1"
                />
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Front Store, Checkout Area"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>IP Address</Label>
                <Input
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label>MAC Address</Label>
                <Input
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  placeholder="AA:BB:CC:DD:EE:FF"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Printer Name</Label>
                <Input
                  value={formData.printerName}
                  onChange={(e) => setFormData({ ...formData, printerName: e.target.value })}
                  placeholder="Receipt Printer"
                />
              </div>
              <div>
                <Label>Cash Drawer Port</Label>
                <Input
                  value={formData.cashDrawerPort}
                  onChange={(e) => setFormData({ ...formData, cashDrawerPort: e.target.value })}
                  placeholder="COM1 or USB"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.barcodeScanner}
                  onCheckedChange={(checked) => setFormData({ ...formData, barcodeScanner: checked })}
                />
                <Label>Barcode Scanner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.customerDisplay}
                  onCheckedChange={(checked) => setFormData({ ...formData, customerDisplay: checked })}
                />
                <Label>Customer Display</Label>
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this terminal..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={createTerminalMutation.isPending || !formData.name || !formData.location}
            >
              Create Terminal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Terminal Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit POS Terminal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Terminal Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Counter, Till 1"
                />
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Front Store, Checkout Area"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>IP Address</Label>
                <Input
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label>MAC Address</Label>
                <Input
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  placeholder="AA:BB:CC:DD:EE:FF"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Printer Name</Label>
                <Input
                  value={formData.printerName}
                  onChange={(e) => setFormData({ ...formData, printerName: e.target.value })}
                  placeholder="Receipt Printer"
                />
              </div>
              <div>
                <Label>Cash Drawer Port</Label>
                <Input
                  value={formData.cashDrawerPort}
                  onChange={(e) => setFormData({ ...formData, cashDrawerPort: e.target.value })}
                  placeholder="COM1 or USB"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.barcodeScanner}
                  onCheckedChange={(checked) => setFormData({ ...formData, barcodeScanner: checked })}
                />
                <Label>Barcode Scanner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.customerDisplay}
                  onCheckedChange={(checked) => setFormData({ ...formData, customerDisplay: checked })}
                />
                <Label>Customer Display</Label>
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this terminal..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateTerminalMutation.isPending || !formData.name || !formData.location}
            >
              Update Terminal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}