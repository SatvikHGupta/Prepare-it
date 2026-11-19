import Link from 'next/link';
import { pageMeta, OWNER } from '@/lib/site.js';
import Icon from '@/components/ui/Icon';
import BrandIcon from '@/components/ui/BrandIcon';
import EmailReveal from '@/components/contact/EmailReveal';
import ContactForm from '@/components/contact/ContactForm';
import SuggestCard from '@/components/contact/SuggestCard';

export const metadata = pageMeta({
  title: 'Contact',
  description: 'Get in touch with Prepare it: report a mistake in a problem, ask for something to be removed, or share feedback. Email, LinkedIn and GitHub.',
  path: '/contact',
});

const GOOD = [
  'Nothing is sent from this page. The button opens your email app with the message ready.',
  'Every problem has its ID at the bottom of its sidebar. Include it when you report one.',
  'For a privacy or removal request, name the problem or the public post you mean.',
];

export default function ContactPage() {
  return (
      <div className="container contact">
        <section className="c-hero">
          <svg className="c-ghost" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
            <path d="M86 26H166A14 14 0 0 1 180 40V84A14 14 0 0 1 166 98H146L162 120L128 98H86A14 14 0 0 1 72 84V40A14 14 0 0 1 86 26Z" />
            <path d="M34 74H118A14 14 0 0 1 132 88V132A14 14 0 0 1 118 146H70L48 168V146H34A14 14 0 0 1 20 132V88A14 14 0 0 1 34 74Z" />
            <circle cx="50" cy="110" r="5" /><circle cx="76" cy="110" r="5" /><circle cx="102" cy="110" r="5" />
          </svg>
          <p className="eyebrow">Contact</p>
          <h1>Say <span className="swipe">hello.</span></h1>
          <p className="lead">Found a mistake in a problem, want something removed, or have an idea to make Prepare it better? Write to the person who builds and runs it.</p>
        </section>

        <div className="c-channels">
          <EmailReveal />
          <a className="ch" href={OWNER.linkedin} target="_blank" rel="noopener noreferrer">
            <span className="ch-ico"><BrandIcon name="linkedin" /></span>
            <h2>LinkedIn</h2>
            <span className="handle">{OWNER.linkedinHandle}</span>
            <span className="ch-go">Open profile <Icon name="arrow" /></span>
          </a>
          <a className="ch" href={OWNER.github} target="_blank" rel="noopener noreferrer">
            <span className="ch-ico"><BrandIcon name="github" /></span>
            <h2>GitHub</h2>
            <span className="handle">{OWNER.githubHandle}</span>
            <span className="ch-go">Open profile <Icon name="arrow" /></span>
          </a>
        </div>

        <div className="c-main">
          <ContactForm />
          <aside className="c-side">
            <div className="maker">
              <span className="monogram" aria-hidden="true">S</span>
              <div>
                <h2>{OWNER.name}</h2>
                <p>Builds and runs Prepare it.</p>
              </div>
            </div>
            <SuggestCard />
            <div className="good">
              <h3>Good to know</h3>
              <ul>{GOOD.map((g) => <li key={g}><Icon name="check" /><span>{g}</span></li>)}</ul>
              <p className="muted small">More on <Link href="/about">how problems are made</Link>, <Link href="/privacy">privacy</Link> and <Link href="/terms">terms</Link>.</p>
            </div>
          </aside>
        </div>
      </div>
  );
}
