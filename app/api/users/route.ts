import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { handleOptions } from '../_utils/cors';
import { requireAuth } from '../_utils/auth';

export async function OPTIONS() { return handleOptions(); }

// GET /api/users - list users in the authenticated tenant (admin only)
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' }});
    }
    const users = await prisma.user.findMany({ where: { tenantId: auth.tenantId }, select: { id: true, email: true, role: true } });
    return NextResponse.json(users, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}
