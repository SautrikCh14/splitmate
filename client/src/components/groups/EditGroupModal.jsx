import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import IconPicker from './IconPicker';
import { updateGroup } from '../../services/groupService';
import { validateGroupForm } from '../../utils/groupValidation';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';

const MAX_DESCRIPTION = 200;

function EditBody({ group, onClose, onSaved }) {
  const [values, setValues] = useState({
    name: group.name,
    description: group.description ?? '',
    icon: group.icon ?? 'users',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const found = validateGroupForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await updateGroup(group.id, {
        name: values.name.trim(),
        description: values.description.trim(),
        icon: values.icon,
      });
      onSaved();
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setFormError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-control border border-negative px-4 py-3 text-sm text-negative">
          {formError}
        </p>
      )}

      <Input
        label="Group name"
        name="name"
        maxLength={60}
        value={values.name}
        onChange={(event) => setField('name', event.target.value)}
        error={errors.name}
      />
      <Textarea
        label="Description (optional)"
        name="description"
        value={values.description}
        onChange={(event) => setField('description', event.target.value)}
        error={errors.description}
        hint={`${values.description.length}/${MAX_DESCRIPTION}`}
      />
      <IconPicker name="edit-icon" value={values.icon} onChange={(icon) => setField('icon', icon)} />
      {errors.icon && <p className="-mt-2 text-sm text-negative">{errors.icon}</p>}

      <p className="text-sm text-muted">
        Currency: <span className="font-medium text-ink">{group.currency}</span> (can’t be changed)
      </p>

      <div className="flex flex-wrap justify-end gap-3 pt-1">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

export default function EditGroupModal({ open, group, onClose, onSaved }) {
  return (
    <Modal open={open} onClose={onClose} title="Edit group">
      {open && <EditBody group={group} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}