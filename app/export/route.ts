import { localOwner } from '../../lib/auth';
import { mine, workbook } from '../../lib/store';
export async function GET() {
  const owner = await localOwner();
  return Response.json(await workbook(data => mine(data,owner)), {headers:{
    'Cache-Control':'private, no-store',
    'Content-Disposition':'attachment; filename="room-for-maybe.json"',
  }});
}
