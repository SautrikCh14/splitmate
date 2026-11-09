import { Link } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/apiError';

export default function Topbar() {
  const { user, logout } = useAuth();

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not log out. Please try again.'));
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
      <div>
        <Link to="/dashboard" className="font-display text-xl font-semibold md:hidden">
          SplitMate
        </Link>
        <p className="hidden text-sm text-muted md:block">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-control p-2 text-muted transition hover:bg-accent-soft hover:text-ink"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link to="/profile" aria-label="Profile and settings">
          <Avatar name={user?.name} />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="rounded-control p-2 text-muted transition hover:bg-accent-soft hover:text-ink"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}