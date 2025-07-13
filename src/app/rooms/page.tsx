'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserNav } from "@/components/auth/user-nav";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoorOpen, Plus, Theater, Home, Users, Key } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  code: string;
  hostId: string;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  currentPlayers: number;
  createdAt: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
    // 10秒ごとに更新
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    
    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: roomCode.toUpperCase() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join room');
      }

      const data = await response.json();
      router.push(data.redirectUrl);
    } catch (error) {
      console.error('Error joining room:', error);
      alert(error instanceof Error ? error.message : 'ルームに参加できませんでした');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <Link href="/" className="hover:text-blue-600 transition-colors">Oogiri App</Link>
            </h1>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">ルームに参加</h1>
            <p className="text-xl text-muted-foreground">
              ルームコードを入力して参加するか、新しいルームを作成しましょう
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* ルームに参加 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="w-5 h-5" />
                  ルームに参加
                </CardTitle>
                <CardDescription>
                  友達から教えてもらったルームコードを入力してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ルームコード</label>
                  <Input 
                    placeholder="例: ABC123"
                    className="text-center text-lg font-mono"
                    maxLength={6}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                </div>
                <Button className="w-full" size="lg" onClick={handleJoinRoom}>
                  参加する
                </Button>
              </CardContent>
            </Card>

            {/* ルームを作成 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  ルームを作成
                </CardTitle>
                <CardDescription>
                  新しいルームを作成して友達を招待しましょう
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Theater className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    あなたがホストとなってゲームを主催します
                  </p>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/rooms/create">ルームを作成</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 公開ルーム一覧 */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">公開ルーム</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-muted-foreground">ルーム一覧を読み込み中...</p>
              </div>
            ) : rooms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-xl text-muted-foreground">現在公開されているルームはありません</p>
                  <p className="text-muted-foreground mt-2">新しくルームを作成して友達を招待しましょう！</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{room.name}</h3>
                          <Badge 
                            variant={room.status === 'waiting' ? 'default' : 'secondary'}
                          >
                            {room.status === 'waiting' ? '待機中' : 'プレイ中'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {room.currentPlayers}/{room.maxPlayers}人
                          </span>
                          <span className="flex items-center gap-1">
                            <Key className="w-4 h-4" />
                            {room.code}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant={room.status === 'waiting' ? 'default' : 'outline'}
                        disabled={room.status !== 'waiting' || room.currentPlayers >= room.maxPlayers}
                        onClick={async () => {
                          setRoomCode(room.code);
                          
                          try {
                            const response = await fetch('/api/rooms/join', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ roomCode: room.code }),
                            });

                            if (!response.ok) {
                              const error = await response.json();
                              throw new Error(error.error || 'Failed to join room');
                            }

                            const data = await response.json();
                            router.push(data.redirectUrl);
                          } catch (error) {
                            console.error('Error joining room:', error);
                            alert(error instanceof Error ? error.message : 'ルームに参加できませんでした');
                          }
                        }}
                      >
                        {room.status === 'waiting' ? '参加' : '観戦'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}