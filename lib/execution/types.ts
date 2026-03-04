// Define the base interface for code executors
export interface CodeExecutor {
  execute(code: string, language: string): Promise<string>;
}

// Result type for execution
export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
}