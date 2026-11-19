'use client';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import BrandIcon from '@/components/ui/BrandIcon';
import { getContactEmail } from '@/lib/contact-email';

// the address is only put together after a tap, so bots reading the page never see it
export default function EmailReveal() {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <article className="ch ch-mail" id="email" data-open={email ? true : undefined}>
      <span className="ch-ico"><BrandIcon name="mail" /></span>
      <h2>Email</h2>
      {email ? (
        <>
          <a className="handle" href={`mailto:${email}`}>{email}</a>
          <div className="ch-actions">
            <a className="btn btn-primary btn-sm" href={`mailto:${email}`}>Write an email</a>
            <button type="button" className="btn btn-sm" onClick={copy} aria-live="polite"><Icon name={copied ? 'check' : 'copy'} /><span>{copied ? 'Copied' : 'Copy'}</span></button>
          </div>
        </>
      ) : (
        <>
          <span className="handle masked" aria-hidden="true">s••••••••••@•••••.com</span>
          <div className="ch-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setEmail(getContactEmail())}>Tap to reveal</button>
          </div>
          <p className="muted small">Hidden until you tap, so spam bots cannot collect it.</p>
        </>
      )}
      <noscript><p className="muted small">Turn on JavaScript to see the address, or write on LinkedIn.</p></noscript>
    </article>
  );
}
