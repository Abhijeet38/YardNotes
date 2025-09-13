import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { handleOptions } from '../_utils/cors';
import { requireAuth } from '../_utils/auth';

export async function OPTIONS() { return handleOptions(); }

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const notes = await prisma.note.findMany({
      where: { tenantId: auth.tenantId },
      include: { user: { select: { email: true, id: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(notes, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' }});
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: auth.tenantId } });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' }});

    if (tenant.plan === 'FREE') {
      const count = await prisma.note.count({ where: { tenantId: auth.tenantId } });
      if (count >= tenant.maxNotes) {
        return NextResponse.json({ error: 'Note limit reached. Upgrade to Pro.' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' }});
      }
    }

    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        tenantId: auth.tenantId,
        userId: auth.userId
      }
    });

    return NextResponse.json(note, { status: 201, headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}
