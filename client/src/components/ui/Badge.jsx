import { cn } from '../../utils/cn';

const tones = {
  neutral: 'bg-line text-ink',
  accent: 'bg-accent-soft text-accent-strong',
  positive: 'bg-[#d3e6dc] text-positive',
  negative: 'bg-[#f2d9d3] text-negative',
};

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}