// builds the mailto link for the contact form; empty optional fields are left out of the body
export function buildMailto(email, { topic, name, reply, link, claim, company, message }) {
  const lines = [`Topic: ${topic}`];
  if (name) lines.push(`Name: ${name}`);
  if (reply) lines.push(`Reply to: ${reply}`);
  if (link) lines.push(`Problem, source or page: ${link}`);
  if (claim) lines.push(`My claim about it: ${claim}`);
  if (company) lines.push(`Company and role: ${company}`);
  lines.push('', message);
  return `mailto:${email}?subject=${encodeURIComponent(`[Prepare it] ${topic}`)}&body=${encodeURIComponent(lines.join('\n').replace(/\r?\n/g, '\r\n'))}`;
}
