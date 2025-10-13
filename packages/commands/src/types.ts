// Command system type definitions

export interface Command {
  id: string;
  name: string;
  description: string;
  category: string;
  execute: (args: string[]) => Promise<CommandResult>;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface CommandRegistry {
  register(command: Command): void;
  get(commandName: string): Command | undefined;
  list(): Command[];
}
