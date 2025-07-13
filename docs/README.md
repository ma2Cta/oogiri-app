# 📚 Oogiri App - ドキュメント

このディレクトリには、Oogiri Appのドキュメンテーションファイルが含まれています。

## 📋 ドキュメント一覧

### 🏗️ アーキテクチャ・技術仕様
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - アプリケーションの詳細なアーキテクチャ解説
  - 技術スタック
  - ディレクトリ構成
  - WebSocketサーバーの仕組み
  - データベース設計
  - API設計
  - ゲームフロー

### 🚀 デプロイメント
- **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)** - Render.com デプロイガイド（推奨）
  - WebSocket対応の安定したデプロイ手順
  - 環境変数設定
  - Google OAuth設定
  - 月額7ドルでの運用方法

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - その他のデプロイオプション
  - Railway、Fly.io等の比較
  - 各プラットフォームの特徴

### ⚙️ 設定ファイル
- **[Procfile](./Procfile)** - Heroku用設定
- **[railway.json](./railway.json)** - Railway用設定

## 🎯 クイックスタート

1. **アーキテクチャを理解したい** → [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **本番環境にデプロイしたい** → [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
3. **WebSocketの仕組みを知りたい** → [ARCHITECTURE.md#websocket-サーバーの仕組み](./ARCHITECTURE.md#websocket-サーバーの仕組み)

## 📖 関連ドキュメント

プロジェクトルートの以下のファイルも参照してください：

- **[../CLAUDE.md](../CLAUDE.md)** - Claude Code向けプロジェクト指示書
- **[../README.md](../README.md)** - プロジェクトREADME
- **[../package.json](../package.json)** - 依存関係とスクリプト