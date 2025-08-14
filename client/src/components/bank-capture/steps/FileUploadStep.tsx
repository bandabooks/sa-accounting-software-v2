import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  X,
  Loader2 
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadStepProps {
  bankAccountId?: number;
  onComplete: (data: any) => void;
  onBatchCreated: (batchId: number) => void;
}

export function FileUploadStep({ bankAccountId, onComplete, onBatchCreated }: FileUploadStepProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<number>(bankAccountId || 0);
  const [dragActive, setDragActive] = useState(false);

  // Fetch bank accounts
  const { data: bankAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/bank-accounts']
  });

  // Create import batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/bank/import-batches', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (batch) => {
      onBatchCreated(batch.id);
      onComplete({ 
        file: selectedFile,
        batchId: batch.id 
      });
      toast({
        title: "Import Batch Created",
        description: "File uploaded successfully. Proceeding to column mapping.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed", 
        description: error.message || "Failed to create import batch",
        variant: "destructive"
      });
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', '.csv', '.ofx', '.qif'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = allowedTypes.includes(file.type) || 
                       ['csv', 'ofx', 'qif', 'txt'].includes(fileExtension || '');

    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV, OFX, or QIF file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (!selectedFile || !selectedBankAccount) {
      toast({
        title: "Missing Information",
        description: "Please select a file and bank account to continue.",
        variant: "destructive"
      });
      return;
    }

    const fileType = selectedFile.name.toLowerCase().split('.').pop() || 'csv';
    
    createBatchMutation.mutate({
      bankAccountId: selectedBankAccount,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} />
            Upload Bank Statement
          </CardTitle>
          <CardDescription>
            Select a CSV, OFX, or QIF file from your bank to begin importing transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bank Account Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bank Account</label>
            <Select 
              value={selectedBankAccount.toString()} 
              onValueChange={(value) => setSelectedBankAccount(parseInt(value))}
              disabled={accountsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts?.map((account: any) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName} - {account.bankName} ({account.accountNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Statement File</label>
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${selectedFile ? 'border-green-500 bg-green-50' : ''}
                hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.ofx,.qif,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileSpreadsheet className="text-green-600" size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-green-800">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Upload className="text-gray-600" size={32} />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your statement file here, or <span className="text-blue-600">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports CSV, OFX, and QIF files up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Format Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Supported file formats:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>CSV:</strong> Comma-separated values from your bank</li>
                <li><strong>OFX:</strong> Open Financial Exchange format</li>
                <li><strong>QIF:</strong> Quicken Interchange Format</li>
              </ul>
              <p className="mt-2">
                The system will automatically detect columns and guide you through mapping them to transaction fields.
              </p>
            </AlertDescription>
          </Alert>

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              disabled={!selectedFile || !selectedBankAccount || createBatchMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {createBatchMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating Batch...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Continue to Column Mapping
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}