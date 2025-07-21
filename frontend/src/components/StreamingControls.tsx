import React from 'react';
//import { RotateCcw } from 'lucide-react';
import { Button } from "./ui/Button";

interface StreamingControlsProps {
  streamingEnabled: boolean;
  setStreamingEnabled: (enabled: boolean) => void;
  typingSpeed: number;
  setTypingSpeed: (speed: number) => void;
  isLoading: boolean;
  isTyping: boolean;
  onSkipAnimation: () => void;
}

export const StreamingControls: React.FC<StreamingControlsProps> = ({
  streamingEnabled,
  setStreamingEnabled,
  typingSpeed,
  setTypingSpeed,
  isLoading,
  isTyping,
  onSkipAnimation
}) => {
  return (
    <div className="bg-gray-50 dark:bg-card/50 rounded-lg p-3 mb-3 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Streaming Settings</h3>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Enable Streaming:</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={streamingEnabled}
            onChange={(e) => setStreamingEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3ebb9e]/30 dark:peer-focus:ring-[#3ebb9e]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#3ebb9e]"></div>
        </label>
      </div>
      
      {streamingEnabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Typing Speed:</span>
            <span className="text-xs text-muted-foreground">{typingSpeed}ms</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={typingSpeed}
            onChange={(e) => setTypingSpeed(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#3ebb9e]"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fast</span>
            <span>Slow</span>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-between mt-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded px-2 py-1">
              <span className="text-xs">Streaming in progress</span>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            </div>
          )}
          
          {isTyping && (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full text-xs h-6"
              onClick={onSkipAnimation}
            >
              Skip Animation
            </Button>
          )}
        </div>
      )}
    </div>
  );
};