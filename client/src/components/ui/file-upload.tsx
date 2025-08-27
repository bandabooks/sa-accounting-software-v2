import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  File, 
  Trash2, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileCode,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  existingFiles?: {
    id: number;
    fileName: string;
    originalName: string;
    fileSize: number;
    category: string;
    uploadedBy?: string;
    createdAt?: string;
  }[];
  onDeleteFile?: (fileId: number) => void;
}

export function FileUpload({
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ],
  existingFiles = [],
  onDeleteFile
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <FileImage className="h-4 w-4" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="h-4 w-4" />;
    if (mimeType.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (mimeType.includes("text")) return <FileCode className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const totalFiles = uploadedFiles.length + existingFiles.length + files.length;

    if (totalFiles > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files`,
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach((file) => {
      // Check file type
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxSizeMB}MB limit`,
          variant: "destructive",
        });
        return;
      }

      newFiles.push(file);
    });

    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

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
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const deleteExistingFile = (fileId: number) => {
    if (onDeleteFile) {
      onDeleteFile(fileId);
    }
  };

  return (
    <div className="space-y-3">
        {/* Upload Area - Compact Version */}
        <div
          className={`relative border border-dashed rounded-md p-3 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-testid="file-input"
          />
          <div className="flex items-center justify-center space-x-2">
            <Upload className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-600">
              <span className="font-medium">Click to attach files</span> (max {maxFiles}, {maxSizeMB}MB each)
            </span>
          </div>
        </div>

        {/* Existing Files - Compact */}
        {existingFiles.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">Existing Files</Label>
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.fileName)}
                  <span className="truncate">{file.originalName}</span>
                  <span className="text-gray-500">({formatFileSize(file.fileSize)})</span>
                </div>
                {onDeleteFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExistingFile(file.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    data-testid={`delete-existing-file-${file.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Newly Uploaded Files - Compact */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs font-medium text-blue-600">New Files</Label>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-blue-50 rounded text-xs border border-blue-200"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  data-testid={`remove-file-${index}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* File Stats */}
        {(uploadedFiles.length > 0 || existingFiles.length > 0) && (
          <div className="text-xs text-gray-500">
            {uploadedFiles.length + existingFiles.length} of {maxFiles} files
          </div>
        )}
    </div>
  );
}