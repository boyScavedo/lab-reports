import { CodeExecutor, ExecutionResult } from "./types";

export class CppExecutor implements CodeExecutor {
  async execute(code: string, language: string): Promise<ExecutionResult> {
    if (language !== "cpp" && language !== "c") {
      return {
        success: false,
        output: "",
        error: `Unsupported language: ${language}. C/C++ executor only supports C and C++.`,
      };
    }

    // Return a message indicating that C/C++ execution requires specific Wasm build configuration
    return {
      success: false,
      output: "",
      error: `${language.toUpperCase()} execution requires specific WebAssembly build configuration. 
      Please configure a C/C++ to WebAssembly compiler (e.g., Emscripten) and implement the execution logic.`,
    };
  }
}