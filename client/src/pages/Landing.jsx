import { Link } from 'react-router-dom';
import LandingNav from '../components/landing/LandingNav';
import HeroPreview from '../components/landing/HeroPreview';
import { buttonClasses } from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <LandingNav />

      <main>
        <section className="overflow-x-clip">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:items-center lg:py-24">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Group expense manager
              </p>
              <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
                Split expenses. Not friendships.
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted">
                Manage shared expenses, track balances and settle up effortlessly with
                the people you share life with.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className={buttonClasses({ size: 'lg' })}>
                  Get Started
                </Link>
                <a
                  href="#how-it-works"
                  className={buttonClasses({ variant: 'secondary', size: 'lg' })}
                >
                  See How It Works
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 lg:translate-x-16">
              <HeroPreview />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}