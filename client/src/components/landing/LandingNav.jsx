import { Link } from 'react-router-dom';
import { buttonClasses } from '../ui/Button';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#about', label: 'About' },
];

export default function LandingNav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="font-display text-2xl font-semibold">
          SplitMate
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
            Login
          </Link>
          <Link to="/register" className={buttonClasses({ size: 'sm' })}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}