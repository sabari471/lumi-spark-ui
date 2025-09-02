import { useState } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

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
    <div className="sticky bottom-0 border-t border-border glass backdrop-blur-xl shadow-elegant">
      <div className="container mx-auto px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={message + (isListening ? transcript : "")}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "🎤 Listening..." : "Type your message here..."}
              disabled={disabled || isListening}
              className="professional-input resize-none min-h-[56px] max-h-32 text-foreground placeholder:text-muted-foreground rounded-xl px-4 py-3 border-border bg-background/50 backdrop-blur-sm"
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

          <div className="flex gap-3">
            {isSupported && (
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={toggleVoiceInput}
                className={cn(
                  "btn-3d h-12 w-12 p-0 rounded-xl transition-all duration-200",
                  isListening 
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-glow' 
                    : 'btn-secondary hover:shadow-elegant'
                )}
                disabled={disabled}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}

            <Button
              type="submit"
              disabled={!message.trim() || disabled || isListening}
              className="btn-primary btn-3d h-12 w-12 p-0 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-elegant transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-3">
          <span className="inline-flex items-center space-x-4">
            <span>Press Enter to send • Shift + Enter for new line</span>
            {isSupported && <span>• Click mic for voice input</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;