import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  RotateCcw 
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface JournalEntry {
  id: number;
  entryNumber: string;
  transactionDate: string;
  description: string;
  reference?: string;
  totalDebit: string;
  totalCredit: string;
  isPosted: boolean;
  isReversed: boolean;
  sourceModule?: string;
  linesCount?: number;
  lines?: Array<{
    id: number;
    accountId: number;
    accountName?: string;
    description?: string;
    debitAmount: string;
    creditAmount: string;
  }>;
}

interface JournalHistoryTableProps {
  entries: JournalEntry[];
  isLoading: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  onPost: (entry: JournalEntry) => void;
  onReverse: (entry: JournalEntry) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  userRole?: string;
}

export function JournalHistoryTable({
  entries,
  isLoading,
  onEdit,
  onDelete,
  onPost,
  onReverse,
  onLoadMore,
  hasMore = false,
  userRole = 'staff',
}: JournalHistoryTableProps) {
  const [deleteEntry, setDeleteEntry] = useState<JournalEntry | null>(null);
  const canEdit = userRole === 'company_admin' || userRole === 'staff';

  if (isLoading && entries.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!isLoading && entries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No journal entries found for the selected period</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[120px]">Entry #</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Reference</TableHead>
              <TableHead className="w-[100px] text-right">Debit</TableHead>
              <TableHead className="w-[100px] text-right">Credit</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead className="w-[80px]">Source</TableHead>
              {canEdit && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {format(new Date(entry.transactionDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {entry.entryNumber}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {entry.description}
                </TableCell>
                <TableCell className="text-sm">
                  {entry.reference || '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(parseFloat(entry.totalDebit))}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(parseFloat(entry.totalCredit))}
                </TableCell>
                <TableCell>
                  {entry.isReversed ? (
                    <Badge variant="destructive">Reversed</Badge>
                  ) : entry.isPosted ? (
                    <Badge variant="default">Posted</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {entry.sourceModule ? (
                    <Badge variant="outline" className="text-xs">
                      {entry.sourceModule}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(entry)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {!entry.isPosted && !entry.isReversed && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(entry)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPost(entry)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Post Entry
                            </DropdownMenuItem>
                          </>
                        )}
                        {entry.isPosted && !entry.isReversed && (
                          <DropdownMenuItem onClick={() => onReverse(entry)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reverse Entry
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {!entry.isPosted && !entry.isReversed && (
                          <DropdownMenuItem 
                            onClick={() => setDeleteEntry(entry)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteEntry} onOpenChange={() => setDeleteEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete journal entry {deleteEntry?.entryNumber}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteEntry) {
                  onDelete(deleteEntry);
                  setDeleteEntry(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}