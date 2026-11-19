'use client';

import { useRef, useState } from 'react';
import { save } from './actions';

type Example = {title:string;action:string;ritual:string;goal:string};
const fields = [
  ['title','Exercise name'],
  ['action','What will I practice?'],
  ['ritual','Which ritual will I practice resisting?'],
  ['goal','Why it matters (optional)'],
] as const;

export default function ExerciseBatch({examples}:{examples:Example[]}) {
  const [entries,setEntries] = useState([0]);
  const next = useRef(1);
  return <form action={save} className="batch-form">
    <input type="hidden" name="mode" value="exercise-batch"/>
    {entries.map((id,index)=><fieldset key={id} className="card batch-card">
      <legend>Exercise {index+1}</legend>
      {fields.map(([key,label])=><label key={key}>{label}
        {key==='title'
          ? <input name={key} required maxLength={120} placeholder={examples[id%examples.length][key]}/>
          : <textarea name={key} required={key!=='goal'} maxLength={2000} placeholder={examples[id%examples.length][key]}/>}
      </label>)}
      {entries.length>1 && <button className="secondary" type="button" onClick={()=>setEntries(entries.filter(entry=>entry!==id))}>Remove exercise {index+1}</button>}
    </fieldset>)}
    <div className="buttons">
      <button>{entries.length===1?'Save exercise':'Save '+entries.length+' exercises'}</button>
      {entries.length<10 && <button className="secondary" type="button" onClick={()=>{const id=next.current++;setEntries([...entries,id]);}}>＋ Add another exercise</button>}
    </div>
  </form>;
}
