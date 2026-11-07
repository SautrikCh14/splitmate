import Panel from '../ui/Panel';
import PanelHeader from './PanelHeader';
import { formatMoney } from '../../utils/formatMoney';
import { formatShortDate } from '../../utils/formatDate';

export default function RecentTransactions({ transactions }) {
  return (
    <Panel className="lg:col-span-7">
      <PanelHeader title="Recent transactions" to="/expenses" />
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {transactions.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="truncate text-xs text-muted">
                {item.group} · {item.payer} paid · {formatShortDate(item.date)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold tabular-nums">{formatMoney(item.total)}</p>
              <p className="text-xs tabular-nums text-muted">
                Your share {formatMoney(item.yourShare)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}