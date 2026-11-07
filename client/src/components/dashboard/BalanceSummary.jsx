import Panel from '../ui/Panel';
import { formatMoney } from '../../utils/formatMoney';
import { cn } from '../../utils/cn';

const labelClass = 'text-xs font-semibold uppercase tracking-widest text-muted';

export default function BalanceSummary({ summary }) {
  // Later this comes straight from the backend; computed here only for the placeholder.
  const net = summary.owedToYou - summary.youOwe;

  const figures = [
    { label: 'You owe', value: formatMoney(summary.youOwe), tone: 'text-negative' },
    { label: 'Owed to you', value: formatMoney(summary.owedToYou), tone: 'text-positive' },
    { label: 'Group expenses', value: formatMoney(summary.totalGroupExpenses), tone: 'text-ink' },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <Panel raised className="lg:col-span-5">
        <p className={labelClass}>Net balance</p>
        <p
          className={cn(
            'mt-3 font-display text-5xl font-semibold tabular-nums sm:text-6xl',
            net >= 0 ? 'text-positive' : 'text-negative'
          )}
        >
          {formatMoney(net, { sign: true })}
        </p>
        <p className="mt-2 text-sm text-muted">
          {net >= 0 ? 'Overall, you are owed money' : 'Overall, you owe money'}
        </p>
      </Panel>

      <Panel className="lg:col-span-7">
        <dl className="grid h-full gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
          {figures.map((item) => (
            <div key={item.label} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <dt className={labelClass}>{item.label}</dt>
              <dd
                className={cn(
                  'mt-3 font-display text-3xl font-semibold tabular-nums',
                  item.tone
                )}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}