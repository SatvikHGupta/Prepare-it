'use client';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseList, readList, subscribeList, locate, rememberList } from '@/lib/client/nav-context';

const server = () => '';

// previous and next inside the list the visitor came from; with no list (a link from Google) it walks through the similar problems instead
export default function ProblemNav({ cid, self, related, variant = 'bottom' }) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeList, readList, server);
  const nav = useMemo(() => {
    const stored = parseList(raw);
    const at = locate(stored, cid);
    if (at >= 0 && stored.items.length > 1) return { list: stored, at, stored: true };
    const items = [self, ...related];
    return { list: { label: 'Similar problems', offset: 0, total: items.length, items }, at: 0, stored: false };
  }, [raw, cid, self, related]);
  const prev = nav.list.items[nav.at - 1];
  const next = nav.list.items[nav.at + 1];
  const remember = () => {
    if (!nav.stored) rememberList(nav.list);
  };

  useEffect(() => {
    if (variant !== 'top') return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const to = e.key === 'j' ? next : e.key === 'k' ? prev : null;
      if (!to) return;
      e.preventDefault();
      if (!nav.stored) rememberList(nav.list);
      router.push(to[0]);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [variant, prev, next, nav, router]);

  if (!prev && !next) return null;
  const pos = `${(nav.list.offset + nav.at + 1).toLocaleString('en-US')} of ${nav.list.total.toLocaleString('en-US')}${nav.list.label ? ` · ${nav.list.label}` : ''}`;
  const title = variant === 'top' ? 'sr-only' : 't';
  return (
    <nav className={`pnav ${variant}`} aria-label={variant === 'top' ? 'Previous and next problem' : 'Previous and next problem, end of page'}>
      {prev ? (
        <Link className="pn prev" href={prev[0]} rel="prev" aria-keyshortcuts="k" onClick={remember}>
          <span className="dir"><span aria-hidden="true">←</span> Previous <kbd aria-hidden="true">k</kbd></span>
          <span className={title}>{prev[1]}</span>
        </Link>
      ) : <span className="pn off" aria-hidden="true" />}
      <span className="pos">{pos}</span>
      {next ? (
        <Link className="pn next" href={next[0]} rel="next" aria-keyshortcuts="j" onClick={remember}>
          <span className="dir">Next <kbd aria-hidden="true">j</kbd> <span aria-hidden="true">→</span></span>
          <span className={title}>{next[1]}</span>
        </Link>
      ) : <span className="pn off" aria-hidden="true" />}
    </nav>
  );
}
