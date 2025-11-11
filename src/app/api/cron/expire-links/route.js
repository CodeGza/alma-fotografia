import { deactivateExpiredLinks } from '@/lib/validations/validate-share-token';

export async function GET(request) {
  // Verificar auth (token secreto)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await deactivateExpiredLinks();
  return Response.json(result);
}