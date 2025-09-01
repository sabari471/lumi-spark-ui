import { useState } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript, 
    isSupported 
  } = useSpeechRecognition();

  // Update message when speech recognition provides transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setMessage(prev => prev + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

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

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-glass-border glass backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={message + (isListening ? transcript : "")}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Type your message here..."}
              disabled={disabled || isListening}
              className="glass border-glass-border bg-glass/50 backdrop-blur-sm resize-none min-h-[50px] max-h-32 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary transition-all duration-300"
              rows={1}
            />
            {isListening && (
              <div className="absolute right-3 top-3">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isSupported && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`glass-hover btn-3d h-12 w-12 p-0 ${isListening ? 'bg-destructive/20 text-destructive' : ''}`}
                disabled={disabled}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}

            <Button
              type="submit"
              disabled={!message.trim() || disabled || isListening}
              className="btn-3d h-12 w-12 p-0 bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
          {isSupported && ", Click mic for voice input"}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;