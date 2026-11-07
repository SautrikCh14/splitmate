import { Link } from 'react-router-dom';

export default function PanelHeader({ title, to, linkLabel = 'View all' }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {to && (
        <Link to={to} className="text-sm font-medium text-accent-strong underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}