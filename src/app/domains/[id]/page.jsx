import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog, getLabels } from '@/lib/data/catalog.server.js';
import { isEntityId } from '@/lib/slug.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { ProblemRow, ChipLinks, Section, Facts, RailPanel } from '@/components/entity/Parts';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}
const SHOW = 60;

async function load(id) {
  if (!isEntityId(id)) return null;
  const [catalog, labels] = await Promise.all([getCatalog(), getLabels()]);
  const rows = catalog.rows.filter((r) => r.domain === id);
  if (!rows.length && !labels.domains[id]) return null;
  return { rows: rows.sort((a, b) => a.title.localeCompare(b.title)), labels, label: labels.domains[id] || prettify(id) };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const d = await load(id);
  if (!d) return { title: 'Not found', robots: { index: false, follow: false } };
  return pageMeta({
    title: `${d.label} interview practice`,
    description: `${d.rows.length.toLocaleString('en-US')} free AI-generated ${d.label} practice problems across ${(d.labels.dims.topics || []).filter((t) => t.domain === id).length} topics.`,
    path: `/domains/${id}`,
  });
}

export default async function DomainPage({ params }) {
  const { id } = await params;
  const d = await load(id);
  if (!d) notFound();
  const lite = { types: d.labels.types, domains: d.labels.domains, topics: d.labels.topics };
  const topics = (d.labels.dims.topics || []).filter((t) => t.domain === id).sort((a, b) => b.n_problems - a.n_problems);
  const tmax = Math.max(1, ...topics.map((t) => t.n_problems || 0));
  const others = (d.labels.dims.domains || []).filter((x) => x.id !== id && x.n_problems > 0).sort((x, y) => y.n_problems - x.n_problems);
  const toc = [topics.length && { id: 'topics', label: 'Topics' }, d.rows.length > 0 && { id: 'practice', label: 'Problems' }].filter(Boolean);
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Domains', href: '/domains' }, { label: d.label }]}
      title={`${d.label} interview practice`}
      lead={`${d.rows.length.toLocaleString('en-US')} AI-generated problems across ${topics.length} topics.`}
      actions={<>{d.rows.length ? <a className="btn btn-primary" href="#practice">Start practicing</a> : null}<Link className="btn" href={`/search?domain=${encodeURIComponent(id)}`}>Filter in search</Link></>}
      facts={<Facts items={[{ label: 'Practice problems', value: d.rows.length }, { label: 'Topics', value: topics.length }]} />}
      toc={toc}
      rail={others.length ? <RailPanel title="Other domains"><ChipLinks items={others.slice(0, 8).map((o) => ({ label: o.label, href: `/domains/${o.id}`, n: o.n_problems }))} /></RailPanel> : null}
    >
      {topics.length ? (
        <Section id="topics" title="Topics in this domain">
          <div className="role-group">
            {topics.map((t) => (
              <Link key={t.id} href={`/topics/${t.id}`} className="role-row">
                <span className="name">{t.label}</span>
                <span className="bar" aria-hidden="true"><i style={{ width: `${Math.max(3, ((t.n_problems || 0) / tmax) * 100)}%` }} /></span>
                <span className="n">{(t.n_problems || 0).toLocaleString('en-US')}</span>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
      {d.rows.length ? (
      <Section id="practice" title="Problems">
        <div>{d.rows.slice(0, SHOW).map((r) => <ProblemRow key={r.cid} row={r} labels={lite} />)}</div>
        {d.rows.length > SHOW ? <p style={{ marginTop: 20 }}><Link className="btn" href={`/search?domain=${encodeURIComponent(id)}`}>See all {d.rows.length.toLocaleString('en-US')} in search</Link></p> : null}
      </Section>
      ) : null}
    </Shell>
  );
}
