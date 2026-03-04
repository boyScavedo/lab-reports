import { fetchRepoContents } from "./actions/github";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, FileText, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Determine language from file extension
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py':
      return 'Python';
    case 'c':
      return 'C';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'C++';
    case 'js':
      return 'JavaScript';
    case 'ts':
      return 'TypeScript';
    case 'md':
      return 'Markdown';
    case 'java':
      return 'Java';
    case 'go':
      return 'Go';
    case 'rs':
      return 'Rust';
    case 'php':
      return 'PHP';
    case 'rb':
      return 'Ruby';
    case 'swift':
      return 'Swift';
    case 'kt':
    case 'kts':
      return 'Kotlin';
    default:
      return ext ? ext.charAt(0).toUpperCase() + ext.slice(1) : 'Unknown';
  }
};

// Get language color badge
const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    Python: 'bg-blue-500',
    C: 'bg-gray-700',
    'C++': 'bg-blue-700',
    JavaScript: 'bg-yellow-500',
    TypeScript: 'bg-blue-600',
    Markdown: 'bg-gray-500',
    Java: 'bg-red-600',
    Go: 'bg-blue-400',
    Rust: 'bg-orange-600',
    PHP: 'bg-purple-600',
    Ruby: 'bg-red-500',
    Swift: 'bg-orange-500',
    Kotlin: 'bg-purple-500',
  };
  return colors[language] || 'bg-gray-500';
};

export default async function Home() {
  let files = [];
  let error = null;

  try {
    files = await fetchRepoContents();
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Lab Reports</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="mr-1 h-4 w-4" />
                GitHub
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Lab Report Showcase</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore and execute code examples from our lab reports. All code is fetched directly from GitHub and runs in your browser.
          </p>
        </div>

        {error ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please check your GitHub configuration and ensure the repository is accessible.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : files.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>No Lab Reports Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No code files were found in the configured GitHub repository.
                  Supported formats: .py, .c, .cpp, .h, .md
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => {
              const language = getLanguageFromExtension(file.name);
              const languageColor = getLanguageColor(language);
              
              return (
                <Link 
                  key={file.path} 
                  href={`/report/${encodeURIComponent(file.path)}`}
                  className="block transform transition-transform duration-200 hover:scale-[1.02]"
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg truncate">{file.name}</CardTitle>
                        <Badge className={`${languageColor} text-white ml-2`} variant="secondary">
                          {language}
                        </Badge>
                      </div>
                      <CardDescription>
                        {new Date().toLocaleDateString()} {/* Using current date since we don't have actual modification date */}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Play className="mr-1 h-4 w-4" />
                        <span>Click to view and run</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, TypeScript, and WebAssembly • Lab Report Showcase</p>
        </div>
      </footer>
    </div>
  );
}
