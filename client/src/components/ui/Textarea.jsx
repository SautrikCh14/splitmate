import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

const Textarea = forwardRef(function Textarea({ label, error, hint, id, className, ...props }, ref) {
  const autoId = useId();
  const fieldId = id || autoId;
  const messageId = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={3}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={messageId}
        className={cn(
          'w-full resize-y rounded-control border bg-paper px-4 py-2.5 text-sm shadow-inset',
          'placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-negative' : 'border-line'
        )}
        {...props}
      />
      {error ? (
        <p id={messageId} className="mt-1.5 text-sm text-negative">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Textarea;