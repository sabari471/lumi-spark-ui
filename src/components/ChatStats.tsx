import { MessageData } from "./Message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, Zap, TrendingUp } from "lucide-react";

interface ChatStatsProps {
  messages: MessageData[];
  isVisible: boolean;
}

export function ChatStats({ messages, isVisible }: ChatStatsProps) {
  if (!isVisible) return null;

  const totalMessages = messages.length;
  const userMessages = messages.filter(m => m.sender === "user").length;
  const botMessages = messages.filter(m => m.sender === "bot").length;
  
  const avgResponseTime = botMessages > 0 ? "< 2s" : "N/A";
  const totalWords = messages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
  
  const conversationStartTime = messages.length > 0 ? messages[0].timestamp : new Date();
  const conversationDuration = Math.floor((Date.now() - conversationStartTime.getTime()) / 60000); // in minutes

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-border bg-card/30 backdrop-blur-sm">
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <MessageSquare className="h-3 w-3" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold">{totalMessages}</div>
          <p className="text-xs text-muted-foreground">
            {userMessages} sent, {botMessages} received
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold">{conversationDuration}m</div>
          <p className="text-xs text-muted-foreground">Active time</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Response
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold">{avgResponseTime}</div>
          <p className="text-xs text-muted-foreground">Avg. time</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Words
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold">{totalWords}</div>
          <p className="text-xs text-muted-foreground">Total written</p>
        </CardContent>
      </Card>
    </div>
  );
}