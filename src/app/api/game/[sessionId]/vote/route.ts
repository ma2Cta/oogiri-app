import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { votes, answers, rounds, gameSessions, playerSessions, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

// スコア計算とプレイヤーセッション更新
async function calculateAndUpdateScores(sessionId: string, roundId: string) {
  try {
    // 各回答の得票数を集計
    const voteResults = await db
      .select({
        answerId: votes.answerId,
        userId: answers.userId,
        voteCount: sql<number>`count(*)`.as('voteCount')
      })
      .from(votes)
      .innerJoin(answers, eq(votes.answerId, answers.id))
      .where(eq(votes.roundId, roundId))
      .groupBy(votes.answerId, answers.userId);

    // 各プレイヤーのスコアを更新
    for (const result of voteResults) {
      const scoreToAdd = result.voteCount;
      
      await db
        .update(playerSessions)
        .set({
          score: sql`${playerSessions.score} + ${scoreToAdd}`
        })
        .where(and(
          eq(playerSessions.sessionId, sessionId),
          eq(playerSessions.userId, result.userId)
        ));

      logger.info('Score updated', {
        sessionId,
        roundId,
        userId: result.userId,
        scoreAdded: scoreToAdd
      });
    }

    // 更新後のプレイヤースコアを取得（ユーザー名含む）
    const updatedPlayers = await db.select({
      userId: playerSessions.userId,
      score: playerSessions.score,
      username: users.name
    }).from(playerSessions)
    .innerJoin(users, eq(playerSessions.userId, users.id))
    .where(eq(playerSessions.sessionId, sessionId));

    // スコア更新が完了しました

    logger.info('Player scores updated', {
      sessionId,
      roundId,
      scores: updatedPlayers
    });

    logger.info('Round scores calculated and updated', {
      sessionId,
      roundId,
      resultsCount: voteResults.length
    });
  } catch (error) {
    logger.error('Failed to calculate scores', 
      error instanceof Error ? error : new Error('Unknown error'), {
      sessionId,
      roundId
    });
    throw error;
  }
}

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
    const body = await request.json();
    const { answerId } = body;

    if (!answerId) {
      return NextResponse.json({ error: 'Answer ID is required' }, { status: 400 });
    }

    // 現在のラウンドを取得
    const [gameSession] = await db.select().from(gameSessions)
      .where(eq(gameSessions.id, sessionId)).limit(1);
    
    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    if (gameSession.status !== 'voting') {
      return NextResponse.json({ error: 'Not in voting phase' }, { status: 400 });
    }

    const [currentRound] = await db.select().from(rounds)
      .where(and(
        eq(rounds.sessionId, sessionId),
        eq(rounds.roundNumber, gameSession.currentRound)
      )).limit(1);

    if (!currentRound) {
      return NextResponse.json({ error: 'Current round not found' }, { status: 404 });
    }

    // 投票対象の回答が存在するかチェック
    const [targetAnswer] = await db.select().from(answers)
      .where(and(
        eq(answers.id, answerId),
        eq(answers.roundId, currentRound.id)
      )).limit(1);

    if (!targetAnswer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // プレイヤー数を取得
    const allPlayers = await db.select().from(playerSessions)
      .where(and(
        eq(playerSessions.sessionId, sessionId),
        eq(playerSessions.status, 'connected')
      ));

    // 複数プレイヤーの場合は自分の回答には投票できない
    if (allPlayers.length > 1 && targetAnswer.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot vote for your own answer' }, { status: 400 });
    }

    // 既に投票済みかチェック
    const [existingVote] = await db.select().from(votes)
      .where(and(
        eq(votes.roundId, currentRound.id),
        eq(votes.voterId, session.user.id)
      )).limit(1);

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted for this round' }, { status: 400 });
    }

    // 投票を保存
    const [newVote] = await db.insert(votes).values({
      roundId: currentRound.id,
      voterId: session.user.id,
      answerId: answerId,
      votedAt: new Date()
    }).returning();

    // 投票が保存されました

    // 現在のラウンドで投票済みのプレイヤー数を取得
    const votedPlayers = await db.select().from(votes)
      .where(eq(votes.roundId, currentRound.id));

    // 全員が投票済みの場合、スコア計算して結果フェーズに遷移
    if (votedPlayers.length >= allPlayers.length) {
      // 投票集計とスコア計算
      await calculateAndUpdateScores(sessionId, currentRound.id);
      
      await db.update(gameSessions)
        .set({ 
          status: 'results'
        })
        .where(eq(gameSessions.id, sessionId));
      
      console.log('All players voted, scores calculated, auto-transitioning to results phase', { 
        sessionId, 
        playerCount: allPlayers.length,
        votedCount: votedPlayers.length 
      });
      
      // フェーズが結果表示に移行しました
    }

    return NextResponse.json({ vote: newVote });

  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}