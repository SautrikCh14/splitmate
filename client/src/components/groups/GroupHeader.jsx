import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import GroupIcon from './GroupIcon';
import { can } from '../../utils/permissions';
import { ROLE_LABELS } from '../../utils/groupOptions';

const VISIBLE_AVATARS = 5;

export default function GroupHeader({ group, onEdit }) {
  const shown = group.members.slice(0, VISIBLE_AVATARS);
  const hidden = group.members.length - shown.length;

  return (
    <header>
      <Link to="/groups" className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All groups
      </Link>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-panel bg-accent-soft text-accent-strong">
            <GroupIcon name={group.icon} className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-semibold sm:text-5xl">{group.name}</h1>
              {group.myRole !== 'MEMBER' && <Badge tone="accent">{ROLE_LABELS[group.myRole]}</Badge>}
            </div>
            {group.description && <p className="mt-2 max-w-xl text-muted">{group.description}</p>}

            <div className="mt-4 flex items-center" aria-label={`${group.memberCount} members`}>
              <div className="flex -space-x-2">
                {shown.map((member) => (
                  <Avatar key={member.userId} name={member.name} size="sm" className="ring-2 ring-paper" />
                ))}
              </div>
              {hidden > 0 && <span className="ml-3 text-sm text-muted">+{hidden} more</span>}
            </div>
          </div>
        </div>

        {can(group.myRole, 'group:edit') && (
          <Button variant="secondary" onClick={onEdit}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit group
          </Button>
        )}
      </div>
    </header>
  );
}