import Link from 'next/link';
import ChartCanvas from './ChartCanvas';
import { Section, LinkList } from '@/components/entity/Parts';
import Fold from '@/components/ui/Fold';
import { isNum, fmt, monthLabel } from '@/components/entity/format';
import { prettify, DIFFICULTY_LABEL } from '@/lib/data/normalize';

// one framed chart with a title and a one-line reading of it
export function Panel({ title, sub, children, wide = false }) {
  return (
    <figure className={`panel${wide ? ' wide' : ''}`}>
      <figcaption>
        <h3>{title}</h3>
        {sub ? <p>{sub}</p> : null}
      </figcaption>
      {children}
    </figure>
  );
}

const numeric = (o) => Object.entries(o || {}).map(([label, value]) => ({ label, value })).sort((a, b) => (isNum(b.value) ? b.value : -1) - (isNum(a.value) ? a.value : -1));
const rowsOf = (items) => ({ head: ['Name', 'Count'], rows: items.map((i) => [i.label, i.display ?? i.value]) });
const hbar = (items, unit) => ({ labels: items.map((i) => i.label), values: items.map((i) => (isNum(i.value) ? i.value : 0)), display: items.map((i) => (isNum(i.value) ? undefined : i.value)), unit });
// long tails become one "Other" slice so a doughnut stays readable
function topWithOther(items, n = 6) {
  if (items.length <= n + 1) return items;
  const head = items.slice(0, n);
  return [...head, { label: 'Other', value: items.slice(n).reduce((s, i) => s + (isNum(i.value) ? i.value : 0), 0) }];
}
const barHeight = (n) => Math.max(120, n * 34 + 36);

// Reports over time, the interview process and what gets asked. Used by company, company x role and role pages.
export default function Dashboard({ e, labels, roleItems, roleTitle = 'By role', roleSub, roleUnit = 'reports', compact = true }) {
  const exp = e.experiences?.n ? e.experiences : null;
  const stages = numeric(exp?.stages);
  const outcomes = numeric(exp?.outcomes).filter((o) => isNum(o.value) && o.value > 0);
  const topics = (e.topics || []).slice(0, 10).map(([t, n]) => ({ label: labels.topics[t] || prettify(t), value: n, id: t }));
  const types = topWithOther((e.types || []).map(([t, n]) => ({ label: labels.types[t] || prettify(t), value: n })));
  const diff = (e.difficulty || []).filter(([, n]) => n > 0).map(([d, n]) => ({ id: d, label: DIFFICULTY_LABEL[d] || prettify(d), value: n }));
  const months = Array.isArray(e.trend) && e.trend.length > 1 && e.trend.some((v) => v > 0) ? e.trend : null;
  const partial = Boolean(labels.dims.last_month_partial);
  const trendLabels = months ? months.map((_, i) => monthLabel(e.trend_start, i)) : [];

  const hasMore = Boolean(months || outcomes.length || (exp && stages.length) || types.length || diff.length || roleItems?.length);
  if (!compact) {
    return (
      <>
      {months || outcomes.length ? (
        <Section id="snapshot" title="Snapshot">
          <div className="dash">
            {months ? (
              <Panel title="Reports over time" sub={`${monthLabel(e.trend_start, 0)} to ${monthLabel(e.trend_start, months.length - 1)}${partial ? ', last month still in progress' : ''}`} wide={!outcomes.length}>
                <ChartCanvas kind="trend" height={250} label={`Reports per month: ${months.join(', ')}`} data={{ labels: trendLabels, values: months, partial, unit: 'reports' }} table={{ head: ['Month', 'Reports'], rows: months.map((v, i) => [trendLabels[i], v]) }} />
              </Panel>
            ) : null}
            {outcomes.length ? (
              <Panel title="How interviews ended" sub="Outcomes people reported">
                <ChartCanvas kind="doughnut" height={250} label={`Outcomes: ${outcomes.map((o) => `${o.label} ${o.value}`).join(', ')}`} data={{ labels: outcomes.map((o) => o.label), values: outcomes.map((o) => o.value), semantic: true, unit: 'reports' }} table={rowsOf(outcomes)} />
              </Panel>
            ) : null}
          </div>
        </Section>
      ) : null}
      {exp && stages.length ? (
        <Section id="process" title="Interview process" note="Counts come from reports shared publicly, not from the company. They show what was reported, not your chances. '<5' means fewer than five reports.">
          {exp.typical_stages?.length ? (
            <ol className="steps" aria-label="Most common path">
              {exp.typical_stages.map((s) => <li key={s}>{s}</li>)}
            </ol>
          ) : null}
          <div className="dash" style={{ marginTop: 18 }}>
            {stages.length ? (
              <Panel title="Stages reported" sub="How many reports mention each stage">
                <ChartCanvas kind="hbar" height={barHeight(stages.length)} label={`Stages: ${stages.map((s) => `${s.label} ${fmt(s.value)}`).join(', ')}`} data={hbar(stages, 'reports')} table={rowsOf(stages.map((s) => ({ ...s, display: fmt(s.value) })))} />
              </Panel>
            ) : null}
          </div>
        </Section>
      ) : null}
      {topics.length || (!compact && types.length) ? (
        <Section id="asks" title={compact ? 'Most asked topics' : 'What gets asked'}>
          <div className="dash">
            {topics.length ? (
              <Panel title="Topics that come up most" sub="Reports touching each topic" wide={compact || !types.length}>
                <ChartCanvas kind="hbar" height={barHeight(topics.length)} label={`Top topics: ${topics.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={hbar(topics, 'reports')} table={rowsOf(topics)} />
              </Panel>
            ) : null}
            {types.length && !compact ? (
              <Panel title="Question types" sub="Mix of the matched practice problems">
                <ChartCanvas kind="doughnut" height={Math.max(250, barHeight(topics.length))} label={`Question types: ${types.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={{ labels: types.map((s) => s.label), values: types.map((s) => s.value), unit: 'problems' }} table={rowsOf(types)} />
              </Panel>
            ) : null}
            {diff.length && !compact ? (
              <Panel title="Difficulty" sub="Of the matched practice problems" wide>
                <ChartCanvas kind="stacked" height={130} label={`Difficulty: ${diff.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={{ series: diff, unit: 'problems' }} table={rowsOf(diff)} />
              </Panel>
            ) : null}
          </div>
          {topics.length ? (
            <p className="topic-links"><span className="muted">Open a topic:</span> {topics.slice(0, 8).map((t) => <Link key={t.id} className="chip" href={`/topics/${t.id}`}>{t.label}</Link>)}</p>
          ) : null}
        </Section>
      ) : null}
      {roleItems?.length ? (
        <Section id="roles" title={roleTitle}>
          <div className="dash">
            <Panel title={roleTitle} sub={roleSub} wide={false}>
              <ChartCanvas kind="hbar" height={barHeight(roleItems.length)} label={`${roleTitle}: ${roleItems.map((s) => `${s.label} ${s.n}`).join(', ')}`} data={{ labels: roleItems.map((r) => r.label), values: roleItems.map((r) => r.n), unit: roleUnit }} table={rowsOf(roleItems.map((r) => ({ label: r.label, value: r.n })))} />
            </Panel>
            <div className="panel-list">
              <LinkList items={roleItems.filter((r) => r.href).map((r) => ({ label: r.label, n: `${fmt(r.n)} ${roleUnit}`, href: r.href }))} />
            </div>
          </div>
        </Section>
      ) : null}
      </>
    );
  }
  return (
    <>
      {topics.length || (!compact && types.length) ? (
        <Section id="asks" title={compact ? 'Most asked topics' : 'What gets asked'}>
          <div className="dash">
            {topics.length ? (
              <Panel title="Topics that come up most" sub="Reports touching each topic" wide={compact || !types.length}>
                <ChartCanvas kind="hbar" height={barHeight(topics.length)} label={`Top topics: ${topics.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={hbar(topics, 'reports')} table={rowsOf(topics)} />
              </Panel>
            ) : null}
            {types.length && !compact ? (
              <Panel title="Question types" sub="Mix of the matched practice problems">
                <ChartCanvas kind="doughnut" height={Math.max(250, barHeight(topics.length))} label={`Question types: ${types.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={{ labels: types.map((s) => s.label), values: types.map((s) => s.value), unit: 'problems' }} table={rowsOf(types)} />
              </Panel>
            ) : null}
            {diff.length && !compact ? (
              <Panel title="Difficulty" sub="Of the matched practice problems" wide>
                <ChartCanvas kind="stacked" height={130} label={`Difficulty: ${diff.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={{ series: diff, unit: 'problems' }} table={rowsOf(diff)} />
              </Panel>
            ) : null}
          </div>
          {topics.length ? (
            <p className="topic-links"><span className="muted">Open a topic:</span> {topics.slice(0, 8).map((t) => <Link key={t.id} className="chip" href={`/topics/${t.id}`}>{t.label}</Link>)}</p>
          ) : null}
        </Section>
      ) : null}
      {hasMore ? (
        <Fold id="more" title="More statistics" hint="trend, outcomes, interview stages, question mix">
      {months || outcomes.length ? (
        <Section id="snapshot" title="Snapshot">
          <div className="dash">
            {months ? (
              <Panel title="Reports over time" sub={`${monthLabel(e.trend_start, 0)} to ${monthLabel(e.trend_start, months.length - 1)}${partial ? ', last month still in progress' : ''}`} wide={!outcomes.length}>
                <ChartCanvas kind="trend" height={250} label={`Reports per month: ${months.join(', ')}`} data={{ labels: trendLabels, values: months, partial, unit: 'reports' }} table={{ head: ['Month', 'Reports'], rows: months.map((v, i) => [trendLabels[i], v]) }} />
              </Panel>
            ) : null}
            {outcomes.length ? (
              <Panel title="How interviews ended" sub="Outcomes people reported">
                <ChartCanvas kind="doughnut" height={250} label={`Outcomes: ${outcomes.map((o) => `${o.label} ${o.value}`).join(', ')}`} data={{ labels: outcomes.map((o) => o.label), values: outcomes.map((o) => o.value), semantic: true, unit: 'reports' }} table={rowsOf(outcomes)} />
              </Panel>
            ) : null}
          </div>
        </Section>
      ) : null}
      {exp && stages.length ? (
        <Section id="process" title="Interview process" note="Counts come from reports shared publicly, not from the company. They show what was reported, not your chances. '<5' means fewer than five reports.">
          {exp.typical_stages?.length ? (
            <ol className="steps" aria-label="Most common path">
              {exp.typical_stages.map((s) => <li key={s}>{s}</li>)}
            </ol>
          ) : null}
          <div className="dash" style={{ marginTop: 18 }}>
            {stages.length ? (
              <Panel title="Stages reported" sub="How many reports mention each stage">
                <ChartCanvas kind="hbar" height={barHeight(stages.length)} label={`Stages: ${stages.map((s) => `${s.label} ${fmt(s.value)}`).join(', ')}`} data={hbar(stages, 'reports')} table={rowsOf(stages.map((s) => ({ ...s, display: fmt(s.value) })))} />
              </Panel>
            ) : null}
          </div>
        </Section>
      ) : null}
      {compact && (types.length || diff.length) ? (
        <Section id="mix" title="Question mix">
          <div className="dash">
            {types.length ? (
              <Panel title="Question types" sub="Mix of the matched practice problems">
                <ChartCanvas kind="doughnut" height={Math.max(250, barHeight(topics.length))} label={`Question types: ${types.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={{ labels: types.map((s) => s.label), values: types.map((s) => s.value), unit: 'problems' }} table={rowsOf(types)} />
              </Panel>
            ) : null}
            {diff.length ? (
              <Panel title="Difficulty" sub="Of the matched practice problems" wide>
                <ChartCanvas kind="stacked" height={130} label={`Difficulty: ${diff.map((s) => `${s.label} ${s.value}`).join(', ')}`} data={{ series: diff, unit: 'problems' }} table={rowsOf(diff)} />
              </Panel>
            ) : null}
          </div>
        </Section>
      ) : null}
      {roleItems?.length ? (
        <Section id="roles" title={roleTitle}>
          <div className="dash">
            <Panel title={roleTitle} sub={roleSub} wide={false}>
              <ChartCanvas kind="hbar" height={barHeight(roleItems.length)} label={`${roleTitle}: ${roleItems.map((s) => `${s.label} ${s.n}`).join(', ')}`} data={{ labels: roleItems.map((r) => r.label), values: roleItems.map((r) => r.n), unit: roleUnit }} table={rowsOf(roleItems.map((r) => ({ label: r.label, value: r.n })))} />
            </Panel>
            <div className="panel-list">
              <LinkList items={roleItems.filter((r) => r.href).map((r) => ({ label: r.label, n: `${fmt(r.n)} ${roleUnit}`, href: r.href }))} />
            </div>
          </div>
        </Section>
      ) : null}
        </Fold>
      ) : null}
    </>
  );
}

// the "on this page" list that matches whichever sections the dashboard actually rendered
export function dashboardToc(e, { roles, rolesLabel = 'By role', practice = false, similar = false, compact = true } = {}) {
  const exp = e.experiences?.n ? e.experiences : null;
  const hasTrend = Array.isArray(e.trend) && e.trend.length > 1 && e.trend.some((v) => v > 0);
  const hasOutcomes = exp && Object.values(exp.outcomes || {}).some((v) => isNum(v) && v > 0);
  const hasMore = hasTrend || hasOutcomes || (exp && Object.keys(exp.stages || {}).length) || (e.types || []).length || roles;
  if (compact) {
    return [
      (e.topics || []).length && { id: 'asks', label: 'Most asked topics' },
      practice && { id: 'practice', label: 'Practice set' },
      hasMore && { id: 'more', label: 'More statistics' },
      similar && { id: 'similar', label: 'Similar' },
    ].filter(Boolean);
  }
  return [
    (hasTrend || hasOutcomes) && { id: 'snapshot', label: 'Snapshot' },
    exp && Object.keys(exp.stages || {}).length && { id: 'process', label: 'Interview process' },
    ((e.topics || []).length || (e.types || []).length) && { id: 'asks', label: 'What gets asked' },
    roles && { id: 'roles', label: rolesLabel },
    practice && { id: 'practice', label: 'Practice set' },
    similar && { id: 'similar', label: 'Similar' },
  ].filter(Boolean);
}
