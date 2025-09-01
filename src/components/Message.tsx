import { User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MessageData {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface MessageProps {
  message: MessageData;
}

const Message = ({ message }: MessageProps) => {
  const [copied, setCopied] = useState(false);
  const isBot = message.sender === "bot";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      "message-slide-in flex gap-3 px-4 py-6 group",
      isBot ? "bg-background-secondary/30" : ""
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-depth",
        isBot 
          ? "bg-gradient-to-br from-primary to-accent" 
          : "bg-gradient-to-br from-muted to-secondary"
      )}>
        {isBot ? (
          <Bot className="h-4 w-4 text-primary-foreground" />
        ) : (
          <User className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            isBot ? "text-primary-glow" : "text-accent"
          )}>
            {isBot ? "AI Assistant" : "You"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <div className={cn(
          "prose prose-sm max-w-none",
          isBot ? "text-bot-message-foreground" : "text-foreground"
        )}>
          {/* For now, simple text rendering - can be enhanced with markdown later */}
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Actions */}
        {isBot && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="glass-hover h-8 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;