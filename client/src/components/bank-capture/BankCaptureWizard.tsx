import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileSpreadsheet, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileUploadStep } from "./steps/FileUploadStep";
import { ColumnMappingStep } from "./steps/ColumnMappingStep";
import { ValidationStep } from "./steps/ValidationStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CommitStep } from "./steps/CommitStep";

interface BankCaptureWizardProps {
  bankAccountId?: number;
  batchId?: number;
  onComplete?: () => void;
}

export function BankCaptureWizard({ bankAccountId, batchId, onComplete }: BankCaptureWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(batchId || null);
  const [wizardData, setWizardData] = useState({
    file: null as File | null,
    columnMapping: {} as Record<string, number>,
    headers: [] as string[],
    validationResults: null as any,
    queueItems: [] as any[]
  });

  // Fetch batch data if batchId provided
  const { data: batchData, isLoading: batchLoading } = useQuery({
    queryKey: ['/api/bank/import-batches', currentBatchId],
    enabled: !!currentBatchId,
    refetchInterval: currentStep < 5 ? 5000 : false, // Refresh every 5s during processing
  });

  // Fetch bank accounts for selection
  const { data: bankAccounts } = useQuery({
    queryKey: ['/api/bank-accounts']
  });

  const steps = [
    { id: 1, title: "File Upload", description: "Select and upload your bank statement file", icon: Upload },
    { id: 2, title: "Column Mapping", description: "Map CSV columns to transaction fields", icon: MapPin },
    { id: 3, title: "Validation", description: "Validate data and check for duplicates", icon: CheckCircle },
    { id: 4, title: "Review", description: "Review and adjust import settings", icon: Eye },
    { id: 5, title: "Import", description: "Import transactions to your account", icon: Download }
  ];

  const handleStepComplete = (stepData: any) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Wizard complete
      onComplete?.();
      toast({
        title: "Import Complete",
        description: "Your bank statement has been successfully imported.",
      });
    }
  };

  const handleBatchCreated = (newBatchId: number) => {
    setCurrentBatchId(newBatchId);
    queryClient.invalidateQueries({ queryKey: ['/api/bank/import-batches'] });
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setCurrentBatchId(null);
    setWizardData({
      file: null,
      columnMapping: {},
      headers: [],
      validationResults: null,
      queueItems: []
    });
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  const progressPercentage = ((currentStep - 1) / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet size={20} />
                Bank Statement Import Wizard
                {currentBatchId && (
                  <Badge variant="outline">
                    Batch #{batchData?.batchNumber}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Follow the steps below to import your bank statement transactions
              </CardDescription>
            </div>
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={resetWizard}>
                <RefreshCw size={16} />
                Start Over
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{currentStep}/5</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                    ${status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' : 
                      status === 'current' ? 'bg-blue-100 border-blue-500 text-blue-700' : 
                      'bg-gray-100 border-gray-300 text-gray-500'}
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${
                      status === 'current' ? 'text-blue-700' : 
                      status === 'completed' ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      absolute w-20 h-px top-5 left-1/2 transform -translate-x-1/2
                      ${status === 'completed' ? 'bg-green-300' : 'bg-gray-300'}
                    `} style={{ left: `${((index + 1) * 100) / steps.length}%` }} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <FileUploadStep
            bankAccountId={bankAccountId}
            onComplete={handleStepComplete}
            onBatchCreated={handleBatchCreated}
          />
        )}

        {currentStep === 2 && currentBatchId && (
          <ColumnMappingStep
            batchId={currentBatchId}
            file={wizardData.file}
            onComplete={handleStepComplete}
          />
        )}

        {currentStep === 3 && currentBatchId && (
          <ValidationStep
            batchId={currentBatchId}
            onComplete={handleStepComplete}
          />
        )}

        {currentStep === 4 && currentBatchId && (
          <ReviewStep
            batchId={currentBatchId}
            batchData={batchData}
            onComplete={handleStepComplete}
          />
        )}

        {currentStep === 5 && currentBatchId && (
          <CommitStep
            batchId={currentBatchId}
            batchData={batchData}
            onComplete={handleStepComplete}
          />
        )}
      </div>

      {/* Batch Status Card */}
      {currentBatchId && batchData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Import Batch Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{batchData.totalRows || 0}</p>
                <p className="text-xs text-muted-foreground">Total Rows</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{batchData.newRows || 0}</p>
                <p className="text-xs text-muted-foreground">New Transactions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{batchData.duplicateRows || 0}</p>
                <p className="text-xs text-muted-foreground">Duplicates</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{batchData.invalidRows || 0}</p>
                <p className="text-xs text-muted-foreground">Invalid Rows</p>
              </div>
              <div>
                <Badge className={`
                  ${batchData.status === 'completed' ? 'bg-green-100 text-green-800' :
                    batchData.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'}
                `}>
                  {batchData.status?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}