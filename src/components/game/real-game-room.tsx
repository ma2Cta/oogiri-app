'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, MessageCircle, PartyPopper, Trophy, Users, FileText, CheckCircle, Clock, Vote, Medal } from 'lucide-react';

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

interface RealGameRoomProps {
  sessionId: string;
}

export function RealGameRoom({ sessionId }: RealGameRoomProps) {
  const { data: session } = useSession();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ゲームセッション情報を取得
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
      if (data.currentQuestion) {
        setCurrentQuestion(data.currentQuestion);
      }
      if (data.answers) {
        setAnswers(data.answers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game session:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  }, [sessionId]);


  // 初回データ取得
  useEffect(() => {
    if (!session?.user?.id) return;
    fetchGameSession();
  }, [session?.user?.id, fetchGameSession]);

  // 定期ポーリングを使用
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const pollInterval = setInterval(() => {
      console.log('Polling game state');
      fetchGameSession();
    }, 2000); // 2秒間隔でポーリング

    return () => clearInterval(pollInterval);
  }, [session?.user?.id, fetchGameSession]);

  // フェーズ変更時にフラグをリセット
  useEffect(() => {
    if (gameSession?.status === 'answering') {
      setHasSubmittedAnswer(false);
    } else if (gameSession?.status === 'voting') {
      setHasVoted(false);
    }
  }, [gameSession?.status]);

  // ゲーム開始
  const startGame = async () => {
    try {
      const response = await fetch(`/api/game/${sessionId}/start`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      
      const data = await response.json();
      setGameSession(data.gameSession);
      setCurrentQuestion(data.question);
      
      // ゲーム状態は定期ポーリングで更新されます
    } catch (error) {
      console.error('Error starting game:', error);
      setError(error instanceof Error ? error.message : 'Failed to start game');
    }
  };

  // 回答送信
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    try {
      const response = await fetch(`/api/game/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentAnswer.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Answer submission failed:', response.status, errorData);
        throw new Error(`Failed to submit answer: ${response.status} - ${errorData}`);
      }

      setCurrentAnswer('');
      setHasSubmittedAnswer(true);
      
      // ポーリング方式なので即座に状態をフェッチ
      setTimeout(() => {
        fetchGameSession();
      }, 500); // 0.5秒後にフェッチ

    } catch (error) {
      console.error('Error submitting answer:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit answer');
    }
  };

  // 投票送信
  const submitVote = async (answerId: string) => {
    try {
      const response = await fetch(`/api/game/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      setHasVoted(true);
      
      // ポーリング方式なので即座に状態をフェッチ
      setTimeout(() => {
        fetchGameSession();
      }, 500); // 0.5秒後にフェッチ

    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit vote');
    }
  };

  const getStatusDisplay = () => {
    if (!gameSession) return '読み込み中';
    switch (gameSession.status) {
      case 'waiting': return '待機中';
      case 'question': return 'お題発表';
      case 'answering': return '回答中';
      case 'voting': return '投票中';
      case 'results': return '結果発表';
      case 'finished': return 'ゲーム終了';
      default: return '';
    }
  };

  const currentPlayer = players.find(p => p.id === session?.user?.id);
  const hasAnswered = hasSubmittedAnswer || currentPlayer?.hasAnswered || false;
  const hasVotedStatus = hasVoted || currentPlayer?.hasVoted || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="w-12 h-12 text-blue-600" />
          </div>
          <p className="text-xl">ゲームセッションを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>エラーが発生しました</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ゲームセッションが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/rooms">ルーム一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ゲーム状態ヘッダー */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    セッション: {sessionId.slice(0, 8)}...
                    <Badge variant="default">
                      ポーリング中
                    </Badge>
                    <Badge>
                      {getStatusDisplay()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    ラウンド {gameSession.currentRound}/{gameSession.totalRounds}
                    {timeRemaining > 0 && (
                      <span className="ml-4">
                        残り時間: {timeRemaining}秒
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">参加者</div>
                  <div className="text-2xl font-bold">{players.length}人</div>
                </div>
              </div>
              {timeRemaining > 0 && (
                <Progress 
                  value={(timeRemaining / 60) * 100} 
                  className="mt-2"
                />
              )}
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* メインゲームエリア */}
            <div className="lg:col-span-2 space-y-6">
              {/* 待機中 */}
              {gameSession.status === 'waiting' && (
                <Card>
                  <CardHeader>
                    <CardTitle>ゲーム開始を待っています</CardTitle>
                    <CardDescription>
                      ホストがゲームを開始するまでお待ちください
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={startGame} size="lg" className="w-full">
                      ゲーム開始
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* お題表示 */}
              {(gameSession.status === 'question' || gameSession.status === 'answering') && currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      お題
                    </CardTitle>
                    <CardDescription>
                      カテゴリー: {currentQuestion.category} | 
                      難易度: {currentQuestion.difficulty === 'easy' ? '初級' : 
                              currentQuestion.difficulty === 'medium' ? '中級' : '上級'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                      {currentQuestion.content}
                    </div>
                    {gameSession.status === 'question' && (
                      <div className="mt-4 text-center">
                        <Button 
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/game/${sessionId}/phase`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phase: 'answering' }),
                              });
                              if (response.ok) {
                                fetchGameSession();
                              }
                            } catch (error) {
                              console.error('Error advancing phase:', error);
                            }
                          }}
                        >
                          回答開始
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 回答入力 */}
              {gameSession.status === 'answering' && !hasAnswered && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      あなたの回答
                    </CardTitle>
                    <CardDescription>
                      制限時間内にあなたの回答を入力してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="ここにあなたの回答を入力してください..."
                      className="min-h-24"
                      maxLength={200}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {currentAnswer.length}/200文字
                      </span>
                      <Button 
                        onClick={submitAnswer}
                        disabled={!currentAnswer.trim()}
                      >
                        回答を投稿
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 回答済み表示 */}
              {gameSession.status === 'answering' && hasAnswered && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      回答を投稿しました
                    </CardTitle>
                    <CardDescription>
                      他のプレイヤーの回答を待っています...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="mb-4 flex justify-center">
                        <Clock className="w-16 h-16 text-blue-600" />
                      </div>
                      <p className="text-muted-foreground">
                        回答済み: {players.filter(p => p.hasAnswered).length}/{players.length}人
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 投票 */}
              {gameSession.status === 'voting' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="w-5 h-5" />
                      投票
                    </CardTitle>
                    <CardDescription>
                      {players.length === 1 
                        ? "あなたの回答に投票してください" 
                        : "最も面白いと思う回答に投票してください（自分の回答には投票できません）"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {answers.map((answer, index) => {
                      const isOwnAnswer = answer.userId === session?.user?.id;
                      return (
                        <div
                          key={answer.id}
                          className={`p-4 border rounded-lg ${
                            isOwnAnswer ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : 'bg-white dark:bg-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground mb-2">
                                回答 {index + 1}
                                {isOwnAnswer && <span className="ml-2 text-blue-600">（あなたの回答）</span>}
                              </div>
                              <p className="text-lg">&ldquo;{answer.content}&rdquo;</p>
                            </div>
                            {(!isOwnAnswer || players.length === 1) && !hasVotedStatus && (
                              <Button
                                onClick={() => submitVote(answer.id)}
                                variant="outline"
                                size="sm"
                              >
                                投票
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {hasVotedStatus && (
                      <div className="text-center py-4">
                        <Badge>投票完了</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          投票済み: {players.filter(p => p.hasVoted).length}/{players.length}人
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 結果表示 */}
              {gameSession.status === 'results' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PartyPopper className="w-5 h-5" />
                      結果発表
                    </CardTitle>
                    <CardDescription>
                      {players.length === 1 ? 'あなたの回答です' : 'このラウンドの結果'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {answers.map((answer, index) => (
                      <div
                        key={answer.id}
                        className="p-4 border rounded-lg bg-white dark:bg-slate-800"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground mb-2">
                              回答 {index + 1}
                              {answer.userId === session?.user?.id && (
                                <span className="ml-2 text-blue-600">（あなたの回答）</span>
                              )}
                            </div>
                            <p className="text-lg">&ldquo;{answer.content}&rdquo;</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {players.length === 1 ? (
                                <MessageSquare className="w-4 h-4" />
                              ) : (
                                `${answer.votes || 0}票`
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center mt-6">
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/game/${sessionId}/next-round`, {
                              method: 'POST',
                            });
                            
                            if (!response.ok) {
                              const errorData = await response.text();
                              console.error('Next round failed:', response.status, errorData);
                              setError(`次のラウンドの開始に失敗しました: ${response.status}`);
                              return;
                            }
                            
                            const data = await response.json();
                            console.log('Next round response:', data);
                            
                            // ゲーム状態を更新
                            setGameSession(data.gameSession);
                            if (data.question) {
                              setCurrentQuestion(data.question);
                            }
                            
                            // 回答状態をリセット
                            setAnswers([]);
                            setCurrentAnswer('');
                            
                            // プレイヤーの状態をリセット
                            setPlayers(prev => prev.map(p => ({
                              ...p,
                              hasAnswered: false,
                              hasVoted: false
                            })));
                            
                            // 最新の状態を取得
                            fetchGameSession();
                            
                          } catch (error) {
                            console.error('Error starting next round:', error);
                            setError('次のラウンドの開始に失敗しました');
                          }
                        }}
                      >
                        {gameSession.currentRound >= gameSession.totalRounds ? 'ゲーム終了' : '次のラウンドへ'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ゲーム終了 */}
              {gameSession.status === 'finished' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PartyPopper className="w-5 h-5" />
                      ゲーム終了
                    </CardTitle>
                    <CardDescription>
                      お疲れさまでした！最終結果をご確認ください
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">最終順位</h3>
                    <div className="space-y-2">
                      {players
                        .sort((a, b) => b.score - a.score)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              index === 0 ? 'bg-yellow-100 border-yellow-300' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold flex items-center gap-1">
                                {index === 0 ? (
                                  <><Medal className="w-5 h-5 text-yellow-500" />1位</>
                                ) : index === 1 ? (
                                  <><Medal className="w-5 h-5 text-gray-400" />2位</>
                                ) : index === 2 ? (
                                  <><Medal className="w-5 h-5 text-amber-600" />3位</>
                                ) : (
                                  `${index + 1}位`
                                )}
                              </span>
                              <span className="font-medium">{player.name}</span>
                              {player.id === session?.user?.id && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                            <div className="text-lg font-bold">{player.score}点</div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/rooms">新しいゲームを始める</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* サイドバー - プレイヤーリスト */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    プレイヤー
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                              player.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm leading-tight break-words">
                                {player.name}
                              </span>
                              {player.id === session?.user?.id && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="font-bold text-lg leading-none">{player.score}</div>
                          <div className="text-xs text-muted-foreground">点</div>
                          {gameSession.status === 'answering' && (
                            <div className="mt-1">
                              {player.hasAnswered ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                          )}
                          {gameSession.status === 'voting' && (
                            <div className="mt-1">
                              {player.hasVoted ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}