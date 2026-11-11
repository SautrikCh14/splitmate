import { GROUP_ICONS, GROUP_ICON_KEYS } from '../../utils/groupIcons';
import { cn } from '../../utils/cn';

// A row of radio buttons drawn as icons. Arrow keys move between them, as with any radio group.
export default function IconPicker({ value, onChange, name = 'icon' }) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium">Icon</legend>
      <div className="flex flex-wrap gap-2">
        {GROUP_ICON_KEYS.map((key) => {
          const { Icon, label } = GROUP_ICONS[key];
          const checked = value === key;

          return (
            <label
              key={key}
              className={cn(
                'flex h-11 w-11 cursor-pointer items-center justify-center rounded-control border transition',
                'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent',
                checked
                  ? 'border-accent bg-paper text-accent-strong shadow-inset'
                  : 'border-line text-muted hover:bg-accent-soft hover:text-ink'
              )}
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={checked}
                onChange={() => onChange(key)}
                className="sr-only"
              />
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}