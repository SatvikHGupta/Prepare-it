'use client';
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { DifficultyBadge } from '@/components/ui/Badges';

const never = () => () => {};

// one per difficulty when the pool allows it, in a random order
function choose(pool) {
  const one = (a) => a[Math.floor(Math.random() * a.length)];
  let p = ['easy', 'medium', 'hard'].map((d) => { const a = pool.filter((r) => r.difficulty === d); return a.length ? one(a) : null; }).filter(Boolean);
  if (p.length < 3) p = [...p, ...pool.filter((r) => !p.includes(r)).sort(() => Math.random() - 0.5)].slice(0, 3);
  return p.sort(() => Math.random() - 0.5);
}

// three sample problems, a different set on every visit. The server renders the first three; in the browser the
// random set takes over once hydration is done, so the two never disagree.
export default function HeroStack({ pool }) {
  const [random] = useState(() => choose(pool));
  const ready = useSyncExternalStore(never, () => true, () => false);
  const picks = ready ? random : pool.slice(0, 3);
  return (
    <div className="hero2-stack" data-ready={ready || undefined} aria-label="Sample problems">
      {picks.map((r, i) => (
        <Link key={r.cid} href={r.href} className={`pcard pc${i}`}>
          <span className="pcard-top"><DifficultyBadge value={r.difficulty} /><span className="badge plain">{r.typeLabel}</span></span>
          <b>{r.title}</b>
          <span className="pcard-go">Open problem <Icon name="arrow" /></span>
        </Link>
      ))}
    </div>
  );
}
