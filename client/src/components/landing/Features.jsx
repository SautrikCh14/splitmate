import { Receipt, Scale, Users, HandCoins, TrendingUp } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Panel from '../ui/Panel';
import { cn } from '../../utils/cn';

// Panels are deliberately different widths (bento rhythm).
const features = [
  {
    icon: Receipt,
    title: 'Easy expense splitting',
    text: 'Split equally, by exact amounts, by percentage or by shares. Every paisa is accounted for, so nothing is lost or created by rounding.',
    span: 'lg:col-span-7',
  },
  {
    icon: Scale,
    title: 'Smart balance calculations',
    text: 'Balances are worked out from the full history of expenses and payments, so they are always consistent.',
    span: 'lg:col-span-5',
  },
  {
    icon: Users,
    title: 'Group management',
    text: 'Trips, flats, dinners. Invite people with a code and keep each group separate.',
    span: 'lg:col-span-4',
  },
  {
    icon: HandCoins,
    title: 'Simplified settlements',
    text: 'See the fewest payments that clear every debt, instead of a web of small ones.',
    span: 'lg:col-span-4',
  },
  {
    icon: TrendingUp,
    title: 'Expense analytics',
    text: 'Spot where the money goes, by month, category and group.',
    span: 'lg:col-span-4',
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-4 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <SectionHeading eyebrow="Features" title="Everything a group needs, and nothing it doesn’t." />

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          {features.map(({ icon: Icon, title, text, span }) => (
            <Panel key={title} as="article" className={cn('flex flex-col', span)}>
              <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 max-w-md text-muted">{text}</p>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}