import Panel from '../ui/Panel';
import PanelHeader from './PanelHeader';

export default function ActivityFeed({ activity }) {
  return (
    <Panel className="lg:col-span-7">
      <PanelHeader title="Recent activity" />
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {activity.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3">
            <div>
              <p className="text-sm">{item.text}</p>
              <p className="text-xs text-muted">{item.group}</p>
            </div>
            <p className="shrink-0 text-xs text-muted">{item.when}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}