import { useState, useCallback } from 'react';

export interface TerminalState {
  output: string[];
  isLoading: boolean;
  error: string | null;
}

export interface UseTerminalReturn extends TerminalState {
  addLine: (line: string) => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTerminal = (): UseTerminalReturn => {
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLine = useCallback((line: string) => {
    setOutput(prev => [...prev, line]);
  }, []);

  const clear = useCallback(() => {
    setOutput([]);
    setError(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    output,
    isLoading,
    error,
    addLine,
    clear,
    setLoading,
    setError,
  };
};