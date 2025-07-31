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
  Clock, 
  DollarSign, 
  Calendar, 
  User, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Receipt,
  FileText,
  Lock,
  Unlock,
  Home
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';

interface PosShift {
  id: number;
  terminalId: number;
  userId: number;
  userName?: string;
  terminalName?: string;
  status: 'open' | 'closed';
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  cashVariance?: number;
  salesCount: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalOther: number;
  startTime: string;
  endTime?: string;
  notes?: string;
  closingNotes?: string;
}

interface Terminal {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  currentShiftId?: number;
}

export default function POSShifts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTerminal, setSelectedTerminal] = useState<number | null>(null);
  const [showOpenShiftDialog, setShowOpenShiftDialog] = useState(false);
  const [showCloseShiftDialog, setShowCloseShiftDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<PosShift | null>(null);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  // Data Queries
  const { data: terminals = [] } = useQuery({
    queryKey: ['/api/pos/terminals'],
    queryFn: async () => {
      const response = await fetch('/api/pos/terminals');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['/api/pos/shifts'],
    queryFn: async () => {
      const response = await fetch('/api/pos/shifts');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: currentShifts = [] } = useQuery({
    queryKey: ['/api/pos/current-shifts'],
    queryFn: async () => {
      const response = await fetch('/api/pos/shifts?status=open');
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutations
  const openShiftMutation = useMutation({
    mutationFn: async (shiftData: any) => {
      return apiRequest('/api/pos/shifts', 'POST', shiftData);
    },
    onSuccess: () => {
      toast({
        title: "Shift Opened",
        description: "Your shift has been successfully opened",
      });
      setShowOpenShiftDialog(false);
      setOpeningCash('');
      queryClient.invalidateQueries({ queryKey: ['/api/pos/shifts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/current-shifts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Open Shift",
        description: error.message || "Could not open shift",
        variant: "destructive",
      });
    }
  });

  const closeShiftMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/pos/shifts/${data.shiftId}/close`, 'POST', {
        closingCash: data.closingCash,
        notes: data.notes
      });
    },
    onSuccess: () => {
      toast({
        title: "Shift Closed",
        description: "Your shift has been successfully closed",
      });
      setShowCloseShiftDialog(false);
      setClosingCash('');
      setClosingNotes('');
      setSelectedShift(null);
      queryClient.invalidateQueries({ queryKey: ['/api/pos/shifts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pos/current-shifts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Close Shift",
        description: error.message || "Could not close shift",
        variant: "destructive",
      });
    }
  });

  const handleOpenShift = () => {
    if (!selectedTerminal || !openingCash) {
      toast({
        title: "Missing Information",
        description: "Please select a terminal and enter opening cash amount",
        variant: "destructive",
      });
      return;
    }

    openShiftMutation.mutate({
      terminalId: selectedTerminal,
      openingCash: parseFloat(openingCash)
    });
  };

  const handleCloseShift = () => {
    if (!selectedShift || !closingCash) {
      toast({
        title: "Missing Information",
        description: "Please enter the closing cash amount",
        variant: "destructive",
      });
      return;
    }

    closeShiftMutation.mutate({
      shiftId: selectedShift.id,
      closingCash: parseFloat(closingCash),
      notes: closingNotes
    });
  };

  const calculateExpectedCash = (shift: PosShift): number => {
    return shift.openingCash + shift.totalCash;
  };

  const calculateVariance = (shift: PosShift): number => {
    if (!shift.closingCash) return 0;
    return shift.closingCash - calculateExpectedCash(shift);
  };

  const getVarianceColor = (variance: number): string => {
    if (variance === 0) return 'text-green-600';
    if (Math.abs(variance) <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const availableTerminals = terminals.filter((terminal: Terminal) => 
    !currentShifts.some((shift: PosShift) => shift.terminalId === terminal.id)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">POS Shift Management</h1>
          <p className="text-muted-foreground">Manage terminal shifts and cash handling</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button onClick={() => setShowOpenShiftDialog(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Open Shift
          </Button>
        </div>
      </div>

      {/* Current Active Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>Active Shifts ({currentShifts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentShifts.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No active shifts</p>
              <p className="text-sm text-muted-foreground">Open a shift to start using the POS terminal</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentShifts.map((shift: PosShift) => (
                <Card key={shift.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Terminal className="h-4 w-4" />
                        <span className="font-semibold">
                          {shift.terminalName || `Terminal #${shift.terminalId}`}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Open
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cashier:</span>
                        <span>{shift.userName || 'Current User'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Started:</span>
                        <span>{format(new Date(shift.startTime), 'HH:mm')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Opening Cash:</span>
                        <span>R{shift.openingCash.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales Count:</span>
                        <span>{shift.salesCount}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total Sales:</span>
                        <span>R{shift.totalSales.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.location.href = `/pos/terminal?terminalId=${shift.terminalId}`}
                      >
                        <Terminal className="h-3 w-3 mr-1" />
                        Use POS
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedShift(shift);
                          setShowCloseShiftDialog(true);
                        }}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Shifts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {shifts.filter((shift: PosShift) => shift.status === 'closed').map((shift: PosShift) => (
                <div key={shift.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Terminal className="h-4 w-4" />
                        <span className="font-semibold">
                          {shift.terminalName || `Terminal #${shift.terminalId}`}
                        </span>
                      </div>
                      <Badge variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Closed
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(shift.startTime), 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Cashier</div>
                      <div className="font-medium">{shift.userName || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Duration</div>
                      <div className="font-medium">
                        {shift.endTime && format(new Date(shift.endTime), 'HH:mm')} - {format(new Date(shift.startTime), 'HH:mm')}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sales</div>
                      <div className="font-medium">{shift.salesCount} transactions</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-medium">R{shift.totalSales.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Opening Cash</div>
                        <div>R{shift.openingCash.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cash Sales</div>
                        <div>R{shift.totalCash.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected Cash</div>
                        <div>R{calculateExpectedCash(shift).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Actual Cash</div>
                        <div>R{(shift.closingCash || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Variance</div>
                        <div className={getVarianceColor(calculateVariance(shift))}>
                          R{calculateVariance(shift).toFixed(2)}
                          {calculateVariance(shift) !== 0 && (
                            <AlertTriangle className="h-3 w-3 inline ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {shift.closingNotes && (
                      <div className="mt-3 text-sm">
                        <div className="text-muted-foreground">Notes:</div>
                        <div className="bg-gray-50 p-2 rounded text-xs">{shift.closingNotes}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Shift Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{currentShifts.length}</div>
                <div className="text-sm text-muted-foreground">Active Shifts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  R{currentShifts.reduce((sum: number, shift: PosShift) => sum + shift.totalSales, 0).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Today's Sales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {currentShifts.reduce((sum: number, shift: PosShift) => sum + shift.salesCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  R{currentShifts.length > 0 ? (currentShifts.reduce((sum: number, shift: PosShift) => sum + shift.totalSales, 0) / currentShifts.reduce((sum: number, shift: PosShift) => sum + shift.salesCount, 1)).toFixed(0) : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Transaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Shift Dialog */}
      <Dialog open={showOpenShiftDialog} onOpenChange={setShowOpenShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open New Shift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Terminal</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={selectedTerminal || ''}
                onChange={(e) => setSelectedTerminal(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Choose a terminal...</option>
                {availableTerminals.map((terminal: Terminal) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name} - {terminal.location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Opening Cash Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Count the cash in the till before starting your shift
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenShiftDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOpenShift}
              disabled={openShiftMutation.isPending}
            >
              <Unlock className="h-4 w-4 mr-2" />
              Open Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={showCloseShiftDialog} onOpenChange={setShowCloseShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Shift - {selectedShift?.terminalName || `Terminal #${selectedShift?.terminalId}`}</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Opening Cash:</span>
                  <span>R{selectedShift.openingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span>R{selectedShift.totalCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Card Sales:</span>
                  <span>R{selectedShift.totalCard.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Payments:</span>
                  <span>R{selectedShift.totalOther.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Expected Cash:</span>
                  <span>R{calculateExpectedCash(selectedShift).toFixed(2)}</span>
                </div>
              </div>
              
              <div>
                <Label>Actual Cash in Till</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  placeholder="0.00"
                />
                {closingCash && (
                  <p className={`text-sm mt-1 ${getVarianceColor(parseFloat(closingCash) - calculateExpectedCash(selectedShift))}`}>
                    Variance: R{(parseFloat(closingCash) - calculateExpectedCash(selectedShift)).toFixed(2)}
                  </p>
                )}
              </div>
              
              <div>
                <Label>Closing Notes (Optional)</Label>
                <Textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Any issues, discrepancies, or notes about this shift..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseShiftDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCloseShift}
              disabled={closeShiftMutation.isPending}
            >
              <Lock className="h-4 w-4 mr-2" />
              Close Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}