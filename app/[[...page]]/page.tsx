import ExerciseBatch from '../exercise-batch';
import PracticeFlow from '../practice-flow';
import { articles } from '../../lib/lessons';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import type { ReactNode } from 'react';
import { save } from '../actions';
import { localOwner } from '../../lib/auth';
import { mine, workbook } from '../../lib/store';

const lessons = [
  ['understand-ocd','Understand OCD','Obsessions are unwanted thoughts, images, or urges. Compulsions are actions or mental rituals a person feels driven to do. Checking, seeking reassurance, and mentally reviewing events can all be compulsions.'],
  ['how-erp-works','How ERP works','Exposure and response prevention (ERP) pairs facing a planned trigger with practicing a different response to the urge to do a ritual. Practice makes room for uncertainty. You can finish a session even if you still feel anxious.'],
  ['prepare','Prepare for therapy','Consider which activities OCD interrupts and what you would like to return to. Ask whether the clinician regularly works with OCD using ERP and how you will agree on exercises to practice between sessions.'],
  ['resources','Explore resources','Read more about OCD and ERP or find a directory of OCD care providers.'],
];
const tabs = [
  ['today', 'Today', 'M3 10l9-7 9 7v10H3z M9 20v-6h6v6'],
  ['plan', 'Plan', 'M8 5h12 M8 12h12 M8 19h12 M4 5h.01 M4 12h.01 M4 19h.01'],
  ['review', 'Review', 'M4 20h16 M7 16v-4 M12 16V8 M17 16V4'],
  ['learn', 'Learn', 'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1z M12 6v14'],
];
function Frame({children,active,privatePage=false,showNav=privatePage}:{children:ReactNode;active:string;privatePage?:boolean;showNav?:boolean}) {
  return <><header><Link className="brand" href={privatePage?'/today':'/'}><img src="/icon.svg" alt="" width="38" height="38"/>Room for Maybe</Link>
    <Link href={privatePage?'/settings':'/today'}>{privatePage?'Settings':'Open workspace'}</Link></header>
    {showNav && <nav aria-label="Main navigation">{tabs.map(([path,label,icon])=><Link key={path} aria-current={active===path?'page':undefined} href={'/'+path}>
      <svg className="nav-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
      <span>{label}</span>
    </Link>)}</nav>}
    <main>{children}</main></>;
}
const exerciseExamples = [
  { title: 'Leave after locking the door', action: 'Lock the door as usual and leave.', ritual: 'Going back to check the lock again.', goal: 'Leave on time for work.' },
  { title: 'Send a routine message', action: 'Read the message once and send it.', ritual: 'Reopening the sent message to check it repeatedly.', goal: 'Spend less time on routine messages.' },
  { title: 'Leave a notebook slightly crooked', action: 'Put the notebook down and return to what I was doing.', ritual: 'Adjusting it until it feels exactly right.', goal: 'Stay focused on my work.' },
];

function Field({label,name,value='',multiline=false,required=false,type='text',placeholder}:{label:string;name:string;value?:string;multiline?:boolean;required?:boolean;type?:string;placeholder?:string}) {
  return <label>{label}{multiline ? <textarea name={name} defaultValue={value} placeholder={placeholder} required={required} maxLength={2000}/> : <input name={name} type={type} defaultValue={value} placeholder={placeholder} required={required} maxLength={type==='password'?128:254}/>}</label>;
}
function Mutation({mode,id,children,direction}:{mode:string;id:string;children:ReactNode;direction?:string}) {
  return <form action={save}><input type="hidden" name="mode" value={mode}/><input type="hidden" name="id" value={id}/>
    {direction && <input type="hidden" name="direction" value={direction}/>}<button className="secondary">{children}</button></form>;
}

type Props = {params:Promise<{page?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export default async function Page({params,searchParams}:Props) {
  const [section='',sub='',detail='',...rest] = (await params).page ?? [];
  if (rest.length) notFound();
  const query = await searchParams;
  const notice = query.error ? <p className="notice" role="alert">That didn’t go through. Please try again.</p>
    : query.saved ? <p className="notice" role="status">{section==='review'?'Saved.':'Changes saved.'}</p> : null;
  const publicPage = (body:ReactNode) => <Frame active={section} privatePage={section==='learn'}>{body}</Frame>;
  if (!section) return publicPage(<section className="hero"><p className="eyebrow">PRACTICE BETWEEN SESSIONS</p>
    <h1>Room for Maybe</h1><p className="intro">A free ERP practice companion for OCD.</p>
    <p>Keep your practice plan, record what you tried, and reflect on what matters to you.</p>
    <div className="buttons"><Link className="button" href="/today">Open workspace</Link><Link className="button secondary" href="/learn">Learn &amp; resources</Link></div></section>);
  if (section==='learn') {
    const lesson = lessons.find(item=>item[0]===sub);
    if (sub && !lesson) notFound();
    if (lesson && Object.hasOwn(articles, sub)) {
      const article = articles[sub as keyof typeof articles];
      return publicPage(<article className="learn-article">
        <Link href="/learn">← Learn &amp; resources</Link>
        <h1>{lesson[1]}</h1>
        <p className="intro">{article.intro}</p>
        <img className="lesson-art" src={'/learn/'+article.image+'.png?v=2'} alt="" width="1672" height="941"/>
        {article.sections.map(([title,body])=><section className="card" key={title}><h2>{title}</h2><p>{body}</p></section>)}
        <section className="card"><h2>Sources and further reading</h2><ul>
          {article.sources.map(([label,url])=><li key={url}><a href={url}>{label}</a></li>)}
        </ul></section>
        <Link className="button secondary" href={article.next[0]}>{article.next[1]} →</Link>
      </article>);
    }

    return publicPage(lesson ? <><Link href="/learn">← Learn &amp; resources</Link><h1>{lesson[1]}</h1>
      <article className="card"><p>{lesson[2]}</p>{sub==='resources' && <ul>
        <li><a href="https://iocdf.org/about-ocd/">International OCD Foundation – About OCD</a></li>
        <li><a href="https://iocdf.org/find-help/">International OCD Foundation – Find help</a></li>
        <li><a href="https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/overview/">NHS – OCD overview</a></li></ul>}</article></>
      : <><h1>Learn &amp; resources</h1><div className="grid">{lessons.map(([path,title,description])=><Link key={path} className="card tile" href={'/learn/'+path}><h2>{title}</h2><p>{description.split('. ')[0].replace(/\.$/,'')}.</p></Link>)}</div></>);
  }
  if (!['today','plan','practice','review','settings','maintenance','export-data'].includes(section)) notFound();
  const owner = await localOwner();
  const data = await workbook(book=>mine(book,owner));
  const exercises = data.exercises.filter(row=>!row.archived).sort((a,b)=>Number(a.order)-Number(b.order));
  const selected = exercises.find(row=>row.id===data.profile?.next) ?? exercises[0];
  const exercise = exercises.find(row=>row.id===sub);
  const active = section==='practice'?'today':section;
  const page = (body:ReactNode) => <Frame privatePage active={active}>{notice}{body}</Frame>;
  if (section==='today') return page(<><h1>Today</h1><section className="card today-card">
    <div className="today-art" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="14" height="16" rx="2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6m-6 4h4"/>
    </svg></div>
    {selected ? <><h2>{selected.title}</h2><dl><dt>What I’ll practice</dt><dd>{selected.action}</dd><dt>The ritual I’ll practice resisting</dt><dd>{selected.ritual}</dd>
    {selected.goal && <><dt>Why it matters</dt><dd>{selected.goal}</dd></>}</dl>
    <div className="buttons"><Link className="button" href={'/practice/'+selected.id}>Start practice</Link><Link href="/plan">Choose another exercise</Link></div></>
    : <><h2>No exercises yet</h2><p>Save an ERP exercise you’re ready to practice.</p><div className="buttons"><Link className="button" href="/plan/new">Add an exercise</Link><Link href="/learn">Learn &amp; resources</Link></div></>}
    </section></>);
  if (section==='plan') {
    if (!sub) return page(<div className="plan-page">
      <div className="title"><h1>My plan</h1>{selected && <Link className="button" href="/plan/new">＋ Add an exercise</Link>}</div>
      {selected ? <>
        <section className="card plan-feature">
          <div className="plan-sculpture" aria-hidden="true"><i/><i/><i/></div>
          <p className="eyebrow">NEXT PRACTICE</p>
          <h2>{selected.title}</h2>
          {selected.goal && <p>{selected.goal}</p>}
          <Link className="button" href={'/practice/'+selected.id}>Start practice</Link>
        </section>
        <h2>Saved exercises</h2>
        <div className="plan-list">{exercises.map((row,i)=><section className="plan-row" key={row.id}>
          <Link className="plan-row-link" href={'/plan/'+row.id}>
            <span><strong>{row.title}</strong>{row.id===selected.id && <small>Up next</small>}</span>
            <span aria-hidden="true">›</span>
          </Link>
          {(row.id!==selected.id || exercises.length>1) && <details className="plan-options">
            <summary>Manage exercise</summary>
            <div className="buttons">
              {row.id!==selected.id && <Mutation mode="select" id={row.id}>Practice next</Mutation>}
              {i>0 && <Mutation mode="move" direction="up" id={row.id}>Move up</Mutation>}
              {i<exercises.length-1 && <Mutation mode="move" direction="down" id={row.id}>Move down</Mutation>}
            </div>
          </details>}
        </section>)}</div>
      </> : <section className="card plan-feature"><h2>No exercises yet</h2><p>Save an ERP exercise you’re ready to practice.</p><Link className="button" href="/plan/new">＋ Add an exercise</Link></section>}
    </div>);
    if (sub!=='new' && !exercise) notFound();
    if (!exercise) return page(<><Link href="/plan">← My plan</Link><h1>Add exercises</h1>
      <p>Add one exercise or build your plan in a single save. The examples are there to show how to fill in the fields.</p>
      <ExerciseBatch examples={exerciseExamples}/></>);
    return page(<><Link href="/plan">← My plan</Link><h1>{exercise?'Edit exercise':'Add an exercise'}</h1><section className="card">
      <p>Save an ERP exercise you’re ready to practice.</p><form action={save}>
      <input type="hidden" name="mode" value="exercise"/><input type="hidden" name="id" value={exercise?.id??''}/>
      <Field label="Exercise name" name="title" value={exercise?.title} required/>
      <Field label="What will I practice?" name="action" value={exercise?.action} multiline required/>
      <Field label="Which ritual will I practice resisting?" name="ritual" value={exercise?.ritual} multiline required/>
      <Field label="Why it matters (optional)" name="goal" value={exercise?.goal} multiline/>
      <button>Save exercise</button></form>{exercise && <Mutation mode="archive" id={exercise.id}>Archive exercise</Mutation>}</section></>);
  }
  if (section==='practice') {
    if (!exercise) notFound();
    if (detail==='reflect') return page(<><h1>Practice reflection</h1><section className="card"><form action={save}>
      <input type="hidden" name="mode" value="session"/><input type="hidden" name="id" value={exercise.id}/>
      <input type="hidden" name="submission" value={randomUUID()}/>
      <input type="hidden" name="before" value={typeof query.before==='string' ? query.before : ''}/>
      <label>Anxiety after practice (optional)
        <select name="after"><option value="">Skip rating</option>
          {Array.from({length:11},(_,n)=><option key={n} value={n}>{n}{n===0?' — none':n===10?' — highest':''}</option>)}
        </select>
      </label>
      <fieldset className="practice-response">
        <legend>How did you respond to the urge? (optional)</legend>
        {['I practiced resisting it', 'I partly resisted it', 'I did the ritual', 'The urge didn’t come up'].map(response =>
          <label key={response}><input type="radio" name="response" value={response}/>{response}</label>)}
      </fieldset>
      <Field name="notes" label="What did you learn? (optional)" multiline/>
      <div className="buttons"><button>Save reflection</button><button className="secondary" name="skip" value="1">Skip and save</button></div></form></section></>);
    return page(<PracticeFlow title={exercise.title} action={exercise.action} ritual={exercise.ritual}
      goal={exercise.goal} reflectionHref={'/practice/'+exercise.id+'/reflect'}/>);
  }
  if (section==='review') {
    const rows = data.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date));
    if (sub==='summary') {
      const clean = (input:unknown) => typeof input==='string' && /^\d{4}-\d{2}-\d{2}$/.test(input) ? input : '';
      const from=clean(query.from),to=clean(query.to),notes=query.notes==='on';
      const filtered=rows.filter(row=>(!from||row.date.slice(0,10)>=from)&&(!to||row.date.slice(0,10)<=to));
      return page(<><h1>Preview summary</h1><form className="card no-print" method="get">
        <div className="buttons"><Field name="from" label="From (UTC)" type="date" value={from}/><Field name="to" label="Through (UTC)" type="date" value={to}/></div>
        <label className="check"><input type="checkbox" name="notes" defaultChecked={notes}/> Include private notes</label><button>Update preview</button></form>
        <section className="card"><h2>Practice summary</h2><p>{filtered.length} {filtered.length===1?'session':'sessions'}</p>
        {filtered.map(row=><article key={row.id}><h3>{row.title}</h3><time dateTime={row.date}>{row.date.slice(0,10)}</time>{notes && <p>{[row.response,row.notes].filter(Boolean).join(' · ')}</p>}</article>)}</section>
        <p className="no-print">Use your browser’s Print command to print or save this summary.</p></>);
    }
    return page(<><div className="title"><h1>Review</h1><Link className="button secondary" href="/review/summary">Preview summary</Link></div>
      <section className="card"><h2>Practice history</h2>{rows.length===0 && <p>Saved practices will appear here.</p>}
      {rows.map(row=><details key={row.id}><summary>{row.date.slice(0,10)} · {row.title}</summary><p>{row.action}</p><p>{row.ritual}</p>
        {(row.anxietyBefore || row.anxietyAfter) && <dl className="rating-pair"><div><dt>Before practice</dt><dd>{row.anxietyBefore ? row.anxietyBefore+'/10' : 'Skipped'}</dd></div><div><dt>After practice</dt><dd>{row.anxietyAfter ? row.anxietyAfter+'/10' : 'Skipped'}</dd></div></dl>}
        {row.response && <p>{row.response}</p>}{row.notes && <p>{row.notes}</p>}<Mutation mode="remove-session" id={row.id}>Delete session</Mutation></details>)}</section>
      <section className="card"><h2>Weekly reflection</h2><form action={save}><input type="hidden" name="mode" value="weekly"/>
      <Field name="notes" label="How did OCD affect an activity you care about this week? (optional)" value={data.weekly.at(-1)?.notes} multiline/><button>Save reflection</button></form></section></>);
  }
  if (section==='maintenance') return page(<><h1>My maintenance plan</h1><form className="card" action={save}><input type="hidden" name="mode" value="maintenance"/>
    <Field name="signs" label="Early signs" value={data.maintenance?.signs} multiline/><Field name="steps" label="What I’ll do" value={data.maintenance?.steps} multiline/><button>Save plan</button></form></>);
  if (section==='export-data') return page(<><h1>Export my data</h1><section className="card"><p>Download a JSON copy of your local practice records. The file includes your private notes.</p><a className="button" href="/export" download>Download JSON</a></section></>);
  return page(<><h1>Settings</h1><section className="card"><h2>Profile</h2>
    <form action={save}><input type="hidden" name="mode" value="profile"/><Field name="name" label="Display name" value={data.profile?.name}/><button>Save profile</button></form></section>
    <section className="card stack"><Link href="/maintenance">My maintenance plan</Link><Link href="/export-data">Export my data</Link></section></>);
}
