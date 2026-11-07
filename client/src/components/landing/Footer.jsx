import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">SplitMate</p>
          <p className="mt-1 text-sm text-muted">Split expenses. Not friendships.</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <a href="#about" className="text-muted transition hover:text-ink">About</a>
          <Link to="/contact" className="text-muted transition hover:text-ink">Contact</Link>
          <Link to="/privacy" className="text-muted transition hover:text-ink">Privacy Policy</Link>
          <Link to="/terms" className="text-muted transition hover:text-ink">Terms</Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-muted sm:px-8">
          © {new Date().getFullYear()} SplitMate
        </p>
      </div>
    </footer>
  );
}