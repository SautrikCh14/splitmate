import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { getErrorMessage } from '../../utils/apiError';

// Lives inside the Modal, so its busy and error state reset every time the dialog reopens.
function ConfirmBody({ onClose, onConfirm, confirmLabel, tone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="rounded-control border border-negative px-4 py-3 text-sm text-negative">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant={tone} onClick={handleConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

// "Are you sure?" for actions that cannot be undone. onConfirm may throw;
// the message is then shown in the dialog and nothing closes.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'danger',
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <ConfirmBody onClose={onClose} onConfirm={onConfirm} confirmLabel={confirmLabel} tone={tone} />
    </Modal>
  );
}