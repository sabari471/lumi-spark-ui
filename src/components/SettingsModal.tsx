import { useState } from "react";
import { X, Volume2, Mic, Palette, Download, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllChats: () => void;
  onExportChats: () => void;
}

const SettingsModal = ({ isOpen, onClose, onClearAllChats, onExportChats }: SettingsModalProps) => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState([1]);
  const [fontSize, setFontSize] = useState([16]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-glass-border backdrop-blur-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Palette className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Voice & Audio</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-input" className="text-sm text-muted-foreground">
                <Mic className="h-4 w-4 inline mr-2" />
                Voice Input
              </Label>
              <Switch
                id="voice-input"
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-effects" className="text-sm text-muted-foreground">
                <Volume2 className="h-4 w-4 inline mr-2" />
                Sound Effects
              </Label>
              <Switch
                id="sound-effects"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Voice Speed: {voiceSpeed[0]}x
              </Label>
              <Slider
                value={voiceSpeed}
                onValueChange={setVoiceSpeed}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Display</h3>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Font Size: {fontSize[0]}px
              </Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Data Management</h3>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full glass-hover"
                onClick={onExportChats}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Chat History
              </Button>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
                    onClearAllChats();
                    onClose();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Chats
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-glass-border">
          <Button onClick={onClose} className="btn-3d">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;