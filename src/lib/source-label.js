// Readable names for the source links of a company: a known site gets its name, anything else shows its host.
const SITES = {
  'interviewquery.com': 'Interview Query', 'prachub.com': 'PracHub', 'dataford.io': 'Dataford', 'techprep.app': 'TechPrep', 'jointaro.com': 'Taro',
  '1point3acres.com': '1Point3Acres', 'tryexponent.com': 'Exponent', 'igotanoffer.com': 'IGotAnOffer', 'indeed.com': 'Indeed', 'reddit.com': 'Reddit',
  'teamblind.com': 'Blind', 'leetcode.com': 'LeetCode', 'levels.fyi': 'Levels.fyi', 'youtube.com': 'YouTube', 'medium.com': 'Medium', 'linkedin.com': 'LinkedIn',
  'prepfully.com': 'Prepfully', 'interviewkickstart.com': 'Interview Kickstart', 'datainterview.com': 'DataInterview', 'hellointerview.com': 'Hello Interview',
};

export function sourceName(url) {
  let host;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    host = u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
  if (/(^|\.)glassdoor\./.test(host)) return 'Glassdoor';
  const known = Object.keys(SITES).find((k) => host === k || host.endsWith('.' + k));
  return known ? SITES[known] : host;
}

// first path segments of a url, to tell two pages of the same site apart (asana.com/jobs/interview-tips)
function pathLabel(url) {
  try {
    const u = new URL(url);
    const seg = u.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
    const text = u.hostname.replace(/^www\./, '') + (seg ? '/' + seg : '');
    return text.length > 44 ? text.slice(0, 43) + '\u2026' : text;
  } catch {
    return '';
  }
}

// [{ url, label }] where repeated names are told apart: unknown sites by their path, known sites by a number (Glassdoor 1, Glassdoor 2).
// Links that are not http(s) are dropped.
export function labelSources(urls) {
  const named = (urls || []).map((url) => ({ url, label: sourceName(url) })).filter((s) => s.label);
  const count = (list) => list.reduce((m, s) => ((m[s.label] = (m[s.label] || 0) + 1), m), {});
  let total = count(named);
  // an unknown site shows its bare host, so a repeated host can be refined with its path
  const known = new Set(Object.values(SITES).concat('Glassdoor'));
  const refined = named.map((s) => (total[s.label] > 1 && !known.has(s.label) ? { ...s, label: pathLabel(s.url) || s.label } : s));
  total = count(refined);
  const seen = {};
  return refined.map((s) => (total[s.label] > 1 ? { ...s, label: `${s.label} ${(seen[s.label] = (seen[s.label] || 0) + 1)}` } : s));
}
