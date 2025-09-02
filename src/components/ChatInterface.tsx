import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatSidebar, { ChatSession } from "./ChatSidebar";
import Message, { MessageData } from "./Message";
import ProfessionalTypingIndicator from "./ProfessionalTypingIndicator";
import ChatInput from "./ChatInput";
import SettingsModal from "./SettingsModal";
import { ChatFeatures } from "./ChatFeatures";
import { ChatStats } from "./ChatStats";
import { cn } from "@/lib/utils";

// Enhanced Message component with professional design and functionality
const AnimatedMessage = ({ message }: { message: MessageData }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const words = message.content.split(' ');

  useEffect(() => {
    if (message.sender === 'bot') {
      // Reset animation for new bot messages
      setDisplayedContent('');
      setCurrentWordIndex(0);
      
      const timer = setInterval(() => {
        setCurrentWordIndex((prevIndex) => {
          if (prevIndex < words.length) {
            const nextIndex = prevIndex + 1;
            setDisplayedContent(words.slice(0, nextIndex).join(' '));
            return nextIndex;
          } else {
            clearInterval(timer);
            return prevIndex;
          }
        });
      }, 60); // Faster animation for better UX

      return () => clearInterval(timer);
    } else {
      // Show user messages immediately
      setDisplayedContent(message.content);
    }
  }, [message.content, message.sender, words]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={cn(
      "flex w-full mb-6 group",
      message.sender === "user" ? "justify-end message-enter-user" : "justify-start message-enter"
    )}>
      {/* Bot Avatar */}
      {message.sender === "bot" && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
      )}

      <div className={cn(
        "relative max-w-[75%] group",
        message.sender === "user" ? "order-first" : ""
      )}>
        <div className={cn(
          "message-bubble px-4 py-3 relative",
          message.sender === "user"
            ? "message-bubble-user ml-auto"
            : "message-bubble-bot"
        )}>
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {displayedContent}
            {message.sender === 'bot' && currentWordIndex < words.length && (
              <span className="inline-block w-0.5 h-5 bg-current ml-1 animate-pulse" />
            )}
          </div>
          
          <div className={cn(
            "flex items-center justify-between mt-2 text-xs opacity-60",
            message.sender === "user" ? "flex-row-reverse" : ""
          )}>
            <span>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {message.sender === "bot" && (
              <button
                onClick={handleCopy}
                className={cn(
                  "ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted",
                  copied && "opacity-100"
                )}
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {message.sender === "user" && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyA4YvkmptCkW9evpZQQHVAK82vRwN_6Ykg";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const ChatInterface = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, parts: [{text: string}]}>>([]);
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
    setConversationHistory([]);
  };

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // In a real app, you'd load messages and conversation history for this session
    setMessages([]);
    setConversationHistory([]);
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

  const editSession = (sessionId: string, newTitle: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, title: newTitle }
          : s
      )
    );
  };

  const clearAllChats = () => {
    setSessions([]);
    setMessages([]);
    setConversationHistory([]);
    setCurrentSessionId(null);
    createNewChat();
  };

  const exportChats = () => {
    const exportData = {
      sessions,
      exportDate: new Date().toISOString(),
      totalSessions: sessions.length
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const shareConversation = () => {
    if (messages.length === 0) return;
    
    const conversationText = messages.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'AI Conversation',
        text: conversationText
      });
    } else {
      navigator.clipboard.writeText(conversationText);
      // You could add a toast notification here
    }
  };

  const searchMessages = (query: string) => {
    // Simple search implementation - could be enhanced
    const foundMessage = messages.find(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    
    if (foundMessage) {
      // Scroll to message or highlight it
      console.log('Found message:', foundMessage);
    }
  };

  // Call Gemini API
  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      // Build conversation history for context
      const history = conversationHistory.slice(-10); // Keep last 10 exchanges for context
      const contents = [
        ...history,
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ];

      const requestBody = {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      const botResponse = data.candidates[0].content.parts[0].text;
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev.slice(-10), // Keep only last 10 exchanges
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: botResponse }] }
      ]);

      return botResponse;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback responses based on error type
      if (error.message.includes('API')) {
        return "I'm having trouble connecting to my AI service right now. Please check your internet connection and try again in a moment.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return "I've reached my usage limit for now. Please try again later, or check your API quota.";
      } else {
        return "I apologize, but I encountered an unexpected error while processing your request. Please try rephrasing your question or try again.";
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

    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Call Gemini API
      const botResponse = await callGeminiAPI(content);
      
      // Hide typing indicator before showing response
      setIsTyping(false);
      
      // Add a small delay before starting the word animation
      setTimeout(() => {
        const botMessage: MessageData = {
          id: (Date.now() + 1).toString(),
          content: botResponse,
          sender: "bot",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

        // Update session last message
        setSessions(prev =>
          prev.map(s =>
            s.id === currentSessionId
              ? { ...s, lastMessage: botResponse.length > 50 ? botResponse.substring(0, 50) + "..." : botResponse, timestamp: new Date() }
              : s
          )
        );
      }, 300); // Small delay before animation starts
      
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      setIsTyping(false);
      
      setTimeout(() => {
        const errorMessage: MessageData = {
          id: (Date.now() + 1).toString(),
          content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
          sender: "bot",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }, 300);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          onEditSession={editSession}
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
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleStats={() => setShowStats(!showStats)}
        />

        {/* Stats */}
        <ChatStats messages={messages} isVisible={showStats} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-subtle">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-lg">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-hero flex items-center justify-center shadow-elegant">
                    <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="absolute -inset-4">
                    <div className="w-full h-full rounded-2xl bg-gradient-hero opacity-20 blur-xl"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                    AI Assistant Ready
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    I'm here to help with questions, creative tasks, problem-solving, and more. 
                    Start our conversation below!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                  <div className="glass-hover p-4 rounded-xl cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm">Ask Questions</h3>
                        <p className="text-xs text-muted-foreground">Get answers and explanations</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-hover p-4 rounded-xl cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm">Creative Tasks</h3>
                        <p className="text-xs text-muted-foreground">Writing and brainstorming</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0 p-6">
              {messages.map((message) => (
                <AnimatedMessage key={message.id} message={message} />
              ))}
              {isTyping && <ProfessionalTypingIndicator />}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Features */}
        <ChatFeatures 
          messages={messages}
          onSearchMessage={searchMessages}
          onShareConversation={shareConversation}
          onExportChat={exportChats}
        />

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isTyping}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onClearAllChats={clearAllChats}
          onExportChats={exportChats}
        />
      </div>
    </div>
  );
};

export default ChatInterface;