import { useEffect, useRef } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Message } from "../ChatWindow";
import MessageBubble from "./MessageBubble";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessagesList = ({ messages, isLoading }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔍 Debug: Log messages when they arrive
  useEffect(() => {
    console.log("MessagesList received messages:", messages);
    messages.forEach((msg, index) => {
      console.log(`Message ${index}:`, {
        id: msg.id,
        role: msg.role,
        content: msg.content.substring(0, 50) + "...",
        timestamp: msg.timestamp
      });
    });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="space-y-2">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-3xl font-medium">Start a conversation</h3>
          <p className="text-muted-foreground max-w-md">
            Ask me anything! I can help with questions, analysis, coding, writing, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        // 🔍 Debug: Log each message being rendered
        console.log(`Rendering message ${msg.id} with role:`, msg.role);
        return (
          <MessageBubble key={msg.id} msg={msg} />
        );
      })}

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
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;