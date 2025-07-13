# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## アプリケーション概要

**oogiri-app** は友達同士で楽しめるリアルタイムマルチプレイヤー大喜利ゲームアプリケーションです。

### ゲームフロー
1. 友達と同時にセッションを開始
2. お題がランダムに出題
3. 全員が回答を完了
4. 一斉に回答を表示
5. 投票を行い、一番投票が集まった回答が勝者
6. 複数ラウンドを繰り返してセッションの最終勝者を決定

### 主要機能
- **リアルタイム同期**: 複数プレイヤーの同時参加とリアルタイム更新
- **お題管理**: ランダムなお題の出題システム
- **回答システム**: 制限時間内での回答入力
- **投票システム**: 匿名での回答評価
- **スコア管理**: ラウンドおよびセッション全体の勝敗記録

## 開発コマンド

- **開発サーバー起動**: `npm run dev` (Turbopackを使用して高速ビルド)
- **本番用ビルド**: `npm run build`
- **本番サーバー起動**: `npm start`
- **コードの静的解析**: `npm run lint`

## プロジェクト構成

これはNext.js 15アプリケーションで、App RouterアーキテクチャとReact 19、TypeScriptを使用しています。

### 主な構造
- **App Router**: `src/app/` ディレクトリ構造を使用
- **TypeScript**: パスエイリアス設定 (`@/*` → `./src/*`)
- **スタイリング**: Tailwind CSS v4とPostCSS
- **フォント**: Google FontsのGeist SansとGeist Monoを使用

### 技術スタック
- **フロントエンド**
  - Next.js 15.3.5（開発時はTurbopack使用）
  - React 19
  - TypeScript 5
  - Tailwind CSS
  - Radix UI（UIコンポーネント）
  - Lucide React（アイコン）

- **バックエンド・データベース**
  - Drizzle ORM
  - PostgreSQL
  - NextAuth.js（認証）

- **開発ツール**
  - ESLint with Next.js config
  - PostCSS
  - class-variance-authority（スタイリング）
  - clsx & tailwind-merge（クラス管理）

### リアルタイム通信の検討事項
リアルタイムマルチプレイヤー機能には以下の技術を検討：
- WebSocket (Socket.io)
- Server-Sent Events (SSE)
- Pusher/Ably等のリアルタイムサービス
- Vercel等のサーバーレス環境での制約を考慮

### ファイル構成
詳細なアーキテクチャについては、[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) を参照してください。

- `src/app/layout.tsx`: フォント設定とメタデータを含むルートレイアウト
- `src/app/page.tsx`: ホームページコンポーネント
- `src/app/globals.css`: グローバルスタイル
- `server.js`: **本番用カスタムサーバー (Next.js + WebSocket統合)**
- `@/*` インポートが `src/*` を指すパスエイリアス設定

## アプリケーション設計

### ページ構成
```
/ (ホーム)
├── /auth/signin (ログイン)
├── /rooms
│   ├── /create (ルーム作成)
│   └── /[roomId] (ゲームルーム)
├── /game/[sessionId] (ゲーム画面)
└── /api
    ├── /auth/* (NextAuth)
    ├── /rooms/* (ルーム管理)
    └── /game/* (ゲーム進行)
```

### 主要コンポーネント
- **GameRoom**: ゲーム進行の統括コンポーネント
- **QuestionDisplay**: お題表示
- **AnswerInput**: 回答入力フォーム
- **AnswersList**: 回答一覧と投票
- **ScoreBoard**: スコア表示
- **PlayerList**: 参加者一覧
- **Timer**: 制限時間表示

### 状態管理
- **ゲーム状態**: waiting → question → answering → voting → results
- **プレイヤー管理**: 参加者の接続状態とスコア
- **リアルタイム同期**: 全プレイヤーの状態を同期

## データベース設計

### 主要テーブル

#### users (ユーザー)
- id (UUID, Primary Key)
- name (VARCHAR, ユーザー名)
- email (VARCHAR, メールアドレス)
- image (VARCHAR, プロフィール画像URL)
- created_at, updated_at

#### rooms (ルーム)
- id (UUID, Primary Key)
- name (VARCHAR, ルーム名)
- code (VARCHAR, 参加コード)
- host_id (UUID, Foreign Key → users.id)
- max_players (INTEGER, 最大参加者数)
- status (ENUM: waiting, playing, finished)
- created_at, updated_at

#### game_sessions (ゲームセッション)
- id (UUID, Primary Key)
- room_id (UUID, Foreign Key → rooms.id)
- current_round (INTEGER, 現在のラウンド)
- total_rounds (INTEGER, 総ラウンド数)
- status (ENUM: waiting, question, answering, voting, results, finished)
- started_at, ended_at

#### questions (お題)
- id (UUID, Primary Key)
- content (TEXT, お題内容)
- category (VARCHAR, カテゴリー)
- difficulty (ENUM: easy, medium, hard)
- created_at

#### rounds (ラウンド)
- id (UUID, Primary Key)
- session_id (UUID, Foreign Key → game_sessions.id)
- question_id (UUID, Foreign Key → questions.id)
- round_number (INTEGER)
- time_limit (INTEGER, 制限時間秒)
- status (ENUM: waiting, active, voting, completed)
- started_at, ended_at

#### answers (回答)
- id (UUID, Primary Key)
- round_id (UUID, Foreign Key → rounds.id)
- user_id (UUID, Foreign Key → users.id)
- content (TEXT, 回答内容)
- submitted_at

#### votes (投票)
- id (UUID, Primary Key)
- round_id (UUID, Foreign Key → rounds.id)
- voter_id (UUID, Foreign Key → users.id)
- answer_id (UUID, Foreign Key → answers.id)
- voted_at

#### player_sessions (プレイヤーセッション)
- id (UUID, Primary Key)
- session_id (UUID, Foreign Key → game_sessions.id)
- user_id (UUID, Foreign Key → users.id)
- score (INTEGER, 累計スコア)
- status (ENUM: connected, disconnected)
- joined_at, left_at

### 開発メモ
- 開発サーバーは http://localhost:3000 で実行
- App Routerのファイルベースルーティングを使用
- 高速開発ビルドのためTurbopackが有効
- TypeScriptストリクトモードが有効

## 重要な指示・リマインダー

### 開発サーバーについて
別プロセスで開発サーバーは起動しておくため、基本的には開発サーバーは起動している前提で操作を行うこと。

### ドキュメント更新の必須ルール
**技術的な変更を行った場合は、必ず該当するドキュメントを同時に更新すること。**

#### 更新対象と更新内容：

1. **新しいファイル追加時**
   - `docs/ARCHITECTURE.md` のディレクトリ構成を更新
   - ファイルの目的・役割を説明に追加

2. **アーキテクチャ変更時**
   - `docs/ARCHITECTURE.md` の該当セクションを更新
   - 変更理由・影響範囲・メリットを記載

3. **機能追加・改善時**
   - `docs/ARCHITECTURE.md` の「実装されている機能」セクションを更新
   - 新機能の詳細説明を該当セクションに追加

4. **技術スタック変更時**
   - `docs/ARCHITECTURE.md` の「技術スタック」セクションを更新
   - `CLAUDE.md` の「最新の技術スタック」セクションを更新

5. **設定・環境変更時**
   - 新しい環境変数や設定項目があれば記載
   - 開発手順に変更があれば更新

#### 更新タイミング：
- コード変更と同一のコミット内で実行
- 変更完了後、必ずドキュメントの整合性を確認
- ユーザーから「ドキュメントに反映されているか」確認される前に実行

#### 更新漏れ防止：
このルールに従わない場合、ユーザーから再度確認・修正を求められるため、**変更作業の一環として必ず実行する**こと。

## 最新の技術スタック（更新済み）

### セキュリティ・品質改善
- **入力検証**: `src/lib/validation.ts` - UUID検証、サニタイゼーション
- **型安全性**: `src/lib/types/websocket.ts` - any型完全除去
- **構造化ログ**: `src/lib/logger.ts` - 環境別ログ出力
- **設定管理**: `src/lib/config.ts` - 定数・環境変数の一元管理
- **React最適化**: memo(), useMemo(), useCallback()による最適化済み