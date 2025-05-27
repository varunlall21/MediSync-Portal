
"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <Logo className="mb-8" />
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h2 className="text-3xl font-semibold text-foreground mb-3">Oops! Something went wrong.</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected issue. Please try again, or contact support if the problem persists.
      </p>
      <p className="text-sm text-muted-foreground mb-2">Error details (for support):</p>
      <pre className="text-xs bg-muted/50 p-3 rounded-md text-left max-w-xl overflow-auto mb-8">
        {error.message}
        {error.digest && `\nDigest: ${error.digest}`}
      </pre>
      <div className="flex gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="default"
          size="lg"
        >
          Try Again
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
          size="lg"
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}
