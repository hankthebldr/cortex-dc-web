// Terminal system type definitions

export interface TerminalCommand {
  id: string;
  command: string;
  timestamp: number;
  output?: string;
  status?: 'pending' | 'running' | 'completed' | 'error';
}

export interface TerminalSession {
  id: string;
  commands: TerminalCommand[];
  isActive: boolean;
}
