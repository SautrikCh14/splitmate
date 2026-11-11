import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/layout/PageHeader';
import Panel from '../components/ui/Panel';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonClasses';
import IconPicker from '../components/groups/IconPicker';
import { createGroup } from '../services/groupService';
import { validateGroupForm } from '../utils/groupValidation';
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY, DEFAULT_ICON } from '../utils/groupOptions';
import { getErrorMessage, getFieldErrors } from '../utils/apiError';

const MAX_DESCRIPTION = 200;

export default function CreateGroup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: '',
    description: '',
    icon: DEFAULT_ICON,
    currency: DEFAULT_CURRENCY,
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
      const group = await createGroup({
        name: values.name.trim(),
        description: values.description.trim(),
        icon: values.icon,
        currency: values.currency,
      });
      toast.success(`Created “${group.name}”`);
      navigate(`/groups/${group.id}`);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setFormError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="New group"
        title="Create a group"
        description="You’ll be the owner, and you can invite everyone else with a code."
      />

      <Panel className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {formError && (
            <p role="alert" className="rounded-control border border-negative px-4 py-3 text-sm text-negative">
              {formError}
            </p>
          )}

          <Input
            label="Group name"
            name="name"
            placeholder="Goa Trip 2026"
            maxLength={60}
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            error={errors.name}
          />

          <Textarea
            label="Description (optional)"
            name="description"
            placeholder="What is this group for?"
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
            error={errors.description}
            hint={`${values.description.length}/${MAX_DESCRIPTION}`}
          />

          <IconPicker value={values.icon} onChange={(icon) => setField('icon', icon)} />
          {errors.icon && <p className="-mt-3 text-sm text-negative">{errors.icon}</p>}

          <Select
            label="Currency"
            name="currency"
            value={values.currency}
            onChange={(event) => setField('currency', event.target.value)}
            error={errors.currency}
            hint="Can’t be changed after the group is created."
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" size="lg" loading={submitting}>
              Create group
            </Button>
            <Link to="/groups" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              Cancel
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}