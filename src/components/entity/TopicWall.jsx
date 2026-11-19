'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

// every topic as a tile, grouped by domain; the biggest topics in a domain get the biggest tiles
export default function TopicWall({ groups, total }) {
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const view = useMemo(() => groups.map((g) => ({ ...g, topics: needle ? g.topics.filter((t) => t.label.toLowerCase().includes(needle)) : g.topics })).filter((g) => g.topics.length), [groups, needle]);
  const shown = view.reduce((a, g) => a + g.topics.length, 0);
  return (
    <>
      <div className="wall-bar">
        <label className="field">
          <Icon name="search" />
          <span className="sr-only">Find a topic</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a topic" autoComplete="off" />
        </label>
        <span className="muted" aria-live="polite">{shown.toLocaleString('en-US')} of {total.toLocaleString('en-US')} topics</span>
      </div>
      {view.map((g) => (
        <section className="wall-group" key={g.id}>
          <header>
            <h2><Link href={`/domains/${g.id}`}>{g.label}</Link></h2>
            <span className="muted">{g.topics.length} {g.topics.length === 1 ? 'topic' : 'topics'} · {g.problems.toLocaleString('en-US')} problems</span>
          </header>
          <div className="wall-grid">
            {g.topics.map((t) => (
              <Link key={t.id} href={`/topics/${t.id}`} className={`wall-tile s${t.tier}`}>
                <span className="wt-name">{t.label}</span>
                <span className="wt-n">{t.n.toLocaleString('en-US')} problems</span>
                <i className="wt-bar" style={{ width: `${t.pct}%` }} />
              </Link>
            ))}
          </div>
        </section>
      ))}
      {shown === 0 ? <p className="muted" style={{ marginTop: 32 }}>No topic matches &ldquo;{q}&rdquo;. Try fewer letters.</p> : null}
    </>
  );
}
