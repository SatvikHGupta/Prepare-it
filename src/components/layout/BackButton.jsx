'use client';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

// goes back one step; if the page was opened directly there is nothing to go back to, so it goes home
export default function BackButton() {
  const path = usePathname();
  const router = useRouter();
  if (path === '/') return null;
  const back = () => (window.history.length > 1 ? router.back() : router.push('/'));
  return (
    <div className="container back-row">
      <button type="button" className="back-btn" onClick={back} aria-label="Go back"><Icon name="arrow" /><span>Back</span></button>
    </div>
  );
}
