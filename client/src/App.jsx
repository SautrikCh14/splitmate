import { Inbox } from 'lucide-react';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import Panel from './components/ui/Panel';
import Avatar from './components/ui/Avatar';
import Badge from './components/ui/Badge';
import EmptyState from './components/ui/EmptyState';

export default function App() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="font-display text-4xl font-semibold">Component kit</h1>

      <div className="flex flex-wrap items-center gap-4">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="ghost">Ghost</Button>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Full name" placeholder="Alex Sharma" />
        <Input
          label="Email"
          placeholder="you@example.com"
          error="Enter a valid email address"
        />
      </div>

      <div className="flex items-center gap-4">
        <Avatar name="Alex Sharma" />
        <Avatar name="Rahul Verma" />
        <Avatar name="Aman Gupta" size="lg" />
        <Badge>Member</Badge>
        <Badge tone="accent">Owner</Badge>
        <Badge tone="positive">Settled</Badge>
        <Badge tone="negative">Owes you</Badge>
      </div>

      <Panel>
        <EmptyState
          icon={Inbox}
          title="No expenses yet"
          description="Add your first shared expense to start tracking balances."
        >
          <Button>Add expense</Button>
        </EmptyState>
      </Panel>
    </main>
  );
}