import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { gameSessions, playerSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidUUID } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { sessionId } = resolvedParams;
    
    if (!isValidUUID(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const { phase } = await request.json();
    
    if (!phase || !['question', 'answering', 'voting', 'results', 'finished'].includes(phase)) {
      return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
    }

    // ユーザーがこのセッションの参加者かチェック
    const [playerSession] = await db.select().from(playerSessions)
      .where(and(
        eq(playerSessions.sessionId, sessionId),
        eq(playerSessions.userId, session.user.id)
      )).limit(1);

    if (!playerSession) {
      return NextResponse.json({ error: 'You are not a player in this session' }, { status: 403 });
    }

    // ゲームセッションの状態を更新
    await db.update(gameSessions)
      .set({ 
        status: phase,
        updatedAt: new Date()
      })
      .where(eq(gameSessions.id, sessionId));

    return NextResponse.json({ success: true, phase });

  } catch (error) {
    console.error('Phase update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}