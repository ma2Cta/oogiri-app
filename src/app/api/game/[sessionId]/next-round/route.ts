import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { gameSessions, rounds, questions, playerSessions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { isValidUUID } from '@/lib/validation';

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
    const sessionId = resolvedParams.sessionId;
    
    if (!isValidUUID(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    // ゲームセッションを取得
    const [gameSession] = await db.select().from(gameSessions)
      .where(eq(gameSessions.id, sessionId)).limit(1);
    
    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
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

    // 最終ラウンドかチェック
    if (gameSession.currentRound >= gameSession.totalRounds) {
      // ゲーム終了
      await db.update(gameSessions)
        .set({ 
          status: 'finished',
          endedAt: new Date()
        })
        .where(eq(gameSessions.id, sessionId));
      
      return NextResponse.json({ 
        gameSession: { ...gameSession, status: 'finished' },
        message: 'Game finished' 
      });
    }

    // 次のラウンドに進む
    const nextRound = gameSession.currentRound + 1;
    
    // ランダムな質問を選択
    const [randomQuestion] = await db.select().from(questions)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    
    if (!randomQuestion) {
      return NextResponse.json({ error: 'No questions available' }, { status: 500 });
    }

    // 新しいラウンドを作成
    const [newRound] = await db.insert(rounds).values({
      sessionId: sessionId,
      questionId: randomQuestion.id,
      roundNumber: nextRound,
      timeLimit: 60, // 60秒制限
      status: 'active',
      startedAt: new Date()
    }).returning();

    // ゲームセッションを更新
    const [updatedGameSession] = await db.update(gameSessions)
      .set({ 
        currentRound: nextRound,
        status: 'question'
      })
      .where(eq(gameSessions.id, sessionId))
      .returning();

    // 注: プレイヤーの回答・投票状態はフロントエンドで管理

    console.log('Next round started', { 
      sessionId, 
      round: nextRound,
      questionId: randomQuestion.id 
    });

    return NextResponse.json({ 
      gameSession: updatedGameSession,
      question: {
        id: randomQuestion.id,
        content: randomQuestion.content,
        category: randomQuestion.category,
        difficulty: randomQuestion.difficulty
      },
      round: newRound
    });

  } catch (error) {
    console.error('Next round error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}