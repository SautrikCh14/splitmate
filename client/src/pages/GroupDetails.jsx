import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonClasses';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Skeleton from '../components/ui/Skeleton';
import GroupHeader from '../components/groups/GroupHeader';
import GroupSummary from '../components/groups/GroupSummary';
import MemberList from '../components/groups/MemberList';
import MemberManageModal from '../components/groups/MemberManageModal';
import InvitePanel from '../components/groups/InvitePanel';
import RegenerateInviteModal from '../components/groups/RegenerateInviteModal';
import EditGroupModal from '../components/groups/EditGroupModal';
import GroupDangerZone from '../components/groups/GroupDangerZone';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { deleteGroup, getGroup, leaveGroup } from '../services/groupService';
import { can } from '../utils/permissions';
import { getErrorMessage } from '../utils/apiError';

function GroupDetailsSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <p className="sr-only" role="status">
        Loading group…
      </p>
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function GroupLoadError({ error, onRetry }) {
  const notFound = error?.response?.status === 404;

  return (
    <Panel>
      <div role="alert">
        <EmptyState
          icon={AlertCircle}
          title={notFound ? 'We couldn’t find that group' : 'We couldn’t load this group'}
          description={
            notFound
              ? 'It may have been deleted, or you may no longer be a member.'
              : getErrorMessage(error)
          }
        >
          {notFound ? (
            <Link to="/groups" className={buttonClasses({ variant: 'secondary' })}>
              Back to your groups
            </Link>
          ) : (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </EmptyState>
      </div>
    </Panel>
  );
}

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchGroup = useCallback(() => getGroup(id), [id]);
  const { data: group, error, loading, reload } = useFetch(fetchGroup);

  const [editOpen, setEditOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [managedMember, setManagedMember] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Only the very first load shows the skeleton. Later reloads keep the page on screen.
  if (!group) {
    return loading ? <GroupDetailsSkeleton /> : <GroupLoadError error={error} onRetry={reload} />;
  }

  async function handleLeave() {
    await leaveGroup(group.id);
    toast.success(`You left “${group.name}”`);
    navigate('/groups');
  }

  async function handleDelete() {
    await deleteGroup(group.id);
    toast.success(`Deleted “${group.name}”`);
    navigate('/groups');
  }

  return (
    <div className="space-y-8">
      <GroupHeader group={group} onEdit={() => setEditOpen(true)} />
      <GroupSummary group={group} />

      <div className="grid gap-5 lg:grid-cols-12">
        <MemberList
          members={group.members}
          myUserId={user.id}
          myRole={group.myRole}
          onManage={setManagedMember}
        />
        {can(group.myRole, 'invite:view') && (
          <InvitePanel group={group} onRegenerate={() => setRegenerateOpen(true)} onMemberAdded={reload} />
        )}
      </div>

      <Panel>
        <h2 className="font-display text-xl font-semibold">Expenses</h2>
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Once expenses are added, the history and who owes whom appear here."
        >
          <Link to="/expenses/new" className={buttonClasses({ variant: 'secondary' })}>
            Add expense
          </Link>
        </EmptyState>
      </Panel>

      <GroupDangerZone group={group} onLeave={() => setLeaveOpen(true)} onDelete={() => setDeleteOpen(true)} />

      <EditGroupModal
        open={editOpen}
        group={group}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          toast.success('Group updated');
          reload();
        }}
      />
      <RegenerateInviteModal
        open={regenerateOpen}
        groupId={group.id}
        onClose={() => setRegenerateOpen(false)}
        onDone={() => {
          setRegenerateOpen(false);
          toast.success('New invite code created');
          reload();
        }}
      />
      <MemberManageModal
        group={group}
        member={managedMember}
        myUserId={user.id}
        onClose={() => setManagedMember(null)}
        onChanged={(message) => {
          setManagedMember(null);
          toast.success(message);
          reload();
        }}
      />
      <ConfirmDialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={handleLeave}
        title={`Leave ${group.name}?`}
        description="You will lose access to this group. You can rejoin later with a new invite code."
        confirmLabel="Leave group"
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${group.name}?`}
        description="This removes the group for everyone and cannot be undone."
        confirmLabel="Delete group"
      />
    </div>
  );
}