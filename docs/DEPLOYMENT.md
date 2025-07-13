# 🚀 Oogiri App デプロイガイド

## 推奨デプロイ環境: Render

### 💰 コスト目安
- **Render Web Service**: 無料プラン利用可能
- **PostgreSQL**: 月額 $7（本番環境推奨）
- **WebSocket**: 完全対応

## 🛠️ デプロイ手順

### 1. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. OAuth 2.0 認証情報を作成:
   ```
   承認済みのリダイレクト URI:
   https://your-app.onrender.com/api/auth/callback/google
   ```
3. `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を取得

### 2. Render デプロイ

1. [Render](https://render.com/) アカウント作成
2. GitHub リポジトリを接続
3. `render.yaml` ファイルで自動デプロイ設定
4. PostgreSQL データベースを作成
5. 環境変数をダッシュボードで設定:

```bash
# 必須環境変数（Renderダッシュボードで設定）
DATABASE_URL=          # Render が自動設定
NEXTAUTH_URL=          # https://your-app.onrender.com
NEXTAUTH_SECRET=       # ランダムな文字列（自動生成）
GOOGLE_CLIENT_ID=      # Google Console から
GOOGLE_CLIENT_SECRET=  # Google Console から
WEBSOCKET_URL=         # https://your-app.onrender.com
```

### 3. データベース初期化

```bash
# ローカルでRenderのDBに接続してシード実行
npm run seed:prod
```

### 4. WebSocket設定

Render では追加設定なしでWebSocketが動作します。

## 🔧 代替デプロイ環境

### Railway

1. **アプリ**: 月額 $5-10（小規模利用）
2. **PostgreSQL**: 含まれる
3. WebSocket対応

### Fly.io

1. **アプリ** ($5-10/月)
2. **PostgreSQL** ($1-5/月)
3. Docker ベース

## 📋 デプロイ前チェックリスト

- [ ] Google OAuth 認証情報取得
- [ ] 環境変数設定
- [ ] データベース接続確認
- [ ] WebSocket動作確認
- [ ] お題データシード

## 🐛 トラブルシューティング

### WebSocket接続エラー
```javascript
// src/lib/websocket-client.ts で URL を環境に応じて変更
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://your-app.onrender.com' 
  : 'ws://localhost:3001';
```

### データベース接続エラー
```bash
# Render でログを確認
render logs

# ローカルから接続確認
npm run db:push
```

### Google OAuth エラー
- リダイレクトURIが正しく設定されているか確認
- 本番ドメインがGoogle Consoleに登録されているか確認

## 💡 コスト最適化

1. **Render**: 無料プランで開始可能、本番では$7/月のPro推奨
2. **データベース**: PostgreSQL $7/月（512MB）
3. **WebSocket**: 標準対応で追加料金なし

## 📈 スケーリング

- Render は手動・自動スケーリング対応
- トラフィック増加時はインスタンス数を調整可能
- PostgreSQL プランのアップグレードでリソース増強

## 🔒 セキュリティ

- HTTPS/WSS 自動対応
- 環境変数による秘密情報管理
- OAuth2 によるセキュアな認証

## 🎯 本番運用

```bash
# ログ監視
render logs --follow

# パフォーマンス監視
# Renderダッシュボードでメトリクス確認

# データベースバックアップ（自動）
# Render が自動でバックアップ作成
```