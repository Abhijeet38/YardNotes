import { NextRequest } from 'next/server';
import { verifyToken } from '../../../lib/jwt';

export function getAuthFromReq(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest) {
  const payload = getAuthFromReq(req);
  if (!payload) throw new Error('unauthorized');
  return payload as { userId: string; tenantId: string; role: string };
}
