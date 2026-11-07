import SectionHeading from './SectionHeading';

const reasons = [
  {
    title: 'Exact to the paisa',
    text: 'Money is stored as whole paise, never as floating-point numbers. When ₹100 is split three ways, you get ₹33.34, ₹33.33 and ₹33.33, and the total still matches.',
  },
  {
    title: 'Balances you can verify',
    text: 'Nothing is stored as a running total. Balances are recalculated from every expense and payment, so editing or deleting an entry always keeps them correct.',
  },
  {
    title: 'No real money moves',
    text: 'SplitMate records who paid whom. It never touches your bank, UPI or cards, and it has no payment gateway.',
  },
  {
    title: 'Private to your group',
    text: 'Only members can see a group’s expenses. Passwords are hashed and sessions use secure, HttpOnly cookies.',
  },
];

export default function WhySplitMate() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Why SplitMate" title="Built to be trusted with the awkward part." >
            Splitting a bill is easy. Keeping the numbers right, week after week, is not.
          </SectionHeading>
        </div>

        <dl className="divide-y divide-line border-y border-line lg:col-span-7">
          {reasons.map((reason) => (
            <div key={reason.title} className="py-6 sm:grid sm:grid-cols-3 sm:gap-6">
              <dt className="font-display text-lg font-semibold">{reason.title}</dt>
              <dd className="mt-2 text-muted sm:col-span-2 sm:mt-0">{reason.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}