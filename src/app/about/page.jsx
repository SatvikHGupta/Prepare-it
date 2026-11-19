import Link from 'next/link';
import { pageMeta } from '@/lib/site.js';
import { getManifest } from '@/lib/data/catalog.server.js';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'How Prepare it works',
  description: 'Where Prepare it problems come from, how each one is checked, what the labels mean and how company pages are built.',
  path: '/about',
});

export default async function About() {
  let m = null;
  try {
    m = await getManifest();
  } catch {}
  return (
    <div className="container narrow page">
      <h1>How Prepare it works</h1>
      <div className="prose legal">
        <p>Prepare it is a free place to practice for technical and behavioral interviews. You can search every problem by keyword, tag, topic, type and difficulty, save the ones you want to return to, and read what each one covers before you start.</p>
        <h2>How a problem is made</h2>
        <p>Every problem on Prepare it is written by AI. Nothing is copied from a company, a book or a website, and no problem claims to be a question a company asked. Each problem goes through the same five steps:</p>
        <ol>
          <li><strong>Find.</strong> AI searches public forums, social media, X and other public platforms for interview questions, and for the replies and comments people wrote in answer to them.</li>
          <li><strong>Brief.</strong> From what it finds, the AI drafts a small brief: the idea of the question and the main points of the discussion around it. The brief is a summary, not a copy of any post.</li>
          <li><strong>Rewrite.</strong> A second AI pass rewrites the brief in its own words as a full problem with a solution, so the finished text is new.</li>
          <li><strong>Test.</strong> The problem goes through automated tests that depend on its kind (see below). Problems that fail are not published.</li>
          <li><strong>Publish.</strong> Only problems that pass are added to the site, and each one says how it was checked.</li>
        </ol>
        <p>Readers can suggest a problem through the <Link href="/contact">contact page</Link>. A suggestion is added only after the claim that comes with it has been verified, and it then goes through the same tests and carries the same label as every other problem.</p>
        <h2>Which AI models</h2>
        <p>Prepare it mainly uses AI language models of about 20 billion and 120 billion parameters. It may switch to newer or better models in the future, so the wording and quality of problems can change over time.</p>
        <h2>Who owns the result</h2>
        <p>The problems and solutions are AI-generated and made for everyone. Prepare it does not present them as the work of a human author and does not claim authorship of them. Source posts remain the work of the people who wrote them and of the platforms that host them. See the <Link href="/terms">terms</Link> for details.</p>
        <h2>How each problem is checked</h2>
        <p>Because AI makes mistakes, every problem page shows how it was checked{m ? ` (${m.problems.toLocaleString('en-US')} problems at the last update)` : ''}:</p>
        <ul>
          <li><strong>Answer recomputed by code.</strong> Statistics and probability problems: the final answer is recomputed by independent code. The explanation around it is still AI-written.</li>
          <li><strong>Reference solution passes its tests.</strong> Coding, class design, debugging and SQL problems: the reference solution passes its own tests in a sandbox. That does not prove the statement is perfect or that the stated complexity is right.</li>
          <li><strong>Not independently verified.</strong> System design, behavioral, product, experiment and concept questions are written answers. Only the format and wording are checked automatically, and some were also read once by a second model. They can contain mistakes, so treat them as practice material.</li>
        </ul>
        <h2>Company and role pages</h2>
        <p>Company, role, topic and tag pages combine two things. The numbers (reports per month, interview stages, outcomes, levels) come from interview reports shared publicly, aggregated so no single report is shown. The practice problems are AI-generated and matched to the topics and question types that come up most. A practice problem on a company page was not asked by that company.</p>
        <p>Counts show what people reported, not your chances. A value of &lsquo;&lt;5&rsquo; means fewer than five reports.</p>
        <h2>Updates</h2>
        <p>New problems are added every month. The site reads its data live, so new problems appear without a redesign. Problem links keep working when a title changes.</p>
        <h2>Found a mistake?</h2>
        <p>Open the problem page and note its ID (shown at the bottom of the sidebar), then send it with what looks wrong through the <Link href="/contact">contact page</Link>.</p>
        <h2>Where to next</h2>
        <div className="next-steps">
          <Link className="btn btn-primary" href="/search">Search all problems</Link>
          <Link className="btn" href="/roles">Practice for a role</Link>
          <Link className="btn" href="/topics">Fix a weak topic</Link>
        </div>
      </div>
    </div>
  );
}
