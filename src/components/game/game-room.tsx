'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { GameState, GameEngine, Player, Question } from '@/lib/game-logic';
import { getRandomQuestion } from '@/lib/sample-questions';
import { MessageSquare, MessageCircle, Trophy, PartyPopper, Crown, Users, FileText, CheckCircle, Clock, Vote, Medal } from 'lucide-react';

interface GameRoomProps {
  roomId: string;
  currentUser: Player;
}

export function GameRoom({ roomId, currentUser }: GameRoomProps) {
  const [gameState, setGameState] = useState<GameState>({
    sessionId: 'demo-session',
    roomId,
    status: 'waiting',
    currentRound: 0,
    totalRounds: 5,
    players: [currentUser],
    answers: [],
    votes: [],
    timeRemaining: 0,
  });

  const [gameEngine, setGameEngine] = useState<GameEngine>();
  const [currentAnswer, setCurrentAnswer] = useState('');

  useEffect(() => {
    const engine = new GameEngine(gameState);
    setGameEngine(engine);
  }, [gameState]);

  const startGame = () => {
    if (gameEngine) {
      const question: Question = {
        id: '1',
        ...getRandomQuestion()
      };
      const newState = {
        ...gameEngine.getGameState(),
        currentQuestion: question
      };
      const engine = new GameEngine(newState);
      setGameEngine(engine);
      setGameState(engine.startGame());
    }
  };

  const submitAnswer = () => {
    if (gameEngine && currentAnswer.trim()) {
      try {
        const newState = gameEngine.submitAnswer(currentUser.id, currentAnswer.trim());
        setGameState(newState);
        setCurrentAnswer('');
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }
  };

  const submitVote = (answerId: string) => {
    if (gameEngine) {
      try {
        const newState = gameEngine.submitVote(currentUser.id, answerId);
        setGameState(newState);
      } catch (error) {
        console.error('Error submitting vote:', error);
      }
    }
  };

  const getStatusDisplay = () => {
    switch (gameState.status) {
      case 'waiting':
        return '待機中';
      case 'question':
        return 'お題発表';
      case 'answering':
        return '回答中';
      case 'voting':
        return '投票中';
      case 'results':
        return '結果発表';
      case 'finished':
        return 'ゲーム終了';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (gameState.status) {
      case 'waiting':
        return 'secondary';
      case 'question':
        return 'default';
      case 'answering':
        return 'default';
      case 'voting':
        return 'default';
      case 'results':
        return 'default';
      case 'finished':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const currentPlayer = gameState.players.find(p => p.id === currentUser.id);
  const hasAnswered = currentPlayer?.hasAnswered || false;
  const hasVoted = currentPlayer?.hasVoted || false;

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
                    ルーム: {roomId}
                    <Badge variant={getStatusColor() as 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined}>
                      {getStatusDisplay()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    ラウンド {gameState.currentRound}/{gameState.totalRounds}
                    {gameState.timeRemaining > 0 && (
                      <span className="ml-4">
                        残り時間: {gameState.timeRemaining}秒
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">参加者</div>
                  <div className="text-2xl font-bold">{gameState.players.length}人</div>
                </div>
              </div>
              {gameState.timeRemaining > 0 && (
                <Progress 
                  value={(gameState.timeRemaining / (gameState.status === 'answering' ? 60 : 30)) * 100} 
                  className="mt-2"
                />
              )}
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* メインゲームエリア */}
            <div className="lg:col-span-2 space-y-6">
              {/* 待機中 */}
              {gameState.status === 'waiting' && (
                <Card>
                  <CardHeader>
                    <CardTitle>ゲーム開始を待っています</CardTitle>
                    <CardDescription>
                      全員が準備できたらゲームを開始しましょう
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
              {(gameState.status === 'question' || gameState.status === 'answering') && gameState.currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      お題
                    </CardTitle>
                    <CardDescription>
                      カテゴリー: {gameState.currentQuestion.category} | 
                      難易度: {gameState.currentQuestion.difficulty === 'easy' ? '初級' : 
                              gameState.currentQuestion.difficulty === 'medium' ? '中級' : '上級'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                      {gameState.currentQuestion.content}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 回答入力 */}
              {gameState.status === 'answering' && !hasAnswered && (
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
              {gameState.status === 'answering' && hasAnswered && (
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
                        回答済み: {gameState.players.filter(p => p.hasAnswered).length}/{gameState.players.length}人
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 投票 */}
              {gameState.status === 'voting' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="w-5 h-5" />
                      投票
                    </CardTitle>
                    <CardDescription>
                      最も面白いと思う回答に投票してください（自分の回答には投票できません）
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {gameState.answers.map((answer, index) => {
                      const isOwnAnswer = answer.userId === currentUser.id;
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
                            {!isOwnAnswer && !hasVoted && (
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
                    {hasVoted && (
                      <div className="text-center py-4">
                        <Badge>投票完了</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          投票済み: {gameState.players.filter(p => p.hasVoted).length}/{gameState.players.length}人
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 結果発表 */}
              {gameState.status === 'results' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      結果発表
                    </CardTitle>
                    <CardDescription>
                      ラウンド {gameState.currentRound} の結果
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {gameState.answers
                      .sort((a, b) => b.votes - a.votes)
                      .map((answer, index) => {
                        const player = gameState.players.find(p => p.id === answer.userId);
                        return (
                          <div
                            key={answer.id}
                            className={`p-4 border rounded-lg ${
                              index === 0 ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200' : 'bg-white dark:bg-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {index === 0 && <Medal className="w-6 h-6 text-yellow-500" />}
                                  {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                                  {index === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                                  <span className="font-semibold">{player?.name}</span>
                                  <Badge>{answer.votes}票</Badge>
                                </div>
                                <p className="text-lg">&ldquo;{answer.content}&rdquo;</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              )}

              {/* ゲーム終了 */}
              {gameState.status === 'finished' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PartyPopper className="w-5 h-5" />
                      ゲーム終了！
                    </CardTitle>
                    <CardDescription>
                      お疲れさまでした！最終結果をご覧ください
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {gameState.players
                        .sort((a, b) => b.score - a.score)
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-4 border rounded-lg ${
                              index === 0 ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200' : 'bg-white dark:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {index === 0 && <Crown className="w-6 h-6 text-yellow-500 inline ml-2" />}
                              {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                              {index === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                              {index > 2 && <span className="text-xl">#{index + 1}</span>}
                              <span className="font-semibold text-lg">{player.name}</span>
                            </div>
                            <div className="text-xl font-bold">{player.score}点</div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-6 flex gap-4">
                      <Button className="flex-1" asChild>
                        <Link href="/rooms">新しいゲーム</Link>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href="/">ホームに戻る</Link>
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
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            player.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="font-medium">{player.name}</span>
                        {player.id === currentUser.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{player.score}点</div>
                        {gameState.status === 'answering' && (
                          <div className="text-xs text-muted-foreground">
                            {player.hasAnswered ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                        )}
                        {gameState.status === 'voting' && (
                          <div className="text-xs text-muted-foreground">
                            {player.hasVoted ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                        )}
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