import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { regenerateInvite } from '../../services/groupService';
import { EXPIRY_CHOICES } from '../../utils/inviteExpiry';
import { getErrorMessage } from '../../utils/apiError';

function RegenerateBody({ groupId, onClose, onDone }) {
  const [days, setDays] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await regenerateInvite(groupId, days);
      onDone();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p role="alert" className="rounded-control border border-negative px-4 py-3 text-sm text-negative">
          {error}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">The new code…</legend>
        <div className="space-y-2">
          {EXPIRY_CHOICES.map((choice) => (
            <label key={choice.value} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="radio"
                name="expiry"
                value={choice.value}
                checked={days === choice.value}
                onChange={() => setDays(choice.value)}
                className="h-4 w-4 accent-accent"
              />
              {choice.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          Create new code
        </Button>
      </div>
    </form>
  );
}

export default function RegenerateInviteModal({ open, groupId, onClose, onDone }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a new invite code"
      description="The current code stops working immediately. People who are already in the group are not affected."
    >
      {open && <RegenerateBody groupId={groupId} onClose={onClose} onDone={onDone} />}
    </Modal>
  );
}