import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rooms, roomMembers } from '@/lib/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { validateRoomCode } from '@/lib/room-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomCode } = body;

    if (!roomCode?.trim()) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const code = roomCode.trim().toUpperCase();
    
    if (!validateRoomCode(code)) {
      return NextResponse.json({ error: 'Invalid room code format' }, { status: 400 });
    }

    // ルームコードでルームを検索
    const [room] = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // ルームに参加可能かチェック
    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'Room is not accepting new players' }, { status: 400 });
    }

    // 現在の参加者数をチェック
    const [memberCount] = await db
      .select({ count: count() })
      .from(roomMembers)
      .where(eq(roomMembers.roomId, room.id));

    if (memberCount?.count >= room.maxPlayers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // 既に参加しているかチェック
    const [existingMember] = await db
      .select()
      .from(roomMembers)
      .where(
        and(
          eq(roomMembers.roomId, room.id),
          eq(roomMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingMember) {
      // ルームに参加
      await db.insert(roomMembers).values({
        roomId: room.id,
        userId: session.user.id,
      });
    }

    return NextResponse.json({ 
      room,
      redirectUrl: `/rooms/${room.id}`
    });

  } catch (error) {
    console.error('Room code validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}