import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export interface JournalLine {
  id?: number;
  accountId: number;
  accountName?: string;
  description?: string;
  debitAmount: string;
  creditAmount: string;
}

export interface JournalEntry {
  id?: number;
  entryNumber: string;
  transactionDate: string;
  description: string;
  reference?: string;
  totalDebit: string;
  totalCredit: string;
  isPosted?: boolean;
  isReversed?: boolean;
  sourceModule?: string;
  lines: JournalLine[];
}

interface ChartAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: string;
}

interface JournalEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry | null;
  chartOfAccounts: ChartAccount[];
  onSave: (entry: JournalEntry) => void;
  isReadOnly?: boolean;
}

export function JournalEditDialog({
  open,
  onOpenChange,
  entry,
  chartOfAccounts,
  onSave,
  isReadOnly = false,
}: JournalEditDialogProps) {
  const [formData, setFormData] = useState<JournalEntry>({
    entryNumber: '',
    transactionDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    reference: '',
    totalDebit: '0.00',
    totalCredit: '0.00',
    lines: [],
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    } else {
      // Reset to defaults for new entry
      setFormData({
        entryNumber: `JE-${Date.now()}`,
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        reference: '',
        totalDebit: '0.00',
        totalCredit: '0.00',
        lines: [
          { accountId: 0, description: '', debitAmount: '0.00', creditAmount: '0.00' },
          { accountId: 0, description: '', debitAmount: '0.00', creditAmount: '0.00' },
        ],
      });
    }
  }, [entry]);

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce(
      (sum, line) => sum + parseFloat(line.debitAmount || '0'),
      0
    );
    const totalCredit = formData.lines.reduce(
      (sum, line) => sum + parseFloat(line.creditAmount || '0'),
      0
    );
    return { totalDebit, totalCredit };
  };

  const validateEntry = () => {
    const errors: string[] = [];
    const { totalDebit, totalCredit } = calculateTotals();

    if (!formData.description) {
      errors.push('Description is required');
    }

    if (!formData.transactionDate) {
      errors.push('Transaction date is required');
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      errors.push(`Entry is not balanced. Debit: ${formatCurrency(totalDebit)}, Credit: ${formatCurrency(totalCredit)}`);
    }

    if (totalDebit === 0 && totalCredit === 0) {
      errors.push('Entry must have at least one debit and one credit');
    }

    formData.lines.forEach((line, index) => {
      if (!line.accountId || line.accountId === 0) {
        errors.push(`Line ${index + 1}: Account is required`);
      }
      if (parseFloat(line.debitAmount || '0') > 0 && parseFloat(line.creditAmount || '0') > 0) {
        errors.push(`Line ${index + 1}: Cannot have both debit and credit amount`);
      }
    });

    setErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (validateEntry()) {
      const { totalDebit, totalCredit } = calculateTotals();
      onSave({
        ...formData,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        lines: formData.lines.filter(
          line => parseFloat(line.debitAmount || '0') > 0 || parseFloat(line.creditAmount || '0') > 0
        ),
      });
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        { accountId: 0, description: '', debitAmount: '0.00', creditAmount: '0.00' },
      ],
    });
  };

  const removeLine = (index: number) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Clear opposite amount when entering debit/credit
    if (field === 'debitAmount' && parseFloat(value) > 0) {
      newLines[index].creditAmount = '0.00';
    } else if (field === 'creditAmount' && parseFloat(value) > 0) {
      newLines[index].debitAmount = '0.00';
    }
    
    setFormData({ ...formData, lines: newLines });
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? 'View' : entry ? 'Edit' : 'Create'} Journal Entry
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? 'Viewing journal entry details'
              : 'Enter the journal entry details. The entry must be balanced (total debits = total credits).'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Header Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryNumber">Entry Number</Label>
              <Input
                id="entryNumber"
                value={formData.entryNumber}
                onChange={(e) => setFormData({ ...formData, entryNumber: e.target.value })}
                disabled={isReadOnly || !!entry}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transactionDate">Transaction Date</Label>
              <Input
                id="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isReadOnly}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Status Badges */}
          {entry && (
            <div className="flex gap-2">
              {entry.isPosted && <Badge variant="default">Posted</Badge>}
              {entry.isReversed && <Badge variant="destructive">Reversed</Badge>}
            </div>
          )}

          {/* Journal Lines */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Journal Lines</Label>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLine}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Line
                </Button>
              )}
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Debit</TableHead>
                    <TableHead className="w-[120px]">Credit</TableHead>
                    {!isReadOnly && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={line.accountId?.toString() || ''}
                          onValueChange={(value) => updateLine(index, 'accountId', parseInt(value))}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {chartOfAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountCode} - {account.accountName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description || ''}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Line description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.debitAmount}
                          onChange={(e) => updateLine(index, 'debitAmount', e.target.value)}
                          disabled={isReadOnly}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.creditAmount}
                          onChange={(e) => updateLine(index, 'creditAmount', e.target.value)}
                          disabled={isReadOnly}
                          className="text-right"
                        />
                      </TableCell>
                      {!isReadOnly && (
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(index)}
                            disabled={formData.lines.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end space-x-4 text-sm">
            <div className={`font-medium ${!isBalanced ? 'text-red-600' : ''}`}>
              Total Debit: {formatCurrency(totalDebit)}
            </div>
            <div className={`font-medium ${!isBalanced ? 'text-red-600' : ''}`}>
              Total Credit: {formatCurrency(totalCredit)}
            </div>
            <div className={`font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {isBalanced ? '✓ Balanced' : `Difference: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`}
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button 
              onClick={handleSave} 
              disabled={!isBalanced || (entry?.isPosted || entry?.isReversed)}
            >
              Save Entry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}