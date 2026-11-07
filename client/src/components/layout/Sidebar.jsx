import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { navItems } from './navItems';
import { cn } from '../../utils/cn';

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-paper text-accent-strong shadow-inset'
      : 'text-muted hover:bg-accent-soft hover:text-ink'
  );

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line px-4 py-6 md:flex">
      <NavLink to="/dashboard" className="px-3 font-display text-2xl font-semibold">
        SplitMate
      </NavLink>

      <nav aria-label="Main" className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/profile" className={linkClass}>
        <Settings className="h-4 w-4" aria-hidden="true" />
        Profile &amp; settings
      </NavLink>
    </aside>
  );
}