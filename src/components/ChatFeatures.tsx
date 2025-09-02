import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Download, 
  Share2, 
  Bookmark, 
  Search,
  Copy,
  Trash2,
  Edit3,
  MessageSquare,
  Zap
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { MessageData } from "./Message";

interface ChatFeaturesProps {
  messages: MessageData[];
  onSearchMessage?: (query: string) => void;
  onBookmarkMessage?: (messageId: string) => void;
  onShareConversation?: () => void;
  onExportChat?: () => void;
}

export function ChatFeatures({ 
  messages, 
  onSearchMessage, 
  onBookmarkMessage,
  onShareConversation,
  onExportChat 
}: ChatFeaturesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickPrompts = [
    "Explain this in simple terms",
    "Write a summary",
    "Generate ideas about this topic",
    "What are the pros and cons?",
    "How can I improve this?",
    "Create a step-by-step guide"
  ];

  const handleSearch = () => {
    if (searchQuery.trim() && onSearchMessage) {
      onSearchMessage(searchQuery);
      setSearchQuery("");
    }
  };

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 gap-2">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={handleSearch} className="h-8 w-8 p-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Quick Prompts */}
          <Popover open={showQuickActions} onOpenChange={setShowQuickActions}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Zap className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm mb-2">Quick Prompts</h4>
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => {
                      // This would need to be connected to the main chat input
                      setShowQuickActions(false);
                    }}
                  >
                    <span className="text-xs">{prompt}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Export */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExportChat}
            className="h-8 w-8 p-0"
            title="Export chat"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Share */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onShareConversation}
            className="h-8 w-8 p-0"
            title="Share conversation"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          {/* Save conversation */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title="Save conversation"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}