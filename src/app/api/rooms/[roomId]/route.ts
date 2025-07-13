import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rooms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // TODO: 参加者情報も含める
    return NextResponse.json({ room });

  } catch (error) {
    console.error('Room fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await context.params;
    
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only room host can delete room' }, { status: 403 });
    }

    await db.delete(rooms).where(eq(rooms.id, roomId));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Room deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}