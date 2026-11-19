import Link from 'next/link';
import { getLabels, getEntity } from '@/lib/data/catalog.server.js';
import { pageMeta, MIN_ROLE_REPORTS } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Toc from '@/components/entity/Toc';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Interview practice by role',
  description: 'Interview practice for software engineers, data scientists, ML engineers, product managers and more: the topics reported most for each role and matched practice problems.',
  path: '/roles',
});

const n0 = (v) => Number(v || 0).toLocaleString('en-US');

export default async function RolesPage() {
  const { dims, topics: topicLabels } = await getLabels();
  const roles = (dims.roles || []).filter((r) => r.n_reports >= MIN_ROLE_REPORTS).sort((a, b) => b.n_reports - a.n_reports);
  const totalReports = roles.reduce((s, r) => s + r.n_reports, 0) || 1;
  const max = Math.max(1, ...roles.map((r) => r.n_reports));
  const featured = roles.filter((r) => r.n_reports > 0).slice(0, 6);
  // the featured roles show their top topics and problem counts, read from each role's own file
  const detail = Object.fromEntries(await Promise.all(featured.map(async (r) => [r.id, await getEntity('role', r.id)])));

  const groups = new Map();
  for (const r of roles) (groups.get(r.group) || groups.set(r.group, []).get(r.group)).push(r);
  const ordered = [...groups.entries()].map(([g, list]) => ({ g, list, total: list.reduce((s, r) => s + r.n_reports, 0) })).sort((a, b) => b.total - a.total);
  const gid = (g) => `g-${String(g).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const toc = [{ id: 'featured', label: 'Most reported' }, ...ordered.map((o) => ({ id: gid(o.g), label: prettify(o.g) }))];

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Roles</h1>
        <p className="lead">Pick the job you are interviewing for. Each role shows which topics come up and a practice set built from them. {roles.length} roles with at least {MIN_ROLE_REPORTS} reports, {n0(totalReports)} reports in all.</p>
      </header>

      <div className="profile">
        <div>
          <section id="featured">
            <div className="section-head"><h2>Most reported</h2><span className="muted">share of all reports</span></div>
            <div className="role-feature-grid">
              {featured.map((r, i) => {
                const d = detail[r.id];
                const tops = (d?.topics || []).slice(0, 3).map(([t]) => topicLabels[t] || prettify(t));
                return (
                  <Link key={r.id} href={`/roles/${r.id}`} className={`role-feature${i === 0 ? ' lead' : ''}`}>
                    <span className="group">{prettify(r.group)} · {Math.round((r.n_reports / totalReports) * 100)}% of reports</span>
                    <h3>{r.label}</h3>
                    {tops.length ? <p className="tops">{tops.join(' · ')}</p> : null}
                    <span className="big">{n0(r.n_reports)}<span>reports{d?.n_problems ? ` · ${n0(d.n_problems)} practice problems` : ''}</span></span>
                  </Link>
                );
              })}
            </div>
          </section>

          {ordered.map(({ g, list, total }) => (
            <section className="section" id={gid(g)} key={g}>
              <div className="role-group">
                <header>
                  <h2>{prettify(g)}</h2>
                  <span className="muted small">{n0(total)} reports</span>
                </header>
                {list.map((r) => (
                  <Link key={r.id} href={`/roles/${r.id}`} className="role-row">
                    <span className="name">{r.label}</span>
                    <span className="bar" aria-hidden="true"><i style={{ width: `${Math.max(3, Math.sqrt(r.n_reports / max) * 100)}%` }} /></span>
                    <span className="n">{n0(r.n_reports)}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
          <p className="muted small" style={{ marginTop: 28 }}>Bars use a square-root scale because one role makes up most reports. A short bar still means fewer reports. Roles with fewer than {MIN_ROLE_REPORTS} reports are not listed.</p>
        </div>
        <aside className="side-rail"><Toc items={toc} /></aside>
      </div>
    </div>
  );
}
