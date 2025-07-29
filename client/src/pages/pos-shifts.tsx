import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, Play, Square, DollarSign, Calculator, 
  TrendingUp, AlertCircle, CheckCircle, User
} from "lucide-react";

export default function POSShiftsPage() {
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [openingCash, setOpeningCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);
  const [notes, setNotes] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch shifts data
  const { data: shifts = [] } = useQuery<any[]>({
    queryKey: ['/api/pos/shifts'],
  });

  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/me'],
  });

  const currentShift = shifts.find(shift => shift.status === 'open');
  const previousShifts = shifts.filter(shift => shift.status === 'closed').slice(0, 10);

  // Open shift mutation
  const openShiftMutation = useMutation({
    mutationFn: async () => {
      const shiftData = {
        openingCash: openingCash,
        startTime: new Date().toISOString(),
        status: 'open',
        notes: notes
      };
      const response = await apiRequest('/api/pos/shifts', 'POST', shiftData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Shift Opened",
        description: `New shift started with R ${openingCash.toFixed(2)} opening cash`,
      });
      setShowOpenShiftModal(false);
      setOpeningCash(0);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/pos/shifts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open shift",
        variant: "destructive",
      });
    },
  });

  // Close shift mutation
  const closeShiftMutation = useMutation({
    mutationFn: async () => {
      if (!selectedShift) throw new Error('No shift selected');
      
      const closeData = {
        closingCash: closingCash,
        notes: notes
      };
      const response = await apiRequest(`/api/pos/shifts/${selectedShift.id}/close`, 'PUT', closeData);
      return response;
    },
    onSuccess: (data: any) => {
      const variance = data?.cashVariance || 0;
      toast({
        title: "Shift Closed",
        description: `Shift closed with ${variance >= 0 ? 'surplus' : 'shortage'} of R ${Math.abs(variance).toFixed(2)}`,
      });
      setShowCloseShiftModal(false);
      setSelectedShift(null);
      setClosingCash(0);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/pos/shifts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close shift",
        variant: "destructive",
      });
    },
  });

  const handleOpenShift = () => {
    if (currentShift) {
      toast({
        title: "Active Shift",
        description: "Please close the current shift before opening a new one",
        variant: "destructive",
      });
      return;
    }
    setShowOpenShiftModal(true);
  };

  const handleCloseShift = (shift: any) => {
    setSelectedShift(shift);
    setShowCloseShiftModal(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600 mt-1">Manage POS shifts and cash handling</p>
        </div>
        <div className="flex items-center space-x-4">
          {currentShift ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Clock className="h-3 w-3 mr-1" />
              Shift Active - {formatDuration(currentShift.startTime)}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <Square className="h-3 w-3 mr-1" />
              No Active Shift
            </Badge>
          )}
          <Button 
            onClick={handleOpenShift}
            disabled={!!currentShift || openShiftMutation.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            {openShiftMutation.isPending ? 'Opening...' : 'Open Shift'}
          </Button>
        </div>
      </div>

      {/* Current Shift */}
      {currentShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Current Shift
              </div>
              <Button
                variant="destructive"
                onClick={() => handleCloseShift(currentShift)}
                disabled={closeShiftMutation.isPending}
              >
                <Square className="h-4 w-4 mr-2" />
                {closeShiftMutation.isPending ? 'Closing...' : 'Close Shift'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Started</div>
                <div className="font-medium">{formatDateTime(currentShift.startTime)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="font-medium">{formatDuration(currentShift.startTime)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Opening Cash</div>
                <div className="font-medium">R {(currentShift.openingCash || 0).toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Operator</div>
                <div className="font-medium flex items-center justify-center">
                  <User className="h-4 w-4 mr-1" />
                  {currentUser?.username || 'Unknown'}
                </div>
              </div>
            </div>
            {currentShift.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Notes:</div>
                <div className="text-sm">{currentShift.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {previousShifts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No previous shifts</p>
              <p className="text-sm">Open your first shift to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {previousShifts.map((shift) => (
                <div key={shift.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Shift #{shift.id}</span>
                      <Badge variant="outline" className="bg-gray-50">
                        {formatDuration(shift.startTime, shift.endTime)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(shift.startTime)} - {shift.endTime ? formatDateTime(shift.endTime) : 'Open'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Opening</div>
                      <div className="font-medium">R {(shift.openingCash || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Closing</div>
                      <div className="font-medium">R {(shift.closingCash || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Expected</div>
                      <div className="font-medium">R {(shift.expectedCash || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Variance</div>
                      <div className={`font-medium ${
                        (shift.cashVariance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(shift.cashVariance || 0) >= 0 ? '+' : ''}R {(shift.cashVariance || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Sales</div>
                      <div className="font-medium">R {(shift.totalSales || 0).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {shift.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-600">Notes: </span>
                      {shift.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Shift Modal */}
      <Dialog open={showOpenShiftModal} onOpenChange={setShowOpenShiftModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Open New Shift
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openingCash">Opening Cash Amount</Label>
              <Input
                id="openingCash"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={openingCash.toString()}
                onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any notes about the shift opening..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowOpenShiftModal(false)}
                disabled={openShiftMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => openShiftMutation.mutate()}
                disabled={openShiftMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                {openShiftMutation.isPending ? 'Opening...' : 'Open Shift'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Shift Modal */}
      <Dialog open={showCloseShiftModal} onOpenChange={setShowCloseShiftModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Square className="h-5 w-5 mr-2" />
              Close Shift
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedShift && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Shift Duration</div>
                <div className="font-medium">{formatDuration(selectedShift.startTime)}</div>
                <div className="text-sm text-gray-600 mt-2">Opening Cash</div>
                <div className="font-medium">R {(selectedShift.openingCash || 0).toFixed(2)}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="closingCash">Actual Cash in Drawer</Label>
              <Input
                id="closingCash"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={closingCash.toString()}
                onChange={(e) => setClosingCash(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closeNotes">Closing Notes (Optional)</Label>
              <Textarea
                id="closeNotes"
                placeholder="Any notes about the shift closing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCloseShiftModal(false)}
                disabled={closeShiftMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => closeShiftMutation.mutate()}
                disabled={closeShiftMutation.isPending}
              >
                <Square className="h-4 w-4 mr-2" />
                {closeShiftMutation.isPending ? 'Closing...' : 'Close Shift'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}