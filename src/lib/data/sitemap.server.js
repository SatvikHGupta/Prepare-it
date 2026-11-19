import { MIN_ROLE_REPORTS } from '@/lib/site.js';
import { getCatalog, getManifest, getLabels, getTags, getEntity } from './catalog.server.js';
import { memo } from './memo.js';
import { problemPath } from '@/lib/slug';

export const SHARD = 5000;

// company x role pages with enough reports to be indexed (same cut-off as the page itself); listed from each company's role families
async function comboUrls(companies) {
  const big = companies.filter((c) => !c.low_data && c.n_reports >= 10);
  const out = [];
  let next = 0;
  const worker = async () => {
    while (next < big.length) {
      const c = big[next++];
      try {
        const e = await getEntity('company', c.id);
        for (const [fam, n] of e?.families || []) {
          if (n >= 10 && (await getEntity('combo', `${c.id}--${fam}`))) out.push(`/companies/${c.id}/${fam}`);
        }
      } catch {
        // one missing company must not take the whole sitemap down
      }
    }
  };
  await Promise.all(Array.from({ length: 10 }, worker));
  return out.sort();
}

// every indexable url; computed from the data, never listed by hand
export const getSitemapUrls = () =>
  memo('sitemap', 30 * 60 * 1000, async () => {
    const [catalog, m, labels, tags] = await Promise.all([getCatalog(), getManifest(), getLabels(), getTags()]);
    const d = labels.dims;
    const urls = ['/', '/search', '/domains', '/topics', '/types', '/companies', '/roles', '/tags', '/about', '/contact', '/privacy', '/terms'];
    for (const id of Object.keys(labels.types)) urls.push(`/types/${id}`);
    for (const id of Object.keys(labels.domains)) urls.push(`/domains/${id}`);
    for (const t of d.topics || []) urls.push(`/topics/${t.id}`);
    for (const r of (d.roles || []).filter((x) => x.n_reports >= MIN_ROLE_REPORTS)) urls.push(`/roles/${r.id}`);
    for (const c of d.companies || []) if (!c.low_data) urls.push(`/companies/${c.id}`);
    urls.push(...(await comboUrls(d.companies || [])));
    for (const t of tags || []) if (t.tier === 1) urls.push(`/tags/${t.id}`);
    for (const r of catalog.rows) urls.push(problemPath(r.cid, r.title));
    return { urls, updated: m.updated };
  });
