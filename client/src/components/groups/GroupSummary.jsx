import Panel from '../ui/Panel';
import { formatMoney } from '../../utils/formatMoney';

const labelClass = 'text-xs font-semibold uppercase tracking-widest text-muted';

export default function GroupSummary({ group }) {
  return (
    <Panel>
      <dl className="grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
        <div className="sm:pr-6">
          <dt className={labelClass}>Total expenses</dt>
          <dd className="mt-3 font-display text-3xl font-semibold tabular-nums">
            {formatMoney(group.totalExpenses, { currency: group.currency })}
          </dd>
        </div>
        <div className="sm:px-6">
          <dt className={labelClass}>Members</dt>
          <dd className="mt-3 font-display text-3xl font-semibold tabular-nums">{group.memberCount}</dd>
        </div>
        <div className="sm:pl-6">
          <dt className={labelClass}>Your balance</dt>
          <dd className="mt-3 font-display text-3xl font-semibold text-muted">—</dd>
          <p className="mt-1 text-xs text-muted">Shown once the group has expenses.</p>
        </div>
      </dl>
    </Panel>
  );
}