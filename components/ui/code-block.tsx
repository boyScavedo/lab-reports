"use client";

import { useEffect, useState } from "react";
import { getHighlighter, BuiltinTheme } from "shiki";

interface CodeBlockProps {
  code: string;
  lang: string;
  theme?: BuiltinTheme;
}

export function CodeBlock({ code, lang, theme = "github-dark" }: CodeBlockProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const highlighter = await getHighlighter({
          themes: [theme],
          langs: [lang],
        });

        const html = highlighter.codeToHtml(code, {
          lang,
          theme,
        });

        setHighlightedCode(html);
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain text
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
      }
    };

    highlightCode();
  }, [code, lang, theme]);

  // Simple HTML escape function
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div
      className="overflow-auto max-h-[60vh]"
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}

export default CodeBlock;