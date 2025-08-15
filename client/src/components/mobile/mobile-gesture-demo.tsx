import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwipeableCard, commonSwipeActions } from './swipeable-card';
import { PullToRefresh } from './pull-to-refresh';
import { BottomSheet } from './bottom-sheet';
import { MobileTableView } from './mobile-table-view';
import { FloatingActionButton } from './floating-action-button';
import { ResponsiveCard } from './responsive-card';
import { 
  Smartphone, Hand as Touch, Move as Gesture, ArrowLeft, ArrowRight, 
  ArrowUp, ArrowDown, RotateCcw, Plus, Trash2, Edit, Archive,
  RefreshCw, Settings, Info
} from 'lucide-react';

export const MobileGestureDemo: React.FC = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [demoData, setDemoData] = useState([
    { id: 1, name: 'Sample Invoice #001', amount: 'R 1,500.00', status: 'Paid', date: '2024-08-15' },
    { id: 2, name: 'Sample Invoice #002', amount: 'R 2,350.00', status: 'Pending', date: '2024-08-14' },
    { id: 3, name: 'Sample Invoice #003', amount: 'R 875.00', status: 'Draft', date: '2024-08-13' },
  ]);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshCount(prev => prev + 1);
  };

  const handleDelete = (id: number) => {
    setDemoData(prev => prev.filter(item => item.id !== id));
  };

  const handleEdit = (id: number) => {
    console.log('Edit item:', id);
  };

  const handleArchive = (id: number) => {
    console.log('Archive item:', id);
  };

  const tableColumns = [
    { key: 'name', label: 'Invoice', primary: true },
    { key: 'amount', label: 'Amount', secondary: true },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' },
  ];

  const tableActions = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: any) => handleEdit(row.id),
      color: 'blue' as const
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: any) => handleDelete(row.id),
      color: 'red' as const
    }
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6 p-4">
        {/* Header */}
        <ResponsiveCard title="Mobile Gesture Demo" compact>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This demo showcases the mobile-responsive design with gesture controls implemented for the Taxnify platform.
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Touch Optimized
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Touch className="h-3 w-3" />
                Gesture Controls
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Gesture className="h-3 w-3" />
                Swipe Actions
              </Badge>
            </div>
          </div>
        </ResponsiveCard>

        {/* Pull to Refresh Demo */}
        <ResponsiveCard title="Pull to Refresh" compact>
          <div className="text-center space-y-3">
            <div className="text-sm text-gray-600">
              Pull down from the top to refresh data
            </div>
            <div className="flex items-center justify-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Refreshed {refreshCount} times</span>
            </div>
            <div className="text-xs text-gray-500">
              <ArrowDown className="h-4 w-4 inline mr-1" />
              Try pulling down on this page
            </div>
          </div>
        </ResponsiveCard>

        {/* Swipeable Cards Demo */}
        <ResponsiveCard title="Swipeable Cards" compact>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Swipe left on any card below to reveal actions:
            </div>
            
            {/* Demo Cards */}
            <SwipeableCard
              actions={[
                commonSwipeActions.edit(() => console.log('Edit invoice')),
                commonSwipeActions.archive(() => console.log('Archive invoice')),
                commonSwipeActions.delete(() => console.log('Delete invoice'))
              ]}
              className="mobile-table-card"
            >
              <div className="card-header">
                <div>
                  <div className="font-medium text-gray-900">Invoice #INV-001</div>
                  <div className="text-sm text-gray-600">R 2,500.00</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              </div>
              <div className="card-content">
                <div className="text-xs text-gray-500">Customer: ABC Company</div>
                <div className="text-xs text-gray-500">Due: Aug 15, 2024</div>
              </div>
            </SwipeableCard>

            <SwipeableCard
              actions={[
                commonSwipeActions.edit(() => console.log('Edit estimate')),
                commonSwipeActions.delete(() => console.log('Delete estimate'))
              ]}
              className="mobile-table-card"
            >
              <div className="card-header">
                <div>
                  <div className="font-medium text-gray-900">Estimate #EST-002</div>
                  <div className="text-sm text-gray-600">R 1,750.00</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
              <div className="card-content">
                <div className="text-xs text-gray-500">Customer: XYZ Corp</div>
                <div className="text-xs text-gray-500">Created: Aug 12, 2024</div>
              </div>
            </SwipeableCard>

            <div className="text-center">
              <div className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-full">
                <ArrowLeft className="h-3 w-3" />
                Swipe left to reveal actions
              </div>
            </div>
          </div>
        </ResponsiveCard>

        {/* Mobile Table View Demo */}
        <ResponsiveCard title="Mobile Table View" compact>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Traditional tables are replaced with card-based layouts on mobile, with swipe actions for quick operations:
            </div>
            
            <MobileTableView
              data={demoData}
              columns={tableColumns}
              actions={tableActions}
              onRowClick={(row) => console.log('Clicked row:', row)}
              enableSwipeActions={true}
            />
          </div>
        </ResponsiveCard>

        {/* Bottom Sheet Demo */}
        <ResponsiveCard title="Bottom Sheet Modal" compact>
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              Native-like bottom sheet modals for mobile interactions
            </div>
            <Button onClick={() => setIsBottomSheetOpen(true)} className="w-full">
              Open Bottom Sheet
            </Button>
          </div>
        </ResponsiveCard>

        {/* Gesture Guide */}
        <ResponsiveCard title="Gesture Guide" compact>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Swipe Left</div>
                <div className="text-xs text-gray-600">Show actions</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <ArrowRight className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Swipe Right</div>
                <div className="text-xs text-gray-600">Hide actions</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <ArrowDown className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium">Pull Down</div>
                <div className="text-xs text-gray-600">Refresh data</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Touch className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium">Long Press</div>
                <div className="text-xs text-gray-600">Context menu</div>
              </div>
            </div>
          </div>
        </ResponsiveCard>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={() => console.log('FAB clicked')}
          label="Add New"
          extended={true}
          className="animate-bounce"
        />

        {/* Bottom Sheet */}
        <BottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          title="Mobile Settings"
          snapPoints={[0.4, 0.7, 0.9]}
          initialSnap={0}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-medium">Touch Controls</div>
                <div className="text-sm text-gray-600">Optimized for mobile use</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Gesture className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium">Gesture Support</div>
                <div className="text-sm text-gray-600">Swipe, pull, and tap interactions</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Smartphone className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium">Responsive Design</div>
                <div className="text-sm text-gray-600">Adapts to any screen size</div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button onClick={() => setIsBottomSheetOpen(false)} className="w-full">
                Close Bottom Sheet
              </Button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </PullToRefresh>
  );
};

export default MobileGestureDemo;