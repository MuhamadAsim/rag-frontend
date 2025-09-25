import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  title: string;
  messageCount: number;
  onNewChat: () => void;
}

const ChatHeader = ({ title, messageCount, onNewChat }: ChatHeaderProps) => (
  <div className="flex items-center justify-between p-4 border-b">
    <div className="flex items-center space-x-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {messageCount > 0 && (
        <span className="text-sm text-muted-foreground">{messageCount} messages</span>
      )}
    </div>
    <Button onClick={onNewChat} variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-2" />
      New Chat
    </Button>
  </div>
);

export default ChatHeader;
