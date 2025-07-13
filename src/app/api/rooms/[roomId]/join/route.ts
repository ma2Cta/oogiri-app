import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rooms, gameSessions, playerSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await params;
    
    // ルーム情報を取得
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'Room is not accepting new players' }, { status: 400 });
    }

    // 現在のゲームセッションを取得または作成
    let [gameSession] = await db.select().from(gameSessions).where(eq(gameSessions.roomId, roomId)).limit(1);
    
    if (!gameSession) {
      [gameSession] = await db.insert(gameSessions).values({
        roomId: roomId,
        currentRound: 0,
        totalRounds: 5,
        status: 'waiting'
      }).returning();
    }

    // 既に参加済みかチェック
    const [existingPlayer] = await db.select().from(playerSessions)
      .where(and(
        eq(playerSessions.sessionId, gameSession.id),
        eq(playerSessions.userId, session.user.id)
      )).limit(1);

    if (existingPlayer) {
      return NextResponse.json({ 
        room, 
        gameSession,
        message: 'Already joined this room' 
      });
    }

    // 現在の参加者数をチェック
    const currentPlayers = await db.select().from(playerSessions)
      .where(eq(playerSessions.sessionId, gameSession.id));

    if (currentPlayers.length >= room.maxPlayers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // プレイヤーセッションを作成
    const [playerSession] = await db.insert(playerSessions).values({
      sessionId: gameSession.id,
      userId: session.user.id,
      score: 0,
      status: 'connected'
    }).returning();

    return NextResponse.json({ 
      room, 
      gameSession,
      playerSession,
      currentPlayers: currentPlayers.length + 1
    });

  } catch (error) {
    console.error('Room join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}