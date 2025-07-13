import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { gameSessions, playerSessions, users, rounds, questions, answers, votes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
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

    // 参加者一覧を取得
    const players = await db.select({
      id: playerSessions.id,
      userId: playerSessions.userId,
      userName: users.name,
      userImage: users.image,
      score: playerSessions.score,
      status: playerSessions.status,
      joinedAt: playerSessions.joinedAt
    }).from(playerSessions)
      .leftJoin(users, eq(playerSessions.userId, users.id))
      .where(eq(playerSessions.sessionId, sessionId));

    // ユーザーが参加者かチェック
    const isPlayer = players.some(p => p.userId === session.user.id);
    
    if (!isPlayer) {
      return NextResponse.json({ error: 'You are not a player in this session' }, { status: 403 });
    }

    // 現在のラウンドとお題情報を取得
    let currentQuestion: {
      id: string;
      content: string;
      category: string;
      difficulty: string;
    } | null = null;
    let currentAnswers: Array<{
      id: string;
      userId: string;
      content: string;
      votes: number;
      submittedAt: Date;
    }> = [];
    
    if (gameSession.currentRound > 0) {
      const [roundData] = await db.select({
        id: rounds.id,
        questionId: rounds.questionId,
        roundNumber: rounds.roundNumber,
        status: rounds.status,
        timeLimit: rounds.timeLimit
      }).from(rounds)
        .where(and(
          eq(rounds.sessionId, sessionId),
          eq(rounds.roundNumber, gameSession.currentRound)
        ))
        .limit(1);

      if (roundData) {
        
        // お題情報を取得
        const [question] = await db.select().from(questions)
          .where(eq(questions.id, roundData.questionId))
          .limit(1);
        
        if (question) {
          currentQuestion = {
            id: question.id,
            content: question.content,
            category: question.category,
            difficulty: question.difficulty
          };
        }

        // 現在のラウンドの回答と投票数を取得（結果表示用）
        if (gameSession.status === 'voting' || gameSession.status === 'results') {
          const answersWithVotes = await db.select({
            id: answers.id,
            userId: answers.userId,
            content: answers.content,
            submittedAt: answers.submittedAt,
            votes: sql<number>`COUNT(${votes.id})`
          }).from(answers)
            .leftJoin(votes, eq(answers.id, votes.answerId))
            .where(eq(answers.roundId, roundData.id))
            .groupBy(answers.id, answers.userId, answers.content, answers.submittedAt);

          currentAnswers = answersWithVotes.map(answer => ({
            id: answer.id,
            userId: answer.userId,
            content: answer.content,
            votes: answer.votes || 0,
            submittedAt: answer.submittedAt
          }));
        }
      }
    }

    return NextResponse.json({ 
      gameSession,
      currentQuestion,
      answers: currentAnswers,
      players: players.map(p => ({
        id: p.userId,
        name: p.userName || 'Unknown Player',
        image: p.userImage,
        score: p.score,
        status: p.status,
        joinedAt: p.joinedAt
      }))
    });

  } catch (error) {
    console.error('Game session fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}