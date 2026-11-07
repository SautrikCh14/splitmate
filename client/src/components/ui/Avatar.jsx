import { cn } from '../../utils/cn';

const palettes = [
  'bg-[#dcd6f5] text-[#3b2f8f]',
  'bg-[#d3e6dc] text-[#1f5238]',
  'bg-[#f2d9d3] text-[#80301f]',
  'bg-[#e8e0c8] text-[#5c4a14]',
  'bg-[#d4e1ee] text-[#274a6b]',
];

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function getPalette(name = '') {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return palettes[sum % palettes.length];
}

export default function Avatar({ name = '', size = 'md', className }) {
  return (
    <span
      role="img"
      aria-label={name || 'User'}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizes[size],
        getPalette(name),
        className
      )}
    >
      {getInitials(name) || '?'}
    </span>
  );
}