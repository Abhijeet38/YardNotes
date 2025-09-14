import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { handleOptions } from '../../_utils/cors';
import { requireAuth } from '../../_utils/auth';

export async function OPTIONS() { 
  return handleOptions(); 
}

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
    
    // First check if the note exists and belongs to the user
    const existingNote = await prisma.note.findFirst({
      where: { id, tenantId: auth.tenantId }
    });
    
    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' }});
    }
    
    // Verify the user owns this note
    if (existingNote.userId !== auth.userId) {
      return NextResponse.json({ error: 'You can only edit your own notes' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' }});
    }
    
    const note = await prisma.note.update({
      where: { id },
      data: { title: body.title, content: body.content, isPublic: !!body.isPublic }
    });
    
    return NextResponse.json(note, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const auth = requireAuth(req);
    const id = params.id;
    
    // First check if the note exists and belongs to the user
    const existingNote = await prisma.note.findFirst({
      where: { id, tenantId: auth.tenantId }
    });
    
    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' }});
    }
    
    // Verify the user owns this note
    if (existingNote.userId !== auth.userId) {
      return NextResponse.json({ error: 'You can only delete your own notes' }, { status: 403, headers: { 'Access-Control-Allow-Origin': '*' }});
    }
    
    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' }, { headers: { 'Access-Control-Allow-Origin': '*' }});
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' }});
  }
}
