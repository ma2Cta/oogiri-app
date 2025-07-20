import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserNav } from "@/components/auth/user-nav";
import { 
  MessageSquare, GamepadIcon, DoorOpen, Home as HomeIcon, Users, 
  Edit3, Trophy, Zap, FileText, Vote, BarChart3, 
  Key, Settings, Rocket, Eye, AlertTriangle, Database
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 開発中警告バナー */}
      <div className="bg-orange-500/10 border-b border-orange-200 dark:border-orange-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-4 text-orange-800 dark:text-orange-200">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">
              🚧 開発中のアプリケーションです
            </span>
            <span className="text-sm text-orange-700 dark:text-orange-300">•</span>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="text-sm">
                データベースが定期的にリセットされる可能性があります
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ヘッダー */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Oogiri App</h1>
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost" asChild>
                <Link href="/">ホーム</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/rooms">ルーム一覧</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/rooms/create">ルーム作成</Link>
              </Button>
            </nav>
            <UserNav />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-12">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              リアルタイムマルチプレイヤー大喜利
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              友達と楽しむ大喜利バトル
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              リアルタイムで友達と大喜利ゲーム！ルームを作成して最大8人で同時にプレイしよう。
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="px-8" asChild>
                <Link href="/rooms/create">
                  <GamepadIcon className="w-5 h-5 mr-2" />
                  ルームを作成
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8" asChild>
                <Link href="/rooms">
                  <DoorOpen className="w-5 h-5 mr-2" />
                  ルームに参加
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ゲームの流れ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">ゲームの流れ</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { 
                step: "1", 
                title: "ルーム作成", 
                description: "ルームを作成してコードを友達に共有",
                icon: HomeIcon
              },
              { 
                step: "2", 
                title: "みんなで参加", 
                description: "最大8人まで同時参加が可能",
                icon: Users
              },
              { 
                step: "3", 
                title: "回答・投票", 
                description: "お題に回答して、面白い回答に投票",
                icon: Edit3
              },
              { 
                step: "4", 
                title: "勝者決定", 
                description: "投票数に応じてポイント獲得",
                icon: Trophy
              }
            ].map((item, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-xs font-semibold text-blue-600 mb-2">STEP {item.step}</div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 機能紹介 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">主な機能</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                title: "リアルタイム同期", 
                description: "定期的な状態更新により、リアルタイムでゲーム状況が同期されます",
                icon: Zap,
                color: "from-yellow-400 to-orange-500"
              },
              { 
                title: "多様なお題", 
                description: "30種類以上のお題から、様々な難易度とカテゴリーを楽しめます",
                icon: FileText,
                color: "from-green-400 to-blue-500"
              },
              { 
                title: "匿名投票", 
                description: "誰の回答かわからない状態で投票するため、公平な評価が可能",
                icon: Vote,
                color: "from-purple-400 to-pink-500"
              },
              { 
                title: "スコア管理", 
                description: "ラウンドごとの得票数でスコアが計算され、最終勝者が決定されます",
                icon: BarChart3,
                color: "from-blue-400 to-purple-500"
              },
              { 
                title: "簡単参加", 
                description: "6文字のルームコードで簡単に友達のルームに参加できます",
                icon: Key,
                color: "from-red-400 to-yellow-500"
              },
              { 
                title: "カスタマイズ", 
                description: "プレイヤー数、ラウンド数、制限時間など細かく設定可能",
                icon: Settings,
                color: "from-indigo-400 to-purple-500"
              }
            ].map((feature, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* サンプルお題 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">サンプルお題</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                question: "もしもAIが感情を持ったら最初に言いそうなこと",
                category: "AI・テクノロジー",
                difficulty: "medium"
              },
              { 
                question: "猫と犬が合体したペットの困った特徴",
                category: "動物",
                difficulty: "easy"
              },
              { 
                question: "もしも重力の向きを自由に変えられたら起こりそうな事故",
                category: "物理・科学",
                difficulty: "hard"
              }
            ].map((item, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant={
                      item.difficulty === 'easy' ? 'secondary' : 
                      item.difficulty === 'medium' ? 'default' : 'destructive'
                    }>
                      {item.difficulty === 'easy' ? '初級' :
                       item.difficulty === 'medium' ? '中級' : '上級'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium leading-relaxed">
                    &ldquo;{item.question}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA セクション */}
        <section className="mb-16">
          <Card className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200">
            <CardContent className="pt-12 pb-12">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">今すぐ友達と大喜利バトル！</h2>
              <p className="text-xl text-muted-foreground mb-8">
                無料でプレイ開始。Google アカウントでログインするだけ。
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" className="px-8" asChild>
                  <Link href="/auth/signin">
                    <Rocket className="w-5 h-5 mr-2" />
                    今すぐ始める
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <Link href="/rooms">
                    <Eye className="w-5 h-5 mr-2" />
                    ルームを見る
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>


      </main>
    </div>
  );
}