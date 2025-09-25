import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

import { ScrollArea } from "@/components/ui/scroll-area";
import ChatHeader from "./chatComponents/ChatHeader";
import MessagesList from "./chatComponents/MessagesList";
import FileSection from "./chatComponents/FileSection";
import InputSection from "./chatComponents/InputSection";
import PromptSection from "./chatComponents/PromptSection";
import { FileItem } from "@/components/files/FileManager";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  fileAttached?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatWindowProps {
  currentChat: Chat | null;
  onNewChat: () => void;
  onUpdateChat: (message: string) => void;   // ✅ only passes message string
  files: FileItem[];
  onFileUpload: (files: FileItem[]) => void;
  onFileDelete: (fileId: string) => void;
}

const ChatWindow = ({
  currentChat,
  onNewChat,
  onUpdateChat,
  files,
  onFileUpload,
  onFileDelete,
}: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    if (user.role !== "admin" && user.tokens < 10) {
      toast({
        title: "Insufficient tokens",
        description: "You need at least 10 tokens to send a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      // ✅ just notify parent with the message
      onUpdateChat(message);
      setMessage("");
      setSelectedFile("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <ChatHeader
        title={currentChat?.title || "New Chat"}
        messageCount={currentChat?.messages.length || 0}
        onNewChat={onNewChat}
      />

      <ScrollArea className="flex-1 p-4 py-12">
        <MessagesList messages={currentChat?.messages || []} isLoading={isLoading} />
      </ScrollArea>

      <FileSection files={files} onUpload={onFileUpload} onDelete={onFileDelete} />

      <InputSection
        message={message}
        setMessage={setMessage}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        files={files}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        tokens={user?.tokens || 0}
        isAdmin={user?.role === "admin"}
      />

      <PromptSection onSelectPrompt={setMessage} userId={user?.id} />
    </div>
  );
};

export default ChatWindow;
