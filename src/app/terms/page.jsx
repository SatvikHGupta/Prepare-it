import Link from 'next/link';
import { pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({ title: 'Terms of use', description: 'Terms for using Prepare it: practice material is AI-generated, provided as is, and not a guarantee of any interview.', path: '/terms' });

export default function Terms() {
  return (
    <div className="container narrow page">
      <h1>Terms of use</h1>
      <div className="prose">
        <p>Prepare it is free to use for personal learning.</p>
        <h2>Practice material only</h2>
        <p>All problems, solutions and explanations are AI-generated. They may contain errors. Each problem page says how it was checked, and none of it is a guarantee of correctness. Do not rely on it for anything where a mistake would matter.</p>
        <h2>No affiliation</h2>
        <p>Prepare it is not affiliated with, endorsed by or connected to any company named on the site. Company names are used only to describe publicly reported interview information. No problem is a question that a company asked.</p>
        <h2>No guarantees</h2>
        <p>Prepare it does not promise any interview result. Reported counts and outcomes describe what people shared publicly, not your chances.</p>
        <h2>AI-generated content</h2>
        <p>Prepare it&rsquo;s problems and solutions are created by AI from information gathered from public websites and platforms, then rewritten by AI in its own words (see <Link href="/about">how Prepare it works</Link>). They are made for everyone. There is no individual human author, and Prepare it does not claim authorship of them or present them as original human-written work.</p>
        <p>Because the text is AI-generated, it may be inaccurate, incomplete, or similar to material that already exists elsewhere. You use it at your own judgement. You may use it for personal learning and practice.</p>
        <h2>Source material</h2>
        <p>Information that people posted publicly belongs to those people and to the platforms that host it. Prepare it is not affiliated with those platforms, and their names and marks belong to their owners. If you believe something on Prepare it should not be here, use the <Link href="/contact">contact page</Link> with the problem link, and it will be reviewed and corrected or removed where appropriate.</p>
        <h2>Use of AI and liability</h2>
        <p>By using Prepare it you acknowledge that its content is produced with AI and rewritten from public information, and that Prepare it gives no warranty that it is accurate, complete, unique or free of overlap with other works. The site is provided &ldquo;as is&rdquo;.</p>
        <p>To the fullest extent permitted by law, Prepare it and its operator are not liable for any loss, damage or claim arising from your use of the site or its content, including claims that relate to the use of AI to create it, and you agree not to bring such claims. Nothing here limits any right that cannot be limited by law.</p>
        <h2>Fair use</h2>
        <p>Do not scrape the site in a way that degrades it for others. The data is served from a static host that may rate-limit heavy automated use.</p>
      </div>
    </div>
  );
}
