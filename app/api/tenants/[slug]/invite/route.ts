import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
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

    const body = await req.json();
    const { email, role } = body;
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' }});

    const hashed = await bcrypt.hash('password', 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER', tenantId: tenant.id }
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201, headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}
