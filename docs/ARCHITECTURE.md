# 🏗️ Oogiri App - アーキテクチャ詳細解説

## 📋 目次
1. [アプリケーション概要](#概要)
2. [技術スタック](#技術スタック)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [WebSocket サーバーの仕組み](#websocket-サーバーの仕組み)
5. [データベース設計](#データベース設計)
6. [API 設計](#api-設計)
7. [認証システム](#認証システム)
8. [ゲームフロー](#ゲームフロー)
9. [セキュリティ・品質改善](#セキュリティ品質改善)
10. [実装されている機能](#実装されている機能)

---

## 🎯 概要

**Oogiri App** は、友達同士でリアルタイムに楽しめる大喜利ゲームアプリケーションです。

### 主な特徴
- **リアルタイムマルチプレイヤー**: WebSocketによる即座の同期
- **ルームベース**: 6文字コードでの簡単参加
- **匿名投票システム**: 公平な評価システム
- **累計スコア管理**: 複数ラウンドでの勝者決定

---

## 🛠️ 技術スタック

### フロントエンド
```typescript
- Next.js 15.3.5 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS
- Radix UI (UIコンポーネント)
- Lucide React (アイコン)
```

### バックエンド
```typescript
- Node.js カスタムサーバー (server.js)
- WebSocket Server (ws library)
- NextAuth.js (Google OAuth)
- Drizzle ORM
- PostgreSQL
```

### 開発ツール
```bash
- ESLint (Next.js config)
- PostCSS
- class-variance-authority
- Turbopack (高速開発ビルド)
```

---

## 📁 ディレクトリ構成

```
oogiri-app/
├── 📁 src/
│   ├── 📁 app/                  # Next.js App Router
│   │   ├── page.tsx            # ホームページ
│   │   ├── layout.tsx          # グローバルレイアウト
│   │   ├── globals.css         # グローバルスタイル
│   │   ├── 📁 api/             # API Routes
│   │   │   ├── 📁 auth/        # NextAuth設定
│   │   │   ├── 📁 rooms/       # ルーム管理API
│   │   │   ├── 📁 game/        # ゲーム進行API
│   │   │   └── seed/           # お題データシード
│   │   ├── 📁 auth/            # 認証ページ
│   │   ├── 📁 rooms/           # ルーム関連ページ
│   │   └── 📁 game/            # ゲーム画面
│   ├── 📁 components/          # Reactコンポーネント
│   │   ├── 📁 auth/            # 認証関連UI
│   │   ├── 📁 game/            # ゲーム関連UI
│   │   ├── 📁 rooms/           # ルーム関連UI
│   │   └── 📁 ui/              # 基本UIコンポーネント
│   └── 📁 lib/                 # ユーティリティ
│       ├── 📁 db/              # データベース設定
│       ├── 📁 types/           # 型定義
│       ├── auth.ts             # NextAuth設定
│       ├── config.ts           # 設定管理・定数
│       ├── validation.ts       # 入力検証・サニタイゼーション
│       ├── logger.ts           # 構造化ログシステム
│       ├── game-logic.ts       # ゲームエンジン
│       ├── websocket-client.ts # WebSocketクライアント
│       └── websocket-server.ts # WebSocketサーバー設定
├── 📄 server.js                # **カスタムサーバー (重要)**
├── 📄 package.json             # 依存関係とスクリプト
├── 📄 drizzle.config.ts        # DB設定
├── 📄 docker-compose.yml       # PostgreSQL開発環境
├── 📁 drizzle/                 # DBマイグレーション
└── 📁 docs/                    # ドキュメント
    ├── README.md               # ドキュメント目次
    ├── ARCHITECTURE.md         # アーキテクチャ詳細
    └── RENDER_DEPLOY.md        # デプロイガイド
```

---

## 🔌 WebSocket サーバーの仕組み

### **server.js の役割**

**server.js** は本番環境で使用される**カスタムサーバー**で、以下の重要な機能を提供します：

```javascript
// Next.js + WebSocket の統合サーバー
const next = require('next');
const { WebSocketServer } = require('ws');

// 1. Next.jsアプリケーションの起動
const app = next({ dev, hostname, port });

// 2. HTTPサーバーの作成
const server = createServer(async (req, res) => {
  await handle(req, res, parsedUrl);
});

// 3. WebSocketサーバーの統合
const wss = new WebSocketServer({ server });
```

### **なぜカスタムサーバーが必要？**

1. **Next.js単体の制限**: 
   - 通常のNext.jsは静的サイト・API Routesのみ
   - リアルタイム通信(WebSocket)には対応していない

2. **リアルタイムゲームの要件**:
   - プレイヤー間の即座な同期が必要
   - 状態変更の瞬時ブロードキャスト
   - 接続状態の管理

### **WebSocket メッセージ処理**

```javascript
// クライアント → サーバー
{
  type: 'join',           // ゲーム参加
  sessionId: 'abc123',    // ゲームセッションID
  userId: 'user456'       // ユーザーID
}

// サーバー → 全クライアント
{
  type: 'game_state',     // ゲーム状態更新
  sessionId: 'abc123',
  data: {
    phase: 'answering',   // 現在のフェーズ
    timeLeft: 30,         // 残り時間
    players: [...]        // プレイヤー一覧
  }
}
```

### **開発 vs 本番の違い**

```bash
# 開発環境
npm run dev              # Next.js開発サーバー (port 3000)
# + 別途WebSocketサーバー必要 (port 3001)

# 本番環境  
npm start               # server.js統合サーバー (port 3000)
# → Next.js + WebSocket が同一ポートで動作
```

---

## 🗄️ データベース設計

### **主要テーブル構成**

```sql
-- ユーザー管理
users (id, name, email, image, created_at)

-- ルーム管理
rooms (id, name, code, host_id, max_players, status)

-- ゲームセッション
game_sessions (id, room_id, current_round, total_rounds, status)

-- ラウンド管理
rounds (id, session_id, question_id, round_number, time_limit, status)

-- お題データ
questions (id, content, category, difficulty)

-- プレイヤー回答
answers (id, round_id, user_id, content, submitted_at)

-- 投票システム
votes (id, round_id, voter_id, answer_id, voted_at)

-- プレイヤーセッション
player_sessions (id, session_id, user_id, score, status)
```

### **ステータス管理**

```typescript
// ルームステータス
'waiting' | 'playing' | 'finished'

// ゲームセッションステータス  
'waiting' | 'question' | 'answering' | 'voting' | 'results' | 'finished'

// ラウンドステータス
'waiting' | 'active' | 'voting' | 'completed'

// プレイヤーステータス
'connected' | 'disconnected'
```

---

## 🔗 API 設計

### **REST API エンドポイント**

```typescript
// ルーム管理
POST   /api/rooms              // ルーム作成
GET    /api/rooms              // ルーム一覧
POST   /api/rooms/join         // ルーム参加
GET    /api/rooms/[roomId]     // ルーム詳細

// ゲーム管理
POST   /api/game/start         // ゲーム開始
POST   /api/game/answer        // 回答送信
POST   /api/game/vote          // 投票送信
GET    /api/game/[sessionId]   // ゲーム状態取得

// データ管理
POST   /api/seed               // お題データシード

// 認証
GET    /api/auth/*             // NextAuth endpoints
```

### **WebSocket イベント**

```typescript
// クライアント → サーバー
'join'    // ゲーム参加
'leave'   // ゲーム退出  
'answer'  // 回答送信
'vote'    // 投票送信

// サーバー → クライアント
'join'         // プレイヤー参加通知
'leave'        // プレイヤー退出通知
'game_state'   // ゲーム状態更新
'question'     // 新しいお題
'results'      // ラウンド結果
'error'        // エラー通知
```

---

## 🔐 認証システム

### **NextAuth.js + Google OAuth**

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, createTable),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
}
```

### **認証ガード**

```typescript
// ページレベル認証チェック
if (!session) {
  redirect('/auth/signin');
}

// APIレベル認証チェック
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 🎮 ゲームフロー

### **1. ルーム作成・参加**
```mermaid
ホスト → ルーム作成 → 6文字コード生成 → 友達に共有
友達   → コード入力 → ルーム参加 → 待機状態
```

### **2. ゲーム進行**
```mermaid
待機 → お題表示 → 回答入力 → 投票 → 結果表示 → 次ラウンド
```

### **3. 状態遷移**
```typescript
waiting     // 全員の準備待ち
↓
question    // お題表示 (5秒)
↓  
answering   // 回答入力 (60秒)
↓
voting      // 投票 (30秒)
↓
results     // 結果表示 (10秒)
↓
finished    // ゲーム終了 or 次ラウンド
```

---

## ✅ 実装されている機能

### **🎯 コア機能**
- ✅ Google OAuth ログイン
- ✅ ルーム作成・参加 (6文字コード)
- ✅ リアルタイム同期 (WebSocket)
- ✅ お題ランダム出題 (30+ 種類)
- ✅ 制限時間付き回答入力
- ✅ 匿名投票システム
- ✅ スコア計算・ランキング
- ✅ 複数ラウンド対応

### **🔧 技術機能**
- ✅ PostgreSQL データベース
- ✅ Drizzle ORM
- ✅ TypeScript 型安全性（any型完全除去）
- ✅ セキュリティ強化（入力検証・サニタイゼーション）
- ✅ 構造化ログシステム
- ✅ React パフォーマンス最適化
- ✅ 設定管理システム
- ✅ レスポンシブデザイン
- ✅ エラーハンドリング
- ✅ 再接続機能
- ✅ 本番デプロイ対応

### **🎨 UI/UX**
- ✅ モダンデザイン (Tailwind CSS)
- ✅ Radix UI コンポーネント
- ✅ ダークモード対応
- ✅ アニメーション
- ✅ ローディング状態
- ✅ エラー表示

---

## 🚀 開発・本番環境

### **開発環境**
```bash
# データベース起動
docker-compose up -d

# アプリケーション起動  
npm run dev              # Next.js (port 3000)
npm run ws:dev          # WebSocket (port 3001)

# または統合起動
npm run dev:full        # 両方同時起動
```

### **本番環境**
```bash
# ビルド
npm run build

# 本番サーバー起動 (Next.js + WebSocket統合)
npm start               # server.js (port 3000)
```

### **データベース操作**
```bash
# スキーマ適用
npm run db:push

# お題データシード
curl -X POST http://localhost:3000/api/seed
```

---

## 🔒 セキュリティ・品質改善

### **セキュリティ強化**

#### 入力検証・サニタイゼーション (`src/lib/validation.ts`)
```typescript
// UUID検証
export function isValidUUID(uuid: string): boolean

// 入力サニタイゼーション
export function validateAndSanitizeAnswer(content: string): string
export function validateAndSanitizeRoomName(name: string): string

// XSS・SQLインジェクション対策
- HTMLエスケープ処理
- 不正文字列パターン検出
- 数値パラメータ範囲チェック
```

#### API セキュリティ
```typescript
// 全APIエンドポイントで実装済み
- UUID形式検証
- 入力値サニタイゼーション
- パラメータ範囲チェック
- 認証状態確認
```

### **型安全性の向上**

#### WebSocket型定義 (`src/lib/types/websocket.ts`)
```typescript
// 厳密な型定義
export interface WebSocketMessage = 
  | JoinMessage 
  | LeaveMessage 
  | AnswerMessage 
  | VoteMessage 
  | GameStateMessage 
  | QuestionMessage 
  | ResultsMessage 
  | ErrorMessage;

// any型の完全除去
- WebSocketハンドラー全体で型安全性確保
- ランタイムエラー防止
- 開発時の型チェック強化
```

### **構造化ログシステム**

#### Logger実装 (`src/lib/logger.ts`)
```typescript
// 用途別ロガー
logger.api.request(method, path, userId, requestId)
logger.websocket.connection(clientId, sessionId, userId)
logger.game.sessionStart(sessionId, hostId, playerCount)

// 環境対応
- 開発環境: 読みやすい形式
- 本番環境: JSON形式
- 外部サービス連携準備済み
```

### **React パフォーマンス最適化**

#### 最適化コンポーネント (`src/components/game/optimized-game-room.tsx`)
```typescript
// メモ化によるパフォーマンス向上
const PlayerList = memo(({ players }) => { ... })
const PlayerCard = memo(({ player }) => { ... })

// 計算結果のキャッシュ
const sortedPlayers = useMemo(() => [...players].sort(...), [players])
const handlePlayerUpdate = useCallback((message) => { ... }, [])

// 不要な再レンダリング防止
- コンポーネント分割
- 依存配列の最適化
- 状態更新の最小化
```

### **設定管理システム**

#### 統合設定 (`src/lib/config.ts`)
```typescript
// 環境変数検証
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', ...]
if (missing.length > 0) throw new Error(...)

// ゲーム定数の一元管理
export const GAME_CONSTANTS = {
  ANSWER_MAX_LENGTH: 200,
  MAX_PLAYERS_PER_ROOM: 12,
  HEARTBEAT_INTERVAL: 10000,
  // ... 全定数を統合管理
}

// 型安全な設定アクセス
export const config = { ... } as const;
```

### **品質保証**

#### コード品質
- **ESLint**: 全ファイルでリンティングクリア
- **TypeScript**: strict mode、any型除去
- **型安全性**: 100%型定義済み

#### セキュリティレベル
- **入力検証**: 全APIエンドポイント
- **認証**: JWT + OAuth2.0
- **データ保護**: サニタイゼーション + エスケープ

---

## 🎉 まとめ

**Oogiri App** は以下の技術で構築された完全なリアルタイムマルチプレイヤーゲームです：

1. **フロントエンド**: Next.js 15 + React 19 + TypeScript
2. **バックエンド**: カスタムサーバー (server.js) + WebSocket
3. **データベース**: PostgreSQL + Drizzle ORM  
4. **認証**: NextAuth.js + Google OAuth
5. **リアルタイム**: WebSocket による即座の同期

**server.js** はアプリケーションの心臓部で、Next.jsとWebSocketを統合し、リアルタイムゲーム体験を実現しています。

デプロイ準備も完了しており、**Render.com** で月額7ドルから運用可能です！