import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatCompactMoney, formatMoney } from '../../utils/formatMoney';

export default function MonthlySpendingChart({ data }) {
  const description = data
    .map((point) => `${point.month}: ${formatMoney(point.amount)}`)
    .join('; ');

  return (
    <div role="img" aria-label={`Monthly spending. ${description}`}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
          />
          <YAxis
            width={52}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactMoney}
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-accent-soft)' }} />
          <Bar dataKey="amount" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}