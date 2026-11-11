export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </header>
  );
}