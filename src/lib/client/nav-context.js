// the list a visitor came from (search results, a practice set, saved problems), kept for this tab so a problem page can offer previous and next
import { cidFromSlug } from '@/lib/slug';

const KEY = 'prepit:list';
const MAX = 400;
const listeners = new Set();

const cidOf = (path) => cidFromSlug(String(path).split('/').pop());

// storage is plain text anyone could edit in devtools, so only internal problem paths are accepted back
export function parseList(raw) {
  try {
    const j = JSON.parse(raw);
    if (!j || !Array.isArray(j.items)) return null;
    const items = j.items.filter((x) => Array.isArray(x) && typeof x[0] === 'string' && x[0].startsWith('/problems/') && typeof x[1] === 'string').slice(0, MAX);
    if (!items.length) return null;
    return { label: String(j.label || '').slice(0, 80), offset: Math.max(0, Number(j.offset) || 0), total: Math.max(items.length, Number(j.total) || 0), items };
  } catch {
    return null;
  }
}

export function rememberList({ label, items, offset = 0, total }) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ label, offset, total: total ?? items.length, items: items.slice(0, MAX) }));
    listeners.forEach((l) => l());
  } catch {
    // storage blocked: previous and next simply do not appear
  }
}

export const readList = () => {
  try {
    return window.sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export const subscribeList = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// the problem links on screen, in the order they are shown
export function listFromLinks(root) {
  const seen = new Set();
  const items = [];
  for (const a of root?.querySelectorAll('a[href^="/problems/"]') || []) {
    const p = new URL(a.href, 'http://x').pathname;
    if (seen.has(p)) continue;
    seen.add(p);
    items.push([p, a.textContent.trim()]);
  }
  return items;
}

export const locate = (list, cid) => (list ? list.items.findIndex((x) => cidOf(x[0]) === cid) : -1);
