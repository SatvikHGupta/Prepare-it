'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { rememberList, listFromLinks } from '@/lib/client/nav-context';
import { ListItem } from './ResultCard';
import { loadIndex } from '@/lib/client/index-data';
import { useBookmarks } from '@/store/bookmarks.store';
import Icon from '@/components/ui/Icon';

export default function BookmarksView({ version, labels }) {
  const { items, ready, persisted, clear } = useBookmarks();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    let alive = true;
    loadIndex(version, labels)
      .then((r) => alive && setRows(new Map(r.map((x) => [x.cid, x]))))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [version, labels]);

  const list = useMemo(() => (rows ? items.map((i) => rows.get(i.cid) || { cid: i.cid, missing: true }) : []), [items, rows]);

  // the find box only looks through what is saved on this device
  const tokens = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q]);
  const shown = useMemo(() => (tokens.length ? list.filter((r) => {
    if (r.missing) return false;
    const hay = `${r.title} ${(r.topics || []).map((t) => labels.topics?.[t] || t).join(' ')} ${(r.tags || []).join(' ')} ${labels.types?.[r.type] || r.type || ''}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  }) : list), [list, tokens, labels]);

  if (!ready) return <div className="saved-view"><p className="muted" aria-busy="true">Loading your saved problems…</p></div>;
  return (
    <div className="saved-view" onClickCapture={(e) => { if (e.target.closest?.('a[href^="/problems/"]')) rememberList({ label: 'Saved problems', items: listFromLinks(e.currentTarget) }); }}>
      {!persisted ? <div className="callout warn" role="status"><strong>Saving is blocked in this browser</strong><p>Your saved problems will be lost when you close this tab.</p></div> : null}
      {items.length ? (
        <div className="field field-lg saved-find" role="search" aria-label="Search your saved problems">
          <Icon name="search" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your saved problems" aria-label="Search your saved problems" autoComplete="off" />
          {q ? <button type="button" className="clear" aria-label="Clear search" onClick={() => setQ('')}><Icon name="close" /></button> : null}
        </div>
      ) : null}
      <div className="tools">
        <p className="count" style={{ margin: 0 }} aria-live="polite">{tokens.length ? `${shown.length.toLocaleString('en-US')} of ${items.length.toLocaleString('en-US')} saved` : `${items.length.toLocaleString('en-US')} saved`}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {items.length ? (
            confirm ? (
              <>
                <button type="button" className="btn" onClick={() => { clear(); setConfirm(false); }}>Confirm clear all</button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}>Clear all</button>
            )
          ) : null}
        </div>
      </div>
      {error ? <p role="alert">Could not load problem titles. Reload to try again.</p> : null}
      {items.length === 0 ? (
        <div className="empty">
          <p><strong>Nothing saved yet.</strong></p>
          <p>Use the bookmark button on any problem to keep it here.</p>
          <Link className="btn btn-primary" href="/search">Find problems</Link>
        </div>
      ) : null}
      {tokens.length && rows && shown.length === 0 ? <div className="empty"><p><strong>No saved problem matches.</strong></p><p>Searching only your saved list. Try fewer words.</p></div> : null}
      {shown.map((r) => (r.missing ? (
        <article className="result" key={r.cid}><div className="body"><span className="muted">Problem {r.cid} is no longer available.</span></div></article>
      ) : <ListItem key={r.cid} row={r} labels={labels} tokens={tokens} />))}
    </div>
  );
}
