import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ChatWindow, { Chat } from "@/components/chat/ChatWindow";
import ChatHistory from "@/components/chat/ChatHistory";
import { FileItem } from "@/components/files/FileManager";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper: normalize chat from backend
const parseChat = (chat: any): Chat => {
  console.log("Raw chat from backend:", chat);

  const parsed = {
    ...chat,
    createdAt: new Date(chat.createdAt),
    updatedAt: new Date(chat.updatedAt),
    messages: chat.messages.map((m: any) => {
      console.log("Raw message:", m);
      return {
        ...m,
        timestamp: new Date(m.timestamp),
      };
    }),
  };

  console.log("Parsed chat:", parsed);
  return parsed;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  if (!user) return <Navigate to="/signin" replace />;

  /** ---------------- FILES ---------------- */
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/files?userId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch files");

        const data = await res.json();

        // ✅ normalize
        const parsed: FileItem[] = data.map((file: any) => ({
          id: file._id,                  // MongoDB _id → frontend id
          name: file.filename,           // filename → name
          type: file.mimetype,           // mimetype → type
          size: file.size,
          uploadedAt: new Date(file.createdAt),  // createdAt → uploadedAt
          url: file.url,
          file: undefined,
        }));

        setFiles(parsed);

      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load your files from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };


    fetchFiles();
  }, [user.id, toast]);

  /** ---------------- CHATS ---------------- */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chats?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        console.log("Fetched chats data:", data);

        if (data.length === 0) {
          setChats([]);
          setCurrentChat(null);
          return;
        }

        const parsed = data.map(parseChat);
        setChats(parsed);
        setCurrentChat(parsed[0]);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load your chats from the server.",
          variant: "destructive",
        });
      }
    };

    fetchChats();
  }, [user.id, toast]);

  /** ---------------- NEW CHAT ---------------- */
  const handleNewChat = () => {
    setCurrentChat(null);
  };

  /** ---------------- SEND / UPDATE CHAT ---------------- */
  const handleUpdateChat = async (message: string) => {
    if (!user) return;

    // 1. optimistic update
    const optimisticChat: Chat =
      currentChat || {
        id: "temp-" + Date.now(),
        title: message.substring(0, 50) || "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

    const userMessage = {
      id: "temp-" + Date.now(),
      role: "user" as const,  // ✅ Ensure this is correctly typed
      content: message,
      timestamp: new Date(),
    };

    const tempChat: Chat = {
      ...optimisticChat,
      updatedAt: new Date(),
      messages: [...optimisticChat.messages, userMessage],
    };

    console.log("Optimistic chat update:", tempChat);
    setCurrentChat(tempChat);
    setChats((prev) => {
      const others = prev.filter((c) => c.id !== tempChat.id);
      return [tempChat, ...others];
    });

    // 2. send to backend
    try {
      const requestBody = {
        chatId:
          currentChat?.id && !currentChat.id.startsWith("temp-")
            ? currentChat.id
            : null,
        userId: user.id,
        message,
      };

      console.log("Sending request to backend:", requestBody);

      const res = await fetch(`${API_BASE}/api/chats/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const responseData = await res.json();
      console.log("Backend response:", responseData);

      const updatedChat = parseChat(responseData);

      // ✅ replace tempChat entirely with backend chat
      setChats((prev) => {
        const others = prev.filter(
          (c) => c.id !== tempChat.id && c.id !== updatedChat.id
        );
        return [updatedChat, ...others];
      });
      setCurrentChat(updatedChat);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Could not send message.",
        variant: "destructive",
      });
    }
  };

  /** ---------------- SELECT CHAT ---------------- */
  const handleSelectChat = (chat: Chat) => {
    console.log("Selected chat:", chat);
    setCurrentChat(chat);
  };

  /** ---------------- DELETE CHAT ---------------- */
  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete chat");

      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChat?.id === chatId) setCurrentChat(null);

      toast({
        title: "Chat deleted",
        description: "The chat has been removed successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not delete chat.",
        variant: "destructive",
      });
    }
  };

  /** ---------------- FILE UPLOAD / DELETE ---------------- */
  const handleFileUpload = async (newFiles: FileItem[]) => {
  try {
    const formData = new FormData();
    formData.append("file", newFiles[0].file as File); 
    formData.append("userId", user.id);

    const res = await fetch(`${API_BASE}/api/files/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const responseData = await res.json();

    // ✅ normalize
    const uploadedFiles: FileItem[] = responseData.map((file: any) => ({
      id: file._id,
      name: file.filename,
      type: file.mimetype,
      size: file.size,
      uploadedAt: new Date(file.createdAt),
      url: file.url,
    }));

    setFiles((prev) => [...uploadedFiles, ...prev]);

    toast({
      title: "Upload successful",
      description: `${uploadedFiles.length} file(s) uploaded.`,
    });

  } catch {
    toast({
      title: "Upload error",
      description: "Could not upload files.",
      variant: "destructive",
    });
  }
};


  const handleFileDelete = async (fileId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setFiles((prev) => prev.filter((f) => f.id !== fileId));

      toast({
        title: "File deleted",
        description: "The file has been removed successfully.",
      });
    } catch {
      toast({
        title: "Delete error",
        description: "Could not delete the file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-muted">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar className="border-r">
            <SidebarContent className="flex flex-col h-full"> {/* ✅ force flex + height */}
              <div className="flex-1 p-4 overflow-hidden">    {/* ✅ let this stretch */}
                <ChatHistory
                  chats={chats}
                  currentChat={currentChat}
                  onSelectChat={handleSelectChat}
                  onDeleteChat={handleDeleteChat}
                />
              </div>
            </SidebarContent>
          </Sidebar>

          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <Navbar />
              </div>
            </header>

            <div className="flex-1 flex flex-col">
              <ChatWindow
                currentChat={currentChat}
                onNewChat={handleNewChat}
                onUpdateChat={handleUpdateChat}
                files={files}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;