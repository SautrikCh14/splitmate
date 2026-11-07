import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatMoney } from '../../utils/formatMoney';

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

export default function CategoryDonut({ data }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const slices = data.map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));

  return (
    <div className="grid items-center gap-6 sm:grid-cols-5">
      <div
        className="sm:col-span-2"
        role="img"
        aria-label={`Spending by category. ${slices
          .map((item) => `${item.name}: ${formatMoney(item.amount)}`)
          .join('; ')}`}
      >
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="amount"
              nameKey="name"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              stroke="var(--color-paper)"
              strokeWidth={2}
            />
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="divide-y divide-line border-y border-line sm:col-span-3">
        {slices.map((item) => (
          <li key={item.name} className="flex items-center gap-3 py-2 text-sm">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: item.fill }}
            />
            <span className="min-w-0 flex-1">{item.name}</span>
            <span className="tabular-nums text-muted">
              {Math.round((item.amount * 100) / total)}%
            </span>
            <span className="w-20 text-right font-medium tabular-nums">
              {formatMoney(item.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}