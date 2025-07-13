import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from '@auth/core/adapters';

export const roomStatusEnum = pgEnum('room_status', ['waiting', 'playing', 'finished']);
export const sessionStatusEnum = pgEnum('session_status', ['waiting', 'question', 'answering', 'voting', 'results', 'finished']);
export const roundStatusEnum = pgEnum('round_status', ['waiting', 'active', 'voting', 'completed']);
export const playerStatusEnum = pgEnum('player_status', ['connected', 'disconnected']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

export const users = pgTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const rooms = pgTable('room', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  hostId: text('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  maxPlayers: integer('max_players').default(8).notNull(),
  status: roomStatusEnum('status').default('waiting').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const gameSessions = pgTable('game_session', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  currentRound: integer('current_round').default(0).notNull(),
  totalRounds: integer('total_rounds').default(5).notNull(),
  status: sessionStatusEnum('status').default('waiting').notNull(),
  startedAt: timestamp('started_at', { mode: 'date' }),
  endedAt: timestamp('ended_at', { mode: 'date' }),
});

export const questions = pgTable('question', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  difficulty: difficultyEnum('difficulty').default('medium').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const rounds = pgTable('round', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id),
  roundNumber: integer('round_number').notNull(),
  timeLimit: integer('time_limit').default(60).notNull(),
  status: roundStatusEnum('status').default('waiting').notNull(),
  startedAt: timestamp('started_at', { mode: 'date' }),
  endedAt: timestamp('ended_at', { mode: 'date' }),
});

export const answers = pgTable('answer', {
  id: uuid('id').defaultRandom().primaryKey(),
  roundId: uuid('round_id').notNull().references(() => rounds.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  submittedAt: timestamp('submitted_at', { mode: 'date' }).defaultNow().notNull(),
});

export const votes = pgTable('vote', {
  id: uuid('id').defaultRandom().primaryKey(),
  roundId: uuid('round_id').notNull().references(() => rounds.id, { onDelete: 'cascade' }),
  voterId: text('voter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  answerId: uuid('answer_id').notNull().references(() => answers.id, { onDelete: 'cascade' }),
  votedAt: timestamp('voted_at', { mode: 'date' }).defaultNow().notNull(),
});

export const playerSessions = pgTable('player_session', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => gameSessions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').default(0).notNull(),
  status: playerStatusEnum('status').default('connected').notNull(),
  joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
  leftAt: timestamp('left_at', { mode: 'date' }),
});

export const roomMembers = pgTable('room_member', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomId: uuid('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
});