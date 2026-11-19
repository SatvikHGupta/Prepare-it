'use client';
import { useEffect, useRef, useState } from 'react';

// a number that counts toward its new value instead of jumping, so narrowing filters feel live
export default function Num({ value, ms = 480 }) {
  const [shown, setShown] = useState(value);
  const at = useRef(value);
  useEffect(() => {
    if (value === at.current) return undefined;
    const from = at.current;
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let id = 0;
    const tick = (t) => {
      const p = still ? 1 : Math.min(1, (t - t0) / ms);
      at.current = p === 1 ? value : from + (value - from) * (1 - (1 - p) ** 3);
      setShown(at.current);
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, ms]);
  return <span className="num">{Math.round(shown).toLocaleString('en-US')}</span>;
}
