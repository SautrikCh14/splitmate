import SectionHeading from './SectionHeading';

export default function About() {
  return (
    <section id="about" className="scroll-mt-4 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <SectionHeading eyebrow="About" title="Made for the people you share life with." />
        <div className="mt-8 max-w-2xl space-y-4 text-lg text-muted">
          <p>
            Trips, flats, family dinners: shared money gets messy because nobody keeps the
            same notes. SplitMate gives a group one place to record what was spent and who
            paid, and one clear answer to who owes whom.
          </p>
          <p>
            It is an independent project, designed to be simple to use and strict about the
            numbers behind it.
          </p>
        </div>
      </div>
    </section>
  );
}