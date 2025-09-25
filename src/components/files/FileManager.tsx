import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Image,
  File,
  Search,
  Trash2,
  Download,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  url: string;
  file?: File;
}

interface FileManagerProps {
  files: FileItem[];
  onUpload: (files: FileItem[]) => void; // parent will handle backend upload
  onDelete: (fileId: string) => void; // parent will handle backend delete
  compact?: boolean;
}

const FileManager = ({
  files,
  onUpload,
  onDelete,
  compact = false,
}: FileManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** ---------------- HELPERS ---------------- */
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (type.includes("pdf"))
      return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes("document") || type.includes("word"))
      return <FileText className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /** ---------------- FILE SELECTION ---------------- */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // ✅ Only take the first file
    const file = selectedFiles[0];

    const fileItem: FileItem = {
      id: "temp-" + Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file), // preview
      file,
    };

    onUpload([fileItem]); // pass to parent for upload
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length === 0) return;

    const file = event.dataTransfer.files[0]; // ✅ Only first file
    const fileItem: FileItem = {
      id: "temp-" + Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file),
      file,
    };

    onUpload([fileItem]);
  };

  /** ---------------- FILTER ---------------- */
  const filteredFiles = files.filter(
    (file) =>
      file.name &&
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  /** ---------------- RENDER ---------------- */
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Files</h4>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg,.gif"
          />
        </div>

        {files.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
            {filteredFiles.slice(0, 5).map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-2 bg-muted rounded px-2 py-1 text-xs"
              >
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="truncate max-w-20">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                  onClick={() => onDelete(file.id)} // ✅ delegate delete
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No files uploaded</p>
        )}
      </div>
    );
  }

  return (
    <Card className="h-full gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>File Manager</span>
          <Badge variant="outline">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth ${dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Drop a file here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports PDF, Word, Images (max 10MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* File List */}
        <ScrollArea className="h-[300px]">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "No files found" : "No files uploaded yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles
                .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
                .map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border transition-smooth hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {file.uploadedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(file.id)} // ✅ delegate delete
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FileManager;
