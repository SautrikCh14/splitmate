import { useEffect, useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Panel from '../ui/Panel';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { addMemberByEmail } from '../../services/groupService';
import { describeInviteExpiry } from '../../utils/inviteExpiry';
import { validateEmail } from '../../utils/groupValidation';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';

export default function InvitePanel({ group, onRegenerate, onMemberAdded }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [adding, setAdding] = useState(false);

  // "Copied" goes back to "Copy" after two seconds.
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
    } catch {
      toast.error('Couldn’t copy automatically. Select the code and copy it.');
    }
  }

  async function handleAdd(event) {
    event.preventDefault();
    const problem = validateEmail(email);
    setEmailError(problem);
    if (problem) return;

    setAdding(true);
    try {
      const message = await addMemberByEmail(group.id, email.trim());
      toast.success(message);
      setEmail('');
      onMemberAdded();
    } catch (error) {
      setEmailError(getFieldErrors(error).email || getErrorMessage(error));
    } finally {
      setAdding(false);
    }
  }

  return (
    <Panel className="lg:col-span-5">
      <h2 className="font-display text-xl font-semibold">Invite people</h2>
      <p className="mt-1 text-sm text-muted">Share this code. Anyone who has it can join the group.</p>

      <div className="mt-5 rounded-control border border-line p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Invite code</p>
        <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.2em]" data-testid="invite-code">
          {group.inviteCode}
        </p>
        <p className="mt-2 text-sm text-muted">{describeInviteExpiry(group.inviteExpiresAt)}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy code'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            New code
          </Button>
        </div>
      </div>

      <form onSubmit={handleAdd} noValidate className="mt-6">
        <Input
          label="Or add someone by email"
          name="member-email"
          type="email"
          autoComplete="off"
          placeholder="friend@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) setEmailError('');
          }}
          error={emailError}
          hint="They need to have a SplitMate account already."
        />
        <Button type="submit" variant="secondary" size="sm" className="mt-3" loading={adding}>
          Add member
        </Button>
      </form>
    </Panel>
  );
}