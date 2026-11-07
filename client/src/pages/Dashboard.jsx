import { Link } from 'react-router-dom';
import { Plus, Users, HandCoins } from 'lucide-react';
import { buttonClasses } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import BalanceSummary from '../components/dashboard/BalanceSummary';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import OutstandingBalances from '../components/dashboard/OutstandingBalances';
import MyGroups from '../components/dashboard/MyGroups';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { dashboardPlaceholder as data } from '../data/dashboardPlaceholder';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const firstName = data.user.name.split(' ')[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Placeholder data</Badge>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {getGreeting()}, {firstName}.
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/expenses/new" className={buttonClasses()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add expense
          </Link>
          <Link to="/groups/new" className={buttonClasses({ variant: 'secondary' })}>
            <Users className="h-4 w-4" aria-hidden="true" />
            Create group
          </Link>
          <Link to="/settlements" className={buttonClasses({ variant: 'secondary' })}>
            <HandCoins className="h-4 w-4" aria-hidden="true" />
            Settle up
          </Link>
        </div>
      </header>

      <BalanceSummary summary={data.summary} />

      <div className="grid gap-5 lg:grid-cols-12">
        <RecentTransactions transactions={data.transactions} />
        <OutstandingBalances owedToYou={data.owedToYou} youOwe={data.youOwe} />
        <MyGroups groups={data.groups} />
        <ActivityFeed activity={data.activity} />
      </div>
    </div>
  );
}