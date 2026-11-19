'use client';
import Icon from '@/components/ui/Icon';

const STEPS = ['Send it with your claim: who wrote it, or where it comes from.', 'The claim is verified. Nothing is added just because it was sent.', 'If it checks out, it goes through the usual tests and is labelled.'];

// switches the form to the suggest topic and brings it into view
export default function SuggestCard() {
  const go = () => {
    window.dispatchEvent(new CustomEvent('contact-topic', { detail: 'Suggest a problem' }));
    document.getElementById('send')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <div className="suggest">
      <h3>Want to add a problem?</h3>
      <ol>{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
      <button type="button" className="btn btn-primary" onClick={go}><Icon name="code" /><span>Suggest a problem</span></button>
    </div>
  );
}
