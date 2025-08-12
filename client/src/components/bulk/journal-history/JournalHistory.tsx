import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay, format } from 'date-fns';
import { JournalHistoryFilters } from './JournalHistoryFilters';
import { JournalHistoryTable } from './JournalHistoryTable';
import { JournalEditDialog, type JournalEntry as EditDialogJournalEntry } from './JournalEditDialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { History } from 'lucide-react';

interface ChartAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: string;
}

// Use the same type for consistency
type JournalEntry = EditDialogJournalEntry & {
  id: number; // Make id required for fetched entries
};

interface JournalHistoryProps {
  companyId?: number;
  userRole?: string;
}

export function JournalHistory({ companyId, userRole = 'staff' }: JournalHistoryProps = {}) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chart of accounts
  const { data: chartOfAccounts = [] } = useQuery<ChartAccount[]>({
    queryKey: ['/api/chart-of-accounts'],
  });

  // Build query params for journal entries
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (dateRange?.from) {
      params.append('from', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      params.append('to', format(dateRange.to, 'yyyy-MM-dd'));
    }
    params.append('page', page.toString());
    params.append('limit', '20');
    params.append('sourceModule', 'bulk-expense,bulk-income');
    return params.toString();
  };

  // Fetch journal entries
  const { data: entriesData, isLoading, refetch } = useQuery({
    queryKey: ['/api/journal-entries', dateRange, page],
    queryFn: async () => {
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/journal-entries?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      return response.json();
    },
    enabled: !!dateRange,
  });

  const entries = Array.isArray(entriesData) ? entriesData : entriesData?.entries || [];
  const hasMore = entriesData?.hasMore || false;

  // Update journal entry mutation
  const updateMutation = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      return await apiRequest(`/api/journal-entries/${entry.id}`, 'PUT', entry);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Journal entry updated successfully',
        variant: 'success' as any,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update journal entry',
        variant: 'destructive',
      });
    },
  });

  // Delete journal entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      return await apiRequest(`/api/journal-entries/${entry.id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Journal entry deleted successfully',
        variant: 'success' as any,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete journal entry',
        variant: 'destructive',
      });
    },
  });

  // Post journal entry mutation
  const postMutation = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      return await apiRequest(`/api/journal-entries/${entry.id}/post`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Journal entry posted successfully',
        variant: 'success' as any,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post journal entry',
        variant: 'destructive',
      });
    },
  });

  // Reverse journal entry mutation
  const reverseMutation = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      return await apiRequest(`/api/journal-entries/${entry.id}/reverse`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Journal entry reversed successfully',
        variant: 'success' as any,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reverse journal entry',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = async (entry: JournalEntry) => {
    // Fetch full entry details if needed
    try {
      const response = await fetch(`/api/journal-entries/${entry.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const fullEntry = await response.json();
        setSelectedEntry(fullEntry);
        setIsReadOnly(entry.isPosted || entry.isReversed || userRole === 'reader');
        setIsEditDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching entry details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch entry details',
        variant: 'destructive',
      });
    }
  };

  const handleSave = (entry: EditDialogJournalEntry) => {
    if (entry.id) {
      updateMutation.mutate(entry as JournalEntry);
    } else {
      // For new entries, use the existing create endpoint
      apiRequest('/api/journal-entries', 'POST', {
        entry: {
          entryNumber: entry.entryNumber,
          transactionDate: entry.transactionDate,
          description: entry.description,
          reference: entry.reference,
          totalDebit: entry.totalDebit,
          totalCredit: entry.totalCredit,
          sourceModule: 'bulk-capture',
        },
        lines: entry.lines,
      }).then(() => {
        toast({
          title: 'Success',
          description: 'Journal entry created successfully',
          variant: 'success' as any,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
        setIsEditDialogOpen(false);
      }).catch((error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create journal entry',
          variant: 'destructive',
        });
      });
    }
  };

  const handlePresetSelect = (preset: string) => {
    // Preset changes are handled in the filter component
    setPage(1); // Reset to first page when changing date range
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Today's Journal Entries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <JournalHistoryFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onPresetSelect={handlePresetSelect}
        />

        <JournalHistoryTable
          entries={entries}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={(entry) => deleteMutation.mutate(entry)}
          onPost={(entry) => postMutation.mutate(entry)}
          onReverse={(entry) => reverseMutation.mutate(entry)}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          userRole={userRole}
        />

        <JournalEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          entry={selectedEntry}
          chartOfAccounts={chartOfAccounts}
          onSave={handleSave}
          isReadOnly={isReadOnly}
        />
      </CardContent>
    </Card>
  );
}