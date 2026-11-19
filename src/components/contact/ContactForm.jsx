'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { buildMailto } from '@/lib/mailto';
import { getContactEmail } from '@/lib/contact-email';

// mail apps cut or refuse mailto links much longer than this
const MAX_LINK = 1900;
const CLAIMS = ['I wrote this problem myself', 'It was asked in a real interview', 'I found it in a public post or site', 'I am not sure where it comes from'];

const TOPICS = [
  { id: 'Report a mistake in a problem', label: 'Report a mistake', icon: 'bug', hint: 'Paste the problem link, or the ID at the bottom of its sidebar, and say what looks wrong: the statement, the solution, a test or the explanation.' },
  { id: 'Privacy or removal request', label: 'Privacy or removal', icon: 'shield', hint: 'Say which problem, or which public post, you mean and what you would like done. The About page explains how problems are made.' },
  { id: 'Feedback or an idea', label: 'Feedback or idea', icon: 'chat', hint: 'Tell us what you were trying to do and what got in the way. A screenshot of the page helps a lot.' },
  { id: 'Suggest a problem', label: 'Suggest a problem', icon: 'code', suggest: true, hint: 'Send the problem and your claim about it. A problem is added only after that claim has been verified, then it goes through the same checks as every other problem and keeps its label. Sending one does not guarantee it will be added.' },
  { id: 'Something else', label: 'Something else', icon: 'compass', hint: 'Anything else is welcome. Say a little about who you are and what you need.' },
];

// nothing is sent from this page: it opens your own email app with the message already written
export default function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [status, setStatus] = useState('idle'); // idle | ok | long | long-copied
  const pills = useRef([]);
  const at = TOPICS.findIndex((t) => t.id === topic.id);
  // arrow keys move and select, and only the chosen pill is a tab stop (the radio group pattern)
  const onPillKey = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (at + step + TOPICS.length) % TOPICS.length;
    setTopic(TOPICS[next]);
    pills.current[next]?.focus();
  };
  // the suggest card on the page can switch the topic from outside
  useEffect(() => {
    const on = (e) => { const t = TOPICS.find((x) => x.id === e.detail); if (t) setTopic(t); };
    window.addEventListener('contact-topic', on);
    return () => window.removeEventListener('contact-topic', on);
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const href = buildMailto(getContactEmail(), { ...f, topic: topic.id });
    if (href.length > MAX_LINK) {
      // too long to open as a link: copy the message so it can be pasted into a normal email
      try {
        await navigator.clipboard.writeText(f.message);
        setStatus('long-copied');
      } catch {
        setStatus('long');
      }
      return;
    }
    window.location.href = href;
    setStatus('ok');
  };
  return (
    <form className="cf" id="send" onSubmit={submit}>
      <h2>Send a message</h2>
      <div className="pills" role="radiogroup" aria-label="What is it about?" onKeyDown={onPillKey}>
        {TOPICS.map((t, i) => (
          <button key={t.id} ref={(el) => { pills.current[i] = el; }} type="button" role="radio" aria-checked={topic.id === t.id} tabIndex={i === at ? 0 : -1} className={`pill${topic.id === t.id ? ' on' : ''}`} onClick={() => setTopic(t)}>
            <Icon name={t.icon} /><span>{t.label}</span>
          </button>
        ))}
      </div>
      <p className="hint" key={topic.id}>{topic.hint}</p>
      <div className="row2">
        <label><span>Your name <i>(optional)</i></span><input type="text" name="name" autoComplete="name" /></label>
        <label><span>Your email <i>(so a reply can reach you)</i></span><input type="email" name="reply" autoComplete="email" /></label>
      </div>
      <label><span>{topic.suggest ? 'Where did you see it?' : 'Problem link or ID'} <i>(optional)</i></span><input type="text" name="link" placeholder={topic.suggest ? 'A public link, if there is one' : 'Link, or the ID from the sidebar'} /></label>
      {topic.suggest ? (
        <div className="row2 suggest-fields">
          <label><span>What are you claiming about it?</span><select name="claim" defaultValue={CLAIMS[0]}>{CLAIMS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label><span>Company and role <i>(if you claim one)</i></span><input type="text" name="company" placeholder="e.g. Acme, backend" /></label>
        </div>
      ) : null}
      <label><span>{topic.suggest ? 'The problem' : 'Message'}</span><textarea name="message" required rows={6} placeholder={topic.suggest ? 'Write the problem as you would ask it, and the answer you expect if you have one.' : 'What did you see, and what did you expect?'} /></label>
      <button className="btn btn-primary btn-lg" type="submit"><span>Open in my email app</span><Icon name="arrow" /></button>
      <p className="muted small" aria-live="polite">{{ ok: 'Your email app should have opened with the message ready. If it did not, tap to reveal the address on the left and write to it directly.', long: 'This message is too long to open in an email app. Copy it, tap to reveal the address on the left and paste it into a new email.', 'long-copied': 'This message is too long to open in an email app, so it is copied. Tap to reveal the address on the left, write to it and paste.' }[status] || 'This opens your own email app with the message filled in. Nothing is sent from this page.'}</p>
    </form>
  );
}
