'use client';
import { useEffect, useRef } from 'react';

// a details box that opens itself when the page hash points at it or at something inside it
export default function Fold({ id, title, hint, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const openFor = () => {
      const el = ref.current;
      const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el && t && (t === el || el.contains(t)) && !el.open) {
        el.open = true;
        t.scrollIntoView();
      }
    };
    openFor();
    window.addEventListener('hashchange', openFor);
    return () => window.removeEventListener('hashchange', openFor);
  }, []);
  return (
    <details className="fold" id={id} ref={ref} suppressHydrationWarning>
      <summary><span className="fold-title">{title}</span>{hint ? <span className="muted fold-hint"> {hint}</span> : null}</summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}
