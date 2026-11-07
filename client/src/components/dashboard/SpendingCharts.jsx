import Panel from '../ui/Panel';
import PanelHeader from './PanelHeader';
import MonthlySpendingChart from '../charts/MonthlySpendingChart';
import CategoryDonut from '../charts/CategoryDonut';

export default function SpendingCharts({ monthly, categories }) {
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <Panel className="lg:col-span-5">
        <PanelHeader title="Monthly spending" to="/analytics" linkLabel="Analytics" />
        <p className="mb-4 mt-1 text-sm text-muted">Your share, last 6 months</p>
        <MonthlySpendingChart data={monthly} />
      </Panel>

      <Panel className="lg:col-span-7">
        <PanelHeader title="Spending by category" to="/analytics" linkLabel="Analytics" />
        <p className="mb-4 mt-1 text-sm text-muted">Your share, this month</p>
        <CategoryDonut data={categories} />
      </Panel>
    </div>
  );
}