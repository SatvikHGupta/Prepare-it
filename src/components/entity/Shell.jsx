import { breadcrumbLd } from '@/components/ui/Breadcrumbs';
import JsonLd from '@/components/ui/JsonLd';
import { abs } from '@/lib/site';
import Toc from './Toc';

// frame for every entity page: a plain title block, then either a profile (with an on-this-page list) or free content
export default function Shell({ crumbs, title, lead, aka, mark, actions, meta, facts, toc, rail, children }) {
  return (
    <div className="container page">
      <JsonLd data={breadcrumbLd(crumbs, abs)} />
      <header className="entity-title">
        {mark ? <div className="title-row">{mark}<h1>{title}</h1></div> : <h1>{title}</h1>}
        {lead ? <p className="lead">{lead}</p> : null}
        {aka ? <p className="aka">{aka}</p> : null}
        {actions || meta ? <div className="entity-actions">{actions}{meta}</div> : null}
      </header>
      {facts}
      <div className={`profile${toc?.length || rail ? '' : ' no-toc'}`}>
        <div>{children}</div>
        {toc?.length || rail ? <aside className="side-rail">{toc?.length ? <Toc items={toc} /> : null}{rail}</aside> : null}
      </div>
    </div>
  );
}
