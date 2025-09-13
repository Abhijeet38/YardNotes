import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { handleOptions } from '../../../_utils/cors';
import { requireAuth } from '../../../_utils/auth';

export async function OPTIONS() { return handleOptions(); }

export async function POST(req: NextRequest, { params }: { params: { slug: string }}) {
  try {
    const auth = requireAuth(req);
    if (auth.role !== 'ADMIN') return NextResponse.json({ error: 'Admin only' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' }});

    const tenant = await prisma.tenant.findUnique({ where: { slug: params.slug } });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' }});

    if (tenant.id !== auth.tenantId) return NextResponse.json({ error: 'Access denied' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' }});

    await prisma.tenant.update({ where: { id: tenant.id }, data: { plan: 'PRO', maxNotes: 2147483647 } });
    return NextResponse.json({ message: 'Upgraded to Pro' }, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}
