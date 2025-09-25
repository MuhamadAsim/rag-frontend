import { Loader2, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessageBubble from "./ChatMessageBubble";  
import { Message } from "./types";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  endRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages = ({ messages, isLoading, endRef }: ChatMessagesProps) => (
  <ScrollArea className="flex-1 p-4 py-12">
    {messages.length === 0 ? (
      <div className="flex items-center justify-center h-full text-center">
        <div className="space-y-2">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-3xl font-medium">Start a conversation</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask me anything! I can help with questions, analysis, coding, writing, and more.
          </p>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="chat-bubble-assistant shadow-soft px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    )}
  </ScrollArea>
);

export default ChatMessages;
