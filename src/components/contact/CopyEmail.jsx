'use client';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function CopyEmail({ email }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {}
  };
  return (
    <button type="button" className="btn btn-sm" onClick={copy} aria-live="polite">
      <Icon name={done ? 'check' : 'copy'} /><span>{done ? 'Copied' : 'Copy address'}</span>
    </button>
  );
}
