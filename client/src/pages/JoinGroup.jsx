import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/layout/PageHeader';
import Panel from '../components/ui/Panel';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonClasses';
import { joinGroup } from '../services/groupService';
import { validateJoinCode } from '../utils/groupValidation';
import { getErrorMessage, getFieldErrors } from '../utils/apiError';

export default function JoinGroup() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const found = validateJoinCode(code);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const group = await joinGroup(code.trim());
      toast.success(`You joined “${group.name}”`);
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
        eyebrow="Join a group"
        title="Join with a code"
        description="Ask a group owner or admin for the 8-character invite code."
      />

      <Panel className="max-w-md">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {formError && (
            <p role="alert" className="rounded-control border border-negative px-4 py-3 text-sm text-negative">
              {formError}
            </p>
          )}

          <Input
            label="Invite code"
            name="code"
            placeholder="ABCD2345"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              if (errors.code) setErrors({});
            }}
            error={errors.code}
          />

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" loading={submitting}>
              Join group
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