import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2, Send } from "lucide-react";
import { FileItem } from "@/components/files/FileManager";

interface InputSectionProps {
  message: string;
  setMessage: (val: string) => void;
  selectedFile: string;          // should be "none" if no file selected
  setSelectedFile: (val: string) => void;
  files: FileItem[];
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  tokens: number;
  isAdmin: boolean;
}

const InputSection = ({
  message,
  setMessage,
  selectedFile,
  setSelectedFile,
  files,
  isLoading,
  handleSubmit,
  tokens,
  isAdmin,
}: InputSectionProps) => (
  <div className="p-4 border-t bg-surface">
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* File selector */}
      {files.length > 0 && (
        <Select
          value={selectedFile || "none"}          // fallback to "none"
          onValueChange={setSelectedFile}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a file (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No file selected</SelectItem>
            {files.map((file) => (
              <SelectItem key={file.id} value={file.id}>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Message input and send button */}
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="gradient"
          disabled={
            !message.trim() ||
            isLoading ||
            (!isAdmin && tokens < 10)
          }
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Token info for non-admin users */}
      {!isAdmin && (
        <p className="text-xs text-muted-foreground">
          Each message costs 10 tokens. You have {tokens.toLocaleString()} tokens remaining.
        </p>
      )}
    </form>
  </div>
);

export default InputSection;
