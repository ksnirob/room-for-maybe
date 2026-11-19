import Excel from 'exceljs';
import { randomUUID } from 'node:crypto';
import { access, mkdir, rename, unlink } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';

const sheets = {
  Profiles: ['owner','name','next'],
  Exercises: ['owner','id','title','action','ritual','goal','order','archived'],
  Sessions: ['owner','id','exercise','title','action','ritual','date','response','notes','anxietyBefore','anxietyAfter'],
  Weekly: ['owner','week','notes'],
  Maintenance: ['owner','signs','steps'],
  Deletions: ['owner','date'],
  Metadata: ['version'],
} as const;
type Sheet = keyof typeof sheets;
export type Row = Record<string,string>;
type Data = Record<Sheet,Row[]>;

async function load(path: string): Promise<Data> {
  const book = new Excel.Workbook();
  const data: Data = {Profiles:[], Exercises:[], Sessions:[], Weekly:[], Maintenance:[], Deletions:[], Metadata:[]};
  try { await access(path); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    data.Metadata.push({version:'1'});
    return data;
  }
  await book.xlsx.readFile(path);
  for (const name of Object.keys(sheets) as Sheet[]) {
    const sheet = book.getWorksheet(name);
    const keys = sheets[name];
    if (!sheet || keys.some((key,i) => { const value = sheet.getRow(1).getCell(i+1).value; return value !== key && !(name === 'Sessions' && key.startsWith('anxiety') && value === null); }))
      throw new Error('Unexpected workbook schema');
    sheet.eachRow((row,index) => {
      if (index === 1) return;
      data[name].push(Object.fromEntries(keys.map((key,i) => {
        const value = row.getCell(i+1).value;
        if (value !== null && typeof value !== 'string') throw new Error('Unexpected workbook cell');
        return [key,value ?? ''];
      })));
    });
  }
  if (data.Metadata[0]?.version !== '1') throw new Error('Unsupported workbook version');
  return data;
}
const state = globalThis as typeof globalThis & { roomWorkbookQueue?: Promise<unknown> };
export async function workbook<T>(fn: (data:Data) => T, write = false): Promise<T> {
  const path = process.env.WORKBOOK_PATH || join(process.cwd(), '.data', 'local.xlsx');
  if (!path || !isAbsolute(path)) throw new Error('Set WORKBOOK_PATH to an absolute private path');
  const task = (state.roomWorkbookQueue ?? Promise.resolve()).then(async () => {
    const data = await load(path);
    const result = fn(data);
    if (!write) return result;
    await mkdir(dirname(path), {recursive:true,mode:0o700});
    const book = new Excel.Workbook();
    for (const name of Object.keys(sheets) as Sheet[]) {
      const sheet = book.addWorksheet(name);
      sheet.addRow([...sheets[name]]);
      for (const row of data[name]) sheet.addRow(sheets[name].map(key => row[key] ?? ''));
    }
    const temp = path + '.' + randomUUID() + '.tmp';
    try {
      const buffer = await book.xlsx.writeBuffer();
      const { writeFile } = await import('node:fs/promises');
      await writeFile(temp, Buffer.from(buffer), {flag:'wx',mode:0o600});
      await rename(temp,path);
    } finally { await unlink(temp).catch(() => {}); }
    return result;
  });
  state.roomWorkbookQueue = task.catch(() => {});
  return task;
}
export function mine(data:Data, owner:string) {
  return {
    profile: data.Profiles.find(row => row.owner === owner),
    exercises: data.Exercises.filter(row => row.owner === owner),
    sessions: data.Sessions.filter(row => row.owner === owner),
    weekly: data.Weekly.filter(row => row.owner === owner),
    maintenance: data.Maintenance.find(row => row.owner === owner),
  };
}
