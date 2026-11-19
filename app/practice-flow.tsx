'use client';

import Link from 'next/link';
import {type CSSProperties, useEffect, useRef, useState} from 'react';

type Props = {title:string; action:string; ritual:string; goal?:string; reflectionHref:string};

const messages = [
  'You can take the next step while uncertainty is still there.',
  'Notice the urge and give yourself room to choose your response.',
  'You can follow your plan even if the doubt stays.',
  'Bring your attention back to the action you planned.',
  'Remember what this practice helps you make time for.',
  'An urge can be present while you continue with what matters.',
];

export default function PracticeFlow({title,action,ritual,goal,reflectionHref}:Props) {
  const [started,setStarted] = useState(false);
  const [message,setMessage] = useState(0);
  useEffect(() => {
    if (!started) return;
    const interval = window.setInterval(() => {
      const offset = 1 + Math.floor(Math.random() * (messages.length - 1));
      setMessage(current => (current + offset) % messages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [started]);
  const [before,setBefore] = useState('');
  const [minutes,setMinutes] = useState('');
  const [endsAt,setEndsAt] = useState<number|null>(null);
  const [seconds,setSeconds] = useState(0);
  useEffect(() => {
    if (endsAt === null) return;
    const tick = () => setSeconds(Math.max(0,Math.ceil((endsAt-Date.now())/1000)));
    tick();
    const interval = window.setInterval(tick,250);
    return () => window.clearInterval(interval);
  },[endsAt]);
  const heading = useRef<HTMLHeadingElement>(null);
  function begin() {
    if (minutes) {
      setSeconds(Number(minutes)*60);
      setEndsAt(Date.now()+Number(minutes)*60_000);
    }
    setMessage(Math.floor(Math.random() * messages.length));
    setStarted(true);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return <div className="practice-flow">
    <h1>Practice</h1>
    <ol className="flow-progress" aria-label="Practice steps">
      <li aria-current={!started?'step':undefined}>Get ready</li>
      <li aria-current={started?'step':undefined}>Practice</li>
      <li>Reflect</li>
    </ol>
    <section className="card plan-feature">
      <h2>{title}</h2>
      {goal && <p>{goal}</p>}
    </section>
    <section className="card">
      <h2 ref={heading} tabIndex={-1}>{started ? 'Follow your plan' : 'Get ready'}</h2>
      {started && <section className="practice-display" aria-label="Active practice">
        <div className="practice-dial" style={{'--elapsed': endsAt === null ? '0%' :
          (100 * (1 - seconds / (Number(minutes) * 60))) + '%'} as CSSProperties}>
          <div className="practice-dial-face">
            {endsAt === null ? <strong>In practice</strong> : <>
              <strong role="timer" aria-label="Time remaining">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</strong>
              <span>remaining</span>
            </>}
          </div>
        </div>
        <div>
          <p className="practice-prompt">{messages[message]}</p>
          {endsAt !== null && seconds===0 && <p role="status">Timer ended. Follow your planned next step.</p>}
        </div>
      </section>}
      <ol className="practice-steps">
        <li><strong>Take the planned action</strong><p>{action}</p></li>
        <li><strong>Practice resisting this ritual</strong><p>{ritual}</p></li>
        {started && <li><strong>Make room for the urge</strong><p>If the urge shows up, notice it and return to the response you planned. You can finish while you still feel uncertain.</p></li>}
      </ol>
      {!started && <>
        <label>Anxiety before practice (optional)
          <select value={before} onChange={event=>setBefore(event.target.value)}>
            <option value="">Skip rating</option>
            {Array.from({length:11},(_,n)=><option key={n} value={n}>{n}{n===0?' — none':n===10?' — highest':''}</option>)}
          </select>
        </label>
        <label>Practice timer (optional)
          <select value={minutes} onChange={event=>setMinutes(event.target.value)}>
            <option value="">No timer</option>
            {[1,2,3,5,10,15,20,30].map(n=><option key={n} value={n}>{n} min</option>)}
          </select>
        </label>
      </>}
      <div className="buttons">
        {started
          ? <Link className="button" href={before ? reflectionHref + "?before=" + before : reflectionHref}>Finish and reflect</Link>
          : <button type="button" onClick={begin}>Begin exercise</button>}
        <Link href="/today">Leave practice</Link>
      </div>
    </section>
  </div>;
}
