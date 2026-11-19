import Link from 'next/link';
import { getManifest, getLabels, getEntity } from '@/lib/data/catalog.server.js';
import { loadEntityPage } from '@/lib/data/entity-load.server.js';
import { problemPath } from '@/lib/slug';
import Ticker from '@/components/home/Ticker';
import HeroStack from '@/components/home/HeroStack';
import { domainIcon } from '@/components/entity/domain-icon';
import { pageMeta, abs, SITE_NAME, MIN_ROLE_REPORTS } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Icon from '@/components/ui/Icon';
import JsonLd from '@/components/ui/JsonLd';
import { ChipLinks } from '@/components/entity/Parts';

export const revalidate = 600;
export const metadata = pageMeta({
  title: { absolute: 'Prepare it: practice interview problems by topic, role and company' },
  description: 'Search thousands of free interview practice problems by topic, role, tag and difficulty: coding, system design, SQL, statistics, ML and behavioral. Every problem is AI-generated, original and labelled with how it was checked.',
  path: '/',
});

const n = (v) => Number(v || 0).toLocaleString('en-US');
const pct = (part, whole) => `${Math.round((part / Math.max(1, whole)) * 100)}%`;

export default async function Home() {
  const [m, labels] = await Promise.all([getManifest(), getLabels()]);
  const dims = labels.dims;
  const topicsAll = dims.topics || [];
  const types = Object.entries(m.by_type || {}).sort((a, b) => b[1] - a[1]);
  const domains = [...(dims.domains || [])]
    .sort((a, b) => b.n_problems - a.n_problems)
    .map((d) => {
      const own = topicsAll.filter((t) => t.domain === d.id).sort((a, b) => b.n_problems - a.n_problems);
      return { id: d.id, label: d.label, n_problems: d.n_problems, topic_count: own.length, topics: own.slice(0, 4) };
    })
    .filter((d) => d.topic_count > 0);
  const companiesAll = [...(dims.companies || [])].filter((c) => !c.low_data).sort((a, b) => b.n_reports - a.n_reports);
  const companies = companiesAll.slice(0, 12);
  const allRoles = (dims.roles || []).filter((r) => r.n_reports >= MIN_ROLE_REPORTS);
  const roles = [...allRoles].sort((a, b) => b.n_reports - a.n_reports).slice(0, 6);
  const roleTops = Object.fromEntries(await Promise.all(roles.map(async (r) => [r.id, ((await getEntity('role', r.id))?.topics || []).slice(0, 3).map(([t]) => labels.topics[t] || prettify(t))])));
  const sortedTopics = [...topicsAll].sort((a, b) => (b.n_problems || 0) - (a.n_problems || 0));
  const topTopics = sortedTopics.slice(0, 6);
  // three sample problems of different difficulty for the hero stack, taken from the biggest topic
  // a pool of sample problems from a few topics; the hero picks three of them at random in the browser
  const pool = [];
  let used = 0;
  for (const t of sortedTopics.slice(0, 40)) {
    if (used >= 3 || pool.length >= 18) break;
    const got = (await loadEntityPage('topic', t.id).catch(() => null))?.rows || [];
    if (got.length < 3) continue;
    used += 1;
    for (const d of ['easy', 'medium', 'hard']) for (const r of got.filter((x) => x.difficulty === d).slice(0, 2)) pool.push({ cid: r.cid, title: r.title, difficulty: r.difficulty, typeLabel: labels.types[r.type] || prettify(r.type), href: problemPath(r.cid, r.title) });
  }
  const lv = m.by_level || {};
  const total = (lv.computed || 0) + (lv.executed || 0) + (lv.structural || 0);
  const proof = [
    { key: 'computed', title: 'Answer recomputed', cls: 's-a', text: 'Statistics and probability problems. Independent code recomputes the answer, and the page shows the working.' },
    { key: 'executed', title: 'Solution passes tests', cls: 's-b', text: 'Coding, debugging and SQL problems. A reference solution runs against hidden tests before the problem is published.' },
    { key: 'structural', title: 'Not independently verified', cls: 's-c', text: 'Written answers: design, behavioral and concept questions. Checked for format and wording only, so read them critically.' },
  ];
  // what the LED strip says: real counts, real top names, and the two keyboard shortcuts
  const ticker = [
    { k: 'Problems', v: n(m.problems) },
    ...companies.slice(0, 5).map((c) => ({ k: 'Reports', v: `${c.name} ${n(c.n_reports)}` })),
    { k: 'Domains', v: String(domains.length) },
    ...topTopics.slice(0, 4).map((t) => ({ k: 'Topic', v: `${t.label} ${n(t.n_problems)}` })),
    { k: 'Checked', v: `${pct(lv.executed || 0, total)} solution passes tests` },
    { k: 'Press', v: '/ to search' },
    { k: 'Roles', v: String(allRoles.length) },
    ...roles.slice(0, 3).map((r) => ({ k: 'Role', v: `${r.label} ${n(r.n_reports)}` })),
    { k: 'Checked', v: `${pct(lv.computed || 0, total)} answer recomputed` },
    { k: 'Press', v: 'j and k move between problems' },
    { k: 'Honest', v: `${pct(lv.structural || 0, total)} not independently verified` },
    { k: 'Always', v: 'AI-generated and labelled' },
  ];
  const strip = {
    paths: [{ k: 'Find by', v: 'Role' }, { k: 'Find by', v: 'Company' }, { k: 'Find by', v: 'Domain' }, { k: 'Find by', v: 'Topic' }, { k: 'Find by', v: 'Tag' }, { k: 'Find by', v: 'Question type' }, { k: 'Free', v: 'No account' }, { k: 'Saved', v: 'Stays in your browser' }],
    domains: domains.map((d) => ({ k: 'Domain', v: `${d.label} ${n(d.n_problems)}` })),
    companies: companiesAll.slice(0, 12).map((c) => ({ k: 'Company', v: `${c.name} ${n(c.n_reports)} reports` })),
    trust: [{ k: 'Checked', v: `${pct(lv.executed || 0, total)} solution passes tests` }, { k: 'Checked', v: `${pct(lv.computed || 0, total)} answer recomputed` }, { k: 'Honest', v: `${pct(lv.structural || 0, total)} not independently verified` }, { k: 'Always', v: 'AI-generated and labelled' }, { k: 'Read', v: 'How the checking works' }],
  };
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: abs('/'),
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: abs('/search?q={search_term_string}') }, 'query-input': 'required name=search_term_string' },
  };
  const paths = [
    { href: '/roles', icon: 'user', title: 'By role', text: `${allRoles.length} roles, each with the topics people report and a practice set built from them.` },
    { href: '/companies', icon: 'building', title: 'By company', text: `${n(companiesAll.length)} companies, with the stages and topics candidates describe.` },
    { href: '/domains', icon: 'layers', title: 'By domain', text: `${domains.length} domains from coding to behavioral, then down to ${n(topicsAll.length)} topics.` },
  ];
  return (
    <>
      <JsonLd data={ld} />
      <Ticker items={ticker} />
      <div className="container home">
        <section className="hero2">
          <div className="hero2-copy">
            <p className="eyebrow">Free interview practice</p>
            <h1>Rehearse the interview <span className="swipe">before it happens.</span></h1>
            <p className="lead">{n(m.problems)} practice problems across coding, SQL, statistics, machine learning, system design and behavioral rounds. Each one says how it was checked, and says so plainly when it was not.</p>
            <form className="hero-search" action="/search" role="search" aria-label="Search problems">
              <label className="field field-lg">
                <Icon name="search" />
                <span className="sr-only">Search problems</span>
                <input type="search" name="q" placeholder="Try: sliding window, sql joins" autoComplete="off" />
              </label>
              <button className="btn btn-primary" type="submit">Search</button>
            </form>
            {topTopics.length ? (
              <p className="hero2-quick"><span>Popular:</span>{topTopics.slice(0, 4).map((t) => <Link key={t.id} className="chip" href={`/topics/${t.id}`}>{t.label}</Link>)}</p>
            ) : null}
          </div>
          {pool.length >= 3 ? <HeroStack pool={pool} /> : null}
        </section>

        <section className="statrow" aria-label="Prepare it in numbers">
          {[[n(m.problems), 'practice problems'], [n(topicsAll.length), 'topics'], [n(companiesAll.length), 'companies'], [String(allRoles.length), 'roles']].map(([v, l]) => (
            <div key={l}><b>{v}</b><span>{l}</span></div>
          ))}
        </section>

      </div>
      <Ticker variant="rule" items={strip.paths} label="Ways to browse" />
      <div className="container home">
        <section className="section">
          <div className="section-head"><h2>Pick your path</h2></div>
          <div className="path-cards">
            {paths.map((p) => (
              <Link key={p.href} href={p.href} className="path-card">
                <span className="path-icon"><Icon name={p.icon} /></span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <span className="path-go">Explore <Icon name="arrow" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head"><h2>Start with your role</h2><Link href="/roles">All {allRoles.length} roles</Link></div>
          <div className="tile-grid">
            {roles.map((r) => (
              <Link key={r.id} href={`/roles/${r.id}`} className="tile">
                <b>{r.label}</b>
                {roleTops[r.id]?.length ? <span className="tile-tops">{roleTops[r.id].join(' · ')}</span> : null}
                <span className="tile-n">{n(r.n_reports)} reports</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
      <Ticker variant="rule" items={strip.domains} label="Domains" />
      <div className="container home">
        <section className="section">
          <div className="section-head"><h2>Browse by domain</h2><Link href="/domains">All {domains.length} domains</Link></div>
          <div className="domain-grid">
            {domains.map((d) => (
              <Link key={d.id} href={`/domains/${d.id}`} className="domain-card">
                <span className="dc-icon"><Icon name={domainIcon(d.id)} /></span>
                <h3>{d.label}</h3>
                <span className="dc-n">{n(d.n_problems)} problems · {d.topic_count} topics</span>
                <p className="dc-tops">{d.topics.map((t) => t.label).join(' · ')}</p>
              </Link>
            ))}
          </div>
          <p className="muted small" style={{ marginTop: 14 }}>Or see all {n(topicsAll.length)} <Link href="/topics">topics</Link>, <Link href="/tags">tags</Link> and {types.length} <Link href="/types">question types</Link>.</p>
        </section>

      </div>
      <Ticker variant="rule" items={strip.companies} label="Companies" />
      <div className="container home">
        <section className="section">
          <div className="section-head"><h2>Companies</h2><Link href="/companies">All {n(companiesAll.length)}</Link></div>
          <ChipLinks items={companies.map((c) => ({ label: c.name, href: `/companies/${c.id}`, n: c.n_reports }))} />
          <p className="muted small" style={{ marginTop: 16 }}>Report counts come from interview experiences shared publicly. The practice problems are AI-generated and never claimed to be asked by a company.</p>
        </section>

      </div>
      <Ticker variant="rule" items={strip.trust} label="How problems are checked" />
      <div className="container home">
        <section className="section">
          <div className="proof">
            <blockquote>{pct(lv.structural || 0, total)} of these problems are written answers no code can check. Every page says which kind it is.</blockquote>
            <div className="proof-rows">
              {proof.map((p) => (
                <div className="proof-row" key={p.key}>
                  <h3><span>{p.title}</span><span className="num">{n(lv[p.key])} · {pct(lv[p.key] || 0, total)}</span></h3>
                  <div className="stack" role="img" aria-label={`${p.title}: ${pct(lv[p.key] || 0, total)} of problems`}><i className={p.cls} style={{ flexGrow: lv[p.key] || 0 }} /><i style={{ flexGrow: total - (lv[p.key] || 0), background: 'transparent' }} /></div>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
          <p style={{ marginTop: 22 }}><Link href="/about">How the checking works</Link></p>
        </section>

        <section className="cta-band">
          <h2>Pick one problem and start.</h2>
          <p>No account, no paywall. Your saved list stays in this browser.</p>
          <p className="cta-row"><Link className="btn btn-primary" href="/search">Search all problems</Link><Link className="btn" href="/roles">Practice for a role</Link></p>
        </section>
      </div>
    </>
  );
}
