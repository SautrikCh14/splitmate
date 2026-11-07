import { cn } from '../../utils/cn';

// raised = neumorphic highlight panel (use sparingly, for key figures).
// Default = flat panel with a hairline border.
export default function Panel({
  as: Tag = 'section',
  raised = false,
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(
        'rounded-panel p-6',
        raised ? 'bg-paper shadow-raised' : 'border border-line',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}