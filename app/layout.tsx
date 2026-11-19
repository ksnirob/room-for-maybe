import type { ReactNode } from 'react';
import './style.css';
export const metadata = {title:'Room for Maybe',description:'A free ERP practice companion for OCD.'};
export default function Layout({children}:{children:ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
