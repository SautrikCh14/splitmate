import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// A dialog built on the browser's native <dialog> element. The browser itself keeps keyboard
// focus inside the dialog, closes it on Escape, and makes everything behind it inert.
export default function Modal({ open, onClose, title, description, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      // A press on the dimmed area behind the dialog closes it. (mousedown, not click,
      // so selecting text inside the dialog and releasing outside does not close it.)
      onMouseDown={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-panel border border-line bg-panel p-0 text-ink shadow-raised backdrop:bg-black/40"
    >
      {/* Content exists only while open, so every dialog starts fresh each time. */}
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-display text-2xl font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 rounded-control p-2 text-muted transition hover:bg-accent-soft hover:text-ink"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {description && (
            <p id={descriptionId} className="mt-2 text-sm text-muted">
              {description}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}