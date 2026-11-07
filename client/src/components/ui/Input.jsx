import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  { label, error, hint, id, className, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={messageId}
        className={cn(
          'w-full rounded-control border bg-paper px-4 py-2.5 text-sm shadow-inset',
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

export default Input;