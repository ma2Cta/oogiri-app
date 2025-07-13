export type GameStatus = 'waiting' | 'question' | 'answering' | 'voting' | 'results' | 'finished';
export type RoundStatus = 'waiting' | 'active' | 'voting' | 'completed';

export interface GameState {
  sessionId: string;
  roomId: string;
  status: GameStatus;
  currentRound: number;
  totalRounds: number;
  players: Player[];
  currentQuestion?: Question;
  answers: Answer[];
  votes: Vote[];
  timeRemaining: number;
  roundStartTime?: Date;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  status: 'connected' | 'disconnected';
  hasAnswered?: boolean;
  hasVoted?: boolean;
}

export interface Question {
  id: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  id: string;
  userId: string;
  content: string;
  votes: number;
  submittedAt: Date;
}

export interface Vote {
  id: string;
  voterId: string;
  answerId: string;
  votedAt: Date;
}

export class GameEngine {
  private gameState: GameState;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  startGame(): GameState {
    this.gameState.status = 'question';
    this.gameState.currentRound = 1;
    this.nextQuestion();
    return this.getGameState();
  }

  nextQuestion(): GameState {
    this.gameState.status = 'question';
    this.gameState.answers = [];
    this.gameState.votes = [];
    this.gameState.roundStartTime = new Date();
    
    // プレイヤーの状態をリセット
    this.gameState.players = this.gameState.players.map(player => ({
      ...player,
      hasAnswered: false,
      hasVoted: false
    }));

    // 5秒後に回答フェーズに移行
    this.setTimer('questionToAnswer', () => {
      this.startAnswerPhase();
    }, 5000);

    return this.getGameState();
  }

  startAnswerPhase(): GameState {
    this.gameState.status = 'answering';
    this.gameState.timeRemaining = 60; // 60秒

    // 回答時間のタイマー
    this.setTimer('answerPhase', () => {
      this.startVotingPhase();
    }, 60000);

    // カウントダウンタイマー
    this.setTimer('countdown', () => {
      if (this.gameState.timeRemaining > 0) {
        this.gameState.timeRemaining--;
        this.setTimer('countdown', () => {}, 1000);
      }
    }, 1000);

    return this.getGameState();
  }

  submitAnswer(userId: string, content: string): GameState {
    // 既に回答済みかチェック
    if (this.gameState.answers.find(a => a.userId === userId)) {
      throw new Error('Already submitted answer');
    }

    // 回答フェーズかチェック
    if (this.gameState.status !== 'answering') {
      throw new Error('Not in answering phase');
    }

    const answer: Answer = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      content,
      votes: 0,
      submittedAt: new Date()
    };

    this.gameState.answers.push(answer);
    
    // プレイヤーの回答状態を更新
    const player = this.gameState.players.find(p => p.id === userId);
    if (player) {
      player.hasAnswered = true;
    }

    // 全員が回答したら投票フェーズへ
    if (this.allPlayersAnswered()) {
      this.clearTimer('answerPhase');
      this.clearTimer('countdown');
      this.startVotingPhase();
    }

    return this.getGameState();
  }

  startVotingPhase(): GameState {
    this.gameState.status = 'voting';
    this.gameState.timeRemaining = 30; // 30秒

    // 回答をシャッフル（匿名性のため）
    this.gameState.answers = this.shuffleArray([...this.gameState.answers]);

    // 投票時間のタイマー
    this.setTimer('votingPhase', () => {
      this.showResults();
    }, 30000);

    // カウントダウンタイマー
    this.setTimer('countdown', () => {
      if (this.gameState.timeRemaining > 0) {
        this.gameState.timeRemaining--;
        this.setTimer('countdown', () => {}, 1000);
      }
    }, 1000);

    return this.getGameState();
  }

  submitVote(voterId: string, answerId: string): GameState {
    // 既に投票済みかチェック
    if (this.gameState.votes.find(v => v.voterId === voterId)) {
      throw new Error('Already voted');
    }

    // 投票フェーズかチェック
    if (this.gameState.status !== 'voting') {
      throw new Error('Not in voting phase');
    }

    // 自分の回答には投票できない
    const answer = this.gameState.answers.find(a => a.id === answerId);
    if (answer?.userId === voterId) {
      throw new Error('Cannot vote for own answer');
    }

    const vote: Vote = {
      id: Math.random().toString(36).substr(2, 9),
      voterId,
      answerId,
      votedAt: new Date()
    };

    this.gameState.votes.push(vote);

    // 回答の票数を更新
    if (answer) {
      answer.votes++;
    }

    // プレイヤーの投票状態を更新
    const player = this.gameState.players.find(p => p.id === voterId);
    if (player) {
      player.hasVoted = true;
    }

    // 全員が投票したら結果表示へ
    if (this.allPlayersVoted()) {
      this.clearTimer('votingPhase');
      this.clearTimer('countdown');
      this.showResults();
    }

    return this.getGameState();
  }

  showResults(): GameState {
    this.gameState.status = 'results';

    // スコアを計算
    this.gameState.answers.forEach(answer => {
      const player = this.gameState.players.find(p => p.id === answer.userId);
      if (player) {
        player.score += answer.votes;
      }
    });

    // 5秒後に次のラウンドまたは終了
    this.setTimer('resultsPhase', () => {
      if (this.gameState.currentRound < this.gameState.totalRounds) {
        this.gameState.currentRound++;
        this.nextQuestion();
      } else {
        this.endGame();
      }
    }, 5000);

    return this.getGameState();
  }

  endGame(): GameState {
    this.gameState.status = 'finished';
    this.clearAllTimers();
    return this.getGameState();
  }

  private allPlayersAnswered(): boolean {
    return this.gameState.players
      .filter(p => p.status === 'connected')
      .every(p => p.hasAnswered);
  }

  private allPlayersVoted(): boolean {
    return this.gameState.players
      .filter(p => p.status === 'connected')
      .every(p => p.hasVoted);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private setTimer(id: string, callback: () => void, delay: number): void {
    this.clearTimer(id);
    const timer = setTimeout(callback, delay);
    this.timers.set(id, timer);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private clearAllTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  // プレイヤー管理
  addPlayer(player: Player): GameState {
    if (!this.gameState.players.find(p => p.id === player.id)) {
      this.gameState.players.push(player);
    }
    return this.getGameState();
  }

  removePlayer(playerId: string): GameState {
    this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
    return this.getGameState();
  }

  updatePlayerStatus(playerId: string, status: 'connected' | 'disconnected'): GameState {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (player) {
      player.status = status;
    }
    return this.getGameState();
  }
}