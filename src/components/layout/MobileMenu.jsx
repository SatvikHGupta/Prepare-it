'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import MainNav from './MainNav';

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(pathname);
  const btn = useRef(null);
  const panel = useRef(null);
  const close = () => setOpen(false);
  // any page change (logo, header icons, back button) closes the menu
  if (seen !== pathname) {
    setSeen(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onDown = (e) => {
      if (!panel.current?.contains(e.target) && !btn.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  return (
    <>
      <button ref={btn} type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? 'close' : 'menu'} />
      </button>
      <div id="mobile-nav" ref={panel} className="mobile-nav" hidden={!open}>
        <div className="container">
          <form action="/search" role="search" aria-label="Site search" className="header-search">
            <Icon name="search" />
            <input type="search" name="q" placeholder="Search problems" aria-label="Search problems" />
          </form>
          <MainNav label="Mobile" onNavigate={close} />
          <Link href="/bookmarks" onClick={close}>Saved problems</Link>
          <Link href="/appearance" onClick={close}>Appearance</Link>
        </div>
      </div>
    </>
  );
}
