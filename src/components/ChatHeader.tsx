import { Settings, Plus, Menu, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

interface ChatHeaderProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onToggleStats?: () => void;
}

const ChatHeader = ({ onNewChat, onToggleSidebar, onOpenSettings, onToggleStats }: ChatHeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl shadow-elegant sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-hero bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onToggleStats && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleStats}
              className="h-9 w-9 p-0"
              title="Toggle statistics"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="h-9 w-9 p-0"
            title="New conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-9 w-9 p-0"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;