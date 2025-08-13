import { memo, useCallback, useMemo } from 'react';
import { useVirtualList } from '@/hooks/useVirtualList';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  width?: string;
}

interface OptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  containerHeight?: number;
  onRowClick?: (item: T) => void;
  getRowKey: (item: T) => string | number;
}

// Memoized table row component
const MemoizedTableRow = memo(function TableRowComponent<T>({
  item,
  columns,
  onClick,
}: {
  item: T;
  columns: Column<T>[];
  onClick?: (item: T) => void;
}) {
  const handleClick = useCallback(() => {
    onClick?.(item);
  }, [item, onClick]);

  return (
    <TableRow 
      onClick={handleClick}
      className={onClick ? "cursor-pointer hover:bg-gray-50" : ""}
    >
      {columns.map((column) => (
        <TableCell key={column.key} style={{ width: column.width }}>
          {column.accessor(item)}
        </TableCell>
      ))}
    </TableRow>
  );
});

export function OptimizedTable<T>({
  data,
  columns,
  rowHeight = 60,
  containerHeight = 600,
  onRowClick,
  getRowKey,
}: OptimizedTableProps<T>) {
  const {
    virtualItems,
    totalHeight,
    offsetY,
  } = useVirtualList(data, {
    itemHeight: rowHeight,
    containerHeight,
    overscan: 5,
  });

  // Memoize column headers
  const headers = useMemo(() => (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead key={column.key} style={{ width: column.width }}>
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  ), [columns]);

  return (
    <div className="relative" style={{ height: containerHeight, overflow: 'auto' }}>
      <div style={{ height: totalHeight }}>
        <Table>
          {headers}
          <TableBody>
            <tr style={{ height: offsetY }} />
            {virtualItems.map((item) => (
              <MemoizedTableRow
                key={getRowKey(item)}
                item={item}
                columns={columns}
                onClick={onRowClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default memo(OptimizedTable) as typeof OptimizedTable;