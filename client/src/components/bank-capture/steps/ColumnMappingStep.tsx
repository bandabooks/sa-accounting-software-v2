import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, CheckCircle, AlertCircle, Loader2, Eye } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ColumnMappingStepProps {
  batchId: number;
  file: File | null;
  onComplete: (data: any) => void;
}

interface ColumnMapping {
  date?: number;
  description?: number;
  reference?: number;
  debit?: number;
  credit?: number;
  balance?: number;
}

export function ColumnMappingStep({ batchId, file, onComplete }: ColumnMappingStepProps) {
  const { toast } = useToast();
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [showPreview, setShowPreview] = useState(false);

  // Process file mutation
  const processFileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/bank/import-batches/${batchId}/process`, {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process file');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      onComplete({ 
        columnMapping,
        processResult: result 
      });
      toast({
        title: "File Processed",
        description: `Successfully processed ${result.totalRows} rows with ${result.validRows} valid transactions.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed", 
        description: error.message || "Failed to process file",
        variant: "destructive"
      });
    }
  });

  // Parse CSV file to extract headers and sample data
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const parsedHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const parsedSampleRows = lines.slice(1, 6).map(line => 
            line.split(',').map(cell => cell.trim().replace(/"/g, ''))
          );
          
          setHeaders(parsedHeaders);
          setSampleRows(parsedSampleRows);
          
          // Auto-detect common column mappings
          autoDetectColumns(parsedHeaders);
        }
      };
      reader.readAsText(file);
    }
  }, [file]);

  const autoDetectColumns = (headerList: string[]) => {
    const mapping: ColumnMapping = {};
    
    headerList.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      
      // Date column detection
      if (lowerHeader.includes('date') && !mapping.date) {
        mapping.date = index;
      }
      
      // Description column detection
      if ((lowerHeader.includes('description') || lowerHeader.includes('details') || 
           lowerHeader.includes('memo') || lowerHeader.includes('narrative')) && !mapping.description) {
        mapping.description = index;
      }
      
      // Reference column detection
      if ((lowerHeader.includes('reference') || lowerHeader.includes('ref') || 
           lowerHeader.includes('transaction') || lowerHeader.includes('cheque')) && !mapping.reference) {
        mapping.reference = index;
      }
      
      // Debit column detection
      if ((lowerHeader.includes('debit') || lowerHeader.includes('withdrawal') || 
           lowerHeader.includes('out')) && !mapping.debit) {
        mapping.debit = index;
      }
      
      // Credit column detection
      if ((lowerHeader.includes('credit') || lowerHeader.includes('deposit') || 
           lowerHeader.includes('in')) && !mapping.credit) {
        mapping.credit = index;
      }
      
      // Balance column detection
      if (lowerHeader.includes('balance') && !mapping.balance) {
        mapping.balance = index;
      }
    });
    
    setColumnMapping(mapping);
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    const columnIndex = value === 'none' ? undefined : parseInt(value);
    setColumnMapping(prev => ({
      ...prev,
      [field]: columnIndex
    }));
  };

  const handleContinue = () => {
    if (!columnMapping.date || !columnMapping.description) {
      toast({
        title: "Required Mappings Missing",
        description: "Please map at least Date and Description columns to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!columnMapping.debit && !columnMapping.credit) {
      toast({
        title: "Amount Columns Missing",
        description: "Please map at least one amount column (Debit or Credit) to continue.",
        variant: "destructive"
      });
      return;
    }

    // Create form data for file upload
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('columnMapping', JSON.stringify(columnMapping));

    processFileMutation.mutate(formData);
  };

  const getColumnPreview = (columnIndex: number | undefined) => {
    if (columnIndex === undefined) return "Not mapped";
    return sampleRows.map(row => row[columnIndex] || "").join(", ").slice(0, 50) + "...";
  };

  const requiredFields = [
    { key: 'date' as keyof ColumnMapping, label: 'Transaction Date', required: true, description: 'The date when the transaction occurred' },
    { key: 'description' as keyof ColumnMapping, label: 'Description', required: true, description: 'Transaction description or memo' },
    { key: 'reference' as keyof ColumnMapping, label: 'Reference', required: false, description: 'Transaction reference or check number' },
    { key: 'debit' as keyof ColumnMapping, label: 'Debit Amount', required: false, description: 'Outgoing transaction amount' },
    { key: 'credit' as keyof ColumnMapping, label: 'Credit Amount', required: false, description: 'Incoming transaction amount' },
    { key: 'balance' as keyof ColumnMapping, label: 'Running Balance', required: false, description: 'Account balance after transaction' },
  ];

  if (headers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading file data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Column Mapping
          </CardTitle>
          <CardDescription>
            Map your CSV columns to the corresponding transaction fields. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mapping Configuration */}
          <div className="space-y-4">
            {requiredFields.map((field) => (
              <div key={field.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                <div>
                  <label className="font-medium flex items-center gap-2">
                    {field.label}
                    {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </label>
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                </div>
                
                <Select
                  value={columnMapping[field.key]?.toString() || 'none'}
                  onValueChange={(value) => handleMappingChange(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not mapped</SelectItem>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        Column {index + 1}: {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="text-sm">
                  <p className="text-muted-foreground">Preview:</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded">
                    {getColumnPreview(columnMapping[field.key])}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Data Preview Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              {showPreview ? 'Hide' : 'Show'} Data Preview
            </Button>
          </div>

          {/* Sample Data Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Data Preview</CardTitle>
                <CardDescription>First 5 rows from your file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map((header, index) => (
                          <TableHead key={index} className="whitespace-nowrap">
                            {header}
                            {Object.values(columnMapping).includes(index) && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Mapped
                              </Badge>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleRows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="whitespace-nowrap">
                              {cell || <span className="text-muted-foreground italic">empty</span>}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Mapping Guidelines:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Date and Description columns are required for import</li>
                <li>Map either Debit/Credit columns separately, or use a single signed Amount column</li>
                <li>Reference and Balance columns are optional but recommended</li>
                <li>Unmapped columns will be ignored during import</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              disabled={!columnMapping.date || !columnMapping.description || processFileMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {processFileMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Processing File...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Process & Validate Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}