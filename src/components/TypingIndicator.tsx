import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 px-4 py-6 bg-background-secondary/30">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-depth">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>

      {/* Typing Animation */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary-glow">
            AI Assistant
          </span>
          <span className="text-xs text-muted-foreground">typing...</span>
        </div>

        <div className="flex items-center gap-1 typing-dots">
          <span className="w-2 h-2 bg-primary/60 rounded-full"></span>
          <span className="w-2 h-2 bg-primary/60 rounded-full"></span>
          <span className="w-2 h-2 bg-primary/60 rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;