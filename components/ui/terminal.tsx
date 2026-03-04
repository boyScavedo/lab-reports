import { cn } from "@/lib/utils";

interface TerminalProps {
  output: string;
  error?: string;
  className?: string;
}

export function Terminal({ output, error, className }: TerminalProps) {
  return (
    <div 
      className={cn(
        "font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-md overflow-auto max-h-60",
        className
      )}
    >
      <div className="flex items-center mb-2">
        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
        <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
        <span className="w-3 h-3 rounded-full bg-green-500"></span>
      </div>
      <pre className="whitespace-pre-wrap break-words">
        {error ? (
          <span className="text-red-400">{error}</span>
        ) : (
          output || <span className="text-gray-500">No output...</span>
        )}
      </pre>
    </div>
  );
}

export default Terminal;