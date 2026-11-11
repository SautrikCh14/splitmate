import { GROUP_ICONS } from '../../utils/groupIcons';

export default function GroupIcon({ name, className = 'h-5 w-5' }) {
  const { Icon } = GROUP_ICONS[name] ?? GROUP_ICONS.users;
  return <Icon className={className} aria-hidden="true" />;
}