import Link from 'next/link';
import { getLabels, getTags } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import TagsBrowser from '@/components/entity/TagsBrowser';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Practice problem tags',
  description: 'Every tag used on Prepare it practice problems. Find a tag, sort by how many problems carry it, or narrow by domain, then open it to see all of its problems.',
  path: '/tags',
});

export default async function TagsPage() {
  const [tags, labels] = await Promise.all([getTags(), getLabels()]);
  const topicRows = labels.dims.topics || [];
  const domainIds = [...new Set(topicRows.map((t) => t.domain))].filter((d) => labels.domains[d]);
  const domains = domainIds.map((d) => labels.domains[d]);
  const topicIdx = new Map(topicRows.map((t, i) => [t.id, i]));
  const topics = topicRows.map((t) => [t.id, t.label, domainIds.indexOf(t.domain)]);
  // compact rows keep the page light with thousands of tags
  const rows = (tags || []).filter((x) => x.tier === 1).map((t) => [t.id, t.label, t.n_problems, topicIdx.has(t.parent) ? topicIdx.get(t.parent) : -1]);
  return (
    <div className="container page tags-index">
      <header className="page-head">
        <h1>Tags</h1>
        <p className="lead">{rows.length.toLocaleString('en-US')} tags describe what each problem is about. To combine several at once, use the <Link href="/search">search page</Link>.</p>
      </header>
      <TagsBrowser tags={rows} topics={topics} domains={domains} />
    </div>
  );
}
