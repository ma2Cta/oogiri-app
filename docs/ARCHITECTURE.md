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
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── page.tsx                # ホームページ
│   │   ├── layout.tsx              # グローバルレイアウト
│   │   ├── globals.css             # グローバルスタイル
│   │   ├── favicon.ico             # ファビコン
│   │   ├── 📁 api/                 # API Routes
│   │   │   ├── 📁 auth/            # NextAuth設定・本番対応
│   │   │   │   └── [...nextauth]/  # NextAuth認証エンドポイント
│   │   │   ├── 📁 rooms/           # ルーム管理API
│   │   │   │   ├── route.ts        # ルーム作成・一覧
│   │   │   │   ├── join/route.ts   # ルーム参加
│   │   │   │   └── [roomId]/       # 個別ルーム操作
│   │   │   ├── 📁 game/            # ゲーム進行API
│   │   │   │   └── [sessionId]/    # セッション別操作
│   │   │   │       ├── route.ts    # ゲーム状態取得
│   │   │   │       ├── start/      # ゲーム開始
│   │   │   │       ├── answer/     # 回答送信
│   │   │   │       ├── vote/       # 投票送信
│   │   │   │       ├── phase/      # フェーズ切り替え
│   │   │   │       └── next-round/ # 次ラウンド
│   │   │   └── 📁 questions/       # お題管理
│   │   │       └── seed/           # お題データシード
│   │   ├── 📁 actions/             # サーバーアクション
│   │   │   └── auth.ts             # 認証関連アクション (本番対応)
│   │   ├── 📁 auth/                # 認証ページ
│   │   │   └── signin/             # サインインページ
│   │   ├── 📁 rooms/               # ルーム関連ページ
│   │   │   ├── page.tsx            # ルーム一覧
│   │   │   ├── create/             # ルーム作成
│   │   │   └── [roomId]/           # ルーム詳細
│   │   ├── 📁 game/                # ゲーム画面
│   │   │   └── [sessionId]/        # ゲームセッション
│   │   ├── 📁 terms/               # 利用規約
│   │   └── 📁 privacy/             # プライバシーポリシー
│   ├── 📁 components/              # Reactコンポーネント
│   │   ├── 📁 auth/                # 認証関連UI
│   │   │   ├── auth-provider.tsx   # 認証プロバイダー
│   │   │   ├── signin-button.tsx   # 開発環境用サインインボタン
│   │   │   ├── signout-button.tsx  # 開発環境用サインアウトボタン
│   │   │   ├── production-signin-button.tsx # 本番環境用サーバーアクションボタン
│   │   │   ├── adaptive-signin-button.tsx # 環境適応型サインインボタン
│   │   │   └── user-nav.tsx        # ユーザーナビゲーション
│   │   ├── 📁 game/                # ゲーム関連UI
│   │   │   ├── game-room.tsx       # ゲームルーム (基本版)
│   │   │   ├── optimized-game-room.tsx # 最適化版ゲームルーム
│   │   │   └── real-game-room.tsx  # リアルタイム版ゲームルーム
│   │   ├── 📁 rooms/               # ルーム関連UI
│   │   │   ├── create-room-form.tsx # ルーム作成フォーム
│   │   │   └── room-detail.tsx     # ルーム詳細
│   │   ├── 📁 layout/              # レイアウト関連
│   │   │   └── footer.tsx          # フッター
│   │   └── 📁 ui/                  # 基本UIコンポーネント (Radix UI)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── textarea.tsx
│   │       ├── badge.tsx
│   │       └── progress.tsx
│   ├── 📁 lib/                     # ユーティリティ・ライブラリ
│   │   ├── 📁 db/                  # データベース関連
│   │   │   ├── index.ts            # DB接続・設定
│   │   │   ├── schema.ts           # Drizzleスキーマ定義
│   │   │   └── seed.ts             # データシード
│   │   ├── 📁 types/               # 型定義
│   │   │   └── websocket.ts        # WebSocket型定義 (any型除去済み)
│   │   ├── auth.ts                 # NextAuth設定
│   │   ├── auth-server.ts          # NextAuth v4 サーバー設定 (本番対応)
│   │   ├── auth-utils.ts           # 認証関連ユーティリティ関数
│   │   ├── config.ts               # 設定管理・環境変数・定数
│   │   ├── validation.ts           # 入力検証・サニタイゼーション
│   │   ├── logger.ts               # 構造化ログシステム
│   │   ├── game-logic.ts           # ゲームエンジン・ロジック
│   │   ├── room-utils.ts           # ルーム関連ユーティリティ
│   │   ├── sample-questions.ts     # サンプルお題データ
│   │   ├── seed-questions.ts       # お題シードユーティリティ
│   │   ├── utils.ts                # 汎用ユーティリティ
│   │   ├── websocket-client.ts     # WebSocketクライアント
│   │   ├── websocket-server.ts     # WebSocketサーバー設定
│   │   └── websocket-integrated.ts # WebSocket統合ライブラリ
│   └── middleware.ts               # Next.js ミドルウェア (Basic認証)
├── 📄 server.js                    # **カスタムサーバー (本番用 WebSocket統合)**
├── 📄 package.json                 # 依存関係とスクリプト
├── 📄 next.config.ts               # Next.js設定
├── 📄 drizzle.config.ts            # Drizzle ORM設定
├── 📄 docker-compose.yml           # PostgreSQL開発環境
├── 📄 tailwind.config.ts           # Tailwind CSS設定
├── 📄 postcss.config.mjs           # PostCSS設定
├── 📁 drizzle/                     # DBマイグレーション
├── 📁 docs/                        # プロジェクトドキュメント
│   ├── README.md                   # ドキュメント目次
│   ├── ARCHITECTURE.md             # アーキテクチャ詳細 (このファイル)
│   ├── DEPLOYMENT.md               # デプロイガイド (Render.com推奨)
│   └── RENDER_DEPLOY.md            # Render.com詳細デプロイガイド
├── 📄 render.yaml                  # Render.com デプロイ設定
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

### **Drizzle ORM スキーマ構成**

データベーススキーマは `src/lib/db/schema.ts` で定義され、以下のテーブルで構成されています:

#### **認証関連テーブル (NextAuth.js)**
```typescript
// ユーザー
users: {
  id: text (Primary Key)           // NextAuth用文字列ID
  name: text                       // ユーザー名
  email: text (Not Null)          // メールアドレス
  emailVerified: timestamp         // メール認証日時
  image: text                      // プロフィール画像URL
  createdAt, updatedAt: timestamp  // 作成・更新日時
}

// OAuth アカウント
accounts: {
  userId: text (Foreign Key → users.id)
  type: text                       // OAuth2.0
  provider: text                   // google
  providerAccountId: text          // Google Account ID
  refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
}

// セッション管理
sessions: {
  sessionToken: text (Primary Key)
  userId: text (Foreign Key → users.id)
  expires: timestamp
}

// メール認証トークン
verificationTokens: {
  identifier: text
  token: text
  expires: timestamp
}
```

#### **ゲーム関連テーブル**
```typescript
// ルーム
rooms: {
  id: uuid (Primary Key, Auto-generated)
  name: text (Not Null)            // ルーム名
  code: text (Unique, Not Null)    // 6文字参加コード
  hostId: text (Foreign Key → users.id)
  maxPlayers: integer (Default: 8) // 最大参加者数
  status: roomStatusEnum (Default: 'waiting')
  createdAt, updatedAt: timestamp
}

// ゲームセッション
gameSessions: {
  id: uuid (Primary Key, Auto-generated)
  roomId: uuid (Foreign Key → rooms.id)
  currentRound: integer (Default: 0)
  totalRounds: integer (Default: 5)
  status: sessionStatusEnum (Default: 'waiting')
  startedAt, endedAt: timestamp
}

// お題
questions: {
  id: uuid (Primary Key, Auto-generated)
  content: text (Not Null)         // お題内容
  category: text (Not Null)        // カテゴリー
  difficulty: difficultyEnum (Default: 'medium')
  createdAt: timestamp
}

// ラウンド
rounds: {
  id: uuid (Primary Key, Auto-generated)
  sessionId: uuid (Foreign Key → gameSessions.id)
  questionId: uuid (Foreign Key → questions.id)
  roundNumber: integer (Not Null)
  timeLimit: integer (Default: 60) // 制限時間(秒)
  status: roundStatusEnum (Default: 'waiting')
  startedAt, endedAt: timestamp
}

// 回答
answers: {
  id: uuid (Primary Key, Auto-generated)
  roundId: uuid (Foreign Key → rounds.id)
  userId: text (Foreign Key → users.id)
  content: text (Not Null)         // 回答内容
  submittedAt: timestamp (Default: now())
}

// 投票
votes: {
  id: uuid (Primary Key, Auto-generated)
  roundId: uuid (Foreign Key → rounds.id)
  voterId: text (Foreign Key → users.id)
  answerId: uuid (Foreign Key → answers.id)
  votedAt: timestamp (Default: now())
}

// プレイヤーセッション
playerSessions: {
  id: uuid (Primary Key, Auto-generated)
  sessionId: uuid (Foreign Key → gameSessions.id)
  userId: text (Foreign Key → users.id)
  score: integer (Default: 0)      // 累計スコア
  status: playerStatusEnum (Default: 'connected')
  joinedAt: timestamp (Default: now())
  leftAt: timestamp
}

// ルームメンバー
roomMembers: {
  id: uuid (Primary Key, Auto-generated)
  roomId: uuid (Foreign Key → rooms.id)
  userId: text (Foreign Key → users.id)
  joinedAt: timestamp (Default: now())
}
```

#### **ENUM定義**
```typescript
roomStatusEnum: 'waiting' | 'playing' | 'finished'
sessionStatusEnum: 'waiting' | 'question' | 'answering' | 'voting' | 'results' | 'finished'
roundStatusEnum: 'waiting' | 'active' | 'voting' | 'completed'
playerStatusEnum: 'connected' | 'disconnected'
difficultyEnum: 'easy' | 'medium' | 'hard'
```

#### **外部キー制約とカスケード**
- すべての外部キー参照に `onDelete: 'cascade'` を設定
- ユーザー削除時、関連データも自動削除
- ルーム削除時、ゲームセッション・ラウンド・回答・投票も削除

---

## 🔗 API 設計

### **REST API エンドポイント**

```typescript
// 認証 (NextAuth.js)
GET/POST /api/auth/[...nextauth]   // OAuth認証フロー
POST     /api/auth/401             // Basic認証失敗時のエラーページ

// ルーム管理
POST     /api/rooms               // ルーム作成
GET      /api/rooms               // ルーム一覧取得
POST     /api/rooms/join          // コードでルーム参加
GET      /api/rooms/[roomId]      // ルーム詳細取得  
POST     /api/rooms/[roomId]/join // 直接ルーム参加

// ゲーム管理 (セッション別)
GET      /api/game/[sessionId]           // ゲーム状態取得
POST     /api/game/[sessionId]/start     // ゲーム開始
POST     /api/game/[sessionId]/answer    // 回答送信
POST     /api/game/[sessionId]/vote      // 投票送信
PUT      /api/game/[sessionId]/phase     // フェーズ切り替え
POST     /api/game/[sessionId]/next-round // 次ラウンド開始

// お題管理
POST     /api/questions/seed            // お題データシード
```

### **API レスポンス例**

#### ゲーム状態取得 (`GET /api/game/[sessionId]`)
```typescript
{
  session: {
    id: string,
    status: 'waiting' | 'question' | 'answering' | 'voting' | 'results' | 'finished',
    currentRound: number,
    totalRounds: number
  },
  currentRound?: {
    id: string,
    roundNumber: number,
    timeLimit: number,
    status: string,
    question: {
      id: string,
      content: string,
      category: string
    }
  },
  players: Array<{
    id: string,
    name: string,
    score: number,
    hasAnswered: boolean,
    hasVoted: boolean,
    status: 'connected' | 'disconnected'
  }>,
  answers?: Array<{
    id: string,
    content: string,
    userId: string,
    votes?: number
  }>,
  results?: {
    winner: { userId: string, answerId: string, votes: number },
    scores: Array<{ userId: string, username: string, score: number, rank: number }>
  }
}
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
// src/lib/auth.ts - 認証設定
export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
  },
};

// src/lib/auth-server.ts - NextAuth v4 サーバー設定
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### **環境適応型認証システム (本番環境対応)**

```typescript
// src/lib/auth-utils.ts - 共通ユーティリティ
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const getAuthRedirectUrl = (provider: string, callbackUrl = '/') => 
  `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;

// src/app/actions/auth.ts - エラーハンドリング対応サーバーアクション
export async function signInWithGoogle() {
  try {
    if (isProduction()) {
      const redirectUrl = getAuthRedirectUrl('google', '/');
      redirect(redirectUrl);
    } else {
      throw new Error('DEV_ENV_CLIENT_AUTH_REQUIRED');
    }
  } catch (error) {
    logAuthError('signInWithGoogle', error);
    throw new Error('Authentication failed. Please try again.');
  }
}

// src/components/auth/adaptive-signin-button.tsx - 環境判定
export function AdaptiveSignInButton() {
  if (isProduction()) {
    return <ProductionSignInButton />; // サーバーアクション
  } else {
    return <SignInButton />; // クライアントサイド認証
  }
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
- ✅ Google OAuth ログイン (NextAuth.js)
- ✅ ルーム作成・参加 (6文字コード)
- ✅ リアルタイム同期 (WebSocket + カスタムサーバー)
- ✅ お題ランダム出題システム
- ✅ 制限時間付き回答入力 (60秒)
- ✅ 匿名投票システム (30秒)
- ✅ スコア計算・ランキング
- ✅ 複数ラウンド対応 (最大20ラウンド)
- ✅ プレイヤー状態管理 (接続/切断)
- ✅ ゲームフェーズ管理 (waiting→question→answering→voting→results)

### **🔧 技術機能**
- ✅ PostgreSQL データベース (Drizzle ORM)
- ✅ 完全TypeScript型安全性 (any型完全除去)
- ✅ セキュリティ強化機能:
  - ✅ 入力検証・サニタイゼーション (`src/lib/validation.ts`)
  - ✅ UUID形式検証
  - ✅ XSS・SQLインジェクション対策
  - ✅ Basic認証対応 (本番環境アクセス制限)
- ✅ 構造化ログシステム (`src/lib/logger.ts`)
  - ✅ API/WebSocket/ゲーム専用ロガー
  - ✅ 環境別出力形式 (開発/本番)
  - ✅ 外部サービス連携準備
- ✅ 設定管理システム (`src/lib/config.ts`)
  - ✅ 環境変数検証
  - ✅ ゲーム定数の一元管理
  - ✅ 型安全な設定アクセス
- ✅ React パフォーマンス最適化
  - ✅ memo(), useMemo(), useCallback()
  - ✅ 不要な再レンダリング防止
- ✅ WebSocket型定義 (`src/lib/types/websocket.ts`)
  - ✅ 厳密なメッセージ型定義
  - ✅ Union型による型安全性
- ✅ リアルタイム機能
  - ✅ 自動再接続機能
  - ✅ ハートビート監視
  - ✅ 接続タイムアウト処理
- ✅ 本番デプロイ対応 (Render.com)

### **🎨 UI/UX**
- ✅ モダンデザイン (Tailwind CSS v4)
- ✅ Radix UI コンポーネント
- ✅ レスポンシブデザイン
- ✅ ローディング状態・エラー表示
- ✅ ゲーム状態の視覚的フィードバック
- ✅ プログレスバー・タイマー表示

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
// UUID形式検証
export function isValidUUID(uuid: string): boolean
export function isValidRoomCode(code: string): boolean

// 入力サニタイゼーション
export function validateAndSanitizeAnswer(content: string): string
export function validateAndSanitizeRoomName(name: string): string
export function sanitizeText(input: string): string

// XSS・SQLインジェクション対策
- HTMLエスケープ処理 (<, >, ", ', /)
- 不正文字列パターン検出 (script, javascript:, on*=, data:, vbscript:)
- 数値パラメータ範囲チェック
- 文字数制限チェック (回答200文字、ルーム名50文字)
```

#### Basic認証・アクセス制限 (`src/middleware.ts`)
```typescript
// 本番環境でのBasic認証
- 環境変数 BASIC_AUTH_ENABLED=true で有効化
- 未認証時は /api/auth/401 にリダイレクト
- 開発環境では認証スキップ

// 環境変数
BASIC_AUTH_USER=your_username
BASIC_AUTH_PASSWORD=your_password
```

#### API セキュリティ
```typescript
// 全APIエンドポイントで実装済み
- NextAuth.js セッション検証
- UUID形式検証
- 入力値サニタイゼーション
- パラメータ範囲チェック
- 認証状態確認
- SQLインジェクション防止 (Drizzle ORM使用)
```

### **型安全性の向上**

#### WebSocket型定義 (`src/lib/types/websocket.ts`)
```typescript
// Union型による厳密なメッセージ型定義
export type WebSocketMessage = 
  | JoinMessage 
  | LeaveMessage 
  | AnswerMessage 
  | VoteMessage 
  | GameStateMessage 
  | QuestionMessage 
  | ResultsMessage 
  | ScoreUpdateMessage
  | ErrorMessage;

// 具体的なメッセージインターface
export interface GameStateMessage extends Omit<GameMessage, 'type'> {
  type: 'game_state';
  data: {
    phase: GamePhase;
    timeLeft?: number;
    players: GamePlayer[];
    currentRound?: number;
    totalRounds?: number;
  };
}

// any型の完全除去
- WebSocketハンドラー全体で型安全性確保
- ランタイムエラー防止
- 開発時の型チェック強化
- 接続クライアント・イベントハンドラーも型定義済み
```

### **構造化ログシステム**

#### Logger実装 (`src/lib/logger.ts`)
```typescript
// 用途別専用ロガー
logger.api.request(method, path, userId, requestId)
logger.api.response(method, path, status, duration, userId, requestId)
logger.websocket.connection(clientId, sessionId, userId)
logger.websocket.broadcast(type, sessionId, recipientCount)
logger.game.sessionStart(sessionId, hostId, playerCount)
logger.game.roundStart(sessionId, round, questionId)

// 環境別出力形式
- 開発環境: 読みやすいカラー形式
- 本番環境: JSON形式（外部サービス連携対応）
- デバッグログは開発環境のみ出力

// コンテキスト付きロガー
const contextLogger = logger.withContext({ sessionId, userId });
contextLogger.info('Action performed');
```

### **React パフォーマンス最適化**

#### 最適化コンポーネント (`src/components/game/optimized-game-room.tsx`)
```typescript
// メモ化によるパフォーマンス向上
const PlayerList = memo(({ players }: { players: GamePlayer[] }) => { ... })
const PlayerCard = memo(({ player }: { player: GamePlayer }) => { ... })

// 計算結果のキャッシュ
const sortedPlayers = useMemo(
  () => [...players].sort((a, b) => b.score - a.score), 
  [players]
)

// イベントハンドラーの最適化
const handlePlayerUpdate = useCallback((message: GameStateMessage) => {
  // 最適化された状態更新ロジック
}, [])

// 不要な再レンダリング防止戦略
- コンポーネント分割（関心の分離）
- 依存配列の最適化（必要最小限の依存）
- 状態更新の最小化（差分更新）
```

### **設定管理システム**

#### 統合設定 (`src/lib/config.ts`)
```typescript
// 環境変数検証（本番環境起動時）
const requiredEnvVars = [
  'DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'
] as const;

if (process.env.NODE_ENV === 'production') {
  validateEnvironment(); // 不足時はエラーで停止
}

// ゲーム定数の一元管理
export const GAME_CONSTANTS = {
  ANSWER_MAX_LENGTH: 200,
  ROOM_CODE_LENGTH: 6,
  MAX_PLAYERS_PER_ROOM: 12,
  MAX_ROUNDS: 20,
  HEARTBEAT_INTERVAL: 10000,
  CONNECTION_TIMEOUT: 30000,
  // ... 全定数を統合管理
} as const;

// 型安全な設定アクセス
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  databaseUrl: process.env.DATABASE_URL!,
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3001'),
  // ...
} as const;

// 型ガード関数
export function isValidGamePhase(phase: string): phase is GamePhase
export function isValidRoomStatus(status: string): status is RoomStatus
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