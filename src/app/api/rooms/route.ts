import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { rooms, roomMembers, users } from '@/lib/db/schema';
import { generateRoomCode } from '@/lib/room-utils';
import { eq, count, desc } from 'drizzle-orm';
import { validateAndSanitizeRoomName, validatePositiveInteger } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { GAME_CONSTANTS } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      maxPlayers = 6,
      totalRounds = 5,
      answerTimeLimit = 60,
      votingTimeLimit = 30,
      difficulty = 'medium'
    } = body;

    // 入力検証とサニタイゼーション
    let sanitizedName: string;
    try {
      sanitizedName = validateAndSanitizeRoomName(name);
    } catch (error) {
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Invalid room name' 
      }, { status: 400 });
    }

    // 数値パラメータの検証
    let validatedMaxPlayers: number;
    let validatedTotalRounds: number;
    let validatedAnswerTimeLimit: number;
    let validatedVotingTimeLimit: number;

    try {
      validatedMaxPlayers = validatePositiveInteger(maxPlayers, 'maxPlayers');
      validatedTotalRounds = validatePositiveInteger(totalRounds, 'totalRounds');
      validatedAnswerTimeLimit = validatePositiveInteger(answerTimeLimit, 'answerTimeLimit');
      validatedVotingTimeLimit = validatePositiveInteger(votingTimeLimit, 'votingTimeLimit');

      // 範囲チェック
      if (validatedMaxPlayers > GAME_CONSTANTS.MAX_PLAYERS_PER_ROOM) {
        throw new Error(`maxPlayers cannot exceed ${GAME_CONSTANTS.MAX_PLAYERS_PER_ROOM}`);
      }
      if (validatedTotalRounds > GAME_CONSTANTS.MAX_ROUNDS) {
        throw new Error(`totalRounds cannot exceed ${GAME_CONSTANTS.MAX_ROUNDS}`);
      }
      if (validatedAnswerTimeLimit > GAME_CONSTANTS.MAX_ANSWER_TIME) {
        throw new Error(`answerTimeLimit cannot exceed ${GAME_CONSTANTS.MAX_ANSWER_TIME} seconds`);
      }
      if (validatedVotingTimeLimit > GAME_CONSTANTS.MAX_VOTING_TIME) {
        throw new Error(`votingTimeLimit cannot exceed ${GAME_CONSTANTS.MAX_VOTING_TIME} seconds`);
      }
    } catch (error) {
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Invalid numeric parameters' 
      }, { status: 400 });
    }

    // ルームコードを生成（重複チェック付き）
    let roomCode: string;
    let attempts = 0;
    do {
      roomCode = generateRoomCode();
      const existingRoom = await db.select().from(rooms).where(eq(rooms.code, roomCode)).limit(1);
      if (existingRoom.length === 0) break;
      attempts++;
    } while (attempts < GAME_CONSTANTS.ROOM_CODE_GENERATION_MAX_ATTEMPTS);

    if (attempts >= GAME_CONSTANTS.ROOM_CODE_GENERATION_MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Failed to generate unique room code' }, { status: 500 });
    }

    // ルームを作成
    const [newRoom] = await db.insert(rooms).values({
      name: sanitizedName,
      code: roomCode,
      hostId: session.user.id,
      maxPlayers: validatedMaxPlayers,
      status: 'waiting',
    }).returning();

    // ホストをルームメンバーに追加
    await db.insert(roomMembers).values({
      roomId: newRoom.id,
      userId: session.user.id,
    });

    return NextResponse.json({
      room: newRoom,
      settings: {
        totalRounds: validatedTotalRounds,
        answerTimeLimit: validatedAnswerTimeLimit,
        votingTimeLimit: validatedVotingTimeLimit,
        difficulty
      }
    });

  } catch (error) {
    const session = await getServerSession(authOptions);
    logger.api.error('POST', '/api/rooms', error as Error, session?.user?.id);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 公開ルーム一覧とホスト情報を取得
    const publicRooms = await db.select({
      id: rooms.id,
      name: rooms.name,
      code: rooms.code,
      hostId: rooms.hostId,
      hostName: users.name,
      maxPlayers: rooms.maxPlayers,
      status: rooms.status,
      createdAt: rooms.createdAt,
    })
    .from(rooms)
    .leftJoin(users, eq(rooms.hostId, users.id))
    .where(eq(rooms.status, 'waiting'))
    .orderBy(desc(rooms.createdAt))
    .limit(20);

    // 各ルームの現在の参加者数を取得
    const roomsWithPlayerCount = await Promise.all(
      publicRooms.map(async (room) => {
        const [memberCount] = await db
          .select({ count: count() })
          .from(roomMembers)
          .where(eq(roomMembers.roomId, room.id));

        return {
          ...room,
          currentPlayers: memberCount?.count || 0,
        };
      })
    );

    return NextResponse.json({ rooms: roomsWithPlayerCount });

  } catch (error) {
    console.error('Rooms fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}