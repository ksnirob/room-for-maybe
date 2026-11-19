import {headers} from 'next/headers';
import {notFound} from 'next/navigation';

export async function localOwner() {
  const host = (await headers()).get('host') ?? '';
  if (!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host)) notFound();
  return 'local-workspace';
}
