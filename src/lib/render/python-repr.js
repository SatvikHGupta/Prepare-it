// prints JSON values the way Python would, so examples read like the code they belong to
export function pyRepr(v, asFloat = false) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return Number.isFinite(v) ? (asFloat && Number.isInteger(v) ? v.toFixed(1) : String(v)) : v > 0 ? "float('inf')" : v < 0 ? "float('-inf')" : "float('nan')";
  if (typeof v === 'string') return pyStr(v);
  if (Array.isArray(v)) return `[${v.map((x) => pyRepr(x, asFloat)).join(', ')}]`;
  if (typeof v === 'object') {
    if (typeof v.$float === 'string') return `float('${v.$float}')`;
    return `{${Object.entries(v).map(([k, x]) => `${pyStr(k)}: ${pyRepr(x, asFloat)}`).join(', ')}}`;
  }
  return String(v);
}

function pyStr(s) {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = '';
  for (const ch of s) {
    if (ch === '\\') out += '\\\\';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\t') out += '\\t';
    else if (ch === '\r') out += '\\r';
    else if (ch === q) out += `\\${q}`;
    else out += ch;
  }
  return q + out + q;
}

export function funcName(signature, fallback = 'solve') {
  const m = /def\s+([A-Za-z_]\w*)\s*\(/.exec(signature || '');
  return m ? m[1] : fallback;
}

// JSON drops the ".0" of floats, so an example output of 6.0 would read 6; a return annotation made of floats only restores it
export function returnsFloat(signature) {
  const m = /\)\s*->\s*([^:\n]+):/.exec(signature || '');
  return !!m && /\bfloat\b/.test(m[1]) && !/\b(int|str|bool)\b/.test(m[1]);
}
