import { ChevronDown } from 'lucide-react';
import SectionHeading from './SectionHeading';

const questions = [
  {
    q: 'Does SplitMate move real money?',
    a: 'No. It records expenses and payments so everyone can see where they stand. You settle up using cash, UPI or a bank transfer outside the app, then record the payment here.',
  },
  {
    q: 'How can an expense be split?',
    a: 'Four ways: equally, by exact amounts, by percentage, or by shares (for example, 2 shares for one person and 1 for another). The payer does not have to be part of the split.',
  },
  {
    q: 'What are simplified settlements?',
    a: 'Instead of everyone paying everyone, SplitMate suggests a short list of payments that clears all debts in a group. It is a near-minimal list, not a guaranteed absolute minimum.',
  },
  {
    q: 'How do rounding and paise work?',
    a: 'Amounts are stored in whole paise. When a split does not divide evenly, the leftover paise are handed out in a fixed, predictable order, so no money is lost or created.',
  },
  {
    q: 'How do I join a friend’s group?',
    a: 'Ask a group admin for the invite code, then enter it after you sign in. Admins can regenerate the code at any time to revoke the old one.',
  },
];

export default function Faq() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." />

        <div className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
          {questions.map(({ q, a }) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-control font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 max-w-2xl text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}