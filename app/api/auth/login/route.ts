import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/jwt';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' }});
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  });

  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});

  const token = signToken({ userId: user.id, tenantId: user.tenantId, role: user.role });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug, plan: user.tenant.plan, maxNotes: user.tenant.maxNotes }
    }
  }, { headers: { 'Access-Control-Allow-Origin': '*' }});
}
