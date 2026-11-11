import { cn } from '../../utils/cn';

// A grey placeholder shown while content loads.
export default function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-control bg-line', className)} />;
}