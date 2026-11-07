import { Link } from 'react-router-dom';
import Panel from '../ui/Panel';
import PanelHeader from './PanelHeader';
import { formatMoney } from '../../utils/formatMoney';
import { cn } from '../../utils/cn';

export default function MyGroups({ groups }) {
  return (
    <Panel className="lg:col-span-5">
      <PanelHeader title="My groups" to="/groups" />
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {groups.map((group) => (
          <li key={group.id}>
            <Link
              to="/groups"
              className="flex items-center gap-3 rounded-control py-3 transition hover:bg-accent-soft"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent-soft font-display text-lg font-semibold text-accent-strong"
              >
                {group.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{group.name}</p>
                <p className="text-xs text-muted">
                  {group.members} members · {formatMoney(group.total)} spent
                </p>
              </div>
              <p
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  group.balance >= 0 ? 'text-positive' : 'text-negative'
                )}
              >
                {formatMoney(group.balance, { sign: true })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}