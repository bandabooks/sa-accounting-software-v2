import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Download, Send, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface VAT201ReturnsProps {
  companyId: number;
}

const VAT201Returns: React.FC<VAT201ReturnsProps> = ({ companyId }) => {
  const [newReturn, setNewReturn] = useState({
    period: '',
    outputVat: '',
    inputVat: '',
    description: ''
  });

  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Create VAT201 mutation
  const createVat201Mutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/vat/vat201/create', 'POST', data),
    onSuccess: () => {
      toast({
        title: "VAT201 Created",
        description: "VAT201 return has been created successfully",
      });
      setIsCreating(false);
      setNewReturn({ period: '', outputVat: '', inputVat: '', description: '' });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Unable to create VAT201 return. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Submit to SARS mutation
  const submitToSarsMutation = useMutation({
    mutationFn: (vat201Id: number) => apiRequest(`/api/vat/vat201/${vat201Id}/submit`, 'POST'),
    onSuccess: (data) => {
      toast({
        title: "Submitted to SARS",
        description: `VAT201 submitted successfully. Reference: ${data.sarsReference}`,
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit to SARS. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateReturn = () => {
    const outputVat = parseFloat(newReturn.outputVat) || 0;
    const inputVat = parseFloat(newReturn.inputVat) || 0;
    
    createVat201Mutation.mutate({
      companyId,
      period: newReturn.period,
      outputVat,
      inputVat,
      description: newReturn.description
    });
  };

  const netVat = (parseFloat(newReturn.outputVat) || 0) - (parseFloat(newReturn.inputVat) || 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">VAT201 Returns Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Professional VAT201 creation, management, and SARS submission</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft Returns</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">1</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New VAT201 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New VAT201 Return
          </CardTitle>
          <CardDescription>
            Create a new VAT201 return for submission to SARS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Start New VAT201 Return
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period">VAT Period</Label>
                  <Input
                    id="period"
                    placeholder="e.g., Jan 2025 - Feb 2025"
                    value={newReturn.period}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, period: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description"
                    value={newReturn.description}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="outputVat">Output VAT (R)</Label>
                  <Input
                    id="outputVat"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newReturn.outputVat}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, outputVat: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="inputVat">Input VAT (R)</Label>
                  <Input
                    id="inputVat"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newReturn.inputVat}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, inputVat: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Net VAT (R)</Label>
                  <div className="h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center">
                    <span className={`font-medium ${netVat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netVat.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateReturn}
                  disabled={!newReturn.period || createVat201Mutation.isPending}
                  className="flex-1"
                >
                  {createVat201Mutation.isPending ? 'Creating...' : 'Create VAT201 Return'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing VAT201 Returns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            VAT201 Returns History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                period: "Nov 2024 - Dec 2024",
                status: "submitted",
                outputVat: 45230.00,
                inputVat: 12850.00,
                netVat: 32380.00,
                submittedDate: "2025-01-25",
                sarsReference: "SARS-REF-202501250001"
              },
              {
                id: 2,
                period: "Sep 2024 - Oct 2024",
                status: "submitted",
                outputVat: 38420.00,
                inputVat: 15670.00,
                netVat: 22750.00,
                submittedDate: "2024-11-25",
                sarsReference: "SARS-REF-202411250001"
              },
              {
                id: 3,
                period: "Jan 2025 - Feb 2025",
                status: "draft",
                outputVat: 52100.00,
                inputVat: 18230.00,
                netVat: 33870.00,
                submittedDate: null,
                sarsReference: null
              }
            ].map((vatReturn) => (
              <div key={vatReturn.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{vatReturn.period}</h3>
                    <p className="text-sm text-gray-600">
                      {vatReturn.submittedDate ? 
                        `Submitted: ${vatReturn.submittedDate}` : 
                        'Not submitted'
                      }
                    </p>
                  </div>
                  <Badge 
                    variant={vatReturn.status === 'submitted' ? 'default' : 'secondary'}
                    className={
                      vatReturn.status === 'submitted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {vatReturn.status === 'submitted' ? 'Submitted' : 'Draft'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">Output VAT</p>
                    <p className="font-medium">R {vatReturn.outputVat.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Input VAT</p>
                    <p className="font-medium">R {vatReturn.inputVat.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Net VAT</p>
                    <p className="font-medium text-green-600">R {vatReturn.netVat.toLocaleString()}</p>
                  </div>
                </div>

                {vatReturn.sarsReference && (
                  <p className="text-xs text-gray-500 mb-3">
                    SARS Reference: {vatReturn.sarsReference}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  
                  {vatReturn.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => submitToSarsMutation.mutate(vatReturn.id)}
                      disabled={submitToSarsMutation.isPending}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Submit to SARS
                    </Button>
                  )}
                  
                  {vatReturn.status === 'submitted' && (
                    <Button size="sm" variant="outline">
                      View SARS Status
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alert */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          VAT201 returns must be submitted to SARS by the 25th of the month following the end of the VAT period. 
          Late submissions may incur penalties and interest charges.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VAT201Returns;