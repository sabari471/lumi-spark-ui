import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatSidebar, { ChatSession } from "./ChatSidebar";
import Message, { MessageData } from "./Message";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { cn } from "@/lib/utils";

const ChatInterface = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load initial session or create first one
  useEffect(() => {
    if (sessions.length === 0) {
      createNewChat();
    }
  }, []);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "Start chatting...",
      timestamp: new Date()
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // In a real app, you'd load messages for this session
    setMessages([]);
    setSidebarOpen(false);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSessionId) return;

    // Add user message
    const userMessage: MessageData = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Update session title if it's the first message
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession && messages.length === 0) {
      const title = content.length > 30 ? content.substring(0, 30) + "..." : content;
      setSessions(prev => 
        prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, title, lastMessage: content, timestamp: new Date() }
            : s
        )
      );
    }

    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate API delay
    setTimeout(() => {
      const botMessage: MessageData = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(content),
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Update session last message
      setSessions(prev =>
        prev.map(s =>
          s.id === currentSessionId
            ? { ...s, lastMessage: botMessage.content, timestamp: new Date() }
            : s
        )
      );
    }, 1000 + Math.random() * 2000);
  };

  // Simple bot responses - replace with actual API call
  const getBotResponse = (userMessage: string): string => {
    const responses = [
      "That's an interesting question! Let me think about that...",
      "I understand what you're asking. Here's my perspective on that topic:",
      "Great question! Based on what I know, I can tell you that...",
      "I'd be happy to help you with that. From my understanding...",
      "That's a thoughtful inquiry. Let me provide you with some insights:",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add some relevant content based on the user's message
    if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
      return "Hello! It's great to meet you. I'm your AI assistant, and I'm here to help with any questions or tasks you might have. What would you like to talk about today?";
    }
    
    if (userMessage.toLowerCase().includes("help")) {
      return "I'm here to help! I can assist you with a wide variety of tasks including answering questions, helping with analysis, creative writing, coding, math problems, and much more. What specific area would you like help with?";
    }

    return `${randomResponse} ${userMessage.length > 50 ? "You've shared quite a detailed message with me." : "Thank you for sharing that with me."} I'm designed to be helpful, harmless, and honest in all our conversations. Is there anything specific you'd like to explore further?`;
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarOpen ? "lg:ml-0" : ""
      )}>
        {/* Header */}
        <ChatHeader
          onNewChat={createNewChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">
                  Start a conversation
                </h2>
                <p className="text-muted-foreground">
                  Ask me anything! I'm here to help with questions, creative tasks, analysis, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isTyping}
        />
      </div>
    </div>
  );
};

export default ChatInterface;