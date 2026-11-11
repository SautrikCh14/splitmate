import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

const Select = forwardRef(function Select({ label, error, hint, id, className, children, ...props }, ref) {
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
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={messageId}
        className={cn(
          'w-full rounded-control border bg-paper px-3 py-2.5 text-sm shadow-inset',
          error ? 'border-negative' : 'border-line'
        )}
        {...props}
      >
        {children}
      </select>
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

export default Select;