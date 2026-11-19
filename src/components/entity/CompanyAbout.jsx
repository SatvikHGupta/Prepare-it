import Icon from '@/components/ui/Icon';
import { labelSources } from '@/lib/source-label';

const own = { rel: 'noopener noreferrer', target: '_blank' };
const third = { rel: 'noopener noreferrer nofollow', target: '_blank' }; // pages we do not control

// confidence of the company links (the sheet's three tiers), drawn with the theme's green, amber and red
const LINK_MARKS = {
  1: { cls: 'ok', glyph: 'tick', text: 'Well-known company: these links point to its own sites.' },
  2: { cls: 'guess', glyph: 'triangle', text: 'Not fully checked. Make sure each link opens the right company before you rely on it.' },
  3: { cls: 'unsure', glyph: 'bang', text: 'We could not confirm this company\u2019s own sites, so these open searches.' },
};
const NO_COMPANY = 'We could not tell which company this is, so there is no interview path for it yet and these links open searches, not its own sites.';

// how far to trust the research text; "none" is covered by the red link mark
const DEPTH_MARKS = {
  thin: { cls: 'guess', glyph: 'triangle', text: 'Few first-hand reports were found for this company, so treat the steps as a rough guide.' },
  unsure: { cls: 'guess', glyph: 'triangle', text: 'We are not fully sure this is the company you mean, so check that the details match.' },
};

function Glyph({ kind }) {
  const d = { tick: 'M5 12.5l4.5 4.5L19 7.5', triangle: 'M12 4.5L21 19.5H3Z M12 10v4.5 M12 17.2v.1', bang: 'M12 5v9 M12 18.5v.1' }[kind];
  return <svg className="ls-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={d} /></svg>;
}

function Mark({ mark, children }) {
  return (
    <p className={`link-mark ${mark.cls}`}>
      <Glyph kind={mark.glyph} />
      <span>{children ?? mark.text}</span>
    </p>
  );
}

// links to the company itself, then what its interviews look like.
// Order of trust: a reviewed profile, then the researched sheet (marked by confidence), then plain searches.
export default function CompanyAbout({ name, profile, research }) {
  const q = encodeURIComponent(name);
  const search = {
    website: `https://www.google.com/search?q=${q}+official+website`,
    careers: `https://www.google.com/search?q=${q}+careers`,
    linkedin: `https://www.linkedin.com/search/results/companies/?keywords=${q}`,
  };
  const R = profile ? null : research;
  const tier = R?.tier || 0;
  let buttons;
  if (profile) buttons = [['Website', profile.website], ['Careers page', profile.careers], ['LinkedIn', profile.linkedin]];
  else if (tier === 1 || tier === 2) buttons = [['Website', R.website], ['Careers page', R.careers], ['LinkedIn', R.linkedin]];
  else if (tier === 3) buttons = [['Search the web', search.website], ['Search for careers', search.careers], ['Find on LinkedIn', search.linkedin]];
  else buttons = [['Search for careers', search.careers], ['Find on LinkedIn', search.linkedin]];

  const official = labelSources(R?.official);
  const other = labelSources(R?.other);
  const hasText = R && R.depth !== 'none' && (R.roles || R.steps?.length || R.note);
  return (
    <>
      <p className="about-links">
        {buttons.filter(([, u]) => u).map(([label, url]) => <a key={label} className="btn" href={url} {...own}>{label}<Icon name="arrow" /></a>)}
      </p>
      {tier === 3 && R.depth === 'none' ? <Mark mark={LINK_MARKS[3]}>{NO_COMPANY}</Mark> : null}
      {tier === 3 && R.depth !== 'none' ? <Mark mark={LINK_MARKS[3]} /> : null}
      {tier === 1 ? <Mark mark={LINK_MARKS[1]} /> : null}
      {tier === 2 ? <Mark mark={LINK_MARKS[2]}>{LINK_MARKS[2].text} <a href={search.linkedin} {...own}>Search LinkedIn instead</a>.</Mark> : null}

      {profile?.roles?.length ? (
        <div className="role-cards">
          {profile.roles.map((r) => (
            <article className="role-card" key={r.title}>
              <h3>{r.title}</h3>
              {r.levels ? <p className="levels"><span>Levels</span>{r.levels}</p> : null}
              <ol className="rounds">{r.rounds.map((x) => <li key={x}>{x}</li>)}</ol>
              {r.note ? <p className="muted small">{r.note}</p> : null}
            </article>
          ))}
        </div>
      ) : hasText ? (
        <div className="role-cards">
          {R.roles ? <article className="role-card"><h3>Roles and levels</h3><p>{R.roles}</p></article> : null}
          {R.steps?.length || R.note ? (
            <article className="role-card">
              <h3>Steps people report</h3>
              {R.steps?.length ? <ol className="rounds">{R.steps.map((x) => <li key={x}>{x}</li>)}</ol> : null}
              {R.note ? <p className={R.steps?.length ? 'muted small' : ''}>{R.note}</p> : null}
            </article>
          ) : null}
        </div>
      ) : (
        <p className="muted small">{profile ? 'Interview details for this company have not been added yet. ' : ''}Check the company&rsquo;s careers page for the roles it is hiring for and ask your recruiter how its interviews run.</p>
      )}
      {hasText && DEPTH_MARKS[R.depth] ? <Mark mark={DEPTH_MARKS[R.depth]} /> : null}

      {profile?.sources?.length ? (
        <p className="muted small about-sources">
          Sources: {profile.sources.map((s, i) => <span key={s.url}>{i ? ', ' : ''}<a href={s.url} {...own}>{s.label}</a>{s.official ? ' (from the company)' : ''}</span>)}. Interview processes change and differ by team and level, so confirm with the company. Last reviewed {profile.asOf}.
        </p>
      ) : null}
      {hasText ? (
        <p className="muted small about-sources">
          {official.length ? <>From the company: {official.map((s, i) => <span key={s.url}>{i ? ', ' : ''}<a href={s.url} {...own}>{s.label}</a></span>)}. </> : null}
          {other.length ? <>Candidate guides and reviews: {other.map((s, i) => <span key={s.url}>{i ? ', ' : ''}<a href={s.url} {...third}>{s.label}</a></span>)}. </> : null}
          Compiled from public pages and candidate reports in {R.asOf}, not confirmed by the company. Interview processes change and differ by team and level, so confirm with the company.
        </p>
      ) : null}
    </>
  );
}
