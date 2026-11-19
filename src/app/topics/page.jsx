import { getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import TopicWall from '@/components/entity/TopicWall';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'All interview practice topics',
  description: 'Every topic with AI-generated interview practice problems, grouped by domain. Bigger tiles mean more problems. Pick a topic to start practicing.',
  path: '/topics',
});

export default async function TopicsPage() {
  const { dims } = await getLabels();
  const all = (dims.topics || []).filter((t) => (t.n_problems || 0) > 0);
  const groups = [...(dims.domains || [])]
    .map((d) => {
      const own = all.filter((t) => t.domain === d.id).sort((a, b) => b.n_problems - a.n_problems || a.label.localeCompare(b.label));
      const max = Math.max(1, ...own.map((t) => t.n_problems));
      // the first two are big tiles, the next third medium, the rest small
      const topics = own.map((t, i) => ({ id: t.id, label: t.label, n: t.n_problems, pct: Math.max(4, Math.round((t.n_problems / max) * 100)), tier: i < 2 ? 3 : i < 2 + Math.ceil(own.length / 3) ? 2 : 1 }));
      return { id: d.id, label: d.label, topics, problems: own.reduce((a, t) => a + t.n_problems, 0) };
    })
    .filter((g) => g.topics.length)
    .sort((a, b) => b.problems - a.problems);
  return (
    <div className="container page">
      <header className="page-head">
        <h1>Topics</h1>
        <p className="lead">{all.length.toLocaleString('en-US')} topics in {groups.length} domains. Bigger tiles mean more problems.</p>
      </header>
      <TopicWall groups={groups} total={all.length} />
    </div>
  );
}
