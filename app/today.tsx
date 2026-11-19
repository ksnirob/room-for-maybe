'use client';

import Link from 'next/link';
import {useState} from 'react';
import type {Row} from '../lib/store';

export default function Today({exercises,sessions,selectedId,name}:{exercises:Row[];sessions:Row[];selectedId?:string;name?:string}) {
  const [choice,setChoice] = useState(selectedId ?? '');
  const exercise = exercises.find(item=>item.id===choice) ?? exercises[0];
  const now = new Date();
  const dateKey = (date:Date) => date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
  const days = Array.from({length:7},(_,i)=>{
    const date=new Date(now);date.setDate(date.getDate()-6+i);
    return {label:date.toLocaleDateString(undefined,{weekday:'narrow'}),full:date.toLocaleDateString(),count:sessions.filter(session=>dateKey(new Date(session.date))===dateKey(date)).length};
  });
  const recent = sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  return <div className="dashboard">
    <div className="dashboard-heading"><div><p className="eyebrow">YOUR DAILY SPACE</p><h1>{name ? 'Hello, '+name : 'A little room for you.'}</h1><p>Choose a practice. Make space for what matters.</p></div><Link className="button secondary" href="/plan/new">＋ Add exercises</Link></div>
    <div className="dashboard-columns">
      <div>
        <section className="focus-card">
          <div className="focus-top"><span>YOUR NEXT PRACTICE</span><div className="soft-orbit" aria-hidden="true"><i/><i/></div></div>
          {exercise ? <>
            <label className="exercise-picker">Choose an exercise<select value={exercise.id} onChange={event=>setChoice(event.target.value)}>{exercises.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <h2>{exercise.title}</h2>
            <div className="practice-intentions"><div><span>DO</span><p>{exercise.action}</p></div><div><span>RESIST</span><p>{exercise.ritual}</p></div></div>
            {exercise.goal && <p className="goal-line">For what matters · {exercise.goal}</p>}
            <Link className="button focus-start" href={'/practice/'+exercise.id}>Start this practice <span aria-hidden="true">↗</span></Link>
            <Link className="focus-edit" href={'/plan/'+exercise.id}>Edit this exercise</Link>
          </> : <><h2>Your first practice starts here.</h2><p>Add an action you want to practice and the ritual you want to resist.</p><Link className="button" href="/plan/new">Create my plan ↗</Link><Link className="focus-edit" href="/learn/how-erp-works">New to ERP? Learn how it works</Link></>}
        </section>
        <section className="dashboard-section"><div className="section-heading"><h2>Recent practices</h2><Link href="/review">See all ↗</Link></div>
          {recent.length ? recent.map(session=><Link key={session.id} className="session-link" href="/review"><span className="session-mark" aria-hidden="true">↗</span><span><strong>{session.title}</strong><small>{new Date(session.date).toLocaleDateString()}</small></span><span aria-hidden="true">›</span></Link>) : <div className="quiet-empty">After you finish and save a practice, it will appear here.</div>}
        </section>
      </div>
      <aside>
        <section className="card week-card"><p className="eyebrow">LAST SEVEN DAYS</p><h2>Your practice rhythm</h2><div className="week-dots">{days.map(day=><div key={day.full}><span>{day.label}</span><span className={day.count?'day-dot practiced':'day-dot'} aria-label={day.full+': '+day.count+' practices'}>{day.count ? '•' : '–'}</span></div>)}</div><p>{days.reduce((sum,day)=>sum+day.count,0)} saved practices</p><Link href="/review">Review your reflections →</Link></section>
        <Link href="/learn/how-erp-works" className="learning-card"><img src="/learn/how-erp-works.png?v=2" alt="" width="1672" height="941"/><div><p className="eyebrow">UNDERSTAND YOUR PRACTICE</p><h2>Small steps, with intention.</h2><p>Learn how exposure and response prevention works.</p><span>Read the guide ↗</span></div></Link>
      </aside>
    </div>
  </div>;
}
