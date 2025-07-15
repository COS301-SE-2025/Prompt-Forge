import { useState, useEffect, useRef, useCallback } from 'react';

interface TypingEffectOptions {
  speed?: number;
  batchSize?: number;
}

export const useTypingEffect = (options: TypingEffectOptions = {}) => {
  const { speed = 25, batchSize = 2 } = options;
  
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const queueRef = useRef<string[]>([]);
  const currentTextRef = useRef('');
  const timeoutRef = useRef<number | null>(null);
  const speedRef = useRef(speed);
  const batchSizeRef = useRef(batchSize);

  // Update refs when props change
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    batchSizeRef.current = batchSize;
  }, [batchSize]);

  // Update the processQueue function for better responsiveness
  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      // ✅ FIXED: Remove cursor when finished
      setDisplayText(currentTextRef.current);
      setIsTyping(false);
      return;
    }

    // Process a batch of characters
    const charsToProcess = Math.min(batchSizeRef.current, queueRef.current.length);
    
    for (let i = 0; i < charsToProcess; i++) {
      if (queueRef.current.length > 0) {
        const char = queueRef.current.shift();
        if (char) {
          currentTextRef.current += char;
        }
      }
    }

    //FIXED: Always update display with cursor while typing is in progress
    setDisplayText(currentTextRef.current + (queueRef.current.length > 0 ? '|' : ''));

    // Schedule next batch with requestAnimationFrame for smoother animation
    timeoutRef.current = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        processQueue();
      });
    }, speedRef.current);
  }, []);

  const addText = useCallback((text: string) => {
    // Add characters to queue
    queueRef.current.push(...text.split(''));
    
    // Start typing if not already running
    if (!isTyping) {
      setIsTyping(true);
      processQueue();
    }
  }, [isTyping, processQueue]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    queueRef.current = [];
    currentTextRef.current = '';
    setDisplayText('');
    setIsTyping(false);
  }, []);

  const complete = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Add all remaining characters at once
    while (queueRef.current.length > 0) {
      const char = queueRef.current.shift();
      if (char) {
        currentTextRef.current += char;
      }
    }
    
    setDisplayText(currentTextRef.current);
    setIsTyping(false);
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    speedRef.current = newSpeed;
  }, []);

  const setBatchSize = useCallback((newBatchSize: number) => {
    batchSizeRef.current = Math.max(1, newBatchSize);
  }, []);

  // Add the setText method to your hook
  const setText = useCallback((text: string) => {
    // Clear any existing content
    queueRef.current = [];
    currentTextRef.current = text;
    setDisplayText(text);
    setIsTyping(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Make sure to include it in the return value of your hook
  return {
    displayText,
    isTyping,
    addText,
    clear,
    complete,
    setSpeed,
    setBatchSize,
    setText // Add this new method
  };
};