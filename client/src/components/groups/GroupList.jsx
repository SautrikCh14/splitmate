import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import GroupIcon from './GroupIcon';
import { formatMoney } from '../../utils/formatMoney';
import { ROLE_LABELS } from '../../utils/groupOptions';

export default function GroupList({ groups }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {groups.map((group) => (
        <li key={group.id}>
          <Link
            to={`/groups/${group.id}`}
            className="flex items-center gap-4 rounded-control px-2 py-4 transition hover:bg-accent-soft"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-strong">
              <GroupIcon name={group.icon} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-medium">{group.name}</span>
                {group.myRole !== 'MEMBER' && <Badge tone="accent">{ROLE_LABELS[group.myRole]}</Badge>}
              </span>
              {group.description && (
                <span className="block truncate text-sm text-muted">{group.description}</span>
              )}
            </span>

            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold tabular-nums">
                {formatMoney(group.totalExpenses, { currency: group.currency })}
              </span>
              <span className="block text-xs text-muted">
                {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
              </span>
            </span>

            <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}