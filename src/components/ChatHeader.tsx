import { Bot, MessageSquare, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const ChatHeader = ({ onNewChat, onToggleSidebar }: ChatHeaderProps) => {
  return (
    <header className="glass border-b border-glass-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="glass-hover lg:hidden"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-xs text-muted-foreground">
                  Powered by advanced AI
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              className="glass-hover btn-3d"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="glass-hover"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;