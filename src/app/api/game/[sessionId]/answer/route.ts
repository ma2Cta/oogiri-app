import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { answers, rounds, gameSessions, playerSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidUUID, validateAndSanitizeAnswer } from '@/lib/validation';

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
    
    // UUID検証
    if (!isValidUUID(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
    }
    
    const body = await request.json();
    const { content } = body;

    // 入力検証とサニタイゼーション
    let sanitizedContent: string;
    try {
      sanitizedContent = validateAndSanitizeAnswer(content);
    } catch (error) {
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Invalid answer content' 
      }, { status: 400 });
    }

    // 現在のラウンドを取得
    const [gameSession] = await db.select().from(gameSessions)
      .where(eq(gameSessions.id, sessionId)).limit(1);
    
    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    if (gameSession.status !== 'answering') {
      return NextResponse.json({ error: 'Not in answering phase' }, { status: 400 });
    }

    const [currentRound] = await db.select().from(rounds)
      .where(and(
        eq(rounds.sessionId, sessionId),
        eq(rounds.roundNumber, gameSession.currentRound)
      )).limit(1);

    if (!currentRound) {
      return NextResponse.json({ error: 'Current round not found' }, { status: 404 });
    }

    // 既に回答済みかチェック
    const [existingAnswer] = await db.select().from(answers)
      .where(and(
        eq(answers.roundId, currentRound.id),
        eq(answers.userId, session.user.id)
      )).limit(1);

    if (existingAnswer) {
      return NextResponse.json({ error: 'Already submitted answer for this round' }, { status: 400 });
    }

    // 回答を保存
    const [newAnswer] = await db.insert(answers).values({
      roundId: currentRound.id,
      userId: session.user.id,
      content: sanitizedContent,
      submittedAt: new Date()
    }).returning();

    // 自動フェーズ遷移チェック: 全員が回答済みかチェック
    const allPlayers = await db.select().from(playerSessions)
      .where(and(
        eq(playerSessions.sessionId, sessionId),
        eq(playerSessions.status, 'connected')
      ));

    // 現在のラウンドで回答済みのプレイヤー数を取得
    const answeredPlayers = await db.select().from(answers)
      .where(eq(answers.roundId, currentRound.id));

    // 接続中の全プレイヤーが回答済みの場合、自動的にフェーズ遷移
    if (answeredPlayers.length >= allPlayers.length) {
      // 全員が投票フェーズを経験するため、常にvotingフェーズへ遷移
      const nextStatus = 'voting';
      
      await db.update(gameSessions)
        .set({ 
          status: nextStatus
        })
        .where(eq(gameSessions.id, sessionId));
      
      console.log('All players answered, auto-transitioning to next phase', { 
        sessionId, 
        playerCount: allPlayers.length,
        nextPhase: nextStatus 
      });
    }

    return NextResponse.json({ answer: newAnswer });

  } catch (error) {
    console.error('Answer submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}