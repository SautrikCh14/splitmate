import { Link } from 'react-router-dom';

const points = [
  'Splits that are exact to the paisa',
  'Balances recalculated from every entry',
  'Private to the members of your group',
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-12">
      <aside className="hidden border-r border-line p-12 lg:col-span-5 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="font-display text-2xl font-semibold">
          SplitMate
        </Link>

        <div>
          <p className="font-display text-4xl font-semibold leading-tight">
            <span className="block">Split expenses.</span>
            <span className="block">Not friendships.</span>
          </p>
          <ul className="mt-8 divide-y divide-line border-y border-line text-sm text-muted">
            {points.map((point) => (
              <li key={point} className="py-3">
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted">© {new Date().getFullYear()} SplitMate</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-8 lg:col-span-7">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl font-semibold lg:hidden">
            SplitMate
          </Link>

          <h1 className="mt-8 font-display text-4xl font-semibold lg:mt-0">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}