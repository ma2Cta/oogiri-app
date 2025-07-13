import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { gameSessions, rooms, questions, rounds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { sessionId } = resolvedParams;
    
    // ゲームセッション情報を取得
    const [gameSession] = await db.select().from(gameSessions)
      .where(eq(gameSessions.id, sessionId)).limit(1);
    
    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    // ルーム情報を取得してホスト権限をチェック
    const [room] = await db.select().from(rooms)
      .where(eq(rooms.id, gameSession.roomId)).limit(1);
    
    if (!room || room.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only room host can start the game' }, { status: 403 });
    }

    if (gameSession.status !== 'waiting') {
      return NextResponse.json({ error: 'Game is already started' }, { status: 400 });
    }

    // ランダムなお題を選択
    const availableQuestions = await db.select().from(questions).limit(100);
    if (availableQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions available' }, { status: 500 });
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    // ゲームセッションを開始状態に更新
    const [updatedSession] = await db.update(gameSessions)
      .set({
        status: 'question',
        currentRound: 1,
        startedAt: new Date()
      })
      .where(eq(gameSessions.id, sessionId))
      .returning();

    // 最初のラウンドを作成
    const [newRound] = await db.insert(rounds).values({
      sessionId: sessionId,
      questionId: randomQuestion.id,
      roundNumber: 1,
      timeLimit: 60,
      status: 'waiting',
      startedAt: new Date()
    }).returning();

    return NextResponse.json({ 
      gameSession: updatedSession,
      round: newRound,
      question: randomQuestion
    });

  } catch (error) {
    console.error('Game start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}