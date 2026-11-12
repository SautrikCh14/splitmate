import Panel from '../ui/Panel';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { memberActions } from '../../utils/permissions';
import { formatLongDate } from '../../utils/formatDate';
import { ROLE_LABELS } from '../../utils/groupOptions';

export default function MemberList({ members, myUserId, myRole, onManage }) {
  return (
    <Panel className="lg:col-span-7">
      <h2 className="font-display text-xl font-semibold">Members</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {members.map((member) => {
          const actions = memberActions(myRole, myUserId, member);
          const canManage = actions.canSetRole || actions.canRemove;

          return (
            <li key={member.userId} className="flex items-center gap-3 py-3">
              <Avatar name={member.name} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="truncate">{member.name}</span>
                  {member.userId === myUserId && <span className="text-xs font-normal text-muted">(you)</span>}
                  {member.role !== 'MEMBER' && (
                    <Badge tone={member.role === 'OWNER' ? 'accent' : 'neutral'}>{ROLE_LABELS[member.role]}</Badge>
                  )}
                </p>
                <p className="text-xs text-muted">Joined {formatLongDate(member.joinedAt)}</p>
              </div>
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManage(member)}
                  aria-label={`Manage ${member.name}`}
                >
                  Manage
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}