export default function PagePlaceholder({ title }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Coming soon
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
    </div>
  );
}