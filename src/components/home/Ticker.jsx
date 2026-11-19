'use client';
import { useState } from 'react';

// an LED-style strip that drifts left to right; it pauses on hover and focus, and with the button (WCAG 2.2.2)
export default function Ticker({ items, variant = 'main', label = 'Prepare it at a glance' }) {
  const [paused, setPaused] = useState(false);
  const track = (hidden) => (
    <ul className="ticker-track" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <li key={i}><span className="k">{it.k}</span><span className="v">{it.v}</span></li>
      ))}
    </ul>
  );
  return (
    <section className={`ticker ${variant}`} aria-label={label} data-paused={paused || undefined}>
      <div className="ticker-view">
        <div className="ticker-run">{track(false)}{track(true)}</div>
      </div>
      <button type="button" className="ticker-pause" aria-pressed={paused} aria-label={paused ? 'Play the ticker' : 'Pause the ticker'} onClick={() => setPaused((p) => !p)}>
        {paused ? '▶' : '❚❚'}
      </button>
    </section>
  );
}
