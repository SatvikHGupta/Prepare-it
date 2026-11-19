import Link from 'next/link';
import { getManifest } from '@/lib/data/catalog.server.js';
import { OWNER } from '@/lib/site.js';
import BrandIcon from '@/components/ui/BrandIcon';

const COLS = [
  ['Practice', [['/search', 'Search'], ['/roles', 'Roles'], ['/companies', 'Companies'], ['/domains', 'Domains']]],
  ['Explore', [['/topics', 'Topics'], ['/tags', 'Tags'], ['/types', 'Question types'], ['/bookmarks', 'Saved problems']]],
  ['Prepare it', [['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms']]],
];

export default async function Footer() {
  let m = null;
  try {
    m = await getManifest();
  } catch {}
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="foot-logo" href="/"><span className="foot-mark" aria-hidden="true">P</span>Prepare it</Link>
            <p className="foot-about">Free interview practice. Every problem is AI-generated, labelled, and says how it was checked.</p>
            <div className="foot-social">
              <a href={OWNER.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><BrandIcon name="github" /></a>
              <a href={OWNER.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><BrandIcon name="linkedin" /></a>
              <Link href="/contact#email" aria-label="Email, on the contact page"><BrandIcon name="mail" /></Link>
            </div>
          </div>
          {COLS.map(([title, links]) => (
            <nav className="foot-col" key={title} aria-label={title}>
              <h2>{title}</h2>
              {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
          ))}
        </div>
        <div className="foot-bottom">
          <span>None of the problems is copied from, or claimed to be asked by, any company.</span>
          {m ? <span className="foot-meta">{Number(m.problems).toLocaleString('en-US')} problems &middot; updated {m.updated}</span> : null}
        </div>
      </div>
    </footer>
  );
}
