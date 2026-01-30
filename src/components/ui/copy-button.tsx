import React, { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export function CopyButton({ value, className, variant = 'ghost' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn('h-8 w-8', className)}
      onClick={copy}
    >
      {copied ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
}

interface CopyFieldProps {
  label?: string;
  value: string;
  masked?: boolean;
}

export function CopyField({ label, value, masked = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const displayValue = masked ? '•'.repeat(Math.min(value.length, 32)) : value;

  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 border border-border">
        <code className="flex-1 text-sm font-mono text-foreground truncate">
          {displayValue}
        </code>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 shrink-0"
          onClick={copy}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-success mr-1" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
