import { formatMoney } from '../../utils/formatMoney';

// Shared tooltip for money charts. Values are integer paise.
export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];

  return (
    <div className="rounded-control border border-line bg-panel px-3 py-2 text-sm shadow-raised-sm">
      <p className="text-xs text-muted">{label ?? point.name}</p>
      <p className="font-semibold tabular-nums">{formatMoney(point.value)}</p>
    </div>
  );
}