import { fetchRepoContents } from "@/app/actions/github";
import { CodeBlock } from "@/components/ui/code-block";
import { Terminal } from "@/components/ui/terminal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, Github, Copy, Check } from "lucide-react";
import { PythonExecutor } from "@/lib/execution";
import { getHighlighter, BuiltinTheme } from "shiki";
import { useState, useEffect } from "react";

// Determine language from file extension
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py':
      return 'python';
    case 'c':
      return 'c';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'md':
      return 'markdown';
    case 'java':
      return 'java';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'swift':
      return 'swift';
    case 'kt':
    case 'kts':
      return 'kotlin';
    default:
      return ext || 'unknown';
  }
};

// Get language color badge
const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    python: 'bg-blue-500',
    c: 'bg-gray-700',
    cpp: 'bg-blue-700',
    javascript: 'bg-yellow-500',
    typescript: 'bg-blue-600',
    markdown: 'bg-gray-500',
    java: 'bg-red-600',
    go: 'bg-blue-400',
    rust: 'bg-orange-600',
    php: 'bg-purple-600',
    ruby: 'bg-red-500',
    swift: 'bg-orange-500',
    kotlin: 'bg-purple-500',
  };
  return colors[language] || 'bg-gray-500';
};

export default async function ReportPage({ params }: { params: { slug: string } }) {
  const filePath = decodeURIComponent(params.slug);
  let file = null;
  let error = null;

  try {
    const files = await fetchRepoContents();
    file = files.find(f => f.path === filePath);
    
    if (!file) {
      error = "File not found";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred";
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "File not found"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const language = getLanguageFromExtension(file.name);
  const languageColor = getLanguageColor(language);
  const executor = new PythonExecutor();

  // Pre-highlight code for server-side rendering
  let highlightedCode = "";
  try {
    const highlighter = await getHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [language],
    });
    
    highlightedCode = highlighter.codeToHtml(file.content || "", {
      lang: language,
      theme: 'github-dark'
    });
  } catch (e) {
    highlightedCode = `<pre><code>${(file.content || "").replace(/[<>]/g, (match) => 
      match === '<' ? '&lt;' : '&gt;'
    )}</code></pre>`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Lab Reports</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a 
                href={`https://github.com/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/blob/main/${filePath}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="mr-1 h-4 w-4" />
                View on GitHub
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{file.name}</h1>
              <div className="flex items-center mt-2">
                <Badge className={`${languageColor} text-white`} variant="secondary">
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </Badge>
                <span className="ml-2 text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
            <ClientExecutionSection 
              initialCode={file.content || ""} 
              language={language} 
              executor={executor} 
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="overflow-auto max-h-[70vh]"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, TypeScript, and WebAssembly • Lab Report Showcase</p>
        </div>
      </footer>
    </div>
  );
}

// Client component for execution
function ClientExecutionSection({ initialCode, language, executor }: { 
  initialCode: string, 
  language: string, 
  executor: PythonExecutor 
}) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExecute = async () => {
    if (language !== "python") {
      setError(`${language.toUpperCase()} execution requires specific WebAssembly build configuration.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await executor.execute(code, language);
      
      if (result.success) {
        setOutput(result.output);
      } else {
        setError(result.error || "An unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={handleExecute} 
        disabled={isLoading || language !== "python"}
        variant="default"
        className="flex items-center"
      >
        <Play className="mr-2 h-4 w-4" />
        {isLoading ? "Running..." : "Run Code"}
      </Button>
      
      <Button 
        onClick={handleCopy}
        variant="outline"
        className="flex items-center"
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" /> Copy
          </>
        )}
      </Button>
      
      <Terminal output={output} error={error} />
    </div>
  );
}