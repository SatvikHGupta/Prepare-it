import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export const metadata = { title: 'Page not found', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="container nf">
      <div className="nf-grid">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1>This page did not pass its tests.</h1>
          <p className="lead">The link may be old or mistyped. Problems keep working when a title changes, so a broken problem link usually means the problem was removed.</p>
          <form className="hero-search" action="/search" role="search" aria-label="Search problems">
            <label className="field field-lg">
              <Icon name="search" />
              <span className="sr-only">Search problems</span>
              <input type="search" name="q" placeholder="Search for a problem instead" autoComplete="off" />
            </label>
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
          <p className="nf-links">
            <Link className="btn" href="/">Go home</Link>
            <Link className="btn" href="/roles">Browse roles</Link>
            <Link className="btn" href="/topics">Browse topics</Link>
          </p>
        </div>
        <div className="nf-term" role="img" aria-label="Test output: expected a page, received nothing">
          <div className="nf-bar"><i /><i /><i /><span>prepare it test</span></div>
          <pre aria-hidden="true">
{`$ prepare it open /this-page

`}<span className="nf-fail">FAIL</span>{`  route › the page exists
  expected   a page
  received   nothing

Tests:  `}<span className="nf-fail">1 failed</span>{`
`}<span className="nf-cursor">$ </span>
          </pre>
          <span className="nf-ghost" aria-hidden="true">404</span>
        </div>
      </div>
    </div>
  );
}
