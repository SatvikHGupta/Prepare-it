import Link from 'next/link';
import { getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import Icon from '@/components/ui/Icon';
import { domainIcon } from '@/components/entity/domain-icon';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Interview practice by domain',
  description: 'Browse interview practice problems by domain: coding, SQL, statistics, machine learning, system design and behavioral. Open a domain to see its topics and problems.',
  path: '/domains',
});

const n = (v) => Number(v || 0).toLocaleString('en-US');

export default async function DomainsPage() {
  const { dims } = await getLabels();
  const topics = dims.topics || [];
  // each domain with its biggest topics as a preview; the domain page lists them all
  const domains = [...(dims.domains || [])]
    .sort((a, b) => b.n_problems - a.n_problems)
    .map((d) => {
      const own = topics.filter((t) => t.domain === d.id).sort((a, b) => (b.n_problems || 0) - (a.n_problems || 0));
      return { ...d, count: own.length, top: own.slice(0, 5) };
    })
    .filter((d) => d.count > 0);
  return (
    <div className="container page">
      <header className="page-head">
        <h1>Domains</h1>
        <p className="lead">{domains.length} domains, from coding to behavioral. Open one to see its topics and problems, or go straight to <Link href="/topics">all {n(topics.length)} topics</Link>.</p>
      </header>
      <div className="domain-grid">
        {domains.map((d) => (
          <Link key={d.id} href={`/domains/${d.id}`} className="domain-card">
            <span className="dc-icon"><Icon name={domainIcon(d.id)} /></span>
            <h2>{d.label}</h2>
            <span className="dc-n">{n(d.n_problems)} problems · {d.count} topics</span>
            <p className="dc-tops">{d.top.map((t) => t.label).join(' · ')}</p>
            <span className="dc-go">Open {d.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
