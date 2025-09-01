import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatSidebar, { ChatSession } from "./ChatSidebar";
import Message, { MessageData } from "./Message";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import SettingsModal from "./SettingsModal";
import { cn } from "@/lib/utils";

// Enhanced Message component with word-by-word reveal
const AnimatedMessage = ({ message }: { message: MessageData }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
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
      }, 80); // Adjust speed here (lower = faster)

      return () => clearInterval(timer);
    } else {
      // Show user messages immediately
      setDisplayedContent(message.content);
    }
  }, [message.content, message.sender, words]);

  return (
    <div className={cn(
      "flex w-full mb-4",
      message.sender === "user" ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-lg px-4 py-3 shadow-sm",
        message.sender === "user"
          ? "bg-primary text-primary-foreground ml-4"
          : "bg-muted mr-4"
      )}>
        <div className="whitespace-pre-wrap break-words">
          {displayedContent}
          {message.sender === 'bot' && currentWordIndex < words.length && (
            <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
          )}
        </div>
        <div className={cn(
          "text-xs mt-1 opacity-70",
          message.sender === "user" ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
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
                  Start a conversation with Gemini
                </h2>
                <p className="text-muted-foreground">
                  Ask me anything! I'm powered by Google's Gemini AI and ready to help with questions, creative tasks, analysis, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0 p-4">
              {messages.map((message) => (
                <AnimatedMessage key={message.id} message={message} />
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