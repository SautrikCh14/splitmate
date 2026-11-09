import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-accent text-white shadow-raised-sm hover:bg-accent-strong active:shadow-inset',
  secondary: 'bg-paper text-ink shadow-raised-sm active:shadow-inset',
  danger: 'bg-paper text-negative shadow-raised-sm active:shadow-inset',
  ghost: 'bg-transparent text-ink hover:bg-accent-soft',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

// Use this on <Link> or <a> elements that should look like buttons.
export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  );
}