import { getEntity } from '@/lib/data/catalog.server.js';
import { loadEntityPage } from '@/lib/data/entity-load.server.js';
import { pageMeta, MIN_ROLE_REPORTS } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { Facts, ChipLinks, RailPanel, PracticeSet, TopPicks, AsOf } from '@/components/entity/Parts';
import Dashboard, { dashboardToc } from '@/components/charts/Dashboard';
import { NOTICE } from '@/components/entity/format';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEntity('role', id);
  if (!e) return { title: 'Role not found', robots: { index: false, follow: false } };
  return pageMeta({
    title: `${e.label} interview practice: topics and practice problems`,
    description: `The topics and question types ${e.label} candidates report most across ${e.n_reports} public reports, with AI-generated practice problems matched to them.`,
    path: `/roles/${id}`,
    noindex: (e.n_reports || 0) < MIN_ROLE_REPORTS,
  });
}

export default async function RolePage({ params }) {
  const { id } = await params;
  const { e, labels, rows, version, lite } = await loadEntityPage('role', id);
  const companies = await Promise.all((e.companies || []).slice(0, 10).map(async ([cid, n]) => ({ cid, n, has: Boolean(await getEntity('combo', `${cid}--${id}`)) })));
  const roleItems = companies.map((c) => ({ label: labels.companies[c.cid] || prettify(c.cid), n: c.n, href: c.has ? `/companies/${c.cid}/${id}` : `/companies/${c.cid}` }));
  const toc = dashboardToc(e, { roles: roleItems.length > 0, rolesLabel: 'Companies', practice: rows.length > 0, similar: false });
  // related roles that have enough reports to be listed
  const listed = new Set((labels.dims.roles || []).filter((r) => r.n_reports >= MIN_ROLE_REPORTS).map((r) => r.id));
  const related = (e.similar || []).filter(([rid]) => listed.has(rid)).slice(0, 6).map(([rid]) => ({ label: labels.roles[rid] || prettify(rid), href: `/roles/${rid}` }));
  const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a.at(-1)}` : a[0] || '');
  const topTopics = (e.topics || []).slice(0, 3).map(([t]) => labels.topics[t] || prettify(t));
  const topCos = roleItems.slice(0, 3).map((c) => c.label);
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Roles', href: '/roles' }, { label: e.label }]}
      title={e.label}
      lead={`What ${e.label} candidates report, plus practice problems matched to the role.`}
      actions={rows.length ? <a className="btn btn-primary" href="#practice">Start practicing</a> : null}
      facts={<Facts items={[{ label: 'Interview reports', value: e.n_reports }, { label: 'Practice problems', value: e.n_problems }, { label: 'Reports with details', value: e.experiences?.n }]} />}
      toc={toc}
      rail={(
        <>
          {roleItems.length ? <RailPanel title="Companies reporting"><ChipLinks items={roleItems.slice(0, 6).map((c) => ({ label: c.label, href: c.href, n: c.n }))} /></RailPanel> : null}
          {related.length ? <RailPanel title="Related roles"><ChipLinks items={related} /></RailPanel> : null}
        </>
      )}
    >
      {topTopics.length || topCos.length ? (
        <p className="summary">
          {topTopics.length ? <>Candidates most often report <strong>{list(topTopics)}</strong>. </> : null}
          {topCos.length ? <>Most reports come from <strong>{list(topCos)}</strong>.</> : null}
        </p>
      ) : null}
      <TopPicks rows={rows} labels={lite} />
      <Dashboard e={e} labels={labels} roleItems={roleItems} roleTitle={`Companies with the most ${e.label} reports`} roleSub="Reports per company" />
      <PracticeSet title={`Practice set for ${e.label}`} rows={rows} total={rows.length} labels={lite} version={version} notice={NOTICE('role')} typeMix={e.types || []} />
      <AsOf labels={labels} />
    </Shell>
  );
}
