import SectionHeading from './SectionHeading';

const steps = [
  {
    number: '01',
    title: 'Create a group',
    text: 'Name it, pick an icon and share the invite code with everyone who should be in.',
  },
  {
    number: '02',
    title: 'Add shared expenses',
    text: 'Record who paid and how to split it. The preview shows each person’s share before you save.',
  },
  {
    number: '03',
    title: 'Settle balances',
    text: 'Follow the suggested payments, record them as you go, and watch every balance reach zero.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-4 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <SectionHeading eyebrow="How it works" title="Three steps from a messy tab to square." />

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={
                index > 0
                  ? 'border-t border-line pt-10 md:border-l md:border-t-0 md:pl-8 md:pt-0'
                  : 'md:pr-8'
              }
            >
              <p className="font-display text-5xl font-semibold text-accent">{step.number}</p>
              <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}