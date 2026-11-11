import { Link } from 'react-router-dom';
import { AlertCircle, KeyRound, Plus, Users } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonClasses';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import GroupList from '../components/groups/GroupList';
import { useFetch } from '../hooks/useFetch';
import { listGroups } from '../services/groupService';
import { getErrorMessage } from '../utils/apiError';

function GroupListSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading your groups…
      </p>
      <div className="divide-y divide-line border-y border-line">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-4 px-2 py-4">
            <Skeleton className="h-11 w-11 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Groups() {
  const { data: groups, error, loading, reload } = useFetch(listGroups);

  let content;
  if (loading) {
    content = <GroupListSkeleton />;
  } else if (error) {
    content = (
      <div role="alert">
        <EmptyState
          icon={AlertCircle}
          title="We couldn’t load your groups"
          description={getErrorMessage(error)}
        >
          <Button variant="secondary" onClick={reload}>
            Try again
          </Button>
        </EmptyState>
      </div>
    );
  } else if (groups.length === 0) {
    content = (
      <EmptyState
        icon={Users}
        title="No groups yet"
        description="Create a group for a trip, a flat or a dinner, or join one with an invite code."
      >
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/groups/new" className={buttonClasses()}>
            Create your first group
          </Link>
          <Link to="/groups/join" className={buttonClasses({ variant: 'secondary' })}>
            Join with code
          </Link>
        </div>
      </EmptyState>
    );
  } else {
    content = <GroupList groups={groups} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your groups"
        title="Groups"
        description="Trips, flats, dinners: every shared tab lives in a group."
      >
        <Link to="/groups/new" className={buttonClasses()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create group
        </Link>
        <Link to="/groups/join" className={buttonClasses({ variant: 'secondary' })}>
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Join with code
        </Link>
      </PageHeader>

      <Panel>{content}</Panel>
    </div>
  );
}