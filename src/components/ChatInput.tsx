import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-glass-border glass backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              disabled={disabled}
              className="glass border-glass-border bg-glass/50 backdrop-blur-sm resize-none min-h-[50px] max-h-32 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary transition-all duration-300"
              rows={1}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="glass-hover btn-3d h-12 w-12 p-0"
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
            </Button>

            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              className="btn-3d h-12 w-12 p-0 bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInput;