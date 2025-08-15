import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SwipeableCard, commonSwipeActions } from './swipeable-card';

interface MobileTableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
}

interface MobileTableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  color?: 'red' | 'blue' | 'green' | 'gray';
}

interface MobileTableViewProps {
  data: any[];
  columns: MobileTableColumn[];
  actions?: MobileTableAction[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  loading?: boolean;
  enableSwipeActions?: boolean;
}

export const MobileTableView: React.FC<MobileTableViewProps> = ({
  data,
  columns,
  actions = [],
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  enableSwipeActions = true
}) => {
  const primaryColumn = columns.find(col => col.primary);
  const secondaryColumn = columns.find(col => col.secondary);
  const otherColumns = columns.filter(col => !col.primary && !col.secondary);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="mobile-table-card animate-pulse">
            <div className="card-header">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="card-content">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-lg font-medium mb-2">No Data</div>
        <div className="text-sm text-center">{emptyMessage}</div>
      </div>
    );
  }

  const swipeActions = actions.map(action => ({
    icon: action.icon,
    label: action.label,
    action: action.onClick,
    color: action.color
  }));

  return (
    <div className="mobile-table-view md:hidden space-y-3">
      {data.map((row, index) => (
        <SwipeableCard
          key={row.id || index}
          actions={enableSwipeActions ? swipeActions : undefined}
          className="mobile-table-card"
        >
          <div 
            className="cursor-pointer"
            onClick={() => onRowClick?.(row)}
          >
            {/* Header - Primary and secondary info */}
            <div className="card-header">
              <div className="flex-1 min-w-0">
                {primaryColumn && (
                  <div className="font-medium text-gray-900 truncate">
                    {primaryColumn.render 
                      ? primaryColumn.render(row[primaryColumn.key], row)
                      : row[primaryColumn.key]
                    }
                  </div>
                )}
                {secondaryColumn && (
                  <div className="text-sm text-gray-600 truncate mt-1">
                    {secondaryColumn.render
                      ? secondaryColumn.render(row[secondaryColumn.key], row)
                      : row[secondaryColumn.key]
                    }
                  </div>
                )}
              </div>
              
              {/* Actions menu button */}
              {actions.length > 0 && !enableSwipeActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="card-actions mobile-tap-area"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show action menu
                  }}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>

            {/* Content - Other columns */}
            {otherColumns.length > 0 && (
              <div className="card-content">
                {otherColumns.map(column => (
                  <div key={column.key} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SwipeableCard>
      ))}

      {/* Swipe hint for first card */}
      {enableSwipeActions && actions.length > 0 && data.length > 0 && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            ← Swipe left for actions
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileTableView;