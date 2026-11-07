export default function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h2>
      {children && <p className="mt-4 text-lg text-muted">{children}</p>}
    </div>
  );
}