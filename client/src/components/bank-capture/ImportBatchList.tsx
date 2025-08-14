import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download,
  Calendar,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ImportBatch {
  id: number;
  batchNumber: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: string;
  totalRows: number;
  newRows: number;
  duplicateRows: number;
  invalidRows: number;
  createdAt: string;
  completedAt?: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

interface ImportBatchListProps {
  batches: ImportBatch[];
  isLoading: boolean;
  onViewBatch: (batchId: number) => void;
  title: string;
  emptyMessage: string;
}

export function ImportBatchList({ batches, isLoading, onViewBatch, title, emptyMessage }: ImportBatchListProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { color: "bg-blue-100 text-blue-800", icon: Clock, label: "Processing" },
      parsed: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: "Parsed" },
      validated: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Validated" },
      completed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle, label: "Completed" },
      failed: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Failed" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: AlertTriangle, label: "Cancelled" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileSpreadsheet size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet size={20} />
          {title}
        </CardTitle>
        <CardDescription>
          {batches.length} import batch{batches.length !== 1 ? 'es' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">{batch.fileName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Batch #{batch.batchNumber} • {batch.fileType.toUpperCase()} • {formatFileSize(batch.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(batch.status)}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onViewBatch(batch.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-blue-600">{batch.totalRows}</p>
                  <p className="text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">{batch.newRows}</p>
                  <p className="text-muted-foreground">New</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-yellow-600">{batch.duplicateRows}</p>
                  <p className="text-muted-foreground">Duplicates</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-red-600">{batch.invalidRows}</p>
                  <p className="text-muted-foreground">Invalid</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Calendar size={12} />
                    <span>{formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })}</span>
                  </div>
                  {batch.uploadedBy && (
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                      <User size={10} />
                      <span>{batch.uploadedBy.firstName} {batch.uploadedBy.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

              {batch.status === 'completed' && batch.completedAt && (
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                  <span>Completed {formatDistanceToNow(new Date(batch.completedAt), { addSuffix: true })}</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={12} />
                    {batch.newRows} transactions imported
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}