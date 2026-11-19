// the data folder has shipped two index shapes (objects with labels, plain ids); accept both
export const typeId = (t) => (t && typeof t === 'object' ? t.id : t) || '';
export const topicIds = (a) => (Array.isArray(a) ? a.map((x) => (x && typeof x === 'object' ? x.id : x)).filter(Boolean) : []);
export const levelOf = (v) => (v && typeof v === 'object' ? v.level : v) || '';

// the renderer is chosen from the fields a row has, so a new problem type still renders
export function kindOf(row) {
  if (row.expected && row.schema !== undefined) return 'sql';
  if (row.buggy_code !== undefined) return 'debug';
  if (row.class_name !== undefined) return 'lld';
  if (row.answer_kind !== undefined) return 'stats';
  if (row.signature !== undefined) return 'code';
  return 'prose';
}

export const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };
export const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export function prettify(id) {
  return String(id || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// AI-written rows sometimes hold a string where a list belongs. One bad field must not turn the whole page into a 500,
// so the list fields are coerced here, once, before any component reads them.
// code lines keep their indentation, prose lines are trimmed
const textList = (v, code = false) => (Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? v.split(/\r?\n/).map((x) => (code ? x.trimEnd() : x.trim())).filter((x) => x.trim()) : []);
const objectList = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []);

export function cleanRow(row) {
  const out = { ...row };
  for (const k of ['hints', 'constraints', 'api', 'follow_ups']) if (k in out) out[k] = textList(out[k], k === 'api');
  if ('examples' in out) {
    out.examples = objectList(out.examples).map((e) => (e.calls === undefined ? e : { ...e, calls: Array.isArray(e.calls) ? e.calls.filter(Array.isArray) : [], expect: Array.isArray(e.expect) ? e.expect : [] }));
  }
  return out;
}
