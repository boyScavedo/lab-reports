import { CodeExecutor, ExecutionResult } from "./types";

declare global {
  var loadPyodide: any;
}

export class PythonExecutor implements CodeExecutor {
  private pyodide: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Pyodide from CDN
      if (typeof window !== "undefined") {
        // Dynamically import pyodide
        const pyodideModule = await import("pyodide");
        this.pyodide = await pyodideModule.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
        });
        
        // Initialize packages if needed
        await this.pyodide.loadPackage(["micropip"]);
        this.isInitialized = true;
      }
    } catch (error) {
      console.error("Failed to initialize Pyodide:", error);
      throw new Error("Could not initialize Python execution environment");
    }
  }

  async execute(code: string, language: string): Promise<ExecutionResult> {
    if (language !== "python") {
      return {
        success: false,
        output: "",
        error: `Unsupported language: ${language}. Python executor only supports Python.`,
      };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Capture stdout and stderr
      let stdout = "";
      let stderr = "";

      // Set up capture functions
      this.pyodide.runPython(`
        import sys
        from io import StringIO
        
        # Capture stdout
        captured_output = StringIO()
        sys.stdout = captured_output
        
        # Capture stderr
        captured_error = StringIO()
        sys.stderr = captured_error
      `);

      // Run the code
      this.pyodide.runPython(code);

      // Get captured output
      stdout = this.pyodide.runPython("captured_output.getvalue()");
      stderr = this.pyodide.runPython("captured_error.getvalue()");

      // Restore original stdout/stderr
      this.pyodide.runPython(`
        import sys
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__
      `);

      return {
        success: true,
        output: stdout,
        error: stderr || undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        output: "",
        error: error.message || "An unknown error occurred during Python execution",
      };
    }
  }
}