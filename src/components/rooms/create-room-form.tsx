'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Circle } from 'lucide-react';

export function CreateRoomForm() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxPlayers: '6',
    totalRounds: '5',
    answerTimeLimit: '60',
    votingTimeLimit: '30',
    difficulty: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }

      const data = await response.json();
      
      // ルーム作成成功後、ルーム参加ページへリダイレクト
      router.push(`/rooms/${data.room.id}`);
      
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
              <p>認証状態を確認中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>
              ルームを作成するにはログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth/signin')}>
              ログインページへ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>ルーム設定</CardTitle>
            <CardDescription>
              ゲームの設定を決めて、友達を招待しましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">ルーム名 *</label>
              <Input 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例: 夜の大喜利バトル"
                className="text-lg"
                required
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                他のプレイヤーに表示されるルーム名です
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ルームの説明（任意）</label>
              <Textarea 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="このルームについて簡単に説明してください..."
                className="min-h-20"
                maxLength={200}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">最大プレイヤー数</label>
                <Select value={formData.maxPlayers} onValueChange={(value) => handleInputChange('maxPlayers', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3人</SelectItem>
                    <SelectItem value="4">4人</SelectItem>
                    <SelectItem value="5">5人</SelectItem>
                    <SelectItem value="6">6人</SelectItem>
                    <SelectItem value="7">7人</SelectItem>
                    <SelectItem value="8">8人</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ラウンド数</label>
                <Select value={formData.totalRounds} onValueChange={(value) => handleInputChange('totalRounds', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3ラウンド</SelectItem>
                    <SelectItem value="5">5ラウンド</SelectItem>
                    <SelectItem value="7">7ラウンド</SelectItem>
                    <SelectItem value="10">10ラウンド</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">回答時間</label>
                <Select value={formData.answerTimeLimit} onValueChange={(value) => handleInputChange('answerTimeLimit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30秒</SelectItem>
                    <SelectItem value="60">1分</SelectItem>
                    <SelectItem value="90">1分30秒</SelectItem>
                    <SelectItem value="120">2分</SelectItem>
                    <SelectItem value="180">3分</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">投票時間</label>
                <Select value={formData.votingTimeLimit} onValueChange={(value) => handleInputChange('votingTimeLimit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15秒</SelectItem>
                    <SelectItem value="30">30秒</SelectItem>
                    <SelectItem value="45">45秒</SelectItem>
                    <SelectItem value="60">1分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">お題の難易度</label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-green-500 fill-current" />
                      初級 - 誰でも楽しめる
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-yellow-500 fill-current" />
                      中級 - ほどよい難しさ
                    </div>
                  </SelectItem>
                  <SelectItem value="hard">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-red-500 fill-current" />
                      上級 - チャレンジング
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="button"
                variant="outline" 
                className="flex-1"
                onClick={() => router.back()}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button 
                type="submit"
                className="flex-1"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? '作成中...' : 'ルームを作成'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* 作成後の流れ */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">ルーム作成後の流れ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center">1</div>
              <span>ルームコードが生成されます</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center">2</div>
              <span>友達にルームコードを共有</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold flex items-center justify-center">3</div>
              <span>全員が参加したらゲーム開始</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}