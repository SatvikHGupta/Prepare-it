'use client';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';

// appears once you have scrolled a screen or so, and takes you back to the top
export default function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const up = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  return (
    <button type="button" className="to-top" data-show={show || undefined} onClick={up} aria-label="Back to top" tabIndex={show ? 0 : -1}>
      <Icon name="arrow" />
    </button>
  );
}
