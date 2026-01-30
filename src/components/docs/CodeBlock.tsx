import React from 'react';
import { CopyButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'bash', filename, showLineNumbers = false }: CodeBlockProps) {
  const lines = code.split('\n');

  return (
    <div className="relative rounded-lg border border-border bg-secondary/80 overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary">
          <span className="text-xs font-mono text-muted-foreground">{filename}</span>
          <CopyButton value={code} className="h-6 w-6" />
        </div>
      )}
      <div className="relative">
        {!filename && (
          <CopyButton 
            value={code} 
            className="absolute top-2 right-2 h-7 w-7 bg-secondary/80 hover:bg-secondary" 
          />
        )}
        <pre className={cn(
          "p-4 overflow-x-auto text-sm",
          !filename && "pr-12"
        )}>
          <code className="font-mono text-foreground">
            {showLineNumbers ? (
              lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="select-none text-muted-foreground w-8 shrink-0 text-right pr-4">
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </div>
              ))
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
