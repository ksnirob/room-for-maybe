'use server';
import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { localOwner } from '../lib/auth';
import { mine, workbook } from '../lib/store';

const rating = (form:FormData,key:string) => {
  const value = form.get(key);
  return typeof value === 'string' && /^(10|[0-9])$/.test(value) ? value : '';
};
const get = (form:FormData,key:string,max=2000) => String(form.get(key) ?? '').trim().slice(0,max);

export async function save(form:FormData) {
  const owner = await localOwner();
  const mode = get(form,'mode');
  const id = get(form,'id',100);
  let next = '/plan';
  try {
    await workbook(data => {
      if (data.Deletions.some(row => row.owner === owner)) throw new Error('Account deletion pending');
      const current = mine(data,owner);
      const row = current.exercises.find(item => item.id === id && !item.archived);
      if (mode === 'exercise-batch') {
        const fields = ['title','action','ritual','goal'].map(key => form.getAll(key));
        const count = fields[0].length;
        if (!count || count > 10 || fields.some(values => values.length !== count)) throw new Error('Invalid exercise list');
        const base = Math.max(Date.now(), ...current.exercises.map(item => Number(item.order) || 0));
        for (let index = 0; index < count; index++) {
          const [title,action,ritual,goal] = fields.map((values,i)=>String(values[index]).trim().slice(0,i===0?120:2000));
          if (!title || !action || !ritual) throw new Error('Incomplete exercise');
          data.Exercises.push({owner,id:randomUUID(),title,action,ritual,goal,order:String(base+index+1)});
        }
        next = '/plan?saved=1';
      } else if (mode === 'exercise') {
        const title = get(form,'title',120), action = get(form,'action'), ritual = get(form,'ritual'), goal = get(form,'goal');
        if (!title || !action || !ritual || (id && !row)) throw new Error('Invalid exercise');
        if (row) Object.assign(row,{title,action,ritual,goal});
        else data.Exercises.push({owner,id:randomUUID(),title,action,ritual,goal,order:String(Date.now())});
      } else if (mode === 'select' || mode === 'archive' || mode === 'move') {
        if (!row) throw new Error('Exercise unavailable');
        if (mode === 'archive') row.archived = new Date().toISOString();
        if (mode === 'move') {
          const sorted = current.exercises.filter(x => !x.archived).sort((a,b)=>Number(a.order)-Number(b.order));
          const index = sorted.indexOf(row);
          const target = sorted[index + (get(form,'direction') === 'up' ? -1 : 1)];
          if (target) [row.order,target.order] = [target.order,row.order];
        }
        if (mode === 'select') {
          const profile = current.profile ?? {owner};
          if (!current.profile) data.Profiles.push(profile);
          profile.next = id;
          next = '/today';
        }
      } else if (mode === 'session') {
        const submission = get(form,'submission',100);
        if (!row || !/^[a-f0-9-]{36}$/.test(submission)) throw new Error('Invalid session');
        if (!current.sessions.some(entry => entry.id === submission))
          data.Sessions.push({owner,id:submission,exercise:id,title:row.title,action:row.action,ritual:row.ritual,
            date:new Date().toISOString(),anxietyBefore:rating(form,'before'),anxietyAfter:rating(form,'after'),response:form.get('skip') ? '' : get(form,'response'), notes:form.get('skip') ? '' : get(form,'notes')});
        next = '/review?saved=1';
      } else if (mode === 'maintenance') {
        const plan = current.maintenance ?? {owner};
        if (!current.maintenance) data.Maintenance.push(plan);
        Object.assign(plan,{signs:get(form,'signs'),steps:get(form,'steps')});
        next = '/maintenance?saved=1';
      } else if (mode === 'profile') {
        const profile = current.profile ?? {owner};
        if (!current.profile) data.Profiles.push(profile);
        profile.name = get(form,'name',100);
        next = '/settings?saved=1';
      } else if (mode === 'weekly') {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay()+6)%7));
        const week = date.toISOString().slice(0,10);
        const existing = current.weekly.find(item => item.week === week);
        if (existing) existing.notes = get(form,'notes');
        else data.Weekly.push({owner,week,notes:get(form,'notes')});
        next = '/review?saved=1';
      } else if (mode === 'remove-session') {
        data.Sessions = data.Sessions.filter(item => item.owner !== owner || item.id !== id);
        next = '/review';
      } else throw new Error('Unknown action');
    },true);
  } catch {
    const page = mode === 'session' ? '/practice/' + encodeURIComponent(id) + '/reflect'
      : mode === 'exercise-batch' ? '/plan/new'
      : mode === 'exercise' ? (id ? '/plan/' + encodeURIComponent(id) : '/plan/new')
      : mode === 'maintenance' ? '/maintenance' : mode === 'profile' ? '/settings'
      : ['weekly','remove-session'].includes(mode) ? '/review' : '/plan';
    redirect(page + '?error=1');
  }
  redirect(next);
}
