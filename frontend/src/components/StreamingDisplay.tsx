import React from 'react';
import { RotateCcw } from 'lucide-react';

interface StreamingDisplayProps {
  content: string;
  isLoading: boolean;
  streamingEnabled: boolean;
  placeholder?: string;
  className?: string;
}

export const StreamingDisplay: React.FC<StreamingDisplayProps> = ({
  content,
  isLoading,
  streamingEnabled,
  placeholder = "No content to display yet...",
  className = "text-xs lg:text-sm text-muted-foreground whitespace-pre-wrap",
}) => {
  return (
    <>
      {isLoading && !streamingEnabled ? (
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4 animate-spin" />
          <span>Generating response...</span>
        </div>
      ) : (
        <pre className={className}>
          {content || placeholder}
        </pre>
      )}
    </>
  );
};