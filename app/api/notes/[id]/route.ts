import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { handleOptions } from '../../_utils/cors';
import { requireAuth } from '../../_utils/auth';

export async function OPTIONS() { return handleOptions(); }

export async function GET(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const auth = requireAuth(req);
    const id = params.id;
    const note = await prisma.note.findFirst({ where: { id, tenantId: auth.tenantId } });
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' }});
    return NextResponse.json(note, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const auth = requireAuth(req);
    const id = params.id;
    const body = await req.json();
    const note = await prisma.note.updateMany({
      where: { id, tenantId: auth.tenantId },
      data: { title: body.title, content: body.content }
    });
    if (note.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' }});
    const updated = await prisma.note.findUnique({ where: { id } });
    return NextResponse.json(updated, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const auth = requireAuth(req);
    const id = params.id;
    const deleted = await prisma.note.deleteMany({ where: { id, tenantId: auth.tenantId } });
    if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' }});
    return NextResponse.json({ message: 'Deleted' }, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}
