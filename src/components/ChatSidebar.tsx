import { MessageSquare, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onClose
}: ChatSidebarProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-80 glass border-r border-glass-border backdrop-blur-xl z-50 transition-transform duration-300",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-glass-border">
            <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
            <p className="text-sm text-muted-foreground">Your conversations</p>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {sessions.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-xs">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      currentSessionId === session.id
                        ? "bg-primary/10 border-primary/30 shadow-glow"
                        : "glass-hover border-glass-border"
                    )}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {session.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {session.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(session.timestamp)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;