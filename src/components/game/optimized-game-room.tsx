'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { GameWebSocketClient } from '@/lib/websocket-client';
import { Trophy } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  image?: string;
  score: number;
  status: 'connected' | 'disconnected';
  hasAnswered?: boolean;
  hasVoted?: boolean;
}

interface GameSession {
  id: string;
  roomId: string;
  currentRound: number;
  totalRounds: number;
  status: 'waiting' | 'question' | 'answering' | 'voting' | 'results' | 'finished';
  startedAt?: string;
  endedAt?: string;
}

interface Question {
  id: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Answer {
  id: string;
  userId: string;
  content: string;
  votes: number;
  submittedAt: string;
}

interface OptimizedGameRoomProps {
  sessionId: string;
}

// PlayerListコンポーネントをメモ化
const PlayerList = memo(({ players }: { players: Player[] }) => {

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // スコア順でソート
      if (a.score !== b.score) return b.score - a.score;
      // 同じスコアなら名前順
      return a.name.localeCompare(b.name);
    });
  }, [players]);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">プレイヤー ({players.length})</h3>
      {sortedPlayers.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
});

PlayerList.displayName = 'PlayerList';

// PlayerCardコンポーネントをメモ化
const PlayerCard = memo(({ player }: { player: Player }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
    <div className="flex items-center space-x-2">
      <Badge variant={player.status === 'connected' ? 'default' : 'secondary'}>
        {player.name}
      </Badge>
      {player.hasAnswered && <Badge variant="outline">回答済み</Badge>}
      {player.hasVoted && <Badge variant="outline">投票済み</Badge>}
    </div>
    <span className="font-semibold">{player.score}pt</span>
  </div>
));

PlayerCard.displayName = 'PlayerCard';

// QuestionDisplayコンポーネントをメモ化
const QuestionDisplay = memo(({ question }: { question: Question | null }) => {
  if (!question) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>お題</CardTitle>
        <CardDescription>
          カテゴリー: {question.category} | 難易度: {question.difficulty}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold text-center py-4">
          {question.content}
        </p>
      </CardContent>
    </Card>
  );
});

QuestionDisplay.displayName = 'QuestionDisplay';

// AnswerInputコンポーネントをメモ化
const AnswerInput = memo(({ 
  value, 
  onChange, 
  onSubmit, 
  disabled 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  onSubmit: () => void; 
  disabled: boolean; 
}) => {
  const handleSubmit = useCallback(() => {
    if (value.trim() && !disabled) {
      onSubmit();
    }
  }, [value, onSubmit, disabled]);

  const characterCount = useMemo(() => value.length, [value]);
  const isOverLimit = useMemo(() => characterCount > 200, [characterCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>あなたの回答</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="回答を入力してください..."
          className="min-h-[100px]"
          disabled={disabled}
        />
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
            {characterCount}/200文字
          </span>
          <Button 
            onClick={handleSubmit}
            disabled={disabled || !value.trim() || isOverLimit}
          >
            回答を送信
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

AnswerInput.displayName = 'AnswerInput';

// VotingPanelコンポーネントをメモ化
const VotingPanel = memo(({ 
  answers, 
  onVote, 
  currentUserId,
  disabled 
}: { 
  answers: Answer[]; 
  onVote: (answerId: string) => void; 
  currentUserId: string;
  disabled: boolean;
}) => {
  const filteredAnswers = useMemo(() => {
    return answers.filter(answer => answer.userId !== currentUserId);
  }, [answers, currentUserId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>投票</CardTitle>
        <CardDescription>最も面白い回答に投票してください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredAnswers.map((answer) => (
          <VoteButton 
            key={answer.id}
            answer={answer}
            onVote={onVote}
            disabled={disabled}
          />
        ))}
      </CardContent>
    </Card>
  );
});

VotingPanel.displayName = 'VotingPanel';

// VoteButtonコンポーネントをメモ化
const VoteButton = memo(({ 
  answer, 
  onVote, 
  disabled 
}: { 
  answer: Answer; 
  onVote: (answerId: string) => void; 
  disabled: boolean; 
}) => {
  const handleVote = useCallback(() => {
    if (!disabled) {
      onVote(answer.id);
    }
  }, [answer.id, onVote, disabled]);

  return (
    <Button
      variant="outline"
      className="w-full p-4 h-auto text-left justify-start"
      onClick={handleVote}
      disabled={disabled}
    >
      <div>
        <p className="font-medium">{answer.content}</p>
        <p className="text-sm text-gray-500 mt-1">{answer.votes} 票</p>
      </div>
    </Button>
  );
});

VoteButton.displayName = 'VoteButton';

export function OptimizedGameRoom({ sessionId }: OptimizedGameRoomProps) {
  const { data: session } = useSession();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion] = useState<Question | null>(null);
  const [answers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [wsClient, setWsClient] = useState<GameWebSocketClient | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null); // null = 接続試行前, false = 切断中, true = 接続中
  const [timeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // メモ化された値
  const currentUserId = useMemo(() => session?.user?.id || '', [session]);
  const currentPlayer = useMemo(() => 
    players.find(p => p.id === currentUserId), 
    [players, currentUserId]
  );
  const progressPercentage = useMemo(() => 
    gameSession ? (gameSession.currentRound / gameSession.totalRounds) * 100 : 0, 
    [gameSession]
  );

  // ゲームセッション情報を取得（メモ化）
  const fetchGameSession = useCallback(async () => {
    try {
      console.log('Fetching game session for sessionId:', sessionId);
      const response = await fetch(`/api/game/${sessionId}`);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch game session: ${response.status}`);
      }
      const data = await response.json();
      console.log('Game session data:', data);
      setGameSession(data.gameSession);
      setPlayers(data.players);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game session:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  }, [sessionId]);

  // プレイヤー更新ハンドラー（メモ化）
  const handlePlayerUpdate = useCallback((message: { data: { userId: string; hasAnswered?: boolean; hasVoted?: boolean } }) => {
    setPlayers(prev => prev.map(p => 
      p.id === message.data.userId 
        ? { ...p, hasAnswered: message.data.hasAnswered || p.hasAnswered, hasVoted: message.data.hasVoted || p.hasVoted }
        : p
    ));
  }, []);

  // 回答送信ハンドラー（メモ化）
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentAnswer.trim() || !wsClient) return;

    try {
      const response = await fetch(`/api/game/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentAnswer.trim() }),
      });

      if (response.ok) {
        wsClient.submitAnswer(currentAnswer.trim());
        setCurrentAnswer('');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }, [currentAnswer, sessionId, wsClient]);

  // 投票ハンドラー（メモ化）
  const handleVote = useCallback(async (answerId: string) => {
    if (!wsClient) return;

    try {
      const response = await fetch(`/api/game/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId }),
      });

      if (response.ok) {
        wsClient.submitVote(answerId);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  }, [sessionId, wsClient]);

  // WebSocket接続とイベントハンドラー設定
  useEffect(() => {
    if (!currentUserId || !gameSession) return;

    const client = new GameWebSocketClient(sessionId, currentUserId);
    
    // 接続イベント
    client.on('join', (message) => {
      if (message.data?.success) {
        setConnected(true);
      } else if (message.data?.userId) {
        handlePlayerUpdate(message);
      }
    });

    client.on('leave', handlePlayerUpdate);
    client.on('answer', handlePlayerUpdate);
    client.on('vote', handlePlayerUpdate);

    // スコア更新イベント
    client.on('score_update', (message) => {
      console.log('Score update received:', message.data);
      // 現在のゲーム状態を再取得してスコアを最新化
      fetchGameSession();
    });

    client.on('error', (message) => {
      setError(message.data?.error || 'WebSocket error');
    });

    setWsClient(client);

    return () => {
      client.disconnect();
    };
  }, [sessionId, currentUserId, gameSession, handlePlayerUpdate]);

  // 初期データ取得
  useEffect(() => {
    fetchGameSession();
  }, [fetchGameSession]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p>ゲーム情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button asChild className="mt-4">
              <Link href="/rooms">ルーム一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <p>ゲームセッションが見つかりません。</p>
            <p>sessionId: {sessionId}</p>
            <p>loading: {loading.toString()}</p>
            <p>error: {error}</p>
            <Button asChild className="mt-4">
              <Link href="/rooms">ルーム一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* ゲーム情報ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle>
            ゲーム進行中 - ラウンド {gameSession.currentRound}/{gameSession.totalRounds}
          </CardTitle>
          <CardDescription>
            接続状態: {connected === true ? '接続中' : connected === false ? '切断中' : '接続試行中...'}
            {timeRemaining > 0 && ` | 残り時間: ${timeRemaining}秒`}
            <br />
            ゲーム状態: {gameSession.status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインゲームエリア */}
        <div className="lg:col-span-2 space-y-6">
          {/* フェーズ別コンテンツ */}
          {gameSession.status === 'waiting' && (
            <Card>
              <CardHeader>
                <CardTitle>ゲーム開始待ち</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/game/${sessionId}/start`, {
                        method: 'POST',
                      });
                      if (response.ok) {
                        console.log('Game started');
                      }
                    } catch (error) {
                      console.error('Error starting game:', error);
                    }
                  }}
                >
                  ゲーム開始
                </Button>
              </CardContent>
            </Card>
          )}

          {gameSession.status === 'question' && (
            <QuestionDisplay question={currentQuestion} />
          )}

          {gameSession.status === 'answering' && (
            <>
              <QuestionDisplay question={currentQuestion} />
              <AnswerInput
                value={currentAnswer}
                onChange={setCurrentAnswer}
                onSubmit={handleSubmitAnswer}
                disabled={currentPlayer?.hasAnswered || false}
              />
            </>
          )}

          {gameSession.status === 'voting' && (
            <VotingPanel
              answers={answers}
              onVote={handleVote}
              currentUserId={currentUserId}
              disabled={currentPlayer?.hasVoted || false}
            />
          )}

          {gameSession.status === 'results' && (
            <Card>
              <CardHeader>
                <CardTitle>ラウンド結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {answers
                    .sort((a, b) => b.votes - a.votes)
                    .map((answer, index) => (
                      <div key={answer.id} className="p-3 border rounded">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{answer.content}</p>
                          <Badge variant={index === 0 ? 'default' : 'outline'}>
                            {answer.votes} 票 {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 inline ml-1" />}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {gameSession.status === 'finished' && (
            <Card>
              <CardHeader>
                <CardTitle>ゲーム終了</CardTitle>
              </CardHeader>
              <CardContent>
                <p>ゲームが終了しました。お疲れ様でした！</p>
                <Button asChild className="mt-4">
                  <Link href="/rooms">新しいゲームを始める</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* サイドバー - プレイヤーリスト */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>参加者</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerList players={players} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}