import { Loader2 } from 'lucide-react';

export default function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center text-sm text-muted"
    >
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}