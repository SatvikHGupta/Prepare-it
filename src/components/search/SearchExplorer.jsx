'use client';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Num from '@/components/ui/Num';
import { prettify } from '@/lib/data/normalize';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Segmented from '@/components/ui/Segmented';
import { Select, MultiSelect } from '@/components/ui/Dropdown';
import { ListItem, TableRow, CardItem } from './ResultCard';
import { loadIndex, loadEntities } from '@/lib/client/index-data';
import { scoreAll, filterIndices, facetCounts, sortIndices, activeCount, buildVocab, suggestQuery, norm, EMPTY } from '@/lib/search/engine';
import { parseFilters, filtersToQuery } from '@/lib/search/url';
import { problemPath, cidFromSlug } from '@/lib/slug';
import { rememberList, listFromLinks } from '@/lib/client/nav-context';
import { DIFFICULTY_ORDER } from '@/lib/data/normalize';

const PAGE = 30;
const LEVELS = [
  { id: 'computed', label: 'Answer recomputed' },
  { id: 'executed', label: 'Solution passes tests' },
  { id: 'structural', label: 'Not independently verified' },
];
const DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const GROUPS = [
  { id: 'none', label: 'No grouping' },
  { id: 'type', label: 'Question type' },
  { id: 'domain', label: 'Domain' },
  { id: 'difficulty', label: 'Difficulty' },
  { id: 'topic', label: 'Topic' },
];
const VIEWS = [
  { id: 'list', aria: 'List view', icon: <Icon name="list" /> },
  { id: 'table', aria: 'Table view', icon: <Icon name="table" /> },
  { id: 'cards', aria: 'Card view', icon: <Icon name="blocks" /> },
];
const ENTITY_PATH = { company: '/companies', topic: '/topics', role: '/roles' };
const ENTITY_NOUN = { company: 'Company', topic: 'Topic', role: 'Role' };
const FACETS = { type: 'Type', domain: 'Domain', topic: 'Topic', tag: 'Tag', level: 'Checked' };

// the typo vocabulary is only built when a search finds nothing, and once per index
const vocabCache = new WeakMap();
function vocabFor(rows) {
  let v = vocabCache.get(rows);
  if (!v) {
    v = buildVocab(rows);
    vocabCache.set(rows, v);
  }
  return v;
}

const toOptions = (map) => Object.entries(map || {}).map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
const store = {
  get: (k, fallback) => {
    try {
      return window.localStorage.getItem(k) || fallback;
    } catch {
      return fallback;
    }
  },
  set: (k, v) => {
    try {
      window.localStorage.setItem(k, v);
    } catch {}
  },
};

// a remembered choice kept in localStorage; the server and first paint use the fallback
const prefSubs = new Set();
function usePref(key, fallback, valid) {
  const subscribe = useCallback((f) => {
    prefSubs.add(f);
    window.addEventListener('storage', f);
    return () => {
      prefSubs.delete(f);
      window.removeEventListener('storage', f);
    };
  }, []);
  const raw = useSyncExternalStore(subscribe, () => store.get(key, fallback), () => fallback);
  const set = (v) => {
    store.set(key, v);
    prefSubs.forEach((f) => f());
  };
  return [valid.includes(raw) ? raw : fallback, set];
}

export default function SearchExplorer({ version, labels }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const filtersRef = useRef(filters);
  const timer = useRef(null);

  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [showCtl, setShowCtl] = useState(false);
  const resultsRef = useRef(null);
  const focusFrom = useRef(-1);
  const [entities, setEntities] = useState(null);
  const [text, setText] = useState(filters.q);
  const [pushed, setPushed] = useState(filters.q);
  const [prevQ, setPrevQ] = useState(filters.q);
  const [more, setMore] = useState({ key: '', n: PAGE });
  const [view, setView] = usePref('prepit-view', 'list', VIEWS.map((x) => x.id));
  const [group, setGroup] = usePref('prepit-group', 'none', GROUPS.map((x) => x.id));

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  // keep the box in step with back/forward, but never fight the user's own typing
  if (filters.q !== prevQ) {
    setPrevQ(filters.q);
    if (filters.q !== pushed) setText(filters.q);
  }

  useEffect(() => {
    let alive = true;
    loadIndex(version, labels)
      .then((r) => alive && setRows(r))
      .catch(() => alive && setError('Could not load the problem index.'));
    return () => {
      alive = false;
    };
  }, [version, labels, attempt]);

  const needEntities = norm(filters.q).length >= 2;
  useEffect(() => {
    if (!needEntities || entities) return undefined;
    let alive = true;
    loadEntities().then((e) => alive && setEntities(e));
    return () => {
      alive = false;
    };
  }, [needEntities, entities]);

  const push = useCallback(
    (next) => {
      const qs = filtersToQuery(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );
  const set = (patch) => push({ ...filters, ...patch });
  const toggle = (dim, val) => set({ [dim]: filters[dim].includes(val) ? filters[dim].filter((v) => v !== val) : [...filters[dim], val] });

  function onType(v) {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPushed(v.trim());
      push({ ...filtersRef.current, q: v });
    }, 220);
  }
  function clearAll() {
    clearTimeout(timer.current);
    setText('');
    setPushed('');
    push(EMPTY);
  }
  function clearFilters() {
    set({ type: [], domain: [], difficulty: [], level: [], topic: [], tag: [] });
  }

  const qs = useMemo(() => (rows ? scoreAll(rows, filters.q) : null), [rows, filters.q]);
  const counts = useMemo(() => (rows ? facetCounts(rows, filters, qs) : null), [rows, filters, qs]);
  const filtered = useMemo(() => (rows ? filterIndices(rows, filters, qs) : []), [rows, filters, qs]);

  // grouping sorts by group first, then by the chosen order inside each group
  const groupLabel = useCallback(
    (r) => {
      if (group === 'type') return labels.types?.[r.type] || r.type;
      if (group === 'domain') return labels.domains?.[r.domain] || r.domain;
      if (group === 'difficulty') return DIFF_LABEL[r.difficulty] || r.difficulty;
      if (group === 'topic') return labels.topics?.[r.topics[0]] || 'Other';
      return '';
    },
    [group, labels],
  );
  const sorted = useMemo(() => {
    if (!rows) return [];
    const base = sortIndices(rows, filtered, filters.sort, qs);
    if (group === 'none') return base;
    const rank = (i) => (group === 'difficulty' ? DIFFICULTY_ORDER[rows[i].difficulty] ?? 1 : 0);
    return base.slice().sort((a, b) => rank(a) - rank(b) || groupLabel(rows[a]).localeCompare(groupLabel(rows[b])));
  }, [rows, filtered, filters.sort, qs, group, groupLabel]);

  const didYouMean = useMemo(() => (rows && filters.q.trim() && sorted.length === 0 ? suggestQuery(vocabFor(rows), filters.q) : null), [rows, filters.q, sorted.length]);

  const typeOpts = useMemo(() => toOptions(labels.types), [labels]);
  const domainOpts = useMemo(() => toOptions(labels.domains), [labels]);
  // topics with the most problems, offered when a search finds nothing
  const popular = useMemo(() => { const c = new Map(); for (const r of rows || []) for (const t of r.topics.slice(0, 1)) c.set(t, (c.get(t) || 0) + 1); return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t); }, [rows]);
  const topicOpts = useMemo(() => toOptions(labels.topics), [labels]);
  const tagOpts = useMemo(() => (rows ? [...new Set(rows.flatMap((r) => r.tags))].map((t) => ({ id: t, label: t })) : []), [rows]);
  const labelOf = { type: labels.types, domain: labels.domains, topic: labels.topics, level: Object.fromEntries(LEVELS.map((l) => [l.id, l.label])), difficulty: DIFF_LABEL, tag: {} };

  const listKey = `${filters.q}|${activeCount(filters)}|${filters.sort}|${filtered.length}|${group}`;
  const limit = more.key === listKey ? more.n : PAGE;
  const visible = sorted.slice(0, limit);
  const tokens = useMemo(() => norm(filters.q).split(' ').filter(Boolean), [filters.q]);
  // after "Show more" the keyboard lands on the first new row instead of falling back to the page
  useEffect(() => {
    if (focusFrom.current < 0) return;
    resultsRef.current?.querySelectorAll('a.title, .rt-row > a')[focusFrom.current]?.focus();
    focusFrom.current = -1;
  }, [limit]);

  // blocks = runs of rows under one group heading (a single block when not grouping)
  const blocks = useMemo(() => {
    if (!rows) return [];
    if (group === 'none') return [{ label: '', total: 0, items: visible }];
    const totals = new Map();
    for (const i of sorted) totals.set(groupLabel(rows[i]), (totals.get(groupLabel(rows[i])) || 0) + 1);
    const out = [];
    for (const i of visible) {
      const label = groupLabel(rows[i]);
      if (!out.length || out.at(-1).label !== label) out.push({ label, total: totals.get(label), items: [] });
      out.at(-1).items.push(i);
    }
    return out;
  }, [rows, visible, sorted, group, groupLabel]);

  const entityHits = useMemo(() => {
    const qn = norm(filters.q);
    if (!entities || qn.length < 2) return [];
    return entities
      .filter((e) => norm(e.label).includes(qn) || (e.aliases || []).some((a) => norm(a).includes(qn)))
      .sort((a, b) => (b.pop || 0) - (a.pop || 0))
      .slice(0, 6);
  }, [entities, filters.q]);

  const diffValue = filters.difficulty.length === 1 ? filters.difficulty[0] : filters.difficulty.length ? 'multi' : 'any';
  const diffOptions = [
    { id: 'any', label: 'Any' },
    ...['easy', 'medium', 'hard'].map((d) => ({ id: d, label: DIFF_LABEL[d], count: counts ? (counts.difficulty.get(d) || 0).toLocaleString('en-US') : undefined })),
  ];
  const sortOptions = [
    ...(filters.q.trim() ? [{ id: 'relevance', label: 'Best match' }] : []),
    { id: 'title', label: 'Title, A to Z' },
    { id: 'easy', label: 'Easiest first' },
    { id: 'hard', label: 'Hardest first' },
  ];
  const sortValue = filters.sort || (filters.q.trim() ? 'relevance' : 'title');
  const nFilters = activeCount(filters);
  const total = rows ? rows.length : 0;
  const Item = view === 'table' ? TableRow : view === 'cards' ? CardItem : ListItem;
  const Wrap = view === 'table' ? 'div' : view === 'cards' ? 'div' : 'div';
  const wrapClass = view === 'table' ? 'res-table' : view === 'cards' ? 'res-cards' : 'res-list';

  function surprise() {
    if (!rows || !sorted.length) return;
    const at = Math.floor(Math.random() * sorted.length);
    const r = rows[sorted[at]];
    const from = Math.max(0, at - 150);
    rememberList({ label: 'Random from these results', offset: from, total: sorted.length, items: sorted.slice(from, at + 250).map((i) => [problemPath(rows[i].cid, rows[i].title), rows[i].title]) });
    router.push(problemPath(r.cid, r.title));
  }

  // clicking a problem remembers the list it came from, so the problem page can offer previous and next
  function remember(e) {
    const a = e.target.closest?.('a[href^="/problems/"]');
    if (!a || !rows) return;
    const label = filters.q.trim() ? `Search “${filters.q.trim()}”` : 'Search results';
    const cid = cidFromSlug(new URL(a.href).pathname.split('/').pop());
    const at = group === 'none' ? sorted.findIndex((i) => rows[i].cid === cid) : -1;
    if (at < 0) {
      rememberList({ label, items: listFromLinks(resultsRef.current) });
      return;
    }
    const from = Math.max(0, at - 150);
    rememberList({ label, offset: from, total: sorted.length, items: sorted.slice(from, at + 250).map((i) => [problemPath(rows[i].cid, rows[i].title), rows[i].title]) });
  }
  const customised = group !== 'none' || view !== 'list' || sortValue !== (filters.q.trim() ? 'relevance' : 'title');

  return (
    <div className="results-area">
      <div className="field field-lg" role="search" aria-label="Search and filter problems">
        <Icon name="search" />
        <input id="explorer-search" type="search" value={text} onChange={(e) => onType(e.target.value)} placeholder="Search by title, tag or topic" aria-label="Search problems" autoComplete="off" />
        {text ? <button type="button" className="clear" aria-label="Clear search" onClick={() => { clearTimeout(timer.current); setText(''); setPushed(''); set({ q: '' }); }}><Icon name="close" /></button> : null}
      </div>

      <div className="filterbar" role="group" aria-label="Filters">
        <Segmented label="Difficulty" options={diffOptions} value={diffValue} onChange={(id) => set({ difficulty: id === 'any' ? [] : [id] })} />
        <MultiSelect label={FACETS.type} options={typeOpts} selected={filters.type} counts={counts?.type} onToggle={(v) => toggle('type', v)} onClear={() => set({ type: [] })} />
        <MultiSelect label={FACETS.domain} options={domainOpts} selected={filters.domain} counts={counts?.domain} onToggle={(v) => toggle('domain', v)} onClear={() => set({ domain: [] })} />
        <MultiSelect label={FACETS.topic} options={topicOpts} selected={filters.topic} counts={counts?.topic} onToggle={(v) => toggle('topic', v)} onClear={() => set({ topic: [] })} find />
        <MultiSelect label={FACETS.tag} options={tagOpts} selected={filters.tag} counts={counts?.tag} onToggle={(v) => toggle('tag', v)} onClear={() => set({ tag: [] })} find />
        <MultiSelect label={FACETS.level} options={LEVELS} selected={filters.level} counts={counts?.level} onToggle={(v) => toggle('level', v)} onClear={() => set({ level: [] })} />
        <button type="button" className="btn btn-sm clear-filters" onClick={clearFilters} disabled={nFilters === 0} aria-label="Clear filters" title="Clear filters"><Icon name="close" /><span>Clear filters</span></button>
      </div>

      {nFilters - (filters.difficulty.length === 1 ? 1 : 0) > 0 ? (
        <div className="active" aria-label="Active filters">
          {['type', 'domain', 'difficulty', 'level', 'topic', 'tag'].map((d) => (d === 'difficulty' && filters[d].length === 1) || !filters[d].length ? null : (
            <div className="ag" key={d}>
              <span className="ag-label">{FACETS[d] || 'Difficulty'}</span>
              {filters[d].map((v) => (
                <button key={v} type="button" className="chip on" onClick={() => toggle(d, v)} aria-label={`Remove ${FACETS[d] || 'Difficulty'} filter ${labelOf[d]?.[v] || v}`}>
                  {labelOf[d]?.[v] || v} <Icon name="close" />
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="active empty" aria-label="Active filters"><span className="active-empty">No filters yet. Pick a difficulty, type, domain, topic or tag above.</span></div>
      )}

      {entityHits.length ? (
        <div className="entity-hits">
          <span>Jump to</span>
          {entityHits.map((e) => <Link key={`${e.t}-${e.id}`} href={`${ENTITY_PATH[e.t]}/${e.id}`}>{e.label} <span className="muted">({ENTITY_NOUN[e.t].toLowerCase()})</span></Link>)}
        </div>
      ) : null}

      <div className="resultsbar" data-open={showCtl || undefined}>
        <div className="count" aria-live="polite">
          {rows ? <><span style={{ color: 'var(--text)', fontWeight: 700 }}><Num value={sorted.length} /> {sorted.length === 1 ? 'problem' : 'problems'}</span>{sorted.length !== total ? <span> {`of ${total.toLocaleString('en-US')}`}</span> : null}</> : 'Loading…'}
        </div>
        <button type="button" className="btn btn-sm display-btn" aria-expanded={showCtl} aria-controls="display-opts" onClick={() => setShowCtl((o) => !o)}>
          <span>Display</span>{customised ? <span className="dot" role="img" aria-label="changed" /> : null}<Icon name="chevron" />
        </button>
        <div className="ctl" id="display-opts">
          <Select label="Group" value={group} options={GROUPS} onChange={setGroup} align="right" />
          <Select label="Sort" value={sortValue} options={sortOptions} onChange={(id) => set({ sort: id })} align="right" />
          <Segmented label="View" options={VIEWS} value={view} onChange={setView} />
          <button type="button" className="btn btn-sm" onClick={surprise} disabled={!sorted.length} title="Open a random problem from these results"><Icon name="shuffle" /><span>Random</span></button>
        </div>
      </div>

      <div ref={resultsRef} style={{ minHeight: '75vh' }} onClickCapture={remember}>
      {error ? <div role="alert" className="empty"><p>{error}</p><button type="button" className="btn" onClick={() => { setError(''); setAttempt((a) => a + 1); }}>Try again</button></div> : null}
      {!rows && !error ? <div aria-busy="true">{Array.from({ length: 6 }, (_, i) => <div className="skeleton" key={i} />)}</div> : null}

      {rows && sorted.length === 0 ? (
        <div className="empty">
          <h2>No problems match.</h2>
          {popular.length ? <p className="popular">Popular topics: {popular.map((t) => <Link key={t} className="chip" href={`/topics/${t}`}>{labels.topics?.[t] || prettify(t)}</Link>)}</p> : null}
          {didYouMean ? <p className="did-you-mean">Did you mean <button type="button" className="link-btn" onClick={() => { setText(didYouMean); setPushed(didYouMean); set({ q: didYouMean }); }}><strong>{didYouMean}</strong></button>?</p> : tokens.length === 0 && filters.q.trim() ? <p>Search understands English letters and numbers. Try a word like graph or sql.</p> : <p>Try fewer words, a different spelling or fewer filters.</p>}
          {nFilters || filters.q ? <button type="button" className="btn" onClick={clearAll}>Clear search and filters</button> : null}
        </div>
      ) : null}

      {rows && sorted.length ? (
        <>
          {blocks.map((b, bi) => (
            <section key={`${b.label}-${bi}`}>
              {b.label ? <div className="group-h"><h2>{b.label}</h2><span>{b.total.toLocaleString('en-US')}</span></div> : null}
              {view === 'table' && bi === 0 ? (
                <div className="rt-head" aria-hidden="true"><span>Title</span><span>Difficulty</span><span className="hide-sm">Type</span><span className="hide-sm">Topic</span><span /></div>
              ) : null}
              <Wrap className={wrapClass}>
                {b.items.map((i) => <Item key={rows[i].cid} row={rows[i]} labels={labels} tokens={tokens} />)}
              </Wrap>
            </section>
          ))}
          {sorted.length > limit ? (
            <div className="pager">
              <button type="button" className="btn" onClick={() => { focusFrom.current = limit; setMore({ key: listKey, n: limit + PAGE }); }}>
                Show {Math.min(PAGE, sorted.length - limit)} more <span className="muted">({limit} of {sorted.length.toLocaleString('en-US')})</span>
              </button>
            </div>
          ) : null}
        </>
      ) : null}
      </div>
    </div>
  );
}
