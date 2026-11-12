import Panel from '../ui/Panel';
import Button from '../ui/Button';
import { can, canLeave } from '../../utils/permissions';

export default function GroupDangerZone({ group, onLeave, onDelete }) {
  const mayLeave = canLeave(group.myRole);
  const mayDelete = can(group.myRole, 'group:delete');

  return (
    <Panel>
      <h2 className="font-display text-xl font-semibold">Leave or delete</h2>

      <div className="mt-4 divide-y divide-line border-y border-line">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Leave this group</p>
            <p className="text-sm text-muted">
              {mayLeave
                ? 'You will lose access. You can only leave once you have no expenses or payments in the group.'
                : 'As the owner you can’t leave. Make someone else the owner first (use Manage next to their name).'}
            </p>
          </div>
          {mayLeave && (
            <Button variant="danger" onClick={onLeave}>
              Leave group
            </Button>
          )}
        </div>

        {mayDelete && (
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Delete this group</p>
              <p className="text-sm text-muted">
                Removes the group for everyone. Only groups with no expenses or payments can be deleted.
              </p>
            </div>
            <Button variant="danger" onClick={onDelete}>
              Delete group
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}