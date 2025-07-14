'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  code: string;
  hostId: string;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
  updatedAt: string;
}

interface RoomDetailProps {
  roomId: string;
}

export function RoomDetail({ roomId }: RoomDetailProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) {
          throw new Error('Room not found');
        }
        const data = await response.json();
        setRoom(data.room);
      } catch (error) {
        console.error('Error fetching room:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const joinRoom = async () => {
    if (status !== 'authenticated') {
      router.push('/auth/signin');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join room');
      }

      const data = await response.json();
      
      // ゲームセッションページにリダイレクト
      router.push(`/game/${data.gameSession.id}`);

    } catch (error) {
      console.error('Error joining room:', error);
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const copyRoomCode = async () => {
    if (room) {
      try {
        await navigator.clipboard.writeText(room.code);
        // TODO: Show toast notification
      } catch (error) {
        console.error('Failed to copy room code:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
              <p>ルーム情報を読み込み中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>エラーが発生しました</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || 'ルームが見つかりません'}</p>
            <Button onClick={() => router.push('/rooms')}>
              ルーム一覧に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHost = session?.user?.id === room.hostId;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ルーム情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{room.name}</CardTitle>
              <CardDescription>
                ルームコード: {room.code}
              </CardDescription>
            </div>
            <Badge variant={room.status === 'waiting' ? 'default' : 'secondary'}>
              {room.status === 'waiting' ? '待機中' : 
               room.status === 'playing' ? 'プレイ中' : '終了'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">最大プレイヤー数</p>
              <p className="font-semibold">{room.maxPlayers}人</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">現在の参加者</p>
              <p className="font-semibold">1人</p> {/* TODO: 実際の参加者数を表示 */}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">ルームコードを共有</p>
            <div className="flex gap-2">
              <Input 
                value={room.code}
                readOnly
                className="font-mono text-lg text-center"
              />
              <Button variant="outline" onClick={copyRoomCode}>
                コピー
              </Button>
            </div>
          </div>

          {room.status === 'waiting' && (
            <div className="flex gap-4 pt-4">
              {!isHost && (
                <Button 
                  onClick={joinRoom}
                  disabled={joining}
                  className="flex-1"
                  size="lg"
                >
                  {joining ? '参加中...' : 'ルームに参加'}
                </Button>
              )}
              {isHost && (
                <Button 
                  onClick={joinRoom}
                  className="flex-1"
                  size="lg"
                >
                  ゲーム準備画面へ
                </Button>
              )}
            </div>
          )}

          {room.status === 'playing' && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">このルームは現在ゲーム中です</p>
              <Button variant="outline" onClick={joinRoom}>
                観戦する
              </Button>
            </div>
          )}

          {room.status === 'finished' && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">このゲームは終了しました</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ホスト向け情報 */}
      {isHost && room.status === 'waiting' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ホスト向け機能</CardTitle>
            <CardDescription>
              あなたがこのルームのホストです
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">ルーム管理</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  設定変更
                </Button>
                <Button variant="outline" size="sm">
                  ルーム削除
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">招待方法</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. 上記のルームコードを友達に送信</li>
                <li>2. 友達が「ルームに参加」からコードを入力</li>
                <li>3. 全員が揃ったらゲーム開始</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 参加者向け情報 */}
      {!isHost && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">参加方法</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mt-0.5">1</span>
                <span>「ルームに参加」ボタンをクリック</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mt-0.5">2</span>
                <span>ゲーム準備画面で他の参加者を待機</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center mt-0.5">3</span>
                <span>ホストがゲームを開始するまでお待ちください</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}