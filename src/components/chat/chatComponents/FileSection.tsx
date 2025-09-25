import FileManager, { FileItem } from "@/components/files/FileManager";

interface FileSectionProps {
  files: FileItem[];
  onUpload: (files: FileItem[]) => void;
  onDelete: (fileId: string) => void;
}

const FileSection = ({ files, onUpload, onDelete }: FileSectionProps) => (
  <div className="border-t p-4 bg-surface/50">
    <FileManager files={files} onUpload={onUpload} onDelete={onDelete} compact />
  </div>
);

export default FileSection;
