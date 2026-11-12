import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { removeMember, setMemberRole } from '../../services/groupService';
import { memberActions } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/apiError';

// Steps: "menu" lists the actions; the other two ask for confirmation before anything happens.
function ManageBody({ group, member, myUserId, onChanged }) {
  const [step, setStep] = useState('menu');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const actions = memberActions(group.myRole, myUserId, member);

  async function run(task, successMessage) {
    setBusy(true);
    setError('');
    try {
      await task();
      onChanged(successMessage);
    } catch (taskError) {
      setError(getErrorMessage(taskError));
      setBusy(false);
    }
  }

  const changeRole = (role, message) => run(() => setMemberRole(group.id, member.userId, role), message);

  let body;
  if (step === 'remove') {
    body = (
      <>
        <p className="text-sm">
          {member.name} will lose access to {group.name} straight away. They can rejoin later with a new invite code.
        </p>
        <Confirm
          busy={busy}
          label="Remove from group"
          onBack={() => setStep('menu')}
          onConfirm={() => run(() => removeMember(group.id, member.userId), `${member.name} was removed`)}
        />
      </>
    );
  } else if (step === 'owner') {
    body = (
      <>
        <p className="text-sm">
          {member.name} becomes the owner of {group.name}, and you become an admin. Only the owner can delete the
          group or change roles, and this can only be undone by the new owner.
        </p>
        <Confirm
          busy={busy}
          label="Make owner"
          onBack={() => setStep('menu')}
          onConfirm={() => changeRole('OWNER', `${member.name} is now the owner`)}
        />
      </>
    );
  } else {
    body = (
      <div className="flex flex-col gap-3">
        {actions.canSetRole && member.role === 'MEMBER' && (
          <Button variant="secondary" onClick={() => changeRole('ADMIN', `${member.name} is now an admin`)} loading={busy}>
            Make admin
          </Button>
        )}
        {actions.canSetRole && member.role === 'ADMIN' && (
          <Button variant="secondary" onClick={() => changeRole('MEMBER', `${member.name} is now a member`)} loading={busy}>
            Make regular member
          </Button>
        )}
        {actions.canSetRole && (
          <Button variant="secondary" onClick={() => setStep('owner')} disabled={busy}>
            Make owner…
          </Button>
        )}
        {actions.canRemove && (
          <Button variant="danger" onClick={() => setStep('remove')} disabled={busy}>
            Remove from group…
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="rounded-control border border-negative px-4 py-3 text-sm text-negative">
          {error}
        </p>
      )}
      {body}
    </div>
  );
}

function Confirm({ busy, label, onBack, onConfirm }) {
  return (
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      <Button variant="secondary" onClick={onBack} disabled={busy}>
        Back
      </Button>
      <Button variant="danger" onClick={onConfirm} loading={busy}>
        {label}
      </Button>
    </div>
  );
}

export default function MemberManageModal({ group, member, myUserId, onClose, onChanged }) {
  return (
    <Modal
      open={Boolean(member)}
      onClose={onClose}
      title={member ? `Manage ${member.name}` : 'Manage member'}
      description={member ? `Currently ${member.role === 'ADMIN' ? 'an admin' : 'a member'} of ${group.name}.` : undefined}
    >
      {member && (
        <ManageBody group={group} member={member} myUserId={myUserId} onChanged={onChanged} />
      )}
    </Modal>
  );
}