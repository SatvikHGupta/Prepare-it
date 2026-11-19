import Link from 'next/link';
import { pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({ title: 'Privacy', description: 'Prepare it has no accounts, no tracking and no cookies. Saved problems and your theme stay in your own browser.', path: '/privacy' });

export default function Privacy() {
  return (
    <div className="container narrow page">
      <h1>Privacy</h1>
      <div className="prose">
        <p>Prepare it does not have accounts, does not use cookies and does not run analytics or advertising scripts.</p>
        <h2>What is stored in your browser</h2>
        <ul>
          <li>Your appearance choices (mode and accent colour).</li>
          <li>The problems you save, as a list of problem IDs.</li>
          <li>For the previous and next buttons, the list of problems you clicked from (search results, a practice set or your saved list). It is kept for the current tab only and disappears when you close it.</li>
        </ul>
        <p>This lives only in your browser&rsquo;s storage. It is never sent to a server and you can clear it by clearing site data or with the Clear button on the Saved page.</p>
        <h2>What the servers see</h2>
        <p>Like any website, the host sees technical request data (address, browser, page requested) while serving pages. Prepare it does not combine it with anything or share it with advertisers. Problem data is fetched by the Prepare it server from a private data store, so your browser only talks to Prepare it.</p>
        <p>No third-party fonts, trackers or embeds are loaded.</p>
        <h2>Public information used to make problems</h2>
        <p>To write practice problems, Prepare it records text that people posted publicly on websites and platforms, such as forums, social media and X. This means public posts, replies and comments only. It does not include private messages, closed groups or anything behind a login.</p>
        <p>That text is turned into a short brief and then rewritten by AI in its own words (see <Link href="/about">how Prepare it works</Link>). The published problems are rewritten material. They are not meant to quote, identify or profile the people who wrote the source posts.</p>
        <p>If you wrote a public post and want it removed from the material Prepare it works from, or you have a privacy concern, use the <Link href="/contact">contact page</Link> and say which post or problem it concerns.</p>
      </div>
    </div>
  );
}
