import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

// Static sample data for marketing only. Real figures come from the API in the app.
const expenses = [
  { title: 'Beach shack dinner', payer: 'Alex', amount: '₹3,600.00' },
  { title: 'Scooter rental', payer: 'Rahul', amount: '₹1,500.00' },
  { title: 'Groceries', payer: 'Aman', amount: '₹900.00' },
];

const settlements = [
  { from: 'Aman', to: 'Alex', amount: '₹1,100.00' },
  { from: 'Rahul', to: 'Alex', amount: '₹500.00' },
];

export default function HeroPreview() {
  return (
    <div
      className="rounded-panel bg-paper p-5 shadow-raised sm:p-7"
      role="img"
      aria-label="Sample SplitMate group view showing balances and suggested settlements"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Goa Trip 2026
          </p>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums text-positive sm:text-5xl">
            +₹1,600.00
          </p>
          <p className="mt-1 text-sm text-muted">You are owed, in total</p>
        </div>
        <div className="flex -space-x-2">
          <Avatar name="Alex Sharma" size="sm" className="ring-2 ring-paper" />
          <Avatar name="Rahul Verma" size="sm" className="ring-2 ring-paper" />
          <Avatar name="Aman Gupta" size="sm" className="ring-2 ring-paper" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Recent expenses
          </p>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {expenses.map((item) => (
              <li key={item.title} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted">{item.payer} paid</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{item.amount}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Settle up
          </p>
          <ul className="mt-2 space-y-3">
            {settlements.map((item) => (
              <li key={item.from} className="rounded-control border border-line p-3">
                <p className="text-sm">
                  <span className="font-medium">{item.from}</span> pays{' '}
                  <span className="font-medium">{item.to}</span>
                </p>
                <p className="mt-1 font-semibold tabular-nums">{item.amount}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Badge>Sample data</Badge>
      </div>
    </div>
  );
}