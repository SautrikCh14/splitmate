import { Link } from 'react-router-dom';
import Panel from '../ui/Panel';
import Avatar from '../ui/Avatar';
import PanelHeader from './PanelHeader';
import { buttonClasses } from '../ui/buttonClasses';
import { formatMoney } from '../../utils/formatMoney';
import { cn } from '../../utils/cn';

function BalanceList({ title, people, tone }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</p>
      {people.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nobody here. All square.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {people.map((person) => (
            <li key={person.id} className="flex items-center gap-3 py-3">
              <Avatar name={person.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="truncate text-xs text-muted">{person.group}</p>
              </div>
              <p className={cn('text-sm font-semibold tabular-nums', tone)}>
                {formatMoney(person.amount)}
              </p>
              <Link to="/settlements" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
                Settle
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OutstandingBalances({ owedToYou, youOwe }) {
  return (
    <Panel className="lg:col-span-5">
      <PanelHeader title="Outstanding balances" to="/balances" />
      <div className="mt-4 space-y-6">
        <BalanceList title="Owed to you" people={owedToYou} tone="text-positive" />
        <BalanceList title="You owe" people={youOwe} tone="text-negative" />
      </div>
    </Panel>
  );
}