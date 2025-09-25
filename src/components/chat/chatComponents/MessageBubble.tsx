import { Bot, User, FileText } from "lucide-react";
import { Message } from "../ChatWindow";

const MessageBubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === "user";  // ✅ Correct field

  return (
    <div className={`flex items-start space-x-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser ? "chat-bubble-user shadow-soft" : "chat-bubble-assistant shadow-soft"
        }`}
      >
        <p className="text-sm leading-relaxed">{msg.content}</p>
        {msg.fileAttached && (
          <div className="mt-2 flex items-center space-x-1 text-xs opacity-75">
            <FileText className="h-3 w-3" />
            <span>{msg.fileAttached}</span>
          </div>
        )}
        <div className="mt-1 text-xs opacity-60">
          {msg.timestamp instanceof Date
            ? msg.timestamp.toLocaleTimeString()
            : new Date(msg.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
export default MessageBubble;