'use client';
import { rememberList, listFromLinks } from '@/lib/client/nav-context';

// remembers the problem links shown inside, so the problem page can offer previous and next
export default function RememberOnClick({ label, children }) {
  return (
    <div onClickCapture={(e) => { if (e.target.closest?.('a[href^="/problems/"]')) rememberList({ label, items: listFromLinks(e.currentTarget) }); }}>
      {children}
    </div>
  );
}
