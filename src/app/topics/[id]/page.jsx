import Link from 'next/link';
import { getEntity, getTagById } from '@/lib/data/catalog.server.js';
import { loadEntityPage } from '@/lib/data/entity-load.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { Facts, ChipLinks, RailPanel, LearningPath, PracticeSet, TrendSection } from '@/components/entity/Parts';
import { MixBlocks } from '@/components/entity/MixBlocks';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEntity('topic', id);
  if (!e) return { title: 'Topic not found', robots: { index: false, follow: false } };
  return pageMeta({
    title: `${e.label} interview practice problems`,
    description: `${e.n_problems} AI-generated ${e.label} practice problems, with the related topics, tags and question types that go with them.`,
    path: `/topics/${id}`,
  });
}

export default async function TopicPage({ params }) {
  const { id } = await params;
  const [{ e, labels, rows, version, lite }, tagById] = await Promise.all([loadEntityPage('topic', id), getTagById()]);
  const tagChip = (tid, n) => {
    const t = tagById.get(tid);
    return { label: t?.label || prettify(tid), href: t?.tier === 1 ? `/tags/${tid}` : undefined, n };
  };
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Topics', href: '/topics' }, { label: e.label }]}
      facts={<Facts items={[{ label: 'Practice problems', value: e.n_problems }, { label: 'Interview reports on this topic', value: e.n_reports }]} />}
      title={e.label}
      lead={`${e.n_problems.toLocaleString('en-US')} AI-generated practice problems on ${e.label}.`}
      actions={rows.length ? <a className="btn btn-primary" href="#practice">Start practicing</a> : null}
      meta={e.domain ? <Link className="chip" href={`/domains/${e.domain}`}>{labels.domains[e.domain] || prettify(e.domain)}</Link> : null}
      rail={(
        <>
          {e.related_topics?.length ? <RailPanel title="Related topics"><ChipLinks items={e.related_topics.slice(0, 6).map(([t, , n]) => ({ label: labels.topics[t] || prettify(t), href: `/topics/${t}`, n }))} /></RailPanel> : null}
          {e.children?.length ? <RailPanel title="Tags in this topic"><ChipLinks items={e.children.slice(0, 6).map(([t, n]) => tagChip(t, n))} /></RailPanel> : null}
          {e.companies?.length ? <RailPanel title="Asked most at"><ChipLinks items={e.companies.slice(0, 6).map(([c, n]) => ({ label: labels.companies[c] || prettify(c), href: `/companies/${c}`, n }))} /></RailPanel> : null}
        </>
      )}
    >
      <LearningPath rows={rows} />
      <PracticeSet title={`${e.label} practice problems`} rows={rows} total={rows.length} labels={lite} version={version} notice="These problems are AI-generated and original. Each one says how it was checked." />
      <MixBlocks e={e} labels={labels} />
      <TrendSection e={e} labels={labels} />
    </Shell>
  );
}
