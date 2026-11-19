'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import Segmented from '@/components/ui/Segmented';
import Num from '@/components/ui/Num';

const PAGE = 60;
const SORTS = [{ id: 'popular', label: 'Popular' }, { id: 'az', label: 'A to Z' }];

// one place for every tag: find, sort, narrow by domain, then page through cards.
// tags are [id, label, count, topicIndex]; topics are [id, label, domainIndex]
export default function TagsBrowser({ tags, topics, domains }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('popular');
  const [dom, setDom] = useState(-1);
  const [letter, setLetter] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const needle = q.trim().toLowerCase();

  const base = useMemo(() => tags.filter((t) => (dom < 0 || topics[t[3]]?.[2] === dom) && (!needle || t[1].toLowerCase().includes(needle))), [tags, topics, dom, needle]);
  const letters = useMemo(() => [...new Set(base.map((t) => t[1].charAt(0).toUpperCase()))].sort(), [base]);
  const list = useMemo(() => {
    const l = letter && sort === 'az' ? base.filter((t) => t[1].charAt(0).toUpperCase() === letter) : base;
    return [...l].sort(sort === 'az' ? (a, b) => a[1].localeCompare(b[1]) : (a, b) => b[2] - a[2] || a[1].localeCompare(b[1]));
  }, [base, sort, letter]);
  const reset = (fn) => (v) => { fn(v); setLimit(PAGE); };
  const counts = useMemo(() => domains.map((_, i) => tags.filter((t) => topics[t[3]]?.[2] === i).length), [domains, tags, topics]);
  const domCount = (i) => counts[i];

  return (
    <>
      <div className="tg-bar">
        <label className="field">
          <Icon name="search" />
          <span className="sr-only">Find a tag</span>
          <input type="search" value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="Find a tag" autoComplete="off" />
        </label>
        <Segmented label="Sort tags" options={SORTS} value={sort} onChange={(v) => { reset(setSort)(v); setLetter(''); }} />
      </div>

      <div className="tg-doms" role="group" aria-label="Narrow by domain">
        <button type="button" className={`chip${dom < 0 ? ' on' : ''}`} onClick={() => reset(setDom)(-1)}>All domains <small>{tags.length.toLocaleString('en-US')}</small></button>
        {domains.map((d, i) => (counts[i] ? <button key={d} type="button" className={`chip${dom === i ? ' on' : ''}`} onClick={() => reset(setDom)(i)}>{d} <small>{domCount(i).toLocaleString('en-US')}</small></button> : null))}
      </div>

      {sort === 'az' && letters.length > 1 ? (
        <div className="tg-letters" role="group" aria-label="Jump to a letter">
          <button type="button" className={`chip${letter === '' ? ' on' : ''}`} onClick={() => reset(setLetter)('')}>All</button>
          {letters.map((l) => <button key={l} type="button" className={`chip${letter === l ? ' on' : ''}`} onClick={() => reset(setLetter)(l)}>{l}</button>)}
        </div>
      ) : null}

      <p className="muted tg-count" aria-live="polite">Showing <Num value={Math.min(limit, list.length)} /> of <Num value={list.length} /> tags</p>

      <div className="tg-grid">
        {list.slice(0, limit).map((t, i) => (
          <Link key={t[0]} href={`/tags/${t[0]}`} className={`tg-card${sort === 'popular' && !needle && dom < 0 && i < 6 ? ' big' : ''}`}>
            <span className="tg-name">{t[1]}</span>
            <span className="tg-n">{t[2].toLocaleString('en-US')} problems</span>
            {topics[t[3]] ? <span className="tg-topic">{topics[t[3]][1]}</span> : null}
          </Link>
        ))}
      </div>
      {list.length === 0 ? <p className="muted" style={{ marginTop: 28 }}>No tag matches &ldquo;{q}&rdquo;. Try fewer letters, or pick &ldquo;All domains&rdquo;.</p> : null}
      {list.length > limit ? <p style={{ textAlign: 'center', marginTop: 24 }}><button type="button" className="btn" onClick={() => setLimit((l) => l + PAGE)}>Show {Math.min(PAGE, list.length - limit)} more</button></p> : null}
    </>
  );
}
